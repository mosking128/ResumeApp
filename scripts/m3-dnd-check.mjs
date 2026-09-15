import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
page.on('console', (m) => {
  if (m.text().includes('[dnd]')) console.log(m.text());
});
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);

// set scale 100% if needed
await page.selectOption('select[aria-label="画布缩放"]', '1').catch(() => {});
await page.waitForTimeout(300);

const idsBefore = await page.locator('[data-section-id]').evaluateAll((els) =>
  els.map((el) => el.getAttribute('data-section-id')),
);
console.log('before', idsBefore);

const handles = page.locator('[data-drag-handle]');
console.log('handles', await handles.count());
const first = handles.nth(0);
const second = handles.nth(1);
const b1 = await first.boundingBox();
const b2 = await second.boundingBox();
if (!b1 || !b2) throw new Error('no boxes');

await page.mouse.move(b1.x + b1.width / 2, b1.y + b1.height / 2);
await page.mouse.down();
await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2, { steps: 15 });
await page.waitForTimeout(100);
await page.mouse.up();
await page.waitForTimeout(600);

const idsAfter = await page.locator('[data-section-id]').evaluateAll((els) =>
  els.map((el) => el.getAttribute('data-section-id')),
);
console.log('after', idsAfter);
console.log(JSON.stringify(idsBefore) === JSON.stringify(idsAfter) ? 'ORDER_SAME' : 'DRAG_ORDER_CHANGED');
await browser.close();
