// db/pool.js
//
// One shared connection pool for the whole app — routes import `query()`
// from here instead of each opening their own client. DATABASE_URL comes
// from .env (see .env.example); Neon (and most hosted Postgres) require
// SSL, which the `ssl` option below turns on without needing a local CA
// certificate.

require("dotenv").config();
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy backend/.env.example to backend/.env and fill in your Neon connection string."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.PGSSL === "false"
      ? false
      : { rejectUnauthorized: false }, // Neon's certs aren't in Node's default trust store
});

pool.on("error", (err) => {
  // Fires for errors on idle clients in the pool (e.g. the DB restarting) —
  // logging here avoids a raw unhandled-rejection crash for something that
  // isn't tied to any single request.
  console.error("Unexpected error on idle Postgres client", err);
});

// Thin wrapper so callers don't import `pg` directly — keeps the door
// open to swapping drivers later without touching every query call site.
function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
