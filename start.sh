#!/bin/bash

# Function to kill processes on exit
cleanup() {
    echo "Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "Starting Hotspot Crawler..."

# Start Backend
echo "Starting Backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "Backend running on port 8000 (PID: $BACKEND_PID)"

# Start Frontend
echo "Starting Frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

npm run dev -- --host &
FRONTEND_PID=$!
echo "Frontend running on port 5173 (PID: $FRONTEND_PID)"

echo "------------------------------------------------"
echo "Access the application at: http://localhost:5173"
echo "API Documentation at: http://localhost:8000/docs"
echo "------------------------------------------------"

# Wait
wait $BACKEND_PID $FRONTEND_PID
