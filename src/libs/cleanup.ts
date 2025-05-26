/**
 * Cleanup Manager
 * 
 * This module manages the cleanup of all stores to prevent memory leaks.
 * It should be called when the application is about to unmount or reload.
 */

import app from '../stores/app';
import playing from '../stores/playing';
import events from '../stores/events';
import chat from '../stores/chat';
import online from '../stores/online';

class CleanupManager {
  private isCleanedUp = false;

  /**
   * Clean up all stores and their listeners/intervals
   */
  cleanup() {
    if (this.isCleanedUp) {
      console.warn('Cleanup already performed');
      return;
    }

    console.log('Starting application cleanup...');

    try {
      // Clean up app store
      if (app && typeof app.cleanup === 'function') {
        app.cleanup();
        console.log('✓ App store cleaned up');
      }

      // Clean up playing store
      if (playing && typeof playing.cleanup === 'function') {
        playing.cleanup();
        console.log('✓ Playing store cleaned up');
      }

      // Clean up events store
      if (events && typeof events.cleanup === 'function') {
        events.cleanup();
        console.log('✓ Events store cleaned up');
      }

      // Clean up chat store
      if (chat && typeof chat.cleanup === 'function') {
        chat.cleanup();
        console.log('✓ Chat store cleaned up');
      }

      // Clean up online store
      if (online && typeof online.cleanup === 'function') {
        online.cleanup();
        console.log('✓ Online store cleaned up');
      }

      this.isCleanedUp = true;
      console.log('✓ Application cleanup completed successfully');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Register cleanup to run on page unload
   */
  registerUnloadCleanup() {
    const handleUnload = () => {
      this.cleanup();
    };

    // Register for various unload events
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('unload', handleUnload);
    
    // For React development with hot reload
    if (process.env.NODE_ENV === 'development') {
      window.addEventListener('beforeunload', handleUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }
}

// Create singleton instance
const cleanupManager = new CleanupManager();

// Auto-register cleanup on module load
cleanupManager.registerUnloadCleanup();

export default cleanupManager;