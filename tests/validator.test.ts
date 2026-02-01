import { describe, it, expect } from 'vitest';
import { isValidEmailFormat, normalizeEmail } from '../src/validator';

describe('isValidEmailFormat', () => {
  it('should return true for valid email formats', () => {
    expect(isValidEmailFormat('test@example.com')).toBe(true);
    expect(isValidEmailFormat('user.name@domain.org')).toBe(true);
    expect(isValidEmailFormat('user+tag@example.co.uk')).toBe(true);
    expect(isValidEmailFormat('a@b.co')).toBe(true);
  });

  it('should return false for invalid email formats', () => {
    expect(isValidEmailFormat('')).toBe(false);
    expect(isValidEmailFormat('invalid')).toBe(false);
    expect(isValidEmailFormat('no-at-sign.com')).toBe(false);
    expect(isValidEmailFormat('@nodomain.com')).toBe(false);
    expect(isValidEmailFormat('no@domain')).toBe(false);
    expect(isValidEmailFormat('spaces in@email.com')).toBe(false);
    expect(isValidEmailFormat('user@')).toBe(false);
  });
});

describe('normalizeEmail', () => {
  it('should lowercase the email', () => {
    expect(normalizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
    expect(normalizeEmail('User@Domain.Org')).toBe('user@domain.org');
  });

  it('should trim whitespace', () => {
    expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com');
    expect(normalizeEmail('\tuser@domain.org\n')).toBe('user@domain.org');
  });

  it('should handle already normalized emails', () => {
    expect(normalizeEmail('test@example.com')).toBe('test@example.com');
  });
});
