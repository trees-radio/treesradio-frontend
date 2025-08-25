#!/bin/bash

# Force delete suspicious playlists via Firebase CLI
# Usage: ./force-delete-playlists.sh <project-id>

if [ -z "$1" ]; then
  echo "Usage: ./force-delete-playlists.sh <project-id>"
  echo "Example: ./force-delete-playlists.sh treesradio-production"
  exit 1
fi

PROJECT_ID="$1"

echo "🔥 FORCE DELETE SUSPICIOUS PLAYLISTS"
echo "===================================="
echo "Project: $PROJECT_ID"
echo ""

# The suspicious user IDs to delete
SUSPICIOUS_USERS=(
  "BdEEqsGwaAQGNjWT0p2q0L103cO2"
  "S9CynbMagtdGW9ZDzbT4KmcCfDi1"  
  "f7zDd0qKEUhOhRN9VGExX9ha0da2"
  "ab5EbpSZKsaqiJ5uECt7wG62es23"
  "SAsfvwSvDtO9FVCAWpBGUT5PRD63"
  "O9dbugM7poRVwlloGdlJWm2Cooz2"
)

echo "⚠️  WARNING: This will permanently delete playlists for these users:"
for uid in "${SUSPICIOUS_USERS[@]}"; do
  echo "  - $uid"
done

echo ""
read -p "Are you sure you want to delete these playlists? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
  echo "❌ Deletion cancelled"
  exit 1
fi

echo "🗑️  Starting deletion..."
echo ""

TOTAL_DELETED=0
FAILED_DELETES=0

for uid in "${SUSPICIOUS_USERS[@]}"; do
  echo "Deleting playlists for user: $uid"
  
  # Use Firebase CLI to remove the entire user playlist node
  if firebase database:remove "/playlists/$uid" --project "$PROJECT_ID" --confirm 2>/dev/null; then
    echo "  ✅ Successfully deleted"
    ((TOTAL_DELETED++))
  else
    echo "  ❌ Failed to delete (may not exist)"
    ((FAILED_DELETES++))
  fi
  
  # Small delay to avoid rate limiting
  sleep 0.5
done

echo ""
echo "📊 DELETION SUMMARY"
echo "=================="
echo "Successfully deleted: $TOTAL_DELETED users' playlists"
echo "Failed/Not found: $FAILED_DELETES"

echo ""
echo "🔍 VERIFYING DELETION..."
echo "======================="

# Verify the deletion worked
for uid in "${SUSPICIOUS_USERS[@]}"; do
  result=$(firebase database:get "/playlists/$uid" --project "$PROJECT_ID" 2>/dev/null)
  
  if [ "$result" == "null" ] || [ -z "$result" ]; then
    echo "✅ $uid - Confirmed deleted"
  else
    echo "❌ $uid - STILL EXISTS!"
  fi
done

echo ""
echo "📋 NEXT STEPS"
echo "============"
echo "1. Re-export the database:"
echo "   firebase database:get / --project $PROJECT_ID > database-clean.json"
echo ""
echo "2. Verify the export is clean:"
echo "   ./scripts/analyze-playlists.sh database-clean.json"
echo ""
echo "3. Check database size in Firebase Console"
echo ""

echo "✅ Deletion process complete!"