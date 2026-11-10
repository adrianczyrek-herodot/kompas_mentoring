import { err, ok, type Result } from '../../../../shared/domain/index.ts';
import type { PasswordTooLong, PasswordTooShort } from '../identity.errors.ts';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from './config.ts';

/**
 * Spec §8 / P4: length rule only. Breached-password screening (Q8: HIBP k-anonymity) is an
 * infrastructure port, because it needs a network call.
 */
export const checkPasswordLength = (
  password: string,
): Result<void, PasswordTooShort | PasswordTooLong> => {
  const length = Array.from(password).length; // code points, so emoji count once
  if (length < PASSWORD_MIN_LENGTH) {
    return err({ code: 'identity.password_too_short', minLength: PASSWORD_MIN_LENGTH });
  }
  if (length > PASSWORD_MAX_LENGTH) {
    return err({ code: 'identity.password_too_long', maxLength: PASSWORD_MAX_LENGTH });
  }
  return ok(undefined);
};
