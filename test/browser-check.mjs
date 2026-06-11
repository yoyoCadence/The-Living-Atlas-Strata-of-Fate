// 瀏覽器端驗證：用本機 Chrome 進入遊戲、截圖、收集 console 錯誤。
// 執行：node test/browser-check.mjs （需先 npm run dev）

import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const URL = process.env.GAME_URL ?? 'http://localhost:5180/?seed=verify-001';
mkdirSync('test/shots', { recursive: true });

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox']
});
const page = await (await browser.newContext({ viewport: { width: 1280, height: 760 } })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

await page.goto(URL, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'test/shots/01-boot.png' });

await page.click('#boot-start');
await page.waitForTimeout(4000); // 等世界生成 + 數幀渲染
await page.screenshot({ path: 'test/shots/02-world.png' });

// 開地圖
await page.keyboard.press('m');
await page.waitForTimeout(800);
await page.screenshot({ path: 'test/shots/03-map.png' });
await page.keyboard.press('m');

// debug console 注入命運並驗證稱號
await page.keyboard.press('Backquote');
await page.fill('#debug-input', 'destiny restorer 14');
await page.keyboard.press('Enter');
await page.fill('#debug-input', 'destiny shaper 9');
await page.keyboard.press('Enter');
await page.fill('#debug-input', 'title');
await page.keyboard.press('Enter');
await page.fill('#debug-input', 'reveal');
await page.keyboard.press('Enter');
await page.keyboard.press('Backquote');
await page.keyboard.press('m');
await page.waitForTimeout(600);
await page.screenshot({ path: 'test/shots/04-map-revealed.png' });

const debugLog = await page.textContent('#debug-log');
const ribbon = await page.textContent('#destiny-ribbon');
console.log('--- debug log ---\n' + debugLog);
console.log('--- destiny ribbon ---\n' + ribbon);
console.log('--- console errors ---');
console.log(errors.length ? errors.join('\n') : '(none)');

await browser.close();
process.exit(errors.length ? 1 : 0);
