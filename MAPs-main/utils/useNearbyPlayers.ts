import { useState, useEffect, useCallback, useRef } from 'react';
import { Player } from '../types';

interface CacheEntry {
  data: Player[];
  timestamp: number;
  count: number;
}

interface UseNearbyPlayersOptions {
  lat: number;
  lng: number;
  radius: number;
  sport?: string;
  role?: string;
  enabled?: boolean;
}

interface UseNearbyPlayersResult {
  players: Player[];
  isLoading: boolean;
  error: Error | null;
  count: number;
  refresh: () => void;
  isCached: boolean;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<Player[]>>();

function buildCacheKey(lat: number, lng: number, radius: number, sport?: string): string {
  const latBucket = Math.round(lat * 10);
  const lngBucket = Math.round(lng * 10);
  const radiusBucket = Math.round(radius / 5) * 5;
  return `${latBucket}_${lngBucket}_${radiusBucket}_${sport || 'all'}`;
}

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL_MS;
}

export function useNearbyPlayers(options: UseNearbyPlayersOptions): UseNearbyPlayersResult {
  const { lat, lng, radius, sport, role, enabled = true } = options;
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCached, setIsCached] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPlayers = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;
    
    const cacheKey = buildCacheKey(lat, lng, radius, sport);
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached && isCacheValid(cached)) {
        setPlayers(cached.data);
        setIsCached(true);
        setIsLoading(false);
        return;
      }
    }
    
    // Check if request is already in flight (deduplication)
    const existingRequest = inFlightRequests.get(cacheKey);
    if (existingRequest) {
      try {
        const data = await existingRequest;
        setPlayers(data);
        setIsCached(false);
      } catch (err) {
        setError(err as Error);
      }
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setIsCached(false);

    // Build URL with params
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      limit: '100'
    });
    if (sport && sport !== 'All') {
      params.append('sport', sport);
    }
    if (role) {
      params.append('role', role);
    }

    const url = `http://localhost:8080/api/users/nearby?${params.toString()}`;

    // Create the fetch promise and store it for deduplication
    const fetchPromise = (async (): Promise<Player[]> => {
      const response = await fetch(url, {
        signal: abortControllerRef.current?.signal,
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.users || [];
    })();

    inFlightRequests.set(cacheKey, fetchPromise);

    try {
      const data = await fetchPromise;
      
      // Update cache
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        count: data.length
      });

      setPlayers(data);
      setError(null);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(err as Error);
        
        // On error, try to use stale cache
        const staleCache = cache.get(cacheKey);
        if (staleCache) {
          setPlayers(staleCache.data);
          setIsCached(true);
        }
      }
    } finally {
      inFlightRequests.delete(cacheKey);
      setIsLoading(false);
    }
  }, [lat, lng, radius, sport, role, enabled]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPlayers();
    }, 100); // 100ms debounce

    return () => {
      clearTimeout(debounceTimer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPlayers]);

  const refresh = useCallback(() => {
    fetchPlayers(true);
  }, [fetchPlayers]);

  return {
    players,
    isLoading,
    error,
    count: players.length,
    refresh,
    isCached
  };
}

// Utility to prefetch data
export function prefetchNearbyPlayers(lat: number, lng: number, radius: number, sport?: string): void {
  const cacheKey = buildCacheKey(lat, lng, radius, sport);
  
  // Don't prefetch if already cached or in flight
  if (cache.has(cacheKey) || inFlightRequests.has(cacheKey)) {
    return;
  }

  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radius: radius.toString(),
    limit: '100'
  });
  if (sport && sport !== 'All') {
    params.append('sport', sport);
  }

  const url = `http://localhost:8080/api/users/nearby?${params.toString()}`;

  const fetchPromise = fetch(url)
    .then(res => res.json())
    .then(data => {
      const players = data.users || [];
      cache.set(cacheKey, {
        data: players,
        timestamp: Date.now(),
        count: players.length
      });
      return players;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, fetchPromise);
}

// Clear expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      cache.delete(key);
    }
  }
}, 60000); // Every minute
