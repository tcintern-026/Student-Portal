// routes/students.js

const express = require("express");
const store = require("../data/students");
const { ApiError } = require("../utils/ApiError");
const { validateStudentCreate, validateStudentUpdate } = require("../middleware/validateStudent");

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/students
router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await store.getAll());
  })
);

// GET /api/students/:id
router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const student = await store.getById(req.params.id);
    if (!student) return next(new ApiError(404, `Student "${req.params.id}" not found`));
    res.json(student);
  })
);

// POST /api/students
router.post(
  "/",
  validateStudentCreate,
  asyncHandler(async (req, res) => {
    const student = await store.create(req.body);
    res.status(201).json(student);
  })
);

// PUT /api/students/:id
router.put(
  "/:id",
  validateStudentUpdate,
  asyncHandler(async (req, res, next) => {
    const updated = await store.update(req.params.id, req.body);
    if (!updated) return next(new ApiError(404, `Student "${req.params.id}" not found`));
    res.json(updated);
  })
);

// DELETE /api/students/:id
router.delete(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const removed = await store.remove(req.params.id);
    if (!removed) return next(new ApiError(404, `Student "${req.params.id}" not found`));
    res.status(204).send();
  })
);

module.exports = router;
