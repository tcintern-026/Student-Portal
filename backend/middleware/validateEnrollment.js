// middleware/validateEnrollment.js

function validateEnrollmentCreate(req, res, next) {
  const errors = [];
  const { studentEmail, courseSlug } = req.body || {};

  if (!studentEmail || typeof studentEmail !== "string") {
    errors.push("studentEmail is required");
  }
  if (!courseSlug || typeof courseSlug !== "string") {
    errors.push("courseSlug is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }
  next();
}

module.exports = { validateEnrollmentCreate };
