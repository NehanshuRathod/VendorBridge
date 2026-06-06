const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to login page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

  // Wait for email field
  await page.waitForSelector('input[name="email"]');
  console.log('Entering credentials...');
  await page.type('input[name="email"]', 'admin@vendorbridge.com');
  await page.type('input[name="password"]', 'Admin@123!');

  console.log('Clicking login...');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);

  console.log('Current URL after login:', page.url());
  
  // take a screenshot just in case
  await page.screenshot({ path: 'dashboard.png' });
  
  await browser.close();
})();
