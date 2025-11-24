/**
 * Replaces the dimensions in an image URL to get a larger version.
 * This centralizes the brittle string replacement logic.
 *
 * @param originalUrl The original image URL with '400/250' dimensions.
 * @returns A new URL with '800/450' dimensions. If the URL doesn't contain '400/250', 
 *          logs a warning and returns the original URL unchanged.
 */
export const getLargeImageUrl = (originalUrl: string): string => {
  if (!originalUrl.includes('400/250')) {
    console.warn(`getLargeImageUrl: URL doesn't contain expected pattern '400/250': ${originalUrl}`);
    return originalUrl;
  }
  
  return originalUrl.replace('400/250', '800/450');
};
