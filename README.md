# Julie Zhang — Portfolio Website (ISBA 2438 Midterm)

A personal portfolio built with **Next.js (App Router)** for ISBA 2438 (AI Assisted Software Development). This midterm extends the Assignment 2 portfolio with a private Job Application Tracker, backend-managed content (experiences, projects, blog posts, contact messages), and password-protected admin pages.

## Features

### Public portfolio pages (no login required)

- **Home (`/`)** — hero with introduction, career-highlight metrics, Resume button, profile photo.
- **About Me (`/about-me`)** — bio, education, skills, and a work-experience showcase rendered from backend-managed data through reusable components (`ExperienceList` → `ExperienceCard`).
- **Projects (`/projects`)** — projects in three sections, rendered from backend-managed data via `ProjectCard`. Case studies link to detail pages; overview-only entries are not clickable.
- **Project detail pages (`/projects/[slug]`)** — dynamic pages per case study with overview, findings, metrics, and a GitHub link. Unknown slugs return a styled 404.
- **Blog (`/blogs`, `/blogs/[slug]`)** — post listing and detail pages rendered from backend-managed posts.
- **Contact (`/contact-me`, `/contact-me-server-form`)** — the same validated form submitted through an API route or a Server Action. New messages appear in the Message Manager.

### Private management pages (password protected)

All of the following redirect to `/login` when you are not signed in. Every API request that reads private data or changes data is also rejected with HTTP 401 unless you are signed in.

- **Job Application Tracker (`/job-tracker`)** — add, edit, and remove job applications. Data is saved privately in your browser with LocalStorage.
- **Blog Manager (`/admin/blogs`)** — publish, edit, and delete posts. Slugs regenerate from edited titles.
- **Experience Manager (`/admin/experience`)** — manage the entries shown on About Me.
- **Project Manager (`/admin/projects`)** — manage portfolio projects and case-study details.
- **Message Manager (`/admin/messages`)** — review contact submissions, mark them New/Replied, edit or delete them.

Each protected page has a **Log Out** button. Logging out deletes the session cookie and revokes the session server-side.

## API routes

| Method | Route | Auth | Success status | Purpose |
|---|---|---|---|---|
| POST | `/api/contact` | public | 201 | Save a contact submission (validated) |
| GET | `/api/contact` | auth | 200 | List submissions (private) |
| PATCH | `/api/contact` | auth | 200 | Update a submission / status |
| DELETE | `/api/contact` | auth | 200 | Delete a submission |
| GET | `/api/blogs` | public | 200 | List posts |
| POST | `/api/blogs` | auth | 201 | Publish a post |
| PATCH | `/api/blogs` | auth | 200 | Edit a post (slug regenerates) |
| DELETE | `/api/blogs` | auth | 200 | Delete a post |
| GET | `/api/experience` | auth | 200 | List experience entries |
| POST | `/api/experience` | auth | 201 | Add an entry |
| PATCH | `/api/experience` | auth | 200 | Edit an entry |
| DELETE | `/api/experience` | auth | 200 | Delete an entry |
| GET | `/api/projects` | auth | 200 | List projects |
| POST | `/api/projects` | auth | 201 | Add a project |
| PATCH | `/api/projects` | auth | 200 | Edit a project |
| DELETE | `/api/projects` | auth | 200 | Delete a project |

## Getting Started

**Prerequisites:** Node.js 18.18 or later and npm.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. Production build and start:

   ```bash
   npm run build
   npm run start
   ```

4. Run the unit tests (32 tests for the Job Tracker and contact storage):

   ```bash
   npm test
   ```

## Setting the admin password

The password is read on the server and is never stored in source code.

1. Copy the template:

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and set your own password:

   ```
   ADMIN_PASSWORD=your-secret-password
   ```

3. Restart the server (the password is read at startup), then open `/login` and sign in. After signing in you are returned to the page you originally tried to open.

Notes:

- `.env.local` is git-ignored and must never be committed.
- Changing the password invalidates all existing sessions.
- If `ADMIN_PASSWORD` is not set, login is denied with a clear message and all protected APIs return 401.

## Project Structure

```
app/
├── page.js                        # Home
├── about-me/page.js               # About Me (backend-managed experience)
├── projects/page.js               # Projects listing (backend-managed)
├── projects/[slug]/page.js        # Dynamic case-study pages
├── blogs/page.js                  # Blog listing
├── blogs/[slug]/page.js           # Dynamic blog detail pages
├── contact-me/page.js             # Contact page (API form)
├── contact-me-server-form/        # Contact page (Server Action form)
├── job-tracker/page.js            # Job Application Tracker (private)
├── login/page.js + actions.js     # Login page, login/logout Server Actions
├── admin/blogs|experience|projects|messages/page.js   # Managers (private)
├── not-found.js                   # Styled 404 page
└── api/                           # contact, blogs, experience, projects routes
components/                        # Navbar, Footer, managers, forms, and
                                   # reusable list/card components (props-driven)
lib/
├── json-store.js                  # Shared write queue, safe reads, atomic writes
├── auth.js                        # Password check, session cookie, sessions store
├── contact-store.js               # Contact validation + submissions storage
├── blog-store.js                   # Post validation, slugs, posts storage
├── experience-store.js            # Experience validation + storage
├── project-store.js               # Project validation, slugs, projects storage
└── job-tracker.js                 # LocalStorage helpers (Node-testable)
data/
├── experience.json                # Experience content (committed)
├── projects.json                  # Project content (committed)
├── posts.json                     # Blog posts (committed)
├── submissions.json               # Contact entries (git-ignored)
└── sessions.json                  # Login sessions (git-ignored)
tests/                             # Node test scripts (npm test)
public/                            # resume.pdf, profile photo, school logos
```

## Private files and Git

| File | Committed? | Why |
|---|---|---|
| `.env.local` | No (ignored) | Contains the admin password |
| `data/sessions.json` | No (ignored) | Active login sessions |
| `data/submissions.json` | No (ignored) | Private contact submissions |
| `.env.example` | Yes | Template showing which variable to set |
| `data/experience.json`, `data/projects.json`, `data/posts.json` | Yes | Portfolio content so the site works right after cloning |

## Coursework documents

`AGENTS.md`, `CODE_CRITIQUE.md`, `CODE_CRITIQUE_PART2.md`, `PROMPT_LOG.md`, and `PROMPT_LOG_PART2.md` document the AI-assisted development process for Assignment 2.

Built with Next.js 16, React 19, and plain CSS (no UI libraries). Licensed under the [MIT License](LICENSE).
