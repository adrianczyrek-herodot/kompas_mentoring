import { SLUG_NAME_MAX_LENGTH, SLUG_SUFFIX_LENGTH } from './config.ts';

/** Letters NFD does not decompose (ł) plus the rest of the Polish alphabet for clarity. */
const TRANSLITERATION: Record<string, string> = {
  ą: 'a',
  ć: 'c',
  ę: 'e',
  ł: 'l',
  ń: 'n',
  ó: 'o',
  ś: 's',
  ź: 'z',
  ż: 'z',
};

/** "Łucja Żak" → "lucja-zak": ASCII kebab-case, at most 30 characters, "mentor" when nothing is left. */
export const slugifyName = (name: string): string => {
  const ascii = name
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (letter) => TRANSLITERATION[letter] ?? letter)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  const kebab = ascii
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, SLUG_NAME_MAX_LENGTH)
    .replace(/^-+|-+$/g, '');
  return kebab === '' ? 'mentor' : kebab;
};

/**
 * Six base-36 characters from the random tail of the profile's UUID v7 (the head is a timestamp,
 * so two profiles created in the same millisecond would share it).
 */
export const slugSuffix = (profileId: string): string => {
  const tail = profileId.replace(/-/g, '').slice(-12);
  return BigInt(`0x${tail}`)
    .toString(36)
    .padStart(SLUG_SUFFIX_LENGTH, '0')
    .slice(-SLUG_SUFFIX_LENGTH);
};

/** Public address `/mentorzy/<imie>-<6 znaków id>` (Q14); fixed once the profile is published. */
export const profileSlug = (displayName: string, profileId: string): string =>
  `${slugifyName(displayName)}-${slugSuffix(profileId)}`;
