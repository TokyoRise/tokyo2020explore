/**
 * Extracts content from scraped Wix HTML and builds clean static site files.
 * Run after scrape.js completes.
 */

const fs = require('fs');
const path = require('path');

const SCRAPED_PAGES_DIR = path.join(__dirname, 'scraped', 'pages');
const SCRAPED_BLOG_DIR = path.join(__dirname, 'scraped', 'blog');
const SITE_DIR = path.join(__dirname, 'site');
const SITE_BLOG_DIR = path.join(SITE_DIR, 'blog');

fs.mkdirSync(SITE_DIR, { recursive: true });
fs.mkdirSync(SITE_BLOG_DIR, { recursive: true });

// ── Helpers ──────────────────────────────────────────────────────────────────

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, '').replace(/\s+/g, ' ').trim();
}

function extractContent(html, isPost) {
  // Remove scripts, styles, and Wix-specific noise
  let clean = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Extract title
  const titleMatch = clean.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]).replace(/\s*\|\s*Tokyo.*$/, '').trim() : '';

  // Extract og:image (hero image)
  const ogImageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
    || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
  const heroImage = ogImageMatch ? ogImageMatch[1] : '';

  // Extract og:description
  const ogDescMatch = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)
    || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i);
  const description = ogDescMatch ? ogDescMatch[1] : '';

  // Get all images from the page body (wixstatic CDN images only)
  const imgMatches = [...clean.matchAll(/src="(https:\/\/static\.wixstatic\.com\/media\/[^"]+)"/g)];
  const images = [...new Set(imgMatches.map(m => m[1]))].filter(url => !url.includes('w_38') && !url.includes('w_40'));

  // Get all paragraphs of text (Hebrew + English content)
  // Wix wraps content in various divs; we extract any text blocks > 20 chars
  const textBlocks = [];
  const textMatches = clean.matchAll(/>([^<]{20,})</g);
  for (const m of textMatches) {
    const t = m[1].replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '').replace(/&amp;/g, '&').trim();
    if (t.length > 20 && !t.includes('{') && !t.includes('function') && !t.includes('undefined')) {
      textBlocks.push(t);
    }
  }

  // For blog posts, extract date and body paragraphs
  let date = '';
  let postBody = [];
  if (isPost) {
    const dateMatch = clean.match(/(\d{1,2}\s+ב[א-ת]+\s+\d{4})/);
    if (dateMatch) date = dateMatch[1];

    // Extract meaningful text blocks (filter nav/footer noise)
    const noiseWords = ['עמוד הבית', 'אודות', 'בלוג', 'מקומות מומלצים', 'לדלג לתוכן', 'Tokyo 20_20', 'פוסטים אחרונים', 'צפיות', 'תגובות', 'הפוסט', 'כל הזכויות'];
    postBody = textBlocks.filter(t => !noiseWords.some(n => t.includes(n)) && t.length > 30);
  }

  return { title, heroImage, description, images, textBlocks, date, postBody };
}

// ── HTML Templates ────────────────────────────────────────────────────────────

const NAV_HTML = `
  <header class="site-header">
    <div class="nav-inner">
      <nav>
        <ul class="nav-links" id="nav-links">
          <li><a href="index.html">בית</a></li>
          <li><a href="about.html">אודות</a></li>
          <li><a href="guide.html">מידע</a></li>
          <li><a href="blog.html">בלוג</a></li>
          <li><a href="shop.html">הספר</a></li>
        </ul>
      </nav>
      <div class="nav-logo"><a href="index.html">Tokyo 20/20 Explore</a></div>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu"><span></span><span></span><span></span></button>
    </div>
  </header>`;

const FOOTER_HTML = `
  <footer class="site-footer">
    <span class="footer-copy">© Tokyo2020explore — כל הזכויות שמורות</span>
  </footer>`;

const NAV_SCRIPT = `
  <script>
    document.getElementById('nav-toggle').addEventListener('click', function() {
      document.getElementById('nav-links').classList.toggle('open');
    });
  </script>`;

function pageShell(title, body, lang = 'he', extraMeta = '') {
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Tokyo 20/20 Explore</title>
  ${extraMeta}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  ${NAV_HTML}
  <main>
    ${body}
  </main>
  ${FOOTER_HTML}
  ${NAV_SCRIPT}
</body>
</html>`;
}

// ── Process pages ─────────────────────────────────────────────────────────────

const pages = fs.readdirSync(SCRAPED_PAGES_DIR).filter(f => f.endsWith('.html'));
console.log(`\nProcessing ${pages.length} pages...`);

for (const filename of pages) {
  const slug = filename.replace('.html', '');
  const html = fs.readFileSync(path.join(SCRAPED_PAGES_DIR, filename), 'utf8');
  const { title, heroImage, description, images, textBlocks } = extractContent(html, false);

  const displayTitle = title || slug;

  // Build body: hero image + text content
  let bodyHtml = `<div class="page-content"><div class="page-header"><h1>${displayTitle}</h1>`;
  if (description) bodyHtml += `<p class="page-desc">${description}</p>`;
  bodyHtml += `</div>`;

  if (heroImage) {
    bodyHtml += `<div class="page-hero-img"><img src="${heroImage}" alt="${displayTitle}" /></div>`;
  }

  bodyHtml += `<div class="page-text">`;
  const noiseWords = ['עמוד הבית', 'אודות', 'בלוג', 'לדלג לתוכן', 'Tokyo 20_20', 'כל הזכויות', 'Use tab', 'More'];
  const cleanBlocks = textBlocks.filter(t => !noiseWords.some(n => t.includes(n)) && t.length > 30);
  for (const block of cleanBlocks.slice(0, 50)) {
    bodyHtml += `<p>${block}</p>\n`;
  }
  bodyHtml += `</div>`;

  // Add images gallery if extra images found
  if (images.length > 1) {
    bodyHtml += `<div class="page-gallery">`;
    for (const img of images.slice(0, 20)) {
      bodyHtml += `<img src="${img}" alt="" loading="lazy" />`;
    }
    bodyHtml += `</div>`;
  }
  bodyHtml += `</div>`;

  const outputFile = slug === 'index' ? 'index.html' : `${slug}.html`;
  fs.writeFileSync(path.join(SITE_DIR, outputFile), pageShell(displayTitle, bodyHtml));
  console.log(`  ✓ ${outputFile}`);
}

// ── Process blog posts ────────────────────────────────────────────────────────

const blogFiles = fs.existsSync(SCRAPED_BLOG_DIR) ? fs.readdirSync(SCRAPED_BLOG_DIR).filter(f => f.endsWith('.html')) : [];
console.log(`\nProcessing ${blogFiles.length} blog posts...`);

const blogIndex = [];

for (const filename of blogFiles) {
  const slug = filename.replace('.html', '');
  const html = fs.readFileSync(path.join(SCRAPED_BLOG_DIR, filename), 'utf8');
  const { title, heroImage, description, date, postBody } = extractContent(html, true);

  const displayTitle = title || slug;
  blogIndex.push({ slug, title: displayTitle, date, heroImage, description });

  let bodyHtml = `<article class="post-content">`;
  bodyHtml += `<a href="../blog.html" class="back-link">← כל הפוסטים</a>`;
  bodyHtml += `<h1 class="post-title">${displayTitle}</h1>`;
  if (date) bodyHtml += `<p class="post-date">${date}</p>`;
  if (heroImage) bodyHtml += `<img class="post-hero" src="${heroImage}" alt="${displayTitle}" />`;
  bodyHtml += `<div class="post-body">`;
  for (const para of postBody) {
    bodyHtml += `<p>${para}</p>\n`;
  }
  bodyHtml += `</div></article>`;

  const postHtml = pageShell(displayTitle, bodyHtml);
  // For blog posts, need relative path to style.css
  const postHtmlFixed = postHtml.replace('href="style.css"', 'href="../style.css"').replace('href="index.html"', 'href="../index.html"').replace(/(href="(?!http|#|\.\.)[^"]+\.html")/g, (m) => m.replace('href="', 'href="../'));
  fs.writeFileSync(path.join(SITE_BLOG_DIR, `${slug}.html`), postHtmlFixed);
  console.log(`  ✓ blog/${slug}`);
}

// ── Build blog index page ──────────────────────────────────────────────────────

let blogBody = `<div class="page-content"><div class="page-header"><h1>בלוג</h1></div><div class="blog-grid">`;
for (const post of blogIndex) {
  blogBody += `<a class="blog-card" href="blog/${post.slug}.html">`;
  if (post.heroImage) blogBody += `<img src="${post.heroImage}" alt="${post.title}" loading="lazy" />`;
  blogBody += `<div class="blog-card-body"><h2>${post.title}</h2>`;
  if (post.date) blogBody += `<span class="blog-date">${post.date}</span>`;
  if (post.description) blogBody += `<p>${post.description.slice(0, 120)}...</p>`;
  blogBody += `</div></a>`;
}
blogBody += `</div></div>`;
fs.writeFileSync(path.join(SITE_DIR, 'blog.html'), pageShell('בלוג', blogBody));
console.log('\n  ✓ blog.html (index)');

// ── Copy CSS placeholder ──────────────────────────────────────────────────────

console.log('\n✅ Extraction complete! Files written to ./site/');
console.log('Next step: run build-css.js to generate style.css');
