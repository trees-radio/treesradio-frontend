
START SPECIFICATION:
---
description: Apply this overview documentation when analyzing core business logic in frontend applications integrating media playback, synchronized user events, and social features with hierarchical user permissions
globs: src/components/**,src/stores/**,src/libs/**
alwaysApply: false
---


# main-overview

## Development Guidelines

- Only modify code directly relevant to the specific request. Avoid changing unrelated functionality.
- Never replace code with placeholders like `# ... rest of the processing ...`. Always include complete code.
- Break problems into smaller steps. Think through each step separately before implementing.
- Always provide a complete PLAN with REASONING based on evidence from code and logs before making changes.
- Explain your OBSERVATIONS clearly, then provide REASONING to identify the exact issue. Add console logs when needed to gather more information.


TreesRadio implements a synchronized social media platform with several unique business domains:

1. Synchronized User Events System (90)
- "Toke" timer coordination for group activities
- Multi-session tracking with participant history
- Special date-based events (4/20 celebrations)
- Custom event dispatch and notification system
Key files: src/stores/toke.ts, src/components/toke/TokeManager.tsx

2. Media Synchronization Engine (85) 
- Cross-platform content integration (YouTube, SoundCloud, Vimeo)
- Synchronized playback with configurable thresholds
- Waitlist management with rank-based privileges
- Position-aware playlist system
Key files: src/stores/playing.ts, src/stores/playlists.ts

3. Hierarchical Permission System (80)
- Multi-tier user ranks (Admin, Dev, Mod, VIP, etc.)
- Feature access control based on rank
- Special privileges for content management
- Custom flair and visual indicators
Key files: src/libs/rank.ts, src/libs/flair.ts

4. Chat Management System (75)
- New user restrictions (30-minute wait period)
- Message grouping for consecutive posts
- Custom emoji and mention system
- Image handling with whitelisting
Key files: src/stores/chat.ts

5. Engagement Tracking (70)
- Score calculation: (likes + grabs - dislikes/2) * multiplier
- User feedback history
- Leaderboard management
- Achievement tracking
Key files: src/stores/leaderboard.ts

Core Integration Points:
- TOS enforcement across all features
- Profile state management
- Cross-component event coordination
- Persistent user preferences

The system architecture emphasizes real-time synchronization and social features while maintaining strict permission hierarchies and content moderation capabilities.

$END$
END SPECIFICATION