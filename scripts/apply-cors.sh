#!/bin/bash

# Apply CORS configuration to Firebase Storage bucket
# This script should be run after deploying storage rules

if [ -z "$1" ]; then
  echo "Usage: ./apply-cors.sh <project-id>"
  exit 1
fi

PROJECT_ID=$1
BUCKET_NAME="${PROJECT_ID}.appspot.com"

echo "Applying CORS configuration to bucket: gs://${BUCKET_NAME}"

# Check if cors.json exists
if [ ! -f "cors.json" ]; then
  echo "Error: cors.json file not found"
  exit 1
fi

# Apply CORS configuration
gsutil cors set cors.json "gs://${BUCKET_NAME}"

if [ $? -eq 0 ]; then
  echo "✅ CORS configuration applied successfully"
else
  echo "❌ Failed to apply CORS configuration"
  exit 1
fi