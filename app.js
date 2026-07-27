// app.js - Express App Configuration
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/env');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');
const { standardLimiter } = require('./middleware/rateLimiter');
const db = require('./config/database');

// Import routes
const apiRoutes = require('./routes/api/v1');

const app = express();

// ========== MIDDLEWARE ==========

// Security
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Logging
app.use(morgan('dev', {
    stream: {
        write: (message) => logger.info(message.trim()),
    },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', standardLimiter);

// ========== STATIC FILES ==========
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// ========== API ROUTES ==========
app.use('/api/v1', apiRoutes);

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        version: require('../package.json').version,
    });
});

// ========== VISITOR COUNTER ==========
app.get('/api/counter', (req, res) => {
    db.get('SELECT count FROM visitors WHERE id = 1', (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ count: row ? row.count : 0 });
    });
});

app.post('/api/counter/increment', (req, res) => {
    db.run('UPDATE visitors SET count = count + 1 WHERE id = 1', (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// ========== SCHOOL INFO ==========
app.get('/api/school-info', (req, res) => {
    res.json({
        success: true,
        data: {
            name: "St. Mary's Kibabii Boys National School",
            motto: 'Orare et Laborare',
            founded: 1952,
            students: 1600,
            staff: 85,
            counties: 47,
            kcse_mean: 8.93,
            kcse_rank: 85,
            website: 'https://kibabian.vercel.app',
            email: 'info@stmaryskibabii.ac.ke',
            phone: ['0734-741162', '0753 028407'],
            address: 'P.O. Box 85, Bungoma 50200, Kenya',
            location: 'Kibabii, Bungoma County, Kenya'
        }
    });
});

// ========== SPA FALLBACK ==========
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ========== ERROR HANDLING ==========
app.use(errorHandler);

module.exports = app;