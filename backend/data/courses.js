// data/courses.js
//
// All SQL for the courses table lives here — routes call these functions
// and never write SQL themselves. Rows come back from `pg` with snake_case
// columns; `mapCourse` translates each row into the camelCase shape the
// API (and frontend) expects, matching what the old in-memory version
// returned.

const { query } = require("../db/pool");
const { slugify } = require("../utils/slugify");
const { ApiError } = require("../utils/ApiError");

function mapCourse(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    level: row.level,
    durationWeeks: row.duration_weeks,
    instructorSlug: row.instructor_slug || "",
    instructorName: row.instructor_name || null,
    summary: row.summary,
    description: row.description,
    syllabus: row.syllabus || [],
    createdAt: row.created_at,
  };
}

const SELECT_BASE = `
  SELECT
    courses.*,
    instructors.slug AS instructor_slug,
    instructors.name AS instructor_name
  FROM courses
  LEFT JOIN instructors ON instructors.id = courses.instructor_id
`;

// Lists courses with optional category/level filters, a free-text search
// over title/summary, and pagination. Returns both the page of rows and
// the total count (needed to compute totalPages) in one round trip using
// a window function, rather than a second COUNT(*) query.
async function getAll({ category, level, search, limit, offset } = {}) {
  const conditions = [];
  const params = [];

  if (category) {
    params.push(category);
    conditions.push(`courses.category ILIKE $${params.length}`);
  }
  if (level) {
    params.push(level);
    conditions.push(`courses.level ILIKE $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(courses.title ILIKE $${params.length} OR courses.summary ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const sql = `
    SELECT courses.*, instructors.slug AS instructor_slug, instructors.name AS instructor_name,
           COUNT(*) OVER() AS total_count
    FROM courses
    LEFT JOIN instructors ON instructors.id = courses.instructor_id
    ${where}
    ORDER BY courses.created_at DESC, courses.id DESC
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  const { rows } = await query(sql, params);
  const total = rows[0] ? Number(rows[0].total_count) : 0;
  return { rows: rows.map(mapCourse), total };
}

async function getBySlug(slug) {
  const { rows } = await query(`${SELECT_BASE} WHERE courses.slug = $1`, [slug]);
  return rows[0] ? mapCourse(rows[0]) : undefined;
}

async function getById(id) {
  const { rows } = await query(`${SELECT_BASE} WHERE courses.id = $1`, [id]);
  return rows[0] ? mapCourse(rows[0]) : undefined;
}

async function resolveInstructorId(instructorSlug) {
  if (!instructorSlug) return null;
  const { rows } = await query("SELECT id FROM instructors WHERE slug = $1", [instructorSlug]);
  if (!rows[0]) {
    throw new ApiError(400, `Instructor "${instructorSlug}" does not exist`);
  }
  return rows[0].id;
}

async function uniqueSlugFromTitle(title) {
  const base = slugify(title) || "course";
  let slug = base;
  let suffix = 2;
  // Small tables, small course-creation volume — a loop is fine here
  // rather than a more clever single-query approach.
  while (true) {
    const { rows } = await query("SELECT 1 FROM courses WHERE slug = $1", [slug]);
    if (rows.length === 0) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function create(data) {
  const slug = await uniqueSlugFromTitle(data.title);
  const instructorId = await resolveInstructorId(data.instructorSlug);

  const { rows } = await query(
    `INSERT INTO courses (slug, title, category, level, duration_weeks, instructor_id, summary, description, syllabus)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      slug,
      data.title,
      data.category,
      data.level,
      data.durationWeeks,
      instructorId,
      data.summary,
      data.description || data.summary,
      data.syllabus || [],
    ]
  );

  return getById(rows[0].id);
}

// Partial update: only columns actually present in `data` are touched,
// built as a dynamic SET clause so a PUT with just { durationWeeks: 12 }
// doesn't overwrite the rest of the row.
async function update(slug, data) {
  const existing = await getBySlug(slug);
  if (!existing) return undefined;

  const fields = [];
  const params = [];

  const set = (column, value) => {
    params.push(value);
    fields.push(`${column} = $${params.length}`);
  };

  if (data.title !== undefined) set("title", data.title);
  if (data.category !== undefined) set("category", data.category);
  if (data.level !== undefined) set("level", data.level);
  if (data.durationWeeks !== undefined) set("duration_weeks", data.durationWeeks);
  if (data.summary !== undefined) set("summary", data.summary);
  if (data.description !== undefined) set("description", data.description);
  if (data.syllabus !== undefined) set("syllabus", data.syllabus);
  if (data.instructorSlug !== undefined) {
    set("instructor_id", await resolveInstructorId(data.instructorSlug));
  }

  if (fields.length === 0) return existing;

  params.push(slug);
  await query(`UPDATE courses SET ${fields.join(", ")} WHERE slug = $${params.length}`, params);

  return getBySlug(slug);
}

async function remove(slug) {
  const { rowCount } = await query("DELETE FROM courses WHERE slug = $1", [slug]);
  return rowCount > 0;
}

module.exports = { getAll, getBySlug, getById, create, update, remove };
