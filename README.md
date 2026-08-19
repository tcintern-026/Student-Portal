# Student Course Portal

A small full-stack project: a Next.js App Router frontend and an Express
REST API backend, built to learn frontend/backend communication, REST
API design, and the App Router's file-based routing.

## Run it

This is two apps — start both.

**Backend (Express API, port 4000):**

```bash
cd backend
npm install
cp .env.example .env
npm run dev      # nodemon, restarts on changes — or `npm start` for plain node
```

**Frontend (Next.js, port 3000)**, in a second terminal from the repo root:

```bash
npm install
cp .env.local.example .env.local   # only needed if it doesn't already exist
npm run dev
```

Then open http://localhost:3000. The Courses page fetches live from the
API at http://localhost:4000/api — start the backend first, or the
catalog will show its error state with a "Try again" button.

## Backend

```
backend/
  server.js                 # entry point: CORS, JSON body parsing, routes, error handlers
  routes/courses.js         # GET/POST/PUT/DELETE /api/courses
  data/courses.js           # in-memory "database" + slug/id generation
  middleware/validateCourse.js  # request validation for POST/PUT
  middleware/errorHandler.js    # centralized 404 + error JSON responses
  utils/ApiError.js         # Error subclass carrying an HTTP status code
  utils/slugify.js          # title -> url-safe id, used when creating a course
  .env.example              # PORT, CLIENT_ORIGIN (CORS allow-list)
```

Endpoints:

| Method | Path                | Notes                                              |
| ------ | ------------------- | --------------------------------------------------- |
| GET    | `/api/courses`       | Optional `?category=` and `?level=` filters         |
| GET    | `/api/courses/:id`   | 404 if the id doesn't exist                         |
| POST   | `/api/courses`       | 201 + created course; 400 with `details[]` if invalid |
| PUT    | `/api/courses/:id`   | Partial update; 400 if invalid, 404 if missing       |
| DELETE | `/api/courses/:id`   | 204 on success, 404 if missing                       |
| GET    | `/api/health`        | Liveness check                                       |

Data resets to the four seed courses every time the server restarts —
there's no database yet, just an array in `data/courses.js`.

Try it with curl:

```bash
curl http://localhost:4000/api/courses
curl -X POST http://localhost:4000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"Cloud Computing","category":"Software Engineering","level":"Intermediate","durationWeeks":9,"summary":"Intro to cloud."}'
```

Or import the endpoints above into Postman/Insomnia for interactive testing.

## Project structure

```
app/
  layout.tsx              # Root layout — Navbar + Footer wrap every page
  globals.css              # Tailwind directives + small global styles
  page.tsx                 # "/"              → Home (still uses static lib/courses.ts)
  not-found.tsx             # Custom 404, used for unmatched routes and notFound()
  courses/
    page.tsx               # "/courses"       → Courses listing, API-backed
    loading.tsx             # Suspense fallback while page.tsx is loading
    [slug]/
      page.tsx             # "/courses/:slug" → Dynamic course details route, API-backed
      loading.tsx           # Suspense fallback for the details route
  instructors/
    page.tsx               # "/instructors"   → Instructors (still uses static lib/instructors.ts)
  contact/
    page.tsx               # "/contact"       → Contact form (UI only)
components/
  Navbar.tsx                # Shared nav, uses next/link
  Footer.tsx                # Shared footer, uses next/link
  CourseCard.tsx             # Course card; shows Edit/Delete actions when passed onEdit/onDelete
  CourseCardSkeleton.tsx     # Loading placeholder matching CourseCard's shape
  CourseCatalog.tsx          # Client component: fetch + loading/error state + search + add/edit/delete
  CourseForm.tsx             # Reusable add/edit form used by CourseCatalog
  PageHeader.tsx             # Reusable page title/description block
lib/
  api.ts                    # Fetch helpers for the Express API (getCourses, createCourse, etc.)
  courses.ts                # Course type + the original static seed data (still used by "/" and instructors)
  instructors.ts            # Instructor type + static data
backend/                    # Express API — see "Backend" section above
```

## Frontend/backend data flow

`/courses` and `/courses/:slug` are the two routes wired to the Express
API (via `lib/api.ts`, using `NEXT_PUBLIC_API_URL`). The home page and
instructors page still read the original static `lib/courses.ts` data —
they were out of scope for this pass, but could be pointed at the same
API helpers later with no change to their JSX.

- `/courses` renders `<CourseCatalog />`, a client component: it fetches
  on mount, shows `CourseCardSkeleton` cards while loading, shows an
  error state with a "Try again" button on failure, and re-fetches/patches
  local state after every add/edit/delete so the UI reflects the API
  immediately without a full reload.
- `/courses/[slug]` is a server component (`export const dynamic =
  "force-dynamic"`, since course data can now change at runtime) that
  fetches the single course and calls `notFound()` on a 404 from the API.

## How the routing maps to the file system

- A folder only becomes a visitable URL once it contains a `page.tsx`.
  `app/courses/page.tsx` → `/courses`.
- `layout.tsx` wraps every route beneath it and **persists across
  navigation** — only the page content swaps, not the Navbar/Footer.
- A folder name in square brackets — `[slug]` — is a **dynamic segment**.
  `app/courses/[slug]/page.tsx` matches `/courses/web-development`,
  `/courses/ai-engineering`, or any other slug, and receives it as
  `params.slug`.
- `generateStaticParams()` in the dynamic route tells Next.js which slugs
  to pre-render at build time (one static page per course).
- `not-found.tsx` is rendered automatically for any unmatched URL, and
  also when code explicitly calls `notFound()` (used here when a course
  slug doesn't exist).

## Concepts this project touches

- **Frontend/backend communication** — `lib/api.ts` on the frontend talks
  to `backend/routes/courses.js` over plain `fetch()`.
- **REST APIs** — five endpoints, one resource, standard HTTP verbs.
- **CORS** — the backend only accepts requests from `CLIENT_ORIGIN`
  (see `backend/server.js`); try changing `NEXT_PUBLIC_API_URL` to a
  different port and you'll see a CORS error in the browser console.
- **Environment variables** — `backend/.env` (`PORT`, `CLIENT_ORIGIN`)
  and `.env.local` (`NEXT_PUBLIC_API_URL`) keep URLs/config out of the
  code.
- **Request validation & error handling** — `middleware/validateCourse.js`
  rejects bad POST/PUT bodies with a 400 and a list of what's wrong;
  `middleware/errorHandler.js` centralizes every error response so route
  handlers just `next(new ApiError(...))`.
- **HTTP status codes** — 200/201/204 on success, 400 on bad input, 404
  on a missing course, 500 for anything unexpected.

## Deployment

The backend needs to be live somewhere the frontend can reach over HTTPS
instead of `localhost`. Steps below use Render (has a real free tier for
this kind of small Node API); Railway and Koyeb work the same way —
"new service from a GitHub repo, root directory `backend`, build `npm
install`, start `npm start`".

**1. Push the repo to GitHub** (if you haven't already — Render deploys
from a GitHub repo, it doesn't accept a zip upload):

```bash
git add .
git commit -m "Add Express backend and connect frontend to it"
git push origin main
```

**2. Create the Render service.**
Simplest: Render dashboard → **New → Blueprint** → connect this repo →
Render reads `render.yaml` at the repo root and creates the service for
you (root directory `backend`, build `npm install`, start `npm start`).

No Blueprint support / prefer doing it by hand → **New → Web Service** →
connect the repo → set:
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variable:** `CLIENT_ORIGIN` = your frontend's URL (use
  `http://localhost:3000` for now if the frontend isn't deployed yet —
  see step 4)

Don't set `PORT` yourself — Render injects its own and `server.js`
already reads `process.env.PORT`.

**3. Verify it's live** once the build finishes:

```bash
curl https://YOUR-SERVICE-NAME.onrender.com/api/health
curl https://YOUR-SERVICE-NAME.onrender.com/api/courses
```

(Render's free tier spins the service down after inactivity — the first
request after a while can take ~30–60s to respond as it wakes back up.
That's expected, not a bug.)

**4. Point the frontend at the deployed API.** Update `.env.local`:

```
NEXT_PUBLIC_API_URL=https://YOUR-SERVICE-NAME.onrender.com/api
```

Restart `npm run dev` (Next.js only reads `.env.local` at startup). If
you also deploy the frontend (e.g. Vercel), set the same
`NEXT_PUBLIC_API_URL` as an environment variable in that project's
dashboard rather than relying on `.env.local`, which isn't committed.

**5. Close the CORS loop.** Once the frontend has its own deployed URL,
go back to the Render service's environment variables and update
`CLIENT_ORIGIN` to that URL (comma-separate it with `http://localhost:3000`
to keep local dev working too), then redeploy. Until this matches, the
browser will block requests from the deployed frontend with a CORS
error even though curl/Postman work fine — CORS is enforced by the
browser, not the server, so command-line tools never see it.

**Frontend on Vercel, backend elsewhere.** Vercel is a great fit for the
Next.js half — connect this repo, it auto-detects Next.js at the root,
and `.vercelignore` already excludes `backend/` from that build. Add
`NEXT_PUBLIC_API_URL` as an environment variable in the Vercel project
settings (pointing at your Render/Railway/Koyeb URL from step 2 above).

The Express backend is deliberately *not* deployed to Vercel: Vercel
runs it as stateless serverless functions, and this backend keeps its
course data in a plain in-memory array (`backend/data/courses.js`) —
that array would reset on every cold start, and different requests can
hit different function instances, so a course you just added could
"disappear" on the very next request. Render/Railway/Koyeb run it as one
long-lived process instead, so the in-memory store behaves the way this
project expects. (A version backed by a real database wouldn't have this
problem either way — that's the natural next step after today's project.)
