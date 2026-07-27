// routes/api/v1/contactRoutes.js
const express = require('express');
const router = express.Router();
const ContactController = require('../../../controllers/contactController');
const { authenticate } = require('../../../middleware/auth');
const { validateContact } = require('../../../middleware/validator');
const { strictLimiter } = require('../../../middleware/rateLimiter');

// Public routes
router.post(
    '/',
    strictLimiter,
    validateContact,
    ContactController.submitContact
);

// Admin routes (require authentication)
router.get('/', authenticate, ContactController.getContacts);
router.get('/stats', authenticate, ContactController.getStats);
router.get('/:id', authenticate, ContactController.getContact);
router.delete('/:id', authenticate, ContactController.deleteContact);

module.exports = router;