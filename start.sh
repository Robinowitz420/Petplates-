#!/bin/bash
# PetPlates Startup Script
# This script starts the development server for the PetPlates platform

echo "🐾 Starting PetPlates Development Server..."
echo ""

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo ""
    echo "Please install Node.js from https://nodejs.org/"
    echo "After installation, restart your terminal and run this script again."
    echo ""
    read -p "Press Enter to exit"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✓ Node.js $NODE_VERSION detected"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        read -p "Press Enter to exit"
        exit 1
    fi
    echo "✓ Dependencies installed"
    echo ""
fi

# Start the development server
echo "Starting Next.js development server..."
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  PetPlates will be available at:"
echo "  http://localhost:3000"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
