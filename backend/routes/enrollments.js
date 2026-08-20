// routes/enrollments.js
//
// Create/list/delete only — an enrollment either exists or doesn't,
// there's no meaningful partial update to "editing" an enrollment record
// itself (re-enrolling is just delete + create).

const express = require("express");
const store = require("../data/enrollments");
const { ApiError } = require("../utils/ApiError");
const { validateEnrollmentCreate } = require("../middleware/validateEnrollment");

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/enrollments — optional ?studentId= or ?courseSlug= filters
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { studentId, courseSlug } = req.query;
    res.json(await store.getAll({ studentId, courseSlug }));
  })
);

// POST /api/enrollments — body: { studentEmail, courseSlug }
router.post(
  "/",
  validateEnrollmentCreate,
  asyncHandler(async (req, res) => {
    const enrollment = await store.create(req.body);
    res.status(201).json(enrollment);
  })
);

// DELETE /api/enrollments/:id — unenroll
router.delete(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const removed = await store.remove(req.params.id);
    if (!removed) return next(new ApiError(404, `Enrollment "${req.params.id}" not found`));
    res.status(204).send();
  })
);

module.exports = router;
