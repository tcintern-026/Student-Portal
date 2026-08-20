// routes/instructors.js

const express = require("express");
const store = require("../data/instructors");
const { ApiError } = require("../utils/ApiError");
const { validateInstructorCreate, validateInstructorUpdate } = require("../middleware/validateInstructor");

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/instructors
router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await store.getAll());
  })
);

// GET /api/instructors/:slug
router.get(
  "/:slug",
  asyncHandler(async (req, res, next) => {
    const instructor = await store.getBySlug(req.params.slug);
    if (!instructor) return next(new ApiError(404, `Instructor "${req.params.slug}" not found`));
    res.json(instructor);
  })
);

// POST /api/instructors
router.post(
  "/",
  validateInstructorCreate,
  asyncHandler(async (req, res) => {
    const instructor = await store.create(req.body);
    res.status(201).json(instructor);
  })
);

// PUT /api/instructors/:slug
router.put(
  "/:slug",
  validateInstructorUpdate,
  asyncHandler(async (req, res, next) => {
    const updated = await store.update(req.params.slug, req.body);
    if (!updated) return next(new ApiError(404, `Instructor "${req.params.slug}" not found`));
    res.json(updated);
  })
);

// DELETE /api/instructors/:slug
router.delete(
  "/:slug",
  asyncHandler(async (req, res, next) => {
    const removed = await store.remove(req.params.slug);
    if (!removed) return next(new ApiError(404, `Instructor "${req.params.slug}" not found`));
    res.status(204).send();
  })
);

module.exports = router;
