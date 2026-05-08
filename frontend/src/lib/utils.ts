import { clsx, type ClassValue } from"clsx"
import { twMerge } from"tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  
  // Transform Google Drive links to direct view links
  // Match formats like: https://drive.google.com/file/d/FILE_ID/view
  // Or: https://drive.google.com/open?id=FILE_ID
  const gdriveRegex = /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
  const match = url.match(gdriveRegex);
  if (match && match[1]) {
    // Note: Some browsers block this due to third-party cookies if not using an img tag, but it's the standard way for GDrive images.
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  
  return url;
}
