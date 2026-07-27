// routes/api/v1/galleryRoutes.js
const express = require('express');
const router = express.Router();
const GalleryController = require('../../../controllers/galleryController');
const { authenticate } = require('../../../middleware/auth');
const { standardLimiter } = require('../../../middleware/rateLimiter');

// Public routes
router.get('/', standardLimiter, GalleryController.getAll);
router.get('/categories', GalleryController.getCategories);
router.get('/:id', GalleryController.getById);

// Admin routes
router.post(
    '/',
    authenticate,
    GalleryController.upload
);

router.put('/:id', authenticate, GalleryController.update);
router.delete('/:id', authenticate, GalleryController.delete);
router.post('/bulk', authenticate, GalleryController.bulkUpload);

module.exports = router;