// components/CourseCard.tsx
//
// `onEdit`/`onDelete` are optional — plain usages (home page, related
// courses) get the original whole-card-links-to-the-course behavior.
// When they're supplied (the /courses catalog, which manages courses
// against the API), an actions row renders below the card content;
// the title becomes the clickable link instead of the whole card, so
// the buttons don't end up nested inside an <a>.

import Link from "next/link";
import type { Course } from "@/lib/courses";

type Props = {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  deleting?: boolean;
};

export default function CourseCard({ course, onEdit, onDelete, deleting }: Props) {
  const isManaged = Boolean(onEdit || onDelete);

  const body = (
    <div>
      <span className="inline-block rounded-full bg-highlight-400/20 px-3 py-1 font-body text-xs font-medium text-ink-900">
        {course.category}
      </span>
      <h3 className="mt-4 font-display text-xl font-bold text-ink-950">
        {isManaged ? (
          <Link href={`/courses/${course.slug}`} className="ink-link pb-0.5">
            {course.title}
          </Link>
        ) : (
          course.title
        )}
      </h3>
      <p className="mt-2 font-body text-sm text-ink-900/70">{course.summary}</p>
    </div>
  );

  const meta = (
    <div className="mt-6 flex items-center justify-between font-body text-xs text-ink-900/60">
      <span>{course.level}</span>
      <span>{course.durationWeeks} weeks</span>
    </div>
  );

  if (!isManaged) {
    return (
      <Link
        href={`/courses/${course.slug}`}
        className="group flex flex-col justify-between rounded-lg border border-ink-900/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        {body}
        {meta}
      </Link>
    );
  }

  return (
    <div className="flex flex-col justify-between rounded-lg border border-ink-900/10 bg-white p-6 shadow-sm">
      {body}
      {meta}
      <div className="mt-4 flex gap-3 border-t border-ink-900/10 pt-4">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(course)}
            className="font-body text-xs font-medium text-ink-900 underline-offset-2 hover:underline"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(course)}
            disabled={deleting}
            className="font-body text-xs font-medium text-red-600 underline-offset-2 hover:underline disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}
