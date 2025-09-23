/**
 * Error Monitoring and Analytics Service
 * Handles error tracking, performance monitoring, and security event logging
 */

import { secureApiService } from './secureApi';

class MonitoringService {
  constructor() {
    this.errorQueue = [];
    this.performanceQueue = [];
    this.securityQueue = [];
    this.batchSize = 10;
    this.flushInterval = 30000; // 30 seconds
    
    // Initialize error handling
    this.setupGlobalErrorHandling();
    this.setupPerformanceMonitoring();
    
    // Start batch processing
    setInterval(() => this.flushQueues(), this.flushInterval);
  }

  /**
   * Set up global error handling
   */
  setupGlobalErrorHandling() {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'unhandled_rejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    });

    // Handle React errors (if using error boundary)
    this.setupReactErrorBoundary();
  }

  /**
   * Set up performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor page load performance
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          if (perfData) {
            this.logPerformance({
              type: 'page_load',
              domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
              loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
              totalTime: perfData.loadEventEnd - perfData.fetchStart,
              url: window.location.href,
              timestamp: new Date().toISOString()
            });
          }
        }, 0);
      });
    }

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        this.logPerformance({
          type: 'memory_usage',
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          timestamp: new Date().toISOString()
        });
      }, 60000); // Every minute
    }
  }

  /**
   * Set up React error boundary monitoring
   */
  setupReactErrorBoundary() {
    // This would typically be used in a React Error Boundary component
    this.logReactError = (error, errorInfo) => {
      this.logError({
        type: 'react_error',
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    };
  }

  /**
   * Log application errors
   */
  logError(errorData) {
    const enrichedError = {
      ...errorData,
      sessionId: this.getSessionId(),
      userId: this.getCurrentUserId(),
      severity: this.determineSeverity(errorData),
      fingerprint: this.generateFingerprint(errorData)
    };

    this.errorQueue.push(enrichedError);
    
    // Flush immediately for critical errors
    if (enrichedError.severity === 'critical') {
      this.flushErrorQueue();
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Monitoring Service - Error:', enrichedError);
    }
  }

  /**
   * Log performance metrics
   */
  logPerformance(perfData) {
    const enrichedPerf = {
      ...perfData,
      sessionId: this.getSessionId(),
      userId: this.getCurrentUserId(),
      browserInfo: this.getBrowserInfo()
    };

    this.performanceQueue.push(enrichedPerf);
  }

  /**
   * Log security events
   */
  logSecurityEvent(eventType, eventData) {
    const securityEvent = {
      type: eventType,
      data: eventData,
      sessionId: this.getSessionId(),
      userId: this.getCurrentUserId(),
      ip: this.getClientIP(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      severity: this.determineSecuritySeverity(eventType)
    };

    this.securityQueue.push(securityEvent);

    // Flush immediately for high-severity security events
    if (securityEvent.severity === 'high') {
      this.flushSecurityQueue();
    }
  }

  /**
   * Determine error severity
   */
  determineSeverity(errorData) {
    const criticalPatterns = [
      /network.*error/i,
      /security.*violation/i,
      /authentication.*failed/i,
      /unauthorized/i
    ];

    const highPatterns = [
      /chunk.*load.*error/i,
      /script.*error/i,
      /firebase.*error/i
    ];

    const message = errorData.message || '';
    
    if (criticalPatterns.some(pattern => pattern.test(message))) {
      return 'critical';
    } else if (highPatterns.some(pattern => pattern.test(message))) {
      return 'high';
    } else if (errorData.type === 'unhandled_rejection') {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Determine security event severity
   */
  determineSecuritySeverity(eventType) {
    const highSeverityEvents = [
      'login_failed',
      'unauthorized_access',
      'suspicious_activity',
      'rate_limit_exceeded'
    ];

    const mediumSeverityEvents = [
      'password_reset_requested',
      'profile_updated',
      'file_upload_rejected'
    ];

    if (highSeverityEvents.includes(eventType)) {
      return 'high';
    } else if (mediumSeverityEvents.includes(eventType)) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generate error fingerprint for deduplication
   */
  generateFingerprint(errorData) {
    const key = `${errorData.type}_${errorData.message}_${errorData.filename}_${errorData.lineno}`;
    return this.hash(key);
  }

  /**
   * Simple hash function
   */
  hash(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Get session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('monitoring_session_id');
    if (!sessionId) {
      sessionId = this.generateUniqueId();
      sessionStorage.setItem('monitoring_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId() {
    try {
      // This would integrate with your auth service
      return window.authService?.getCurrentUser()?.uid || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  /**
   * Get client IP (best effort)
   */
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get browser information
   */
  getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  /**
   * Generate unique ID
   */
  generateUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Flush all queues
   */
  async flushQueues() {
    await Promise.all([
      this.flushErrorQueue(),
      this.flushPerformanceQueue(),
      this.flushSecurityQueue()
    ]);
  }

  /**
   * Flush error queue
   */
  async flushErrorQueue() {
    if (this.errorQueue.length === 0) return;

    const errors = this.errorQueue.splice(0, this.batchSize);
    
    try {
      await secureApiService.logErrors(errors);
    } catch (error) {
      console.error('Failed to flush error queue:', error);
      // Put errors back in queue for retry
      this.errorQueue.unshift(...errors);
    }
  }

  /**
   * Flush performance queue
   */
  async flushPerformanceQueue() {
    if (this.performanceQueue.length === 0) return;

    const perfData = this.performanceQueue.splice(0, this.batchSize);
    
    try {
      await secureApiService.logPerformance(perfData);
    } catch (error) {
      console.error('Failed to flush performance queue:', error);
    }
  }

  /**
   * Flush security queue
   */
  async flushSecurityQueue() {
    if (this.securityQueue.length === 0) return;

    const securityEvents = this.securityQueue.splice(0, this.batchSize);
    
    try {
      await secureApiService.logSecurityEvents(securityEvents);
    } catch (error) {
      console.error('Failed to flush security queue:', error);
      // Put high-severity events back in queue for retry
      const highSeverityEvents = securityEvents.filter(event => event.severity === 'high');
      this.securityQueue.unshift(...highSeverityEvents);
    }
  }

  /**
   * Manually track custom events
   */
  trackEvent(eventName, eventData = {}) {
    this.logPerformance({
      type: 'custom_event',
      event: eventName,
      data: eventData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track user interactions
   */
  trackUserInteraction(action, element, data = {}) {
    this.trackEvent('user_interaction', {
      action,
      element,
      ...data
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature, action, data = {}) {
    this.trackEvent('feature_usage', {
      feature,
      action,
      ...data
    });
  }
}

export const monitoringService = new MonitoringService();
export default monitoringService;