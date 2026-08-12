// components/CourseCard.tsx

import Link from "next/link";
import type { Course } from "@/lib/courses";

export default function CourseCard({ course }: { course: Course }) {
  return (
    // The whole card links to the dynamic route /courses/[slug]
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col justify-between rounded-lg border border-ink-900/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div>
        <span className="inline-block rounded-full bg-highlight-400/20 px-3 py-1 font-body text-xs font-medium text-ink-900">
          {course.category}
        </span>
        <h3 className="mt-4 font-display text-xl font-bold text-ink-950">
          {course.title}
        </h3>
        <p className="mt-2 font-body text-sm text-ink-900/70">{course.summary}</p>
      </div>
      <div className="mt-6 flex items-center justify-between font-body text-xs text-ink-900/60">
        <span>{course.level}</span>
        <span>{course.durationWeeks} weeks</span>
      </div>
    </Link>
  );
}
