# C++ Backend for St. Mary's Kibabii School

## Overview

This C++ backend provides a high-performance HTTP API server for the St. Mary's Kibabii Boys National School website. It handles contact forms, newsletter subscriptions, alumni registrations, and serves static files with low latency and high throughput.

## Features

- **High Performance**: C++ with SQLite3 for fast database operations
- **RESTful API**: Clean API endpoints for all frontend interactions
- **Request Logging**: Performance metrics and visitor tracking
- **Concurrent Handling**: Multi-threaded request processing
- **Static File Serving**: Serves HTML, CSS, JS files from frontend directory

## Requirements

### Build Dependencies

```bash
sudo apt-get update
sudo apt-get install -y g++ make libsqlite3-dev nlohmann-json3-dev libcurl4-openssl-dev
```
