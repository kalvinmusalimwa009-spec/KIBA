/* ============================================
   DATABASE CONNECTION & INITIALIZATION
   SQLite3 Database for Kiba School
   ============================================ */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, process.env.DB_PATH || "kiba.db");
const db = new sqlite3.Database(dbPath);

// ========== CREATE TABLES (Using serialize to ensure sequential execution) ==========
const createTables = () => {
  db.serialize(() => {
    // Visitors counter table
    db.run(`CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY,
        count INTEGER DEFAULT 0
    )`);
    db.run(`INSERT OR IGNORE INTO visitors (id, count) VALUES (1, 0)`);

    // Contact messages table
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        inquiry TEXT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Newsletter subscribers table
    db.run(`CREATE TABLE IF NOT EXISTS newsletter (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Admissions applications table
    db.run(`CREATE TABLE IF NOT EXISTS admissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        admission_type TEXT NOT NULL,
        previous_school TEXT,
        kcpe_score INTEGER,
        message TEXT,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Alumni registrations table
    db.run(`CREATE TABLE IF NOT EXISTS alumni_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        graduation_year INTEGER,
        occupation TEXT,
        location TEXT,
        registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Gallery categories table
    db.run(`CREATE TABLE IF NOT EXISTS gallery_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default categories
    const categories = [
      { name: "School Events", slug: "events", description: "School functions, assemblies, and ceremonies" },
      { name: "Sports", slug: "sports", description: "Football, rugby, athletics, and other sports" },
      { name: "Academics", slug: "academics", description: "Classroom activities, science fair, competitions" },
      { name: "Facilities", slug: "facilities", description: "School buildings, labs, library, chapel" },
      { name: "Staff & Students", slug: "staff-students", description: "Teachers and student life" },
      { name: "Alumni", slug: "alumni", description: "Alumni events and reunions" }
    ];

    categories.forEach((cat) => {
      db.run(`INSERT OR IGNORE INTO gallery_categories (name, slug, description) VALUES (?, ?, ?)`,
        [cat.name, cat.slug, cat.description]
      );
    });

    // Gallery images table
    db.run(`CREATE TABLE IF NOT EXISTS gallery_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        title TEXT,
        description TEXT,
        category TEXT DEFAULT 'general',
        file_path TEXT NOT NULL,
        thumbnail_path TEXT NOT NULL,
        file_size INTEGER,
        mime_type TEXT,
        width INTEGER,
        height INTEGER,
        uploaded_by TEXT,
        view_count INTEGER DEFAULT 0,
        is_featured INTEGER DEFAULT 0,
        is_approved INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Admin users table
    db.run(`CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        role TEXT DEFAULT 'editor',
        is_active INTEGER DEFAULT 1,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default admin user (password: Admin@Kiba2024)
    const defaultPasswordHash = "$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr4VpYq6qfGqZqxqWqYqWqYqWYqW";
    db.run(`INSERT OR IGNORE INTO admin_users (username, password_hash, email, full_name, role) 
            VALUES (?, ?, ?, ?, ?)`,
      ["admin", defaultPasswordHash, "admin@stmaryskibabii.ac.ke", "School Administrator", "super_admin"]
    );

    // Admin sessions table
    db.run(`CREATE TABLE IF NOT EXISTS admin_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admin_users(id)
    )`);

    // Admin activity log table
    db.run(`CREATE TABLE IF NOT EXISTS admin_activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admin_users(id)
    )`);

    // Cached calendar events table
    db.run(`CREATE TABLE IF NOT EXISTS cached_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT,
        title TEXT,
        description TEXT,
        event_date DATE,
        start_time TEXT,
        end_time TEXT,
        location TEXT,
        color TEXT,
        cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log("✅ Database tables initialized");
  });
};

// ========== CREATE UPLOADS FOLDER ==========
const uploadsDir = path.join(__dirname, "uploads");
const galleryDir = path.join(uploadsDir, "gallery");
const thumbnailsDir = path.join(uploadsDir, "thumbnails");
const tempDir = path.join(uploadsDir, "temp");

[uploadsDir, galleryDir, thumbnailsDir, tempDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// ========== INITIALIZE DATABASE ==========
createTables();

module.exports = db;