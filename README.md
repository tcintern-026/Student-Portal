# Student Course Portal

A small Next.js App Router project built to learn file-based routing,
shared layouts, and dynamic routes.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Project structure

```
app/
  layout.tsx              # Root layout — Navbar + Footer wrap every page
  globals.css              # Tailwind directives + small global styles
  page.tsx                 # "/"              → Home
  not-found.tsx             # Custom 404, used for unmatched routes and notFound()
  courses/
    page.tsx               # "/courses"       → Courses listing
    [slug]/
      page.tsx             # "/courses/:slug" → Dynamic course details route
  instructors/
    page.tsx               # "/instructors"   → Instructors
  contact/
    page.tsx               # "/contact"       → Contact form (UI only)
components/
  Navbar.tsx                # Shared nav, uses next/link
  Footer.tsx                # Shared footer, uses next/link
  CourseCard.tsx             # Reusable card, linked to a course's dynamic route
  PageHeader.tsx             # Reusable page title/description block
lib/
  data.ts                   # Static "database" — courses + instructors
```

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
  slug doesn't exist in `lib/data.ts`).

## Swapping in a real backend later

Everything reads from `lib/data.ts`. To connect a backend, replace the
functions in that file with `fetch()` calls to your API — the page
components that import `courses`, `instructors`, `getCourseBySlug`, etc.
don't need to change.
