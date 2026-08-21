#!/usr/bin/env node
// Render the house deck (examples/house-deck/deck.json) in every style and tile the result:
//   node scripts/catalog.mjs                      → catalog/catalog-1.png … (10 styles per sheet, 5 screens each)
//   node scripts/catalog.mjs --deck my/deck.json  → your own deck instead of the house deck
//   node scripts/catalog.mjs --styles a,b,c       → only these styles
//   node scripts/catalog.mjs --platform android   → Play version (frameless)
// Use it after adding or tuning a style: the sheet is the review surface, not the single-screen preview.
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url'; import { chromium } from 'playwright';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '..');
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const deckPath = path.resolve(opt('--deck', path.join(ROOT, 'examples/house-deck/deck.json')));
const outDir = path.resolve(opt('--out', 'catalog')); const per = Number(opt('--per-sheet', 10)); const tileW = Number(opt('--tile', 520));
const platform = opt('--platform', 'ios');
const all = fs.readdirSync(path.join(ROOT, 'styles')).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')).sort();
const styles = opt('--styles') ? opt('--styles').split(',') : all;
const deck = JSON.parse(fs.readFileSync(deckPath, 'utf8')); const deckDir = path.dirname(deckPath);
fs.mkdirSync(path.join(outDir, 'manifests'), { recursive: true });
const rendered = [];
for (const s of styles) {
  const m = { ...deck, style: s, platform }; delete m._comment;
  for (const sc of m.screens) { delete sc.style; for (const k of ['shot', 'shot2', 'shot3', 'shot4', 'bgImage']) if (sc[k]) sc[k] = path.resolve(deckDir, sc[k]); }
  const mp = path.join(outDir, 'manifests', `${s}.json`); fs.writeFileSync(mp, JSON.stringify(m, null, 1));
  const od = path.join(outDir, 'out', s);
  try { execFileSync('node', [path.join(HERE, 'render.mjs'), mp, '--out', od, '--platform', platform], { stdio: 'pipe' }); }
  catch (e) { console.log('✖', s, String(e.stdout ?? e.message).split('\n').filter((l) => /✖|rror/.test(l)).join(' | ')); continue; }
  const files = fs.readdirSync(od).filter((f) => f.endsWith('.png')).sort().map((f) => path.join(od, f));
  rendered.push({ s, files }); console.log('✓', s);
}
// tile
const b64 = (p) => `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`;
const browser = await chromium.launch();
const sheets = [];
for (let i = 0; i < rendered.length; i += per) {
  const part = rendered.slice(i, i + per), n = sheets.length + 1;
  const rows = part.map(({ s, files }, k) => `<div class="row"><div class="lab">${String(i + k + 1).padStart(2, '0')}<br><b>${s}</b></div>${files.map((f) => `<img src="${b64(f)}" style="width:${tileW}px">`).join('')}</div>`).join('');
  const html = `<body style="margin:0;background:#161616;color:#ddd;font:20px/1.3 -apple-system,Inter,sans-serif"><style>.row{display:flex;gap:12px;align-items:center;padding:12px}.lab{width:220px;flex:none;font-size:22px}.lab b{font-size:26px;color:#fff}</style>${rows}</body>`;
  const page = await browser.newPage({ viewport: { width: 220 + 12 + (tileW + 12) * 5 + 12, height: 800 } });
  await page.setContent(html); const file = path.join(outDir, `catalog-${n}.png`); await page.screenshot({ path: file, fullPage: true }); await page.close();
  sheets.push(file); console.log('→', file, `(${part.map((p) => p.s).join(', ')})`);
}
await browser.close();
