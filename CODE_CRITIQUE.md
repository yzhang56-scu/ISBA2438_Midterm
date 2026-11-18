# Code Critique — Assignment 2, Part 1

**Project:** Personal portfolio website (Next.js App Router)
**Scope of this critique:** dynamic routing, the contact Server Action, form validation, and JSON file storage
**How this was built:** I developed the site with the Viber Coding Agent. My prompts asked for each feature, Viber generated the code, and I reviewed the results and asked for changes. The three fixes below were made by Viber at my request after I reviewed its code and pointed out the problems. The automated tests were also written and run by Viber; my own testing was manual — I used the contact form in the browser myself and checked `data/submissions.json` to confirm my submission was really saved.

---

## What was generated

| Area | File(s) | Responsibility |
|---|---|---|
| Pages | `app/page.js`, `app/about-me/page.js`, `app/projects/page.js`, `app/contact-me-server-form/page.js` | One page per purpose, no business logic mixed in |
| Dynamic routing | `app/projects/[slug]/page.js` | Reads `data/projects.json`, pre-renders the two case-study slugs with `generateStaticParams()`, and calls `notFound()` for unknown slugs |
| Reusable UI | `components/Navbar.js`, `Footer.js`, `ProjectCard.js`, `ContactForm.js` | Shared across pages; the form is a client component using `useActionState` |
| Server handling | `app/contact-me-server-form/actions.js` | A `"use server"` Server Action: validates the form and appends valid submissions to `data/submissions.json` |

**Strengths**

- Clear separation: pages render, components are reusable, and all form logic lives in one server-only file (`"use server"`), so validation never ships to the browser.
- One data source (`data/projects.json`) drives both the project listing and the dynamic detail pages, so adding a project needs no new code.
- Unknown project slugs return a real 404 instead of a broken page.
- The form shows distinct success and error states and re-renders without a page reload.

---

## Three problems I found in the review, and how they were fixed

### 1. Corrupt `submissions.json` could wipe out saved data

- **What the AI proposed:** read the JSON file, and if reading or parsing failed, start from an empty list and save normally.
- **Why that was wrong:** when I reviewed the code, I saw the failed parse was swallowed by a `catch` block that reset the list to `[]`. If the file was ever corrupted (or saved with a UTF-8 BOM by an external editor, which makes `JSON.parse` throw), the next valid submission would overwrite the file with a single entry — silently deleting every earlier submission.
- **What was changed:** I asked Viber to fix it, and it updated the action to strip a leading BOM and empty space, then require the content to parse as an array. A missing file still starts fresh, but a corrupt file now returns a "saving failed" message and leaves the file completely untouched.
- **How it was checked:** Viber ran an automated test that wrote a deliberately corrupt file (BOM + broken JSON), submitted a valid form, and confirmed the action returned an error instead of saving and that the corrupt file was not overwritten. It then restored a healthy file and confirmed a valid submission saved on top of the existing entries.
- **Actual outcome:** both automated checks passed (`PASS corrupt file -> storage error`, `PASS corrupt file NOT overwritten`). I also confirmed the real flow myself: after submitting the form in my browser, my entry appeared in `data/submissions.json`.

### 2. The email validation was too permissive

- **What the AI proposed:** the regex `/^\S+@\S+\.\S+$/`, which matched the general idea (one @ symbol, text around it, a dot in the domain).
- **Why that was wrong:** `\S` also matches `@`, so invalid emails like `a@@b.c` were accepted, even though the assignment requires exactly **one** `@`. A later review also found `a@b..com` was accepted, even though the empty label between the dots violates the "nonblank labels" requirement.
- **What was changed:** I asked Viber to tighten the pattern. The final version is `/^[^\s@]+@([^\s@.]+\.)+[^\s@.]+$/` — exactly one `@`, a nonblank local part, and a domain made of nonblank labels separated by single dots. The path to this fix was not smooth: Viber's first correction (`[^\s.]` instead of `[^\s@.]`) accidentally let `a@@b.c` through again, and its own test battery caught the mistake before I ever saw it on the site.
- **How it was checked:** Viber ran an automated battery of invalid emails (`a@b..com`, `a@@b.c`, `a@b`, `@b.com`, `a@.com`, `a b@c.com`, `a@b.`, `a@b..`, `a@.b.com`) — every one was rejected with a field error, and `submissions.json` was unchanged after each rejection. A legitimate multi-label address (`user@sub.domain.example.org`) was still accepted.
- **Actual outcome:** all 9 rejection checks and the acceptance check passed.

### 3. Simultaneous submissions could lose data

- **What the AI proposed:** each submission read the file, appended one entry, and wrote the whole file back.
- **Why that was wrong:** two submissions arriving together could both read the same old content; the second write would erase the first submission (a classic read–modify–write race).
- **What was changed:** I asked Viber to serialize the writes. They now go through a small in-process queue (each write waits for the previous one), and the file is written atomically — to a temporary file first, then renamed, so a crash mid-write cannot leave a half-written file.
- **How it was checked:** Viber's automated test fired 5 valid submissions at the same time with `Promise.all` and counted the entries afterward.
- **Actual outcome:** all 5 returned success, the file grew by exactly 5 entries, and every entry kept a unique id (`PASS no entries lost in parallel writes`).

---

## Test summary

The final battery ran against the real Server Action function with the project folder as the working directory: **16 of 16 automated checks passed** (run by Viber). The production build (`npm run build`) completes with no errors, and all four required routes (`/`, `/about-me`, `/projects`, `/contact-me-server-form`) return HTTP 200, with unknown project slugs returning 404. On top of the automated tests, I manually tested the contact form in the browser and verified that my submission appeared in `data/submissions.json` with the correct name, email, message, and timestamp.

---

## Personal Reflection

Working with an AI coding agent changed how I build projects. The biggest benefit was speed: Viber set up the whole Next.js structure, dynamic routing, and the Server Action in minutes, which let me spend my time on the things that actually matter — matching the assignment's exact routes, reviewing the code, and deciding what the site should say. It also knew Next.js conventions I had never used before, and its explanations taught me *why* the code was written that way, not just what it does.

But the review process taught me the AI is not always right. Every weakness in this document came from code that looked correct at first glance — especially the email regex, which Viber itself "fixed" incorrectly the first time and only caught because tests existed. That convinced me that AI-generated code must always be verified: run the build, test the edge cases, and check the real results (like opening `submissions.json` after submitting). The AI also does not know things I forget to tell it, so I had to stay the one in charge of the requirements.

My conclusion: the AI is a very fast junior partner, not a replacement for understanding. It writes the first draft quickly, but the reviewing, testing, and judgment are still my responsibility — and that is where I did my real learning in this assignment.

---

## Remaining limitations (honest list)

- The write queue only protects **one server process**. If the app were ever scaled to multiple instances, the file-based storage would still race — a real deployment should use a database.
- There is no spam protection (no honeypot, rate limit, or length caps), so the JSON file could be flooded and grows without bound.
- Validation feedback appears only on submit; fields do not show instant errors while typing.
- Project detail pages have no per-page `generateMetadata`, so browser tabs show the generic site title.
- Overview-only projects intentionally return 404 by URL; only case studies are routable.

---

*All file references match the submitted code. The automated checks described above were run by Viber on November 9, 2026, against the final version of the code; the manual form test and JSON verification were done by me.*
