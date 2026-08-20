# Student Course Portal

A course catalog app for my COMSATS coursework — started as a plain Next.js frontend, then I hooked it up to an Express API, and now the API talks to a real Postgres database on Neon instead of an in-memory array.

Stack: Next.js (App Router) on the frontend, Express + `pg` on the backend, Postgres (Neon) for storage. Frontend deploys to Vercel, backend to Render.

## Getting it running locally

You need three things running: the database, the backend, and the frontend. Database first, since the other two depend on it.

### 1. Database

Create a project on [neon.tech](https://neon.tech) if you haven't already (free tier is enough). Grab the connection string from the dashboard under Connection Details — use the **pooled** one, it looks something like:

```
postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/dbname?sslmode=require
```

```bash
cd backend
npm install
cp .env.example .env
# open .env and paste your Neon URL into DATABASE_URL
npm run migrate   # creates the tables
npm run seed        # adds a few sample courses/instructors/students so there's something to look at
```

### 2. Backend

Still in `backend/`:

```bash
npm run dev
```

Runs on port 4000. `npm run dev` uses nodemon so it restarts on changes — `npm start` if you just want plain node.

### 3. Frontend

New terminal, back at the repo root:

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000. If the backend or database isn't running, the courses page shows an error with a retry button instead of just breaking — that's intentional, not a bug you need to chase.

## What's in the backend

```
backend/
  server.js              # CORS, JSON parsing, mounts the routes, error handlers last
  db/
    pool.js               # the pg connection pool
    schema.sql             # table definitions
    migrate.js              # npm run migrate
    seed.js                  # npm run seed
  routes/                 # one file per resource — courses, instructors, students, enrollments
  data/                   # all the actual SQL lives here, routes never write queries themselves
  middleware/
    validate*.js           # request validation per resource
    errorHandler.js         # turns 404s / bad input / postgres errors into consistent JSON
  utils/
    ApiError.js
    slugify.js
    pagination.js
```

I kept it to raw SQL instead of an ORM on purpose — wanted to actually see the joins and constraints rather than have Prisma generate them for me.

### Endpoints

Courses:

| Method | Path | Notes |
|---|---|---|
| GET | `/api/courses` | takes `?category=`, `?level=`, `?search=`, `?page=`, `?limit=`, returns `{ data, meta }` |
| GET | `/api/courses/:slug` | 404 if it doesn't exist |
| POST | `/api/courses` | 201 on success, 400 with a `details` array if validation fails |
| PUT | `/api/courses/:slug` | partial update |
| DELETE | `/api/courses/:slug` | 204 |

Instructors and students follow the same GET/POST/PUT/DELETE pattern (`/api/instructors` by slug, `/api/students` by id — students also get a 409 if you try to reuse an email).

Enrollments is a bit different since it's a join table, not really something you "edit":

| Method | Path | Notes |
|---|---|---|
| GET | `/api/enrollments` | optional `?studentId=` or `?courseSlug=` |
| POST | `/api/enrollments` | `{ studentEmail, courseSlug }`, 409 if already enrolled |
| DELETE | `/api/enrollments/:id` | unenroll |

`GET /api/health` is just a liveness check.

Deleting an instructor doesn't delete their courses, it just nulls out the instructor on them. Deleting a student does cascade — their enrollments go with them.

Quick way to poke at it:

```bash
curl http://localhost:4000/api/courses
curl -X POST http://localhost:4000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"Cloud Computing","category":"Software Engineering","level":"Intermediate","durationWeeks":9,"summary":"Intro to cloud.","instructorSlug":"amina-khan"}'
```

Or point Postman at the same endpoints — every error comes back with an `error` field (and `details` for validation failures), so it's easy to write assertions against.

## The database

Four tables: `instructors`, `courses`, `students`, `enrollments`.

```
instructors ──┐
              │ (1 instructor : many courses)
              ▼
            courses ◄──────┐
                            │ enrollments (many:many join)
            students ───────┘
```

- A course's `instructor_id` is a nullable FK — delete the instructor, the course survives, it just loses its instructor.
- `enrollments` has `UNIQUE(student_id, course_id)` so the same student can't enroll in the same course twice — Postgres throws a 23505 and my error handler turns that into a 409 instead of a crash.
- `GET /api/courses` uses `COUNT(*) OVER()` to get the pagination total in the same query as the actual rows, instead of running a separate `COUNT(*)` query.

Full DDL is in `backend/db/schema.sql` if you want to read the real thing instead of my summary.

Both `npm run migrate` and `npm run seed` are safe to run more than once — the schema uses `IF NOT EXISTS` and the seed data uses `ON CONFLICT DO NOTHING`, so nothing duplicates.

## Project structure (frontend)

```
app/
  page.tsx                    "/"            — still static, wasn't in scope for the DB pass
  courses/page.tsx            "/courses"     — the one actually wired to the API
  courses/[slug]/page.tsx     "/courses/:x"  — same, fetches per-request
  instructors/page.tsx        "/instructors" — still static too
  contact/page.tsx
components/
  CourseCatalog.tsx    — the client component doing all the fetching/searching/paginating
  CourseCard.tsx       — shows edit/delete buttons when you pass it those handlers, plain link otherwise
  CourseForm.tsx       — shared between add and edit
lib/
  api.ts               — every fetch() to the backend goes through here
  courses.ts           — the Course type, plus the old static seed data (still used by "/")
backend/               — see above
```

Honestly the home page and instructors page are still reading static data from `lib/courses.ts` — I only pointed `/courses` at the real API for this round, ran out of steam to redo everything. Wouldn't be much work to switch them over later, same `lib/api.ts` helpers would work.

## How courses/[slug] actually works

Square brackets in a folder name (`[slug]`) mean "match anything here." So `app/courses/[slug]/page.tsx` handles every course URL, and whatever's in the URL shows up as `params.slug`.

It used to use `generateStaticParams()` to pre-build a page per course at build time, back when courses were a hardcoded array. Can't do that anymore since courses now live in a database and can change whenever — so it's `dynamic = "force-dynamic"` instead, fetches fresh on every request.

## Deploying it

Backend → Render, frontend → Vercel, database → Neon (already have that from local setup).

**Push to GitHub first** — both platforms deploy from a repo, not a zip.

```bash
git add .
git commit -m "add database layer"
git push origin main
```

**Backend on Render.** Easiest way: New → Blueprint → connect the repo, it reads `render.yaml` and sets everything up (root dir `backend`, build/start commands, etc). It'll ask you to paste in `DATABASE_URL` since that's marked secret in the yaml. If Blueprint isn't available for some reason, do it by hand: New → Web Service, root directory `backend`, build command `npm install`, start command `npm start`, and add `CLIENT_ORIGIN` + `DATABASE_URL` yourself under Environment.

Don't set `PORT` — Render injects its own and the app already reads `process.env.PORT`.

Once it's live:

```bash
curl https://your-service.onrender.com/api/health
curl https://your-service.onrender.com/api/courses
```

First request after it's been idle takes a while (30-60s) to wake back up on the free tier. Not broken, just Render being Render.

**Frontend on Vercel.** Import the same repo, Vercel figures out it's Next.js on its own. Set `NEXT_PUBLIC_API_URL` to your Render URL + `/api` before deploying (or after, but you'll need to redeploy for it to take effect since Next bakes it in at build time).

**Then go back and fix CORS.** Once you've got your real Vercel URL, update `CLIENT_ORIGIN` on Render to match it exactly (comma-separate with `http://localhost:3000` if you still want local dev to work against it). Redeploy. Until this matches, you'll get a CORS error in the browser console even though curl/Postman work fine the whole time — CORS is a browser thing, not a server thing.

One database serves both local dev and the deployed app — same `DATABASE_URL` everywhere. No need for a separate prod database at this scale, just don't nuke your data testing something locally.
