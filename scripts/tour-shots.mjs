import { chromium } from 'playwright-core';

const b = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
const OUT = 'C:/Users/javie/AppData/Local/Temp/';

const p = await b.newPage({ viewport: { width: 1280, height: 950 } });
await p.goto('http://127.0.0.1:4321/es/', { waitUntil: 'networkidle' });

for (const tab of ['tap', 'grid', 'prestige', 'market']) {
  await p.click(`[data-tab="${tab}"]`);
  await p.waitForTimeout(350);
  await p.locator('.tour').screenshot({ path: `${OUT}dev-${tab}.png` });
}

const m = await b.newPage({ viewport: { width: 390, height: 844 } });
await m.goto('http://127.0.0.1:4321/es/privacidad/', { waitUntil: 'networkidle' });
await m.screenshot({ path: `${OUT}m-legal.png` });
await m.goto('http://127.0.0.1:4321/es/prensa/', { waitUntil: 'networkidle' });
await m.screenshot({ path: `${OUT}m-press.png` });

await b.close();
console.log('ok');
