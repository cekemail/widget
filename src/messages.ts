import type { CekEmailMessages, MessageResolver, ValidationResult } from './types';

/**
 * Default locale
 */
export const DEFAULT_LOCALE = 'en';

/**
 * Messages bundled with the widget. Any locale not listed here falls back to
 * English; pass `messages` in the config to add or override strings.
 */
export const BUILT_IN_MESSAGES: Record<string, CekEmailMessages> = {
  en: {
    checking: 'Checking…',
    valid: 'Email is valid',
    invalid: 'Email is invalid',
    did_you_mean: 'Did you mean :suggestion?',
    invalid_format: 'Invalid email format',
    no_mx_records: 'This domain cannot receive email',
    mailbox_exists: 'Email is valid',
    mailbox_not_found: 'This mailbox does not exist',
    mailbox_full: 'This mailbox is full',
    mailbox_not_allowed: 'This address is not accepted by the mail server',
    disposable: 'Disposable email addresses are not accepted',
    catch_all: 'This domain accepts any address, so it cannot be fully verified',
    greylisted: 'The mail server asked us to try again later',
    smtp_unreachable: 'Could not reach the mail server',
    server_temporarily_unavailable: 'The mail server is temporarily unavailable',
    sender_blocked: 'The mail server refused the verification',
    policy_rejected: 'The mail server rejected this address',
    unknown: 'Could not verify this address',
  },
  id: {
    checking: 'Memeriksa…',
    valid: 'Email valid',
    invalid: 'Email tidak valid',
    did_you_mean: 'Mungkin maksud Anda :suggestion?',
    invalid_format: 'Format email tidak valid',
    no_mx_records: 'Domain ini tidak dapat menerima email',
    mailbox_exists: 'Email valid',
    mailbox_not_found: 'Kotak surat ini tidak ada',
    mailbox_full: 'Kotak surat ini penuh',
    mailbox_not_allowed: 'Alamat ini tidak diterima oleh mail server',
    disposable: 'Email sekali pakai tidak diterima',
    catch_all: 'Domain ini menerima alamat apa pun, sehingga tidak bisa diverifikasi sepenuhnya',
    greylisted: 'Mail server meminta kami mencoba lagi nanti',
    smtp_unreachable: 'Tidak dapat menghubungi mail server',
    server_temporarily_unavailable: 'Mail server sedang tidak tersedia',
    sender_blocked: 'Mail server menolak verifikasi',
    policy_rejected: 'Mail server menolak alamat ini',
    unknown: 'Alamat ini tidak dapat diverifikasi',
  },
};

/**
 * Build the message table for a locale, layering custom strings on top of the
 * bundled ones (and English underneath, so partial locales never leave gaps).
 */
export function resolveMessages(
  locale: string | null | undefined,
  custom?: Partial<CekEmailMessages> | MessageResolver | null
): CekEmailMessages {
  const base = BUILT_IN_MESSAGES[locale || DEFAULT_LOCALE] || BUILT_IN_MESSAGES[DEFAULT_LOCALE];
  const overrides = custom && typeof custom === 'object' ? custom : {};

  return { ...BUILT_IN_MESSAGES[DEFAULT_LOCALE], ...base, ...overrides };
}

/**
 * Replace `:name` style placeholders in a message with the given params.
 */
export function formatMessage(message: string, params: Record<string, string>): string {
  return message.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (placeholder, name: string) =>
    name in params ? params[name] : placeholder
  );
}

/**
 * Pick the message to show for a validation result.
 *
 * Order: resolver function → message for `reason_code` → raw API `reason`
 * (English only, for older backends without a code) → generic valid/invalid.
 */
export function messageForResult(
  result: ValidationResult,
  isValid: boolean,
  messages: CekEmailMessages,
  resolver?: MessageResolver | null,
  locale: string = DEFAULT_LOCALE
): string {
  if (resolver) {
    const custom = resolver(result, isValid);
    if (custom) return custom;
  }

  const code = result.reason_code;
  if (code) {
    const mapped = (messages as Record<string, string | undefined>)[code];
    if (mapped) return mapped;
  }

  if (locale === DEFAULT_LOCALE && result.reason) {
    return result.reason;
  }

  return isValid ? messages.valid : messages.invalid;
}
