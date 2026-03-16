// Test scrape on 3 pages to verify content extraction works
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TEST_URLS = [
  { url: 'https://www.tokyo2020explore.com', slug: 'index' },
  { url: 'https://www.tokyo2020explore.com/about', slug: 'about' },
  { url: 'https://www.tokyo2020explore.com/post/big-in-japan', slug: 'big-in-japan' },
];

const OUTPUT_DIR = path.join(__dirname, 'scraped-test');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const { url, slug } of TEST_URLS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise(r => setTimeout(r, 3000));

    // Extract key content to verify
    const data = await page.evaluate(() => {
      const title = document.title;
      const h1s = Array.from(document.querySelectorAll('h1, h2')).slice(0, 5).map(el => el.innerText.trim()).filter(Boolean);
      const images = Array.from(document.querySelectorAll('img')).slice(0, 5).map(img => img.src).filter(Boolean);
      const text = document.body.innerText.slice(0, 500);
      return { title, h1s, images, text };
    });

    const htmlContent = await page.content();
    fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.html`), htmlContent, 'utf8');
    fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}-data.json`), JSON.stringify(data, null, 2), 'utf8');

    console.log(`\n=== ${slug} ===`);
    console.log('Title:', data.title);
    console.log('Headings:', data.h1s);
    console.log('Images:', data.images.slice(0, 3));
    console.log('Text preview:', data.text.slice(0, 200));

    await page.close();
  }

  await browser.close();
  console.log('\nTest done. Check scraped-test/ folder.');
}

main().catch(console.error);
