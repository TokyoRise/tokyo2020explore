const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PAGES = [
  { url: 'https://www.tokyo2020explore.com', slug: 'index' },
  { url: 'https://www.tokyo2020explore.com/about', slug: 'about' },
  { url: 'https://www.tokyo2020explore.com/guide', slug: 'guide' },
  { url: 'https://www.tokyo2020explore.com/info', slug: 'info' },
  { url: 'https://www.tokyo2020explore.com/content', slug: 'content' },
  { url: 'https://www.tokyo2020explore.com/recommendations', slug: 'recommendations' },
  { url: 'https://www.tokyo2020explore.com/shoprecommendation', slug: 'shoprecommendation' },
  { url: 'https://www.tokyo2020explore.com/landmarks', slug: 'landmarks' },
  { url: 'https://www.tokyo2020explore.com/landmarks-1', slug: 'landmarks-1' },
  { url: 'https://www.tokyo2020explore.com/museums', slug: 'museums' },
  { url: 'https://www.tokyo2020explore.com/hotels', slug: 'hotels' },
  { url: 'https://www.tokyo2020explore.com/bookshops', slug: 'bookshops' },
  { url: 'https://www.tokyo2020explore.com/eyewearshops', slug: 'eyewearshops' },
  { url: 'https://www.tokyo2020explore.com/outdoors', slug: 'outdoors' },
  { url: 'https://www.tokyo2020explore.com/fleamarkets', slug: 'fleamarkets' },
  { url: 'https://www.tokyo2020explore.com/kidsplayspace', slug: 'kidsplayspace' },
  { url: 'https://www.tokyo2020explore.com/pancakes', slug: 'pancakes' },
  { url: 'https://www.tokyo2020explore.com/nostalgiccafe', slug: 'nostalgiccafe' },
  { url: 'https://www.tokyo2020explore.com/kakigori', slug: 'kakigori' },
  { url: 'https://www.tokyo2020explore.com/shop', slug: 'shop' },
  { url: 'https://www.tokyo2020explore.com/shop-2', slug: 'shop-2' },
  { url: 'https://www.tokyo2020explore.com/projects-3', slug: 'projects-3' },
  { url: 'https://www.tokyo2020explore.com/projects-3-1', slug: 'projects-3-1' },
  // Neighborhoods
  { url: 'https://www.tokyo2020explore.com/shibuya', slug: 'shibuya' },
  { url: 'https://www.tokyo2020explore.com/shinjuku', slug: 'shinjuku' },
  { url: 'https://www.tokyo2020explore.com/asakusa', slug: 'asakusa' },
  { url: 'https://www.tokyo2020explore.com/ueno', slug: 'ueno' },
  { url: 'https://www.tokyo2020explore.com/ginza', slug: 'ginza' },
  { url: 'https://www.tokyo2020explore.com/roppongi', slug: 'roppongi' },
  { url: 'https://www.tokyo2020explore.com/akihabara', slug: 'akihabara' },
  { url: 'https://www.tokyo2020explore.com/daikanyama', slug: 'daikanyama' },
  { url: 'https://www.tokyo2020explore.com/yanaka', slug: 'yanaka' },
  { url: 'https://www.tokyo2020explore.com/kagurazaka', slug: 'kagurazaka' },
  { url: 'https://www.tokyo2020explore.com/koenji', slug: 'koenji' },
  { url: 'https://www.tokyo2020explore.com/shimokitazawa', slug: 'shimokitazawa' },
  { url: 'https://www.tokyo2020explore.com/nishi-ogikubo', slug: 'nishi-ogikubo' },
  { url: 'https://www.tokyo2020explore.com/jiyugaoka', slug: 'jiyugaoka' },
  { url: 'https://www.tokyo2020explore.com/kichijoji', slug: 'kichijoji' },
  { url: 'https://www.tokyo2020explore.com/tokyostation', slug: 'tokyostation' },
  { url: 'https://www.tokyo2020explore.com/kyosumi-shiarakawa', slug: 'kyosumi-shiarakawa' },
  { url: 'https://www.tokyo2020explore.com/ningyocho', slug: 'ningyocho' },
  { url: 'https://www.tokyo2020explore.com/jibmbocho', slug: 'jibmbocho' },
  { url: 'https://www.tokyo2020explore.com/omotesando', slug: 'omotesando' },
];

const BLOG_POSTS = [
  'אופנה-ללא-מגדר','denim-power','are-you-an-echo','אופנת-העתיד','tsukiji-wonderland',
  'copy-of-לא-אבודים-ביפן','סיכום-שנה','היסטוריה-בתמונות','שיכון-ציבורי','trip-to-karuizawa',
  'אדו-בום','השגעון-הוא-חלק-מהחיים','shibuya-meltdown','בהצלחה-לקיסרית','a-day-trip-to-chiba',
  'בנות-הים','i-am-me','הגיישה-היפנית-שהקסימה-את-המערב','מבט-אל-1964','japan-in-architecture',
  'design-あ','summertime-fireworks-in-tokyo','בית-תה-מזכוכית','לקפוץ-מהרכבת','my-hair-my-choice',
  'tokyo-underground','הבירוקרט-שחשב-מחוץ-למכסה','סיור-בסצינת-המוזיקה-של-טוקיו-חלק-א',
  'תקופה-חדשה','מחאת-העקבים','lovers-day-trip','פיגמנט-לא-עוד-חנות','על-טקסים-שדים-ופוליטיקה',
  'טוקיו-כפי-שהיא-באמת','old-edo-in-tokyo-trip-to-shibamata','הורה-ילד-親子','על-זוגיות-ביפן',
  'על-אמנות-נשית-פורצת-דרך-וקרמיקה','קיצור-תולדות-היופי-ביפן','one-room','עלייתו-של-הויסקי-היפני',
  'קאט-ארט','add-of-the-day','שירות-ללא-תחרות','פינת-האופנה',
  'סיור-אוכל-ב-רחוב-הקניות-הארוך-ביותר-בטוקיו','חג-הבוגרים','נערות-חמודות','japanese-tip-culture',
  'הברבי-היפנית-ומלחמתה-בפטריארכיה','טומיגאיה-שיבויה-שאינה-לתיירים','צילום-אורבני','עולם-טוב-יותר',
  'מה-בין-יפן-לפינלנד','japan-angle','over-tourism','unbuilt-tokyo',
  'עוף-מטוגן-לצד-כוס-בירה-כוס-תה','האישה-היחידה-בחדר','החיים-בצבע','טוקיו-בתמונות',
  'המטרופולין-האבוד','היופי-שבגיוון','a-day-out-of-the-big-city','האלכימאים','גלאמפינג',
  'tanabata-festival-in-tokyo','old-meets-new-tokyo-150-years','הגיבור-של-הסויה','קוף-במים-פושרים',
  'קפסולה-למאה-ה-21','החורף-הגיע','משחק-ילדים','this-worthless-wonderful-world',
  'אמנות-בטבע-טיול-לפסטיבל-echigo-tsumari-art-field','ריאיון-במגזין-onlife-הגרסה-המלאה',
  'טיול-בטבע-מחוץ-לטוקיו','big-in-japan',
];

const OUTPUT_DIR = path.join(__dirname, 'scraped');
const PAGES_DIR = path.join(OUTPUT_DIR, 'pages');
const BLOG_DIR = path.join(OUTPUT_DIR, 'blog');

fs.mkdirSync(PAGES_DIR, { recursive: true });
fs.mkdirSync(BLOG_DIR, { recursive: true });

async function scrapePage(browser, url, outputPath, label) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

    // Wait for Wix content to render
    await new Promise(r => setTimeout(r, 3000));

    // Try to close cookie banner if present
    try {
      await page.click('[data-hook="consent-banner-accept-btn"]', { timeout: 2000 });
    } catch (e) {}

    const content = await page.content();
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✓ ${label}`);
  } catch (err) {
    console.error(`✗ ${label}: ${err.message}`);
    fs.writeFileSync(outputPath, `<!-- ERROR: ${err.message} -->`, 'utf8');
  } finally {
    await page.close();
  }
}

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=he-IL,he']
  });

  console.log(`\n=== Scraping ${PAGES.length} pages ===\n`);
  for (const { url, slug } of PAGES) {
    const outputPath = path.join(PAGES_DIR, `${slug}.html`);
    await scrapePage(browser, url, outputPath, slug);
  }

  console.log(`\n=== Scraping ${BLOG_POSTS.length} blog posts ===\n`);
  for (const post of BLOG_POSTS) {
    const url = `https://www.tokyo2020explore.com/post/${post}`;
    const outputPath = path.join(BLOG_DIR, `${post}.html`);
    await scrapePage(browser, url, outputPath, `post/${post}`);
  }

  await browser.close();
  console.log('\n=== Done! ===');
  console.log(`Pages saved to: ${PAGES_DIR}`);
  console.log(`Blog posts saved to: ${BLOG_DIR}`);
}

main().catch(console.error);
