// middleware/validator.js
const { body, param, query, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return errorResponse(res, 400, 'Validation failed', errors.array());
    }
    next();
};

// Contact validation rules
const validateContact = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
        .escape(),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    
    body('phone')
        .optional()
        .trim()
        .escape(),
    
    body('inquiry')
        .optional()
        .trim()
        .escape(),
    
    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
        .escape(),
    
    handleValidationErrors,
];

// Alumni validation rules
const validateAlumni = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
        .escape(),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    
    body('graduation_year')
        .optional()
        .isInt({ min: 1952, max: new Date().getFullYear() })
        .withMessage('Invalid graduation year'),
    
    body('occupation')
        .optional()
        .trim()
        .escape(),
    
    body('location')
        .optional()
        .trim()
        .escape(),
    
    handleValidationErrors,
];

// Admission validation rules
const validateAdmission = [
    body('full_name')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .escape(),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required'),
    
    body('admission_type')
        .trim()
        .notEmpty().withMessage('Admission type is required'),
    
    handleValidationErrors,
];

// Newsletter validation
const validateNewsletter = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    
    handleValidationErrors,
];

// Login validation
const validateLogin = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required'),
    
    body('password')
        .notEmpty().withMessage('Password is required'),
    
    handleValidationErrors,
];

// ID param validation
const validateIdParam = [
    param('id')
        .isInt().withMessage('Invalid ID format'),
    
    handleValidationErrors,
];

module.exports = {
    validateContact,
    validateAlumni,
    validateAdmission,
    validateNewsletter,
    validateLogin,
    validateIdParam,
};