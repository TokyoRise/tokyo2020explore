const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, 'docs');

function buildSiteHero(imgSrc, imgAlt, eyebrow, title, desc, extraContent = '') {
  return `\n    <div class="site-hero">\n      <div class="site-hero-bg"><img src="${imgSrc}" alt="${imgAlt}" /></div>\n      <div class="site-hero-content">\n        <p class="site-hero-eyebrow">${eyebrow}</p>\n        <h1 class="site-hero-title">${title}</h1>${desc ? `\n        <p class="site-hero-desc">${desc}</p>` : ''}${extraContent}\n      </div>\n    </div>`;
}

// ── page-hero-img pages ──────────────────────────────────────────────────────
const pageHeroFiles = [
  'akihabara.html','asakusa.html','daikanyama.html','ginza.html','guide.html',
  'info.html','jibmbocho.html','jiyugaoka.html','kagurazaka.html','kichijoji.html',
  'kyosumi-shiarakawa.html','koenji.html','ningyocho.html','nishi-ogikubo.html',
  'omotesando.html','outdoors.html','roppongi.html','projects-3-1.html','shop-2.html',
  'shibuya.html','shinjuku.html','shimokitazawa.html','tokyostation.html','ueno.html','yanaka.html'
];

for (const file of pageHeroFiles) {
  const filePath = path.join(docsDir, file);
  if (!fs.existsSync(filePath)) continue;
  let html = fs.readFileSync(filePath, 'utf8');

  // Extract hero image src & alt
  const heroImgMatch = html.match(/<div class="page-hero-img"><img src="([^"]+)"(?:[^>]*alt="([^"]*)")?/);
  if (!heroImgMatch) { console.log(`SKIP (no page-hero-img): ${file}`); continue; }
  const imgSrc = heroImgMatch[1];
  const imgAlt = heroImgMatch[2] || '';

  // Extract title
  const titleMatch = html.match(/<h1>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract page-desc
  const descMatch = html.match(/<p class="page-desc">([^<]+)<\/p>/);
  const desc = descMatch ? descMatch[1].trim() : '';

  // Remove page-header block from page-content
  html = html.replace(/<div class="page-header">.*?<\/div>/, '');

  // Remove page-hero-img block
  html = html.replace(/<div class="page-hero-img"><img[^>]*\/><\/div>/, '');

  // Insert site-hero before <main>
  const heroHtml = buildSiteHero(imgSrc, imgAlt, 'TOKYO IS YOURS', title, desc);
  html = html.replace('<main>', '<main>' + heroHtml);

  fs.writeFileSync(filePath, html);
  console.log(`DONE: ${file}`);
}

// ── recommendations.html ─────────────────────────────────────────────────────
(function() {
  const filePath = path.join(docsDir, 'recommendations.html');
  let html = fs.readFileSync(filePath, 'utf8');

  const imgMatch = html.match(/<div class="rec-hero">\s*<img src="([^"]+)"(?:[^>]*alt="([^"]*)")?/);
  if (!imgMatch) { console.log('SKIP recommendations.html'); return; }
  const imgSrc = imgMatch[1];
  const imgAlt = imgMatch[2] || '';

  const titleMatch = html.match(/<h1 class="rec-title">([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const descMatch = html.match(/<p class="rec-desc">([^<]+(?:<br\s*\/>[^<]+)*)<\/p>/);
  const desc = descMatch ? descMatch[1].replace(/<br\s*\/?>/g, ' ').trim() : '';

  // Remove the old rec-hero + rec-intro blocks
  html = html.replace(/<div class="rec-hero">[\s\S]*?<\/div>\s*<div class="rec-intro">[\s\S]*?<\/div>/, '');

  const heroHtml = buildSiteHero(imgSrc, imgAlt, 'TOKYO IS YOURS', title, desc);
  html = html.replace('<main>', '<main>' + heroHtml);

  fs.writeFileSync(filePath, html);
  console.log('DONE: recommendations.html');
})();

// ── projects-3.html ───────────────────────────────────────────────────────────
(function() {
  const filePath = path.join(docsDir, 'projects-3.html');
  let html = fs.readFileSync(filePath, 'utf8');

  const imgMatch = html.match(/class="rec-hero[^"]*">\s*<img src="([^"]+)"(?:[^>]*alt="([^"]*)")?/);
  if (!imgMatch) { console.log('SKIP projects-3.html'); return; }
  const imgSrc = imgMatch[1];
  const imgAlt = imgMatch[2] || '';

  const titleMatch = html.match(/<h1 class="rec-title">([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const descMatch = html.match(/<p class="rec-desc">([^<]+)<\/p>/);
  const desc = descMatch ? descMatch[1].trim() : '';

  // Remove existing rec-hero block (with all modifiers and inner content)
  html = html.replace(/<div class="rec-hero[^"]*">[\s\S]*?<\/div>\s*/, '');

  const heroHtml = buildSiteHero(imgSrc, imgAlt, 'TOKYO IS YOURS', title, desc);
  html = html.replace('<main>', '<main>' + heroHtml);

  fs.writeFileSync(filePath, html);
  console.log('DONE: projects-3.html');
})();

// ── shop.html ─────────────────────────────────────────────────────────────────
(function() {
  const filePath = path.join(docsDir, 'shop.html');
  let html = fs.readFileSync(filePath, 'utf8');

  const imgMatch = html.match(/<div class="shop-hero-img">\s*<img src="([^"]+)"(?:[^>]*alt="([^"]*)")?/);
  if (!imgMatch) { console.log('SKIP shop.html'); return; }
  const imgSrc = imgMatch[1];

  const titleMatch = html.match(/<h1 class="shop-hero-title">([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const labelMatch = html.match(/<p class="shop-hero-label">([^<]+)<\/p>/);
  const label = labelMatch ? labelMatch[1].trim() : 'TOKYO IS YOURS';

  const descMatch = html.match(/<p class="shop-hero-desc">([\s\S]*?)<\/p>/);
  const desc = descMatch ? descMatch[1].replace(/\s+/g, ' ').trim() : '';

  const buyLinkMatch = html.match(/<a class="btn-buy" href="([^"]+)"[^>]*>([^<]+)<\/a>/);
  const buyExtra = buyLinkMatch
    ? `\n        <a class="btn-buy site-hero-btn" href="${buyLinkMatch[1]}" target="_blank" rel="noopener">${buyLinkMatch[2].trim()}</a>`
    : '';

  // Remove old shop-hero block
  html = html.replace(/<div class="shop-hero">[\s\S]*?<\/div>\s*<\/div>\s*\n/, '');

  const heroHtml = buildSiteHero(imgSrc, '', label, title, desc, buyExtra);
  html = html.replace('<main>', '<main>' + heroHtml);

  fs.writeFileSync(filePath, html);
  console.log('DONE: shop.html');
})();

console.log('\nAll done.');
