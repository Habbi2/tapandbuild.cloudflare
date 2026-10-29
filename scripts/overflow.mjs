import { chromium } from 'playwright-core';

const b = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
for (const w of [360, 414, 768]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 } });
  await p.goto('http://127.0.0.1:4321/es/', { waitUntil: 'networkidle' });
  const info = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const bad = [...document.querySelectorAll('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right > vw + 1 || r.left < -1;
      })
      .slice(0, 12)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} [${Math.round(r.left)}..${Math.round(r.right)}]`;
      });
    return { vw, scrollW: document.documentElement.scrollWidth, bad };
  });
  console.log(w, JSON.stringify(info));
  await p.close();
}
await b.close();
