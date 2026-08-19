// components/CourseForm.tsx
//
// Controlled form used for both "add" and "edit" — pass `initialCourse`
// to pre-fill it for editing, or leave it undefined for a blank add form.
// Doesn't call the API itself; it just collects/validates input and hands
// the finished object to `onSubmit`, so the parent decides whether that
// means createCourse() or updateCourse().

"use client";

import { useState, type FormEvent } from "react";
import type { Course } from "@/lib/courses";
import Button from "@/components/Button";

const LEVELS: Course["level"][] = ["Beginner", "Intermediate", "Advanced"];

export type CourseFormValues = {
  title: string;
  category: string;
  level: Course["level"];
  durationWeeks: number;
  instructorSlug: string;
  summary: string;
  description: string;
  syllabus: string[];
};

function toFormValues(course?: Course): CourseFormValues {
  return {
    title: course?.title ?? "",
    category: course?.category ?? "",
    level: course?.level ?? "Beginner",
    durationWeeks: course?.durationWeeks ?? 4,
    instructorSlug: course?.instructorSlug ?? "",
    summary: course?.summary ?? "",
    description: course?.description ?? "",
    syllabus: course?.syllabus ?? [],
  };
}

export default function CourseForm({
  initialCourse,
  submitLabel,
  submitting,
  onSubmit,
  onCancel,
}: {
  initialCourse?: Course;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: CourseFormValues) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<CourseFormValues>(() => toFormValues(initialCourse));
  const [syllabusText, setSyllabusText] = useState(() => (initialCourse?.syllabus ?? []).join("\n"));
  const [formError, setFormError] = useState<string | null>(null);

  function update<K extends keyof CourseFormValues>(key: K, value: CourseFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!values.title.trim() || !values.category.trim() || !values.summary.trim()) {
      setFormError("Title, category, and summary are required.");
      return;
    }
    if (!Number.isFinite(values.durationWeeks) || values.durationWeeks <= 0) {
      setFormError("Duration must be a positive number of weeks.");
      return;
    }

    const syllabus = syllabusText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    onSubmit({ ...values, syllabus });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-4 rounded-lg border border-ink-900/10 bg-white p-6"
    >
      {formError && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 font-body text-sm text-red-700">
          {formError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <input
            className="form-input"
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />
        </Field>
        <Field label="Category">
          <input
            className="form-input"
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            required
          />
        </Field>
        <Field label="Level">
          <select
            className="form-input"
            value={values.level}
            onChange={(e) => update("level", e.target.value as Course["level"])}
          >
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Duration (weeks)">
          <input
            type="number"
            min={1}
            className="form-input"
            value={values.durationWeeks}
            onChange={(e) => update("durationWeeks", Number(e.target.value))}
            required
          />
        </Field>
        <Field label="Instructor slug (optional)">
          <input
            className="form-input"
            value={values.instructorSlug}
            onChange={(e) => update("instructorSlug", e.target.value)}
            placeholder="e.g. sara-malik"
          />
        </Field>
      </div>

      <Field label="Summary">
        <input
          className="form-input"
          value={values.summary}
          onChange={(e) => update("summary", e.target.value)}
          required
        />
      </Field>

      <Field label="Description (optional)">
        <textarea
          className="form-input"
          rows={3}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>

      <Field label="Syllabus (one item per line, optional)">
        <textarea
          className="form-input"
          rows={4}
          value={syllabusText}
          onChange={(e) => setSyllabusText(e.target.value)}
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-body text-xs font-medium uppercase tracking-wide text-ink-900/60">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
