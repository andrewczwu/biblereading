interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheManager {
  private readonly CACHE_PREFIX = 'bible_reading_';
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Get an item from cache
   * @param key - Cache key
   * @returns Cached data or null if not found/expired
   */
  get<T>(key: string): T | null {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const cacheItem: CacheItem<T> = JSON.parse(cached);
      
      // Check if cache has expired
      if (Date.now() > cacheItem.expiresAt) {
        this.remove(key);
        return null;
      }
      
      return cacheItem.data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  /**
   * Set an item in cache
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (optional)
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Cache write error:', error);
      // If localStorage is full, clear old cache items
      if (error instanceof DOMException && error.code === 22) {
        this.clearOldCacheItems();
        // Try once more
        try {
          const cacheKey = this.CACHE_PREFIX + key;
          const cacheItem: CacheItem<T> = {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl
          };
          localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
        } catch (retryError) {
          console.error('Cache write failed after cleanup:', retryError);
        }
      }
    }
  }

  /**
   * Remove an item from cache
   * @param key - Cache key
   */
  remove(key: string): void {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  /**
   * Clear all cache items with our prefix
   */
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Clear expired cache items
   */
  clearOldCacheItems(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          const cached = localStorage.getItem(key);
          if (cached) {
            try {
              const cacheItem = JSON.parse(cached);
              if (Date.now() > cacheItem.expiresAt) {
                localStorage.removeItem(key);
              }
            } catch {
              // If we can't parse it, remove it
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  /**
   * Get cache size in bytes
   */
  getCacheSize(): number {
    let size = 0;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          size += item.length + key.length;
        }
      }
    });
    return size;
  }

  /**
   * Check if cache exists and is valid
   */
  has(key: string): boolean {
    const data = this.get(key);
    return data !== null;
  }

  /**
   * Generate cache key for schedule with progress
   */
  getScheduleKey(userId: string, scheduleId?: string, groupId?: string): string {
    if (scheduleId) {
      return `schedule_${userId}_${scheduleId}`;
    } else if (groupId) {
      return `group_${userId}_${groupId}`;
    }
    return '';
  }

  /**
   * Invalidate schedule cache (useful after marking progress)
   */
  invalidateSchedule(userId: string, scheduleId?: string, groupId?: string): void {
    const key = this.getScheduleKey(userId, scheduleId, groupId);
    if (key) {
      this.remove(key);
    }
  }
}

// Export singleton instance
export const cache = new CacheManager();

// Export cache utilities
export const cacheUtils = {
  /**
   * Cache schedule data with appropriate TTL
   */
  cacheSchedule: (data: any, userId: string, scheduleId?: string, groupId?: string) => {
    const key = cache.getScheduleKey(userId, scheduleId, groupId);
    if (key) {
      // Cache for 6 hours for schedule data (it changes when progress is marked)
      cache.set(key, data, 6 * 60 * 60 * 1000);
    }
  },

  /**
   * Get cached schedule data
   */
  getCachedSchedule: (userId: string, scheduleId?: string, groupId?: string): any => {
    const key = cache.getScheduleKey(userId, scheduleId, groupId);
    return key ? cache.get(key) : null;
  },

  /**
   * Cache user schedules list
   */
  cacheUserSchedules: (data: any, cacheKey: string) => {
    // Cache for 1 hour (list changes when new schedules are created/joined)
    cache.set(`user_schedules_${cacheKey}`, data, 60 * 60 * 1000);
  },

  /**
   * Get cached user schedules
   */
  getCachedUserSchedules: (cacheKey: string): any => {
    return cache.get(`user_schedules_${cacheKey}`);
  },

  /**
   * Invalidate user schedules cache
   */
  invalidateUserSchedules: (cacheKey: string) => {
    cache.remove(`user_schedules_${cacheKey}`);
  },

  /**
   * Initialize cache cleanup on app start
   */
  initCache: () => {
    // Clean up expired items on app start
    cache.clearOldCacheItems();

    // Clear all cache on app start to ensure fresh data after updates
    // TODO: Remove this after points feature is stable
    cache.clearAll();
    console.log('Cache cleared on app start for fresh points data');

    // Set up periodic cleanup every hour
    setInterval(() => {
      cache.clearOldCacheItems();
    }, 60 * 60 * 1000); // 1 hour
  },

  /**
   * Invalidate schedule cache (useful after marking progress)
   */
  invalidateSchedule: (userId: string, scheduleId?: string, groupId?: string) => {
    cache.invalidateSchedule(userId, scheduleId, groupId);
  },

  // New separated caching functions
  /**
   * Cache schedule info (metadata and readings - rarely changes)
   */
  cacheScheduleInfo: (data: any, cacheKey: string) => {
    // Cache for 24 hours (schedule info rarely changes)
    cache.set(`schedule_info_${cacheKey}`, data, 24 * 60 * 60 * 1000);
  },

  /**
   * Get cached schedule info
   */
  getCachedScheduleInfo: (cacheKey: string): any => {
    return cache.get(`schedule_info_${cacheKey}`);
  },

  /**
   * Cache progress data (changes more frequently)
   */
  cacheProgress: (data: any, cacheKey: string) => {
    // Cache for 30 minutes (progress changes more frequently)
    cache.set(`progress_${cacheKey}`, data, 30 * 60 * 1000);
  },

  /**
   * Get cached progress data
   */
  getCachedProgress: (cacheKey: string): any => {
    return cache.get(`progress_${cacheKey}`);
  },

  /**
   * Invalidate progress cache (when marking progress)
   */
  invalidateProgress: (userId: string, scheduleId?: string, groupId?: string) => {
    const cacheKey = `progress_${userId}_${scheduleId || groupId}`;
    cache.remove(`progress_${cacheKey}`);
  },

  /**
   * Invalidate schedule info cache (rarely needed)
   */
  invalidateScheduleInfo: (scheduleId?: string, groupId?: string) => {
    const cacheKey = `schedule_info_${scheduleId || groupId}`;
    cache.remove(`schedule_info_${cacheKey}`);
  }
};

export default cache;