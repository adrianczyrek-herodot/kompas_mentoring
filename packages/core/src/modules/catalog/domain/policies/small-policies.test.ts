import { describe, expect, it } from 'vitest';
import { money } from '../../../../shared/domain/index.ts';
import { halfHourRate, rateProblem } from './rate.policy.ts';
import { profileSlug, slugifyName, slugSuffix } from './slug.policy.ts';
import { parseVideoLink, videoPageUrl } from './video-link.policy.ts';

describe('video link policy (Q4, A05)', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 'dQw4w9WgXcQ'],
    ['youtube.com/watch?v=dQw4w9WgXcQ&t=42', 'youtube', 'dQw4w9WgXcQ'],
    ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ?si=abc', 'youtube', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'youtube', 'dQw4w9WgXcQ'],
    ['http://vimeo.com/76979871', 'vimeo', '76979871'],
    ['https://www.vimeo.com/76979871/', 'vimeo', '76979871'],
  ])('%s → %s %s', (url, provider, videoId) => {
    expect(parseVideoLink(url)).toEqual({ provider, videoId });
  });

  it.each([
    'https://example.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=short',
    'https://www.youtube.com/watch',
    'https://www.youtube.com/channel/UC123',
    'https://youtu.be/',
    'https://vimeo.com/channels/staffpicks',
    'https://vimeo.com/123',
    'javascript:alert(1)',
    'ftp://vimeo.com/76979871',
    'http://[bad',
  ])('rejects %s', (url) => {
    expect(parseVideoLink(url)).toBeNull();
  });

  it('rebuilds the canonical page URL from the stored pair', () => {
    expect(videoPageUrl({ provider: 'youtube', videoId: 'dQw4w9WgXcQ' })).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );
    expect(videoPageUrl({ provider: 'vimeo', videoId: '76979871' })).toBe(
      'https://vimeo.com/76979871',
    );
  });
});

describe('rate policy (Q9)', () => {
  it('accepts whole złoty between 40 and 1000', () => {
    expect(rateProblem(money.of(4_000n))).toBeNull();
    expect(rateProblem(money.of(3_999n))).toBe('out_of_range');
    expect(rateProblem(money.of(100_001n))).toBe('out_of_range');
    expect(rateProblem(money.of(15_001n))).toBe('not_whole_zloty');
  });

  it('charges half of the hourly rate for 30 minutes, rounded down to the grosz', () => {
    expect(halfHourRate(money.of(15_000n))).toEqual(money.of(7_500n));
    expect(halfHourRate(money.of(15_001n))).toEqual(money.of(7_500n));
  });
});

describe('slug policy (Q14)', () => {
  it('transliterates Polish names to ASCII kebab-case', () => {
    expect(slugifyName('Łucja Żak-Ślęzak')).toBe('lucja-zak-slezak');
    expect(slugifyName('  Anna  ')).toBe('anna');
    expect(slugifyName('Renée')).toBe('renee');
    expect(slugifyName('😀')).toBe('mentor');
    expect(slugifyName('a'.repeat(40))).toHaveLength(30);
  });

  it('takes 6 base-36 characters from the random tail of the id', () => {
    const suffix = slugSuffix('0199f3c4-7b1a-7cc0-8a5e-2f6f3b1c9d10');
    expect(suffix).toMatch(/^[0-9a-z]{6}$/);
    expect(slugSuffix('0199f3c4-7b1a-7cc0-8a5e-000000000001')).toBe('000001');
    expect(profileSlug('Anna', '0199f3c4-7b1a-7cc0-8a5e-2f6f3b1c9d10')).toBe(`anna-${suffix}`);
  });
});
