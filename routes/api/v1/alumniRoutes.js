// routes/api/v1/alumniRoutes.js
const express = require('express');
const router = express.Router();
const AlumniController = require('../../../controllers/alumniController');
const { validateAlumni } = require('../../../middleware/validator');
const { standardLimiter } = require('../../../middleware/rateLimiter');

// Public routes
router.post(
    '/',
    standardLimiter,
    validateAlumni,
    AlumniController.register
);

router.get('/', AlumniController.getAll);
router.get('/stats', AlumniController.getStats);
router.get('/:id', AlumniController.getById);

module.exports = router;