import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  escapeHtml,
  sanitizeInput,
  sanitizeEmail,
  sanitizePhone,
  sanitizeText,
  sanitizeUrl,
  sanitizeFileName,
  RateLimiter,
  createCSPNonce,
} from '../../utils/sanitization';

describe('Sanitization Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(escapeHtml('Hello & World')).toBe('Hello &amp; World');
      expect(escapeHtml('Test = "value"')).toBe('Test &#x3D; &quot;value&quot;');
    });

    it('should handle non-string input', () => {
      expect(escapeHtml(null as any)).toBe('');
      expect(escapeHtml(undefined as any)).toBe('');
      expect(escapeHtml(123 as any)).toBe('');
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('javascript:alert("xss")')).toBe('alert("xss")');
      expect(sanitizeInput('onclick="alert(1)"')).toBe('"alert(1)"');
    });

    it('should trim whitespace and limit length', () => {
      expect(sanitizeInput('  hello world  ')).toBe('hello world');
      expect(sanitizeInput('a'.repeat(2000))).toHaveLength(1000);
    });

    it('should handle non-string input', () => {
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('should validate and sanitize valid emails', () => {
      expect(sanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
      expect(sanitizeEmail('user.name+tag@domain.co.uk')).toBe('user.name+tag@domain.co.uk');
    });

    it('should throw error for invalid emails', () => {
      expect(() => sanitizeEmail('invalid-email')).toThrow('Invalid email format');
      expect(() => sanitizeEmail('test@')).toThrow('Invalid email format');
      expect(() => sanitizeEmail('@domain.com')).toThrow('Invalid email format');
    });

    it('should handle non-string input', () => {
      expect(sanitizeEmail(null as any)).toBe('');
      expect(sanitizeEmail(undefined as any)).toBe('');
    });
  });

  describe('sanitizePhone', () => {
    it('should sanitize valid phone numbers', () => {
      expect(sanitizePhone('+1 (555) 123-4567')).toBe('+15551234567');
      expect(sanitizePhone('555-123-4567')).toBe('5551234567');
      expect(sanitizePhone('+44 20 7946 0958')).toBe('+442079460958');
    });

    it('should throw error for invalid phone lengths', () => {
      expect(() => sanitizePhone('123')).toThrow('Invalid phone number length');
      expect(() => sanitizePhone('12345678901234567890')).toThrow('Invalid phone number length');
    });

    it('should handle non-string input', () => {
      expect(sanitizePhone(null as any)).toBe('');
      expect(sanitizePhone(undefined as any)).toBe('');
    });
  });

  describe('sanitizeText', () => {
    it('should escape HTML and limit length', () => {
      expect(sanitizeText('<b>Hello</b> World')).toBe('&lt;b&gt;Hello&lt;&#x2F;b&gt; World');
      expect(sanitizeText('a'.repeat(10000))).toHaveLength(5000);
    });

    it('should handle non-string input', () => {
      expect(sanitizeText(null as any)).toBe('');
      expect(sanitizeText(undefined as any)).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it('should validate and return valid URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
      expect(sanitizeUrl('http://localhost:3000')).toBe('http://localhost:3000/');
    });

    it('should throw error for invalid URLs', () => {
      expect(() => sanitizeUrl('javascript:alert(1)')).toThrow('Invalid URL protocol');
      expect(() => sanitizeUrl('ftp://example.com')).toThrow('Invalid URL protocol');
      expect(() => sanitizeUrl('not-a-url')).toThrow('Invalid URL format');
    });

    it('should handle non-string input', () => {
      expect(sanitizeUrl(null as any)).toBe('');
      expect(sanitizeUrl(undefined as any)).toBe('');
    });
  });

  describe('sanitizeFileName', () => {
    it('should sanitize file names', () => {
      expect(sanitizeFileName('file name.txt')).toBe('file_name.txt');
      expect(sanitizeFileName('../../../etc/passwd')).toBe('etc_passwd');
      expect(sanitizeFileName('file..name.txt')).toBe('file.name.txt');
    });

    it('should limit file name length', () => {
      const longName = 'a'.repeat(300);
      expect(sanitizeFileName(longName)).toHaveLength(255);
    });

    it('should handle non-string input', () => {
      expect(sanitizeFileName(null as any)).toBe('');
      expect(sanitizeFileName(undefined as any)).toBe('');
    });
  });

  describe('RateLimiter', () => {
    it('should allow requests within limit', () => {
      const limiter = new RateLimiter(3, 60000);
      
      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user1')).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      const limiter = new RateLimiter(2, 60000);
      
      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user1')).toBe(false);
    });

    it('should reset user limits', () => {
      const limiter = new RateLimiter(1, 60000);
      
      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user1')).toBe(false);
      
      limiter.reset('user1');
      expect(limiter.isAllowed('user1')).toBe(true);
    });

    it('should handle different users independently', () => {
      const limiter = new RateLimiter(1, 60000);
      
      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user2')).toBe(true);
      expect(limiter.isAllowed('user1')).toBe(false);
      expect(limiter.isAllowed('user2')).toBe(false);
    });
  });

  describe('createCSPNonce', () => {
    it('should generate a valid nonce', () => {
      const nonce = createCSPNonce();
      expect(nonce).toMatch(/^[0-9a-f]{32}$/);
    });

    it('should generate unique nonces', () => {
      const nonce1 = createCSPNonce();
      const nonce2 = createCSPNonce();
      expect(nonce1).not.toBe(nonce2);
    });
  });
});

