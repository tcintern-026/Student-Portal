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

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;

  if (statusCode === 500) {
    // Only log the full stack for unexpected errors — validation/404s are routine.
    console.error(err);
  }

  const body = { error: message };
  if (err.details) body.details = err.details;
  res.status(statusCode).json(body);
}

module.exports = { notFoundHandler, errorHandler };
