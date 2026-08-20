// routes/courses.js
//
// GET / supports ?category=, ?level=, ?search=, ?page=, ?limit= — see
// utils/pagination.js for the page/limit parsing and data/courses.js for
// the actual SQL. Every handler is async and wrapped so a thrown/rejected
// error reaches next(err) and the centralized error handler, rather than
// crashing the process (Express 4 doesn't auto-catch async errors).

const express = require("express");
const store = require("../data/courses");
const { ApiError } = require("../utils/ApiError");
const { validateCourseCreate, validateCourseUpdate } = require("../middleware/validateCourse");
const { parsePagination, buildMeta } = require("../utils/pagination");

const router = express.Router();

// Wraps an async handler so rejected promises go to next(err) instead of
// being swallowed / crashing the server.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/courses — list, with filtering, search, and pagination
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category, level, search } = req.query;
    const { page, limit, offset } = parsePagination(req.query);

    const { rows, total } = await store.getAll({ category, level, search, limit, offset });

    res.json({ data: rows, meta: buildMeta({ page, limit, total }) });
  })
);

// GET /api/courses/:slug
router.get(
  "/:slug",
  asyncHandler(async (req, res, next) => {
    const course = await store.getBySlug(req.params.slug);
    if (!course) return next(new ApiError(404, `Course "${req.params.slug}" not found`));
    res.json(course);
  })
);

// POST /api/courses
router.post(
  "/",
  validateCourseCreate,
  asyncHandler(async (req, res) => {
    const course = await store.create(req.body);
    res.status(201).json(course);
  })
);

// PUT /api/courses/:slug — partial update
router.put(
  "/:slug",
  validateCourseUpdate,
  asyncHandler(async (req, res, next) => {
    const updated = await store.update(req.params.slug, req.body);
    if (!updated) return next(new ApiError(404, `Course "${req.params.slug}" not found`));
    res.json(updated);
  })
);

// DELETE /api/courses/:slug
router.delete(
  "/:slug",
  asyncHandler(async (req, res, next) => {
    const removed = await store.remove(req.params.slug);
    if (!removed) return next(new ApiError(404, `Course "${req.params.slug}" not found`));
    res.status(204).send();
  })
);

module.exports = router;
