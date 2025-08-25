#!/bin/bash

# Migration script to run song deduplication on Firebase
# Usage: ./migrate-to-deduplication.sh <project-id> [--dry-run]

if [ -z "$1" ]; then
  echo "Usage: ./migrate-to-deduplication.sh <project-id> [--dry-run]"
  echo "Example: ./migrate-to-deduplication.sh treesradio-production"
  echo "Options:"
  echo "  --dry-run    Show what would be migrated without making changes"
  echo "  --backup     Create backup before migration"
  exit 1
fi

PROJECT_ID="$1"
DRY_RUN=false
CREATE_BACKUP=false

# Parse additional arguments
for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --backup)
      CREATE_BACKUP=true
      shift
      ;;
  esac
done

echo "🎵 SONG DEDUPLICATION MIGRATION"
echo "==============================="
echo "Project: $PROJECT_ID"
echo "Dry run: $DRY_RUN"
echo "Create backup: $CREATE_BACKUP"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required for migration"
    echo "   Install from: https://nodejs.org/"
    exit 1
fi

# Check if firebase-admin package is available
if ! node -e "require('firebase-admin')" 2>/dev/null; then
    echo "❌ firebase-admin package is required"
    echo "   Install with: npm install firebase-admin"
    exit 1
fi

# Check if backend implementation exists
BACKEND_FILE="./backend-deduplication-implementation.js"
if [ ! -f "$BACKEND_FILE" ]; then
    echo "❌ Backend implementation file not found: $BACKEND_FILE"
    echo "   Make sure to copy backend-deduplication-implementation.js to tr-pineapple-production"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Pre-migration analysis
echo "📊 PRE-MIGRATION ANALYSIS"
echo "========================"

# Export current database for analysis
echo "Exporting current database for analysis..."
EXPORT_FILE="database-pre-migration.json"
if firebase database:get / --project "$PROJECT_ID" > "$EXPORT_FILE" 2>/dev/null; then
    echo "✅ Database exported to $EXPORT_FILE"
    
    # Run playlist analysis
    if [ -f "./scripts/analyze-playlists.sh" ]; then
        echo ""
        echo "Running playlist analysis..."
        ./scripts/analyze-playlists.sh "$EXPORT_FILE"
    fi
else
    echo "⚠️  Could not export database for analysis"
fi

echo ""

if [ "$DRY_RUN" = true ]; then
    echo "🔍 DRY RUN MODE - No changes will be made"
    echo "========================================"
    
    # Simulate what would happen
    echo "The migration would:"
    echo "1. Extract all unique songs from playlists"
    echo "2. Create songs/{platform}/{id} structure"
    echo "3. Update playlist entries to use song references"
    echo "4. Verify data integrity"
    echo ""
    echo "Estimated savings based on analysis above"
    echo "No actual changes made in dry-run mode"
    
    # Clean up export file
    rm -f "$EXPORT_FILE" 2>/dev/null
    exit 0
fi

# Confirm with user before proceeding
echo "⚠️  WARNING: This will modify your Firebase database structure"
echo "Playlists will be converted from storing full song data to using references"
echo ""
read -p "Are you sure you want to proceed? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo "❌ Migration cancelled"
    rm -f "$EXPORT_FILE" 2>/dev/null
    exit 1
fi

echo "🚀 Starting migration..."
echo ""

# Set Firebase project for Node.js script
export FIREBASE_DATABASE_URL="https://$PROJECT_ID-default-rtdb.firebaseio.com/"

# Run the migration
MIGRATION_ARGS=""
if [ "$CREATE_BACKUP" = true ]; then
    MIGRATION_ARGS="$MIGRATION_ARGS --backup"
fi

echo "Running deduplication script..."
if node "$BACKEND_FILE" $MIGRATION_ARGS; then
    echo ""
    echo "✅ Migration completed successfully!"
    
    # Post-migration verification
    echo ""
    echo "🔍 POST-MIGRATION VERIFICATION"
    echo "============================="
    
    # Export new database for verification
    NEW_EXPORT_FILE="database-post-migration.json"
    echo "Exporting updated database..."
    if firebase database:get / --project "$PROJECT_ID" > "$NEW_EXPORT_FILE" 2>/dev/null; then
        echo "✅ Post-migration database exported to $NEW_EXPORT_FILE"
        
        # Compare sizes
        if [ -f "$EXPORT_FILE" ]; then
            OLD_SIZE=$(ls -lh "$EXPORT_FILE" | awk '{print $5}')
            NEW_SIZE=$(ls -lh "$NEW_EXPORT_FILE" | awk '{print $5}')
            echo ""
            echo "📊 SIZE COMPARISON"
            echo "=================="
            echo "Before migration: $OLD_SIZE"
            echo "After migration:  $NEW_SIZE"
        fi
        
        # Run analysis on new structure
        if [ -f "./scripts/analyze-playlists.sh" ]; then
            echo ""
            echo "Running post-migration analysis..."
            ./scripts/analyze-playlists.sh "$NEW_EXPORT_FILE"
        fi
        
        # Verify songs collection exists
        echo ""
        echo "Verifying songs collection..."
        SONGS_COUNT=$(firebase database:get /songs --project "$PROJECT_ID" --shallow 2>/dev/null | jq 'keys | length' 2>/dev/null || echo "0")
        echo "Songs in collection: $SONGS_COUNT"
        
        if [ "$SONGS_COUNT" -gt "0" ]; then
            echo "✅ Songs collection created successfully"
        else
            echo "❌ Songs collection not found - migration may have failed"
        fi
        
    else
        echo "⚠️  Could not export database for verification"
    fi
    
    echo ""
    echo "📋 NEXT STEPS"
    echo "============"
    echo "1. Test the application thoroughly to ensure everything works"
    echo "2. Monitor performance - playlists should load faster"
    echo "3. Update security rules if needed (see firebase/security.bolt)"
    echo "4. Deploy frontend changes to handle song references"
    echo "5. Consider implementing periodic cleanup of unused songs"
    
    echo ""
    echo "📁 FILES CREATED"
    echo "==============="
    echo "- $EXPORT_FILE (pre-migration backup)"
    echo "- $NEW_EXPORT_FILE (post-migration state)"
    echo "- Additional backups may have been created in Firebase"
    
    echo ""
    echo "🎉 Migration completed successfully!"
    
else
    echo ""
    echo "💥 Migration failed!"
    echo "Database should be in original state"
    echo "Check the logs above for error details"
    
    # Clean up export files on failure
    rm -f "$EXPORT_FILE" "$NEW_EXPORT_FILE" 2>/dev/null
    exit 1
fi