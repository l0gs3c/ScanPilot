#!/bin/bash

echo "Starting ScanPilot Backend and Frontend..."
echo

# Set environment
export NODE_ENV=development

# Start backend in background
echo "Starting Backend Server..."
cd backend
python main.py &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "Starting Frontend Server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:8002"
echo "Frontend: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait