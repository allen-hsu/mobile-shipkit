#!/usr/bin/env node
// app-scout — find app opportunities from public store data (no paid estimates needed for screening).
//
//   scout charts    --country jp --genre 6013 [--kind grossing|free|paid] [--limit 100]
//   scout geo-gap   jp us --genre 6013 [--limit 100]          apps strong in A, missing / weak in B
//   scout zombies   --country us --genre 6013 [--months 18]   popular but not updated
//   scout weak      --country us --genre 6013                 big rating count, low rating
//   scout paid-gaps --country us --genre 6013                 paid apps with weak free alternatives
//   scout app       <id> --countries jp,us,tw                 one app across storefronts
//   scout play      <package> [--hl en --gl us]               Play listing facts (installs bucket, ads/IAP, updated)
//   scout search    "term" --country jp [--limit 25]          iTunes search with the same columns
//   scout reviews   <package> [--n 200 --stars 1,2,3 --sort new|helpful --hl en --gl us]   Play reviews + complaint keywords
//   scout play-search "name" [--hl --gl]                      find the Play package for an app name
//   scout complaints <appstore-id|package> [--n 150]          App Store app → its Play twin → 1–3★ reviews + keywords
//   scout report    --genre 6013 --countries jp,us [--out report.md]   everything above → markdown
//   scout genres                                               App Store genre ids
//
// Flags: --json (raw), --out FILE, --no-cache, --ttl HOURS (default 24). Cache: .scout-cache/ next to cwd.
// Sources: iTunes Search/Lookup (facts), legacy iTunes RSS charts (top free / paid / grossing per genre & country),
// Play listing page (installs bucket, updated, ads, IAP, rating). No downloads/revenue — rating-count growth is the proxy.
import fs from 'node:fs'; import path from 'node:path'; import { createHash } from 'node:crypto';

const args = process.argv.slice(2); const cmd = args[0]; const pos = args.slice(1).filter((a) => !a.startsWith('--') && !isFlagValue(a));
function isFlagValue(a) { const i = args.indexOf(a); return i > 0 && args[i - 1].startsWith('--') && !['--json', '--no-cache'].includes(args[i - 1]); }
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(k);
const CACHE = path.resolve('.scout-cache'); fs.mkdirSync(CACHE, { recursive: true });
const TTL = Number(opt('--ttl', 24)) * 3600e3;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchCached(url, kind = 'json') {
  const key = path.join(CACHE, createHash('sha1').update(url).digest('hex') + (kind === 'json' ? '.json' : '.txt'));
  if (!flag('--no-cache') && fs.existsSync(key) && Date.now() - fs.statSync(key).mtimeMs < TTL) { const t = fs.readFileSync(key, 'utf8'); return kind === 'json' ? JSON.parse(t) : t; }
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'en' } });
    if (r.status === 403 || r.status === 429) { await sleep(3000 * (attempt + 1)); continue; }
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    const t = await r.text(); fs.writeFileSync(key, t); await sleep(350);
    return kind === 'json' ? JSON.parse(t) : t;
  }
  throw new Error(`rate limited: ${url}`);
}

// ---------- App Store ----------
export const GENRES = { 6000: 'Business', 6001: 'Weather', 6002: 'Utilities', 6003: 'Travel', 6004: 'Sports', 6005: 'Social Networking', 6006: 'Reference', 6007: 'Productivity', 6008: 'Photo & Video', 6009: 'News', 6010: 'Navigation', 6011: 'Music', 6012: 'Lifestyle', 6013: 'Health & Fitness', 6014: 'Games', 6015: 'Finance', 6016: 'Entertainment', 6017: 'Education', 6018: 'Books', 6020: 'Medical', 6021: 'Magazines & Newspapers', 6022: 'Catalogs', 6023: 'Food & Drink', 6024: 'Shopping', 6025: 'Stickers', 6026: 'Developer Tools', 6027: 'Graphics & Design' };
const LANG_OF = { us: 'EN', gb: 'EN', au: 'EN', ca: 'EN', jp: 'JA', tw: 'ZH', hk: 'ZH', cn: 'ZH', kr: 'KO', de: 'DE', fr: 'FR', es: 'ES', it: 'IT', br: 'PT', mx: 'ES', ru: 'RU', in: 'EN', id: 'ID', th: 'TH', vn: 'VI' };

async function chartIds(country, genre, kind = 'grossing', limit = 100) {
  const feed = { grossing: 'topgrossingapplications', free: 'topfreeapplications', paid: 'toppaidapplications' }[kind];
  const j = await fetchCached(`https://itunes.apple.com/${country}/rss/${feed}/limit=${Math.min(limit, 200)}${genre ? `/genre=${genre}` : ''}/json`);
  const e = j.feed?.entry ?? []; return (Array.isArray(e) ? e : [e]).map((x, i) => ({ id: x.id.attributes['im:id'], rank: i + 1 }));
}
async function lookup(ids, country) {
  const out = []; ids = [...new Set(ids.map(String))];
  for (let i = 0; i < ids.length; i += 40) { // lookup silently truncates big id lists; 40 per call is reliable
    const j = await fetchCached(`https://itunes.apple.com/lookup?id=${ids.slice(i, i + 40).join(',')}&country=${country}&entity=software`);
    out.push(...(j.results ?? []).filter((r) => r.wrapperType === 'software'));
  }
  return out;
}
async function search(term, country, limit = 25) {
  const j = await fetchCached(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=${country}&entity=software&limit=${limit}`);
  return (j.results ?? []);
}
const daysSince = (iso) => iso ? Math.round((Date.now() - Date.parse(iso)) / 864e5) : null;
const row = (r, extra = {}) => ({ id: String(r.trackId), name: r.trackName, seller: r.sellerName, genre: r.primaryGenreName, price: r.price ?? 0, rating: r.averageUserRating ? +r.averageUserRating.toFixed(2) : null, ratings: r.userRatingCount ?? 0,
  updatedDays: daysSince(r.currentVersionReleaseDate), ageDays: daysSince(r.releaseDate), version: r.version, langs: (r.languageCodesISO2A ?? []).join(','), minOS: r.minimumOsVersion, url: `https://apps.apple.com/${(r.trackViewUrl.match(/apple\.com\/([a-z]{2})\//) ?? [, 'us'])[1]}/app/id${r.trackId}`, ...extra });
async function chart(country, genre, kind, limit) {
  const ids = await chartIds(country, genre, kind, limit); const byId = Object.fromEntries(ids.map((x) => [x.id, x.rank]));
  return (await lookup(ids.map((x) => x.id), country)).map((r) => row(r, { rank: byId[String(r.trackId)], kind })).sort((a, b) => a.rank - b.rank);
}
async function chartsUnion(country, genre, limit) { // grossing ∪ free ∪ paid, deduped, keep best rank per kind
  const m = new Map();
  for (const kind of ['grossing', 'free', 'paid']) for (const r of await chart(country, genre, kind, limit)) { const p = m.get(r.id) ?? { ...r, ranks: {} }; p.ranks[kind] = r.rank; m.set(r.id, p); }
  return [...m.values()];
}

// ---------- Google Play ----------
const clean = (s) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
async function play(pkg, hl = 'en', gl = 'us') {
  const h = await fetchCached(`https://play.google.com/store/apps/details?id=${pkg}&hl=en&gl=${gl}`, 'text'); // facts page always in English (regexes); hl only affects the link
  const ld = h.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1]; let L = {}; try { L = JSON.parse(ld); } catch {}
  const txt = clean(h);
  const installs = txt.match(/([\d.,]+[KMB]?\+)\s*Downloads/)?.[1] ?? null;
  const updated = txt.match(/Updated on\s+([A-Z][a-z]{2} \d{1,2}, \d{4})/)?.[1] ?? null;
  return { pkg, name: L.name ?? clean(h.match(/<title>([^<]*)<\/title>/)?.[1]).replace(/ - Apps on Google Play$/, ''), developer: L.author?.name, genre: L.applicationCategory, rating: L.aggregateRating ? +Number(L.aggregateRating.ratingValue).toFixed(2) : null, ratings: L.aggregateRating ? Number(L.aggregateRating.ratingCount) : null,
    price: L.offers?.[0]?.price != null ? Number(L.offers[0].price) : null, installs, updated, updatedDays: updated ? daysSince(new Date(updated).toISOString()) : null, ads: /Contains ads/.test(txt), iap: /In-app purchases/.test(txt), url: `https://play.google.com/store/apps/details?id=${pkg}&hl=${hl}&gl=${gl}` };
}

async function playReviews(pkg, { n = 200, sort = 'new', stars = null, hl = 'en', gl = 'us' } = {}) {
  const out = []; let token = null; const sortId = sort === 'helpful' ? 1 : sort === 'rating' ? 3 : 2;
  while (out.length < n) {
    const want = Math.min(150, n - out.length);
    const body = JSON.stringify([[['UsvDTd', JSON.stringify([null, null, [2, sortId, [want, null, token], null, [null, stars]], [pkg, 7]]), null, 'generic']]]);
    const r = await fetch(`https://play.google.com/_/PlayStoreUi/data/batchexecute?hl=${hl}&gl=${gl}`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8', 'user-agent': UA }, body: 'f.req=' + encodeURIComponent(body) });
    const t = (await r.text()).replace(/^\)\]\}'\n?/, ''); let payload;
    for (const l of t.split('\n')) { try { const j = JSON.parse(l); const e = j.find((x) => x[0] === 'wrb.fr'); if (e && e[2]) { payload = JSON.parse(e[2]); break; } } catch {} }
    if (!payload?.[0]?.length) break;
    for (const v of payload[0]) out.push({ id: v[0], author: v[1]?.[0], score: v[2], text: v[4] ?? '', date: v[5]?.[0] ? new Date(v[5][0] * 1000).toISOString().slice(0, 10) : null, thumbs: v[6] ?? 0, version: v[10] ?? null, reply: v[7]?.[1] ?? null });
    token = payload[1]?.[1]; if (!token) break; await sleep(400);
  }
  return out.slice(0, n);
}
const STOP = new Set('the a an and or but if then so to of in on at for with from by as is are was were be been being it its this that these those i me my we our you your they them their he she his her not no yes do does did done have has had can could would should will just very really also too than more most much many some any all every each only even still app apps use used using get got make makes made like love great good nice best bad one two time times day days please thanks thank would update version new old'.split(' '));
function complaintKeywords(reviews, top = 25) {
  const uni = new Map(), bi = new Map(); const add = (m, k) => m.set(k, (m.get(k) ?? 0) + 1);
  const CJK_STOP = /^(我的|我們|可以|不能|沒有|就是|但是|因為|所以|這個|那個|一個|什麼|為什麼|還是|已經|現在|之後|之前|如果|一下|很好|不好|謝謝|請問|希望|覺得|知道|使用|功能|的話|而且|然後|或者|不是|自己|這樣|真的|非常|有點|一直|每次|時候|問題|東西|大家|應該|需要|一樣|只是|很多|不會|不要|不用|無法|沒辦法|一定|其他|有沒有|怎麼|怎么|什么|这个|没有|可以|不能|就是|但是|因为|所以|已经|现在|时候|问题|还是|希望|觉得|知道|使用|功能|我们|一个|真的|非常|一直|每次|应该|需要|一样|只是|很多|不会|不要|不用|无法|没办法|一定|其他)$/;
  for (const r of reviews) {
    const t = r.text;
    if (/[\u3040-\u30ff\u3400-\u9fff]/.test(t)) { // CJK: character n-grams (2 and 3) over runs of CJK text
      for (const run of t.match(/[\u3040-\u30ff\u3400-\u9fff]+/g) ?? []) for (let i = 0; i < run.length; i++) { const b = run.slice(i, i + 2), c = run.slice(i, i + 3); if (b.length === 2 && !CJK_STOP.test(b)) add(uni, b); if (c.length === 3 && !CJK_STOP.test(c)) add(bi, c); }
    } else {
      const w = t.toLowerCase().replace(/[^\p{L}\p{N}' ]+/gu, ' ').split(/\s+/).filter((x) => x.length > 2 && !STOP.has(x));
      for (let i = 0; i < w.length; i++) { add(uni, w[i]); if (i + 1 < w.length) add(bi, w[i] + ' ' + w[i + 1]); }
    }
  }
  const pick = (m, min) => [...m.entries()].filter(([, c]) => c >= min).sort((a, b) => b[1] - a[1]).slice(0, top);
  return { unigrams: pick(uni, 2), bigrams: pick(bi, 2) };
}

async function playSearch(q, hl = 'en', gl = 'us') {
  const h = await fetchCached(`https://play.google.com/store/search?q=${encodeURIComponent(q)}&c=apps&hl=${hl}&gl=${gl}`, 'text');
  const ids = [...new Set([...h.matchAll(/\/store\/apps\/details\?id=([A-Za-z0-9_.]+)/g)].map((m) => m[1]))].slice(0, 10);
  const out = []; for (const id of ids) { try { out.push(await play(id, hl, gl)); } catch {} } return out;
}

// ---------- strategies ----------
const fmt = (n) => n == null ? '' : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(n);
const table = (rows, cols) => { if (!rows.length) return '(none)'; const head = `| ${cols.map((c) => c[0]).join(' | ')} |`, sep = `|${cols.map(() => '---').join('|')}|`; return [head, sep, ...rows.map((r) => `| ${cols.map((c) => String(c[1](r) ?? '')).join(' | ')} |`)].join('\n'); };
const COLS = [['#', (r) => r.rank ?? Object.values(r.ranks ?? {})[0] ?? ''], ['app', (r) => `[${r.name.slice(0, 40)}](${r.url})`], ['seller', (r) => r.seller?.slice(0, 24)], ['price', (r) => r.price ? r.price : 'free'], ['★', (r) => r.rating ?? ''], ['ratings', (r) => fmt(r.ratings)], ['updated', (r) => r.updatedDays != null ? r.updatedDays + 'd' : ''], ['langs', (r) => r.langs?.split(',').length ?? '']];

async function geoGap(a, b, genre, limit) {
  const src = await chartsUnion(a, genre, limit);
  const inB = Object.fromEntries((await lookup(src.map((r) => r.id), b)).map((r) => [String(r.trackId), r]));
  const langB = LANG_OF[b] ?? 'EN';
  return src.map((r) => { const t = inB[r.id]; const langs = (t?.languageCodesISO2A ?? []);
    const status = !t ? 'absent' : !langs.includes(langB) ? `no ${langB}` : (t.userRatingCount ?? 0) < r.ratings * 0.05 ? 'weak' : 'present';
    const score = status === 'present' ? 0 : Math.round(Math.log10(Math.max(10, r.ratings)) * 10 * (status === 'absent' ? 1.5 : status === 'weak' ? 1 : 1.2) + (r.updatedDays < 90 ? 5 : 0));
    return { ...r, status, ratingsB: t?.userRatingCount ?? 0, score }; }).filter((r) => r.status !== 'present').sort((x, y) => y.score - x.score);
}
async function zombies(country, genre, limit, months) {
  const rows = await chartsUnion(country, genre, limit); const terms = opt('--terms', '')?.split(',').filter(Boolean) ?? [];
  for (const t of terms) for (const r of await search(t, country, 50)) if (!rows.find((x) => x.id === String(r.trackId))) rows.push(row(r, { ranks: {} }));
  return rows.filter((r) => r.updatedDays > months * 30 && r.ratings >= 500).map((r) => ({ ...r, score: Math.round(Math.log10(r.ratings) * r.updatedDays / 100) })).sort((x, y) => y.score - x.score);
}
async function weak(country, genre, limit) {
  return (await chartsUnion(country, genre, limit)).filter((r) => r.rating != null && r.rating <= 3.9 && r.ratings >= 1000).map((r) => ({ ...r, score: Math.round((4.6 - r.rating) * Math.log10(r.ratings) * 10) })).sort((x, y) => y.score - x.score);
}
async function paidGaps(country, genre, limit) {
  const paid = (await chart(country, genre, 'paid', limit)).filter((r) => r.ratings >= 200); const out = [];
  const toks = (n) => n.toLowerCase().replace(/[™®:：|｜\-–(),.&+]/g, ' ').split(/\s+/).filter((t) => t.length > 2 && !/^(the|and|for|pro|app|plus|lite|hd|free|with|your)$/.test(t));
  for (const p of paid) {
    const t = toks(p.name); const term = t.slice(0, 2).join(' ') || p.name;
    const alts = (await search(term, country, 25)).filter((r) => String(r.trackId) !== p.id && !r.price && (!genre || r.primaryGenreId === genre) && toks(r.trackName).some((x) => t.includes(x)));
    const bestFree = alts.sort((x, y) => (y.userRatingCount ?? 0) - (x.userRatingCount ?? 0))[0];
    const ratio = bestFree ? (bestFree.userRatingCount ?? 0) / p.ratings : 0;
    out.push({ ...p, term, bestFree: bestFree ? `${bestFree.trackName.slice(0, 30)} (${fmt(bestFree.userRatingCount)})` : '—', freeRatio: +ratio.toFixed(2), score: Math.round(Math.log10(p.ratings) * 10 * (ratio < 0.2 ? 1.5 : ratio < 1 ? 1 : 0.3)) });
  }
  return out.sort((x, y) => y.score - x.score);
}

// ---------- output ----------
function emit(title, rows, cols, notes = '') {
  if (flag('--json')) return console.log(JSON.stringify(rows, null, 2));
  const md = `## ${title}\n\n${notes ? notes + '\n\n' : ''}${table(rows, cols)}\n`;
  if (opt('--out')) fs.appendFileSync(path.resolve(opt('--out')), md + '\n'); else console.log(md);
}
const genre = opt('--genre') ? Number(opt('--genre')) : undefined, country = opt('--country', 'us'), limit = Number(opt('--limit', 100));
const G = genre ? `${GENRES[genre] ?? genre}` : 'all';
const S = [['score', (r) => r.score], ...COLS];

switch (cmd) {
  case 'genres': console.log(Object.entries(GENRES).map(([k, v]) => `${k}  ${v}`).join('\n')); break;
  case 'charts': emit(`Top ${opt('--kind', 'grossing')} · ${country.toUpperCase()} · ${G}`, await chart(country, genre, opt('--kind', 'grossing'), limit), COLS); break;
  case 'search': emit(`Search "${pos[0]}" · ${country.toUpperCase()}`, (await search(pos[0], country, limit)).map((r) => row(r)), COLS); break;
  case 'geo-gap': { const [a, b] = pos; emit(`Geo gap ${a.toUpperCase()} → ${b.toUpperCase()} · ${G}`, await geoGap(a, b, genre, limit), [['score', (r) => r.score], ['status', (r) => r.status], ['ratings in B', (r) => fmt(r.ratingsB)], ...COLS], `Apps in ${a.toUpperCase()} top charts (grossing ∪ free ∪ paid) that are **absent** in ${b.toUpperCase()}, have **no ${LANG_OF[b] ?? 'EN'}** localisation, or are **weak** there (< 5 % of the ratings). Check demand in B with Google Trends before acting.`); break; }
  case 'zombies': emit(`Zombies · ${country.toUpperCase()} · ${G} · not updated > ${opt('--months', 18)} months`, await zombies(country, genre, limit, Number(opt('--months', 18))), S, 'Still charting / still searched, but the developer stopped shipping. Score = log10(ratings) × days stale. Read the latest reviews (Play side) for the complaints to fix.'); break;
  case 'weak': emit(`Weak incumbents · ${country.toUpperCase()} · ${G}`, await weak(country, genre, limit), S, 'Proven demand (≥ 1k ratings) with rating ≤ 3.9 — people want it and are unhappy. Mine the 1–3★ reviews for the top complaints.'); break;
  case 'paid-gaps': emit(`Paid → free gaps · ${country.toUpperCase()} · ${G}`, await paidGaps(country, genre, limit), [['score', (r) => r.score], ['best free alt', (r) => r.bestFree], ['free/paid ratings', (r) => r.freeRatio], ...COLS], 'Paid apps with ≥ 200 ratings whose strongest free alternative (same first search term) has far fewer ratings. Candidate for free + ads / freemium.'); break;
  case 'app': { const ccs = opt('--countries', 'us').split(','); const rows = []; for (const cc of ccs) { const r = (await lookup([pos[0]], cc))[0]; rows.push(r ? row(r, { country: cc }) : { country: cc, name: '(absent)', url: '' }); } emit(`App ${pos[0]} across storefronts`, rows, [['country', (r) => r.country], ...COLS.slice(1)]); break; }
  case 'complaints': {
    let pkg = pos[0]; if (/^\d+$/.test(pkg)) { const r = (await lookup([pkg], country))[0]; if (!r) { console.log('not found'); break; }
      const cands = await playSearch(r.trackName.split(/[:：\-–|｜(]/)[0].trim(), opt('--hl', 'en'), opt('--gl', 'us')); const best = cands.find((c) => c.developer && r.sellerName && c.developer.toLowerCase().split(/\W+/)[0] === r.sellerName.toLowerCase().split(/\W+/)[0]) ?? cands[0];
      if (!best) { console.log(`no Play twin found for "${r.trackName}" — platform gap? (scout play-search to check by hand)`); break; }
      console.log(`App Store ${r.trackName} (${r.sellerName}) → Play ${best.pkg} (${best.developer}, ${best.installs}, ${best.rating}★)\n`); pkg = best.pkg; }
    process.argv.push('--stars', '1,2,3'); args.push('--stars', '1,2,3'); pos[0] = pkg; // fall through to reviews
  }
  // eslint-disable-next-line no-fallthrough
  case 'reviews':
  {
    const stars = opt('--stars') ? opt('--stars').split(',').map(Number) : null; let rows = [];
    const o = { sort: opt('--sort', 'new'), hl: opt('--hl', 'en'), gl: opt('--gl', 'us') }, N = Number(opt('--n', 200));
    if (stars) for (const st of stars) rows.push(...await playReviews(pos[0], { ...o, n: Math.ceil(N / stars.length), stars: st })); else rows = await playReviews(pos[0], { ...o, n: N });
    rows.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
    if (flag('--json')) { console.log(JSON.stringify(rows, null, 2)); break; }
    const low = rows.filter((r) => r.score <= 3), kw = complaintKeywords(low.length ? low : rows);
    const dist = [1, 2, 3, 4, 5].map((k) => `${k}★ ${rows.filter((r) => r.score === k).length}`).join(' · ');
    const md = `## Play reviews · ${pos[0]} · ${rows.length} (${opt('--sort', 'new')})\n\n${dist}\n\n**Complaint keywords (≤ 3★)**: ${kw.bigrams.slice(0, 12).map(([k, c]) => `${k} (${c})`).join(', ')}\n\n${kw.unigrams.slice(0, 20).map(([k, c]) => `${k} ${c}`).join(' · ')}\n\n${table(rows.slice(0, Number(opt('--show', 40))), [['★', (r) => r.score], ['date', (r) => r.date], ['ver', (r) => r.version ?? ''], ['👍', (r) => r.thumbs], ['review', (r) => r.text.replace(/\|/g, '/').replace(/\s+/g, ' ').slice(0, 160)]])}\n`;
    if (opt('--out')) fs.appendFileSync(path.resolve(opt('--out')), md + '\n'); else console.log(md); break;
  }
  case 'play-search': emit(`Play search "${pos[0]}"`, await playSearch(pos[0], opt('--hl', 'en'), opt('--gl', 'us')), [['package', (r) => r.pkg], ['name', (r) => `[${r.name?.slice(0, 40)}](${r.url})`], ['dev', (r) => r.developer?.slice(0, 24)], ['installs', (r) => r.installs], ['★', (r) => r.rating], ['ratings', (r) => fmt(r.ratings)], ['updated', (r) => r.updatedDays != null ? r.updatedDays + 'd' : ''], ['ads', (r) => r.ads ? 'y' : ''], ['iap', (r) => r.iap ? 'y' : '']]); break;
  case 'play': { const p = await play(pos[0], opt('--hl', 'en'), opt('--gl', 'us')); if (flag('--json')) console.log(JSON.stringify(p, null, 2)); else console.log(Object.entries(p).map(([k, v]) => `${k.padEnd(10)} ${v}`).join('\n')); break; }
  case 'report': {
    const ccs = opt('--countries', 'jp,us').split(','), out = path.resolve(opt('--out', `scout-${G.replace(/\W+/g, '-').toLowerCase()}-${ccs.join('-')}.md`));
    fs.writeFileSync(out, `# app-scout · ${G} · ${ccs.map((c) => c.toUpperCase()).join(' / ')} · ${new Date().toISOString().slice(0, 10)}\n\nSources: iTunes lookup/search, iTunes RSS charts (top 100 grossing/free/paid). Ratings count growth is the only free volume proxy; downloads/revenue need AppFigures/AppMagic.\n\n`);
    args.push('--out', out);
    for (const cc of ccs) { fs.appendFileSync(out, `## Top grossing · ${cc.toUpperCase()}\n\n${table((await chart(cc, genre, 'grossing', 25)), COLS)}\n\n`); }
    for (let i = 0; i < ccs.length; i++) for (let j = 0; j < ccs.length; j++) if (i !== j) { const rows = (await geoGap(ccs[i], ccs[j], genre, limit)).slice(0, 25); fs.appendFileSync(out, `## Geo gap ${ccs[i].toUpperCase()} → ${ccs[j].toUpperCase()}\n\n${table(rows, [['score', (r) => r.score], ['status', (r) => r.status], ...COLS])}\n\n`); }
    for (const cc of ccs) {
      fs.appendFileSync(out, `## Zombies · ${cc.toUpperCase()}\n\n${table((await zombies(cc, genre, limit, 18)).slice(0, 20), S)}\n\n`);
      fs.appendFileSync(out, `## Weak incumbents · ${cc.toUpperCase()}\n\n${table((await weak(cc, genre, limit)).slice(0, 20), S)}\n\n`);
      fs.appendFileSync(out, `## Paid → free gaps · ${cc.toUpperCase()}\n\n${table((await paidGaps(cc, genre, 60)).slice(0, 15), [['score', (r) => r.score], ['best free alt', (r) => r.bestFree], ...COLS])}\n\n`);
    }
    console.log('→', path.relative(process.cwd(), out)); break;
  }
  default: console.log(fs.readFileSync(new URL(import.meta.url)).toString().split('\n').slice(1, 17).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
}
