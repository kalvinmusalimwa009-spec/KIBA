// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');
const config = require('../config/env');

/**
 * Create a rate limiter with custom options
 */
const rateLimiter = (options = {}) => {
    const defaults = {
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.max,
        handler: (req, res) => {
            errorResponse(res, 429, 'Too many requests, please try again later.');
        },
        standardHeaders: true,
        legacyHeaders: false,
    };

    const configOptions = { ...defaults, ...options };
    return rateLimit(configOptions);
};

/**
 * Strict limiter for sensitive endpoints (login, contact)
 */
const strictLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
});

/**
 * Standard limiter for general API endpoints
 */
const standardLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
});

/**
 * Admin limiter (higher limits)
 */
const adminLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per window
});

module.exports = {
    rateLimiter,
    strictLimiter,
    standardLimiter,
    adminLimiter,
};