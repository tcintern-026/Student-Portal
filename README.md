# Student Course Portal

A small full-stack project: a Next.js App Router frontend, an Express
REST API backend, and a Postgres database (hosted on Neon) — built to
learn frontend/backend communication, REST API design, SQL, and the App
Router's file-based routing.

## Run it

This is two apps plus a database — set up the database first, then start
both apps.

**1. Database (Neon Postgres)** — see the [Database](#database-postgres-on-neon)
section below for creating the project and getting a connection string.
Once you have one:

```bash
cd backend
npm install
cp .env.example .env   # then paste your Neon DATABASE_URL into it
npm run migrate         # creates the tables
npm run seed             # populates sample instructors/courses/students/enrollments
```

**2. Backend (Express API, port 4000):**

```bash
npm run dev      # nodemon, restarts on changes — or `npm start` for plain node
```

**3. Frontend (Next.js, port 3000)**, in a second terminal from the repo root:

```bash
npm install
cp .env.local.example .env.local   # only needed if it doesn't already exist
npm run dev
```

Then open http://localhost:3000. The Courses page fetches live from the
API at http://localhost:4000/api — start the database and backend
first, or the catalog will show its error state with a "Try again"
button.

## Backend

```
backend/
  server.js                     # entry point: CORS, JSON body parsing, routes, error handlers
  db/
    pool.js                     # pg connection pool, reads DATABASE_URL
    schema.sql                  # CREATE TABLE statements (instructors, courses, students, enrollments)
    migrate.js                  # npm run migrate — applies schema.sql
    seed.js                     # npm run seed — sample data for all four tables
  routes/
    courses.js                  # GET/POST/PUT/DELETE /api/courses (+ filter/search/pagination)
    instructors.js               # GET/POST/PUT/DELETE /api/instructors
    students.js                  # GET/POST/PUT/DELETE /api/students
    enrollments.js                # GET/POST/DELETE /api/enrollments (student <-> course join)
  data/                          # one file per table — all the actual SQL lives here, routes never write SQL directly
    courses.js
    instructors.js
    students.js
    enrollments.js
  middleware/
    validateCourse.js            # request validation for POST/PUT
    validateInstructor.js
    validateStudent.js            # includes email format check
    validateEnrollment.js
    errorHandler.js               # centralized 404/validation/Postgres-error -> JSON responses
  utils/
    ApiError.js                   # Error subclass carrying an HTTP status code
    slugify.js                    # title/name -> url-safe slug, used when creating a course/instructor
    pagination.js                  # ?page=/?limit= parsing shared by routes that support it
  .env.example                    # PORT, CLIENT_ORIGIN, DATABASE_URL
```

### Endpoints

**Courses**

| Method | Path                | Notes                                              |
| ------ | ------------------- | --------------------------------------------------- |
| GET    | `/api/courses`       | Optional `?category=`, `?level=`, `?search=`, `?page=`, `?limit=` — returns `{ data, meta }` |
| GET    | `/api/courses/:slug` | 404 if the slug doesn't exist                        |
| POST   | `/api/courses`       | 201 + created course; 400 with `details[]` if invalid; 400 if `instructorSlug` doesn't exist |
| PUT    | `/api/courses/:slug` | Partial update; 400 if invalid, 404 if missing        |
| DELETE | `/api/courses/:slug` | 204 on success, 404 if missing                        |

**Instructors** — same GET/POST/PUT/DELETE shape at `/api/instructors`, keyed by `:slug`.

**Students** — same shape at `/api/students`, keyed by `:id`. Email must be unique (409 on a duplicate) and valid-looking (400 otherwise).

**Enrollments** — the many-to-many join between students and courses:

| Method | Path                   | Notes                                                        |
| ------ | ---------------------- | -------------------------------------------------------------- |
| GET    | `/api/enrollments`      | Optional `?studentId=` or `?courseSlug=` filters                |
| POST   | `/api/enrollments`      | Body: `{ studentEmail, courseSlug }`. 400 if either doesn't exist; 409 if already enrolled |
| DELETE | `/api/enrollments/:id`   | Unenroll. 204 on success, 404 if missing                        |

Plus `GET /api/health` as a liveness check.

Deleting an instructor sets `instructor_id` to `NULL` on their courses
(the course itself isn't deleted). Deleting a student cascades and
removes their enrollments automatically.

Try it with curl:

```bash
curl http://localhost:4000/api/courses
curl -X POST http://localhost:4000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"Cloud Computing","category":"Software Engineering","level":"Intermediate","durationWeeks":9,"summary":"Intro to cloud.","instructorSlug":"amina-khan"}'
curl -X POST http://localhost:4000/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"studentEmail":"aiman.raza@example.com","courseSlug":"web-development"}'
```

Or import the endpoints above into Postman/Insomnia for interactive
testing — every validation and not-found case returns a JSON body with
an `error` field (and `details[]` for validation failures), so you can
assert on the response shape directly.

## Database (Postgres on Neon)

**1. Create the project.** Sign up / log in at
[neon.tech](https://neon.tech) → **New Project**. Pick any name and
region — the free tier is plenty for this.

**2. Get the connection string.** On the project dashboard, find
**Connection Details** and copy the **pooled** connection string (it
looks like `postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/dbname?sslmode=require`).
The pooled variant matters more once this is deployed (Render's free
tier + serverless Postgres can otherwise exhaust connection limits
under load), but works fine for local dev too.

**3. Set it locally.** Paste that string into `backend/.env` as
`DATABASE_URL`.

**4. Create the tables and seed data:**

```bash
cd backend
npm run migrate   # applies db/schema.sql
npm run seed        # populates instructors/courses/students/enrollments
```

Both are safe to re-run — `schema.sql` uses `IF NOT EXISTS`, and
`seed.js` uses `ON CONFLICT DO NOTHING` on each table's natural unique
key (slug/email), so re-running never duplicates rows.

**5. Inspect the data** either via `psql "$DATABASE_URL"`, or Neon's
built-in SQL Editor in the dashboard — both work identically to any
other Postgres instance.

### Schema

```
instructors                courses                      students
 id (PK)                    id (PK)                       id (PK)
 slug (unique)               slug (unique)                  email (unique)
 name                         title, category, level         name
 title, bio                    duration_weeks
                                instructor_id (FK -> instructors.id, ON DELETE SET NULL)
                                summary, description, syllabus[]

                            enrollments
                             id (PK)
                             student_id (FK -> students.id, ON DELETE CASCADE)
                             course_id  (FK -> courses.id,  ON DELETE CASCADE)
                             UNIQUE(student_id, course_id)
```

One instructor teaches many courses (1-to-many); students and courses
are many-to-many through `enrollments`. See `backend/db/schema.sql` for
the full DDL including indexes.

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
  on mount (and whenever search/level/page change), shows
  `CourseCardSkeleton` cards while loading, shows an error state with a
  "Try again" button on failure, and re-fetches after every add/edit/delete
  so the UI reflects the database immediately. Search and level filtering
  happen server-side (`?search=`/`?level=` sent to the API), not by
  filtering an already-fetched array in the browser.
- `/courses/[slug]` is a server component (`export const dynamic =
  "force-dynamic"`, since course data can now change at runtime) that
  fetches the single course — including its instructor's name/slug via
  a SQL join — and calls `notFound()` on a 404 from the API.

## How the routing maps to the file system

- A folder only becomes a visitable URL once it contains a `page.tsx`.
  `app/courses/page.tsx` → `/courses`.
- `layout.tsx` wraps every route beneath it and **persists across
  navigation** — only the page content swaps, not the Navbar/Footer.
- A folder name in square brackets — `[slug]` — is a **dynamic segment**.
  `app/courses/[slug]/page.tsx` matches `/courses/web-development`,
  `/courses/ai-engineering`, or any other slug, and receives it as
  `params.slug`. It's marked `dynamic = "force-dynamic"` rather than
  using `generateStaticParams()`, since course slugs live in the
  database and can change at runtime — nothing here is pre-rendered at
  build time.
- `not-found.tsx` is rendered automatically for any unmatched URL, and
  also when code explicitly calls `notFound()` (used here when a course
  slug doesn't exist).

## Concepts this project touches

- **Frontend/backend communication** — `lib/api.ts` on the frontend talks
  to the Express routes over plain `fetch()`.
- **REST APIs** — four resources (courses, instructors, students,
  enrollments), standard HTTP verbs, consistent JSON shapes.
- **SQL & relational data** — raw `pg` queries (no ORM) in `data/*.js`:
  joins (courses ⨝ instructors, enrollments ⨝ students ⨝ courses),
  foreign keys with `ON DELETE SET NULL`/`CASCADE`, a `UNIQUE` constraint
  enforcing "can't enroll twice", and a window function (`COUNT(*)
  OVER()`) to get pagination totals in the same query as the page of rows.
- **CORS** — the backend only accepts requests from `CLIENT_ORIGIN`
  (see `backend/server.js`); try changing `NEXT_PUBLIC_API_URL` to a
  different port and you'll see a CORS error in the browser console.
- **Environment variables** — `backend/.env` (`PORT`, `CLIENT_ORIGIN`,
  `DATABASE_URL`) and `.env.local` (`NEXT_PUBLIC_API_URL`) keep secrets
  and URLs out of the code — `DATABASE_URL` in particular should never
  be committed (see `.gitignore`).
- **Request validation & error handling** — one `middleware/validate*.js`
  file per resource rejects bad POST/PUT bodies with a 400 and a list of
  what's wrong; `middleware/errorHandler.js` centralizes every error
  response, including translating raw Postgres error codes (unique
  violation, foreign key violation, etc.) into clean 4xx JSON instead of
  a generic 500.
- **HTTP status codes** — 200/201/204 on success, 400 on bad input, 404
  on a missing record, 409 on a conflict (duplicate email, double
  enrollment), 500 for anything unexpected.
- **Filtering, search & pagination** — `GET /api/courses` supports
  `?category=`, `?level=`, `?search=`, `?page=`, `?limit=`, all
  implemented as SQL `WHERE`/`ILIKE`/`LIMIT`/`OFFSET` rather than
  filtering an array after fetching everything.

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
- **Environment Variables:**
  - `CLIENT_ORIGIN` = your frontend's URL (use `http://localhost:3000`
    for now if the frontend isn't deployed yet — see step 5)
  - `DATABASE_URL` = your Neon connection string (same one from
    `backend/.env` — Neon is already reachable from anywhere, so the
    same database works for both local dev and the deployed API; no
    separate "production database" needed for a project this size)

Don't set `PORT` yourself — Render injects its own and `server.js`
already reads `process.env.PORT`.

**3. Apply the schema to the same database** (only needs doing once —
skip this if you already ran `npm run migrate && npm run seed` locally
against this same `DATABASE_URL`, since it's the same Neon database
either way):

```bash
cd backend
npm run migrate
npm run seed
```

**4. Verify it's live** once the build finishes:

```bash
curl https://YOUR-SERVICE-NAME.onrender.com/api/health
curl https://YOUR-SERVICE-NAME.onrender.com/api/courses
```

(Render's free tier spins the service down after inactivity — the first
request after a while can take ~30–60s to respond as it wakes back up.
That's expected, not a bug.)

**5. Point the frontend at the deployed API.** Update `.env.local`:

```
NEXT_PUBLIC_API_URL=https://YOUR-SERVICE-NAME.onrender.com/api
```

Restart `npm run dev` (Next.js only reads `.env.local` at startup). If
you also deploy the frontend (e.g. Vercel), set the same
`NEXT_PUBLIC_API_URL` as an environment variable in that project's
dashboard rather than relying on `.env.local`, which isn't committed.

**6. Close the CORS loop.** Once the frontend has its own deployed URL,
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
