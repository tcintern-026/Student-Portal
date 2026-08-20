// middleware/validateInstructor.js

function validateInstructorCreate(req, res, next) {
  const errors = collectErrors(req.body, { partial: false });
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }
  next();
}

function validateInstructorUpdate(req, res, next) {
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

  if (has("title") && typeof body.title !== "string") errors.push("title must be a string");
  if (has("bio") && typeof body.bio !== "string") errors.push("bio must be a string");

  return errors;
}

module.exports = { validateInstructorCreate, validateInstructorUpdate };
