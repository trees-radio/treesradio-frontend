#!/bin/bash

# Manual Firebase rules deployment script
# Usage: ./deploy-rules.sh [staging|production]

ENVIRONMENT=${1:-staging}

if [ "$ENVIRONMENT" = "staging" ]; then
    PROJECT_ID="treesradio-staging"
    echo "🔧 Deploying rules to STAGING environment..."
elif [ "$ENVIRONMENT" = "production" ]; then
    PROJECT_ID="treesradio-production"
    echo "🚀 Deploying rules to PRODUCTION environment..."
    echo "⚠️  This will affect the live site!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled."
        exit 1
    fi
else
    echo "❌ Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

echo "📂 Compiling rules from Bolt file..."

# Check if bolt file exists
if [ ! -f "firebase/security.bolt" ]; then
    echo "❌ Bolt rules file not found: firebase/security.bolt"
    exit 1
fi

# Compile rules from Bolt
echo "🔨 Compiling firebase/security.bolt..."
npm run compile-rules

if [ $? -ne 0 ]; then
    echo "❌ Failed to compile Bolt rules"
    exit 1
fi

echo "📂 Checking compiled rules files..."

# Check if database rules exist
if [ ! -f "firebase/rules.json" ]; then
    echo "❌ Compiled database rules file not found: firebase/rules.json"
    exit 1
fi

# Check if storage rules exist
if [ ! -f "storage.rules" ]; then
    echo "❌ Storage rules file not found: storage.rules"
    exit 1
fi

echo "✅ Rules files found"
echo "🏗️  Deploying to project: $PROJECT_ID"

# Deploy database and storage rules
firebase deploy --only database,storage --project "$PROJECT_ID"

if [ $? -eq 0 ]; then
    echo "✅ Rules deployed successfully to $ENVIRONMENT!"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "🎯 Don't forget to apply CORS configuration:"
        echo "   gsutil cors set cors.json gs://${PROJECT_ID}.appspot.com"
    fi
else
    echo "❌ Rules deployment failed!"
    exit 1
fi