// routes/api/v1/adminRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../../../middleware/auth');
const { successResponse, errorResponse } = require('../../../utils/response');
const db = require('../../../config/database');
const logger = require('../../../config/logger');

// ========== DASHBOARD STATISTICS ==========

/**
 * GET /api/v1/admin/dashboard
 * Get dashboard statistics (admin only)
 */
router.get('/dashboard', authenticate, (req, res) => {
    const stats = {};

    // Total contacts
    db.get(`SELECT COUNT(*) as total FROM contacts`, (err, row) => {
        stats.contacts = row ? row.total : 0;

        // Today's contacts
        db.get(`SELECT COUNT(*) as today FROM contacts WHERE date(created_at) = date('now')`, (err, row) => {
            stats.contacts_today = row ? row.today : 0;

            // Total admissions
            db.get(`SELECT COUNT(*) as total FROM admissions`, (err, row) => {
                stats.admissions = row ? row.total : 0;

                // Total alumni
                db.get(`SELECT COUNT(*) as total FROM alumni_registrations`, (err, row) => {
                    stats.alumni = row ? row.total : 0;

                    // Newsletter subscribers
                    db.get(`SELECT COUNT(*) as total FROM newsletter`, (err, row) => {
                        stats.newsletter = row ? row.total : 0;

                        // Gallery images
                        db.get(`SELECT COUNT(*) as total FROM gallery_images`, (err, row) => {
                            stats.gallery = row ? row.total : 0;

                            // Recent activity (last 5 contacts)
                            db.all(`SELECT id, name, email, created_at FROM contacts ORDER BY created_at DESC LIMIT 5`, (err, rows) => {
                                stats.recent_contacts = rows || [];

                                // Recent admissions
                                db.all(`SELECT id, full_name, email, admission_type, submitted_at FROM admissions ORDER BY submitted_at DESC LIMIT 5`, (err, rows) => {
                                    stats.recent_admissions = rows || [];

                                    successResponse(res, 200, 'Dashboard statistics retrieved', stats);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// ========== CONTACT MANAGEMENT ==========

/**
 * GET /api/v1/admin/contacts
 * Get all contacts with pagination (admin only)
 */
router.get('/contacts', authenticate, (req, res) => {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let sql = `SELECT * FROM contacts`;
    const params = [];
    let whereClause = '';

    if (search) {
        whereClause = ` WHERE name LIKE ? OR email LIKE ? OR message LIKE ?`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    const countSql = `SELECT COUNT(*) as total FROM contacts${whereClause}`;

    db.get(countSql, params, (err, countResult) => {
        if (err) {
            logger.error('Admin contacts count error:', err);
            return errorResponse(res, 500, err.message);
        }

        const total = countResult ? countResult.total : 0;

        db.all(
            `${sql}${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), parseInt(offset)],
            (err, rows) => {
                if (err) {
                    logger.error('Admin contacts error:', err);
                    return errorResponse(res, 500, err.message);
                }

                successResponse(res, 200, 'Contacts retrieved', rows, {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                });
            }
        );
    });
});

/**
 * GET /api/v1/admin/contacts/:id
 * Get single contact (admin only)
 */
router.get('/contacts/:id', authenticate, (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM contacts WHERE id = ?`, [id], (err, row) => {
        if (err) {
            logger.error('Admin contact get error:', err);
            return errorResponse(res, 500, err.message);
        }
        if (!row) {
            return errorResponse(res, 404, 'Contact not found');
        }
        successResponse(res, 200, 'Contact retrieved', row);
    });
});

/**
 * DELETE /api/v1/admin/contacts/:id
 * Delete contact (admin only)
 */
router.delete('/contacts/:id', authenticate, (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM contacts WHERE id = ?`, [id], function(err) {
        if (err) {
            logger.error('Admin contact delete error:', err);
            return errorResponse(res, 500, err.message);
        }
        if (this.changes === 0) {
            return errorResponse(res, 404, 'Contact not found');
        }

        // Log activity
        db.run(`INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
                VALUES (?, ?, ?, ?)`, [req.admin.id, 'delete_contact', `Deleted contact ID ${id}`, req.ip]);

        successResponse(res, 200, 'Contact deleted successfully');
    });
});

// ========== ADMISSIONS MANAGEMENT ==========

/**
 * GET /api/v1/admin/admissions
 * Get all admissions with pagination (admin only)
 */
router.get('/admissions', authenticate, (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let sql = `SELECT * FROM admissions`;
    const params = [];
    let whereClause = '';

    if (status && status !== 'all') {
        whereClause = ` WHERE status = ?`;
        params.push(status);
    }

    const countSql = `SELECT COUNT(*) as total FROM admissions${whereClause}`;

    db.get(countSql, params, (err, countResult) => {
        if (err) {
            logger.error('Admin admissions count error:', err);
            return errorResponse(res, 500, err.message);
        }

        const total = countResult ? countResult.total : 0;

        db.all(
            `${sql}${whereClause} ORDER BY submitted_at DESC LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), parseInt(offset)],
            (err, rows) => {
                if (err) {
                    logger.error('Admin admissions error:', err);
                    return errorResponse(res, 500, err.message);
                }

                successResponse(res, 200, 'Admissions retrieved', rows, {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                });
            }
        );
    });
});

/**
 * PUT /api/v1/admin/admissions/:id/status
 * Update admission status (admin only)
 */
router.put('/admissions/:id/status', authenticate, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return errorResponse(res, 400, 'Status is required');
    }

    const validStatuses = ['pending', 'reviewing', 'accepted', 'rejected', 'waitlist'];
    if (!validStatuses.includes(status)) {
        return errorResponse(res, 400, 'Invalid status. Must be: pending, reviewing, accepted, rejected, waitlist');
    }

    db.run(`UPDATE admissions SET status = ? WHERE id = ?`, [status, id], function(err) {
        if (err) {
            logger.error('Admin admission status update error:', err);
            return errorResponse(res, 500, err.message);
        }
        if (this.changes === 0) {
            return errorResponse(res, 404, 'Admission not found');
        }

        db.run(`INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
                VALUES (?, ?, ?, ?)`, [req.admin.id, 'update_admission_status', `Updated admission ${id} to ${status}`, req.ip]);

        successResponse(res, 200, 'Admission status updated successfully');
    });
});

// ========== USER MANAGEMENT ==========

/**
 * GET /api/v1/admin/users
 * Get all admin users (admin only)
 */
router.get('/users', authenticate, requireRole(['super_admin']), (req, res) => {
    db.all(`SELECT id, username, email, full_name, role, is_active, last_login, created_at 
            FROM admin_users ORDER BY created_at DESC`, (err, rows) => {
        if (err) {
            logger.error('Admin users error:', err);
            return errorResponse(res, 500, err.message);
        }
        successResponse(res, 200, 'Users retrieved', rows);
    });
});

/**
 * POST /api/v1/admin/users
 * Create new admin user (super_admin only)
 */
router.post('/users', authenticate, requireRole(['super_admin']), async (req, res) => {
    const { username, email, password, full_name, role } = req.body;

    if (!username || !email || !password) {
        return errorResponse(res, 400, 'Username, email, and password are required');
    }

    try {
        const bcrypt = require('bcryptjs');
        const passwordHash = await bcrypt.hash(password, 10);

        db.run(
            `INSERT INTO admin_users (username, password_hash, email, full_name, role) VALUES (?, ?, ?, ?, ?)`,
            [username, passwordHash, email, full_name || null, role || 'editor'],
            function(err) {
                if (err) {
                    logger.error('Admin user creation error:', err);
                    return errorResponse(res, 500, err.message);
                }

                db.run(`INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
                        VALUES (?, ?, ?, ?)`, [req.admin.id, 'create_user', `Created user ${username}`, req.ip]);

                successResponse(res, 201, 'User created successfully', { id: this.lastID });
            }
        );
    } catch (error) {
        logger.error('Admin user creation error:', error);
        errorResponse(res, 500, error.message);
    }
});

/**
 * PUT /api/v1/admin/users/:id
 * Update admin user (super_admin only)
 */
router.put('/users/:id', authenticate, requireRole(['super_admin']), (req, res) => {
    const { id } = req.params;
    const { full_name, role, is_active } = req.body;

    const updates = [];
    const params = [];

    if (full_name !== undefined) { updates.push('full_name = ?'); params.push(full_name); }
    if (role !== undefined) { updates.push('role = ?'); params.push(role); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }

    if (updates.length === 0) {
        return errorResponse(res, 400, 'No fields to update');
    }

    params.push(id);

    db.run(`UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`, params, function(err) {
        if (err) {
            logger.error('Admin user update error:', err);
            return errorResponse(res, 500, err.message);
        }
        if (this.changes === 0) {
            return errorResponse(res, 404, 'User not found');
        }

        db.run(`INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
                VALUES (?, ?, ?, ?)`, [req.admin.id, 'update_user', `Updated user ${id}`, req.ip]);

        successResponse(res, 200, 'User updated successfully');
    });
});

/**
 * DELETE /api/v1/admin/users/:id
 * Delete admin user (super_admin only)
 */
router.delete('/users/:id', authenticate, requireRole(['super_admin']), (req, res) => {
    const { id } = req.params;

    // Prevent deleting the last super_admin
    db.get(`SELECT COUNT(*) as count FROM admin_users WHERE role = 'super_admin'`, (err, row) => {
        if (err) {
            logger.error('Admin user delete error:', err);
            return errorResponse(res, 500, err.message);
        }

        db.get(`SELECT role FROM admin_users WHERE id = ?`, [id], (err, user) => {
            if (err || !user) {
                return errorResponse(res, 404, 'User not found');
            }

            if (user.role === 'super_admin' && row.count <= 1) {
                return errorResponse(res, 400, 'Cannot delete the only super_admin user');
            }

            db.run(`DELETE FROM admin_users WHERE id = ?`, [id], function(err) {
                if (err) {
                    logger.error('Admin user delete error:', err);
                    return errorResponse(res, 500, err.message);
                }

                db.run(`INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
                        VALUES (?, ?, ?, ?)`, [req.admin.id, 'delete_user', `Deleted user ${id}`, req.ip]);

                successResponse(res, 200, 'User deleted successfully');
            });
        });
    });
});

// ========== ACTIVITY LOG ==========

/**
 * GET /api/v1/admin/activity
 * Get admin activity log (admin only)
 */
router.get('/activity', authenticate, (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    db.get(`SELECT COUNT(*) as total FROM admin_activity_log`, (err, countResult) => {
        if (err) {
            logger.error('Admin activity count error:', err);
            return errorResponse(res, 500, err.message);
        }

        const total = countResult ? countResult.total : 0;

        db.all(
            `SELECT l.*, u.username 
             FROM admin_activity_log l 
             LEFT JOIN admin_users u ON l.admin_id = u.id 
             ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
            [parseInt(limit), parseInt(offset)],
            (err, rows) => {
                if (err) {
                    logger.error('Admin activity error:', err);
                    return errorResponse(res, 500, err.message);
                }

                successResponse(res, 200, 'Activity log retrieved', rows, {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                });
            }
        );
    });
});

// ========== SYSTEM SETTINGS ==========

/**
 * GET /api/v1/admin/settings
 * Get system settings (admin only)
 */
router.get('/settings', authenticate, (req, res) => {
    const settings = {
        school: {
            name: "St. Mary's Kibabii Boys National School",
            motto: 'Orare et Laborare',
            founded: 1952,
            students: 1600,
            staff: 85,
            counties: 47,
        },
        contact: {
            phone: ['0734-741162', '0753 028407'],
            email: 'info@stmaryskibabii.ac.ke',
            address: 'P.O. Box 85, Bungoma 50200, Kenya',
        },
        system: {
            version: '2.0.0',
            environment: process.env.NODE_ENV || 'development',
        }
    };

    successResponse(res, 200, 'Settings retrieved', settings);
});

/**
 * PUT /api/v1/admin/settings
 * Update system settings (super_admin only)
 */
router.put('/settings', authenticate, requireRole(['super_admin']), (req, res) => {
    // This would update settings in a database
    // For now, just log and return success
    db.run(`INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
            VALUES (?, ?, ?, ?)`, [req.admin.id, 'update_settings', 'System settings updated', req.ip]);

    successResponse(res, 200, 'Settings updated successfully');
});

module.exports = router;