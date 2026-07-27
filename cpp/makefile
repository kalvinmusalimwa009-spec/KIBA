# ============================================
# ST. MARY'S KIBABII - C++ BACKEND MAKEFILE
# ============================================

CXX = g++
CXXFLAGS = -std=c++17 -Wall -O2 -pthread
LDFLAGS = -lsqlite3 -lpthread

TARGET = kiba_server
SOURCES = server.cpp
OBJECTS = $(SOURCES:.cpp=.o)

# Colors for output
GREEN = \033[0;32m
RED = \033[0;31m
NC = \033[0m

all: $(TARGET)

$(TARGET): $(OBJECTS)
	@echo "$(GREEN)🔨 Linking...$(NC)"
	$(CXX) $(OBJECTS) -o $(TARGET) $(LDFLAGS)
	@echo "$(GREEN)✅ Build complete: $(TARGET)$(NC)"

%.o: %.cpp
	@echo "$(GREEN)📦 Compiling $<...$(NC)"
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	@echo "$(RED)🧹 Cleaning...$(NC)"
	rm -f $(OBJECTS) $(TARGET)
	@echo "$(GREEN)✅ Clean complete$(NC)"

run: $(TARGET)
	@echo "$(GREEN)🚀 Starting server...$(NC)"
	./$(TARGET)

install-deps:
	@echo "$(GREEN)📦 Installing dependencies...$(NC)"
	sudo apt-get update
	sudo apt-get install -y libsqlite3-dev nlohmann-json3-dev
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

test:
	@echo "$(GREEN)🧪 Testing API endpoints...$(NC)"
	@echo "Testing /api/school-info..."
	curl -s http://localhost:5001/api/school-info | jq .
	@echo ""
	@echo "Testing /api/counter..."
	curl -s http://localhost:5001/api/counter | jq .
	@echo ""
	@echo "$(GREEN)✅ Tests complete$(NC)"

.PHONY: all clean run install-deps test