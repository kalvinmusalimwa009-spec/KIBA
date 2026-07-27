/* ============================================
   CALENDAR ROUTE
   Handles school calendar events
   ============================================ */

const express = require("express");
const router = express.Router();
const db = require("../database");

// Fallback hardcoded events (used when no database events exist)
const defaultEvents = [
  {
    title: "Term 1 Opens",
    date: "2026-01-06",
    description: "School reopens for Term 1",
    type: "term_start",
  },
  {
    title: "Mid-Term Break",
    date: "2026-02-28",
    description: "School closes for mid-term break",
    type: "break",
  },
  {
    title: "KSEF Regional Competition",
    date: "2026-03-15",
    description: "Science fair at county level",
    type: "event",
  },
  {
    title: "Term 1 Closes",
    date: "2026-04-10",
    description: "End of Term 1",
    type: "term_end",
  },
  {
    title: "Term 2 Opens",
    date: "2026-05-04",
    description: "School reopens for Term 2",
    type: "term_start",
  },
  {
    title: "Alumni Homecoming",
    date: "2026-08-10",
    description: "Annual KIDA reunion",
    type: "event",
  },
  {
    title: "KCSE Exams Begin",
    date: "2026-10-26",
    description: "National examinations start",
    type: "exam",
  },
  {
    title: "Graduation Ceremony",
    date: "2026-12-10",
    description: "Form Four graduation",
    type: "event",
  },
];

// GET /api/calendar/events - Get upcoming events
router.get("/events", (req, res) => {
  const { limit = 20, upcoming = true } = req.query;

  let sql = `SELECT * FROM cached_events`;
  const params = [];

  if (upcoming === "true") {
    sql += ` WHERE event_date >= date('now')`;
  }

  sql += ` ORDER BY event_date LIMIT ?`;
  params.push(parseInt(limit));

  db.all(sql, params, (err, events) => {
    if (err || !events || events.length === 0) {
      // Return default events as fallback
      const filteredEvents =
        upcoming === "true"
          ? defaultEvents.filter(
              (e) => e.date >= new Date().toISOString().split("T")[0],
            )
          : defaultEvents;

      return res.json({
        success: true,
        events: filteredEvents.slice(0, limit),
        source: "fallback",
      });
    }

    res.json({
      success: true,
      events: events,
      source: "database",
    });
  });
});

// GET /api/calendar/events/month/:year/:month - Get events by month
router.get("/events/month/:year/:month", (req, res) => {
  const { year, month } = req.params;
  const startDate = `${year}-${month.padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  db.all(
    `SELECT * FROM cached_events 
            WHERE event_date BETWEEN ? AND ? 
            ORDER BY event_date`,
    [startDate, endDate],
    (err, events) => {
      if (err || !events || events.length === 0) {
        const filteredEvents = defaultEvents.filter(
          (e) => e.date >= startDate && e.date <= endDate,
        );
        return res.json({ success: true, events: filteredEvents });
      }
      res.json({ success: true, events: events });
    },
  );
});

// GET /api/calendar/holidays - Get school holidays
router.get("/holidays", (req, res) => {
  const holidays = [
    { name: "Good Friday", date: "2026-04-03", description: "Public Holiday" },
    {
      name: "Easter Monday",
      date: "2026-04-06",
      description: "Public Holiday",
    },
    { name: "Labour Day", date: "2026-05-01", description: "Public Holiday" },
    { name: "Madaraka Day", date: "2026-06-01", description: "Public Holiday" },
    {
      name: "Utamaduni Day",
      date: "2026-10-10",
      description: "Public Holiday",
    },
    { name: "Jamhuri Day", date: "2026-12-12", description: "Public Holiday" },
    {
      name: "Christmas Holiday",
      date: "2026-12-25",
      description: "Christmas Day",
    },
    { name: "Boxing Day", date: "2026-12-26", description: "Boxing Day" },
  ];

  res.json({ success: true, holidays });
});

// POST /api/calendar/events - Add event (admin only - would need auth)
router.post("/events", (req, res) => {
  const { title, description, event_date, event_type } = req.body;

  if (!title || !event_date) {
    return res.status(400).json({ error: "Title and date are required" });
  }

  db.run(
    `INSERT INTO cached_events (title, description, event_date, type)
            VALUES (?, ?, ?, ?)`,
    [title, description || null, event_date, event_type || "event"],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: "Event added", id: this.lastID });
    },
  );
});

module.exports = router;
