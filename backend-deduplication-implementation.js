/**
 * Backend Deduplication Implementation for tr-pineapple-production
 * 
 * This file should be placed in tr-pineapple-production/src/workers/
 * 
 * Usage: Run this script against your Firebase Realtime Database to:
 * 1. Extract all unique songs from existing playlists
 * 2. Create normalized songs collection indexed by platform ID
 * 3. Update playlist entries to use song references
 * 4. Verify data integrity after migration
 */

const admin = require('firebase-admin');
const { URL } = require('url');

// Initialize Firebase Admin (configure with your service account)
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();

class SongDeduplicator {
  constructor() {
    this.extractedSongs = new Map(); // songId -> song data
    this.playlistUpdates = new Map(); // userId -> playlists with updated references
    this.stats = {
      totalSongs: 0,
      uniqueSongs: 0,
      duplicatesRemoved: 0,
      playlistsUpdated: 0,
      errors: []
    };
  }

  /**
   * Extract platform ID from song URL
   */
  extractSongId(url, platform) {
    try {
      const urlObj = new URL(url);
      
      switch (platform) {
        case 'youtube':
          // https://youtube.com/watch?v=abc123 or https://youtu.be/abc123
          if (urlObj.hostname.includes('youtube.com')) {
            return urlObj.searchParams.get('v');
          } else if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1); // Remove leading /
          }
          break;
          
        case 'soundcloud':
          // https://soundcloud.com/user/track-name
          if (urlObj.hostname.includes('soundcloud.com')) {
            return urlObj.pathname.slice(1); // Remove leading /
          }
          break;
          
        case 'vimeo':
          // https://vimeo.com/123456
          if (urlObj.hostname.includes('vimeo.com')) {
            const match = urlObj.pathname.match(/\/(\d+)/);
            return match ? match[1] : null;
          }
          break;
      }
    } catch (error) {
      console.error('Error extracting song ID from URL:', url, error);
    }
    
    return null;
  }

  /**
   * Determine platform from URL
   */
  getPlatform(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('soundcloud.com')) {
      return 'soundcloud';
    } else if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    return 'unknown';
  }

  /**
   * Extract all songs from existing playlists
   */
  async extractSongs() {
    console.log('🎵 Extracting songs from playlists...');
    
    const playlistsSnapshot = await db.ref('playlists').once('value');
    const playlistsData = playlistsSnapshot.val();
    
    if (!playlistsData) {
      console.log('No playlists found');
      return;
    }

    for (const [userId, userPlaylists] of Object.entries(playlistsData)) {
      for (const [playlistId, playlist] of Object.entries(userPlaylists)) {
        if (!playlist.entries) continue;

        const updatedEntries = {};

        for (const [entryId, entry] of Object.entries(playlist.entries)) {
          if (!entry.url) continue;

          this.stats.totalSongs++;
          
          const platform = this.getPlatform(entry.url);
          const songId = this.extractSongId(entry.url, platform);
          
          if (!songId) {
            this.stats.errors.push(`Could not extract ID from URL: ${entry.url}`);
            // Keep original entry if we can't extract ID
            updatedEntries[entryId] = entry;
            continue;
          }

          const songKey = `${platform}/${songId}`;
          
          // Store normalized song data
          if (!this.extractedSongs.has(songKey)) {
            this.extractedSongs.set(songKey, {
              title: entry.title || 'Unknown Title',
              url: entry.url,
              duration: entry.duration || 0,
              thumbnail: entry.thumbnail || '',
              platform: platform,
              firstAdded: Date.now(),
              addCount: 1
            });
            this.stats.uniqueSongs++;
          } else {
            // Increment add count for existing song
            const existingSong = this.extractedSongs.get(songKey);
            existingSong.addCount++;
            this.stats.duplicatesRemoved++;
          }

          // Create playlist entry with song reference
          updatedEntries[entryId] = {
            songRef: songKey,
            addedAt: entry.addedAt || Date.now(),
            addedBy: userId
          };
        }

        // Store updated playlist structure
        if (!this.playlistUpdates.has(userId)) {
          this.playlistUpdates.set(userId, {});
        }
        
        this.playlistUpdates.get(userId)[playlistId] = {
          ...playlist,
          entries: updatedEntries
        };
      }
    }

    console.log(`✅ Extracted ${this.stats.uniqueSongs} unique songs from ${this.stats.totalSongs} total entries`);
    console.log(`📉 Duplicates removed: ${this.stats.duplicatesRemoved}`);
  }

  /**
   * Write normalized songs to database
   */
  async writeSongsCollection() {
    console.log('💾 Writing songs collection...');
    
    const songsRef = db.ref('songs');
    const batch = {};

    for (const [songKey, songData] of this.extractedSongs) {
      batch[songKey] = songData;
    }

    try {
      await songsRef.set(batch);
      console.log(`✅ Successfully wrote ${this.extractedSongs.size} songs to collection`);
    } catch (error) {
      console.error('❌ Error writing songs collection:', error);
      throw error;
    }
  }

  /**
   * Update playlists to use song references
   */
  async updatePlaylists() {
    console.log('🔄 Updating playlists with song references...');
    
    const playlistsRef = db.ref('playlists');
    const batch = {};

    for (const [userId, userPlaylists] of this.playlistUpdates) {
      batch[userId] = userPlaylists;
      this.stats.playlistsUpdated++;
    }

    try {
      await playlistsRef.set(batch);
      console.log(`✅ Successfully updated ${this.stats.playlistsUpdated} users' playlists`);
    } catch (error) {
      console.error('❌ Error updating playlists:', error);
      throw error;
    }
  }

  /**
   * Verify data integrity after migration
   */
  async verifyIntegrity() {
    console.log('🔍 Verifying data integrity...');
    
    // Check songs collection exists and has expected count
    const songsSnapshot = await db.ref('songs').once('value');
    const songsData = songsSnapshot.val();
    
    if (!songsData) {
      throw new Error('Songs collection not found after migration');
    }

    const songKeys = Object.keys(songsData);
    console.log(`📊 Songs collection: ${songKeys.length} songs`);
    
    // Verify platform distribution
    const platformCounts = {};
    for (const songKey of songKeys) {
      const platform = songKey.split('/')[0];
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    }
    
    console.log('📈 Platform distribution:');
    for (const [platform, count] of Object.entries(platformCounts)) {
      console.log(`  ${platform}: ${count} songs`);
    }

    // Check playlist references
    const playlistsSnapshot = await db.ref('playlists').once('value');
    const playlistsData = playlistsSnapshot.val();
    
    let totalReferences = 0;
    let brokenReferences = 0;

    for (const userPlaylists of Object.values(playlistsData || {})) {
      for (const playlist of Object.values(userPlaylists)) {
        if (!playlist.entries) continue;
        
        for (const entry of Object.values(playlist.entries)) {
          if (entry.songRef) {
            totalReferences++;
            if (!songsData[entry.songRef]) {
              brokenReferences++;
              console.warn(`⚠️  Broken reference: ${entry.songRef}`);
            }
          }
        }
      }
    }

    console.log(`📎 Total song references: ${totalReferences}`);
    console.log(`❌ Broken references: ${brokenReferences}`);
    
    if (brokenReferences > 0) {
      throw new Error(`Found ${brokenReferences} broken song references`);
    }

    console.log('✅ Data integrity verification passed');
  }

  /**
   * Calculate storage savings
   */
  calculateSavings() {
    const avgSongSize = 200; // bytes (estimated)
    const avgReferenceSize = 30; // bytes
    
    const originalSize = this.stats.totalSongs * avgSongSize;
    const newSize = (this.stats.uniqueSongs * avgSongSize) + (this.stats.totalSongs * avgReferenceSize);
    const savings = originalSize - newSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
    
    console.log('💰 Storage Savings Estimate:');
    console.log(`  Original size: ~${(originalSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`  New size: ~${(newSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`  Savings: ~${(savings / 1024 / 1024).toFixed(1)}MB (${savingsPercent}%)`);
  }

  /**
   * Run the complete deduplication process
   */
  async run() {
    try {
      console.log('🚀 Starting song deduplication process...');
      console.log('=====================================\n');
      
      await this.extractSongs();
      await this.writeSongsCollection();
      await this.updatePlaylists();
      await this.verifyIntegrity();
      
      this.calculateSavings();
      
      console.log('\n🎉 Deduplication completed successfully!');
      console.log('📊 Final Statistics:');
      console.log(`  Total songs processed: ${this.stats.totalSongs}`);
      console.log(`  Unique songs created: ${this.stats.uniqueSongs}`);
      console.log(`  Duplicates removed: ${this.stats.duplicatesRemoved}`);
      console.log(`  Users updated: ${this.stats.playlistsUpdated}`);
      console.log(`  Errors: ${this.stats.errors.length}`);
      
      if (this.stats.errors.length > 0) {
        console.log('\n⚠️  Errors encountered:');
        this.stats.errors.forEach(error => console.log(`  - ${error}`));
      }
      
    } catch (error) {
      console.error('💥 Deduplication failed:', error);
      throw error;
    }
  }

  /**
   * Create backup before running migration
   */
  async createBackup() {
    console.log('💾 Creating backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupRef = db.ref(`backups/pre-deduplication-${timestamp}`);
    
    const playlistsSnapshot = await db.ref('playlists').once('value');
    await backupRef.child('playlists').set(playlistsSnapshot.val());
    
    console.log(`✅ Backup created: backups/pre-deduplication-${timestamp}`);
  }
}

// Export for use in tr-pineapple-production
module.exports = SongDeduplicator;

// CLI usage
if (require.main === module) {
  const deduplicator = new SongDeduplicator();
  
  // Add CLI arguments handling
  const args = process.argv.slice(2);
  const createBackup = args.includes('--backup');
  const skipVerification = args.includes('--skip-verification');
  
  (async () => {
    try {
      if (createBackup) {
        await deduplicator.createBackup();
      }
      
      await deduplicator.run();
      
      if (!skipVerification) {
        console.log('\n🔍 Running additional verification...');
        await deduplicator.verifyIntegrity();
      }
      
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
      
    } catch (error) {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    }
  })();
}