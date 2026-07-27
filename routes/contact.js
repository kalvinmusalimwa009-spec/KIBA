/* ============================================
   CONTACT FORM ROUTE
   Handles contact form submissions
   ============================================ */

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("../database");

// Validation rules
const validateContact = [
  body("name").notEmpty().withMessage("Name is required").trim().escape(),
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("message").notEmpty().withMessage("Message is required").trim().escape(),
  body("phone").optional().trim(),
  body("inquiry").optional().trim(),
];

// POST /api/contact - Submit contact form
router.post("/", validateContact, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { name, email, phone, inquiry, message } = req.body;

  db.run(
    `INSERT INTO contacts (name, email, phone, inquiry, message, created_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [name, email, phone || null, inquiry || "General", message],
    function (err) {
      if (err) {
        console.error("Contact save error:", err);
        return res.status(500).json({ error: "Failed to save message" });
      }

      console.log(
        `📧 Contact message saved from ${email} (ID: ${this.lastID})`,
      );

      res.json({
        success: true,
        message:
          "Your message has been sent successfully! We will respond within 24 hours.",
        id: this.lastID,
      });
    },
  );
});

// GET /api/contact - Get all contacts (admin only - would need auth in production)
router.get("/", (req, res) => {
  // In production, add admin authentication middleware
  db.all(`SELECT * FROM contacts ORDER BY created_at DESC`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, contacts: rows });
  });
});

// GET /api/contact/:id - Get single contact
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM contacts WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json({ success: true, contact: row });
  });
});

module.exports = router;
