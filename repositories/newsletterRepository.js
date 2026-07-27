// repositories/newsletterRepository.js
const BaseRepository = require('./baseRepository');
const db = require('../config/database');
const logger = require('../config/logger');

class NewsletterRepository extends BaseRepository {
    constructor() {
        super('newsletter');
    }

    subscribe(email) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT OR IGNORE INTO newsletter (email, subscribed_at) VALUES (?, datetime('now'))`,
                [email],
                function(err) {
                    if (err) {
                        logger.error('NewsletterRepository.subscribe error:', err);
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

    unsubscribe(email) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM newsletter WHERE email = ?`, [email], function(err) {
                if (err) {
                    logger.error('NewsletterRepository.unsubscribe error:', err);
                    reject(err);
                } else {
                    resolve({ email, unsubscribed: this.changes > 0 });
                }
            });
        });
    }

    isSubscribed(email) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT 1 FROM newsletter WHERE email = ?`, [email], (err, row) => {
                if (err) {
                    logger.error('NewsletterRepository.isSubscribed error:', err);
                    reject(err);
                } else {
                    resolve(!!row);
                }
            });
        });
    }

    getAllEmails() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT email FROM newsletter ORDER BY subscribed_at DESC`, (err, rows) => {
                if (err) {
                    logger.error('NewsletterRepository.getAllEmails error:', err);
                    reject(err);
                } else {
                    resolve(rows.map(r => r.email));
                }
            });
        });
    }
}

module.exports = new NewsletterRepository();