// utils/helpers.js
const crypto = require('crypto');
const slugify = require('slugify');

/**
 * Generate a random token
 */
const generateToken = (length = 64) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Create a slug from a string
 */
const createSlug = (text) => {
    return slugify(text, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
    });
};

/**
 * Sanitize user input (basic XSS prevention)
 */
const sanitizeString = (str) => {
    if (!str) return '';
    return str.replace(/[<>]/g, '').trim();
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number (Kenyan format)
 */
const isValidPhone = (phone) => {
    const phoneRegex = /^(07|01|02)\d{8}$/;
    return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
};

/**
 * Format date to readable string
 */
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * Truncate text to a specific length
 */
const truncateText = (text, length = 100) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

/**
 * Get client IP address
 */
const getClientIp = (req) => {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           'unknown';
};

/**
 * Calculate percentage
 */
const percentage = (part, total) => {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
};

module.exports = {
    generateToken,
    createSlug,
    sanitizeString,
    isValidEmail,
    isValidPhone,
    formatDate,
    truncateText,
    getClientIp,
    percentage,
};