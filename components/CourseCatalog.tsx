// components/CourseCatalog.tsx
//
// Owns the full lifecycle of the /courses page against the Express API:
// fetch on mount, loading skeletons, an error state with retry, client-side
// search over whatever loaded, and add/edit/delete wired to lib/api.ts.
// Kept as one client component (rather than splitting search out like the
// old static version) because add/edit/delete all need to mutate the same
// `courses` state that search filters over.

"use client";

import { useEffect, useMemo, useState } from "react";
import CourseCard from "@/components/CourseCard";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import CourseForm, { type CourseFormValues } from "@/components/CourseForm";
import Button from "@/components/Button";
import type { Course } from "@/lib/courses";
import { ApiError, createCourse, deleteCourse, getCourses, updateCourse } from "@/lib/api";

type LoadState = "loading" | "error" | "ready";

export default function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [formMode, setFormMode] = useState<"closed" | "add" | Course>("closed");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function load() {
    setLoadState("loading");
    setLoadError(null);
    try {
      const data = await getCourses();
      setCourses(data);
      setLoadState("ready");
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Something went wrong loading courses.");
      setLoadState("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((course) =>
      [course.title, course.category, course.summary].some((field) => field.toLowerCase().includes(q))
    );
  }, [courses, query]);

  async function handleAdd(values: CourseFormValues) {
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await createCourse(values);
      setCourses((prev) => [...prev, created]);
      setFormMode("closed");
    } catch (err) {
      setFormError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(slug: string, values: CourseFormValues) {
    setSubmitting(true);
    setFormError(null);
    try {
      const updated = await updateCourse(slug, values);
      setCourses((prev) => prev.map((c) => (c.slug === slug ? updated : c)));
      setFormMode("closed");
    } catch (err) {
      setFormError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(course: Course) {
    if (!window.confirm(`Delete "${course.title}"? This can't be undone.`)) return;
    setDeletingSlug(course.slug);
    setActionError(null);
    try {
      await deleteCourse(course.slug);
      setCourses((prev) => prev.filter((c) => c.slug !== course.slug));
    } catch (err) {
      setActionError(describeError(err));
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <label htmlFor="course-search" className="sr-only">
            Search courses
          </label>
          <input
            id="course-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title or category…"
            className="form-input sm:max-w-md"
          />
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setFormError(null);
            setFormMode(formMode === "add" ? "closed" : "add");
          }}
        >
          {formMode === "add" ? "Close form" : "Add course"}
        </Button>
      </div>

      {formMode === "add" && (
        <CourseForm
          submitLabel="Create course"
          submitting={submitting}
          onSubmit={handleAdd}
          onCancel={() => setFormMode("closed")}
        />
      )}
      {formMode !== "closed" && formMode !== "add" && (
        <CourseForm
          initialCourse={formMode}
          submitLabel="Save changes"
          submitting={submitting}
          onSubmit={(values) => handleEdit(formMode.slug, values)}
          onCancel={() => setFormMode("closed")}
        />
      )}
      {formError && (
        <p role="alert" className="mt-3 font-body text-sm text-red-600">
          {formError}
        </p>
      )}

      {actionError && (
        <p role="alert" className="mt-6 rounded-md bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {actionError}
        </p>
      )}

      {loadState === "loading" && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      )}

      {loadState === "error" && (
        <div className="mt-10 rounded-md bg-red-50 px-4 py-6 text-center">
          <p className="font-body text-sm text-red-700">{loadError}</p>
          <Button variant="secondary" className="mt-4" onClick={load}>
            Try again
          </Button>
        </div>
      )}

      {loadState === "ready" && courses.length === 0 && (
        <p className="mt-10 font-body text-sm text-ink-900/60">
          No courses are available yet — add the first one above.
        </p>
      )}

      {loadState === "ready" && courses.length > 0 && filtered.length === 0 && (
        <div className="mt-10">
          <p className="font-body text-sm text-ink-900/60">No courses match &ldquo;{query}&rdquo;.</p>
          <Button variant="secondary" className="mt-4" onClick={() => setQuery("")}>
            Clear search
          </Button>
        </div>
      )}

      {loadState === "ready" && filtered.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard
              key={course.slug}
              course={course}
              onEdit={(c) => {
                setFormError(null);
                setFormMode(c);
              }}
              onDelete={handleDelete}
              deleting={deletingSlug === course.slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function describeError(err: unknown): string {
  if (err instanceof ApiError) {
    return err.details?.length ? `${err.message}: ${err.details.join(", ")}` : err.message;
  }
  return "Something went wrong. Please try again.";
}
