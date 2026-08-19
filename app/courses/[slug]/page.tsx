// app/courses/[slug]/page.tsx
//
// THE DYNAMIC ROUTE. Square brackets in a folder name — [slug] — tell
// Next.js "match anything here and hand it to me as a param." So this one
// file serves /courses/web-development, /courses/ai-engineering, and any
// other course slug the API knows about, without a new file per course.
//
// Now backed by the Express API instead of the static lib/courses.ts data,
// so this can no longer be statically generated at build time (courses can
// be added/removed at runtime) — it fetches per-request instead.

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getInstructorBySlug } from "@/lib/instructors";
import { getCourse, getCourses, ApiError } from "@/lib/api";
import type { Course } from "@/lib/courses";
import CourseCard from "@/components/CourseCard";
import SectionTitle from "@/components/SectionTitle";

type Props = {
  params: { slug: string };
};

// Data changes at runtime now (via the API), so opt this route out of
// static generation/caching rather than baking in stale courses.
export const dynamic = "force-dynamic";

async function loadCourse(slug: string): Promise<Course | null> {
  try {
    return await getCourse(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await loadCourse(params.slug);
  return { title: course ? `${course.title} · Student Course Portal` : "Course not found" };
}

export default async function CourseDetailsPage({ params }: Props) {
  const course = await loadCourse(params.slug);

  // No matching course for this slug — render the nearest not-found.tsx
  // (falls back to app/not-found.tsx here since this route has none of its own).
  if (!course) {
    notFound();
  }

  const instructor = getInstructorBySlug(course.instructorSlug);

  // Related = same category, not this course, capped at 3. The API has no
  // dedicated "related" endpoint, so fetch the full list and filter here.
  const allCourses = await getCourses();
  const relatedCourses = allCourses
    .filter((c) => c.category === course.category && c.slug !== course.slug)
    .slice(0, 3);

  return (
    <>
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/courses" className="ink-link font-body text-sm pb-0.5">
        &larr; Back to courses
      </Link>

      <span className="mt-6 inline-block rounded-full bg-highlight-400/20 px-3 py-1 font-body text-xs font-medium text-ink-900">
        {course.category}
      </span>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink-950 sm:text-4xl">
        {course.title}
      </h1>
      <p className="mt-3 font-body text-ink-900/70">{course.description}</p>

      <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-ink-900/10 py-6 sm:grid-cols-4">
        <div>
          <dt className="font-body text-xs uppercase tracking-wide text-ink-900/50">Level</dt>
          <dd className="mt-1 font-display font-semibold text-ink-950">{course.level}</dd>
        </div>
        <div>
          <dt className="font-body text-xs uppercase tracking-wide text-ink-900/50">Duration</dt>
          <dd className="mt-1 font-display font-semibold text-ink-950">
            {course.durationWeeks} weeks
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="font-body text-xs uppercase tracking-wide text-ink-900/50">Instructor</dt>
          <dd className="mt-1 font-display font-semibold text-ink-950">
            {instructor ? (
              <Link href={`/instructors#${instructor.slug}`} className="ink-link pb-0.5">
                {instructor.name}
              </Link>
            ) : (
              "TBA"
            )}
          </dd>
        </div>
      </dl>

      <h2 className="mt-10 font-display text-xl font-bold text-ink-950">Syllabus</h2>
      {course.syllabus.length === 0 ? (
        <p className="mt-4 font-body text-sm text-ink-900/60">No syllabus items yet.</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {course.syllabus.map((item, i) => (
            <li key={item} className="flex gap-4 font-body text-sm text-ink-900/80">
              <span className="font-display text-highlight-500">{String(i + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ol>
      )}
    </article>

    {relatedCourses.length > 0 && (
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <SectionTitle
          title="Related courses"
          description={`More in ${course.category}.`}
          actionLabel="View all courses"
          actionHref="/courses"
        />
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {relatedCourses.map((related) => (
            <CourseCard key={related.slug} course={related} />
          ))}
        </div>
      </section>
    )}
    </>
  );
}
