/* ============================================
   ALUMNI ROUTE
   Handles alumni registration and KIDA membership
   ============================================ */

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("../database");

// Validation rules
const validateAlumni = [
  body("name").notEmpty().withMessage("Name is required").trim().escape(),
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("graduation_year")
    .optional()
    .isInt({ min: 1952, max: 2026 })
    .withMessage("Invalid graduation year"),
  body("phone").optional().trim(),
  body("occupation").optional().trim(),
  body("location").optional().trim(),
];

// POST /api/alumni/register - Register as alumni (KIDA member)
router.post("/register", validateAlumni, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { name, email, phone, graduation_year, occupation, location } =
    req.body;

  db.run(
    `INSERT OR IGNORE INTO alumni_registrations (name, email, phone, graduation_year, occupation, location, registered_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      name,
      email,
      phone || null,
      graduation_year || null,
      occupation || null,
      location || null,
    ],
    function (err) {
      if (err) {
        console.error("Alumni registration error:", err);
        return res.status(500).json({ error: "Failed to register" });
      }

      if (this.changes === 0) {
        return res.status(400).json({
          error:
            "Email already registered. Please contact KIDA for assistance.",
        });
      }

      console.log(
        `🎓 New KIDA registration: ${name} (${graduation_year || "Year not specified"})`,
      );

      res.json({
        success: true,
        message:
          "Successfully registered as KIDA member! Welcome home, Kibabiian!",
        member_id: this.lastID,
      });
    },
  );
});

// GET /api/alumni - Get all registered alumni (public)
router.get("/", (req, res) => {
  db.all(
    `SELECT id, name, graduation_year, occupation, location, registered_at 
            FROM alumni_registrations ORDER BY registered_at DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, alumni: rows });
    },
  );
});

// GET /api/alumni/stats - Get alumni statistics
router.get("/stats", (req, res) => {
  const stats = {};

  db.get(`SELECT COUNT(*) as total FROM alumni_registrations`, (err, row) => {
    stats.total = row ? row.total : 0;

    db.all(
      `SELECT graduation_year, COUNT(*) as count FROM alumni_registrations 
                WHERE graduation_year IS NOT NULL GROUP BY graduation_year ORDER BY graduation_year DESC`,
      (err, rows) => {
        stats.by_year = rows || [];

        db.all(
          `SELECT occupation, COUNT(*) as count FROM alumni_registrations 
                        WHERE occupation IS NOT NULL GROUP BY occupation ORDER BY count DESC LIMIT 10`,
          (err, rows) => {
            stats.by_occupation = rows || [];

            res.json({ success: true, stats });
          },
        );
      },
    );
  });
});

module.exports = router;
