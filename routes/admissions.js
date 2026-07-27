/* ============================================
   ADMISSIONS ROUTE
   Handles admission applications
   ============================================ */

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("../database");

// Validation rules
const validateAdmission = [
  body("full_name")
    .notEmpty()
    .withMessage("Full name is required")
    .trim()
    .escape(),
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("phone").notEmpty().withMessage("Phone number is required").trim(),
  body("admission_type")
    .notEmpty()
    .withMessage("Admission type is required")
    .trim(),
  body("previous_school").optional().trim(),
  body("kcpe_score")
    .optional()
    .isInt({ min: 0, max: 500 })
    .withMessage("Invalid KCPE score"),
  body("message").optional().trim(),
];

// POST /api/admissions - Submit admission application
router.post("/", validateAdmission, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const {
    full_name,
    email,
    phone,
    admission_type,
    previous_school,
    kcpe_score,
    message,
  } = req.body;

  db.run(
    `INSERT INTO admissions (full_name, email, phone, admission_type, previous_school, kcpe_score, message, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      full_name,
      email,
      phone,
      admission_type,
      previous_school || null,
      kcpe_score || null,
      message || null,
    ],
    function (err) {
      if (err) {
        console.error("Admission save error:", err);
        return res.status(500).json({ error: "Failed to submit application" });
      }

      console.log(
        `📋 New admission application from ${full_name} (${admission_type})`,
      );

      res.json({
        success: true,
        message:
          "Application submitted successfully! Our admissions office will contact you within 3 business days.",
        application_id: this.lastID,
      });
    },
  );
});

// GET /api/admissions - Get all applications (admin only)
router.get("/", (req, res) => {
  db.all(`SELECT * FROM admissions ORDER BY submitted_at DESC`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, applications: rows });
  });
});

// GET /api/admissions/:id - Get single application
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM admissions WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.json({ success: true, application: row });
  });
});

module.exports = router;
