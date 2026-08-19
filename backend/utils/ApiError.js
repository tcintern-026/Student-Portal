// utils/ApiError.js
//
// A plain Error subclass carrying an HTTP status code, so route handlers
// can `next(new ApiError(404, "Course not found"))` and the centralized
// error-handling middleware (middleware/errorHandler.js) knows exactly
// what status + message to send back — no res.status().json() scattered
// through every route.

class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details; // optional array of field-level validation errors
  }
}

module.exports = { ApiError };
