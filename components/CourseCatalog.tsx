// components/CourseCatalog.tsx
//
// Owns the full lifecycle of the /courses page against the Express API:
// fetch (with server-side search/filter/pagination), loading skeletons,
// an error state with retry, and add/edit/delete wired to lib/api.ts.
//
// Search/filter/pagination are all server-side now (the API does the
// SQL WHERE/LIMIT/OFFSET) rather than filtering an already-fetched array
// client-side — see lib/api.ts's getCourses().

"use client";

import { useEffect, useState } from "react";
import CourseCard from "@/components/CourseCard";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import CourseForm, { type CourseFormValues } from "@/components/CourseForm";
import Button from "@/components/Button";
import type { Course } from "@/lib/courses";
import { ApiError, createCourse, deleteCourse, getCourses, updateCourse, type PaginationMeta } from "@/lib/api";

type LoadState = "loading" | "error" | "ready";

const LEVEL_OPTIONS = ["All levels", "Beginner", "Intermediate", "Advanced"] as const;

export default function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // debounced value actually sent to the API
  const [level, setLevel] = useState<string>("All levels");
  const [page, setPage] = useState(1);

  const [formMode, setFormMode] = useState<"closed" | "add" | Course>("closed");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Debounce the search box so every keystroke doesn't fire a request —
  // wait 350ms after the user stops typing before it takes effect.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  async function load() {
    setLoadState("loading");
    setLoadError(null);
    try {
      const { data, meta } = await getCourses({
        search: search || undefined,
        level: level === "All levels" ? undefined : level,
        page,
        limit: 6,
      });
      setCourses(data);
      setMeta(meta);
      setLoadState("ready");
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Something went wrong loading courses.");
      setLoadState("error");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, level, page]);

  async function handleAdd(values: CourseFormValues) {
    setSubmitting(true);
    setFormError(null);
    try {
      await createCourse(values);
      setFormMode("closed");
      await load();
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
      await updateCourse(slug, values);
      setFormMode("closed");
      await load();
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
      await load();
    } catch (err) {
      setActionError(describeError(err));
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <div>
            <label htmlFor="course-search" className="sr-only">
              Search courses
            </label>
            <input
              id="course-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by title or summary…"
              className="form-input sm:w-72"
            />
          </div>
          <div>
            <label htmlFor="course-level" className="sr-only">
              Filter by level
            </label>
            <select
              id="course-level"
              value={level}
              onChange={(event) => {
                setLevel(event.target.value);
                setPage(1);
              }}
              className="form-input"
            >
              {LEVEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
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
          {search || level !== "All levels"
            ? "No courses match your search/filter."
            : "No courses are available yet — add the first one above."}
        </p>
      )}

      {loadState === "ready" && courses.length > 0 && (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
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

          {meta && meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4 font-body text-sm text-ink-900/70">
              <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={meta.page <= 1}>
                Previous
              </Button>
              <span>
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={meta.page >= meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
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
