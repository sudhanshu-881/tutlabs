/**
 * CacheService - Enterprise-grade caching layer
 * Provides Redis-like caching with TTL, invalidation, and performance optimization
 */

import { BaseService } from './BaseService';

export interface CacheConfig {
  defaultTTL: number; // in seconds
  maxSize: number; // maximum number of entries
  enableCompression: boolean;
  enablePersistence: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  memoryUsage: number;
}

export class CacheService extends BaseService {
  private memoryCache: Map<string, { data: any; timestamp: number; ttl: number; accessCount: number }> = new Map();
  private stats = { hits: 0, misses: 0 };
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    super({
      enableCaching: true,
      cacheTTL: config.defaultTTL || 300,
      enableAnalytics: true
    });

    this.config = {
      defaultTTL: 300, // 5 minutes
      maxSize: 1000,
      enableCompression: true,
      enablePersistence: true,
      ...config
    };

    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Set a value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const cacheKey = this.sanitizeKey(key);
    const cacheTTL = ttl || this.config.defaultTTL;
    
    // Check if we need to evict entries
    if (this.memoryCache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const cacheEntry = {
      data: this.config.enableCompression ? this.compress(value) : value,
      timestamp: Date.now(),
      ttl: cacheTTL * 1000, // Convert to milliseconds
      accessCount: 0
    };

    this.memoryCache.set(cacheKey, cacheEntry);

    // Persist to localStorage if enabled
    if (this.config.enablePersistence) {
      try {
        localStorage.setItem(`cache_${cacheKey}`, JSON.stringify({
          data: cacheEntry.data,
          timestamp: cacheEntry.timestamp,
          ttl: cacheEntry.ttl
        }));
      } catch (error) {
        console.warn('Failed to persist cache entry:', error);
      }
    }

    this.trackAnalytics('cache_set', { key: cacheKey, ttl: cacheTTL });
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.sanitizeKey(key);
    const entry = this.memoryCache.get(cacheKey);

    if (entry) {
      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(cacheKey);
        this.stats.misses++;
        this.trackAnalytics('cache_miss_expired', { key: cacheKey });
        return null;
      }

      // Update access count and return data
      entry.accessCount++;
      this.stats.hits++;
      
      const data = this.config.enableCompression ? this.decompress(entry.data) : entry.data;
      this.trackAnalytics('cache_hit', { key: cacheKey, accessCount: entry.accessCount });
      
      return data;
    }

    // Try to load from persistence
    if (this.config.enablePersistence) {
      try {
        const persisted = localStorage.getItem(`cache_${cacheKey}`);
        if (persisted) {
          const parsed = JSON.parse(persisted);
          
          // Check if expired
          if (Date.now() - parsed.timestamp > parsed.ttl) {
            localStorage.removeItem(`cache_${cacheKey}`);
            this.stats.misses++;
            return null;
          }

          // Restore to memory cache
          this.memoryCache.set(cacheKey, {
            data: parsed.data,
            timestamp: parsed.timestamp,
            ttl: parsed.ttl,
            accessCount: 1
          });

          this.stats.hits++;
          const data = this.config.enableCompression ? this.decompress(parsed.data) : parsed.data;
          this.trackAnalytics('cache_hit_persisted', { key: cacheKey });
          
          return data;
        }
      } catch (error) {
        console.warn('Failed to load persisted cache entry:', error);
      }
    }

    this.stats.misses++;
    this.trackAnalytics('cache_miss', { key: cacheKey });
    return null;
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<boolean> {
    const cacheKey = this.sanitizeKey(key);
    const deleted = this.memoryCache.delete(cacheKey);

    if (this.config.enablePersistence) {
      try {
        localStorage.removeItem(`cache_${cacheKey}`);
      } catch (error) {
        console.warn('Failed to delete persisted cache entry:', error);
      }
    }

    this.trackAnalytics('cache_delete', { key: cacheKey, success: deleted });
    return deleted;
  }

  /**
   * Check if a key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const cacheKey = this.sanitizeKey(key);
    const entry = this.memoryCache.get(cacheKey);

    if (entry) {
      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(cacheKey);
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();

    if (this.config.enablePersistence) {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Failed to clear persisted cache:', error);
      }
    }

    this.stats = { hits: 0, misses: 0 };
    this.trackAnalytics('cache_clear', { size: this.memoryCache.size });
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.memoryCache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Get all cache keys
   */
  getKeys(): string[] {
    return Array.from(this.memoryCache.keys());
  }

  /**
   * Get cache entries by pattern
   */
  getKeysByPattern(pattern: string): string[] {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return this.getKeys().filter(key => regex.test(key));
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    const keys = this.getKeysByPattern(pattern);
    let invalidated = 0;

    for (const key of keys) {
      if (await this.delete(key)) {
        invalidated++;
      }
    }

    this.trackAnalytics('cache_invalidate_pattern', { pattern, invalidated });
    return invalidated;
  }

  /**
   * Set multiple values at once
   */
  async setMany(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    const promises = entries.map(({ key, value, ttl }) => this.set(key, value, ttl));
    await Promise.all(promises);
  }

  /**
   * Get multiple values at once
   */
  async getMany<T>(keys: string[]): Promise<Record<string, T | null>> {
    const results: Record<string, T | null> = {};
    
    const promises = keys.map(async (key) => {
      const value = await this.get<T>(key);
      results[key] = value;
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Increment a numeric value in cache
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    const current = await this.get<number>(key) || 0;
    const newValue = current + amount;
    await this.set(key, newValue);
    return newValue;
  }

  /**
   * Decrement a numeric value in cache
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    return this.increment(key, -amount);
  }

  /**
   * Set a value with expiration callback
   */
  async setWithCallback<T>(
    key: string, 
    value: T, 
    ttl: number, 
    onExpire?: (key: string, value: T) => void
  ): Promise<void> {
    await this.set(key, value, ttl);
    
    if (onExpire) {
      setTimeout(() => {
        const expiredValue = this.memoryCache.get(this.sanitizeKey(key))?.data;
        if (expiredValue) {
          onExpire(key, this.config.enableCompression ? this.decompress(expiredValue) : expiredValue);
        }
      }, ttl * 1000);
    }
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmup(warmupData: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    this.trackAnalytics('cache_warmup_start', { entries: warmupData.length });
    
    await this.setMany(warmupData);
    
    this.trackAnalytics('cache_warmup_complete', { 
      entries: warmupData.length,
      cacheSize: this.memoryCache.size 
    });
  }

  /**
   * Sanitize cache key
   */
  private sanitizeKey(key: string): string {
    return key
      .replace(/[^a-zA-Z0-9:_-]/g, '_')
      .substring(0, 200); // Limit key length
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey = '';
    let oldestAccess = Infinity;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      // Prioritize by access count, then by timestamp
      if (entry.accessCount < oldestAccess || 
          (entry.accessCount === oldestAccess && entry.timestamp < oldestTimestamp)) {
        oldestKey = key;
        oldestAccess = entry.accessCount;
        oldestTimestamp = entry.timestamp;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      this.trackAnalytics('cache_evict_lru', { key: oldestKey });
    }
  }

  /**
   * Start cleanup interval for expired entries
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, entry] of this.memoryCache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.memoryCache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        this.trackAnalytics('cache_cleanup', { cleaned, remaining: this.memoryCache.size });
      }
    }, 60000); // Clean every minute
  }

  /**
   * Simple compression using JSON stringify (in production, use proper compression)
   */
  private compress(data: any): string {
    return JSON.stringify(data);
  }

  /**
   * Simple decompression using JSON parse
   */
  private decompress<T>(data: string): T {
    return JSON.parse(data);
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [key, entry] of this.memoryCache.entries()) {
      totalSize += key.length * 2; // Unicode characters
      totalSize += JSON.stringify(entry).length * 2;
    }

    return totalSize;
  }

  /**
   * Export cache data for backup
   */
  exportCache(): Record<string, any> {
    const exportData: Record<string, any> = {};
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (Date.now() - entry.timestamp <= entry.ttl) {
        exportData[key] = {
          data: entry.data,
          timestamp: entry.timestamp,
          ttl: entry.ttl
        };
      }
    }

    return exportData;
  }

  /**
   * Import cache data from backup
   */
  async importCache(cacheData: Record<string, any>): Promise<void> {
    for (const [key, entry] of Object.entries(cacheData)) {
      this.memoryCache.set(key, {
        data: entry.data,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        accessCount: 0
      });
    }

    this.trackAnalytics('cache_import', { entries: Object.keys(cacheData).length });
  }
}

// Export singleton instance
export const cacheService = new CacheService({
  defaultTTL: 300, // 5 minutes
  maxSize: 1000,
  enableCompression: true,
  enablePersistence: true
});
