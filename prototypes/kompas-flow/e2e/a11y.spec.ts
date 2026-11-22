import AxeBuilder from '@axe-core/playwright';
import { SCREENS, type ScreenDef } from '../src/screens/registry';
import { expect, goHash, setTheme, switchAccount, test } from './support';

/** The account that can actually open a screen (the gate itself is checked in navigation.spec). */
const ACCOUNT_BY_ACCESS: Record<ScreenDef['access'], RegExp> = {
  public: /Gość/,
  booking: /Gość/,
  guest: /Gość/,
  auth: /Adrian C\./,
  student: /Adrian C\./,
  mentor: /Kasia Nowicka/,
  admin: /Zespół zaufania/,
};

test('każdy ekran, jasny i ciemny motyw: brak poważnych naruszeń WCAG 2.2 AA', async ({
  page,
}, testInfo) => {
  // 23 screens × 2 themes, each followed by an axe run: longer than the default 30 s.
  test.setTimeout(180_000);
  // One viewport is enough for axe; the narrow one is covered by the overflow test.
  test.skip(testInfo.project.name !== 'desktop-1440', 'axe runs once, on the wide viewport');

  await page.goto('/');
  for (const screen of SCREENS) {
    await goHash(page, '/');
    await switchAccount(page, ACCOUNT_BY_ACCESS[screen.access]);
    await goHash(page, screen.sample);
    for (const theme of ['light', 'dark'] as const) {
      await setTheme(page, theme);
      const { violations } = await new AxeBuilder({ page })
        .include('section.screen')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const serious = violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      );
      expect(
        serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
        `${screen.id} (${theme})`,
      ).toEqual([]);
    }
  }
});
