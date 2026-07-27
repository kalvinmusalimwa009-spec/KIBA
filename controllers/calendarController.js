// controllers/calendarController.js
const { successResponse, errorResponse } = require('../utils/response');
const db = require('../config/database');
const logger = require('../config/logger');

class CalendarController {
    /**
     * GET /api/v1/calendar/events - Get upcoming events
     */
    async getEvents(req, res) {
        try {
            const { limit = 20 } = req.query;
            
            const defaultEvents = [
                { title: 'Term 1 Opens', date: '2026-01-06', description: 'School reopens for Term 1' },
                { title: 'Mid-Term Break', date: '2026-02-28', description: 'School closes for mid-term break' },
                { title: 'KSEF Regional Competition', date: '2026-03-15', description: 'Science fair at county level' },
                { title: 'Term 1 Closes', date: '2026-04-10', description: 'End of Term 1' },
                { title: 'Term 2 Opens', date: '2026-05-04', description: 'School reopens for Term 2' },
                { title: 'Alumni Homecoming', date: '2026-08-10', description: 'Annual KIDA reunion' },
                { title: 'KCSE Exams Begin', date: '2026-10-26', description: 'National examinations start' },
                { title: 'Graduation Ceremony', date: '2026-12-10', description: 'Form Four graduation' }
            ];
            
            db.all(`SELECT * FROM cached_events WHERE event_date >= date('now') ORDER BY event_date LIMIT ?`,
                [parseInt(limit)], (err, events) => {
                    if (err || !events || events.length === 0) {
                        return successResponse(res, 200, 'Events retrieved', defaultEvents.slice(0, limit));
                    }
                    successResponse(res, 200, 'Events retrieved', events);
                });
        } catch (error) {
            logger.error('Calendar getEvents error:', error);
            errorResponse(res, 500, error.message);
        }
    }

    /**
     * GET /api/v1/calendar/events/month/:year/:month - Get events by month
     */
    async getEventsByMonth(req, res) {
        try {
            const { year, month } = req.params;
            const startDate = `${year}-${month.padStart(2, '0')}-01`;
            const endDate = new Date(year, month, 0).toISOString().split('T')[0];
            
            db.all(`SELECT * FROM cached_events 
                    WHERE event_date BETWEEN ? AND ? 
                    ORDER BY event_date`,
                [startDate, endDate], (err, events) => {
                    if (err) {
                        logger.error('Calendar getEventsByMonth error:', err);
                        return errorResponse(res, 500, err.message);
                    }
                    successResponse(res, 200, 'Events retrieved', events || []);
                });
        } catch (error) {
            logger.error('Calendar getEventsByMonth error:', error);
            errorResponse(res, 500, error.message);
        }
    }

    /**
     * GET /api/v1/calendar/holidays - Get school holidays
     */
    async getHolidays(req, res) {
        try {
            const holidays = [
                { name: 'Good Friday', date: '2026-04-03' },
                { name: 'Easter Monday', date: '2026-04-06' },
                { name: 'Madaraka Day', date: '2026-06-01' },
                { name: 'Utamaduni Day', date: '2026-10-10' },
                { name: 'Jamhuri Day', date: '2026-12-12' },
                { name: 'Christmas Holiday', date: '2026-12-25' }
            ];
            successResponse(res, 200, 'Holidays retrieved', holidays);
        } catch (error) {
            logger.error('Calendar getHolidays error:', error);
            errorResponse(res, 500, error.message);
        }
    }

    /**
     * POST /api/v1/calendar/events - Create event (admin only)
     */
    async createEvent(req, res) {
        try {
            const { title, description, event_date, type } = req.body;
            
            if (!title || !event_date) {
                return errorResponse(res, 400, 'Title and date are required');
            }
            
            db.run(`INSERT INTO cached_events (title, description, event_date, type) VALUES (?, ?, ?, ?)`,
                [title, description || null, event_date, type || 'event'],
                function(err) {
                    if (err) {
                        logger.error('Calendar createEvent error:', err);
                        return errorResponse(res, 500, err.message);
                    }
                    successResponse(res, 201, 'Event created', { id: this.lastID });
                });
        } catch (error) {
            logger.error('Calendar createEvent error:', error);
            errorResponse(res, 500, error.message);
        }
    }

    /**
     * PUT /api/v1/calendar/events/:id - Update event (admin only)
     */
    async updateEvent(req, res) {
        try {
            const { id } = req.params;
            const { title, description, event_date, type } = req.body;
            
            const updates = [];
            const params = [];
            
            if (title !== undefined) { updates.push('title = ?'); params.push(title); }
            if (description !== undefined) { updates.push('description = ?'); params.push(description); }
            if (event_date !== undefined) { updates.push('event_date = ?'); params.push(event_date); }
            if (type !== undefined) { updates.push('type = ?'); params.push(type); }
            
            params.push(id);
            
            db.run(`UPDATE cached_events SET ${updates.join(', ')} WHERE id = ?`, params, function(err) {
                if (err) {
                    logger.error('Calendar updateEvent error:', err);
                    return errorResponse(res, 500, err.message);
                }
                if (this.changes === 0) {
                    return errorResponse(res, 404, 'Event not found');
                }
                successResponse(res, 200, 'Event updated successfully');
            });
        } catch (error) {
            logger.error('Calendar updateEvent error:', error);
            errorResponse(res, 500, error.message);
        }
    }

    /**
     * DELETE /api/v1/calendar/events/:id - Delete event (admin only)
     */
    async deleteEvent(req, res) {
        try {
            const { id } = req.params;
            
            db.run(`DELETE FROM cached_events WHERE id = ?`, [id], function(err) {
                if (err) {
                    logger.error('Calendar deleteEvent error:', err);
                    return errorResponse(res, 500, err.message);
                }
                if (this.changes === 0) {
                    return errorResponse(res, 404, 'Event not found');
                }
                successResponse(res, 200, 'Event deleted successfully');
            });
        } catch (error) {
            logger.error('Calendar deleteEvent error:', error);
            errorResponse(res, 500, error.message);
        }
    }
}

module.exports = new CalendarController();