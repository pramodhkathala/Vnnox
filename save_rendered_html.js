// save_rendered_html.js
// Usage:
// 1) npm init -y
// 2) npm i puppeteer
// 3) node save_rendered_html.js
//
// Output: rendered_page.html and rendered_page.png

const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const url = 'https://au.vnnox.com/care/#/schemeConf/generate';
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  // Optional: increase viewport if page is responsive
  await page.setViewport({ width: 1366, height: 900 });

  console.log('Opening', url);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });

  // Some SPAs load extra XHR after initial load: wait a little
  await page.waitForTimeout(3000);

  const html = await page.content();
  fs.writeFileSync('rendered_page.html', html, 'utf8');
  await page.screenshot({ path: 'rendered_page.png', fullPage: true });

  console.log('Saved rendered_page.html and rendered_page.png');
  await browser.close();
})();
