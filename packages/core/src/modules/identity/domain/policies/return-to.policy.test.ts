import { describe, expect, it } from 'vitest';
import { safeReturnTo } from './return-to.policy.ts';

describe('safeReturnTo (F1 requirement 4: internal paths only)', () => {
  it.each([
    ['/sesje', '/sesje'],
    ['/rezerwacja/m1/platnosc?krok=2', '/rezerwacja/m1/platnosc?krok=2'],
    ['/konto#zgody', '/konto#zgody'],
  ])('keeps internal path %s', (raw, expected) => {
    expect(safeReturnTo(raw)).toBe(expected);
  });

  it.each([
    ['missing', undefined],
    ['null', null],
    ['empty', ''],
    ['absolute URL', 'https://evil.example/'],
    ['scheme-relative URL', '//evil.example'],
    ['backslash trick', '/\\evil.example'],
    ['embedded backslash', '/foo\\..\\evil'],
    ['javascript scheme', 'javascript:alert(1)'],
    ['control character', '/sesje\n//evil.example'],
    ['tab character', '/\t/evil.example'],
    ['login page (loop)', '/logowanie'],
    ['register page with query (loop)', '/rejestracja?returnTo=/sesje'],
  ])('falls back to "/" for %s', (_label, raw) => {
    expect(safeReturnTo(raw)).toBe('/');
  });
});
