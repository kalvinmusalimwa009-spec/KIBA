// models/Newsletter.js
const BaseRepository = require('../repositories/baseRepository');
const db = require('../config/database');
const logger = require('../config/logger');

class NewsletterModel extends BaseRepository {
    constructor() {
        super('newsletter');
    }

    /**
     * Subscribe email
     */
    subscribe(email) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT OR IGNORE INTO newsletter (email, subscribed_at) VALUES (?, datetime('now'))`,
                [email],
                function(err) {
                    if (err) {
                        logger.error('NewsletterModel.subscribe error:', err);
                        reject(err);
                    } else {
                        const subscribed = this.changes > 0;
                        resolve({ 
                            email, 
                            subscribed,
                            message: subscribed ? 'Subscribed successfully' : 'Already subscribed'
                        });
                    }
                }
            );
        });
    }

    /**
     * Unsubscribe email
     */
    unsubscribe(email) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM newsletter WHERE email = ?`, [email], function(err) {
                if (err) {
                    logger.error('NewsletterModel.unsubscribe error:', err);
                    reject(err);
                } else {
                    resolve({ email, unsubscribed: this.changes > 0 });
                }
            });
        });
    }

    /**
     * Check if email is subscribed
     */
    isSubscribed(email) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT 1 FROM newsletter WHERE email = ?`, [email], (err, row) => {
                if (err) {
                    logger.error('NewsletterModel.isSubscribed error:', err);
                    reject(err);
                } else {
                    resolve(!!row);
                }
            });
        });
    }

    /**
     * Get all subscribers (for bulk email)
     */
    getAllEmails() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT email FROM newsletter ORDER BY subscribed_at DESC`, (err, rows) => {
                if (err) {
                    logger.error('NewsletterModel.getAllEmails error:', err);
                    reject(err);
                } else {
                    resolve(rows.map(r => r.email));
                }
            });
        });
    }
}

module.exports = new NewsletterModel();