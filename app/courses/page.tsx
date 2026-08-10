// app/courses/page.tsx
//
// This file living at app/courses/page.tsx is what makes "/courses" a route —
// the FOLDER NAME becomes the URL segment, no router config needed.

import PageHeader from "@/components/PageHeader";
import CourseCard from "@/components/CourseCard";
import { courses } from "@/lib/data";

export const metadata = {
  title: "Courses · Student Course Portal",
};

export default function CoursesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="All courses"
        description="Static data for now — this list will come from an API once a backend exists."
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </>
  );
}
