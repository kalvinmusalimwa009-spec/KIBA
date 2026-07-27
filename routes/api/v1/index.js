// routes/api/v1/index.js
const express = require('express');
const router = express.Router();

const contactRoutes = require('./contactRoutes');
const alumniRoutes = require('./alumniRoutes');
const newsletterRoutes = require('./newsletterRoutes');
const admissionsRoutes = require('./admissionsRoutes');
const galleryRoutes = require('./galleryRoutes');
const calendarRoutes = require('./calendarRoutes');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');  // NEW

router.use('/contacts', contactRoutes);
router.use('/alumni', alumniRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/admissions', admissionsRoutes);
router.use('/gallery', galleryRoutes);
router.use('/calendar', calendarRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);  // NEW

router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.0.0',
    });
});

router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working!',
        endpoints: {
            contacts: '/api/v1/contacts',
            alumni: '/api/v1/alumni',
            newsletter: '/api/v1/newsletter',
            admissions: '/api/v1/admissions',
            gallery: '/api/v1/gallery',
            calendar: '/api/v1/calendar',
            auth: '/api/v1/auth',
            admin: '/api/v1/admin',
        }
    });
});

module.exports = router;