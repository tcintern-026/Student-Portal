// app/courses/page.tsx
//
// This file living at app/courses/page.tsx is what makes "/courses" a route —
// the FOLDER NAME becomes the URL segment, no router config needed.
//
// Kept as a server component only for the `metadata` export; all the
// actual data-fetching/state lives in CourseCatalog (a client component),
// since it needs useState/useEffect to talk to the Express API.

import PageHeader from "@/components/PageHeader";
import CourseCatalog from "@/components/CourseCatalog";

export const metadata = {
  title: "Courses · Student Course Portal",
};

export default function CoursesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="All courses"
        description="Fetched live from the Express API — add, edit, or delete a course and it updates here."
      />
      <CourseCatalog />
    </>
  );
}
