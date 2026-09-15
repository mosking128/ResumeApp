import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

mkdirSync('docs/screenshots', { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.5,
});
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

await page.screenshot({ path: 'docs/screenshots/editor-workbench.png' });

await page.locator('[data-section-id]').first().click({ force: true });
await page.waitForTimeout(400);
const panel = page.locator('aside[aria-label="属性面板"]');
const inputs = panel.locator('input');
const count = await inputs.count();
console.log('inputs', count);
if (count >= 2) {
  await inputs.nth(1).fill('林博文');
}
await page.getByRole('button', { name: '取消选中' }).click().catch(() => {});
await page.waitForTimeout(200);

for (const [id, file] of [
  ['clean-navy', 'template-clean-navy.png'],
  ['steady-classic', 'template-steady.png'],
  ['minimal-black', 'template-minimal.png'],
]) {
  await page.selectOption('select[aria-label="选择模板"]', id);
  await page.waitForTimeout(900);
  await page.locator('[data-page-id]').first().screenshot({
    path: `docs/screenshots/${file}`,
  });
}

await page.locator('button').filter({ hasText: '档案' }).first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'docs/screenshots/archive-menu.png' });

await browser.close();
console.log('DONE');
