// routes/api/v1/admissionsRoutes.js
const express = require('express');
const router = express.Router();
const { validateAdmission } = require('../../../middleware/validator');
const { strictLimiter } = require('../../../middleware/rateLimiter');
const { successResponse, errorResponse } = require('../../../utils/response');
const db = require('../../../config/database');
const logger = require('../../../config/logger');

// POST /api/v1/admissions - Submit admission application
router.post('/', strictLimiter, validateAdmission, (req, res) => {
    const { full_name, email, phone, admission_type, previous_school, kcpe_score, message } = req.body;

    db.run(
        `INSERT INTO admissions (full_name, email, phone, admission_type, previous_school, kcpe_score, message, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [full_name, email, phone, admission_type, previous_school || null, kcpe_score || null, message || null],
        function(err) {
            if (err) {
                logger.error('Admission save error:', err);
                return errorResponse(res, 500, 'Failed to submit application');
            }

            logger.info(`Admission application from ${full_name} (ID: ${this.lastID})`);
            successResponse(res, 201, 'Application submitted successfully!', { application_id: this.lastID });
        }
    );
});

// GET /api/v1/admissions - Get all applications (admin only)
router.get('/', (req, res) => {
    db.all(`SELECT * FROM admissions ORDER BY submitted_at DESC`, (err, rows) => {
        if (err) {
            return errorResponse(res, 500, err.message);
        }
        successResponse(res, 200, 'Applications retrieved', rows);
    });
});

module.exports = router;