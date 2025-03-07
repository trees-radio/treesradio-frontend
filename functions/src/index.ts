import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

admin.initializeApp();

const storage = admin.storage();
const bucket = storage.bucket();

interface ChatMessage {
  msg: string;
  uid: string;
  username: string;
  timestamp: number;
  mentions?: string[];
  key?: string;
}

/**
 * Scheduled function that runs every hour to delete expired chat images
 * Based on the 'expires_at' metadata field set during upload
 */
export const cleanupExpiredChatImages = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async () => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    console.log(`Starting cleanup job at ${new Date().toISOString()}`);

    try {
      // Get all files in the chat_images directory
      const [files] = await bucket.getFiles({prefix: 'chat_images/'});
      console.log(`Found ${files.length} total chat images to check`);

      let deletedCount = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const deletePromises: Promise<any>[] = [];

      for (const file of files) {
        try {
          // Get the file metadata
          const [metadata] = await file.getMetadata();

          // Check if the file has an expiration timestamp
          if (metadata &&
            metadata.metadata &&
            metadata.metadata.expires_at) {
            const expirationTime =
              parseInt(String(metadata.metadata.expires_at), 10);

            // If the file has expired, add it to our delete queue
            if (expirationTime <= currentTimestamp) {
              console.log(`Deleting expired file: ${file.name}, 
                expired at: ${new Date(expirationTime * 1000)
    .toISOString()}`);
              deletePromises.push(file.delete());
              deletedCount++;
            }
          } else {
            // Handle files without proper expiration metadata
            // Check creation time as fallback
            if (metadata.timeCreated) {
              const fileCreationTime =
                new Date(metadata.timeCreated).getTime() / 1000;
              const sixHoursInSeconds = 6 * 60 * 60;

              if (currentTimestamp - fileCreationTime >= sixHoursInSeconds) {
                console.log(`Deleting old file without expiration: 
                  ${file.name}, created: ${metadata.timeCreated}`);
                deletePromises.push(file.delete());
                deletedCount++;
              }
            }
          }
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
        }
      }

      // Execute all delete operations
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
      }

      console.log(`Cleanup complete. Deleted ${deletedCount} 
          expired chat images.`);
      return null;
    } catch (error) {
      console.error('Error in cleanup job:', error);
      return null;
    }
  });

/**
 * Also delete images when their associated chat message is deleted
 * This is a backup cleanup mechanism in case the scheduled
 * job misses some images
 */
export const deleteChatImage = functions.database
  .ref('/chat/{messageId}')
  .onDelete(async (snapshot, context) => {
    try {
      const message = snapshot.val() as ChatMessage | null;

      // Check if the message contained an embedded image
      if (message && message.msg) {
        const imageUrlMatch = message.msg.match(/\[img:([^\]]+)\]/);
        if (imageUrlMatch && imageUrlMatch[1]) {
          const imageUrl = imageUrlMatch[1];

          // Extract the storage path from the URL
          // Note: This depends on how your storage URLs are structured
          const storagePathMatch = imageUrl.match(/chat_images\/[^?]+/);

          if (storagePathMatch) {
            const storagePath = storagePathMatch[0];
            const file = bucket.file(storagePath);

            // Check if file exists before trying to delete
            const [exists] = await file.exists();
            if (exists) {
              await file.delete();
              console.log(
                `Deleted image ${storagePath} associated 
                 with deleted chat message 
                 ${context.params.messageId}`);
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error deleting chat image:', error);
      return null;
    }
  });

interface ImageStats {
  timestamp: object;
  totalFiles: number;
  totalSizeBytes: number;
  totalSizeMB: number;
  oldestFile: string | null;
  newestFile: string | null;
  userCounts: {
    [userId: string]: number;
  };
}

/**
 * Optional: Generate system usage statistics for monitoring
 * This helps track storage usage and cleanup efficiency
 */
export const generateChatImageStats = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    try {
      // Get all files in chat_images directory
      const [files] = await bucket.getFiles({prefix: 'chat_images/'});

      let totalSize = 0;
      let oldestTimestamp = Infinity;
      let newestTimestamp = 0;
      const countByUser: { [userId: string]: number } = {};

      for (const file of files) {
        const [metadata] = await file.getMetadata();
        if (!metadata) continue;
        // Add to total size (in bytes)
        totalSize += metadata.size ? parseInt(metadata.size as string, 10) : 0;

        // Track file creation time
        if (!metadata.timeCreated) continue;
        const creationTime = new Date(metadata.timeCreated).getTime() / 1000;
        if (creationTime < oldestTimestamp) oldestTimestamp = creationTime;
        if (creationTime > newestTimestamp) newestTimestamp = creationTime;

        // Count by user
        const userMatch = file.name.match(/chat_images\/([^/]+)/);
        if (userMatch && userMatch[1]) {
          const userId = userMatch[1];
          countByUser[userId] = (countByUser[userId] || 0) + 1;
        }
      }

      // Calculate stats
      const stats: ImageStats = {
        timestamp: admin.database.ServerValue.TIMESTAMP,
        totalFiles: files.length,
        totalSizeBytes: totalSize,
        totalSizeMB: Math.round(
          (totalSize / (1024 * 1024)) * 100) / 100,
        oldestFile: oldestTimestamp !== Infinity ?
          new Date(oldestTimestamp * 1000).toISOString() : null,
        newestFile: newestTimestamp !== 0 ?
          new Date(newestTimestamp * 1000).toISOString() : null,
        userCounts: countByUser,
      };

      // Store stats in database
      await admin.database().ref('stats/chatImages').set(stats);
      console.log('Chat image stats updated:', stats);

      return null;
    } catch (error) {
      console.error('Error generating chat image stats:', error);
      return null;
    }
  });
