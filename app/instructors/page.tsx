// app/instructors/page.tsx

import PageHeader from "@/components/PageHeader";
import { instructors } from "@/lib/instructors";
import { getCoursesByInstructor } from "@/lib/courses";

export const metadata = {
  title: "Instructors · Student Course Portal",
};

export default function InstructorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Faculty"
        title="Instructors"
        description="The people teaching the courses in this catalog."
      />
      {instructors.length === 0 ? (
        <div className="mx-auto max-w-4xl px-6 py-10">
          <p className="font-body text-sm text-ink-900/60">
            No instructors are listed yet — check back soon.
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl divide-y divide-ink-900/10 px-6 py-10">
          {instructors.map((instructor) => {
            const taught = getCoursesByInstructor(instructor.slug);
            return (
              <section id={instructor.slug} key={instructor.slug} className="scroll-mt-24 py-8">
                <h2 className="font-display text-xl font-bold text-ink-950">
                  {instructor.name}
                </h2>
                <p className="mt-1 font-body text-sm font-medium text-highlight-500">
                  {instructor.title}
                </p>
                <p className="mt-3 max-w-2xl font-body text-sm text-ink-900/70">
                  {instructor.bio}
                </p>
                {taught.length > 0 && (
                  <p className="mt-4 font-body text-xs uppercase tracking-wide text-ink-900/50">
                    Teaches: {taught.map((c) => c.title).join(", ")}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
