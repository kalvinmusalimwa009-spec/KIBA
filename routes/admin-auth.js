/* ============================================
   ADMIN AUTHENTICATION ROUTE
   Handles admin login and session management
   ============================================ */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../database");

// POST /api/admin/login - Admin login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  db.get(
    `SELECT * FROM admin_users WHERE username = ? AND is_active = 1`,
    [username],
    async (err, admin) => {
      if (err || !admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, admin.password_hash);
      if (!isValid) {
        // Log failed attempt
        db.run(
          `INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
                    VALUES (?, ?, ?, ?)`,
          [admin.id, "login_failed", "Failed login attempt", req.ip],
        );
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate session token
      const token = crypto.randomBytes(64).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      db.run(
        `INSERT INTO admin_sessions (admin_id, token, expires_at) VALUES (?, ?, ?)`,
        [admin.id, token, expiresAt.toISOString()],
        (err) => {
          if (err) {
            return res.status(500).json({ error: "Failed to create session" });
          }

          // Update last login
          db.run(
            `UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`,
            [admin.id],
          );

          // Log successful login
          db.run(
            `INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
                        VALUES (?, ?, ?, ?)`,
            [admin.id, "login_success", "Admin logged in", req.ip],
          );

          res.json({
            success: true,
            token: token,
            admin: {
              id: admin.id,
              username: admin.username,
              email: admin.email,
              full_name: admin.full_name,
              role: admin.role,
            },
          });
        },
      );
    },
  );
});

// POST /api/admin/logout - Admin logout
router.post("/logout", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }

  // Get admin_id before deleting session for logging
  db.get(
    `SELECT admin_id FROM admin_sessions WHERE token = ?`,
    [token],
    (err, session) => {
      if (session) {
        db.run(
          `INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
                    VALUES (?, ?, ?, ?)`,
          [session.admin_id, "logout", "Admin logged out", req.ip],
        );
      }

      db.run(`DELETE FROM admin_sessions WHERE token = ?`, [token], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: "Logged out successfully" });
      });
    },
  );
});

// GET /api/admin/verify - Verify token (for protected routes)
router.get("/verify", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  db.get(
    `SELECT s.*, u.username, u.email, u.full_name, u.role 
            FROM admin_sessions s 
            JOIN admin_users u ON s.admin_id = u.id 
            WHERE s.token = ? AND s.expires_at > datetime('now')`,
    [token],
    (err, session) => {
      if (err || !session) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      res.json({
        success: true,
        admin: {
          id: session.admin_id,
          username: session.username,
          email: session.email,
          full_name: session.full_name,
          role: session.role,
        },
      });
    },
  );
});

// POST /api/admin/change-password - Change password (authenticated)
router.post("/change-password", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { current_password, new_password } = req.body;

  if (!token || !current_password || !new_password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.get(
    `SELECT s.admin_id, u.password_hash 
            FROM admin_sessions s 
            JOIN admin_users u ON s.admin_id = u.id 
            WHERE s.token = ? AND s.expires_at > datetime('now')`,
    [token],
    async (err, session) => {
      if (err || !session) {
        return res.status(401).json({ error: "Invalid session" });
      }

      const isValid = await bcrypt.compare(
        current_password,
        session.password_hash,
      );
      if (!isValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const newHash = await bcrypt.hash(new_password, 10);
      db.run(
        `UPDATE admin_users SET password_hash = ? WHERE id = ?`,
        [newHash, session.admin_id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: "Failed to update password" });
          }

          db.run(
            `INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
                    VALUES (?, ?, ?, ?)`,
            [session.admin_id, "password_change", "Password changed", req.ip],
          );

          res.json({ success: true, message: "Password changed successfully" });
        },
      );
    },
  );
});

module.exports = router;
