const cache = new Map<string, { value: any; expiry: number }>();

export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);
  
  if (cached && cached.expiry > now) {
    return cached.value as T;
  }
  
  const value = await fetcher();
  cache.set(key, { value, expiry: now + ttlSeconds * 1000 });
  return value;
}

export function invalidateCache(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}
