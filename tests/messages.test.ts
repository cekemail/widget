import { describe, it, expect } from 'vitest';
import { BUILT_IN_MESSAGES, resolveMessages, messageForResult, formatMessage } from '../src/messages';

describe('resolveMessages', () => {
  it('returns English by default', () => {
    expect(resolveMessages(undefined).invalid_format).toBe('Invalid email format');
  });

  it('returns the bundled Indonesian messages', () => {
    expect(resolveMessages('id').invalid_format).toBe('Format email tidak valid');
    expect(resolveMessages('id').mailbox_not_found).toBe(BUILT_IN_MESSAGES.id.mailbox_not_found);
  });

  it('falls back to English for unknown locales', () => {
    expect(resolveMessages('fr').invalid_format).toBe('Invalid email format');
  });

  it('layers custom messages on top of the bundled ones', () => {
    const messages = resolveMessages('id', { mailbox_not_found: 'Custom' });
    expect(messages.mailbox_not_found).toBe('Custom');
    expect(messages.invalid_format).toBe('Format email tidak valid');
  });

  it('ignores a resolver function when building the table', () => {
    expect(resolveMessages('en', () => 'x').invalid).toBe('Email is invalid');
  });
});

describe('messageForResult', () => {
  const messages = resolveMessages('id');
  const result = { is_valid: true, is_reachable: false, is_disposable_email: false, reason: 'Mailbox does not exist', reason_code: 'mailbox_not_found' };

  it('maps reason_code to the locale message', () => {
    expect(messageForResult(result, false, messages, null, 'id')).toBe('Kotak surat ini tidak ada');
  });

  it('prefers the resolver function when it returns text', () => {
    expect(messageForResult(result, false, messages, () => 'Nope', 'id')).toBe('Nope');
  });

  it('falls through when the resolver returns nothing', () => {
    expect(messageForResult(result, false, messages, () => null, 'id')).toBe('Kotak surat ini tidak ada');
  });

  it('shows the raw API reason in English when there is no code', () => {
    const noCode = { ...result, reason_code: undefined };
    expect(messageForResult(noCode, false, resolveMessages('en'), null, 'en')).toBe('Mailbox does not exist');
  });

  it('never leaks the English reason into other locales', () => {
    const noCode = { ...result, reason_code: undefined };
    expect(messageForResult(noCode, false, messages, null, 'id')).toBe('Email tidak valid');
  });

  it('uses the generic message for unknown codes', () => {
    expect(messageForResult({ ...result, reason_code: 'something_new' }, true, messages, null, 'id')).toBe('Email valid');
  });
});

describe('formatMessage', () => {
  it('replaces a placeholder with the given param', () => {
    expect(formatMessage('Did you mean :suggestion?', { suggestion: 'jane@gmail.com' })).toBe(
      'Did you mean jane@gmail.com?'
    );
  });

  it('replaces every occurrence of a placeholder', () => {
    expect(formatMessage(':name, :name', { name: 'x' })).toBe('x, x');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(formatMessage('Did you mean :suggestion?', {})).toBe('Did you mean :suggestion?');
  });

  it('formats the bundled did_you_mean message per locale', () => {
    const params = { suggestion: 'jane@gmail.com' };
    expect(formatMessage(resolveMessages('en').did_you_mean, params)).toBe('Did you mean jane@gmail.com?');
    expect(formatMessage(resolveMessages('id').did_you_mean, params)).toBe('Mungkin maksud Anda jane@gmail.com?');
  });
});
