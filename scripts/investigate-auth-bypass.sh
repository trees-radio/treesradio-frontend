#!/bin/bash

# Investigation script for authentication bypass
# Usage: ./investigate-auth-bypass.sh <database-export.json>

if [ -z "$1" ]; then
  echo "Usage: ./investigate-auth-bypass.sh <database-export.json>"
  exit 1
fi

DB_FILE="$1"

echo "🔍 AUTHENTICATION BYPASS INVESTIGATION"
echo "====================================="

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required for analysis"
    exit 1
fi

echo ""
echo "🔍 ANALYZING SUSPICIOUS USER IDs"
echo "================================"

# Get the suspicious users (those with playlists but no auth)
echo "Top 10 playlist owners without authentication:"
jq -r '
  (.playlists | keys) as $playlist_users |
  (.users | keys) as $auth_users |
  (.playlists | to_entries | map({user: .key, count: (.value | length)})) |
  map(select(.user | IN($auth_users[]) | not)) |
  sort_by(.count) | reverse | .[:10] | 
  .[] | "\(.user): \(.count) playlists"
' "$DB_FILE"

echo ""
echo "🔍 ANALYZING USER ID PATTERNS"
echo "============================="

# Analyze the format of suspicious user IDs
echo "Suspicious user ID patterns:"
jq -r '
  (.playlists | keys) as $playlist_users |
  (.users | keys) as $auth_users |
  $playlist_users | map(select(. | IN($auth_users[]) | not))
' "$DB_FILE" | head -10 | while read uid; do
  if [[ $uid =~ ^[a-zA-Z0-9]{28}$ ]]; then
    echo "  $uid - Firebase Auth format (28 chars)"
  elif [[ $uid =~ ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]]; then
    echo "  $uid - UUID format (suspicious)"
  elif [[ $uid =~ ^[a-zA-Z0-9_-]+$ ]]; then
    echo "  $uid - Custom format (very suspicious)"
  else
    echo "  $uid - Unknown format"
  fi
done

echo ""
echo "🔍 CHECKING SECURITY RULES EVIDENCE"
echo "==================================="

# Check if there are any admin flags in the suspicious data
echo "Checking for admin/bypass flags in suspicious playlists..."
for uid in $(jq -r '(.playlists | keys) as $playlist_users | (.users | keys) as $auth_users | $playlist_users | map(select(. | IN($auth_users[]) | not))' "$DB_FILE" | head -5); do
  echo ""
  echo "User: $uid"
  
  # Check first playlist for any admin/special flags
  first_playlist=$(jq -r ".playlists[\"$uid\"] | to_entries[0].value" "$DB_FILE" 2>/dev/null)
  if [ "$first_playlist" != "null" ]; then
    echo "  First playlist structure:"
    echo "$first_playlist" | jq . 2>/dev/null | head -10 | sed 's/^/    /'
  fi
done

echo ""
echo "🔍 TIMELINE ANALYSIS"
echo "==================="

# Try to determine when these playlists were created
echo "Checking playlist creation patterns..."

# If playlists have Firebase push keys, we can estimate creation time
echo "Sample playlist keys (for timestamp analysis):"
for uid in $(jq -r '(.playlists | keys) as $playlist_users | (.users | keys) as $auth_users | $playlist_users | map(select(. | IN($auth_users[]) | not))' "$DB_FILE" | head -3); do
  echo ""
  echo "User: $uid"
  echo "  Playlist keys:"
  jq -r ".playlists[\"$uid\"] | keys[0:3][]" "$DB_FILE" 2>/dev/null | sed 's/^/    /'
done

echo ""
echo "🔍 POSSIBLE SCENARIOS"
echo "===================="

echo ""
echo "🔶 SCENARIO 1: Legacy Security Rules"
echo "   - Old Firebase rules were too permissive"
echo "   - Users created playlists before proper auth was enforced"
echo "   - Authentication was added later but data remained"

echo ""
echo "🔶 SCENARIO 2: User Account Deletion" 
echo "   - Users created legitimate playlists"
echo "   - User accounts were later deleted from authentication"
echo "   - Playlist data was not cleaned up during deletion"

echo ""
echo "🔶 SCENARIO 3: Firebase SDK Vulnerability"
echo "   - Bug in older Firebase SDK versions"
echo "   - Allowed direct database writes bypassing auth"
echo "   - Patched in newer versions but data remains"

echo ""
echo "🔶 SCENARIO 4: Custom User IDs"
echo "   - App once used custom user IDs instead of Firebase Auth"
echo "   - Migration to Firebase Auth didn't clean up old data"
echo "   - Old playlist references remain with old ID format"

echo ""
echo "🔶 SCENARIO 5: Development/Testing Data"
echo "   - Large amounts of test data created during development"
echo "   - Test users were not properly cleaned up"
echo "   - Dev environment data mixed with production"

echo ""
echo "🔶 SCENARIO 6: Security Rules Bypass"
echo "   - Rules had logical errors (wrong auth checks)"
echo "   - Allowed writes under certain conditions"
echo "   - Attack exploited these conditions"

echo ""
echo "📋 INVESTIGATION CHECKLIST"
echo "=========================="

echo "✅ Check Firebase Console → Authentication for user deletion logs"
echo "✅ Check Firebase Console → Database → Security Rules history"  
echo "✅ Check your git history for old security.bolt versions"
echo "✅ Look for any custom authentication logic in your codebase"
echo "✅ Check if user deletion process cleans up related data"
echo "✅ Review Firebase project audit logs if available"
echo "✅ Check if any admin/service accounts had write access"

echo ""
echo "🔍 NEXT STEPS"
echo "============"

echo "1. Check Firebase Console → Project Settings → Service Accounts"
echo "2. Review Authentication → Users for any suspicious admin accounts"
echo "3. Check Database → Usage for traffic patterns during breach"
echo "4. Review your application logs for any auth bypass errors"
echo "5. Consider reaching out to Firebase Support with this evidence"

echo ""
echo "🚨 The fact that these are Firebase-format UIDs suggests"
echo "   this was likely LEGITIMATE users whose accounts were"
echo "   later deleted, leaving orphaned playlist data behind."