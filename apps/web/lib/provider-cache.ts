/**
 * Simple in-memory cache for provider discovery results with 1hr TTL
 */

import type { DiscoveredProvider } from "./provider-discovery";

interface CacheEntry {
  data: DiscoveredProvider[];
  expiresAt: number;
}

const TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, CacheEntry>();

export function getCacheKey(
  homeId: string,
  specialty: string,
  radius: number
): string {
  return `${homeId}-${specialty.toLowerCase()}-${radius}`;
}

export function getCached(key: string): DiscoveredProvider[] | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCached(key: string, data: DiscoveredProvider[]): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + TTL_MS,
  });
}

export function clearCache(): void {
  cache.clear();
}
