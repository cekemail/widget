import type {
  CekEmailConfig,
  CekEmailMessages,
  CekEmailState,
  CekEmailInput,
  ValidationResult,
  ValidatedEventDetail,
} from './types';
import {
  DEFAULT_CONFIG,
  mergeConfig,
  DEFAULT_API_URL,
} from './config';
import { injectStyles } from './styles';
import { resolveMessages, messageForResult, formatMessage } from './messages';
import { isValidEmailFormat, normalizeEmail } from './validator';
import { ApiClient, ApiError } from './api';
import {
  wrapInputWithIndicator,
  setValidationState,
  clearValidationState,
  setSuggestion,
  clearSuggestion,
  findEmailInputs,
  isEmailInput,
  isDisabled,
} from './dom';

/**
 * CekEmail Widget
 *
 * Automatically validates email addresses on your website in real-time.
 */
export class CekEmail {
  public config: CekEmailConfig;
  public state: CekEmailState;
  public messages: CekEmailMessages;
  private apiClient: ApiClient | null = null;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.messages = resolveMessages(DEFAULT_CONFIG.locale, null);
    this.state = {
      initialized: false,
      timers: new Map(),
      cache: new Map(),
      observedInputs: new Set(),
    };
  }

  /**
   * Initialize the widget
   */
  init(userConfig?: Partial<CekEmailConfig>): void {
    if (this.state.initialized) return;

    // Check for legacy global config
    if (typeof window !== 'undefined') {
      if (window.CekEmail_APIKEY && !userConfig?.apiKey && !this.config.apiKey) {
        userConfig = {
          ...userConfig,
          apiKey: window.CekEmail_APIKEY,
        };
      }
      if (window.CekEmail_API_URL && !userConfig?.apiUrl) {
        userConfig = {
          ...userConfig,
          apiUrl: window.CekEmail_API_URL,
        };
      }
      if (window.CekEmail_LOCALE && !userConfig?.locale) {
        userConfig = {
          ...userConfig,
          locale: window.CekEmail_LOCALE,
        };
      }
      if (window.CekEmail_MESSAGES && !userConfig?.messages) {
        userConfig = {
          ...userConfig,
          messages: window.CekEmail_MESSAGES,
        };
      }
    }

    this.config = mergeConfig(this.config, userConfig);
    this.messages = resolveMessages(this.config.locale, this.config.messages);

    // Set default API URL if not provided
    if (!this.config.apiUrl) {
      this.config.apiUrl = DEFAULT_API_URL;
    }

    if (!this.config.apiKey) {
      console.error('[CekEmail] API key not found. Set window.CekEmail_APIKEY or pass apiKey in config');
      return;
    }

    // Initialize API client
    this.apiClient = new ApiClient(
      this.config.apiUrl,
      () => this.config.apiKey ?? (typeof window !== 'undefined' ? window.CekEmail_APIKEY : null)
    );

    // Inject styles
    injectStyles();

    // Auto-attach to existing inputs
    if (this.config.autoAttach) {
      this.attachToExistingInputs();
      this.observeNewInputs();
    }

    this.state.initialized = true;
    console.log('[CekEmail] Widget initialized');
  }

  /**
   * Replace the API key used for subsequent requests.
   *
   * Before init() it becomes the key init() uses; afterwards it takes effect
   * on the next validation without re-attaching to any input.
   */
  setApiKey(key: string): void {
    this.config.apiKey = key;
  }

  /**
   * Attach to all existing email inputs
   */
  private attachToExistingInputs(): void {
    const inputs = findEmailInputs();
    inputs.forEach((input) => this.attachToInput(input));
  }

  /**
   * Observe for dynamically added email inputs
   */
  private observeNewInputs(): void {
    if (typeof MutationObserver === 'undefined') return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;

          const element = node as Element;

          if (isEmailInput(element)) {
            this.attachToInput(element);
          }

          const inputs = findEmailInputs(element);
          inputs.forEach((input) => this.attachToInput(input));
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Attach the widget to a single input
   */
  attachToInput(input: HTMLInputElement): void {
    if (this.state.observedInputs.has(input)) return;
    if (isDisabled(input)) return;

    this.state.observedInputs.add(input);

    if (this.config.showIndicator) {
      wrapInputWithIndicator(input as CekEmailInput, this.config.cssClass);
    }

    if (this.config.validateOnBlur) {
      input.addEventListener('blur', () => this.handleInputEvent(input));
    }

    if (this.config.validateOnChange) {
      input.addEventListener('input', () => this.handleInputEvent(input));
    }

    input.setAttribute('data-cekemail-attached', 'true');
  }

  /**
   * Handle input blur/change events
   */
  private handleInputEvent(input: HTMLInputElement): void {
    const email = input.value.trim();

    if (!email) {
      this.clearValidationState(input);
      return;
    }

    if (!isValidEmailFormat(email)) {
      setValidationState(
        input as CekEmailInput,
        'invalid',
        this.config.cssClass,
        this.messages.invalid_format
      );
      return;
    }

    this.debouncedValidate(input, email);
  }

  /**
   * Debounced validation
   */
  private debouncedValidate(input: HTMLInputElement, email: string): void {
    const existingTimer = this.state.timers.get(input);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    setValidationState(input as CekEmailInput, 'checking', this.config.cssClass, this.messages.checking);

    const timer = setTimeout(() => {
      this.validateEmailForInput(input, email);
      this.state.timers.delete(input);
    }, this.config.debounce);

    this.state.timers.set(input, timer);
  }

  /**
   * Validate email and update input state
   */
  private async validateEmailForInput(
    input: HTMLInputElement,
    email: string
  ): Promise<void> {
    const cacheKey = normalizeEmail(email);

    // Check cache
    if (this.state.cache.has(cacheKey)) {
      const cached = this.state.cache.get(cacheKey)!;
      this.applyValidationResult(input, cached);
      return;
    }

    try {
      if (!this.apiClient) {
        throw new Error('API client not initialized');
      }

      const result = await this.apiClient.validateEmail(email);
      this.state.cache.set(cacheKey, result);
      this.applyValidationResult(input, result);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 401 || error.statusCode === 403) {
          console.error('[CekEmail] Authorization error:', error.serverMessage);
        } else if (error.statusCode === 429) {
          console.warn('[CekEmail] Rate limit exceeded');
        } else {
          console.error('[CekEmail] Validation error:', error.message);
        }
      } else {
        console.error('[CekEmail] Validation error:', error);
      }
      this.clearValidationState(input);
    }
  }

  /**
   * Apply validation result to input
   */
  private applyValidationResult(
    input: HTMLInputElement,
    result: ValidationResult
  ): void {
    const isValid = result.is_valid && result.is_reachable && !result.is_disposable_email;
    const state = isValid ? 'valid' : 'invalid';
    const resolver = typeof this.config.messages === 'function' ? this.config.messages : null;
    const message = messageForResult(result, isValid, this.messages, resolver, this.config.locale);

    setValidationState(input as CekEmailInput, state, this.config.cssClass, message);
    this.renderSuggestion(input as CekEmailInput, result);

    // Dispatch custom event
    const eventDetail: ValidatedEventDetail = { input, result, isValid };
    const event = new CustomEvent('cekemail:validated', {
      detail: eventDetail,
      bubbles: true,
    });
    input.dispatchEvent(event);
  }

  /**
   * Render the "did you mean" hint when the API suggests a correction
   */
  private renderSuggestion(input: CekEmailInput, result: ValidationResult): void {
    if (!this.config.showSuggestion) return;

    const suggestion = typeof result.suggestion === 'string' ? result.suggestion.trim() : '';
    if (!suggestion || suggestion === input.value.trim()) return;

    const text = formatMessage(this.messages.did_you_mean, { suggestion });

    setSuggestion(input, suggestion, text, this.config.cssClass, (value) =>
      this.applySuggestion(input, value)
    );
  }

  /**
   * Apply a suggested address to the input and validate it again
   */
  private applySuggestion(input: CekEmailInput, suggestion: string): void {
    input.value = suggestion;
    clearSuggestion(input);
    input.dispatchEvent(new Event('input', { bubbles: true }));

    if (!this.config.validateOnChange) {
      this.handleInputEvent(input);
    }
  }

  /**
   * Clear validation state from an input
   */
  clearValidationState(input: HTMLInputElement): void {
    clearValidationState(input as CekEmailInput, this.config.cssClass);
  }

  /**
   * Validate an input element or email string
   */
  validate(inputOrEmail: HTMLInputElement | string): Promise<ValidationResult | void> {
    if (typeof inputOrEmail === 'string') {
      return this.validateEmailDirectly(inputOrEmail);
    } else {
      this.handleInputEvent(inputOrEmail);
      return Promise.resolve();
    }
  }

  /**
   * Validate an email string directly (programmatic API)
   */
  async validateEmailDirectly(email: string): Promise<ValidationResult> {
    const cacheKey = normalizeEmail(email);

    // Check cache
    if (this.state.cache.has(cacheKey)) {
      return this.state.cache.get(cacheKey)!;
    }

    if (!this.apiClient) {
      throw new Error('CekEmail not initialized. Call init() first.');
    }

    const result = await this.apiClient.validateEmail(email);
    this.state.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Clear the validation cache
   */
  clearCache(): void {
    this.state.cache.clear();
  }

  /**
   * Get current cache size
   */
  getCacheSize(): number {
    return this.state.cache.size;
  }
}
