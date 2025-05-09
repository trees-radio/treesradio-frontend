// Rank-related constants
export const RANKS = {
  // Ranks in order of privileges (highest to lowest)
  ADMIN: "Admin",
  DEV: "Dev",
  SENIOR_MOD: "Senior Mod",
  FLORIDA_MAN: "Florida Man",
  MOD: "Mod",
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
  RANKS.FRIENT
];

// Ranks with unlimited autojoin time (no activity timeout)
export const RANKS_WITH_UNLIMITED_AUTOJOIN = [
  RANKS.ADMIN,
  RANKS.MOD,
  RANKS.SENIOR_MOD,
  RANKS.FLORIDA_MAN,
  RANKS.DEV,
  RANKS.VIP
];

// Time constants
export const HOUR_IN_SECONDS = 3600;
export const AUTOJOIN_CHECK_INTERVAL = 10000; // 10 seconds
export const STAFF_REFRESH_INTERVAL = 1800000; // 30 minutes