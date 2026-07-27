// repositories/alumniRepository.js
const BaseRepository = require('./baseRepository');
const db = require('../config/database');
const logger = require('../config/logger');

class AlumniRepository extends BaseRepository {
    constructor() {
        super('alumni_registrations');
    }

    /**
     * Register new alumni
     */
    create(alumniData) {
        return new Promise((resolve, reject) => {
            const { name, email, phone, graduation_year, occupation, location } = alumniData;

            db.run(
                `INSERT INTO alumni_registrations (name, email, phone, graduation_year, occupation, location, registered_at)
                 VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
                [name, email, phone || null, graduation_year || null, occupation || null, location || null],
                function(err) {
                    if (err) {
                        logger.error('AlumniRepository.create error:', err);
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, ...alumniData });
                    }
                }
            );
        });
    }

    /**
     * Find alumni by email
     */
    findByEmail(email) {
        return this.findOneBy('email', email);
    }

    /**
     * Get alumni statistics
     */
    getStats() {
        return new Promise((resolve, reject) => {
            const stats = {};

            db.get(`SELECT COUNT(*) as total FROM alumni_registrations`, (err, row) => {
                if (err) reject(err);
                stats.total = row ? row.total : 0;

                db.all(`SELECT graduation_year, COUNT(*) as count FROM alumni_registrations 
                        WHERE graduation_year IS NOT NULL 
                        GROUP BY graduation_year ORDER BY graduation_year DESC`,
                    (err, rows) => {
                        if (err) reject(err);
                        stats.by_year = rows || [];

                        db.all(`SELECT occupation, COUNT(*) as count FROM alumni_registrations 
                                WHERE occupation IS NOT NULL 
                                GROUP BY occupation ORDER BY count DESC LIMIT 10`,
                            (err, rows) => {
                                if (err) reject(err);
                                stats.by_occupation = rows || [];
                                resolve(stats);
                            }
                        );
                    }
                );
            });
        });
    }
}

module.exports = new AlumniRepository();