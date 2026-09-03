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
  /** Locale for built-in messages ('en' or 'id'); unknown locales fall back to English */
  locale: string;
  /** Custom messages: a partial map keyed by reason code, or a function that returns the text */
  messages: Partial<CekEmailMessages> | MessageResolver | null;
}

/**
 * Stable reason codes returned by the API as `reason_code`
 */
export type ReasonCode =
  | 'invalid_format'
  | 'no_mx_records'
  | 'mailbox_exists'
  | 'mailbox_not_found'
  | 'mailbox_full'
  | 'mailbox_not_allowed'
  | 'disposable'
  | 'catch_all'
  | 'greylisted'
  | 'smtp_unreachable'
  | 'server_temporarily_unavailable'
  | 'sender_blocked'
  | 'policy_rejected'
  | 'unknown';

/**
 * Keys of the message table: every reason code plus the widget's own states
 */
export type MessageKey = ReasonCode | 'checking' | 'valid' | 'invalid';

/**
 * Message table used for tooltips and the data-cekemail-message attribute
 */
export type CekEmailMessages = Record<MessageKey, string>;

/**
 * Function form of custom messages. Return a falsy value to fall back to the defaults.
 */
export type MessageResolver = (result: ValidationResult, isValid: boolean) => string | null | undefined;

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
  /** Verification status (valid, invalid, disposable, catch_all, greylisted, unknown) */
  status?: string;
  /** Reason for the validation result (free text, English) */
  reason?: string;
  /** Stable code for the reason; prefer this over `reason` for custom messages */
  reason_code?: ReasonCode | string;
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
    CekEmail_LOCALE?: string;
    CekEmail_MESSAGES?: Partial<CekEmailMessages>;
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
