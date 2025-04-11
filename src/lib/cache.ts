export const CACHE_TIME = 3600 * 12; // 12 hours in seconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  cacheTime: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;

  return cached.data as T;
}

export function setCachedData<T>(
  key: string,
  data: T,
  cacheTime: number = CACHE_TIME
): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    cacheTime,
  });
}

export function isCacheStale(key: string): boolean {
  const cached = cache.get(key);
  if (!cached) return true;

  const now = Date.now();
  return now - cached.timestamp > cached.cacheTime * 1000;
}
