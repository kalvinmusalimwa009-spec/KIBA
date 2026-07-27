// repositories/contactRepository.js
const BaseRepository = require('./baseRepository');
const db = require('../config/database');
const logger = require('../config/logger');

class ContactRepository extends BaseRepository {
    constructor() {
        super('contacts');
    }

    /**
     * Create a new contact
     */
    create(contactData) {
        return new Promise((resolve, reject) => {
            const { name, email, phone, inquiry, message, ip_address } = contactData;

            db.run(
                `INSERT INTO contacts (name, email, phone, inquiry, message, ip_address, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
                [name, email, phone || null, inquiry || 'General', message, ip_address || null],
                function(err) {
                    if (err) {
                        logger.error('ContactRepository.create error:', err);
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, ...contactData });
                    }
                }
            );
        });
    }

    /**
     * Find contacts by email
     */
    findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM contacts WHERE email = ? ORDER BY created_at DESC`,
                [email],
                (err, rows) => {
                    if (err) {
                        logger.error('ContactRepository.findByEmail error:', err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    /**
     * Search contacts
     */
    search(searchTerm) {
        return new Promise((resolve, reject) => {
            const term = `%${searchTerm}%`;
            db.all(
                `SELECT * FROM contacts 
                 WHERE name LIKE ? OR email LIKE ? OR message LIKE ? 
                 ORDER BY created_at DESC`,
                [term, term, term],
                (err, rows) => {
                    if (err) {
                        logger.error('ContactRepository.search error:', err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    /**
     * Get contact statistics
     */
    getStats() {
        return new Promise((resolve, reject) => {
            const stats = {};

            db.get(`SELECT COUNT(*) as total FROM contacts`, (err, row) => {
                if (err) reject(err);
                stats.total = row ? row.total : 0;

                db.get(`SELECT COUNT(*) as today FROM contacts WHERE date(created_at) = date('now')`, (err, row) => {
                    if (err) reject(err);
                    stats.today = row ? row.today : 0;

                    db.all(`SELECT inquiry, COUNT(*) as count FROM contacts GROUP BY inquiry`, (err, rows) => {
                        if (err) reject(err);
                        stats.by_inquiry = rows || [];
                        resolve(stats);
                    });
                });
            });
        });
    }
}

module.exports = new ContactRepository();