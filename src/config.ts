import type { CekEmailConfig, CekEmailCssClasses } from './types';

/**
 * Default CSS class names
 */
export const DEFAULT_CSS_CLASSES: CekEmailCssClasses = {
  valid: 'cekemail-valid',
  invalid: 'cekemail-invalid',
  checking: 'cekemail-checking',
  wrapper: 'cekemail-wrapper',
  indicator: 'cekemail-indicator',
  suggestion: 'cekemail-suggestion',
};

/**
 * Default API URL
 */
export const DEFAULT_API_URL = 'https://api.cekemail.com/v1/widget/email-check';

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: CekEmailConfig = {
  apiKey: null,
  apiUrl: null,
  debounce: 800,
  showIndicator: true,
  showSuggestion: true,
  autoAttach: true,
  validateOnBlur: true,
  validateOnChange: false,
  cssClass: { ...DEFAULT_CSS_CLASSES },
  locale: 'en',
  messages: null,
};

/**
 * Merge user config with defaults
 */
export function mergeConfig(
  defaults: CekEmailConfig,
  userConfig?: Partial<CekEmailConfig>
): CekEmailConfig {
  if (!userConfig) return { ...defaults };

  return {
    ...defaults,
    ...userConfig,
    cssClass: {
      ...defaults.cssClass,
      ...(userConfig.cssClass || {}),
    },
  };
}

/**
 * Get API URL from script source or use default
 */
export function getApiUrlFromScript(): string {
  if (typeof document === 'undefined') return DEFAULT_API_URL;

  const script = document.querySelector('script[src*="cekemail"]');
  if (!script) return DEFAULT_API_URL;

  try {
    const src = script.getAttribute('src');
    if (!src) return DEFAULT_API_URL;

    const url = new URL(src, window.location.href);
    return `${url.protocol}//${url.host}/api/v1/widget/email-check`;
  } catch {
    return DEFAULT_API_URL;
  }
}
