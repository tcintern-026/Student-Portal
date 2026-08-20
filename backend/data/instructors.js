// data/instructors.js
//
// Same pattern as data/courses.js: routes never touch SQL directly.

const { query } = require("../db/pool");
const { slugify } = require("../utils/slugify");

function mapInstructor(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    title: row.title,
    bio: row.bio,
    createdAt: row.created_at,
  };
}

async function getAll() {
  const { rows } = await query("SELECT * FROM instructors ORDER BY name ASC");
  return rows.map(mapInstructor);
}

async function getBySlug(slug) {
  const { rows } = await query("SELECT * FROM instructors WHERE slug = $1", [slug]);
  return rows[0] ? mapInstructor(rows[0]) : undefined;
}

async function uniqueSlugFromName(name) {
  const base = slugify(name) || "instructor";
  let slug = base;
  let suffix = 2;
  while (true) {
    const { rows } = await query("SELECT 1 FROM instructors WHERE slug = $1", [slug]);
    if (rows.length === 0) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function create(data) {
  const slug = await uniqueSlugFromName(data.name);
  const { rows } = await query(
    `INSERT INTO instructors (slug, name, title, bio) VALUES ($1, $2, $3, $4) RETURNING *`,
    [slug, data.name, data.title || "", data.bio || ""]
  );
  return mapInstructor(rows[0]);
}

async function update(slug, data) {
  const existing = await getBySlug(slug);
  if (!existing) return undefined;

  const fields = [];
  const params = [];
  const set = (column, value) => {
    params.push(value);
    fields.push(`${column} = $${params.length}`);
  };

  if (data.name !== undefined) set("name", data.name);
  if (data.title !== undefined) set("title", data.title);
  if (data.bio !== undefined) set("bio", data.bio);

  if (fields.length === 0) return existing;

  params.push(slug);
  const { rows } = await query(
    `UPDATE instructors SET ${fields.join(", ")} WHERE slug = $${params.length} RETURNING *`,
    params
  );
  return mapInstructor(rows[0]);
}

async function remove(slug) {
  // Courses referencing this instructor keep existing (instructor_id
  // is ON DELETE SET NULL), they just lose their instructor link.
  const { rowCount } = await query("DELETE FROM instructors WHERE slug = $1", [slug]);
  return rowCount > 0;
}

module.exports = { getAll, getBySlug, create, update, remove };
