/**
 * Secure API Service
 * Handles all API calls through secure server endpoints
 * Never exposes API keys to the client
 */

class SecureApiService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    this.requestQueue = new Map();
    this.rateLimiter = new Map();
  }

  /**
   * Rate limiting to prevent API abuse
   */
  async checkRateLimit(endpoint, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const key = `${endpoint}_${Math.floor(now / windowMs)}`;
    
    if (!this.rateLimiter.has(key)) {
      this.rateLimiter.set(key, 0);
    }
    
    const currentCount = this.rateLimiter.get(key);
    if (currentCount >= maxRequests) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    this.rateLimiter.set(key, currentCount + 1);
    
    // Clean up old entries
    for (const [limitKey] of this.rateLimiter) {
      const keyTime = parseInt(limitKey.split('_')[1]);
      if (now - keyTime > windowMs) {
        this.rateLimiter.delete(limitKey);
      }
    }
  }

  /**
   * Secure OpenAI API call through server proxy
   */
  async callOpenAI(messages, options = {}) {
    await this.checkRateLimit('openai', 5, 60000); // 5 requests per minute
    
    try {
      const response = await fetch(`${this.baseUrl}/openai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          messages,
          model: options.model || 'gpt-3.5-turbo',
          max_tokens: options.maxTokens || 500,
          temperature: options.temperature || 0.7,
          userId: await this.getCurrentUserId()
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Secure OpenAI API call failed:', error);
      throw error;
    }
  }

  /**
   * Get authentication token for API calls
   */
  async getAuthToken() {
    // In a real implementation, this would get the Firebase ID token
    try {
      const { auth } = await import('../firebase.js');
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken();
      }
    } catch (error) {
      console.warn('Auth not available:', error);
    }
    return null;
  }

  /**
   * Get current user ID for logging and rate limiting
   */
  async getCurrentUserId() {
    try {
      const { auth } = await import('../firebase.js');
      return auth.currentUser?.uid || 'anonymous';
    } catch (error) {
      return 'anonymous';
    }
  }

  /**
   * Secure file upload through server proxy
   */
  async uploadFile(file, metadata = {}) {
    await this.checkRateLimit('upload', 3, 60000); // 3 uploads per minute
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify({
      ...metadata,
      userId: await this.getCurrentUserId(),
      timestamp: new Date().toISOString()
    }));

    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Secure file upload failed:', error);
      throw error;
    }
  }

  /**
   * Log security events
   */
  async logSecurityEvent(event, details = {}) {
    try {
      await fetch(`${this.baseUrl}/security/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          event,
          details,
          userId: await this.getCurrentUserId(),
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (error) {
      console.warn('Security logging failed:', error);
    }
  }
}

export const secureApiService = new SecureApiService();
export default secureApiService;