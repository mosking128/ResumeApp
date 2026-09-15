import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const out = 'D:/33734/Documents/VibeCoding_Project/ResumeApp/assets/preview';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1.5 });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

await page.locator('[data-section-id]').first().click({ force: true });
await page.waitForTimeout(250);
const inputs = page.locator('aside[aria-label="属性面板"] input');
await inputs.nth(1).fill('林博文');
await inputs.nth(2).fill('138 8888 8888');
await inputs.nth(3).fill('888@qq.com');
await inputs.nth(4).fill('江苏南通');
await page.locator('button', { hasText: '取消选中' }).click();
await page.waitForTimeout(200);

for (const [id, label] of [
  ['steady-classic', '稳重单页'],
  ['clean-navy', '简约横幅'],
  ['minimal-black', '极简黑白'],
]) {
  await page.selectOption('select[aria-label="选择模板"]', id);
  await page.waitForTimeout(900);
  await page.locator('[data-page-id]').first().screenshot({ path: `${out}/${label}.png` });
  console.log('ok', label);
}
await browser.close();
