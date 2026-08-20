// data/students.js

const { query } = require("../db/pool");

function mapStudent(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
  };
}

async function getAll() {
  const { rows } = await query("SELECT * FROM students ORDER BY name ASC");
  return rows.map(mapStudent);
}

async function getById(id) {
  const { rows } = await query("SELECT * FROM students WHERE id = $1", [id]);
  return rows[0] ? mapStudent(rows[0]) : undefined;
}

async function create(data) {
  const { rows } = await query(
    `INSERT INTO students (email, name) VALUES ($1, $2) RETURNING *`,
    [data.email, data.name]
  );
  return mapStudent(rows[0]);
}

async function update(id, data) {
  const existing = await getById(id);
  if (!existing) return undefined;

  const fields = [];
  const params = [];
  const set = (column, value) => {
    params.push(value);
    fields.push(`${column} = $${params.length}`);
  };

  if (data.email !== undefined) set("email", data.email);
  if (data.name !== undefined) set("name", data.name);

  if (fields.length === 0) return existing;

  params.push(id);
  const { rows } = await query(
    `UPDATE students SET ${fields.join(", ")} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return mapStudent(rows[0]);
}

async function remove(id) {
  // Enrollments for this student are removed automatically (ON DELETE CASCADE).
  const { rowCount } = await query("DELETE FROM students WHERE id = $1", [id]);
  return rowCount > 0;
}

module.exports = { getAll, getById, create, update, remove };
