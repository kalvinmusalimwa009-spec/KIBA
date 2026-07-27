// controllers/galleryController.js
const GalleryService = require('../services/galleryService');
const { successResponse, errorResponse } = require('../utils/response');

class GalleryController {
    async getAll(req, res) {
        try {
            const { category, page = 1, limit = 12 } = req.query;
            const images = await GalleryService.getImages({ category, page, limit });
            const total = await GalleryService.getCount(category);
            
            successResponse(res, 200, 'Gallery images retrieved', images, {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
            });
        } catch (error) {
            errorResponse(res, 500, error.message);
        }
    }

    async getById(req, res) {
        try {
            const image = await GalleryService.getImageById(req.params.id);
            successResponse(res, 200, 'Image retrieved', image);
        } catch (error) {
            errorResponse(res, 404, error.message);
        }
    }

    async getCategories(req, res) {
        try {
            const categories = await GalleryService.getCategories();
            successResponse(res, 200, 'Categories retrieved', categories);
        } catch (error) {
            errorResponse(res, 500, error.message);
        }
    }

    async upload(req, res) {
        try {
            // This would handle file upload with multer
            successResponse(res, 201, 'Upload functionality ready');
        } catch (error) {
            errorResponse(res, 500, error.message);
        }
    }

    async update(req, res) {
        try {
            const result = await GalleryService.updateImage(req.params.id, req.body);
            successResponse(res, 200, 'Image updated successfully', result);
        } catch (error) {
            errorResponse(res, 400, error.message);
        }
    }

    async delete(req, res) {
        try {
            await GalleryService.deleteImage(req.params.id);
            successResponse(res, 200, 'Image deleted successfully');
        } catch (error) {
            errorResponse(res, 404, error.message);
        }
    }

    async bulkUpload(req, res) {
        try {
            successResponse(res, 201, 'Bulk upload functionality ready');
        } catch (error) {
            errorResponse(res, 500, error.message);
        }
    }
}

module.exports = new GalleryController();