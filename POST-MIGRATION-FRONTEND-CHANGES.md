# Post-Migration Frontend Changes

⚠️ **IMPORTANT**: These changes should ONLY be applied AFTER successfully running the deduplication migration script.

## Overview

After the backend migration converts your database from storing full song data to using normalized song references, you'll need to apply these frontend changes to handle the new data structure.

## Changes Required

### 1. Update Song Interface (`src/stores/playlists.ts`)

Uncomment and add these interfaces:

```typescript
interface Song {
    url: string;
    title: string;
    thumb: string;
    channel: string;
    duration: number;
    name?: string;
    user?: string | undefined;
    added?: number;
    songRef?: string; // Reference to songs/{platform}/{id}
}

// Normalized song data stored in songs collection
interface NormalizedSong {
    title: string;
    url: string;
    duration: number;
    thumbnail: string;
    platform: 'youtube' | 'soundcloud' | 'vimeo';
    firstAdded: number;
    addCount: number;
}

// Playlist entry that references a normalized song
interface PlaylistEntry {
    songRef: string; // "platform/id" reference to songs collection
    addedAt: number;
    addedBy: string;
}
```

### 2. Replace addSong Method

Replace the current `addSong` method with:

```typescript
@action
async addSong(song: Song, playlistKey: string, isGrab: boolean) {
    console.time('addSong');

    try {
        // Extract platform and ID from song URL
        const { platform, songId } = this.extractSongInfo(song.url);
        const songRef = `${platform}/${songId}`;

        // Check if song exists in normalized collection
        const normalizedSongRef = ref(db, `songs/${songRef}`);
        const normalizedSongSnap = await get(normalizedSongRef);
        
        if (!normalizedSongSnap.exists()) {
            // Create normalized song entry if it doesn't exist
            const normalizedSong: NormalizedSong = {
                title: song.title,
                url: song.url,
                duration: song.duration,
                thumbnail: song.thumb,
                platform: platform as 'youtube' | 'soundcloud' | 'vimeo',
                firstAdded: Date.now(),
                addCount: 1
            };
            await set(normalizedSongRef, normalizedSong);
            console.log(`Created normalized song entry: ${songRef}`);
        } else {
            // Increment add count for existing song
            const existingSong = normalizedSongSnap.val() as NormalizedSong;
            await set(ref(db, `songs/${songRef}/addCount`), existingSong.addCount + 1);
        }

        // Get current playlist entries and convert to new format
        var playlist = this.getPlaylistByKey(playlistKey);
        var newEntries: PlaylistEntry[] = [];
        
        if (playlist?.entries) {
            // Convert existing Song objects to PlaylistEntry format
            newEntries = playlist.entries.map((song: Song) => {
                if (song.songRef) {
                    return {
                        songRef: song.songRef,
                        addedAt: song.added || Date.now(),
                        addedBy: this.uid
                    };
                } else {
                    // Convert legacy song to reference format
                    const { platform: oldPlatform, songId: oldSongId } = this.extractSongInfo(song.url);
                    return {
                        songRef: `${oldPlatform}/${oldSongId}`,
                        addedAt: song.added || Date.now(),
                        addedBy: this.uid
                    };
                }
            });
        }

        // Create new playlist entry
        const playlistEntry: PlaylistEntry = {
            songRef: songRef,
            addedAt: Date.now(),
            addedBy: this.uid
        };

        // Add new entry
        if (isGrab) {
            newEntries.push(playlistEntry);
        } else {
            newEntries.unshift(playlistEntry);
        }

        // Save updated playlist entries
        const entriesRef = ref(db, `playlists/${this.uid}/${playlistKey}/entries`);
        await set(entriesRef, newEntries);
        
        toast(`Added song ${song.title || song.name} to playlist ${playlist?.name}.`, { type: "success" });
        console.timeEnd('addSong');
        
    } catch (error) {
        console.error("Error adding song:", error);
        toast(`Failed to add song: ${error}`, { type: "error" });
        console.timeEnd('addSong');
    }
}
```

### 3. Update selectPlaylist Method

Replace the current `selectPlaylist` method to handle song references:

```typescript
@action
selectPlaylist(index: number) {
    // ... existing setup code ...

    this.stopPlaylistSync = onValue(entriesQuery, async snap => {
        const playlist: Song[] = [];
        
        if (snap.exists()) {
            const entries: any[] = [];
            snap.forEach(entry => {
                entries.push(entry.val());
            });

            // Resolve song references to full song data
            for (const entry of entries) {
                try {
                    if (entry.songRef) {
                        // New format: resolve song reference
                        const songData = await this.resolveSongReference(entry.songRef);
                        if (songData) {
                            playlist.push({
                                ...songData,
                                songRef: entry.songRef,
                                added: entry.addedAt
                            });
                        }
                    } else {
                        // Legacy format: use existing song data
                        playlist.push(entry);
                    }
                } catch (error) {
                    console.error(`Error resolving song reference ${entry.songRef}:`, error);
                    // Skip corrupted entries
                }
            }
        }

        console.log(`Loaded ${playlist.length} songs for playlist: ${this.playlists[index]?.name}`);
        this.setPlaylist(playlist);

        // Update the playlist metadata
        if (this.playlists[index]) {
            this.playlists[index].entries = playlist;
            this.playlists[index].isLoaded = true;
            this.playlists[index].songCount = playlist.length;
        }
    }, (error) => {
        console.error(`Error loading playlist entries for ${key}:`, error);
        this.setPlaylist([]);
    });
}
```

### 4. Add Helper Methods

Uncomment and add these helper methods:

```typescript
/**
 * Extract platform and song ID from URL
 */
@action
extractSongInfo(url: string): { platform: string; songId: string } {
    try {
        const urlObj = new URL(url);
        
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname === 'youtu.be') {
            const videoId = urlObj.hostname === 'youtu.be' 
                ? urlObj.pathname.slice(1)
                : urlObj.searchParams.get('v');
            return { platform: 'youtube', songId: videoId || 'unknown' };
        } else if (urlObj.hostname.includes('soundcloud.com')) {
            const songId = urlObj.pathname.slice(1); // Remove leading /
            return { platform: 'soundcloud', songId: songId || 'unknown' };
        } else if (urlObj.hostname.includes('vimeo.com')) {
            const match = urlObj.pathname.match(/\/(\\d+)/);
            const videoId = match ? match[1] : 'unknown';
            return { platform: 'vimeo', songId: videoId };
        }
    } catch (error) {
        console.error('Error extracting song info from URL:', url, error);
    }
    
    // Fallback for unknown URLs
    return { platform: 'unknown', songId: url.replace(/[^a-zA-Z0-9]/g, '_') };
}

/**
 * Resolve a song reference to full song data
 */
@action
async resolveSongReference(songRef: string): Promise<Song | null> {
    try {
        const songDataRef = ref(db, `songs/${songRef}`);
        const songSnap = await get(songDataRef);
        
        if (songSnap.exists()) {
            const normalizedSong = songSnap.val() as NormalizedSong;
            return {
                url: normalizedSong.url,
                title: normalizedSong.title,
                thumb: normalizedSong.thumbnail,
                channel: 'Unknown', // Could be enhanced with channel data
                duration: normalizedSong.duration,
                songRef: songRef
            };
        }
        
        console.warn(`Song reference not found: ${songRef}`);
        return null;
        
    } catch (error) {
        console.error(`Error resolving song reference ${songRef}:`, error);
        return null;
    }
}
```

### 5. Enable Security Rules

Uncomment the songs collection rules in `firebase/security.bolt`:

```bolt
////////////////////////////////////////////////////////////////
// SONGS COLLECTION (Normalized Song Storage)
////////////////////////////////////////////////////////////////
type NormalizedSong {
  title: String,
  url: String,
  duration: Number,
  thumbnail: String,
  platform: String,
  firstAdded: Number,
  addCount: Number
}

path /songs {
  read() {true}
  write() {false}
}

path /songs/{platform} {
  read() {true}
}

path /songs/{platform}/{songId} {
  read() {true}
  write() {isAuth() && hasValidatedEmail()}
}
```

## Deployment Steps

1. **Apply Frontend Changes**: Make the code changes above
2. **Compile and Deploy Rules**: 
   ```bash
   npm run compile-rules
   firebase deploy --only database --project your-project-id
   ```
3. **Deploy Frontend**:
   ```bash
   npm run build
   # Deploy to your hosting platform
   ```
4. **Test Thoroughly**: Verify all playlist operations work correctly

## Testing Checklist

- [ ] Can view existing playlists (should work with both old and new format)
- [ ] Can add new songs to playlists
- [ ] Can remove songs from playlists
- [ ] Can move songs within playlists
- [ ] Can create new playlists
- [ ] Can delete playlists
- [ ] Performance is improved (faster loading)
- [ ] No playlist data corruption

## Rollback Plan

If issues occur after deploying these changes:

1. **Revert frontend code** to the current version
2. **Revert security rules** (comment out songs collection rules)
3. **Redeploy** both frontend and rules
4. **Investigate issues** before attempting migration again