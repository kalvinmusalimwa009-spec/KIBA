// services/authService.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/database');
const logger = require('../config/logger');

class AuthService {
    /**
     * Login admin user
     */
    async login(username, password, ipAddress) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM admin_users WHERE username = ? AND is_active = 1`, [username], async (err, admin) => {
                if (err || !admin) {
                    reject(new Error('Invalid credentials'));
                    return;
                }

                const isValid = await bcrypt.compare(password, admin.password_hash);
                if (!isValid) {
                    db.run(`INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
                            VALUES (?, ?, ?, ?)`, [admin.id, 'login_failed', 'Failed login attempt', ipAddress]);
                    reject(new Error('Invalid credentials'));
                    return;
                }

                const token = crypto.randomBytes(64).toString('hex');
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

                db.run(`INSERT INTO admin_sessions (admin_id, token, expires_at) VALUES (?, ?, ?)`,
                    [admin.id, token, expiresAt.toISOString()],
                    function(err) {
                        if (err) {
                            logger.error('Session creation error:', err);
                            reject(new Error('Failed to create session'));
                            return;
                        }

                        db.run(`UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`, [admin.id]);

                        db.run(`INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
                                VALUES (?, ?, ?, ?)`, [admin.id, 'login_success', 'Admin logged in', ipAddress]);

                        resolve({
                            token,
                            admin: {
                                id: admin.id,
                                username: admin.username,
                                email: admin.email,
                                full_name: admin.full_name,
                                role: admin.role,
                            }
                        });
                    }
                );
            });
        });
    }

    /**
     * Logout admin user
     */
    async logout(token, ipAddress) {
        return new Promise((resolve, reject) => {
            if (!token) {
                reject(new Error('No token provided'));
                return;
            }

            db.get(`SELECT admin_id FROM admin_sessions WHERE token = ?`, [token], (err, session) => {
                if (session) {
                    db.run(`INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
                            VALUES (?, ?, ?, ?)`, [session.admin_id, 'logout', 'Admin logged out', ipAddress]);
                }

                db.run(`DELETE FROM admin_sessions WHERE token = ?`, [token], function(err) {
                    if (err) {
                        logger.error('Logout error:', err);
                        reject(new Error('Failed to logout'));
                    } else {
                        resolve({ success: true });
                    }
                });
            });
        });
    }

    /**
     * Verify token
     */
    async verifyToken(token) {
        return new Promise((resolve, reject) => {
            if (!token) {
                reject(new Error('No token provided'));
                return;
            }

            db.get(`SELECT s.*, u.username, u.email, u.full_name, u.role 
                    FROM admin_sessions s 
                    JOIN admin_users u ON s.admin_id = u.id 
                    WHERE s.token = ? AND s.expires_at > datetime('now')`, [token], (err, session) => {
                if (err || !session) {
                    reject(new Error('Invalid or expired token'));
                } else {
                    resolve({
                        admin: {
                            id: session.admin_id,
                            username: session.username,
                            email: session.email,
                            full_name: session.full_name,
                            role: session.role,
                        }
                    });
                }
            });
        });
    }
}

module.exports = new AuthService();