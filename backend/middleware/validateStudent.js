// middleware/validateStudent.js

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStudentCreate(req, res, next) {
  const errors = collectErrors(req.body, { partial: false });
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }
  next();
}

function validateStudentUpdate(req, res, next) {
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

  if (!partial || has("name")) {
    if (!has("name")) errors.push("name is required");
    else if (typeof body.name !== "string" || body.name.trim() === "") errors.push("name must be a non-empty string");
  }

  if (!partial || has("email")) {
    if (!has("email")) errors.push("email is required");
    else if (typeof body.email !== "string" || !EMAIL_RE.test(body.email)) errors.push("email must be a valid email address");
  }

  return errors;
}

module.exports = { validateStudentCreate, validateStudentUpdate };
