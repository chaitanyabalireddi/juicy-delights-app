#!/bin/bash

# Quick deployment script for Fly.io
# Usage: ./deploy-fly.sh

echo "🚀 Deploying Fruit Jet Backend to Fly.io..."
echo ""

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI not found. Please install it first:"
    echo "   Windows: iwr https://fly.io/install.ps1 -useb | iex"
    echo "   Mac/Linux: curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if logged in
if ! fly auth whoami &> /dev/null; then
    echo "⚠️  Not logged in to Fly.io. Logging in..."
    fly auth login
fi

# Deploy
echo "📦 Deploying application..."
fly deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔍 Check your app status:"
echo "   fly status"
echo ""
echo "📋 View logs:"
echo "   fly logs"
echo ""
echo "🌐 Open in browser:"
echo "   fly open"

