#!/bin/bash

# Playlist-specific analysis script
# Usage: ./analyze-playlists.sh <database-export.json>

if [ -z "$1" ]; then
  echo "Usage: ./analyze-playlists.sh <database-export.json>"
  exit 1
fi

DB_FILE="$1"

if [ ! -f "$DB_FILE" ]; then
  echo "❌ File not found: $DB_FILE"
  exit 1
fi

echo "🎵 Analyzing Playlist Data: $DB_FILE"
echo "===================================="

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required for analysis"
    echo "   Install with: brew install jq"
    exit 1
fi

# Basic playlist stats
echo "📊 Basic Playlist Statistics:"
echo "----------------------------"

total_users=$(jq '.playlists | length' "$DB_FILE" 2>/dev/null || echo "0")
echo "Total users with playlists: $total_users"

total_playlists=$(jq '[.playlists[] | length] | add' "$DB_FILE" 2>/dev/null || echo "0")
echo "Total playlists: $total_playlists"

total_songs=$(jq '[.playlists[][] | .entries | length] | add' "$DB_FILE" 2>/dev/null || echo "0")
echo "Total songs across all playlists: $total_songs"

if [ "$total_playlists" -gt "0" ]; then
    avg_songs_per_playlist=$(echo "scale=1; $total_songs / $total_playlists" | bc 2>/dev/null || echo "N/A")
    echo "Average songs per playlist: $avg_songs_per_playlist"
fi

echo ""
echo "🏆 Top Users by Playlist Count:"
echo "------------------------------"
jq -r '.playlists | to_entries | map({user: .key, count: (.value | length)}) | sort_by(.count) | reverse | .[:10] | .[] | "\(.user): \(.count) playlists"' "$DB_FILE" 2>/dev/null

echo ""
echo "📈 Top Users by Song Count:"
echo "---------------------------"
jq -r '.playlists | to_entries | map({user: .key, songs: ([.value[] | .entries | length] | add)}) | sort_by(.songs) | reverse | .[:10] | .[] | "\(.user): \(.songs) songs"' "$DB_FILE" 2>/dev/null

echo ""
echo "🔍 Duplication Analysis:"
echo "------------------------"

# Find most duplicated songs
echo "Most duplicated songs (top 10):"
jq -r '.playlists[][] | .entries[]? | .url' "$DB_FILE" 2>/dev/null | sort | uniq -c | sort -rn | head -10 | while read count url; do
    # Get song title for the first occurrence
    title=$(jq -r --arg url "$url" '.playlists[][] | .entries[]? | select(.url == $url) | .title' "$DB_FILE" 2>/dev/null | head -1)
    echo "  $count times: $title"
done

# Calculate potential savings from deduplication
echo ""
echo "💾 Deduplication Potential:"
echo "---------------------------"

# Count total URLs vs unique URLs
total_song_entries=$(jq -r '.playlists[][] | .entries[]? | .url' "$DB_FILE" 2>/dev/null | wc -l | tr -d ' ')
unique_song_urls=$(jq -r '.playlists[][] | .entries[]? | .url' "$DB_FILE" 2>/dev/null | sort | uniq | wc -l | tr -d ' ')

if [ "$total_song_entries" -gt "0" ]; then
    duplicate_percentage=$(echo "scale=1; ($total_song_entries - $unique_song_urls) * 100 / $total_song_entries" | bc 2>/dev/null || echo "N/A")
    echo "Total song entries: $total_song_entries"
    echo "Unique songs: $unique_song_urls"
    echo "Duplicates: $(($total_song_entries - $unique_song_urls))"
    echo "Duplication rate: $duplicate_percentage%"
fi

echo ""
echo "📋 Largest Playlists:"
echo "-------------------"
jq -r '.playlists | to_entries[] as $user | $user.value | to_entries[] as $playlist | {user: $user.key, name: $playlist.value.name, songs: ($playlist.value.entries | length)} | select(.songs > 50) | "\(.user): \"\(.name)\" - \(.songs) songs"' "$DB_FILE" 2>/dev/null | sort -k3 -nr | head -10

echo ""
echo "🧹 Cleanup Recommendations:"
echo "============================="

# Check for playlists with over 1000 songs
large_playlists=$(jq '[.playlists[][] | select(.entries | length > 1000)] | length' "$DB_FILE" 2>/dev/null || echo "0")
if [ "$large_playlists" -gt "0" ]; then
    echo "⚠️  Found $large_playlists playlists with >1000 songs (consider limits)"
fi

# Check for users with many playlists
power_users=$(jq '[.playlists | to_entries[] | select(.value | length > 200)] | length' "$DB_FILE" 2>/dev/null || echo "0")
if [ "$power_users" -gt "0" ]; then
    echo "⚠️  Found $power_users users with >200 playlists (consider limits)"
fi

echo "✅ Run deduplication to save ~$duplicate_percentage% space"
echo "✅ Implement lazy loading for playlists"
echo "✅ Consider normalizing song data structure"

echo ""
echo "🎯 Next Steps:"
echo "==============" 
echo "1. Run backend deduplication on all playlists"
echo "2. Implement lazy loading (load only selected playlist)"
echo "3. Add playlist size limits (1000 songs, 200 playlists per user)"
echo "4. Consider song data normalization for long-term savings"

echo ""
echo "✅ Analysis complete!"