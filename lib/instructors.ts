// lib/instructors.ts
//
// Kept separate from lib/courses.ts on purpose: instructor bios/titles
// change independently of course content, and this file has zero
// knowledge of courses — it's courses that reference an instructorSlug,
// not the other way around, so there's no circular import.

export type Instructor = {
  slug: string;
  name: string;
  title: string;
  bio: string;
};

export const instructors: Instructor[] = [
  {
    slug: "amina-khan",
    name: "Dr. Amina Khan",
    title: "Associate Professor, Web & Cloud Systems",
    bio: "Amina spent six years building developer platforms before moving into teaching. She focuses on getting students from 'hello world' to shipped projects fast.",
  },
  {
    slug: "hassan-raza",
    name: "Hassan Raza",
    title: "Lead Instructor, Artificial Intelligence",
    bio: "Hassan researches applied machine learning and leads the AI Engineering track, with an emphasis on building intuition before diving into the math.",
  },
  {
    slug: "sara-malik",
    name: "Sara Malik",
    title: "Senior Instructor, Cybersecurity",
    bio: "Sara previously worked as a security analyst and now teaches offensive and defensive security fundamentals through hands-on labs.",
  },
];

export function getInstructorBySlug(slug: string): Instructor | undefined {
  return instructors.find((i) => i.slug === slug);
}
