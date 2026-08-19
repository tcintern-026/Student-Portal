// routes/courses.js
//
// The five endpoints from the challenge brief. Handlers stay thin —
// data/courses.js owns the actual storage/logic, and errors go through
// next(err) to the centralized handler in middleware/errorHandler.js.

const express = require("express");
const store = require("../data/courses");
const { ApiError } = require("../utils/ApiError");
const { validateCourseCreate, validateCourseUpdate } = require("../middleware/validateCourse");

const router = express.Router();

// GET /api/courses — list all courses, with optional ?category= and ?level= filters
router.get("/", (req, res) => {
  let results = store.getAll();

  const { category, level } = req.query;
  if (category) {
    results = results.filter((c) => c.category.toLowerCase() === String(category).toLowerCase());
  }
  if (level) {
    results = results.filter((c) => c.level.toLowerCase() === String(level).toLowerCase());
  }

  res.json(results);
});

// GET /api/courses/:id — single course
router.get("/:id", (req, res, next) => {
  const course = store.getById(req.params.id);
  if (!course) {
    return next(new ApiError(404, `Course "${req.params.id}" not found`));
  }
  res.json(course);
});

// POST /api/courses — create
router.post("/", validateCourseCreate, (req, res) => {
  const course = store.create(req.body);
  res.status(201).json(course);
});

// PUT /api/courses/:id — update (partial)
router.put("/:id", validateCourseUpdate, (req, res, next) => {
  const updated = store.update(req.params.id, req.body);
  if (!updated) {
    return next(new ApiError(404, `Course "${req.params.id}" not found`));
  }
  res.json(updated);
});

// DELETE /api/courses/:id — delete
router.delete("/:id", (req, res, next) => {
  const removed = store.remove(req.params.id);
  if (!removed) {
    return next(new ApiError(404, `Course "${req.params.id}" not found`));
  }
  res.status(204).send();
});

module.exports = router;
