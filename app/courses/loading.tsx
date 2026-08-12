// app/courses/loading.tsx
//
// Next.js auto-wraps this route's page in a Suspense boundary using this
// file as the fallback. Nothing here needs to be wired up manually — the
// App Router shows it the instant navigation starts and swaps it out once
// page.tsx has finished rendering.

import PageHeader from "@/components/PageHeader";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";

export default function CoursesLoading() {
  return (
    <>
      <PageHeader eyebrow="Catalog" title="All courses" />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="h-11 w-full max-w-md animate-pulse rounded-md bg-ink-900/10" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}
