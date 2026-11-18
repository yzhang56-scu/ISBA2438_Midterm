# Prompt Log — Assignment 2, Part 2

**How this log was built:** every prompt below is copied verbatim from my actual Viber conversation (Part 2 development only), in chronological order, with a short factual note on what Viber did after each one. I had the full conversation history available, so all prompts are complete and verbatim; nothing is reconstructed or invented.

---

## Phase 1 — Review and planning

**Prompt.**
> Before starting Part 2, please review my existing Part 1 portfolio project. Check the current project structure, including the Home, About, Projects, and Contact pages, dynamic routing, the Contact form's Server Action, input validation, and JSON data storage. Also check the current Git status.
>
> Based on the existing code, suggest a simple plan for adding a new API-based Contact form and a Blog system in Part 2. Please explain which parts of the existing code we can reuse and which new files or routes we will need. **Do not modify any code yet.** Just review the project and share your findings.

*Viber:* reviewed the structure, the Server Action, the dynamic routing pattern, and the clean Git state, then proposed: a shared validation/storage module, `app/api/contact/route.js`, a `data/posts.json` + `app/blog/[slug]`-style blog system, and Navbar one-line link additions. No code changed.

**Prompt.**
> Just a quick note: the assignment requirements I shared earlier for coding review may be outdated, so some details might be different now. Please follow my latest instructions and the step-by-step development plan I provide. I'll guide you through each step, so there's no need to follow the old assignment document exactly.

*Viber:* confirmed it would follow my step-by-step instructions only and drop the old requirement PDF as the source of truth.

## Phase 2 — API-based Contact form

**Prompt.**
> Let's start Part 2 with the API-based Contact form. Please create a new page at `/contact-me` with Name, Email, and Message fields, and a POST API route at `/api/contact`. Use `fetch()` to submit the form and show clear messages for successful submissions, invalid inputs, and server errors. Keep the design consistent with my existing portfolio.
>
> Please reuse the existing validation and JSON storage logic by moving the shared code into a separate module. Both the original Server Action form and the new API form should save submissions to the same `data/submissions.json` file. Make sure the original form still works. After implementation, run the relevant tests and explain which files you changed and how I can test both forms manually. Please don't change any unrelated features or commit to GitHub yet.

*Viber:* created `lib/contact-store.js` (shared validation, write queue, BOM-safe read, atomic write), `app/api/contact/route.js` (200/400/500 JSON responses), `components/ContactFormApi.js` (fetch-based client form), and `app/contact-me/page.js`; rewrote the Server Action to import the shared module with identical responses; added a "Contact (API)" navbar link. First build failed because the `runtime = "nodejs"` route export is incompatible with this project's `cacheComponents` config; removing it fixed the build (Node is the default runtime anyway). Tests: production build clean; 15/15 API checks (validation, malformed body, 5 parallel submissions, unique ids); 5/5 Server Action module checks; both pages 200; `data/submissions.json` restored byte-identical after testing.

## Phase 3 — Blog admin and POST API

**Prompt.**
> Everything works well! Now let's work on the Blog system. Please create an admin page at `/admin/blogs` where I can write and publish a blog post with a Title and Content. Each post should also have a unique slug and creation date. Create a POST API route at `/api/blogs` to validate and save the posts to `data/posts.json`. Please keep the page design consistent with my existing portfolio and show clear success or error messages when submitting.
>
> For now, just focus on creating and saving blog posts. We will build the Blog listing page, GET API, and dynamic routing in the next steps. Please test the POST API with valid and invalid inputs, confirm that posts are saved correctly, and tell me how to test it manually. Don't change any existing features or commit to GitHub yet.

*Viber:* created `lib/blog-store.js` (slug generation with `-2`/`-3` collision suffixes, a `post` fallback for non-ASCII titles, same queue/atomic-write pattern), `app/api/blogs/route.js` (POST with 200/400/500), `components/BlogForm.js` (fetch-based admin form showing the generated slug on success), and `app/admin/blogs/page.js`. It deliberately did not add an admin link to the public navbar. During testing, an orphaned server process held port 3001; it moved to port 3002 and killed the orphan. One battery check failed because the test script expected 9 posts when the battery publishes 8 — a direct module re-check confirmed the file was valid. Final: 13/13 effective checks; test data deleted afterward.

## Phase 4 — Blog listing and GET API

**Prompt.**
> Now let's build the Blog listing page. Please add a GET endpoint to the existing `/api/blogs` route to return all saved posts from `data/posts.json`. Then create a new page at `/blogs` (plural, not `/blog`) to display the posts with their titles, short previews, and creation dates. Please use the existing portfolio card styles and add a Blog link to the navbar.
>
> The page should load posts through the GET API, show a friendly message when there are no posts, and handle API errors properly. For now, just focus on the listing page and GET API. We will add individual blog detail pages and dynamic routing in Step 5. Please test the new features, explain any files you changed, and tell me how to test them manually. Don't change unrelated features or commit to GitHub yet.

*Viber:* added a GET handler to `app/api/blogs/route.js` (200 with the posts array, empty array when the file does not exist yet, 500 on a corrupt file), created `components/BlogList.js` (client-side fetch with newest-first sort, 140-character previews, loading/empty/error states with a Try Again button) and `app/blogs/page.js`, and added the Blog link to the Navbar. Tests: 5/5 (empty-file GET, created posts returned with all fields, corrupt file → 500); all six site routes returned 200 on my dev server; test data cleaned up.

## Phase 5 — Blog dynamic routing

**Prompt.**
> Now let's add dynamic routing for the Blog system. Please create `/blogs/[slug]` (plural, not `/blog/[slug]`) so each blog post has its own detail page. You can use the existing Projects dynamic routing as a reference. Each page should show the blog title, creation date, and full content. Also, make the cards on `/blogs` clickable so visitors can open the corresponding posts.
>
> Please make sure invalid or nonexistent slugs show a proper 404 page. Use my two existing test posts (Testing Blog 1 and Testing Blog 2) to verify that they have different URLs and display the correct content. Keep the design consistent with my portfolio, test the routes, and tell me how to test them manually. Don't change unrelated features or commit to GitHub yet.

*Viber:* created `app/blogs/[slug]/page.js` with the same layout as the project case studies, made the listing cards clickable links, and added `app/not-found.js` — a portfolio-styled 404 page. Three build/runtime problems surfaced with this project's `cacheComponents` config and were fixed: `runtime` and `dynamic` route exports are rejected, and runtime `fs` reads cannot be prerendered — solved with `"use cache"` + `cacheTag("blogs")` on the data reads, `revalidateTag("blogs")` after each publish, and `generateStaticParams` over a cached slug list, so new posts appear immediately without a rebuild. Testing confirmed both of my test posts at their own URLs; in the production build the 404 page renders but ships with an HTTP 200 status (see the critique), while the dev server returns a true 404.

## Phase 6 — Final review, hardening, and documentation

**Prompt.**
> Now that all Part 2 features are working, please review and test the full project. Focus on both Contact forms, the Contact API, Blog POST/GET APIs, JSON storage, input validation, and Blog dynamic routing. Also check for duplicated code, error handling, and any issues introduced to Part 1. Please fix any bugs you find and rerun the tests. Pay attention to the production 404 status issue you mentioned earlier and explain whether it needs a fix.
>
> Please keep the original Part 1 documentation unchanged. Create two separate files, `CODE_CRITIQUE_PART2.md` and `PROMPT_LOG_PART2.md`. The code critique should include 2–3 specific examples of code issues, improvements, and test results. The prompt log should reflect our actual Part 2 development process without inventing any prompts or interactions. If you don't have the exact prompts, leave placeholders for me to fill in. Finally, run a production build and summarize the test results, remaining issues, and files changed. Don't commit or push to GitHub yet.

*Viber:* found and removed duplicated JSON storage code by extracting `lib/json-store.js` (shared write queue, BOM-safe array read, atomic write) now used by both stores; fixed a button-contrast issue on the 404 page; verified the 404 status behavior and documented it as a platform limitation that does not need a code fix; reran the full suite — 15/15 contact API, 13/13 blog POST API, 5/5 blog GET/list, 9/9 blog routes, 5/5 Server Action module — with all data files restored byte-identical afterward. Three test-script failures during the rerun were stale expectations (a pre-GET 405 check, a miscount, and a check written before my third test post existed), not product bugs. Wrote `CODE_CRITIQUE_PART2.md` and this file, kept the Part 1 documentation untouched, and ran a final production build.

---

**Completeness note:** this log covers the Part 2 conversation from the review prompt through this file. All prompts are quoted verbatim from the actual Viber history; nothing is missing or invented. No separate JSON data protection follow-up prompt was sent during Part 2, so none appears here.
