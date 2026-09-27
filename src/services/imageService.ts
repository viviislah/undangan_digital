/**
 * Client-Side Image Compression & Upload Service
 * Automatically compresses large camera photos (10MB+) down to crisp, lightweight images (~150KB)
 * and uploads them to the server for persistent storage across all devices.
 */

export interface CompressOptions {
  maxDimension?: number;
  quality?: number;
}

/**
 * Compresses an image File using an offscreen HTML5 Canvas
 * Reduces dimensions to at most maxDimension (default 1600px) and quality to 0.82.
 */
export const compressImageFile = async (
  file: File,
  options: CompressOptions = {}
): Promise<string> => {
  // Optimized 1200px max dimension & 0.78 quality provides razor-sharp display
  // while keeping image payload ~75KB so multiple photos easily fit within browser storage quotas
  const { maxDimension = 1200, quality = 0.78 } = options;

  return new Promise((resolve, reject) => {
    // If it's not an image, reject
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image'));
    }

    // If it's a small SVG or GIF, don't re-compress on canvas (to preserve animation/vectors)
    if (file.type === 'image/svg+xml' || (file.type === 'image/gif' && file.size < 2 * 1024 * 1024)) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original base64 if 2d context unavailable
          return resolve(e.target?.result as string);
        }

        // Better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Uploads a compressed base64 image to the server.
 * Returns the permanent server URL (e.g. /uploads/...) if online,
 * or the compressed base64 data URL if offline.
 */
export const uploadImageToServer = async (
  base64Data: string,
  prefix = 'photo',
  id = 'custom'
): Promise<string> => {
  if (!base64Data) return '';

  // If already a server URL or web URL, return as-is
  if (base64Data.startsWith('/uploads/') || base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
    return base64Data;
  }

  try {
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64Data,
        prefix,
        id,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('Direct image upload to server failed, using local compressed image:', err);
  }

  // Fallback to compressed base64 string
  return base64Data;
};

/**
 * Normalizes external media links (Google Drive, Dropbox, relative URLs)
 * and resolves base paths for GitHub Pages sub-directories.
 */
export const resolveExternalMediaUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();

  // Dropbox direct link
  if (trimmed.includes('dropbox.com')) {
    return trimmed
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace('&dl=0', '')
      .replace('?dl=0', '');
  }

  // Google Drive view link conversion
  if (trimmed.includes('drive.google.com/file/d/')) {
    const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
  }

  // Data URLs or external absolute HTTP/HTTPS links
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Server uploaded images (e.g. /uploads/photo-xxx.jpg)
  // When running on static GitHub Pages, local Express /uploads/ is not available, so fallback.
  // When running in fullstack (Express backend), serve the actual uploaded file.
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    if (typeof window !== 'undefined' && window.location?.hostname?.endsWith('github.io')) {
      return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${cleanPath}`;
    }
    return cleanPath;
  }

  // Relative paths from public/ (e.g. /images/..., /facth-logo...)
  // On GitHub Pages (hosted at https://username.github.io/repo-name/), a leading slash '/'
  // causes the browser to request from https://username.github.io/images/... (domain root),
  // which 404s. Prepends Vite's base path ('./') to ensure proper resolution.
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    const base = import.meta.env.BASE_URL || './';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    return `${cleanBase}${trimmed.slice(1)}`;
  }

  return trimmed;
};
