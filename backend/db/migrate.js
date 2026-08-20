// db/migrate.js
//
// Run with: npm run migrate
// Applies schema.sql against whatever DATABASE_URL points at. Every
// statement in schema.sql is IF NOT EXISTS, so running this more than
// once is harmless.

const fs = require("fs");
const path = require("path");
const { pool } = require("./pool");

async function migrate() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  console.log("Applying schema.sql...");
  await pool.query(sql);
  console.log("Schema is up to date.");

  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
