// lib/courses.ts
//
// Course data lives on its own so it can grow (or get swapped for a real
// fetch() call to an API) independently of instructor data — the two
// change for different reasons and shouldn't be edited in the same file.

export type Course = {
  slug: string; // used for the dynamic route: /courses/[slug]
  title: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  durationWeeks: number;
  instructorSlug: string;
  instructorName?: string | null; // populated by the API via a join; absent on the static seed data below
  summary: string;
  description: string;
  syllabus: string[];
};

export const courses: Course[] = [
  {
    slug: "web-development",
    title: "Web Development",
    category: "Software Engineering",
    level: "Beginner",
    durationWeeks: 10,
    instructorSlug: "amina-khan",
    summary: "HTML, CSS, and JavaScript fundamentals through to a deployed full-stack app.",
    description:
      "A project-driven introduction to building for the web. Starts with semantic HTML and CSS layout, moves through JavaScript and the DOM, and ends with a full-stack app built on a modern framework and deployed to production.",
    syllabus: [
      "Semantic HTML & responsive CSS",
      "JavaScript fundamentals & the DOM",
      "Working with APIs and JSON",
      "Introduction to React",
      "Full-stack project & deployment",
    ],
  },
  {
    slug: "ai-engineering",
    title: "AI Engineering",
    category: "Artificial Intelligence",
    level: "Intermediate",
    durationWeeks: 12,
    instructorSlug: "hassan-raza",
    summary: "Practical machine learning: from datasets to deployed models.",
    description:
      "Covers the applied ML workflow used in industry: cleaning and exploring data, training and evaluating models, and packaging a model behind an API. Assumes basic Python.",
    syllabus: [
      "Python for data & ML",
      "Supervised learning fundamentals",
      "Neural networks & training loops",
      "Working with pretrained models",
      "Deploying a model behind an API",
    ],
  },
  {
    slug: "cybersecurity-fundamentals",
    title: "Cybersecurity Fundamentals",
    category: "Cybersecurity",
    level: "Beginner",
    durationWeeks: 8,
    instructorSlug: "sara-malik",
    summary: "Core security concepts, common attack patterns, and defensive practice.",
    description:
      "An entry point into security: how networks and systems get attacked, how to think like both attacker and defender, and how to apply that thinking in real codebases and infrastructure.",
    syllabus: [
      "Threat modeling basics",
      "Network security fundamentals",
      "Common web vulnerabilities (OWASP Top 10)",
      "Authentication & access control",
      "Incident response basics",
    ],
  },
  {
    slug: "applied-cryptography",
    title: "Applied Cryptography",
    category: "Cybersecurity",
    level: "Advanced",
    durationWeeks: 10,
    instructorSlug: "sara-malik",
    summary: "How the cryptographic primitives behind everyday security actually work.",
    description:
      "A hands-on look at the primitives underneath TLS, password storage, and secure messaging — symmetric and asymmetric encryption, hashing, and signatures — with an emphasis on correct real-world usage over pure theory.",
    syllabus: [
      "Symmetric encryption (AES, block modes)",
      "Public-key cryptography (RSA, ECC)",
      "Hashing & password storage",
      "Digital signatures & certificates",
      "Common cryptographic pitfalls",
    ],
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getCoursesByInstructor(instructorSlug: string): Course[] {
  return courses.filter((c) => c.instructorSlug === instructorSlug);
}

export function getRelatedCourses(course: Course, limit = 3): Course[] {
  return courses
    .filter((c) => c.category === course.category && c.slug !== course.slug)
    .slice(0, limit);
}
