// server.js - Entry Point
const app = require('./src/app');
const config = require('./src/config/env');
const logger = require('./src/config/logger');

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║   🏫 St. Mary's Kibabii Boys National School (KIBA) API     ║
    ║                                                              ║
    ║   📡 Server running on: http://localhost:${PORT}              ║
    ║   🌐 Environment: ${config.nodeEnv}                              ║
    ║   📁 Frontend: ${__dirname}/../frontend                      ║
    ║                                                              ║
    ║   📧 API Endpoints:                                          ║
    ║      POST /api/v1/contacts      - Contact form               ║
    ║      POST /api/v1/newsletter    - Newsletter signup          ║
    ║      POST /api/v1/admissions    - Admissions applications    ║
    ║      POST /api/v1/alumni        - Alumni registration        ║
    ║      GET  /api/v1/gallery       - Gallery images             ║
    ║      POST /api/v1/gallery       - Upload gallery images      ║
    ║      GET  /api/v1/calendar      - Calendar events            ║
    ║      POST /api/v1/admin/login   - Admin login                ║
    ║                                                              ║
    ║   🎓 Orare et Laborare - Pray and Work                       ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    `);
    
    logger.info(`Server started on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('Shutting down server...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', reason);
});

module.exports = app;