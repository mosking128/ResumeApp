import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

console.log('SECTIONS', await page.locator('[data-section-id]').count());
await page.locator('[data-section-id]').first().click({ force: true });
await page.waitForTimeout(400);

const panel = page.locator('aside[aria-label="属性面板"]');
console.log('PANEL', JSON.stringify((await panel.innerText()).slice(0, 250)));

// input 0 = 模块标题, input 1 = 姓名
const inputs = panel.locator('input');
console.log('INPUT_COUNT', await inputs.count());
await inputs.nth(1).fill('张三丰');
await page.waitForTimeout(400);
const canvas = await page.locator('[data-page-id]').innerText();
console.log('CANVAS_HAS', canvas.includes('张三丰'), JSON.stringify(canvas.slice(0, 80)));

await page.getByRole('button', { name: '保存' }).click();
await page.waitForTimeout(500);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const after = await page.locator('[data-page-id]').innerText();
console.log('AFTER_HAS', after.includes('张三丰'));
await page.screenshot({ path: 'D:/33734/Documents/VibeCoding_Project/ResumeApp/screenshot-m2.png' });
await browser.close();
console.log(after.includes('张三丰') ? 'PASS' : 'FAIL');
