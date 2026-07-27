-- ============================================
-- ST. MARY'S KIBABII BOYS NATIONAL SCHOOL
-- DATABASE SCHEMA
-- ============================================

-- Visitors counter
CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY,
    count INTEGER DEFAULT 0
);

INSERT OR IGNORE INTO visitors (id, count) VALUES (1, 0);

-- Contact messages
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    inquiry TEXT,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admissions applications
CREATE TABLE IF NOT EXISTS admissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    admission_type TEXT NOT NULL,
    previous_school TEXT,
    kcpe_score INTEGER,
    message TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Alumni registrations (KIDA)
CREATE TABLE IF NOT EXISTS alumni_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    graduation_year INTEGER,
    occupation TEXT,
    location TEXT,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Gallery categories
CREATE TABLE IF NOT EXISTS gallery_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT OR IGNORE INTO gallery_categories (name, slug, description) VALUES 
    ('School Events', 'events', 'School functions, assemblies, and ceremonies'),
    ('Sports', 'sports', 'Football, rugby, athletics, and other sports'),
    ('Academics', 'academics', 'Classroom activities, science fair, competitions'),
    ('Facilities', 'facilities', 'School buildings, labs, library, chapel'),
    ('Staff & Students', 'staff-students', 'Teachers and student life'),
    ('Alumni', 'alumni', 'Alumni events and reunions');

-- Gallery images
CREATE TABLE IF NOT EXISTS gallery_images (
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
);

-- Admin users (default password: Admin@Kiba2024)
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'editor',
    is_active INTEGER DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO admin_users (username, password_hash, email, full_name, role) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr4VpYq6qfGqZqxqWqYqWqYqWYqW', 'admin@stmaryskibabii.ac.ke', 'School Administrator', 'super_admin');

-- Admin sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id)
);

-- Admin activity log
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id)
);

-- Cached calendar events
CREATE TABLE IF NOT EXISTS cached_events (
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
);

-- Insert default calendar events
INSERT OR IGNORE INTO cached_events (title, description, event_date, type) VALUES 
    ('Term 1 Opens', 'School reopens for Term 1', '2026-01-06', 'term_start'),
    ('Mid-Term Break', 'School closes for mid-term break', '2026-02-28', 'break'),
    ('KSEF Regional Competition', 'Science fair at county level', '2026-03-15', 'event'),
    ('Term 1 Closes', 'End of Term 1', '2026-04-10', 'term_end'),
    ('Term 2 Opens', 'School reopens for Term 2', '2026-05-04', 'term_start'),
    ('Alumni Homecoming', 'Annual KIDA reunion', '2026-08-10', 'event'),
    ('KCSE Exams Begin', 'National examinations start', '2026-10-26', 'exam'),
    ('Graduation Ceremony', 'Form Four graduation', '2026-12-10', 'event');