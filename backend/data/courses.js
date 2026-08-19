// data/courses.js
//
// In-memory "database". Same shape as the old frontend lib/courses.ts,
// with a top-level `id` field added (== slug) so routes can talk about
// "/api/courses/:id" without caring that the id happens to look like a
// slug. Swap this module for a real DB layer later without touching the
// route handlers, since they only call the functions exported here.

const { slugify } = require("../utils/slugify");

let courses = [
  {
    id: "web-development",
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
    id: "ai-engineering",
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
    id: "cybersecurity-fundamentals",
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
    id: "applied-cryptography",
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

function getAll() {
  return courses;
}

function getById(id) {
  return courses.find((c) => c.id === id);
}

function uniqueIdFromTitle(title) {
  const base = slugify(title) || "course";
  let id = base;
  let suffix = 2;
  while (courses.some((c) => c.id === id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

function create(data) {
  const id = uniqueIdFromTitle(data.title);
  const course = {
    id,
    slug: id,
    title: data.title,
    category: data.category,
    level: data.level,
    durationWeeks: data.durationWeeks,
    instructorSlug: data.instructorSlug || "",
    summary: data.summary,
    description: data.description || data.summary,
    syllabus: Array.isArray(data.syllabus) ? data.syllabus : [],
  };
  courses.push(course);
  return course;
}

function update(id, data) {
  const index = courses.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  // Partial update: only overwrite fields that were actually sent, so a
  // PUT with just { durationWeeks: 12 } doesn't blank out the rest.
  const existing = courses[index];
  const updated = {
    ...existing,
    ...data,
    id: existing.id, // id/slug never change via update
    slug: existing.slug,
  };
  courses[index] = updated;
  return updated;
}

function remove(id) {
  const index = courses.findIndex((c) => c.id === id);
  if (index === -1) return false;
  courses.splice(index, 1);
  return true;
}

module.exports = { getAll, getById, create, update, remove };
