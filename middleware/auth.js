// middleware/auth.js
const db = require('../config/database');
const { errorResponse } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Verify admin token middleware
 */
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return errorResponse(res, 401, 'Authentication required');
    }
    
    db.get(`SELECT s.*, u.username, u.email, u.role 
            FROM admin_sessions s 
            JOIN admin_users u ON s.admin_id = u.id 
            WHERE s.token = ? AND s.expires_at > datetime('now')`, [token], (err, session) => {
        if (err || !session) {
            logger.warn(`Invalid token attempt from ${req.ip}`);
            return errorResponse(res, 401, 'Invalid or expired token');
        }
        
        // Attach admin info to request
        req.admin = {
            id: session.admin_id,
            username: session.username,
            email: session.email,
            role: session.role,
        };
        
        next();
    });
};

/**
 * Check role middleware
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return errorResponse(res, 401, 'Authentication required');
        }
        
        if (!roles.includes(req.admin.role)) {
            return errorResponse(res, 403, 'Insufficient permissions');
        }
        
        next();
    };
};

module.exports = {
    authenticate,
    requireRole,
};