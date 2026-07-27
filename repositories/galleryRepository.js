// repositories/galleryRepository.js
const BaseRepository = require('./baseRepository');
const db = require('../config/database');
const logger = require('../config/logger');

class GalleryRepository extends BaseRepository {
    constructor() {
        super('gallery_images');
    }

    /**
     * Create gallery image
     */
    create(imageData) {
        return new Promise((resolve, reject) => {
            const { filename, original_name, title, description, category, file_path, thumbnail_path, file_size, mime_type, width, height, uploaded_by } = imageData;

            db.run(
                `INSERT INTO gallery_images (filename, original_name, title, description, category, file_path, thumbnail_path, file_size, mime_type, width, height, uploaded_by, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
                [filename, original_name, title || null, description || null, category || 'general',
                 file_path, thumbnail_path, file_size, mime_type, width, height, uploaded_by || 'admin'],
                function(err) {
                    if (err) {
                        logger.error('GalleryRepository.create error:', err);
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, ...imageData });
                    }
                }
            );
        });
    }

    /**
     * Get approved images with pagination
     */
    getApproved(options = {}) {
        const { category, page = 1, limit = 12 } = options;
        const offset = (page - 1) * limit;

        let sql = `SELECT * FROM gallery_images WHERE is_approved = 1`;
        const params = [];

        if (category && category !== 'all') {
            sql += ` AND category = ?`;
            params.push(category);
        }

        sql += ` ORDER BY is_featured DESC, created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    logger.error('GalleryRepository.getApproved error:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Count approved images
     */
    countApproved(category = null) {
        let sql = `SELECT COUNT(*) as total FROM gallery_images WHERE is_approved = 1`;
        const params = [];

        if (category && category !== 'all') {
            sql += ` AND category = ?`;
            params.push(category);
        }

        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) {
                    logger.error('GalleryRepository.countApproved error:', err);
                    reject(err);
                } else {
                    resolve(row ? row.total : 0);
                }
            });
        });
    }

    /**
     * Increment view count
     */
    incrementView(id) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE gallery_images SET view_count = view_count + 1 WHERE id = ?`, [id], function(err) {
                if (err) {
                    logger.error('GalleryRepository.incrementView error:', err);
                    reject(err);
                } else {
                    resolve({ id, incremented: this.changes > 0 });
                }
            });
        });
    }

    /**
     * Get categories with image counts
     */
    getCategoriesWithCounts() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM gallery_categories ORDER BY name`, (err, categories) => {
                if (err) {
                    logger.error('GalleryRepository.getCategoriesWithCounts error:', err);
                    reject(err);
                } else {
                    Promise.all(categories.map(cat => {
                        return new Promise((resolve) => {
                            db.get(`SELECT COUNT(*) as count FROM gallery_images WHERE category = ? AND is_approved = 1`,
                                [cat.slug], (err, result) => {
                                    resolve({ ...cat, image_count: result?.count || 0 });
                                });
                        });
                    })).then(results => resolve(results));
                }
            });
        });
    }
}

module.exports = new GalleryRepository();