import { useState, useCallback } from 'react';
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '../utils/sanitization';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormErrors {
  [key: string]: string | null;
}

export interface UseFormValidationReturn {
  errors: FormErrors;
  validateField: (field: string, value: string) => string | null;
  validateForm: (data: Record<string, string>) => boolean;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  setError: (field: string, message: string) => void;
}

export const useFormValidation = (rules: ValidationRules): UseFormValidationReturn => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = useCallback((field: string, value: string): string | null => {
    const rule = rules[field];
    if (!rule) return null;

    // Sanitize input first
    let sanitizedValue = value;
    try {
      if (field === 'email') {
        sanitizedValue = sanitizeEmail(value);
      } else if (field === 'phone') {
        sanitizedValue = sanitizePhone(value);
      } else {
        sanitizedValue = sanitizeInput(value);
      }
    } catch (error) {
      return error instanceof Error ? error.message : 'Invalid input format';
    }

    // Required validation
    if (rule.required && (!sanitizedValue || sanitizedValue.trim() === '')) {
      return rule.message || `${field} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!sanitizedValue || sanitizedValue.trim() === '') return null;

    // Min length validation
    if (rule.minLength && sanitizedValue.length < rule.minLength) {
      return rule.message || `${field} must be at least ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
      return rule.message || `${field} must be no more than ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
      return rule.message || `${field} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(sanitizedValue);
    }

    return null;
  }, [rules]);

  const validateForm = useCallback((data: Record<string, string>): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const error = validateField(field, data[field] || '');
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  const clearError = useCallback((field: string) => {
    setErrors(prev => ({ ...prev, [field]: null }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
    setError,
  };
};

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  name: /^[a-zA-Z\s]{2,50}$/,
};

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    pattern: validationPatterns.email,
    message: 'Please enter a valid email address',
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password must be at least 6 characters',
  },
  name: {
    required: true,
    pattern: validationPatterns.name,
    minLength: 2,
    maxLength: 50,
    message: 'Name must be 2-50 characters and contain only letters',
  },
  phone: {
    required: true,
    pattern: validationPatterns.phone,
    message: 'Please enter a valid phone number with country code',
  },
};