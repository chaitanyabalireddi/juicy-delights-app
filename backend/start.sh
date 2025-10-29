#!/bin/bash

# Juicy Delights Backend Startup Script

echo "🚀 Starting Juicy Delights Backend Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   Run: mongod"
    exit 1
fi

# Check if Redis is running
if ! pgrep -x "redis-server" > /dev/null; then
    echo "⚠️  Redis is not running. Please start Redis first."
    echo "   Run: redis-server"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please update the .env file with your configuration."
    echo "   Required: MongoDB URI, JWT secrets, payment keys, email/SMS config"
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Seed the database if needed
echo "🌱 Seeding database..."
npm run seed

# Start the server
echo "🚀 Starting server..."
npm start
