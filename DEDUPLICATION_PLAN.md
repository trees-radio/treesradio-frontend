# Song Deduplication Implementation Plan

## Overview
Transform the current playlist structure from storing full song data to using normalized song references. This reduces database size by ~80% and enables efficient song management.

## Current Structure (104MB)
```
playlists/
  {userId}/
    {playlistId}/
      name: "My Playlist"
      entries/
        {entryId}/
          title: "Song Title"
          url: "https://youtube.com/watch?v=abc123"
          duration: 240
          thumbnail: "https://img.youtube.com/..."
          // ... duplicated across all playlists
```

## New Structure (~20MB)
```
songs/
  youtube/
    {videoId}/  // e.g., "abc123"
      title: "Song Title"
      url: "https://youtube.com/watch?v=abc123"
      duration: 240
      thumbnail: "https://img.youtube.com/..."
      platform: "youtube"
      firstAdded: 1640995200000
      addCount: 42  // how many times added to playlists
      
  soundcloud/
    {trackId}/
      title: "Track Title"
      url: "https://soundcloud.com/user/track"
      duration: 180
      platform: "soundcloud"
      // ... similar structure
      
  vimeo/
    {videoId}/
      // ... similar structure

playlists/
  {userId}/
    {playlistId}/
      name: "My Playlist"
      entries/
        {entryId}/
          songRef: "youtube/abc123"  // reference to songs collection
          addedAt: 1640995200000
          addedBy: {userId}
```

## Platform ID Extraction

### YouTube
- URL: `https://youtube.com/watch?v=abc123` → ID: `abc123`
- URL: `https://youtu.be/abc123` → ID: `abc123`

### SoundCloud  
- URL: `https://soundcloud.com/user/track-name` → ID: `user/track-name`
- API can provide numeric track ID if needed

### Vimeo
- URL: `https://vimeo.com/123456` → ID: `123456`

## Implementation Steps

1. **Backend Migration** (tr-pineapple-production)
   - Extract all unique songs from existing playlists
   - Create normalized songs collection
   - Update playlist entries to use references
   - Verify data integrity

2. **Frontend Updates** (treesradio-frontend)
   - Update playlists.ts to resolve song references
   - Modify playlist display components
   - Update song adding logic to check for existing songs

3. **Security Rules**
   - Add rules for songs collection (read-only for users)
   - Maintain existing playlist permissions

## Benefits

- **Storage Reduction**: ~80% reduction (104MB → ~20MB)
- **Consistency**: Single source of truth for song metadata
- **Performance**: Faster playlist loading
- **Analytics**: Track song popularity across playlists
- **Maintenance**: Easy to update song metadata globally

## Migration Safety

- Backup existing data before migration
- Gradual rollout with feature flags
- Rollback plan if issues occur
- Verification scripts to ensure data integrity