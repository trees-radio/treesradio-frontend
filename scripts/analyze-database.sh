#!/bin/bash

# Firebase Database Analysis Script
# Usage: ./analyze-database.sh <path-to-database-export.json>

if [ -z "$1" ]; then
  echo "Usage: ./analyze-database.sh <path-to-database-export.json>"
  echo "Example: ./analyze-database.sh ~/Downloads/treesradio-export.json"
  exit 1
fi

DB_FILE="$1"

if [ ! -f "$DB_FILE" ]; then
  echo "❌ File not found: $DB_FILE"
  exit 1
fi

echo "🔍 Analyzing Firebase database: $DB_FILE"
echo "📊 File size: $(ls -lh "$DB_FILE" | awk '{print $5}')"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required for database analysis"
    echo "   Install with: brew install jq"
    exit 1
fi

echo "📋 Top-level nodes and their approximate sizes:"
echo "================================================"

# Get all top-level keys and count their entries/size
for key in $(jq -r 'keys[]' "$DB_FILE" 2>/dev/null); do
    # Count entries in this node
    entry_count=$(jq -r ".[\"$key\"] | length?" "$DB_FILE" 2>/dev/null || echo "N/A")
    
    # Calculate approximate size by measuring JSON length
    size_bytes=$(jq -c ".[\"$key\"]" "$DB_FILE" 2>/dev/null | wc -c | tr -d ' ')
    size_mb=$(echo "scale=2; $size_bytes / 1024 / 1024" | bc 2>/dev/null || echo "N/A")
    
    printf "%-20s: %10s entries, ~%8s MB\n" "$key" "$entry_count" "$size_mb"
done

echo ""
echo "🎯 Potential issues to investigate:"
echo "================================="

# Check for large chat history
chat_count=$(jq -r '.chat | length?' "$DB_FILE" 2>/dev/null || echo "0")
if [ "$chat_count" -gt 1000 ]; then
    echo "⚠️  Large chat history: $chat_count messages"
    echo "   Consider implementing chat message expiration/cleanup"
fi

# Check for large presence data
presence_count=$(jq -r '.presence | length?' "$DB_FILE" 2>/dev/null || echo "0")
if [ "$presence_count" -gt 500 ]; then
    echo "⚠️  Large presence data: $presence_count entries"
    echo "   Consider implementing presence cleanup for offline users"
fi

# Check for large user events
user_events_count=$(jq -r '.user_events | length?' "$DB_FILE" 2>/dev/null || echo "0")
if [ "$user_events_count" -gt 1000 ]; then
    echo "⚠️  Large user_events: $user_events_count entries"
    echo "   Consider implementing event cleanup/archiving"
fi

# Check for large playlists
playlist_users=$(jq -r '.playlists | length?' "$DB_FILE" 2>/dev/null || echo "0")
if [ "$playlist_users" -gt 100 ]; then
    echo "⚠️  Many playlist users: $playlist_users users"
    # Calculate average playlist size
    avg_playlist_size=$(jq -r '[.playlists[] | length] | add / length' "$DB_FILE" 2>/dev/null || echo "N/A")
    echo "   Average playlist size: $avg_playlist_size entries"
fi

# Check for old data that might need cleanup
echo ""
echo "🧹 Data cleanup opportunities:"
echo "============================="

# Check for old chat messages (if timestamps are available)
echo "💬 Chat message analysis:"
if jq -e '.chat' "$DB_FILE" > /dev/null 2>&1; then
    current_time=$(date +%s)
    week_ago=$((current_time - 604800))  # 7 days ago
    month_ago=$((current_time - 2592000)) # 30 days ago
    
    old_messages=$(jq -r --arg week_ago "$week_ago" '[.chat[] | select(.timestamp < ($week_ago | tonumber))] | length' "$DB_FILE" 2>/dev/null || echo "N/A")
    very_old_messages=$(jq -r --arg month_ago "$month_ago" '[.chat[] | select(.timestamp < ($month_ago | tonumber))] | length' "$DB_FILE" 2>/dev/null || echo "N/A")
    
    echo "   Messages older than 7 days: $old_messages"
    echo "   Messages older than 30 days: $very_old_messages"
fi

echo ""
echo "📊 Memory usage recommendations:"
echo "================================"
echo "• Chat: Keep only last 200-500 messages (24-48 hours)"
echo "• Presence: Clean up entries for users offline >24h"
echo "• User events: Archive events older than 30 days"
echo "• Song history: Keep only last 50-100 tracks"

echo ""
echo "✅ Analysis complete!"