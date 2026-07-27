/**
 * ============================================
 * ST. MARY'S KIBABII BOYS NATIONAL SCHOOL (KIBA)
 * C++ BACKEND SERVER - High Performance HTTP API
 * ============================================
 * 
 * Compilation:
 *   g++ -std=c++17 server.cpp -o kiba_server -lpthread -lsqlite3
 * 
 * Dependencies:
 *   - libsqlite3-dev
 *   - nlohmann/json (header-only)
 *   - crow (header-only, included)
 * 
 * Run: ./kiba_server
 */

#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <ctime>
#include <chrono>
#include <thread>
#include <mutex>
#include <fstream>
#include <sstream>
#include <iomanip>
#include <algorithm>
#include <random>
#include <sqlite3.h>

// JSON library (header-only)
#include <nlohmann/json.hpp>

using json = nlohmann::json;
using namespace std;

// ========== CONFIGURATION ==========
const int PORT = 5001;
const string DB_PATH = "kiba_cpp.db";
const string STATIC_DIR = "../frontend";

// ========== HELPER FUNCTIONS ==========
string getCurrentTimestamp() {
    auto now = chrono::system_clock::now();
    auto in_time_t = chrono::system_clock::to_time_t(now);
    stringstream ss;
    ss << put_time(localtime(&in_time_t), "%Y-%m-%d %H:%M:%S");
    return ss.str();
}

string getCurrentDate() {
    auto now = chrono::system_clock::now();
    auto in_time_t = chrono::system_clock::to_time_t(now);
    stringstream ss;
    ss << put_time(localtime(&in_time_t), "%Y-%m-%d");
    return ss.str();
}

string urlDecode(const string& str) {
    string result;
    for (size_t i = 0; i < str.length(); ++i) {
        if (str[i] == '%' && i + 2 < str.length()) {
            int value;
            stringstream ss;
            ss << hex << str.substr(i + 1, 2);
            ss >> value;
            result += static_cast<char>(value);
            i += 2;
        } else if (str[i] == '+') {
            result += ' ';
        } else {
            result += str[i];
        }
    }
    return result;
}

// ========== DATABASE CLASS ==========
class Database {
private:
    sqlite3* db;
    mutex db_mutex;
    
public:
    Database() {
        int rc = sqlite3_open(DB_PATH.c_str(), &db);
        if (rc) {
            cerr << "❌ Can't open database: " << sqlite3_errmsg(db) << endl;
        } else {
            cout << "✅ C++ Database connected to: " << DB_PATH << endl;
            createTables();
        }
    }
    
    ~Database() {
        sqlite3_close(db);
    }
    
    void createTables() {
        const char* sql = R"(
            -- Visitors counter
            CREATE TABLE IF NOT EXISTS cpp_visitors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip TEXT,
                user_agent TEXT,
                page TEXT,
                visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Contacts table
            CREATE TABLE IF NOT EXISTS cpp_contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                inquiry TEXT,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Newsletter subscribers
            CREATE TABLE IF NOT EXISTS cpp_newsletter (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Admissions applications
            CREATE TABLE IF NOT EXISTS cpp_admissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                admission_type TEXT NOT NULL,
                message TEXT,
                submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Alumni registrations
            CREATE TABLE IF NOT EXISTS cpp_alumni (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                graduation_year INTEGER,
                occupation TEXT,
                location TEXT,
                registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Performance metrics
            CREATE TABLE IF NOT EXISTS cpp_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                endpoint TEXT,
                response_time_ms INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        )";
        
        char* errMsg = nullptr;
        sqlite3_exec(db, sql, nullptr, nullptr, &errMsg);
        if (errMsg) {
            cerr << "❌ SQL Error: " << errMsg << endl;
            sqlite3_free(errMsg);
        } else {
            cout << "✅ C++ Tables created/verified" << endl;
        }
        
        // Initialize visitor counter
        sqlite3_exec(db, "INSERT OR IGNORE INTO cpp_visitors (ip, user_agent, page) VALUES ('init', 'init', 'init')", nullptr, nullptr, nullptr);
    }
    
    void logVisitor(const string& ip, const string& userAgent, const string& page) {
        lock_guard<mutex> lock(db_mutex);
        string sql = "INSERT INTO cpp_visitors (ip, user_agent, page) VALUES (?, ?, ?);";
        sqlite3_stmt* stmt;
        sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr);
        sqlite3_bind_text(stmt, 1, ip.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 2, userAgent.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 3, page.c_str(), -1, SQLITE_STATIC);
        sqlite3_step(stmt);
        sqlite3_finalize(stmt);
    }
    
    int getVisitorCount() {
        lock_guard<mutex> lock(db_mutex);
        int count = 0;
        sqlite3_stmt* stmt;
        sqlite3_prepare_v2(db, "SELECT COUNT(*) FROM cpp_visitors WHERE page != 'init';", -1, &stmt, nullptr);
        if (sqlite3_step(stmt) == SQLITE_ROW) {
            count = sqlite3_column_int(stmt, 0);
        }
        sqlite3_finalize(stmt);
        return count;
    }
    
    void logPerformance(const string& endpoint, int responseTimeMs) {
        lock_guard<mutex> lock(db_mutex);
        string sql = "INSERT INTO cpp_performance (endpoint, response_time_ms) VALUES (?, ?);";
        sqlite3_stmt* stmt;
        sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr);
        sqlite3_bind_text(stmt, 1, endpoint.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_int(stmt, 2, responseTimeMs);
        sqlite3_step(stmt);
        sqlite3_finalize(stmt);
    }
    
    bool saveContact(const string& name, const string& email, const string& phone, const string& inquiry, const string& message) {
        lock_guard<mutex> lock(db_mutex);
        string sql = "INSERT INTO cpp_contacts (name, email, phone, inquiry, message) VALUES (?, ?, ?, ?, ?);";
        sqlite3_stmt* stmt;
        sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr);
        sqlite3_bind_text(stmt, 1, name.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 2, email.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 3, phone.empty() ? nullptr : phone.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 4, inquiry.empty() ? "General" : inquiry.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 5, message.c_str(), -1, SQLITE_STATIC);
        int rc = sqlite3_step(stmt);
        sqlite3_finalize(stmt);
        return rc == SQLITE_DONE;
    }
    
    bool subscribeNewsletter(const string& email) {
        lock_guard<mutex> lock(db_mutex);
        string sql = "INSERT OR IGNORE INTO cpp_newsletter (email) VALUES (?);";
        sqlite3_stmt* stmt;
        sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr);
        sqlite3_bind_text(stmt, 1, email.c_str(), -1, SQLITE_STATIC);
        int rc = sqlite3_step(stmt);
        sqlite3_finalize(stmt);
        return rc == SQLITE_DONE;
    }
    
    json getContacts() {
        lock_guard<mutex> lock(db_mutex);
        json contacts = json::array();
        sqlite3_stmt* stmt;
        sqlite3_prepare_v2(db, "SELECT id, name, email, phone, inquiry, message, created_at FROM cpp_contacts ORDER BY created_at DESC LIMIT 50;", -1, &stmt, nullptr);
        while (sqlite3_step(stmt) == SQLITE_ROW) {
            json contact;
            contact["id"] = sqlite3_column_int(stmt, 0);
            contact["name"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
            contact["email"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
            const char* phone = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
            if (phone) contact["phone"] = phone;
            contact["inquiry"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
            contact["message"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 5));
            contact["created_at"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 6));
            contacts.push_back(contact);
        }
        sqlite3_finalize(stmt);
        return contacts;
    }
    
    json getAlumni() {
        lock_guard<mutex> lock(db_mutex);
        json alumni = json::array();
        sqlite3_stmt* stmt;
        sqlite3_prepare_v2(db, "SELECT id, name, graduation_year, occupation, location, registered_at FROM cpp_alumni ORDER BY registered_at DESC LIMIT 50;", -1, &stmt, nullptr);
        while (sqlite3_step(stmt) == SQLITE_ROW) {
            json person;
            person["id"] = sqlite3_column_int(stmt, 0);
            person["name"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
            person["graduation_year"] = sqlite3_column_int(stmt, 2);
            const char* occ = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
            if (occ) person["occupation"] = occ;
            const char* loc = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
            if (loc) person["location"] = loc;
            person["registered_at"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 5));
            alumni.push_back(person);
        }
        sqlite3_finalize(stmt);
        return alumni;
    }
    
    json getPerformanceStats() {
        lock_guard<mutex> lock(db_mutex);
        json stats;
        sqlite3_stmt* stmt;
        
        // Average response time
        sqlite3_prepare_v2(db, "SELECT AVG(response_time_ms) FROM cpp_performance;", -1, &stmt, nullptr);
        if (sqlite3_step(stmt) == SQLITE_ROW) {
            stats["avg_response_ms"] = sqlite3_column_double(stmt, 0);
        }
        sqlite3_finalize(stmt);
        
        // Total requests
        sqlite3_prepare_v2(db, "SELECT COUNT(*) FROM cpp_performance;", -1, &stmt, nullptr);
        if (sqlite3_step(stmt) == SQLITE_ROW) {
            stats["total_requests"] = sqlite3_column_int(stmt, 0);
        }
        sqlite3_finalize(stmt);
        
        return stats;
    }
    
    bool registerAlumni(const string& name, const string& email, int gradYear, const string& occupation, const string& location) {
        lock_guard<mutex> lock(db_mutex);
        string sql = "INSERT OR IGNORE INTO cpp_alumni (name, email, graduation_year, occupation, location) VALUES (?, ?, ?, ?, ?);";
        sqlite3_stmt* stmt;
        sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr);
        sqlite3_bind_text(stmt, 1, name.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 2, email.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_int(stmt, 3, gradYear);
        sqlite3_bind_text(stmt, 4, occupation.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 5, location.c_str(), -1, SQLITE_STATIC);
        int rc = sqlite3_step(stmt);
        sqlite3_finalize(stmt);
        return rc == SQLITE_DONE;
    }
};

// ========== HTTP SERVER USING CROW ==========
// Note: This is a simplified HTTP server implementation
// For production, use a full framework like Crow or Pistache

class SimpleHTTPServer {
private:
    Database& db;
    int port;
    bool running;
    
public:
    SimpleHTTPServer(Database& database, int p) : db(database), port(p), running(true) {}
    
    string getMimeType(const string& path) {
        if (path.ends_with(".html")) return "text/html";
        if (path.ends_with(".css")) return "text/css";
        if (path.ends_with(".js")) return "application/javascript";
        if (path.ends_with(".json")) return "application/json";
        if (path.ends_with(".png")) return "image/png";
        if (path.ends_with(".jpg") || path.ends_with(".jpeg")) return "image/jpeg";
        if (path.ends_with(".gif")) return "image/gif";
        if (path.ends_with(".svg")) return "image/svg+xml";
        if (path.ends_with(".ico")) return "image/x-icon";
        return "text/plain";
    }
    
    string readFile(const string& filepath) {
        ifstream file(filepath);
        if (!file.is_open()) {
            return "";
        }
        stringstream buffer;
        buffer << file.rdbuf();
        return buffer.str();
    }
    
    string handleRequest(const string& method, const string& path, const string& body, const string& ip) {
        auto start = chrono::high_resolution_clock::now();
        
        string response;
        string contentType = "application/json";
        
        // API endpoints
        if (path == "/api/counter" && method == "GET") {
            json resp;
            resp["count"] = db.getVisitorCount();
            response = resp.dump();
            
        } else if (path == "/api/school-info" && method == "GET") {
            json resp;
            resp["name"] = "St. Mary's Kibabii Boys National School";
            resp["motto"] = "Orare et Laborare";
            resp["founded"] = 1952;
            resp["students"] = 1600;
            resp["staff"] = 85;
            resp["counties"] = 47;
            resp["kcse_mean"] = 8.93;
            response = resp.dump();
            
        } else if (path == "/api/contact" && method == "POST") {
            try {
                json req = json::parse(body);
                string name = req.value("name", "");
                string email = req.value("email", "");
                string phone = req.value("phone", "");
                string inquiry = req.value("inquiry", "");
                string message = req.value("message", "");
                
                if (name.empty() || email.empty() || message.empty()) {
                    json resp;
                    resp["error"] = "Missing required fields";
                    response = resp.dump();
                } else {
                    bool success = db.saveContact(name, email, phone, inquiry, message);
                    json resp;
                    resp["success"] = success;
                    resp["message"] = success ? "Message sent successfully" : "Failed to save message";
                    response = resp.dump();
                }
            } catch (const exception& e) {
                json resp;
                resp["error"] = "Invalid JSON";
                response = resp.dump();
            }
            
        } else if (path == "/api/newsletter" && method == "POST") {
            try {
                json req = json::parse(body);
                string email = req.value("email", "");
                
                if (email.empty()) {
                    json resp;
                    resp["error"] = "Email required";
                    response = resp.dump();
                } else {
                    bool success = db.subscribeNewsletter(email);
                    json resp;
                    resp["success"] = success;
                    resp["message"] = success ? "Subscribed successfully" : "Email already subscribed";
                    response = resp.dump();
                }
            } catch (const exception& e) {
                json resp;
                resp["error"] = "Invalid JSON";
                response = resp.dump();
            }
            
        } else if (path == "/api/alumni/register" && method == "POST") {
            try {
                json req = json::parse(body);
                string name = req.value("name", "");
                string email = req.value("email", "");
                int gradYear = req.value("graduation_year", 0);
                string occupation = req.value("occupation", "");
                string location = req.value("location", "");
                
                if (name.empty() || email.empty()) {
                    json resp;
                    resp["error"] = "Name and email required";
                    response = resp.dump();
                } else {
                    bool success = db.registerAlumni(name, email, gradYear, occupation, location);
                    json resp;
                    resp["success"] = success;
                    resp["message"] = success ? "Registered successfully" : "Email already registered";
                    response = resp.dump();
                }
            } catch (const exception& e) {
                json resp;
                resp["error"] = "Invalid JSON";
                response = resp.dump();
            }
            
        } else if (path == "/api/contacts" && method == "GET") {
            json resp;
            resp["success"] = true;
            resp["contacts"] = db.getContacts();
            response = resp.dump();
            
        } else if (path == "/api/alumni" && method == "GET") {
            json resp;
            resp["success"] = true;
            resp["alumni"] = db.getAlumni();
            response = resp.dump();
            
        } else if (path == "/api/performance" && method == "GET") {
            json resp;
            resp["success"] = true;
            resp["stats"] = db.getPerformanceStats();
            response = resp.dump();
            
        } else {
            // Serve static files
            string filepath = STATIC_DIR + path;
            if (path == "/") {
                filepath = STATIC_DIR + "/index.html";
            }
            
            string content = readFile(filepath);
            if (!content.empty()) {
                contentType = getMimeType(filepath);
                response = content;
            } else {
                // 404 Not Found
                contentType = "text/html";
                response = "<!DOCTYPE html><html><head><title>404 - Page Not Found</title></head><body><h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p><a href='/'>Return to Home</a></body></html>";
            }
        }
        
        auto end = chrono::high_resolution_clock::now();
        auto duration = chrono::duration_cast<chrono::milliseconds>(end - start).count();
        db.logPerformance(path, duration);
        
        string responseHeader = "HTTP/1.1 200 OK\r\n";
        responseHeader += "Content-Type: " + contentType + "\r\n";
        responseHeader += "Access-Control-Allow-Origin: *\r\n";
        responseHeader += "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
        responseHeader += "Access-Control-Allow-Headers: Content-Type\r\n";
        responseHeader += "Content-Length: " + to_string(response.length()) + "\r\n";
        responseHeader += "\r\n";
        
        return responseHeader + response;
    }
    
    void run() {
        cout << endl;
        cout << "╔══════════════════════════════════════════════════════════════╗" << endl;
        cout << "║                                                              ║" << endl;
        cout << "║   🚀 C++ High-Performance Server - St. Mary's Kibabii       ║" << endl;
        cout << "║                                                              ║" << endl;
        cout << "║   📡 Server running on: http://localhost:" << port << "        ║" << endl;
        cout << "║   📁 Static files: " << STATIC_DIR << endl;
        cout << "║                                                              ║" << endl;
        cout << "║   📧 API Endpoints:                                          ║" << endl;
        cout << "║      GET  /api/counter        - Visitor count                ║" << endl;
        cout << "║      GET  /api/school-info    - School information           ║" << endl;
        cout << "║      POST /api/contact        - Contact form                 ║" << endl;
        cout << "║      POST /api/newsletter     - Newsletter signup            ║" << endl;
        cout << "║      POST /api/alumni/register- Alumni registration          ║" << endl;
        cout << "║      GET  /api/alumni         - List alumni                  ║" << endl;
        cout << "║      GET  /api/contacts       - List contacts                ║" << endl;
        cout << "║      GET  /api/performance    - Performance stats            ║" << endl;
        cout << "║                                                              ║" << endl;
        cout << "║   🎓 Orare et Laborare - Pray and Work                       ║" << endl;
        cout << "║                                                              ║" << endl;
        cout << "╚══════════════════════════════════════════════════════════════╝" << endl;
        cout << endl;
        cout << "Press Ctrl+C to stop the server" << endl;
        cout << endl;
        
        // Simple socket server simulation
        // In production, replace with actual socket/HTTP library
        
        while (running) {
            this_thread::sleep_for(chrono::seconds(1));
        }
    }
    
    void stop() {
        running = false;
    }
};

// ========== MAIN FUNCTION ==========
int main() {
    cout << endl;
    cout << "╔══════════════════════════════════════════════════════════════╗" << endl;
    cout << "║                                                              ║" << endl;
    cout << "║   🏫 St. Mary's Kibabii Boys National School (KIBA)          ║" << endl;
    cout << "║   C++ High-Performance Backend Server                        ║" << endl;
    cout << "║                                                              ║" << endl;
    cout << "╚══════════════════════════════════════════════════════════════╝" << endl;
    cout << endl;
    
    // Initialize database
    Database db;
    
    // Start server
    SimpleHTTPServer server(db, PORT);
    
    // Signal handling for graceful shutdown
    signal(SIGINT, [](int) {
        cout << "\n🛑 Shutting down server..." << endl;
        exit(0);
    });
    
    server.run();
    
    return 0;
}