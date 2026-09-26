/**
 * @cekemail/widget
 *
 * Email validation widget for CekEmail.
 * Validates email addresses in real-time on your website.
 *
 * @example CDN Usage
 * ```html
 * <script>
 *   CekEmail_APIKEY = 'wk_xxxxxxxxxxxxx';
 * </script>
 * <script src="https://cdn.jsdelivr.net/npm/@cekemail/widget"></script>
 * ```
 *
 * @example NPM Usage
 * ```typescript
 * import { CekEmail } from '@cekemail/widget';
 *
 * const widget = new CekEmail();
 * widget.init({ apiKey: 'wk_xxxxxxxxxxxxx' });
 * ```
 */

export { CekEmail } from './cekemail';
export type {
  CekEmailConfig,
  CekEmailCssClasses,
  CekEmailMessages,
  CekEmailState,
  MessageKey,
  MessageResolver,
  ReasonCode,
  ValidationResult,
  ValidatedEventDetail,
  CekEmailInstance,
} from './types';
export { isValidEmailFormat, normalizeEmail } from './validator';
export { ApiClient, ApiError } from './api';
export type { ApiKeyGetter } from './api';
export { DEFAULT_CONFIG, DEFAULT_API_URL, mergeConfig } from './config';
export { BUILT_IN_MESSAGES, DEFAULT_LOCALE, resolveMessages, messageForResult, formatMessage } from './messages';

// Browser auto-initialization
import { CekEmail } from './cekemail';

if (typeof window !== 'undefined') {
  // Create singleton instance
  const instance = new CekEmail();

  // Expose globally
  (window as Window & { CekEmail?: CekEmail }).CekEmail = instance;

  // Auto-initialize when DOM is ready
  const autoInit = () => {
    // Only auto-init if API key is set via global
    if (window.CekEmail_APIKEY) {
      instance.init();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
}
