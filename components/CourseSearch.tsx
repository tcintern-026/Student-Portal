// components/CourseSearch.tsx
//
// "use client" because this needs state (the query) and an onChange
// handler — neither works in a server component. The course data itself
// still comes from the server via props, so it's fetched/rendered once,
// not re-fetched on every keystroke.

"use client";

import { useMemo, useState } from "react";
import CourseCard from "@/components/CourseCard";
import Button from "@/components/Button";
import type { Course } from "@/lib/courses";

export default function CourseSearch({ courses }: { courses: Course[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((course) =>
      [course.title, course.category, course.summary].some((field) =>
        field.toLowerCase().includes(q)
      )
    );
  }, [courses, query]);

  // Two distinct empty states: the catalog itself has nothing in it yet
  // (a data problem), vs. the catalog has courses but none match the
  // current search (a query problem, solvable by clearing it).
  if (courses.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="font-body text-sm text-ink-900/60">
          No courses are available yet — check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <label htmlFor="course-search" className="sr-only">
        Search courses
      </label>
      <input
        id="course-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by title or category…"
        className="w-full rounded-md border border-ink-900/20 bg-white px-4 py-3 font-body text-sm text-ink-950 focus-visible:border-highlight-500 sm:max-w-md"
      />

      {filtered.length === 0 ? (
        <div className="mt-10">
          <p className="font-body text-sm text-ink-900/60">
            No courses match &ldquo;{query}&rdquo;.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => setQuery("")}
          >
            Clear search
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
