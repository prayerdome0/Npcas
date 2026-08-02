#!/bin/bash

# Sims Academy Setup Script
# This script helps you set up the Sims Academy LMS project

echo "=========================================="
echo "Sims Academy LMS Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 18+ first."
    echo "You can download it from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/^v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Node.js version $NODE_VERSION detected. Please upgrade to Node.js 18+."
    exit 1
fi

echo "✓ Node.js $NODE_VERSION is installed"
echo ""

# Check if npm is installed
echo "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

echo "✓ npm is installed"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Check for PostgreSQL
echo "Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed."
    read -p "Would you like to install PostgreSQL? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Installing PostgreSQL..."
        # Try different installation methods based on OS
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y postgresql postgresql-contrib
        elif command -v yum &> /dev/null; then
            sudo yum install -y postgresql-server postgresql-contrib
        elif command -v brew &> /dev/null; then
            brew install postgresql
        else
            echo "Could not detect package manager. Please install PostgreSQL manually."
            echo "For Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
            echo "For CentOS/RHEL: sudo yum install postgresql-server postgresql-contrib"
            echo "For macOS: brew install postgresql"
            exit 1
        fi
        
        # Initialize and start PostgreSQL
        if command -v pg_ctl &> /dev/null; then
            echo "Initializing PostgreSQL database..."
            initdb $PREFIX/var/lib/postgresql
            pg_ctl -D $PREFIX/var/lib/postgresql start
        fi
    else
        echo "Skipping PostgreSQL installation. Please install it manually."
        exit 1
    fi
fi

echo "✓ PostgreSQL is installed"
echo ""

# Create database
echo "Creating Sims Academy database..."
if createdb simsacademy 2>/dev/null; then
    echo "✓ Database 'simsacademy' created"
else
    echo "⚠ Database 'simsacademy' may already exist or creation failed"
fi
echo ""

# Run database migrations
echo "Running database migrations..."
npm run db:push
echo "✓ Database migrations completed"
echo ""

# Create environment file
echo "Creating environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ .env file created from .env.example"
    echo ""
    echo "Please edit .env with your configuration:"
    echo "  - DATABASE_URL: Your PostgreSQL connection string"
    echo "  - AUTH_SECRET: Generate with: openssl rand -base64 32"
    echo "  - CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name"
    echo "  - CLOUDINARY_API_KEY: Your Cloudinary API key"
    echo "  - CLOUDINARY_API_SECRET: Your Cloudinary API secret"
    echo "  - LIVEKIT_URL: Your LiveKit server URL"
    echo "  - STRIPE_SECRET_KEY: Your Stripe secret key"
    echo "  - RESEND_API_KEY: Your Resend API key"
else
    echo "⚠ .env file already exists. Skipping creation."
fi
echo ""

# Generate auth secret if needed
echo "Checking AUTH_SECRET in .env..."
if ! grep -q "AUTH_SECRET" .env || grep -q "your-secret-key-here" .env; then
    SECRET=$(openssl rand -base64 32)
    echo "Generating new AUTH_SECRET..."
    sed -i "s/AUTH_SECRET=.*/AUTH_SECRET=$SECRET/" .env
    echo "✓ AUTH_SECRET generated and added to .env"
else
    echo "✓ AUTH_SECRET already configured"
fi
echo ""

# Start development server
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser."
echo ""
echo "For production deployment:"
echo "  1. Push to GitHub"
echo "  2. Import to Vercel"
echo "  3. Add environment variables in Vercel"
echo "  4. Deploy!"
echo ""
