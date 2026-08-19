// utils/slugify.js
//
// Turns a course title into a URL-safe slug, e.g. "Web Development!" ->
// "web-development". Used to generate ids for courses created via POST,
// mirroring the slugs the original static lib/courses.ts used by hand.

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // any run of non-alphanumerics -> single dash
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
}

module.exports = { slugify };
