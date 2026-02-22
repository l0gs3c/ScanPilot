#!/bin/bash
set -e

echo "Starting ScanPilot Setup for Linux/Mac..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose is not available"
    echo "Please install Docker Compose or ensure Docker Desktop is running"
    exit 1
fi

echo "Docker is available!"

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating environment configuration..."
    cp .env.example .env
    echo ""
    echo "IMPORTANT: Please edit .env file and update the configuration values"
    echo "Especially change SECRET_KEY and database passwords!"
    echo ""
fi

# Create necessary directories
echo "Creating directories..."
mkdir -p backend/logs
mkdir -p backend/storage/scan_results
mkdir -p backend/storage/uploads

# Pull required Docker images
echo "Pulling Docker images..."
docker pull postgres:15-alpine
docker pull redis:7-alpine
docker pull nginx:alpine

# Build and start services
echo "Building and starting ScanPilot services..."
docker compose up -d --build

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Check if services are running
docker compose ps

echo ""
echo "ScanPilot setup completed!"
echo ""
echo "Services:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- API Documentation: http://localhost:8000/docs"
echo ""
echo "To stop services: docker compose down"
echo "To view logs: docker compose logs -f"
echo ""