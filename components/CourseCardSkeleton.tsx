// components/CourseCardSkeleton.tsx
//
// Mirrors CourseCard's box shape (rounded card, category pill, title,
// summary, meta row) so the loading state doesn't jump around once real
// content replaces it.

export default function CourseCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-ink-900/10 bg-white p-6">
      <div className="h-5 w-24 rounded-full bg-ink-900/10" />
      <div className="mt-4 h-5 w-3/4 rounded bg-ink-900/10" />
      <div className="mt-3 h-4 w-full rounded bg-ink-900/10" />
      <div className="mt-2 h-4 w-2/3 rounded bg-ink-900/10" />
      <div className="mt-6 h-4 w-1/2 rounded bg-ink-900/10" />
    </div>
  );
}
