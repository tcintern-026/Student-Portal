// middleware/validateCourse.js
//
// Request validation for POST/PUT /api/courses. Kept dependency-free
// (no Joi/Zod) so the rules are easy to read end-to-end. Collects every
// problem instead of stopping at the first, so the client can show a
// full list of what's wrong in one round trip.

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

function validateCourseCreate(req, res, next) {
  const errors = collectErrors(req.body, { partial: false });
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }
  next();
}

function validateCourseUpdate(req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Validation failed", details: ["Request body cannot be empty"] });
  }
  const errors = collectErrors(req.body, { partial: true });
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }
  next();
}

function collectErrors(body = {}, { partial }) {
  const errors = [];
  const has = (field) => Object.prototype.hasOwnProperty.call(body, field);

  const requireString = (field, { required = !partial } = {}) => {
    if (!has(field)) {
      if (required) errors.push(`${field} is required`);
      return;
    }
    if (typeof body[field] !== "string" || body[field].trim() === "") {
      errors.push(`${field} must be a non-empty string`);
    }
  };

  requireString("title");
  requireString("category");
  requireString("summary");

  if (!partial || has("level")) {
    if (!has("level")) {
      errors.push("level is required");
    } else if (!LEVELS.includes(body.level)) {
      errors.push(`level must be one of: ${LEVELS.join(", ")}`);
    }
  }

  if (!partial || has("durationWeeks")) {
    if (!has("durationWeeks")) {
      errors.push("durationWeeks is required");
    } else if (typeof body.durationWeeks !== "number" || !Number.isFinite(body.durationWeeks) || body.durationWeeks <= 0) {
      errors.push("durationWeeks must be a positive number");
    }
  }

  if (has("syllabus") && !Array.isArray(body.syllabus)) {
    errors.push("syllabus must be an array of strings");
  }

  if (has("instructorSlug") && typeof body.instructorSlug !== "string") {
    errors.push("instructorSlug must be a string");
  }

  if (has("description") && typeof body.description !== "string") {
    errors.push("description must be a string");
  }

  return errors;
}

module.exports = { validateCourseCreate, validateCourseUpdate };
