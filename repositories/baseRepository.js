// repositories/baseRepository.js
const db = require('../config/database');
const logger = require('../config/logger');

/**
 * Base Repository - All repositories inherit from this
 */
class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
    }

    /**
     * Find all records with pagination
     */
    findAll(options = {}) {
        const { page = 1, limit = 50, orderBy = 'created_at DESC', where = '', whereParams = [] } = options;
        const offset = (page - 1) * limit;

        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM ${this.tableName} ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
            const params = [...whereParams, parseInt(limit), parseInt(offset)];

            db.all(sql, params, (err, rows) => {
                if (err) {
                    logger.error(`Repository error (findAll ${this.tableName}):`, err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Find single record by ID
     */
    findById(id) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id], (err, row) => {
                if (err) {
                    logger.error(`Repository error (findById ${this.tableName}):`, err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Find one record by field
     */
    findOneBy(field, value) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM ${this.tableName} WHERE ${field} = ?`, [value], (err, row) => {
                if (err) {
                    logger.error(`Repository error (findOneBy ${this.tableName}):`, err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Count total records
     */
    count(where = '', whereParams = []) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT COUNT(*) as total FROM ${this.tableName} ${where}`, whereParams, (err, row) => {
                if (err) {
                    logger.error(`Repository error (count ${this.tableName}):`, err);
                    reject(err);
                } else {
                    resolve(row ? row.total : 0);
                }
            });
        });
    }

    /**
     * Delete record by ID
     */
    delete(id) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id], function(err) {
                if (err) {
                    logger.error(`Repository error (delete ${this.tableName}):`, err);
                    reject(err);
                } else {
                    resolve({ id, deleted: this.changes > 0 });
                }
            });
        });
    }

    /**
     * Check if record exists
     */
    exists(id) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT 1 FROM ${this.tableName} WHERE id = ?`, [id], (err, row) => {
                if (err) {
                    logger.error(`Repository error (exists ${this.tableName}):`, err);
                    reject(err);
                } else {
                    resolve(!!row);
                }
            });
        });
    }
}

module.exports = BaseRepository;