// config/env.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
    // Server
    port: parseInt(process.env.PORT, 10) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Database
    dbPath: process.env.DB_PATH || './kiba.db',
    
    // Security
    jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
    sessionSecret: process.env.SESSION_SECRET || 'default-session-secret',
    
    // File Upload
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880,
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(','),
    
    // Email (SMTP)
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
    
    // Admin
    admin: {
        username: process.env.ADMIN_USERNAME || 'admin',
        passwordHash: process.env.ADMIN_PASSWORD_HASH || '',
    },
    
    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    },
    
    // CORS
    corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5000').split(','),
};

module.exports = config;