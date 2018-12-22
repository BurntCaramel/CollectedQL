const puppeteer = require('puppeteer-core');
const funcsTests = require('./tests-build/piping.mjs');

(async () => {
const browser = await puppeteer.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  const page = await browser.newPage();
  await page.goto('about:blank');
  
  const result = await page.evaluate(() => {
    return true
  });
})()
  .then(() => {
    process.exit();
  });