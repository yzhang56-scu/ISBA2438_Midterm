# Code Critique — Assignment 2, Part 2

**Authorship.** I (Julie Zhang) directed the work step by step, reviewed every result, and manually tested the site after each step (including publishing my own test posts through the admin page). The Viber Coding Agent wrote the code, ran the automated test batteries, diagnosed the failures, and fixed the bugs. The fixes described below were made by Viber at my direction; I verified them by re-testing the site myself.

**What Part 2 added.** An API-based Contact form (`/contact-me` + `POST /api/contact`), a Blog admin page (`/admin/blogs` + `POST /api/blogs`), a Blog listing page (`/blogs` + `GET /api/blogs`), dynamic blog detail pages (`/blogs/[slug]`), a portfolio-styled 404 page, and two shared modules (`lib/contact-store.js`, `lib/blog-store.js`, plus `lib/json-store.js` after the refactor below). Both contact forms and the blog system store data as JSON files under `data/`.

---

## Issue 1: Duplicated JSON storage code

**What we found.** `lib/contact-store.js` and `lib/blog-store.js` each contained a byte-for-byte identical copy of the same three pieces: the `writeQueue`/`enqueueWrite` serialization logic, the BOM-stripping JSON array reader, and the temp-file-plus-rename atomic writer. Copy-pasted concurrency code is a real risk — a bug fix applied to one copy (for example, tightening the atomic write) would silently miss the other.

**The fix.** We extracted a single `lib/json-store.js` that owns the write queue, `readJsonArray(filePath, label)`, and `writeJsonArrayAtomic(filePath, entries)`. Both stores now import it. The main benefits are code reuse — the concurrency and corruption-protection logic now exists in exactly one place, so a fix only needs to be made and verified once — and protecting concurrent writes to the same JSON file: because every write still goes through the shared queue, two contact submissions (or two blog publishes) arriving at the same moment are serialized, so one entry cannot overwrite another.

**Check.** After the refactor we reran the entire suite unchanged: contact API 15/15, blog POST API 13/13, blog GET/list 5/5, blog routes 9/9, Server Action module 5/5 — every result identical to the pre-refactor run, and `data/submissions.json` / `data/posts.json` came back byte-identical after the test runs.

## Issue 2: Build failures from Next.js 16 "Cache Components"

**What we found.** This project is scaffolded with Next.js 16 and `cacheComponents` enabled, which rejected three things we tried while building the blog detail pages: the `runtime = "nodejs"` route export (contact API, first build failure), the `dynamic = "force-dynamic"` route export, and any runtime file read (our `fs` read of `posts.json`) inside a page that Next tries to prerender. Each produced a hard build error.

**The fix.** We removed the incompatible exports (Node is already the default runtime) and adopted the platform's intended pattern: the data reads are wrapped in functions marked `"use cache"` and tagged with `cacheTag("blogs")`, `generateStaticParams` prerenders the slugs that exist at build time, and `createPost` calls `revalidateTag("blogs")` after every successful write. Unknown slugs still render on demand and call `notFound()`.

**Check.** The production build passes, my existing posts are prerendered, and a post published through the admin page (my "Testing Blog 3") appears on the listing, the GET API, and its own detail page immediately, with no rebuild — the automated battery confirms the new slug is present in `GET /api/blogs` right after the POST succeeds.

## Issue 3: The production 404 status question — does it need a fix?

**What we found.** When an unknown slug is requested, the styled 404 page renders correctly, but in the production build the HTTP status is 200 instead of 404. In the dev server the status is a true 404.

**Why it happens.** With `cacheComponents`, Next.js streams dynamic responses: the response headers (with status 200) are sent before the page data resolves, so when the render later decides the post does not exist and throws `notFound()`, the status code can no longer be changed — only the page body can.

**Decision: we left it as is for now.** The visible behavior is correct (a proper, styled 404 page renders in every case, and the dev server returns true 404 statuses), and the same behavior already applies to the Part 1 project routes, so it is not a regression introduced by the blog. Getting a true 404 status would most likely require changes at the app-configuration level — for example disabling `cacheComponents`, which affects every route in the app, or restructuring how the route renders, with trade-offs such as 404ing posts published after a build — so it did not fit the "small improvements, don't change unrelated features" constraint. We documented it as a known limitation; it is not necessarily permanent, since a future Next.js update or a configuration revisit could change the behavior.

**Impact.** The main practical impact is that SEO crawlers may see a 200 status for missing pages; for visitors the experience is the expected 404 page, which is acceptable for this assignment's scope.

**Minor fix.** While reviewing, we also fixed the 404 page's "Back to Home" button: it sat inside a paragraph styled `.back-link a` (accent-colored text), which clashed with the charcoal button background; it now uses the same `.detail-actions` wrapper as the case-study GitHub button.

---

## Test results (final rerun, after all fixes)

| Area | Result |
|---|---|
| Production build | Clean — all routes compile |
| Contact API (`/api/contact`) | 15/15 — page 200; wrong method 405; empty/whitespace/malformed bodies → 400; 7 invalid emails rejected; multi-label domain accepted; 5 parallel submissions all saved with unique ids |
| Blog POST API (`/api/blogs`) | 13/13 — validation errors per field; duplicate titles get unique slugs; symbol and non-ASCII titles slug safely; 3 parallel same-title publishes all unique; file valid JSON with 8 entries |
| Blog GET/list | 5/5 — empty state, both posts returned with all fields, corrupt file → 500 |
| Blog routes | 9/9 — both real posts render their own content at distinct URLs, back links present, missing slug / bad path / corrupt file → styled 404 without a crash |
| Server Action form (Part 1 regression) | 5/5 — valid, invalid email, empty form, 3 parallel saves, unique ids |
| Dev server route sweep | 13 routes checked — all correct, including Part 1 pages, both case studies, project 404, resume PDF |
| Data safety | `submissions.json` and `posts.json` byte-identical after all test runs; no temp files left |

## Remaining known issues

1. **404 status in production** — streamed 404 pages carry HTTP 200 (explained above); accepted as a platform limitation.
2. **The admin page has no authentication** — anyone who finds `/admin/blogs` can publish a post. Acceptable for this assignment; a real site would add a login.
3. **No edit or delete for posts** — only create is implemented; the JSON files also grow without pruning. Fine for the assignment's scale.
4. **No automated test suite in the repo** — the batteries live in a temp folder and were run manually; wiring them into the project (for example as an npm script) would be a natural next step.

## Files changed in Part 2

New: `lib/json-store.js`, `lib/contact-store.js`, `lib/blog-store.js`, `app/api/contact/route.js`, `app/api/blogs/route.js`, `app/contact-me/page.js`, `app/admin/blogs/page.js`, `app/blogs/page.js`, `app/blogs/[slug]/page.js`, `app/not-found.js`, `components/ContactFormApi.js`, `components/BlogForm.js`, `components/BlogList.js`, `data/posts.json` (runtime), plus this critique and `PROMPT_LOG_PART2.md`. Modified: `app/contact-me-server-form/actions.js` (now imports the shared module, responses unchanged) and `components/Navbar.js` (Blog and Contact (API) links). Part 1 pages, styling, and documentation (`CODE_CRITIQUE.md`, `PROMPT_LOG.md`, `README.md`) were not altered.
