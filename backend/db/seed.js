// db/seed.js
//
// Run with: npm run seed
// Populates instructors + courses with the same content the frontend
// used to ship as static data, plus a couple of sample students/
// enrollments so GET endpoints have something to return immediately.
// Uses ON CONFLICT DO NOTHING on the natural unique keys (slug/email),
// so re-running this is safe and won't duplicate rows.

const { pool } = require("./pool");

const instructors = [
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

const courses = [
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

const students = [
  { email: "aiman.raza@example.com", name: "Aiman Raza" },
  { email: "bilal.tariq@example.com", name: "Bilal Tariq" },
];

// [studentEmail, courseSlug] pairs
const enrollments = [
  ["aiman.raza@example.com", "web-development"],
  ["aiman.raza@example.com", "cybersecurity-fundamentals"],
  ["bilal.tariq@example.com", "ai-engineering"],
];

async function seed() {
  for (const instructor of instructors) {
    await pool.query(
      `INSERT INTO instructors (slug, name, title, bio)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO NOTHING`,
      [instructor.slug, instructor.name, instructor.title, instructor.bio]
    );
  }
  console.log(`Seeded ${instructors.length} instructors.`);

  for (const course of courses) {
    const { rows } = await pool.query("SELECT id FROM instructors WHERE slug = $1", [course.instructorSlug]);
    const instructorId = rows[0]?.id ?? null;

    await pool.query(
      `INSERT INTO courses (slug, title, category, level, duration_weeks, instructor_id, summary, description, syllabus)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (slug) DO NOTHING`,
      [
        course.slug,
        course.title,
        course.category,
        course.level,
        course.durationWeeks,
        instructorId,
        course.summary,
        course.description,
        course.syllabus,
      ]
    );
  }
  console.log(`Seeded ${courses.length} courses.`);

  for (const student of students) {
    await pool.query(
      `INSERT INTO students (email, name) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING`,
      [student.email, student.name]
    );
  }
  console.log(`Seeded ${students.length} students.`);

  for (const [email, slug] of enrollments) {
    await pool.query(
      `INSERT INTO enrollments (student_id, course_id)
       SELECT s.id, c.id FROM students s, courses c
       WHERE s.email = $1 AND c.slug = $2
       ON CONFLICT (student_id, course_id) DO NOTHING`,
      [email, slug]
    );
  }
  console.log(`Seeded ${enrollments.length} enrollments.`);

  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
