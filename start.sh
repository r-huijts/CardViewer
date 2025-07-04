#!/bin/bash

# CardViewer Application Startup Script
# This script starts both the backend (Node.js/SQLite) and frontend (React) on available ports

set -e

echo "🚀 Starting CardViewer Application..."
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    exit 0
}

# Function to check if a port is in use
port_in_use() {
    local port=$1
    if command -v lsof > /dev/null; then
        lsof -i :$port > /dev/null 2>&1
    elif command -v netstat > /dev/null; then
        netstat -an | grep ":$port " > /dev/null 2>&1
    else
        # Fallback: try to bind to the port
        (echo > /dev/tcp/localhost/$port) > /dev/null 2>&1
    fi
}

# Function to find next available port starting from a given port
find_available_port() {
    local start_port=$1
    local port=$start_port
    while port_in_use $port; do
        port=$((port + 1))
        if [ $port -gt 65535 ]; then
            echo "Error: No available ports found" >&2
            exit 1
        fi
    done
    echo $port
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the CardViewer root directory"
    echo "Expected directory structure:"
    echo "  CardViewer/"
    echo "    ├── backend/"
    echo "    ├── frontend/"
    echo "    └── start.sh"
    exit 1
fi

# Find available ports
echo "🔍 Finding available ports..."
BACKEND_PORT=$(find_available_port 3001)
FRONTEND_PORT=$(find_available_port 3000)

# If default backend port is taken, we need to update the frontend's proxy
if [ $BACKEND_PORT -ne 3001 ]; then
    echo "⚙️ Backend port 3001 is in use, using port $BACKEND_PORT"
    echo "⚙️ Updating frontend proxy configuration..."
    
    # Update package.json proxy setting
    if command -v jq > /dev/null; then
        jq --arg port "$BACKEND_PORT" '.proxy = "http://localhost:" + $port' frontend/package.json > frontend/package.json.tmp && mv frontend/package.json.tmp frontend/package.json
    else
        # Fallback: use sed
        sed -i.bak "s|\"proxy\": \"http://localhost:[0-9]*\"|\"proxy\": \"http://localhost:$BACKEND_PORT\"|" frontend/package.json
    fi
fi

if [ $FRONTEND_PORT -ne 3000 ]; then
    echo "⚙️ Frontend port 3000 is in use, using port $FRONTEND_PORT"
fi

# Install dependencies if node_modules don't exist
echo "📦 Checking dependencies..."

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Ensure uploads directory exists
mkdir -p backend/uploads

# Create/update backend .env file with the correct port
echo "⚙️ Configuring backend port..."
cat > backend/.env << EOF
PORT=$BACKEND_PORT
SESSION_SECRET=your-secret-key-change-in-production
NODE_ENV=development
EOF

# Start Backend Server
echo "🔧 Starting backend server on port $BACKEND_PORT..."
cd backend
PORT=$BACKEND_PORT npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start"
    exit 1
fi

echo "✅ Backend server started (PID: $BACKEND_PID)"

# Start Frontend Server
echo "🎨 Starting frontend server on port $FRONTEND_PORT..."
cd frontend
PORT=$FRONTEND_PORT BROWSER=none npm start &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend failed to start"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Frontend server started (PID: $FRONTEND_PID)"
echo ""
echo "🎉 CardViewer is now running!"
echo ""
echo "📱 Frontend: http://localhost:$FRONTEND_PORT"
echo "🔗 Backend API: http://localhost:$BACKEND_PORT"
echo ""
echo "💡 Default admin login:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📝 Ports used:"
echo "   Backend: $BACKEND_PORT $([ $BACKEND_PORT -ne 3001 ] && echo "(auto-detected, default 3001 was in use)" || echo "(default)")"
echo "   Frontend: $FRONTEND_PORT $([ $FRONTEND_PORT -ne 3000 ] && echo "(auto-detected, default 3000 was in use)" || echo "(default)")"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Automatically open browser if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🌐 Opening browser..."
    sleep 2
    open "http://localhost:$FRONTEND_PORT" 2>/dev/null || true
fi

# Wait for either process to exit
wait