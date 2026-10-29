import { chromium } from 'playwright-core';

const OLD = process.env.OLD_URL ?? 'http://127.0.0.1:8080/';
const NEW = process.env.NEW_URL ?? 'http://127.0.0.1:8090/es/';

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});

async function measure(url, runs = 3) {
  const results = [];
  for (let i = 0; i < runs; i += 1) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      userAgent:
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36',
    });
    const page = await context.newPage();
    const client = await context.newCDPSession(page);

    // 4G lenta: 1.6 Mbps de bajada, 150 ms de RTT.
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });

    await page.addInitScript(() => {
      window.__lcp = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.__lcp = entry.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });

    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForTimeout(1500);

    const data = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      const bytes = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      return {
        bytes: bytes + (nav.transferSize || 0),
        requests: resources.length + 1,
        domContentLoaded: nav.domContentLoadedEventEnd,
        load: nav.loadEventEnd,
        lcp: window.__lcp,
      };
    });

    results.push(data);
    await context.close();
  }

  const median = (key) => results.map((r) => r[key]).sort((a, b) => a - b)[Math.floor(results.length / 2)];
  return {
    bytes: median('bytes'),
    requests: median('requests'),
    dcl: median('domContentLoaded'),
    load: median('load'),
    lcp: median('lcp'),
  };
}

const fmt = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';

for (const [label, url] of [
  ['VIEJO  ', OLD],
  ['NUEVO  ', NEW],
]) {
  try {
    const m = await measure(url);
    console.log(
      `${label} peso=${fmt(m.bytes)}  requests=${m.requests}  DCL=${Math.round(m.dcl)}ms  load=${Math.round(m.load)}ms  LCP=${Math.round(m.lcp)}ms`
    );
  } catch (error) {
    console.log(`${label} ERROR: ${error.message.slice(0, 80)}`);
  }
}

await browser.close();
