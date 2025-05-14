// Rank-related constants
export const RANKS = {
  // Ranks in order of privileges (highest to lowest)
  ADMIN: "Admin",
  DEV: "Dev",
  SENIOR_MOD: "Senior Mod",
  FLORIDA_MAN: "Florida Man",
  MOD: "Mod",
  SHRUBBER: "Shrubber",
  VIP: "VIP",
  FRIENT: "Frient",
  USER: "User"
};

// Ranks that can use autoplay
export const RANKS_WITH_AUTOPLAY = [
  RANKS.ADMIN,
  RANKS.MOD,
  RANKS.SENIOR_MOD,
  RANKS.FLORIDA_MAN,
  RANKS.DEV,
  RANKS.VIP,
  RANKS.FRIENT,
  RANKS.SHRUBBER
];

// Ranks with unlimited autojoin time (no activity timeout)
export const RANKS_WITH_UNLIMITED_AUTOJOIN = [
  RANKS.ADMIN,
  RANKS.MOD,
  RANKS.SENIOR_MOD,
  RANKS.FLORIDA_MAN,
  RANKS.DEV,
  RANKS.VIP,
  RANKS.SHRUBBER
];

// Rank utility function for consistent rank checking
import { getUserRank } from './rank';

/**
 * Safely checks if a user has a specific rank or higher
 * @param uid User ID to check
 * @param allowedRanks Array of ranks that are allowed (in order of highest to lowest privilege)
 * @returns Promise<boolean> True if user has one of the allowed ranks
 */
export async function hasRank(uid: string | undefined, allowedRanks: string[]): Promise<boolean> {
  if (!uid) return false;
  
  // Use getUserRank instead of default rank function to ensure we have a fallback to "User"
  const userRank = await getUserRank(uid);
  console.log(`[RANK CHECK] User ${uid} has rank: "${userRank}"`);
  
  return allowedRanks.includes(userRank);
}

// Time constants
export const HOUR_IN_SECONDS = 3600;
export const FOUR_HOURS_IN_SECONDS = 14400; // 4 hours
export const AUTOJOIN_CHECK_INTERVAL = 10000; // 10 seconds
export const STAFF_REFRESH_INTERVAL = 1800000; // 30 minutes