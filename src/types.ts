/**
 * Configuration options for the CekEmail widget
 */
export interface CekEmailConfig {
  /** Widget API key (required) */
  apiKey: string | null;
  /** API endpoint URL */
  apiUrl: string | null;
  /** Debounce delay in milliseconds before validation */
  debounce: number;
  /** Whether to show visual indicators */
  showIndicator: boolean;
  /** Whether to auto-attach to email inputs */
  autoAttach: boolean;
  /** Whether to validate on blur */
  validateOnBlur: boolean;
  /** Whether to validate on input change */
  validateOnChange: boolean;
  /** CSS class names for styling */
  cssClass: CekEmailCssClasses;
}

/**
 * CSS class names used by the widget
 */
export interface CekEmailCssClasses {
  /** Class for valid emails */
  valid: string;
  /** Class for invalid emails */
  invalid: string;
  /** Class while checking */
  checking: string;
  /** Class for wrapper element */
  wrapper: string;
  /** Class for indicator element */
  indicator: string;
}

/**
 * Internal state of the widget
 */
export interface CekEmailState {
  /** Whether the widget has been initialized */
  initialized: boolean;
  /** Debounce timers per input */
  timers: Map<HTMLInputElement, ReturnType<typeof setTimeout>>;
  /** Cache of validation results */
  cache: Map<string, ValidationResult>;
  /** Set of inputs already attached */
  observedInputs: Set<HTMLInputElement>;
}

/**
 * Result from the email validation API
 */
export interface ValidationResult {
  /** Whether the email format is valid */
  is_valid: boolean;
  /** Whether the email address is reachable */
  is_reachable: boolean;
  /** Whether the email is from a disposable provider */
  is_disposable_email: boolean;
  /** Reason for the validation result */
  reason?: string;
}

/**
 * API response structure
 */
export interface ApiResponse {
  data?: ValidationResult;
  message?: string;
}

/**
 * Validation state for an input
 */
export type ValidationState = 'valid' | 'invalid' | 'checking';

/**
 * Custom event detail for cekemail:validated
 */
export interface ValidatedEventDetail {
  input: HTMLInputElement;
  result: ValidationResult;
  isValid: boolean;
}

/**
 * Extended HTMLInputElement with widget properties
 */
export interface CekEmailInput extends HTMLInputElement {
  __cekemailIndicator?: HTMLSpanElement;
}

/**
 * Global window extensions for legacy config
 */
declare global {
  interface Window {
    CekEmail_APIKEY?: string;
    CekEmail_API_URL?: string;
    CekEmail?: CekEmailInstance;
  }
}

/**
 * Public interface of the CekEmail instance
 */
export interface CekEmailInstance {
  config: CekEmailConfig;
  state: CekEmailState;
  init(config?: Partial<CekEmailConfig>): void;
  validate(inputOrEmail: HTMLInputElement | string): Promise<ValidationResult | void>;
  validateEmailDirectly(email: string): Promise<ValidationResult>;
  attachToInput(input: HTMLInputElement): void;
  clearValidationState(input: HTMLInputElement): void;
}
