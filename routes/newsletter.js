/* ============================================
   NEWSLETTER ROUTE
   Handles newsletter subscriptions
   ============================================ */

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const db = require("../database");

// Validation
const validateEmail = [
  body("email")
    .isEmail()
    .withMessage("Valid email address is required")
    .normalizeEmail(),
];

// POST /api/newsletter - Subscribe to newsletter
router.post("/", validateEmail, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { email } = req.body;

  db.run(
    `INSERT OR IGNORE INTO newsletter (email, subscribed_at) VALUES (?, datetime('now'))`,
    [email],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res
          .status(400)
          .json({ error: "Email already subscribed to newsletter" });
      }

      console.log(`📧 New newsletter subscriber: ${email}`);
      res.json({
        success: true,
        message: "Successfully subscribed to Kiba newsletter!",
      });
    },
  );
});

// GET /api/newsletter - Get all subscribers (admin only)
router.get("/", (req, res) => {
  db.all(
    `SELECT id, email, subscribed_at FROM newsletter ORDER BY subscribed_at DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, subscribers: rows });
    },
  );
});

// DELETE /api/newsletter/:email - Unsubscribe
router.delete("/:email", (req, res) => {
  const { email } = req.params;
  db.run(`DELETE FROM newsletter WHERE email = ?`, [email], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: "Unsubscribed successfully" });
  });
});

module.exports = router;
