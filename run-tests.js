const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const page = await browser.newPage();
  // Must be HTTPS for crypto.subtle to work: https://bugs.chromium.org/p/chromium/issues/detail?id=373032
  await page.goto('https://example.org/');

  await page.addScriptTag({
    path: './tests-build/piping.umd.js'
  })

  console.log('running tests')
  const { data, error } = await page.evaluate(() => {
    try {
      return {
        data: piping.suite(),
        error: null
      };
    }
    catch (e) {
      return {
        data: null,
        error: e.message
      };
    }
  });
  console.log('finished tests')
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log(data);
})()
  .then(() => {
    process.exit();
  });
