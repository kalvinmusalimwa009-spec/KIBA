// routes/api/v1/calendarRoutes.js
const express = require('express');
const router = express.Router();
const CalendarController = require('../../../controllers/calendarController');
const { authenticate } = require('../../../middleware/auth');

// Public routes
router.get('/events', CalendarController.getEvents);
router.get('/events/month/:year/:month', CalendarController.getEventsByMonth);
router.get('/holidays', CalendarController.getHolidays);

// Admin routes
router.post('/events', authenticate, CalendarController.createEvent);
router.put('/events/:id', authenticate, CalendarController.updateEvent);
router.delete('/events/:id', authenticate, CalendarController.deleteEvent);

module.exports = router;