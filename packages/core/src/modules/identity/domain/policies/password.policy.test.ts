import { describe, expect, it } from 'vitest';
import { checkPasswordLength } from './password.policy.ts';

describe('checkPasswordLength (spec §8: 10–128 characters)', () => {
  it('accepts exactly 10 characters', () => {
    expect(checkPasswordLength('a'.repeat(10)).isOk()).toBe(true);
  });

  it('rejects 9 characters with the minimum in the error', () => {
    const result = checkPasswordLength('a'.repeat(9));
    expect(result._unsafeUnwrapErr()).toEqual({
      code: 'identity.password_too_short',
      minLength: 10,
    });
  });

  it('rejects more than 128 characters', () => {
    expect(checkPasswordLength('a'.repeat(129))._unsafeUnwrapErr().code).toBe(
      'identity.password_too_long',
    );
  });

  it('counts an emoji as one character', () => {
    expect(checkPasswordLength(`${'a'.repeat(8)}🔒🔑`).isOk()).toBe(true);
  });
});
