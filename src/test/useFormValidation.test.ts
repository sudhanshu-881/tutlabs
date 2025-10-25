import { renderHook, act } from '@testing-library/react';
import { useFormValidation, commonRules } from '../../hooks/useFormValidation';
import { vi } from 'vitest';

describe('useFormValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate required fields', () => {
    const { result } = renderHook(() => useFormValidation({
      email: commonRules.email,
      password: commonRules.password,
    }));

    act(() => {
      const isValid = result.current.validateForm({ email: '', password: '' });
      expect(isValid).toBe(false);
    });
    
    expect(result.current.errors.email).toBe('Please enter a valid email address');
    expect(result.current.errors.password).toBe('Password must be at least 6 characters');
  });

  it('should validate email format', () => {
    const { result } = renderHook(() => useFormValidation({
      email: commonRules.email,
    }));

    let error: string | null;
    
    act(() => {
      error = result.current.validateField('email', 'invalid-email');
    });
    expect(error).toBe('Please enter a valid email address');

    act(() => {
      error = result.current.validateField('email', 'valid@example.com');
    });
    expect(error).toBeNull();
  });

  it('should validate password strength', () => {
    const { result } = renderHook(() => useFormValidation({
      password: {
        ...commonRules.password,
        custom: (value: string) => {
          if (value.length < 6) return 'Password must be at least 6 characters';
          if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
          if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
          if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
          return null;
        },
      },
    }));

    act(() => {
      const error = result.current.validateField('password', 'weak');
      expect(error).toBe('Password must be at least 6 characters');
    });

    act(() => {
      const error = result.current.validateField('password', 'StrongPass123');
      expect(error).toBeNull();
    });
  });

  it('should clear errors', () => {
    const { result } = renderHook(() => useFormValidation({
      email: commonRules.email,
    }));

    act(() => {
      result.current.validateForm({ email: 'invalid-email' });
    });
    expect(result.current.errors.email).toBe('Please enter a valid email address');

    act(() => {
      result.current.clearError('email');
    });
    expect(result.current.errors.email).toBeNull();

    act(() => {
      result.current.clearAllErrors();
    });
    expect(result.current.errors).toEqual({});
  });

  it('should handle sanitization errors', () => {
    const { result } = renderHook(() => useFormValidation({
      email: commonRules.email,
    }));

    act(() => {
      const error = result.current.validateField('email', '<script>alert("xss")</script>');
      expect(error).toBe('Invalid input format');
    });
  });

  it('should validate phone numbers', () => {
    const { result } = renderHook(() => useFormValidation({
      phone: commonRules.phone,
    }));

    act(() => {
      const error = result.current.validateField('phone', 'invalid-phone');
      expect(error).toBe('Please enter a valid phone number with country code');
    });

    act(() => {
      const error = result.current.validateField('phone', '+1234567890');
      expect(error).toBeNull();
    });
  });

  it('should validate names', () => {
    const { result } = renderHook(() => useFormValidation({
      name: commonRules.name,
    }));

    act(() => {
      const error = result.current.validateField('name', 'A');
      expect(error).toBe('Name must be 2-50 characters and contain only letters');
    });

    act(() => {
      const error = result.current.validateField('name', 'John Doe');
      expect(error).toBeNull();
    });
  });

  it('should handle setError functionality', () => {
    const { result } = renderHook(() => useFormValidation({
      email: commonRules.email,
    }));

    act(() => {
      result.current.setError('email', 'Custom error message');
    });
    expect(result.current.errors.email).toBe('Custom error message');
  });

  it('should handle empty form data gracefully', () => {
    const { result } = renderHook(() => useFormValidation({
      email: commonRules.email,
      password: commonRules.password,
    }));

    act(() => {
      const isValid = result.current.validateForm({});
      expect(isValid).toBe(false);
    });

    expect(result.current.errors.email).toBe('Please enter a valid email address');
    expect(result.current.errors.password).toBe('Password must be at least 6 characters');
  });
});