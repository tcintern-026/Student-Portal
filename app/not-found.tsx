// app/not-found.tsx
//
// A file named exactly `not-found.tsx` at any level is Next.js's convention
// for a custom 404: it's used automatically for unmatched URLs, and also
// whenever code calls notFound() (see app/courses/[slug]/page.tsx).

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start px-6 py-24">
      <span className="font-display text-6xl font-bold text-highlight-500">404</span>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink-950">
        This page didn't make the syllabus.
      </h1>
      <p className="mt-2 font-body text-ink-900/70">
        The page you're looking for doesn't exist — it may have moved, or the
        course slug in the URL doesn't match anything in the catalog.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-ink-950 px-5 py-3 font-body text-sm font-medium text-paper transition hover:bg-ink-900"
      >
        Back to home
      </Link>
    </div>
  );
}
