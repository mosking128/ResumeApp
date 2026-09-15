import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.selectOption('select[aria-label="选择模板"]', 'steady-classic');
await page.waitForTimeout(1000);

const info = await page.evaluate(() => {
  const el = document.querySelector('.rv-title-text');
  const sec = el?.closest('[data-template]');
  const cs = el ? getComputedStyle(el) : null;
  return {
    secTemplate: sec?.getAttribute('data-template'),
    text: el?.textContent,
    color: cs?.color,
    backgroundImage: cs?.backgroundImage,
    backgroundColor: cs?.backgroundColor,
    clipPath: cs?.clipPath,
    padding: cs?.padding,
  };
});
console.log(info);
await page.locator('[data-page-id]').first().screenshot({
  path: 'D:/33734/Documents/VibeCoding_Project/ResumeApp/assets/preview/稳重单页.png',
});
await browser.close();
