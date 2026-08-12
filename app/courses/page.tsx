// app/courses/page.tsx
//
// This file living at app/courses/page.tsx is what makes "/courses" a route —
// the FOLDER NAME becomes the URL segment, no router config needed.

import PageHeader from "@/components/PageHeader";
import CourseSearch from "@/components/CourseSearch";
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
      {/* Course data is fetched/rendered here on the server; CourseSearch
          (a client component) only owns the search-input state and the
          filtering, so we're not shipping the whole page as client JS. */}
      <CourseSearch courses={courses} />
    </>
  );
}
