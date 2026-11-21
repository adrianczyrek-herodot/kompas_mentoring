import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];

page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', err => errors.push(err.message));

const viewports = [
  { width: 320, height: 600, name: '320px' },
  { width: 768, height: 800, name: '768px' },
  { width: 1440, height: 900, name: '1440px' }
];

const themes = ['light', 'dark'];
const paths = [
  '/', // Podstawy/Kolor
  '/?path=/docs/podstawy-typografia--docs',
  '/?path=/docs/przewodnik-zacznij-tutaj--docs',
  '/?path=/docs/przewodnik-jak-wybrac--docs',
  '/?path=/docs/przewodnik-czego-unikac--docs',
  '/?path=/story/components-button--playground',
  '/?path=/story/produkt-e2-katalog-i-onboarding-mentorcard--playground',
  '/?path=/story/screens-p2-search--p2screen',
  '/?path=/story/patterns-form--playground',
];

for (const theme of themes) {
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    for (const path of paths) {
      const url = `http://localhost:6007${path}&globals=theme:${theme}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(500);
        // Check for horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
        const hasConsoleErrors = errors.filter(e => e.includes('http://localhost:6007')).length > 0;
        console.log(`${theme} | ${vp.name} | ${path} | horizScroll: ${hasHorizontalScroll} | errors: ${errors.length}`);
        errors.length = 0;
      } catch (e) {
        console.log(`${theme} | ${vp.name} | ${path} | ERROR: ${e.message}`);
      }
    }
  }
}

await browser.close();
console.log('Done');
