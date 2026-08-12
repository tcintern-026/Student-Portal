// app/courses/[slug]/loading.tsx

export default function CourseDetailsLoading() {
  return (
    <article className="mx-auto max-w-3xl animate-pulse px-6 py-16">
      <div className="h-4 w-28 rounded bg-ink-900/10" />
      <div className="mt-6 h-6 w-24 rounded-full bg-ink-900/10" />
      <div className="mt-3 h-9 w-2/3 rounded bg-ink-900/10" />
      <div className="mt-4 h-4 w-full rounded bg-ink-900/10" />
      <div className="mt-2 h-4 w-5/6 rounded bg-ink-900/10" />

      <div className="mt-8 grid grid-cols-2 gap-6 border-y border-ink-900/10 py-6 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="h-3 w-16 rounded bg-ink-900/10" />
            <div className="mt-2 h-5 w-20 rounded bg-ink-900/10" />
          </div>
        ))}
      </div>

      <div className="mt-10 h-6 w-32 rounded bg-ink-900/10" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 w-full rounded bg-ink-900/10" />
        ))}
      </div>
    </article>
  );
}
