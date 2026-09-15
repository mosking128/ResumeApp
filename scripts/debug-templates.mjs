import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

for (const id of ['steady-classic', 'clean-navy', 'minimal-black']) {
  await page.selectOption('select[aria-label="选择模板"]', id);
  await page.waitForTimeout(900);
  const info = await page.evaluate(() => {
    const el = document.querySelector('[data-page-id]');
    const banner = el?.querySelector('[class*="pageBanner"], header');
    return {
      template: el?.getAttribute('data-template'),
      bannerTag: banner?.tagName ?? null,
      bannerClass: banner?.className ?? null,
      titleText: el?.querySelector('.rv-title-text')?.textContent,
      titleBg: getComputedStyle(el?.querySelector('.rv-title-text') || document.body).backgroundColor,
    };
  });
  console.log(id, JSON.stringify(info));
}
await browser.close();
