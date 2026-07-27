// services/galleryService.js
const db = require('../config/database');
const logger = require('../config/logger');

class GalleryService {
    /**
     * Get gallery images with pagination
     */
    async getImages(options = {}) {
        const { category, page = 1, limit = 12 } = options;
        const offset = (page - 1) * limit;

        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM gallery_images WHERE is_approved = 1`;
            const params = [];

            if (category && category !== 'all') {
                sql += ` AND category = ?`;
                params.push(category);
            }

            sql += ` ORDER BY is_featured DESC, created_at DESC LIMIT ? OFFSET ?`;
            params.push(parseInt(limit), parseInt(offset));

            db.all(sql, params, (err, rows) => {
                if (err) {
                    logger.error('GalleryService.getImages error:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Get image by ID
     */
    async getImageById(id) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM gallery_images WHERE id = ? AND is_approved = 1`, [id], (err, image) => {
                if (err) {
                    logger.error('GalleryService.getImageById error:', err);
                    reject(err);
                } else if (!image) {
                    reject(new Error('Image not found'));
                } else {
                    // Increment view count
                    db.run(`UPDATE gallery_images SET view_count = view_count + 1 WHERE id = ?`, [id]);
                    resolve(image);
                }
            });
        });
    }

    /**
     * Get categories with counts
     */
    async getCategories() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM gallery_categories ORDER BY name`, (err, categories) => {
                if (err) {
                    logger.error('GalleryService.getCategories error:', err);
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

    /**
     * Get image count
     */
    async getCount(category = null) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT COUNT(*) as total FROM gallery_images WHERE is_approved = 1`;
            const params = [];

            if (category && category !== 'all') {
                sql += ` AND category = ?`;
                params.push(category);
            }

            db.get(sql, params, (err, row) => {
                if (err) {
                    logger.error('GalleryService.getCount error:', err);
                    reject(err);
                } else {
                    resolve(row ? row.total : 0);
                }
            });
        });
    }

    /**
     * Update image (admin)
     */
    async updateImage(id, data) {
        const { title, description, category, is_featured, is_approved } = data;

        const updates = [];
        const params = [];

        if (title !== undefined) { updates.push('title = ?'); params.push(title); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }
        if (category !== undefined) { updates.push('category = ?'); params.push(category); }
        if (is_featured !== undefined) { updates.push('is_featured = ?'); params.push(is_featured ? 1 : 0); }
        if (is_approved !== undefined) { updates.push('is_approved = ?'); params.push(is_approved ? 1 : 0); }

        if (updates.length === 0) {
            throw new Error('No fields to update');
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        return new Promise((resolve, reject) => {
            db.run(`UPDATE gallery_images SET ${updates.join(', ')} WHERE id = ?`, params, function(err) {
                if (err) {
                    logger.error('GalleryService.updateImage error:', err);
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('Image not found'));
                } else {
                    logger.info(`Gallery image updated: ${id}`);
                    resolve({ id, updated: true });
                }
            });
        });
    }

    /**
     * Delete image (admin)
     */
    async deleteImage(id) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM gallery_images WHERE id = ?`, [id], function(err) {
                if (err) {
                    logger.error('GalleryService.deleteImage error:', err);
                    reject(err);
                } else if (this.changes === 0) {
                    reject(new Error('Image not found'));
                } else {
                    logger.info(`Gallery image deleted: ${id}`);
                    resolve({ id, deleted: true });
                }
            });
        });
    }
}

module.exports = new GalleryService();