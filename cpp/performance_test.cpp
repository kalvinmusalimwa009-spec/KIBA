/**
 * ============================================
 * PERFORMANCE TESTER FOR C++ BACKEND
 * Tests concurrent requests and response times
 * ============================================
 * 
 * Compile: g++ -std=c++17 performance_test.cpp -o perf_test -lpthread
 * Run: ./perf_test
 */

#include <iostream>
#include <thread>
#include <vector>
#include <chrono>
#include <atomic>
#include <curl/curl.h>
#include <nlohmann/json.hpp>

using json = nlohmann::json;
using namespace std;

atomic<int> successCount(0);
atomic<int> failCount(0);
vector<long> responseTimes;

size_t WriteCallback(void* contents, size_t size, size_t nmemb, string* response) {
    size_t totalSize = size * nmemb;
    response->append((char*)contents, totalSize);
    return totalSize;
}

void makeRequest(const string& url, const string& method, const string& body = "") {
    auto start = chrono::high_resolution_clock::now();
    
    CURL* curl = curl_easy_init();
    if (curl) {
        string response;
        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
        
        if (method == "POST") {
            curl_easy_setopt(curl, CURLOPT_POST, 1L);
            curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body.c_str());
            curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, body.length());
            struct curl_slist* headers = nullptr;
            headers = curl_slist_append(headers, "Content-Type: application/json");
            curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        }
        
        CURLcode res = curl_easy_perform(curl);
        
        auto end = chrono::high_resolution_clock::now();
        auto duration = chrono::duration_cast<chrono::milliseconds>(end - start).count();
        
        if (res == CURLE_OK) {
            successCount++;
            responseTimes.push_back(duration);
        } else {
            failCount++;
        }
        
        curl_easy_cleanup(curl);
    }
}

void runLoadTest(int numRequests, int concurrency) {
    cout << "\n📊 Running load test..." << endl;
    cout << "   Requests: " << numRequests << endl;
    cout << "   Concurrency: " << concurrency << endl;
    cout << "   URL: http://localhost:5001/api/school-info" << endl;
    
    successCount = 0;
    failCount = 0;
    responseTimes.clear();
    
    auto start = chrono::high_resolution_clock::now();
    
    vector<thread> threads;
    int requestsPerThread = numRequests / concurrency;
    
    for (int t = 0; t < concurrency; t++) {
        threads.emplace_back([requestsPerThread]() {
            for (int i = 0; i < requestsPerThread; i++) {
                makeRequest("http://localhost:5001/api/school-info", "GET");
            }
        });
    }
    
    for (auto& thread : threads) {
        thread.join();
    }
    
    auto end = chrono::high_resolution_clock::now();
    auto totalDuration = chrono::duration_cast<chrono::milliseconds>(end - start).count();
    
    long avgResponse = 0;
    for (long rt : responseTimes) {
        avgResponse += rt;
    }
    if (!responseTimes.empty()) {
        avgResponse /= responseTimes.size();
    }
    
    cout << "\n📈 Results:" << endl;
    cout << "   ✅ Successful: " << successCount.load() << endl;
    cout << "   ❌ Failed: " << failCount.load() << endl;
    cout << "   ⏱️  Total time: " << totalDuration << " ms" << endl;
    cout << "   ⚡ Requests/sec: " << (successCount.load() * 1000.0 / totalDuration) << endl;
    cout << "   📊 Avg response: " << avgResponse << " ms" << endl;
}

void testAPIEndpoints() {
    cout << "\n🧪 Testing API Endpoints..." << endl;
    
    // Test school info
    cout << "   Testing GET /api/school-info... ";
    makeRequest("http://localhost:5001/api/school-info", "GET");
    if (successCount.load() > 0) {
        cout << "✅ PASSED" << endl;
    } else {
        cout << "❌ FAILED" << endl;
    }
    
    // Test counter
    cout << "   Testing GET /api/counter... ";
    makeRequest("http://localhost:5001/api/counter", "GET");
    if (successCount.load() > 0) {
        cout << "✅ PASSED" << endl;
    } else {
        cout << "❌ FAILED" << endl;
    }
    
    // Test contact form
    cout << "   Testing POST /api/contact... ";
    json contactData;
    contactData["name"] = "Test User";
    contactData["email"] = "test@example.com";
    contactData["message"] = "This is a test message";
    makeRequest("http://localhost:5001/api/contact", "POST", contactData.dump());
    
    // Reset counter for test results
    successCount = 0;
}

int main() {
    cout << "╔══════════════════════════════════════════════════════════════╗" << endl;
    cout << "║         C++ Backend Performance Tester - Kiba School         ║" << endl;
    cout << "╚══════════════════════════════════════════════════════════════╝" << endl;
    
    curl_global_init(CURL_GLOBAL_ALL);
    
    // First test API endpoints
    testAPIEndpoints();
    
    // Run load tests
    runLoadTest(100, 10);   // 100 requests, 10 concurrent threads
    runLoadTest(500, 20);   // 500 requests, 20 concurrent threads
    runLoadTest(1000, 50);  // 1000 requests, 50 concurrent threads
    
    curl_global_cleanup();
    
    cout << "\n✅ All tests completed!" << endl;
    
    return 0;
}