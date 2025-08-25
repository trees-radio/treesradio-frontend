#!/bin/bash

# Verify playlist deletion directly from Firebase
# Usage: ./verify-deletion.sh <project-id>

if [ -z "$1" ]; then
  echo "Usage: ./verify-deletion.sh <project-id>"
  echo "Example: ./verify-deletion.sh treesradio-production"
  exit 1
fi

PROJECT_ID="$1"

echo "🔍 VERIFYING PLAYLIST DELETION"
echo "=============================="
echo "Project: $PROJECT_ID"
echo ""

# The suspicious user IDs you deleted
SUSPICIOUS_USERS=(
  "BdEEqsGwaAQGNjWT0p2q0L103cO2"
  "S9CynbMagtdGW9ZDzbT4KmcCfDi1"
  "f7zDd0qKEUhOhRN9VGExX9ha0da2"
  "ab5EbpSZKsaqiJ5uECt7wG62es23"
  "SAsfvwSvDtO9FVCAWpBGUT5PRD63"
)

echo "Checking if suspicious users still exist in database..."
echo ""

for uid in "${SUSPICIOUS_USERS[@]}"; do
  echo "Checking user: $uid"
  
  # Check if playlists exist for this user
  result=$(firebase database:get "/playlists/$uid" --project "$PROJECT_ID" 2>/dev/null)
  
  if [ "$result" == "null" ] || [ -z "$result" ]; then
    echo "  ✅ DELETED - No playlists found"
  else
    # Count playlists if they exist
    playlist_count=$(echo "$result" | jq 'length' 2>/dev/null || echo "error")
    if [ "$playlist_count" == "error" ]; then
      echo "  ⚠️  ERROR checking playlists"
    else
      echo "  ❌ STILL EXISTS - $playlist_count playlists found!"
      echo "     First few keys:"
      echo "$result" | jq 'keys[:3]' 2>/dev/null | sed 's/^/       /'
    fi
  fi
  echo ""
done

echo "📊 CURRENT DATABASE STATS"
echo "========================"

# Get current playlist count
echo "Getting total playlist users..."
all_users=$(firebase database:get "/playlists" --project "$PROJECT_ID" --shallow 2>/dev/null)
if [ "$all_users" != "null" ] && [ ! -z "$all_users" ]; then
  user_count=$(echo "$all_users" | jq 'keys | length' 2>/dev/null || echo "0")
  echo "Total users with playlists: $user_count"
  
  # Show top users by key name
  echo ""
  echo "First 10 playlist users:"
  echo "$all_users" | jq -r 'keys[:10][]' 2>/dev/null | sed 's/^/  /'
else
  echo "No playlists found or error accessing database"
fi

echo ""
echo "🔧 MANUAL DELETION COMMANDS"
echo "==========================="

echo "If the playlists still exist, delete them manually:"
echo ""
for uid in "${SUSPICIOUS_USERS[@]}"; do
  echo "firebase database:remove \"/playlists/$uid\" --project $PROJECT_ID"
done

echo ""
echo "Or delete all at once with confirmation:"
echo "firebase database:remove \"/playlists/{uid}\" --project $PROJECT_ID"

echo ""
echo "📝 VERIFICATION CHECKLIST"
echo "========================"
echo "1. ✓ Are you checking the right project? (production vs staging)"
echo "2. ✓ Did you export AFTER deleting?"
echo "3. ✓ Did the console show any errors during deletion?"
echo "4. ✓ Try refreshing Firebase Console and check again"
echo "5. ✓ Check Firebase Console → Database → Data tab directly"

echo ""
echo "🔄 RE-EXPORT COMMAND"
echo "==================="
echo "After confirming deletion, re-export with:"
echo "firebase database:get / --project $PROJECT_ID > database-export-new.json"