// app/page.tsx
//
// `app/page.tsx` is what makes "/" a route. In the App Router, a folder
// only becomes a visitable URL once it contains a page.tsx — that's the
// whole convention behind file-based routing.

import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import { courses, instructors } from "@/lib/data";

export default function HomePage() {
  const featured = courses.slice(0, 3);

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <p className="font-body text-xs font-semibold uppercase tracking-widest text-highlight-500">
          COMSATS-style student portal · demo project
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight text-ink-950 sm:text-5xl">
          Find your next course. Meet the people teaching it.
        </h1>
        <p className="mt-4 max-w-xl font-body text-ink-900/70">
          A small catalog of courses and instructors, built to learn the
          Next.js App Router: file-based routes, a shared layout, and a
          dynamic route per course.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/courses"
            className="rounded-md bg-ink-950 px-5 py-3 font-body text-sm font-medium text-paper transition hover:bg-ink-900"
          >
            Browse courses
          </Link>
          <Link
            href="/instructors"
            className="rounded-md border border-ink-950/20 px-5 py-3 font-body text-sm font-medium text-ink-950 transition hover:border-ink-950/40"
          >
            Meet instructors
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold text-ink-950">
            Featured courses
          </h2>
          <Link href="/courses" className="ink-link font-body text-sm pb-0.5">
            View all &rarr;
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="font-display text-2xl font-bold text-ink-950">
          {instructors.length} instructors teaching right now
        </h2>
        <p className="mt-2 max-w-xl font-body text-sm text-ink-900/70">
          From web development to security research — see the full list on
          the Instructors page.
        </p>
      </section>
    </>
  );
}
