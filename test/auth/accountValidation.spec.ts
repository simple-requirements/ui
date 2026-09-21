import { describe, expect, it } from 'vitest';

import { isValidEmail, isValidPassword, isValidUsername } from '@/auth/accountValidation';

describe('account validation', () => {
    it('uses the backend username constraints', () => {
        expect(isValidUsername('alice.smith-1')).toBe(true);
        expect(isValidUsername('ab')).toBe(false);
        expect(isValidUsername('alice smith')).toBe(false);
    });

    it('requires a complete email address', () => {
        expect(isValidEmail(' alice@example.org ')).toBe(true);
        expect(isValidEmail('alice@example')).toBe(false);
        expect(isValidEmail('alice example.org')).toBe(false);
    });

    it('accepts passwords between 15 and 128 characters', () => {
        expect(isValidPassword('a'.repeat(14))).toBe(false);
        expect(isValidPassword('a'.repeat(15))).toBe(true);
        expect(isValidPassword('a'.repeat(128))).toBe(true);
        expect(isValidPassword('a'.repeat(129))).toBe(false);
    });
});
