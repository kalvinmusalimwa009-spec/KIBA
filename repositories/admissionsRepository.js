// repositories/admissionsRepository.js
const BaseRepository = require('./baseRepository');
const db = require('../config/database');
const logger = require('../config/logger');

class AdmissionsRepository extends BaseRepository {
    constructor() {
        super('admissions');
    }

    /**
     * Submit admission application
     */
    create(admissionData) {
        return new Promise((resolve, reject) => {
            const { full_name, email, phone, admission_type, previous_school, kcpe_score, message } = admissionData;

            db.run(
                `INSERT INTO admissions (full_name, email, phone, admission_type, previous_school, kcpe_score, message, submitted_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
                [full_name, email, phone, admission_type, previous_school || null, kcpe_score || null, message || null],
                function(err) {
                    if (err) {
                        logger.error('AdmissionsRepository.create error:', err);
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, ...admissionData });
                    }
                }
            );
        });
    }

    /**
     * Update admission status
     */
    updateStatus(id, status) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE admissions SET status = ? WHERE id = ?`, [status, id], function(err) {
                if (err) {
                    logger.error('AdmissionsRepository.updateStatus error:', err);
                    reject(err);
                } else {
                    resolve({ id, status, updated: this.changes > 0 });
                }
            });
        });
    }

    /**
     * Get admissions by status
     */
    findByStatus(status) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM admissions WHERE status = ? ORDER BY submitted_at DESC`,
                [status],
                (err, rows) => {
                    if (err) {
                        logger.error('AdmissionsRepository.findByStatus error:', err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    /**
     * Get admission statistics
     */
    getStats() {
        return new Promise((resolve, reject) => {
            const stats = {};

            db.get(`SELECT COUNT(*) as total FROM admissions`, (err, row) => {
                if (err) reject(err);
                stats.total = row ? row.total : 0;

                db.get(`SELECT COUNT(*) as today FROM admissions WHERE date(submitted_at) = date('now')`, (err, row) => {
                    if (err) reject(err);
                    stats.today = row ? row.today : 0;

                    db.all(`SELECT admission_type, COUNT(*) as count FROM admissions GROUP BY admission_type`, (err, rows) => {
                        if (err) reject(err);
                        stats.by_type = rows || [];

                        db.all(`SELECT status, COUNT(*) as count FROM admissions GROUP BY status`, (err, rows) => {
                            if (err) reject(err);
                            stats.by_status = rows || [];
                            resolve(stats);
                        });
                    });
                });
            });
        });
    }
}

module.exports = new AdmissionsRepository();