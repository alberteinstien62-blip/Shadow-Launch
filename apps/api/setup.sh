#!/bin/bash

# ShadowLaunch API Setup Script

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         ShadowLaunch API - Setup Script                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "→ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✓ Node.js $NODE_VERSION found"
echo ""

# Install dependencies
echo "→ Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "✗ Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Generate Prisma client
echo "→ Generating Prisma client..."
npm run prisma:generate
if [ $? -ne 0 ]; then
    echo "✗ Failed to generate Prisma client"
    exit 1
fi
echo "✓ Prisma client generated"
echo ""

# Run migrations
echo "→ Running database migrations..."
npm run prisma:migrate
if [ $? -ne 0 ]; then
    echo "✗ Failed to run migrations"
    exit 1
fi
echo "✓ Database migrations complete"
echo ""

# Success message
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              Setup Complete! 🚀                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Review .env file for configuration"
echo "  2. Run 'npm run dev' to start development server"
echo "  3. Visit http://localhost:3001/health to verify"
echo ""
echo "For detailed instructions, see QUICKSTART.md"
echo ""
