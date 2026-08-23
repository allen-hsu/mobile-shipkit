#!/usr/bin/env node
// Step 1 shortcut: paste a public store listing, get a filled brief.json + the current screenshots.
//
//   node scripts/import-listing.mjs <App Store or Play URL> [--dir store/screenshots] [--locale zh-TW] [--no-screens]
//
// App Store  https://apps.apple.com/tw/app/things-3/id904280696?l=zh   → iTunes lookup API (name, description, genre, rating, screenshots)
// Google Play https://play.google.com/store/apps/details?id=com.x&hl=zh_TW → listing page HTML (og tags, description, screenshots)
//
// Writes  <dir>/listing.json   everything fetched, untouched
//         <dir>/brief.json     app facts filled; one `app` screen per existing screenshot (headlines left for you / store-screenshots §1)
//         <dir>/raw/<locale>/store-NN.png   the live store images — NOTE these are finished marketing images, not raw UI;
//                                            use them to see what is live, re-shoot raw screens before rendering.
// Existing brief.json is merged, not overwritten (your headlines and look survive a re-import).
import fs from 'node:fs'; import path from 'node:path';
const args = process.argv.slice(2), url = args.find((a) => /^https?:\/\//.test(a));
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (!url) { console.error('usage: import-listing.mjs <store url> [--dir DIR] [--locale LL] [--no-screens]'); process.exit(2); }
const dir = path.resolve(opt('--dir', 'store/screenshots')); fs.mkdirSync(dir, { recursive: true });
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
const get = async (u, type = 'text') => { const r = await fetch(u, { headers: { 'user-agent': UA, 'accept-language': '*' } }); if (!r.ok) throw new Error(`${r.status} ${u}`); return type === 'json' ? r.json() : type === 'buf' ? Buffer.from(await r.arrayBuffer()) : r.text(); };
const clean = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\r/g, '').trim();

let L; // normalised listing
if (/apps\.apple\.com/.test(url)) {
  const id = url.match(/id(\d+)/)?.[1], cc = url.match(/apple\.com\/([a-z]{2})\//)?.[1] ?? 'us', l = new URL(url).searchParams.get('l');
  const j = await get(`https://itunes.apple.com/lookup?id=${id}&country=${cc}${l ? `&lang=${l}` : ''}`, 'json');
  const r = j.results?.[0]; if (!r) throw new Error('app not found in iTunes lookup');
  L = { store: 'appstore', id, country: cc, name: r.trackName, seller: r.sellerName, category: r.primaryGenreName, genres: r.genres, description: r.description,
    rating: r.averageUserRating, ratingCount: r.userRatingCount, price: r.formattedPrice, version: r.version, releaseNotes: r.releaseNotes, languages: r.languageCodesISO2A, icon: r.artworkUrl512,
    kind: r.kind, device: /mac/i.test(r.kind ?? '') ? 'mac' : 'iphone',
    screenshots: (r.screenshotUrls ?? []).map((u) => u.replace(/\/\d+x\d+bb\.(jpg|png)$/, '/1320x2868bb.png')), // ask mzstatic for the 6.9" size
    ipadScreenshots: r.ipadScreenshotUrls ?? [], url };
  if (L.device === 'mac') console.log('ℹ this id is a Mac app listing; for the iPhone set use the iOS app id');
} else if (/play\.google\.com/.test(url)) {
  const u = new URL(url), pkg = u.searchParams.get('id'), hl = u.searchParams.get('hl') ?? 'en', gl = u.searchParams.get('gl') ?? 'us';
  const html = await get(`https://play.google.com/store/apps/details?id=${pkg}&hl=${hl}&gl=${gl}`);
  const meta = (p) => clean(html.match(new RegExp(`<meta[^>]+(?:property|name|itemprop)="${p}"[^>]+content="([^"]*)"`, 'i'))?.[1] ?? html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name|itemprop)="${p}"`, 'i'))?.[1]);
  const desc = clean((html.match(/data-g-id="description"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '').replace(/<br\s*\/?>/g, '\n')) || meta('og:description') || meta('description');
  const name = (meta('og:title') || meta('name') || '').replace(/\s*-\s*(Apps on Google Play|Google Play 應用程式)\s*$/i, '').trim();
  const shots = [...new Set([...html.matchAll(/https:\/\/play-lh\.googleusercontent\.com\/[A-Za-z0-9_\-]+(?:=w\d+-h\d+[^"'\s]*)?/g)].map((m) => m[0].replace(/=w\d+-h\d+[^"'\s]*$/, '')))].filter((s) => !html.includes(`${s}=s48`) && !html.includes(`${s}=w240-h480`));
  const rating = html.match(/aria-label="Rated ([\d.]+) stars/)?.[1] ?? html.match(/itemprop="ratingValue" content="([\d.]+)"/)?.[1];
  const category = clean(html.match(/itemprop="genre"[^>]*>(?:<[^>]+>)*([^<]+)/)?.[1] ?? '');
  // phone screenshots on the page appear as =w526-h296 / =w2560... variants; take anything that is not the icon / feature graphic and request a tall size
  const screenshots = shots.filter((s) => !html.includes(`${s}=w240`) && !html.includes(`${s}=s96`)).slice(0, 12).map((s) => `${s}=w1320-h2868`); // no -rw → png/jpeg instead of webp
  L = { store: 'play', id: pkg, country: gl, hl, name, category, description: desc, rating: rating ? Number(rating) : undefined, icon: meta('og:image'), screenshots, url };
} else { console.error('not an App Store / Play URL'); process.exit(2); }

fs.writeFileSync(path.join(dir, 'listing.json'), JSON.stringify(L, null, 2) + '\n');
const locale = opt('--locale', L.store === 'appstore' ? ({ tw: 'zh-TW', jp: 'ja', us: 'en-US', gb: 'en-GB', cn: 'zh-CN', kr: 'ko', de: 'de', fr: 'fr' }[L.country] ?? 'en-US') : (L.hl ?? 'en').replace('_', '-'));

// screenshots
function pngSize(b) { if (b.length > 24 && b.toString('ascii', 1, 4) === 'PNG') return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) { let i = 2; while (i < b.length) { if (b[i] !== 0xff) return null; const m = b[i + 1], len = b.readUInt16BE(i + 2); if (m >= 0xc0 && m <= 0xc3) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }; i += 2 + len; } } return null; }
const shotPaths = [];
if (!args.includes('--no-screens')) {
  const rawDir = path.join(dir, 'raw', locale); fs.mkdirSync(rawDir, { recursive: true });
  for (const [i, s] of L.screenshots.entries()) {
    const f = path.join(rawDir, `store-${String(i + 1).padStart(2, '0')}.png`);
    try {
      const buf = await get(s, 'buf'); const dim = pngSize(buf);
      if (dim && (dim.w < 500 || dim.h / dim.w < 1.5)) continue; // icons, feature graphics, tablet shots that slipped through the Play page scrape — phone sets only
      fs.writeFileSync(f, buf); shotPaths.push(path.relative(dir, f));
    } catch (e) { console.log('✖ screenshot', i + 1, e.message); }
  }
  console.log(`${shotPaths.length} live store screenshot(s) → raw/${locale}/store-NN.png  (finished marketing images; re-shoot raw UI before rendering)`);
}

// brief: merge into an existing one
const bp = path.join(dir, 'brief.json');
const prev = fs.existsSync(bp) ? JSON.parse(fs.readFileSync(bp, 'utf8')) : null;
const firstSentence = (L.description ?? '').split(/(?<=[。！？.!?])\s*/)[0]?.slice(0, 140) ?? '';
const brief = prev ?? { app: {}, look: { style: 'editorial-light', background: { options: ['', ''], chosen: 0 }, accent: { options: ['', ''], chosen: 0 }, text: { options: ['near-black', 'white (dark grounds only)'], chosen: 0 }, tone: [] }, output: {}, assets: [], screens: [], notes: '' };
brief.app = { name: brief.app?.name || L.name, category: brief.app?.category || L.category, coreValue: brief.app?.coreValue || firstSentence, targetUser: brief.app?.targetUser || '', ...(L.rating ? { rating: L.rating, ratingCount: L.ratingCount } : {}), storeUrl: L.url };
brief.output = { platform: L.store === 'play' ? 'android' : 'ios', size: L.store === 'play' ? 'phone · 1320×2868' : '6.9 inch · 1320×2868', locale, subtitles: true, ...brief.output };
if (!brief.screens?.length) {
  const roles = ['hook', 'shift', 'proof', 'feature', 'feature', 'objection', 'social', 'platform'];
  brief.screens = shotPaths.map((p, i) => ({ role: roles[i] ?? 'feature', note: `live store screenshot ${i + 1} — rewrite the headline, replace the shot with a raw capture`, type: 'app', shot: p, title: '', subtitle: '' }));
  if (!brief.screens.length) brief.screens = roles.slice(0, 5).map((role) => ({ role, note: '', type: 'app', shot: 'auto', title: '', subtitle: '' }));
}
brief.source = { store: L.store, id: L.id, importedAt: new Date().toISOString().slice(0, 10), description: L.description };
fs.writeFileSync(bp, JSON.stringify(brief, null, 2) + '\n');
console.log(`${prev ? 'merged into' : 'wrote'} ${path.relative(process.cwd(), bp)}
  app:        ${brief.app.name} · ${brief.app.category}${L.rating ? ` · ${L.rating}★${L.ratingCount ? ` (${L.ratingCount})` : ''}` : ''}
  core value: ${brief.app.coreValue}
  screens:    ${brief.screens.length}  (headlines empty → store-screenshots §1)
  full text:  listing.json → description (${(L.description ?? '').length} chars) for store-listing / headline mining
next: fill brief.json → screens[].title, then  node scripts/brief.mjs ${path.relative(process.cwd(), bp)} --review review.html`);
