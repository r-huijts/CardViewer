#!/bin/bash

echo "Setting up Card Viewer application..."

# Build backend
echo "Building backend..."
cd backend
npm run build

# Create uploads directory if it doesn't exist
mkdir -p uploads

echo "Setup complete!"
echo ""
echo "To start the application:"
echo "1. Make sure MySQL is running and execute: mysql -u root -p < backend/database.sql"
echo "2. Update backend/.env with your database credentials"
echo "3. Start backend: cd backend && npm start"
echo "4. Start frontend: cd frontend && npm start"
echo ""
echo "Default admin credentials:"
echo "Username: admin"
echo "Password: admin123"