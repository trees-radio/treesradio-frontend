
START SPECIFICATION:
---
description: Use for documenting the high-level business logic overview of the TreesRadio application, focusing on chat, playlist management, user profiles, and synchronized playback features.
globs: src/**/*.ts,src/**/*.tsx,functions/**/*.ts
alwaysApply: false
---


# main-overview

## Development Guidelines

- Only modify code directly relevant to the specific request. Avoid changing unrelated functionality.
- Never replace code with placeholders like `# ... rest of the processing ...`. Always include complete code.
- Break problems into smaller steps. Think through each step separately before implementing.
- Always provide a complete PLAN with REASONING based on evidence from code and logs before making changes.
- Explain your OBSERVATIONS clearly, then provide REASONING to identify the exact issue. Add console logs when needed to gather more information.


## Core Business Components

### User Profile Management
- Handles user authentication with custom rank system and presence tracking
- Manages validated email addresses and user permissions
- Controls user profile data including avatar, settings and custom flairs
- Implementation: src/stores/profile.ts

### Chat System
- Real-time chat with message deduplication and mention notifications 
- Chat lock system for new users with time-based restrictions
- Image handling with automatic cleanup of expired images
- Implementation: src/stores/chat.ts, src/components/Sidebar/Chat/

### Playlist Management
- Playlist operations including merging, importing from YouTube, and search
- Synchronization across devices using Firebase real-time database
- Song organization with move/remove capabilities and custom sorting
- Implementation: src/stores/playlists.ts

### TokeTimer System
- Session-based social feature with countdown timer
- Special effects and enhanced visuals during 4/20 events
- Multi-session support with join/cancel functionality
- Implementation: src/components/toke/

### Player Synchronization 
- Server-synchronized playback with configurable thresholds
- Volume management with nudge controls
- User feedback system for likes/dislikes/grabs
- Implementation: src/stores/playing.ts

### Waitlist Management
- Auto-join functionality based on user rank and activity
- Time limit enforcement for different user ranks
- Real-time position updates and skip handling
- Implementation: src/stores/waitlist.ts

## Integration Points

### Event System
- Custom event bus for cross-component communication
- Specialized events for playlist imports, search results, and user actions
- Implementation: src/stores/events.ts

### Leaderboard System
- Scoring algorithm based on likes, grabs, and engagement
- Real-time updates of user rankings
- Implementation: src/stores/leaderboard.ts

$END$
END SPECIFICATION