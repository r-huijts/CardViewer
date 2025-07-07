#!/bin/bash

echo "Starting Card Viewer Demo..."
echo "==============================="

# Check if MySQL is running (you may need to start it manually)
echo "1. Make sure MySQL is running"
echo "2. Import the database schema:"
echo "   mysql -u root -p < backend/database.sql"
echo ""

# Start backend
echo "Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 3

# Start frontend
echo "Starting frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "Application started!"
echo "======================================"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5001"
echo ""
echo "Default admin credentials:"
echo "Username: admin"
echo "Password: admin123"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait