/**
 * BaseService - Enterprise-grade service layer foundation
 * Provides common functionality for all services including caching, error handling, and analytics
 */

import { supabase } from '../../context/AuthContext';
import { ApiResponse, PaginationInfo } from '../../../types';

export interface ServiceConfig {
  enableCaching?: boolean;
  cacheTTL?: number; // in seconds
  enableAnalytics?: boolean;
  retryAttempts?: number;
  timeout?: number; // in milliseconds
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export abstract class BaseService {
  protected config: ServiceConfig;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private analyticsQueue: any[] = [];

  constructor(config: ServiceConfig = {}) {
    this.config = {
      enableCaching: true,
      cacheTTL: 300, // 5 minutes default
      enableAnalytics: true,
      retryAttempts: 3,
      timeout: 10000, // 10 seconds
      ...config
    };
  }

  /**
   * Execute a database query with retry logic and error handling
   */
  protected async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    cacheKey?: string
  ): Promise<T> {
    const startTime = Date.now();
    let lastError: any;

    // Check cache first
    if (cacheKey && this.config.enableCaching) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        this.trackAnalytics('cache_hit', { cacheKey, service: this.constructor.name });
        return cached;
      }
    }

    // Retry logic
    for (let attempt = 1; attempt <= this.config.retryAttempts!; attempt++) {
      try {
        const result = await Promise.race([
          queryFn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Query timeout')), this.config.timeout)
          )
        ]);

        if (result.error) {
          throw new ServiceError(
            result.error.message || 'Database query failed',
            result.error.code || 'QUERY_ERROR',
            result.error.status || 500,
            result.error
          );
        }

        if (result.data === null) {
          throw new ServiceError('No data found', 'NOT_FOUND', 404);
        }

        // Cache the result
        if (cacheKey && this.config.enableCaching) {
          this.setCache(cacheKey, result.data);
        }

        // Track analytics
        const duration = Date.now() - startTime;
        this.trackAnalytics('query_success', {
          service: this.constructor.name,
          duration,
          attempt,
          cacheKey
        });

        return result.data;
      } catch (error) {
        lastError = error;
        
        this.trackAnalytics('query_retry', {
          service: this.constructor.name,
          attempt,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        if (attempt === this.config.retryAttempts) {
          break;
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // Track final failure
    const duration = Date.now() - startTime;
    this.trackAnalytics('query_failure', {
      service: this.constructor.name,
      duration,
      error: lastError instanceof Error ? lastError.message : 'Unknown error'
    });

    throw lastError;
  }

  /**
   * Execute multiple queries in parallel with individual error handling
   */
  protected async executeParallelQueries<T>(
    queries: Array<{ key: string; queryFn: () => Promise<{ data: T | null; error: any }> }>
  ): Promise<Record<string, T>> {
    const results: Record<string, T> = {};
    const errors: Record<string, any> = {};

    const promises = queries.map(async ({ key, queryFn }) => {
      try {
        const result = await this.executeQuery(queryFn);
        results[key] = result;
      } catch (error) {
        errors[key] = error;
      }
    });

    await Promise.allSettled(promises);

    if (Object.keys(errors).length > 0) {
      this.trackAnalytics('parallel_query_errors', {
        service: this.constructor.name,
        errors: Object.keys(errors)
      });
    }

    return results;
  }

  /**
   * Create a paginated response
   */
  protected createPaginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): ApiResponse<T[]> {
    const totalPages = Math.ceil(total / limit);
    
    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1
    };

    return {
      data,
      pagination
    };
  }

  /**
   * Cache management
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.config.cacheTTL!
    });
  }

  /**
   * Clear cache for a specific key or all cache
   */
  public clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Analytics tracking
   */
  protected trackAnalytics(eventType: string, data: any): void {
    if (!this.config.enableAnalytics) return;

    const analyticsEvent = {
      event_type: eventType,
      event_data: data,
      timestamp: new Date().toISOString(),
      service: this.constructor.name
    };

    this.analyticsQueue.push(analyticsEvent);

    // Batch send analytics every 10 events or every 30 seconds
    if (this.analyticsQueue.length >= 10) {
      this.flushAnalytics();
    }
  }

  private async flushAnalytics(): Promise<void> {
    if (this.analyticsQueue.length === 0) return;

    const events = [...this.analyticsQueue];
    this.analyticsQueue = [];

    try {
      // Send to analytics service (Supabase analytics table)
      if (supabase) {
        await supabase.from('user_analytics').insert(
          events.map(event => ({
            event_type: event.event_type,
            event_data: event.event_data,
            session_id: this.getSessionId(),
            created_at: event.timestamp
          }))
        );
      }
    } catch (error) {
      console.warn('Failed to send analytics:', error);
      // Re-queue events for retry
      this.analyticsQueue.unshift(...events);
    }
  }

  private getSessionId(): string {
    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem('tutlabs_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('tutlabs_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Validate input parameters
   */
  protected validateRequired(params: Record<string, any>, required: string[]): void {
    const missing = required.filter(key => !params[key]);
    if (missing.length > 0) {
      throw new ServiceError(
        `Missing required parameters: ${missing.join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
    }
  }

  /**
   * Sanitize and validate string input
   */
  protected sanitizeString(input: string, maxLength: number = 1000): string {
    if (typeof input !== 'string') {
      throw new ServiceError('Input must be a string', 'VALIDATION_ERROR', 400);
    }

    return input
      .trim()
      .substring(0, maxLength)
      .replace(/[<>]/g, ''); // Basic XSS prevention
  }

  /**
   * Generate cache key from parameters
   */
  protected generateCacheKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${prefix}:${sortedParams}`;
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.flushAnalytics();
    this.cache.clear();
  }
}

// Auto-flush analytics every 30 seconds
setInterval(() => {
  // This will be handled by individual service instances
}, 30000);
