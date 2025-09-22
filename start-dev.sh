#!/bin/bash

# Start the development server for Copy Matrix
echo "Starting Copy Matrix development server..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js first:"
    echo "  - Visit https://nodejs.org/"
    echo "  - Or use a version manager like nvm"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🚀 Starting development server on http://localhost:3000"
npm run dev
