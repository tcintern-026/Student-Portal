// server.js
//
// Entry point. Wires together CORS, JSON parsing, the /api/courses
// router, and the centralized 404 + error handlers (in that order —
// error handlers must be registered last).

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const coursesRouter = require("./routes/courses");
const instructorsRouter = require("./routes/instructors");
const studentsRouter = require("./routes/students");
const enrollmentsRouter = require("./routes/enrollments");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4000;

// Support one origin or a comma-separated list in CLIENT_ORIGIN.
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/courses", coursesRouter);
app.use("/api/instructors", instructorsRouter);
app.use("/api/students", studentsRouter);
app.use("/api/enrollments", enrollmentsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Student Portal API listening on http://localhost:${PORT}`);
});
