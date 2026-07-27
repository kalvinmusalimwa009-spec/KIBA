// routes/api/v1/newsletterRoutes.js
const express = require('express');
const router = express.Router();
const NewsletterController = require('../../../controllers/newsletterController');
const { validateNewsletter } = require('../../../middleware/validator');
const { standardLimiter } = require('../../../middleware/rateLimiter');

// POST /api/v1/newsletter - Subscribe to newsletter
router.post('/', standardLimiter, validateNewsletter, NewsletterController.subscribe);

// DELETE /api/v1/newsletter/:email - Unsubscribe
router.delete('/:email', NewsletterController.unsubscribe);

// GET /api/v1/newsletter - Get all subscribers (admin only)
router.get('/', NewsletterController.getAll);

module.exports = router;