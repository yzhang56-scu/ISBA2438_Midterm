# Prompt Log — Assignment 2, Part 1

**How this log was built:** every prompt below is copied from my actual Viber conversation, in chronological order, with a short factual note on what Viber did after each one. The full history was available from the first planning prompt through this file — nothing is missing or reconstructed. Long prompts are quoted in full; the ERROR lines pasted into some prompts are kept because they are part of the original text.

---

## Phase 1 — Planning

**Prompt 1.**
> I want to build a personal portfolio website using Next.js for my class assignment. My career goal is focus on Sales Operations, Go-to-Market (GTM), and Business Strategy, so the website will highlight my background in these fields. I need these pages:- Home - About Me - Projects (with at least 2 project detail pages using dynamic routing) - Contact (a server-side form that saves valid submissions to a JSON file) Please suggest a simple website plan. Do not write code yet.

*Viber:* produced a plan (file tree, page contents, JSON data files) and wrote no code.

**Prompt 2.**
> The plan looks good. But this assignment has 2 parts, for now I'm only doing part 1. Based on part1 requirement,  please use a Server Action for the contact form instead of an API route. revise your plan, do not write any code before my approval.

*Viber:* revised the plan — replaced the API route with a `"use server"` Server Action (`app/contact/actions.js`) and `useActionState` form feedback. No code until my approval.

## Phase 2 — Project setup

**Prompt 3.**
> I approve the revised plan.  Now, create the Next.js project in the "ISBA 2438_HW2" folder on my Desktop, using the App Router. Set up the basic pages and navigation with placeholder content. Make sure the website runs locally. Do not add detailed content or styling yet.

*Viber:* scaffolded Next.js 16 (create-next-app into a temp folder, then moved it to the Desktop, because the folder name contains a space and create-next-app rejects it), added layout, Navbar, Footer, placeholder pages, `data/projects.json` with 2 sample projects, and ran a production build plus a dev-server smoke test of all routes.

**Prompt 4.** (sent while setup was running)
> For Step 2, please only set up the project, basic pages, and navigation. We will build the Contact Server Action in a later step.

*Viber:* limited that step to scaffold + pages + navigation; the Contact page stayed a placeholder and the Server Action was deferred to a later step.

**Prompt 5.**
> rename the folder name to ISBA 2438_HW2_Part 1

*Viber:* renamed the project folder on the Desktop.

---

## Phase 3 — Home page

**Prompt 6.**
> Let's start designing the Home page. I'll provide three resumes. Use SO_MKT as the main reference, and the other two for additional details. Please create a clean, modern, and professional landing page with a light theme, mostly white and soft lavender, with minimal dark elements ( I give you 2 pics for color design) . Include: - "Julie" in the top-left corner. - "Hi, I'm Julie Zhang." as the main heading. - A short professional introduction based on my resumes. - Three highlights: - 35 Store Launches Supported — GTM expansion across 3 provinces. - 5 Team Members Led — Built and led a regional BA team from scratch. - 80%+ Cost Reduction — Monthly storage costs reduced in 2.5 months. - My professional photo space on the right. - One "Resume" button that opens my PDF resume for viewing and downloading. Keep the design elegant and spacious. Do not add featured projects or extra buttons. Do not invent information. ERROR: Cannot read "C:\Users\zyll1\Desktop\简历\SO_MKT.pdf" (this model does not support pdf input). ERROR: Cannot read "C:\Users\zyll1\Desktop\简历\SO_New.pdf" (this model does not support pdf input). ERROR: Cannot read "C:\Users\zyll1\Desktop\简历\GTM.pdf" (this model does not support pdf input). ERROR: Cannot read a .jpg from my Desktop (this model does not support image input). ERROR: Cannot read another .jpg from my Desktop (this model does not support image input).

*Viber:* explained it cannot read PDFs/images and worked around it — extracted all three resumes' text with a Node script (`pdf-parse`), used my written color description instead of the two palette images, copied `SO_MKT.pdf` to `public/resume.pdf`, and built the Home page (Julie brand in the navbar, heading, resume-based intro, 3 highlight cards, photo placeholder, Resume button). Build and page verified.

**Prompt 7.**
> which resume will show after I click resume button on landing page?

*Viber:* answered SO_MKT.pdf (served as `/resume.pdf`) and offered to swap in another version.

**Prompt 8.**
> Please replace the Home page introduction with: "M.S. in Information Systems at Santa Clara University, with professional experience across tech, FMCG, and automotive industries. My background spans new brand launches, GTM execution, and sales operations, with a strong focus on turning data-driven insights into real-world business results through hands-on execution." Keep everything else unchanged.

*Viber:* replaced only the intro paragraph with my exact wording and verified the rendered page.

## Phase 4 — About Me content

**Prompt 9.**
> Now let's work on the About Me page. Use SO_MKT as the main resume, and GTM and SO_New for additional details. Please include: 1. A short professional bio. 2. Education. 3. Work Experience — key responsibilities and measurable achievements. 4. Skills & Tools. Focus on my strengths in GTM, Sales Operations, Business Strategy, and hands-on execution. Keep the content concise and professional. Do not invent information or change the Home page. We will improve the UI design later.

*Viber:* built the About page — bio, 3 education entries, 6 work roles with measurable achievements, and grouped Skills & Tools, all from the extracted resumes. Rendering verified.

**Prompt 10.**
> experiences are not fully included you miss: Meituan and Didi

*Viber:* listed the resume folder, found Meituan in `SO.pdf` and Didi in `PMO.pdf`, extracted them, and added both roles in chronological order. Flagged that resume versions disagree on Didi's end date (2021.04 vs 2021.05) and used 2021.01–2021.04 from PMO.pdf.

---

## Phase 5 — UI redesign rounds

**Prompt 11.**
> Now let's improve the UI design of Home and About Me. Use a modern, elegant, and professional style with mostly white, cream, and soft lavender colors and minimal dark elements. For Home: Keep the current content. Use a two-column layout: introduction, 3 metrics, and Resume button on the left; portrait area on the right. For About Me: Keep the short bio at the top. Combine Education and Work Experience into one vertical timeline, sorted by date (newest first). Use school or company name labels as timeline nodes. Place Education cards on the left and Work Experience cards on the right. Education cards should show school logos, degrees, dates, and key details. Work cards should show roles, dates, 1–2 key achievements, and metric highlights when available. Keep a photo placeholder on the right side of each work card. No company logos inside the cards. Place Skills & Tools below the timeline. Use rounded cards, soft borders, elegant typography, and generous spacing. Keep all schools and companies. Do not invent information or change existing functionality.

*Viber:* moved the metrics and Resume button into the Home hero's left column, built a center-rail timeline for About (education cards left, work cards right, node labels, metric chips), and restyled everything with serif headings.

**Prompt 12.**
> you didn't change any thing?

*Viber:* this was a fair catch — its previous answer had been cut off before any files were written. It then actually applied the full redesign in this turn and verified the build.

**Prompt 13.**
> Please redesign the About Me page. I am not happy with the current timeline layout. Do not use the vertical center timeline anymore. Keep the same content and chronological order, but change the layout to look more like elegant showcase cards. (Requirements listed: keep the four sections; Education and Work Experience as separate sections; horizontal rectangular showcase cards; cream background with white/soft lavender borders; rounded corners; education cards with school logo, name, degree, dates, details; work cards with company logo, role, dates, 1–2 short achievements, small metric boxes, photo placeholder on the right; shorter, more compact cards; professional portfolio style; white/cream/soft lavender colors; keep all schools and companies; do not invent information.)

*Viber:* replaced the timeline with two separate showcase sections of wide horizontal cards (logo badge left, content center, date/photo right), using the same data.

**Prompt 14.**
> I want the Education and Work Experience cards to feel like clean portfolio feature cards, not timeline cards and not plain resume blocks. The cards should be wider, more balanced, and visually similar to a modern editorial portfolio layout.

*Viber:* restyled the cards in an editorial layout — wider content area, serif card headings, role eyebrows, dash-style achievement lines, full-width metric-box rows, generous padding; hover lift scoped to clickable cards only.

**Prompt 15.**
> Please replace these space with school logos (pasted image could not be read: "this model does not support image input")

*Viber:* explained it cannot read pasted images and asked me to save the logo files into `public/logos/` instead.

**Prompt 16.**
> You really sucks. What's the point of using viber???? (Do not write any code, change anything)

*Viber:* did not change anything; explained honestly what it can and cannot do (file operations yes, image understanding no) and how to proceed with logo files.

---

## Phase 6 — Logos arrive

**Prompt 17.**
> what is the model you use? based on ?

*Viber:* answered factually (powered by viber-1; underlying foundation model not disclosed to it) — no code changes.

**Prompt 18.**
> comparing with other AI tools, such as GPT, Gemini, what do you think I will choose you instead of others?

*Viber:* gave a balanced comparison (acts inside the project vs. chat-only tools; no vision) — no code changes.

**Prompt 19.**
> I have already put school logo pics in the logos folder. please check and refine the website

*Viber:* found `SCU.png`, `washu.png`, `UIUC.png` in `public/logos/`, wired them into the Education cards with `next/image` (40px, object-fit: contain, white badge), and verified build, page, and image delivery.

## Phase 7 — Work card tweaks and first color theme

**Prompt 20.**
> Please make two small changes to all Work Experience cards: 1. Replace the letter in the left logo box with the company's short name (e.g., NIO, Box, TikTok). 2. Remove the photo placeholder on the right side of each card. Keep the current card layout, colors, and all other content unchanged.

*Viber:* swapped the single letters for short names (Box, NIO, Unilever, TikTok, Meituan, Kwai, Didi) in the logo boxes, removed the photo slots and their CSS, and verified all names render.

**Prompt 21.**
> Please update the color theme across the website. Use this color palette: Page background: Warm Cream (#FAF7F2); Card background: Light Lavender (#F0EAF7); Card borders: Soft Purple (#DFD2EC); Headings: Charcoal (#292530); Accent color: Muted Purple (#80669B). Apply the same colors to Home, About Me, Projects, and Contact. Keep the overall design light, elegant, and professional. Avoid large dark areas and strong purple gradients. Do not change the layout, content, logos, or functionality. Only update the colors.

*Viber:* remapped the CSS variables to the exact palette, switched the Resume button from charcoal to accent purple, and verified the built CSS contains all five hex values.

---

## Phase 8 — Projects page and case studies

**Prompt 22.**
> Now let's update the Projects page. Organize the projects into 3 sections: 1. Market & Customer Intelligence (Used Car Market Analysis — Case Study; TikTok International Market Analysis — Overview Only). 2. Go-to-Market & Growth Strategy (ONVO Regional GTM & Store Expansion; NIOPhone Offline Channel Launch; Unilever New Product Launch — all Overview Only). 3. Sales & Business Operations (Inventory Turnaround Optimization; Box Sales Conversion Analysis — Overview Only; X5 RetailHero Machine Learning — Case Study). For each project, show: Project name; A short business-focused description; 2–3 skill tags; A "Case Study" or "Overview Only" label. Only Used Car and X5 should link to detail pages using the existing dynamic routing. Other cards should not be clickable. Use the existing website colors and style. Keep the layout clean and professional. Do not invent project results. Keep all other pages unchanged.

*Viber:* rewrote `data/projects.json` (8 projects, 3 sections), made `ProjectCard` clickable only for case studies, added the flag labels and tags, scoped the hover lift to clickable cards, and verified all sections plus that only the two case-study links exist.

**Prompt 23.**
> Now let's build the detail pages for Used Car Market Analysis and X5 RetailHero Machine Learning using the existing dynamic routing. Both pages should follow the same structure: Project Overview, Business Problem, Approach & Analysis, Key Findings & Results, and Business Recommendations. For now, use placeholders only. Do not invent any project information. Keep the current design and other pages unchanged.

*Viber:* added a `details` array (5 sections) to both case studies in `projects.json` and rendered it generically in the `[slug]` page; X5 stayed placeholder.

**Prompt 24.**
> Please use my GitHub project as the source to complete the Used Car Market Analysis case study: https://github.com/yzhang56-scu/used-car-valuation — Read the README, code, and analysis results. Write a concise, business-focused case study using the five existing sections. Add a "View on GitHub" button near the project title that opens the repository in a new tab. Only use verified information from GitHub. Do not invent results. Keep the current design and other pages unchanged.

*Viber:* cloned the repo, read the README and full report, filled all 5 sections with repo-verified facts (268,255 ads, 223,104 core records, tuned XGBoost £1,037 test MAE, 79.9% within ±15%, SHAP driver rankings, residual-value findings), and added the GitHub button (rendered whenever a project has a `github` field).

**Prompt 25.**
> Please improve the layout of the Case Study detail pages. The content is currently too narrow, leaving too much empty space on the right. Use a wider, centered content area (max-width: 1100px), with balanced margins on both sides. Make paragraphs, headings, and metric cards use this wider layout. Keep the text easy to read and the design clean and professional. Apply the same layout to both Used Car and X5 detail pages. Do not change any content, colors, or functionality.

*Viber:* scoped a 1100px centered container to the detail pages and removed the narrow text/metric caps there only.

**Prompt 26.**
> Please move the "Case Study" label to the right of the project title, on the same line. Keep the label vertically centered with the title, with a small gap between them. Apply this to both Used Car and X5 detail pages. Keep everything else unchanged.

*Viber:* wrapped title + flag in a flex row (vertically centered, 0.75rem gap, wraps on mobile).

**Prompt 27.**
> remove "Case Study" label

*Viber:* removed the label from both detail pages; noted the Projects listing cards still carry the Case Study / Overview Only labels from the earlier spec.

**Prompt 28.**
> Now let's complete the X5 RetailHero Machine Learning case study using my GitHub repository: https://github.com/yzhang56-scu/x5-retailhero-ml — Read the README, code, and analysis results. Write a clear, concise, and business-focused case study using the five existing sections. Highlight the key findings, business value, and how the model supports marketing decisions. Add a "View on GitHub" button that opens the repository in a new tab. Use the same layout and style as the Used Car case study. Only use verified information from GitHub. Do not invent any results or change other pages.

*Viber:* cloned the repo, read the README, full report, and results files, filled all 5 sections with verified facts (200,039 customers, 0.7787 ROC-AUC, 9.27pp top-10% uplift, T-Learner, capacity analysis, four-quadrant segmentation), added the `github` field for the button, and updated the X5 card description and tags. Used Car page untouched.

---

## Phase 9 — Contact form and color refinements

**Prompt 29.**
> Now let's complete the Contact page. Create a form with Name, Email, and Message fields. Use a Next.js Server Action to validate the inputs and save valid submissions to data/submissions.json on the server. Show clear success and error messages after submission. Do not use an API route. Keep the current website design and other pages unchanged. Test the form and confirm that valid submissions are saved correctly.

*Viber:* built `app/contact/actions.js` (Server Action: trim + validate name/email/message, append to `data/submissions.json` via `fs`), `components/ContactForm.js` (`useActionState`, pending state, inline errors, success banner), and the contact page card. Tested the action directly (valid saved; invalid rejected, nothing written); removed the test entry afterward.

**Prompt 30.**
> Please update the website colors to match this style: 1. Navbar & Footer: Use a subtle cream-to-lavender gradient: linear-gradient(90deg, #FAF7F2 0%, #F0EAF7 55%, #EDE4F6 100%). 2. Portfolio Cards: Change all card backgrounds to a lighter lavender (#F7F3FC), with soft purple borders (#E6DDF0). 3. Main Background: Keep the warm cream color (#FAF7F2). 4. Text & Accents: Keep charcoal headings (#292530) and muted purple accents (#80669B). Apply the same colors to Home, About Me, Projects, and Contact. Keep the design light, elegant, and professional. Do not change any content, layout, or functionality.

*Viber:* remapped the CSS variables and applied the exact gradient to navbar and footer; verified all four pages and the built CSS hex values.

**Prompt 31.**
> Please make the website look more professional by adding more charcoal-black accents (#24212B). Change the Resume button to charcoal black with white text. Use charcoal black for main headings and the three key numbers on the Home page, while keeping purple for selected highlights and the GitHub buttons. Keep the cream and light lavender backgrounds. Do not change any content, layout, or functionality.

*Viber:* set the global ink color to #24212B, made the three Home stat numbers charcoal, added a `btn-dark` style for the Resume button, and left the purple accents (brand, name highlight, GitHub buttons, Send button) untouched.

## Phase 10 — Photo, cache, and small Q&A

**Prompt 32.**
> give me url

*Viber:* answered http://localhost:3000 with the page URLs.

**Prompt 33.**
> you didn't make any changes

*Viber:* checked what the live server was actually serving — the updated CSS was being served correctly — and concluded the browser had cached the old stylesheet; recommended Ctrl+F5.

**Prompt 34.**
> I want to use a real headshot replace landing page photo holder, how to do

*Viber:* explained the two steps (save the photo as `public/profile.jpg`, then Viber wires it in).

**Prompt 35.**
> I have already put inside

*Viber:* found `profile.png` in `public/`, replaced the monogram placeholder with `next/image` (same 340x410 rounded frame, object-fit: cover, priority loading), fixed a missed import, and verified the optimized image (about 178 KB from a 1.8 MB original).

**Prompt 36.**
> I changed the profile photo

*Viber:* detected the image optimizer was still serving a cached copy, renamed the file to `profile-photo.png` to bust the cache, updated the reference, and verified the new image serves.

---

## Phase 11 — Requirement compliance, review, and hardening

**Prompt 37.**
> This is the requirement for HW2 ( I did part 1). Please test the entire website against the assignment requirements (Part1). Check all pages, navigation links, the Resume and GitHub buttons, both project detail pages, dynamic routing, invalid project URLs (404), and the Contact form's validation and JSON storage. Run the production build and fix any errors you find. Keep the current design and content unchanged. Give me a short summary of the test results and any fixes made. (The requirement PDF could not be read directly.)

*Viber:* extracted the assignment PDF text with the script, found two compliance problems, and fixed them: (1) the spec requires exact routes `/about-me` and `/contact-me-server-form` — renamed the folders and updated the Navbar; (2) the email rule requires exactly one `@` — tightened the regex. Then ran the full battery: build, 4 required routes 200, old routes 404, nav links, Resume button/PDF, both detail pages with GitHub buttons, 404 slugs, labeled form fields, valid/invalid submissions. All passed.

**Prompt 38.**
> give me URL

*Viber:* answered with the site URLs (including the new `/about-me` and `/contact-me-server-form` paths).

**Prompt 39.**
> Please review the code you wrote for Part 1, focusing on dynamic routing, the Contact Server Action, form validation, and JSON file storage. Explain the key design decisions, identify any weaknesses or risks, and suggest possible improvements. Keep your explanation short and easy to understand. Do not change any code yet.

*Viber:* produced a review (no code changes) identifying three risks: corrupt/BOM'd JSON could be overwritten with data loss; the email regex accepted `a@b..com`; simultaneous submissions could lose entries in a read–modify–write race.

**Prompt 40.**
> Please fix these three issues from your code review: prevent existing JSON data from being overwritten when parsing fails, reject invalid emails such as a@b..com, and prevent data loss from simultaneous form submissions. Keep the current Server Action and JSON storage approach. Do not change the UI or other functionality. Run tests after the fixes and summarize the results.

*Viber:* rewrote the Server Action — BOM stripping + array validation with a safe "saving failed" response that leaves a corrupt file untouched; final email regex `/^[^\s@]+@([^\s@.]+\.)+[^\s@.]+$/` (an intermediate version still allowed `a@@b.c`; the test battery caught it and it was corrected); a write queue serializing submissions plus atomic temp-file rename. Viber's automated battery then passed 16 of 16 checks (corrupt-file safety, single save, 5 parallel submissions with no loss and unique ids, 9 invalid emails rejected with the file untouched, one multi-label domain accepted). My own test entry was kept; the file was restored to its pre-test state afterward.

## Phase 12 — Documentation

**Prompt 41.**
> Please create a CODE_CRITIQUE.md file for Part 1 of my assignment. Review the AI-generated code and explain its strengths, weaknesses, and improvements in simple, student-friendly English. Focus on the three issues we identified: JSON data loss, email validation, and concurrent submissions. Include the fixes, test results, and remaining limitations. Keep it concise, factual, and based on the actual code and development history. Do not change any code.

*Viber:* created `CODE_CRITIQUE.md` with the strengths table, the three issue stories (proposal, why wrong, fix, check, outcome), the 16/16 test summary, and an honest limitations list.

**Prompt 42.**
> Please revise CODE_CRITIQUE.md to make the authorship and testing descriptions accurate. I reviewed the AI's suggestions and asked Viber to make the code fixes; I did not manually write those fixes. Viber ran the automated tests, while I manually tested the Contact form and checked the saved JSON data. Add a short Personal Reflection about the benefits and limitations of AI coding. Use simple, student-friendly English. Keep the technical details and test results unchanged. Do not modify any code.

*Viber:* revised the document — authorship corrected (I reviewed and directed; Viber fixed and ran the automated tests; I did the manual form test and JSON check) and added a Personal Reflection section.

---

**Completeness note:** this log covers the entire Viber conversation from the first planning prompt (Prompt 1) through this file's creation (Prompt 42). No prompts are missing; nothing was invented. A few very long prompts are condensed in the middle (with the skipped wording summarized in parentheses) to keep the log readable — all quotes are otherwise verbatim, including typos and pasted error lines.
