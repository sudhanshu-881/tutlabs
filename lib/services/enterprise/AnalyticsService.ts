/**
 * AnalyticsService - Enterprise-grade analytics and performance monitoring
 * Tracks user behavior, performance metrics, and business intelligence
 */

import { BaseService } from './BaseService';
import { UserAnalytics } from '../../../types';

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  userEngagement: number;
}

export interface UserBehaviorEvent {
  event_type: string;
  event_data: Record<string, any>;
  user_id?: string;
  session_id?: string;
  timestamp?: string;
  page_url?: string;
  user_agent?: string;
  ip_address?: string;
}

export interface BusinessMetrics {
  total_users: number;
  active_users: number;
  conversion_rate: number;
  revenue: number;
  session_duration: number;
  bounce_rate: number;
}

export class AnalyticsService extends BaseService {
  private eventQueue: UserBehaviorEvent[] = [];
  private performanceMetrics: Map<string, number[]> = new Map();
  private sessionStartTime: number = Date.now();
  private pageViewCount: number = 0;

  constructor() {
    super({
      enableCaching: false, // Analytics shouldn't be cached
      enableAnalytics: true
    });

    this.initializeTracking();
    this.startBatchProcessing();
  }

  /**
   * Track a user behavior event
   */
  trackEvent(eventType: string, eventData: Record<string, any> = {}): void {
    const event: UserBehaviorEvent = {
      event_type: eventType,
      event_data: {
        ...eventData,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      },
      session_id: this.getSessionId(),
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    this.eventQueue.push(event);

    // Track high-priority events immediately
    if (this.isHighPriorityEvent(eventType)) {
      this.flushEvents();
    }

    this.trackAnalytics('event_tracked', { event_type: eventType });
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, additionalData: Record<string, any> = {}): void {
    this.pageViewCount++;
    
    this.trackEvent('page_view', {
      page_name: pageName,
      page_url: window.location.href,
      referrer: document.referrer,
      view_count: this.pageViewCount,
      session_duration: Date.now() - this.sessionStartTime,
      ...additionalData
    });

    // Track performance metrics for this page
    this.trackPerformanceMetrics();
  }

  /**
   * Track user action (click, form submission, etc.)
   */
  trackUserAction(action: string, target: string, additionalData: Record<string, any> = {}): void {
    this.trackEvent('user_action', {
      action,
      target,
      ...additionalData
    });
  }

  /**
   * Track API call performance
   */
  trackAPICall(endpoint: string, method: string, duration: number, status: number, error?: string): void {
    this.trackEvent('api_call', {
      endpoint,
      method,
      duration,
      status,
      error,
      success: status >= 200 && status < 300
    });

    // Update performance metrics
    this.updatePerformanceMetric('api_response_time', duration);
    if (status >= 400) {
      this.updatePerformanceMetric('api_errors', 1);
    }
  }

  /**
   * Track search query
   */
  trackSearch(query: string, filters: Record<string, any>, resultCount: number, searchTime: number): void {
    this.trackEvent('search', {
      query: this.sanitizeString(query, 100),
      filters,
      result_count: resultCount,
      search_time_ms: searchTime,
      has_results: resultCount > 0
    });
  }

  /**
   * Track conversion events
   */
  trackConversion(conversionType: string, value?: number, additionalData: Record<string, any> = {}): void {
    this.trackEvent('conversion', {
      conversion_type: conversionType,
      value,
      ...additionalData
    });
  }

  /**
   * Track error events
   */
  trackError(error: Error, context: string, additionalData: Record<string, any> = {}): void {
    this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      context,
      ...additionalData
    });

    this.updatePerformanceMetric('errors', 1);
  }

  /**
   * Track performance metrics
   */
  trackPerformanceMetrics(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.trackEvent('performance', {
          page_load_time: navigation.loadEventEnd - navigation.loadEventStart,
          dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          first_paint: this.getFirstPaint(),
          first_contentful_paint: this.getFirstContentfulPaint(),
          largest_contentful_paint: this.getLargestContentfulPaint(),
          cumulative_layout_shift: this.getCumulativeLayoutShift()
        });

        this.updatePerformanceMetric('page_load_time', navigation.loadEventEnd - navigation.loadEventStart);
      }
    }
  }

  /**
   * Track cache performance
   */
  trackCachePerformance(hit: boolean, key: string, ttl: number): void {
    this.trackEvent('cache_performance', {
      hit,
      key: this.sanitizeString(key, 50),
      ttl
    });

    this.updatePerformanceMetric('cache_hits', hit ? 1 : 0);
    this.updatePerformanceMetric('cache_misses', hit ? 0 : 1);
  }

  /**
   * Get performance metrics summary
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const apiResponseTimes = this.performanceMetrics.get('api_response_time') || [];
    const cacheHits = this.performanceMetrics.get('cache_hits') || [];
    const cacheMisses = this.performanceMetrics.get('cache_misses') || [];
    const errors = this.performanceMetrics.get('errors') || [];
    const pageLoadTimes = this.performanceMetrics.get('page_load_time') || [];

    const totalCacheRequests = cacheHits.length + cacheMisses.length;
    const cacheHitRate = totalCacheRequests > 0 ? (cacheHits.length / totalCacheRequests) * 100 : 0;
    
    const totalEvents = this.eventQueue.length + this.getFlushedEventCount();
    const errorRate = totalEvents > 0 ? (errors.length / totalEvents) * 100 : 0;

    return {
      pageLoadTime: pageLoadTimes.length > 0 ? pageLoadTimes.reduce((a, b) => a + b, 0) / pageLoadTimes.length : 0,
      apiResponseTime: apiResponseTimes.length > 0 ? apiResponseTimes.reduce((a, b) => a + b, 0) / apiResponseTimes.length : 0,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      userEngagement: this.calculateUserEngagement()
    };
  }

  /**
   * Get business metrics
   */
  async getBusinessMetrics(): Promise<BusinessMetrics> {
    try {
      const metrics = await this.executeQuery(
        async () => {
          // Get user counts
          const { count: totalUsers, error: usersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

          if (usersError) throw usersError;

          // Get active users (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const { count: activeUsers, error: activeError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('last_active_at', thirtyDaysAgo.toISOString());

          if (activeError) throw activeError;

          // Get session data
          const { data: sessions, error: sessionsError } = await supabase
            .from('sessions')
            .select('status, price, created_at');

          if (sessionsError) throw sessionsError;

          const completedSessions = sessions.filter(s => s.status === 'completed');
          const conversionRate = sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0;
          const revenue = completedSessions.reduce((sum, s) => sum + (s.price || 0), 0);

          return {
            data: {
              total_users: totalUsers || 0,
              active_users: activeUsers || 0,
              conversion_rate: Math.round(conversionRate * 100) / 100,
              revenue,
              session_duration: this.getAverageSessionDuration(),
              bounce_rate: this.calculateBounceRate()
            },
            error: null
          };
        }
      );

      return metrics;
    } catch (error) {
      console.error('Failed to get business metrics:', error);
      return {
        total_users: 0,
        active_users: 0,
        conversion_rate: 0,
        revenue: 0,
        session_duration: 0,
        bounce_rate: 0
      };
    }
  }

  /**
   * Get user analytics for a specific user
   */
  async getUserAnalytics(userId: string, days: number = 30): Promise<UserAnalytics[]> {
    this.validateRequired({ userId }, ['userId']);

    try {
      const analytics = await this.executeQuery(
        async () => {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - days);

          const { data, error } = await supabase
            .from('user_analytics')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });

          return { data, error };
        }
      );

      return analytics;
    } catch (error) {
      throw new ServiceError(
        'Failed to get user analytics',
        'USER_ANALYTICS_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(startDate: string, endDate: string): Promise<UserAnalytics[]> {
    this.validateRequired({ startDate, endDate }, ['startDate', 'endDate']);

    try {
      const analytics = await this.executeQuery(
        async () => {
          const { data, error } = await supabase
            .from('user_analytics')
            .select('*')
            .gte('created_at', startDate)
            .lte('created_at', endDate)
            .order('created_at', { ascending: false });

          return { data, error };
        }
      );

      return analytics;
    } catch (error) {
      throw new ServiceError(
        'Failed to export analytics',
        'ANALYTICS_EXPORT_ERROR',
        500,
        error
      );
    }
  }

  /**
   * Initialize tracking
   */
  private initializeTracking(): void {
    // Track session start
    this.trackEvent('session_start', {
      session_id: this.getSessionId(),
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('visibility_change', {
        hidden: document.hidden,
        visibility_state: document.visibilityState
      });
    });

    // Track beforeunload
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_end', {
        session_duration: Date.now() - this.sessionStartTime,
        page_views: this.pageViewCount
      });
      
      // Flush remaining events
      this.flushEvents();
    });
  }

  /**
   * Start batch processing of events
   */
  private startBatchProcessing(): void {
    // Flush events every 30 seconds
    setInterval(() => {
      this.flushEvents();
    }, 30000);

    // Flush events when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flushEvents();
      }
    });
  }

  /**
   * Flush events to server
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await supabase.from('user_analytics').insert(
        events.map(event => ({
          event_type: event.event_type,
          event_data: event.event_data,
          session_id: event.session_id,
          created_at: event.timestamp
        }))
      );

      this.trackAnalytics('events_flushed', { count: events.length });
    } catch (error) {
      console.warn('Failed to flush analytics events:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Update performance metric
   */
  private updatePerformanceMetric(metric: string, value: number): void {
    if (!this.performanceMetrics.has(metric)) {
      this.performanceMetrics.set(metric, []);
    }
    
    const values = this.performanceMetrics.get(metric)!;
    values.push(value);
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
  }

  /**
   * Check if event is high priority
   */
  private isHighPriorityEvent(eventType: string): boolean {
    const highPriorityEvents = [
      'conversion',
      'error',
      'payment',
      'signup',
      'login'
    ];
    
    return highPriorityEvents.includes(eventType);
  }

  /**
   * Get session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('tutlabs_analytics_session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('tutlabs_analytics_session', sessionId);
    }
    return sessionId;
  }

  /**
   * Calculate user engagement score
   */
  private calculateUserEngagement(): number {
    const sessionDuration = Date.now() - this.sessionStartTime;
    const engagementScore = Math.min((this.pageViewCount * 10 + sessionDuration / 1000) / 100, 100);
    return Math.round(engagementScore);
  }

  /**
   * Get average session duration
   */
  private getAverageSessionDuration(): number {
    // This would typically come from server-side analytics
    return 0;
  }

  /**
   * Calculate bounce rate
   */
  private calculateBounceRate(): number {
    // This would typically come from server-side analytics
    return 0;
  }

  /**
   * Get flushed event count (for metrics calculation)
   */
  private getFlushedEventCount(): number {
    // This would track events that have been sent to server
    return 0;
  }

  /**
   * Get First Paint metric
   */
  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  /**
   * Get First Contentful Paint metric
   */
  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }

  /**
   * Get Largest Contentful Paint metric
   */
  private getLargestContentfulPaint(): number {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0;
  }

  /**
   * Get Cumulative Layout Shift metric
   */
  private getCumulativeLayoutShift(): number {
    let clsValue = 0;
    const clsEntries = performance.getEntriesByType('layout-shift');
    
    for (const entry of clsEntries) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
    
    return clsValue;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
