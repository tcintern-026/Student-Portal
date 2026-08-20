// middleware/errorHandler.js
//
// Centralized error handling: every route hands its errors to next(err)
// instead of formatting a response itself, and this single place decides
// the status code + JSON shape. Must be registered LAST, after all routes
// (Express recognizes it as an error handler by its 4-argument signature).

const { ApiError } = require("../utils/ApiError");

function notFoundHandler(req, res, next) {
  next(new ApiError(404, `No route matches ${req.method} ${req.originalUrl}`));
}

// Maps a handful of common Postgres error codes to an ApiError, so a raw
// driver error (e.g. a UNIQUE violation from a race condition, or a bad
// FK) still comes back as a clean 4xx instead of leaking as a 500.
// https://www.postgresql.org/docs/current/errcodes-appendix.html
function fromPgError(err) {
  switch (err.code) {
    case "23505": // unique_violation
      return new ApiError(409, "A record with that value already exists.");
    case "23503": // foreign_key_violation
      return new ApiError(400, "Referenced record does not exist.");
    case "23502": // not_null_violation
      return new ApiError(400, `${err.column || "A required field"} cannot be empty.`);
    case "22P02": // invalid_text_representation (e.g. bad integer id in a query)
      return new ApiError(400, "Invalid id or value format.");
    default:
      return null;
  }
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const pgError = err.code ? fromPgError(err) : null;
  const resolved = err instanceof ApiError ? err : pgError || err;

  const statusCode =
    resolved instanceof ApiError
      ? resolved.statusCode
      : Number.isInteger(resolved.statusCode) && resolved.statusCode >= 400 && resolved.statusCode < 600
        ? resolved.statusCode
        : 500;
  const message = statusCode === 500 ? "Internal server error" : resolved.message;

  if (statusCode === 500) {
    // Only log the full stack for unexpected errors — validation/404s are routine.
    console.error(err);
  }

  const body = { error: message };
  if (resolved.details) body.details = resolved.details;
  res.status(statusCode).json(body);
}

module.exports = { notFoundHandler, errorHandler };
