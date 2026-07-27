// routes/api/v1/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../../../controllers/authController');
const { validateLogin } = require('../../../middleware/validator');
const { strictLimiter } = require('../../../middleware/rateLimiter');

router.post('/login', strictLimiter, validateLogin, AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/verify', AuthController.verify);

module.exports = router;