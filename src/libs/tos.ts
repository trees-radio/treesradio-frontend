// TOS utilities for checking TOS acceptance status and version

// The key used in localStorage
export const TOS_ACCEPTED_KEY = "trees_radio_tos_version";

// Current version of the TOS - increment this when you make significant changes
export const CURRENT_TOS_VERSION = "1.0.0";

/**
 * Check if the user has accepted the current version of the Terms of Service
 * @returns Boolean indicating if the user has accepted the current TOS version
 */
export const hasTosBeenAccepted = (): boolean => {
  try {
    const acceptedVersion = localStorage.getItem(TOS_ACCEPTED_KEY);
    console.log("TOS check from storage - accepted version:", acceptedVersion, "current version:", CURRENT_TOS_VERSION);
    
    // Return true only if the accepted version matches the current version
    return acceptedVersion === CURRENT_TOS_VERSION;
  } catch (error) {
    console.error("Error checking TOS acceptance:", error);
    return false;
  }
};

/**
 * Set the TOS acceptance status in local storage with the current version
 * @param accepted Boolean indicating if the TOS has been accepted
 */
export const setTosAccepted = (accepted: boolean): void => {
  try {
    if (accepted) {
      console.log(`Setting TOS accepted to version ${CURRENT_TOS_VERSION}`);
      localStorage.setItem(TOS_ACCEPTED_KEY, CURRENT_TOS_VERSION);
    } else {
      console.log("Clearing TOS acceptance");
      localStorage.removeItem(TOS_ACCEPTED_KEY);
    }
  } catch (error) {
    console.error("Error setting TOS acceptance:", error);
  }
};

/**
 * Get the user's accepted TOS version (if any)
 * @returns String of the accepted version or null if none
 */
export const getAcceptedTosVersion = (): string | null => {
  try {
    return localStorage.getItem(TOS_ACCEPTED_KEY);
  } catch (error) {
    console.error("Error getting accepted TOS version:", error);
    return null;
  }
};

/**
 * Check if the user has accepted any version of the TOS
 * @returns Boolean indicating if the user has accepted any TOS version
 */
export const hasAcceptedAnyTosVersion = (): boolean => {
  try {
    return localStorage.getItem(TOS_ACCEPTED_KEY) !== null;
  } catch (error) {
    console.error("Error checking if any TOS version was accepted:", error);
    return false;
  }
};

/**
 * Remove the TOS acceptance from local storage (useful for testing or reset)
 */
export const clearTosAcceptance = (): void => {
  try {
    localStorage.removeItem(TOS_ACCEPTED_KEY);
    console.log("TOS acceptance cleared from storage");
  } catch (error) {
    console.error("Error clearing TOS acceptance:", error);
  }
};

export default {
  hasTosBeenAccepted,
  setTosAccepted,
  getAcceptedTosVersion,
  hasAcceptedAnyTosVersion,
  clearTosAcceptance,
  TOS_ACCEPTED_KEY,
  CURRENT_TOS_VERSION
};