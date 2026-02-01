import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DEFAULT_CONFIG,
  DEFAULT_CSS_CLASSES,
  DEFAULT_API_URL,
  mergeConfig,
  getApiUrlFromScript,
} from '../src/config';

describe('DEFAULT_CONFIG', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_CONFIG.apiKey).toBe(null);
    expect(DEFAULT_CONFIG.apiUrl).toBe(null);
    expect(DEFAULT_CONFIG.debounce).toBe(800);
    expect(DEFAULT_CONFIG.showIndicator).toBe(true);
    expect(DEFAULT_CONFIG.autoAttach).toBe(true);
    expect(DEFAULT_CONFIG.validateOnBlur).toBe(true);
    expect(DEFAULT_CONFIG.validateOnChange).toBe(false);
  });

  it('should have correct default CSS classes', () => {
    expect(DEFAULT_CONFIG.cssClass).toEqual(DEFAULT_CSS_CLASSES);
    expect(DEFAULT_CSS_CLASSES.valid).toBe('cekemail-valid');
    expect(DEFAULT_CSS_CLASSES.invalid).toBe('cekemail-invalid');
    expect(DEFAULT_CSS_CLASSES.checking).toBe('cekemail-checking');
  });
});

describe('mergeConfig', () => {
  it('should return defaults when no user config provided', () => {
    const result = mergeConfig(DEFAULT_CONFIG);
    expect(result).toEqual(DEFAULT_CONFIG);
    expect(result).not.toBe(DEFAULT_CONFIG); // Should be a new object
  });

  it('should merge user config with defaults', () => {
    const userConfig = {
      apiKey: 'test-key',
      debounce: 500,
    };
    const result = mergeConfig(DEFAULT_CONFIG, userConfig);

    expect(result.apiKey).toBe('test-key');
    expect(result.debounce).toBe(500);
    expect(result.showIndicator).toBe(true); // Default preserved
    expect(result.cssClass).toEqual(DEFAULT_CSS_CLASSES); // Default preserved
  });

  it('should deep merge CSS classes', () => {
    const userConfig = {
      cssClass: {
        valid: 'custom-valid',
      },
    };
    const result = mergeConfig(DEFAULT_CONFIG, userConfig);

    expect(result.cssClass.valid).toBe('custom-valid');
    expect(result.cssClass.invalid).toBe('cekemail-invalid'); // Default preserved
    expect(result.cssClass.checking).toBe('cekemail-checking'); // Default preserved
  });
});

describe('getApiUrlFromScript', () => {
  beforeEach(() => {
    // Clear any existing scripts
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('should return default URL when no script found', () => {
    expect(getApiUrlFromScript()).toBe(DEFAULT_API_URL);
  });

  it('should extract URL from script src', () => {
    const script = document.createElement('script');
    script.src = 'https://example.com/widget/cekemail.v1.js';
    document.body.appendChild(script);

    expect(getApiUrlFromScript()).toBe('https://example.com/api/v1/widget/email-check');
  });

  it('should handle relative script URLs', () => {
    const script = document.createElement('script');
    script.src = '/widget/cekemail.js';
    document.body.appendChild(script);

    const result = getApiUrlFromScript();
    expect(result).toContain('/api/v1/widget/email-check');
  });
});
