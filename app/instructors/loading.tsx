// app/instructors/loading.tsx

import PageHeader from "@/components/PageHeader";

export default function InstructorsLoading() {
  return (
    <>
      <PageHeader eyebrow="Faculty" title="Instructors" />
      <div className="mx-auto max-w-4xl divide-y divide-ink-900/10 px-6 py-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse py-8">
            <div className="h-6 w-48 rounded bg-ink-900/10" />
            <div className="mt-2 h-4 w-56 rounded bg-ink-900/10" />
            <div className="mt-4 h-4 w-full rounded bg-ink-900/10" />
            <div className="mt-2 h-4 w-3/4 rounded bg-ink-900/10" />
          </div>
        ))}
      </div>
    </>
  );
}
