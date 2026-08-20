// lib/api.ts
//
// Every fetch() call to the Express backend goes through here, so the
// base URL, error handling, and JSON parsing live in one place instead
// of being copy-pasted into every component that needs course data.

import type { Course } from "@/lib/courses";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  status: number;
  details?: string[];

  constructor(status: number, message: string, details?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// Shape accepted when creating/updating a course from a form — id/slug
// are server-generated, so they're excluded here.
export type CourseInput = Omit<Course, "slug"> & { slug?: string };

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CoursesQuery = {
  category?: string;
  level?: string;
  search?: string;
  page?: number;
  limit?: number;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    // Typically DNS/connection failure — the API is unreachable entirely.
    throw new ApiError(0, "Could not reach the API. Is the backend server running?");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.error || `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, body?.details);
  }

  return body as T;
}

// GET /api/courses is paginated — returns a page of courses plus meta
// (page/limit/total/totalPages) rather than a bare array, so callers can
// build pagination controls without a separate count request.
export function getCourses(params: CoursesQuery = {}): Promise<{ data: Course[]; meta: PaginationMeta }> {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.level) search.set("level", params.level);
  if (params.search) search.set("search", params.search);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));

  const qs = search.toString();
  return request(`/courses${qs ? `?${qs}` : ""}`);
}

export function getCourse(slug: string): Promise<Course> {
  return request<Course>(`/courses/${slug}`);
}

export function createCourse(data: Partial<CourseInput>): Promise<Course> {
  return request<Course>("/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCourse(slug: string, data: Partial<CourseInput>): Promise<Course> {
  return request<Course>(`/courses/${slug}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCourse(slug: string): Promise<void> {
  return request<void>(`/courses/${slug}`, {
    method: "DELETE",
  });
}
