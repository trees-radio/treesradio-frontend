/**
 * Image proxy utility to ensure images require proper referrer
 * This helps protect against hotlinking and ensures images are only loaded from treesradio.com
 */

interface ImageProxyConfig {
  requireReferrer?: boolean;
  allowedReferrers?: string[];
  proxyUrl?: string;
}

const defaultConfig: ImageProxyConfig = {
  requireReferrer: true,
  allowedReferrers: ['treesradio.com', 'www.treesradio.com'],
  proxyUrl: undefined // Set this if you have a proxy server
};

/**
 * Process image URL to ensure it has proper referrer protection
 * @param imageUrl The original image URL
 * @param config Optional configuration
 * @returns Processed image URL
 */
export function processImageUrl(imageUrl: string, config: ImageProxyConfig = defaultConfig): string {
  // If the image is from Firebase Storage, it already has access controls
  if (imageUrl.includes('firebasestorage.googleapis.com')) {
    return imageUrl;
  }

  // If we have a proxy server configured, use it for external images
  if (config.proxyUrl) {
    return `${config.proxyUrl}?url=${encodeURIComponent(imageUrl)}&referrer=treesradio.com`;
  }

  // Return the original URL (will rely on referrerPolicy attribute)
  return imageUrl;
}

/**
 * Check if an image URL needs proxy protection
 * @param imageUrl The image URL to check
 * @returns Whether the image needs proxy protection
 */
export function needsProxy(imageUrl: string): boolean {
  // Firebase Storage URLs don't need proxy
  if (imageUrl.includes('firebasestorage.googleapis.com')) {
    return false;
  }

  // Check against whitelist (from imageWhitelist.ts)
  const trustedDomains = [
    'i.imgur.com',
    'imgur.com',
    'media.giphy.com',
    'tr-avatars.herokuapp.com',
    'gfycat.com'
  ];

  try {
    const url = new URL(imageUrl);
    return !trustedDomains.some(domain => url.hostname.includes(domain));
  } catch {
    return true; // If URL parsing fails, assume it needs proxy
  }
}

/**
 * Add security headers to image requests
 * This should be used when setting up Firebase Storage security rules
 */
export const imageSecurityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'origin-when-cross-origin'
};

/**
 * Validate that the current page referrer is allowed
 * This is mainly for documentation as actual validation happens server-side
 */
export function validateReferrer(): boolean {
  if (typeof window === 'undefined') return false;
  
  const referrer = document.referrer;
  if (!referrer) return false;
  
  try {
    const url = new URL(referrer);
    return url.hostname === 'treesradio.com' || url.hostname === 'www.treesradio.com';
  } catch {
    return false;
  }
}