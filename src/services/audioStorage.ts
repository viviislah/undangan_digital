// IndexedDB storage for large user-uploaded audio files
// Eliminates browser localStorage 5MB quota errors

const DB_NAME = 'UndangankuAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'audio_tracks';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// In-memory cache for fast synchronous access
const memoryCache = new Map<string, string>();

export async function saveAudioTrack(id: string, dataUrl: string): Promise<void> {
  memoryCache.set(id, dataUrl);
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(dataUrl, id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save audio to IndexedDB, fallback to memory cache:', err);
  }
}

export async function getAudioTrack(id: string): Promise<string | null> {
  if (memoryCache.has(id)) {
    return memoryCache.get(id)!;
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        const result = req.result as string | undefined;
        if (result) {
          memoryCache.set(id, result);
          resolve(result);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Failed to get audio from IndexedDB:', err);
    return null;
  }
}

export async function deleteAudioTrack(id: string): Promise<void> {
  memoryCache.delete(id);
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete audio from IndexedDB:', err);
  }
}

/**
 * Resolves an audioUrl:
 * If it starts with "indexeddb:ID", it pulls the full DataURL from IndexedDB.
 * Otherwise returns the URL as is.
 */
export async function resolveAudioUrl(url?: string): Promise<string> {
  if (!url) return '';
  if (url.startsWith('indexeddb:')) {
    const trackId = url.replace('indexeddb:', '');
    const resolved = await getAudioTrack(trackId);
    return resolved || '';
  }
  return url;
}
