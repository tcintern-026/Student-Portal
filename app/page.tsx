// app/page.tsx
//
// `app/page.tsx` is what makes "/" a route. In the App Router, a folder
// only becomes a visitable URL once it contains a page.tsx — that's the
// whole convention behind file-based routing.

import CourseCard from "@/components/CourseCard";
import Button from "@/components/Button";
import SectionTitle from "@/components/SectionTitle";
import { courses } from "@/lib/courses";
import { instructors } from "@/lib/instructors";

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
          <Button href="/courses" variant="primary">
            Browse courses
          </Button>
          <Button href="/instructors" variant="secondary">
            Meet instructors
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <SectionTitle
          title="Featured courses"
          actionLabel="View all"
          actionHref="/courses"
        />
        {featured.length === 0 ? (
          <p className="mt-6 font-body text-sm text-ink-900/60">
            No courses are available yet — check back soon.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <SectionTitle
          title={`${instructors.length} instructors teaching right now`}
          description="From web development to security research — see the full list on the Instructors page."
        />
      </section>
    </>
  );
}
