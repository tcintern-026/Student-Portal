// data/enrollments.js
//
// Enrollments is the join table linking students <-> courses. Every read
// joins back to both tables so the API returns something useful (student
// name/email, course title/slug) instead of bare foreign keys.

const { query } = require("../db/pool");
const { ApiError } = require("../utils/ApiError");

function mapEnrollment(row) {
  return {
    id: row.id,
    enrolledAt: row.enrolled_at,
    student: {
      id: row.student_id,
      name: row.student_name,
      email: row.student_email,
    },
    course: {
      id: row.course_id,
      slug: row.course_slug,
      title: row.course_title,
    },
  };
}

const SELECT_BASE = `
  SELECT
    enrollments.*,
    students.name AS student_name, students.email AS student_email,
    courses.slug AS course_slug, courses.title AS course_title
  FROM enrollments
  JOIN students ON students.id = enrollments.student_id
  JOIN courses ON courses.id = enrollments.course_id
`;

// Optional filters: by student id or by course slug — useful for "which
// courses is this student in" / "who's enrolled in this course".
async function getAll({ studentId, courseSlug } = {}) {
  const conditions = [];
  const params = [];

  if (studentId) {
    params.push(studentId);
    conditions.push(`enrollments.student_id = $${params.length}`);
  }
  if (courseSlug) {
    params.push(courseSlug);
    conditions.push(`courses.slug = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await query(
    `${SELECT_BASE} ${where} ORDER BY enrollments.enrolled_at DESC`,
    params
  );
  return rows.map(mapEnrollment);
}

async function getById(id) {
  const { rows } = await query(`${SELECT_BASE} WHERE enrollments.id = $1`, [id]);
  return rows[0] ? mapEnrollment(rows[0]) : undefined;
}

// Enrolls a student in a course by their natural identifiers (email +
// course slug) rather than raw ids, since that's what a client actually
// has on hand. Raises a 400 via ApiError-shaped errors if either doesn't
// exist, and lets the DB's UNIQUE(student_id, course_id) constraint
// catch a duplicate enrollment as a 409 (see middleware/errorHandler.js).
async function create({ studentEmail, courseSlug }) {
  const { rows: studentRows } = await query("SELECT id FROM students WHERE email = $1", [studentEmail]);
  if (!studentRows[0]) {
    throw new ApiError(400, `Student "${studentEmail}" does not exist`);
  }

  const { rows: courseRows } = await query("SELECT id FROM courses WHERE slug = $1", [courseSlug]);
  if (!courseRows[0]) {
    throw new ApiError(400, `Course "${courseSlug}" does not exist`);
  }

  const { rows } = await query(
    `INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING id`,
    [studentRows[0].id, courseRows[0].id]
  );
  return getById(rows[0].id);
}

async function remove(id) {
  const { rowCount } = await query("DELETE FROM enrollments WHERE id = $1", [id]);
  return rowCount > 0;
}

module.exports = { getAll, getById, create, remove };
