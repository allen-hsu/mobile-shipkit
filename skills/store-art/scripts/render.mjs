#!/usr/bin/env node
// store-art renderer: manifest.json → HTML (style × layout) → PNG via Playwright.
//
//   node render.mjs manifest.json --out ./framed [--only 01,03] [--html] [--strict]
//   node render.mjs manifest.json --preview styles   # screen 1 in every style → preview-styles.png
//   node render.mjs manifest.json --preview layouts  # screen 1 in every layout → preview-layouts.png
//
// Manifest shape: see ../SKILL.md. A "style" is an HTML file in ../styles/<name>.html
// (background, typography, decorations, a .copy block and a {{{device}}} slot). A
// "layout" is one of LAYOUTS below (where the device sits). Styles × layouts are
// independent, so 6 styles × 8 layouts do not look alike.
//
// After every screenshot the page is measured against the quality bar
// (device height 68–82 % of canvas unless layout says otherwise, headline not
// overflowing); violations are printed, and fail the run with --strict.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const args = process.argv.slice(2);
const manifestPath = args.find((a) => !a.startsWith('--')) ?? 'manifest.json';
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const flag = (k) => args.includes(k);
const outDir = path.resolve(opt('--out', 'framed'));
const only = opt('--only', '')?.split(',').filter(Boolean);
fs.mkdirSync(outDir, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const mdir = path.dirname(path.resolve(manifestPath));
const frames = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/frames/frames.json'), 'utf8'));

// ---------- helpers ----------
const b64 = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
const resolveAsset = (p) => (path.isAbsolute(p) ? p : path.resolve(mdir, p));
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// ==word== → <em>word</em> (style decides what em looks like), \n → <br>
const rich = (s = '') => esc(s).replace(/==(.+?)==/g, '<em>$1</em>').replace(/\n/g, '<br>');

// Minimal mustache: {{a.b}} escaped+rich, {{{x}}} raw, {{#list}}…{{/list}}, {{^x}}…{{/x}}
function tpl(src, ctx) {
  const get = (k) => k.split('.').reduce((o, p) => (o == null ? undefined : o[p]), ctx);
  src = src.replace(/{{#(\w+(?:\.\w+)*)}}([\s\S]*?){{\/\1}}/g, (_, k, body) => {
    const v = get(k);
    if (Array.isArray(v)) return v.map((item, i) => tpl(body, { ...ctx, ...item, _i: i, _n: i + 1 })).join('');
    return v ? tpl(body, ctx) : '';
  });
  src = src.replace(/{{\^(\w+(?:\.\w+)*)}}([\s\S]*?){{\/\1}}/g, (_, k, body) => (get(k) ? '' : tpl(body, ctx)));
  src = src.replace(/{{{(\w+(?:\.\w+)*)}}}/g, (_, k) => get(k) ?? '');
  src = src.replace(/{{(\w+(?:\.\w+)*)}}/g, (_, k) => rich(get(k) ?? ''));
  return src;
}

// ---------- fonts ----------
// Google Fonts by default; `"fonts": { "local": "./fonts" }` in the manifest embeds
// every .ttf/.otf/.woff2 found there as @font-face (family = file stem) for offline/CI.
function fontsHead(brand) {
  const families = brand.fontFamilies ?? [
    'Inter:wght@400;600;700;800;900', 'Fraunces:opsz,wght@9..144,300..900', 'Noto+Sans+TC:wght@400;700;900',
    'Noto+Sans+JP:wght@400;700;900', 'Noto+Serif+TC:wght@600;900', 'Space+Grotesk:wght@500;700', 'DM+Sans:wght@400;600;800',
    'Caveat:wght@600;700', 'Nunito:wght@700;900', 'Archivo+Black', 'JetBrains+Mono:wght@500;700', 'Fraunces:ital,opsz,wght@1,9..144,700',
  ];
  let head = '';
  if (brand.fonts?.local) {
    const dir = resolveAsset(brand.fonts.local);
    for (const f of fs.readdirSync(dir)) {
      const ext = path.extname(f).slice(1);
      if (!['ttf', 'otf', 'woff2', 'woff'].includes(ext)) continue;
      const fam = path.basename(f, path.extname(f)).replace(/[-_](Regular|Bold|Black|Medium|SemiBold|Light)$/i, '');
      const w = /Black/i.test(f) ? 900 : /Bold/i.test(f) ? 700 : /SemiBold/i.test(f) ? 600 : /Medium/i.test(f) ? 500 : /Light/i.test(f) ? 300 : 400;
      const mime = ext === 'ttf' ? 'font/ttf' : ext === 'otf' ? 'font/otf' : `font/${ext}`;
      head += `@font-face{font-family:'${fam}';font-weight:${w};src:url(data:${mime};base64,${fs.readFileSync(path.join(dir, f)).toString('base64')})}\n`;
    }
    return `<style>${head}</style>`;
  }
  return `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?${families.map((f) => 'family=' + f).join('&')}&display=block" rel="stylesheet">`;
}

// ---------- layouts (device placement; all coordinates for a 1320×2868 canvas) ----------
// `copy`: where the text block goes. `css`: transform applied to .device (1470×3000 frame,
// transform-origin top left, left/top set here). `expect`: device-height ratio range.
export const LAYOUTS = {
  // --- framed device, position only ---
  'bleed-bottom': { copy: 'top', css: 'left:50%;top:1010px;transform:translateX(-50%) scale(.92)', expect: [0.6, 0.75] },
  'bleed-top':    { copy: 'bottom', css: 'left:50%;top:-900px;transform:translateX(-50%) scale(.92)', expect: [0.6, 0.75] },
  'float':        { copy: 'top', css: 'left:50%;top:1000px;transform:translateX(-50%) scale(.6)', shadow: true, expect: [0.58, 0.7] },
  'tilt-left':    { copy: 'top', css: 'left:50%;top:1160px;transform:translateX(-50%) rotate(-7deg) scale(.92)', shadow: true, expect: [0.55, 0.8] },
  'tilt-right':   { copy: 'top', css: 'left:50%;top:1160px;transform:translateX(-50%) rotate(7deg) scale(.92)', shadow: true, expect: [0.55, 0.8] },
  'two-up':       { copy: 'top', css: 'left:-170px;top:1150px;transform:scale(.52)', second: 'left:305px;top:1000px;transform:scale(.52)', shadow: true, expect: [0.5, 0.7] },
  'hero':         { copy: 'none', css: 'left:50%;top:200px;transform:translateX(-50%) scale(.84)', shadow: true, expect: [0.8, 0.92] },
  'peek-sides':   { copy: 'top', kind: 'peek', css: 'left:-560px;top:1050px;transform:rotate(6deg) scale(.72)', second: 'left:890px;top:1000px;transform:rotate(-6deg) scale(.72)', shadow: true, expect: [0.45, 0.7] },
  'split-right':  { copy: 'right', css: 'left:-640px;top:380px;transform:scale(.8)', shadow: true, allowOverlap: true, expect: [0.75, 0.9] },
  // --- panorama: same device across 2 tiles, rendered wide and clipped ---
  'panorama':     { copy: 'top', css: 'left:50%;top:1160px;transform:translateX(-50%) rotate(-8deg) scale(1.3)', shadow: true, span: 2, expect: [0.6, 1] },
  // --- frameless: the screenshot itself as a rounded card ---
  'frameless-bleed': { copy: 'top', kind: 'frameless', css: 'left:50%;top:980px;transform:translateX(-50%) scale(.86)', shadow: true, expect: [0.6, 0.72] },
  'card-stack':   { copy: 'top', kind: 'stack', css: 'left:50%;top:1060px;transform:translateX(-50%) rotate(-5deg) scale(.7)', second: 'left:50%;top:1120px;transform:translateX(-50%) rotate(6deg) scale(.66)', shadow: true, expect: [0.55, 0.75] },
  'mosaic':       { copy: 'top', kind: 'mosaic', shadow: true, expect: [0.45, 0.75],
                    css: 'left:50%;top:1180px;transform:translateX(-50%) rotate(-4deg) scale(.62)',
                    second: 'left:-140px;top:1320px;transform:rotate(-12deg) scale(.5)',
                    third: 'left:760px;top:1280px;transform:rotate(10deg) scale(.5)' },
  // --- crop / zoom: show the part of the UI the headline is about ---
  'crop-zoom':    { copy: 'top', kind: 'crop', css: 'left:50%;top:960px;transform:translateX(-50%)', shadow: true, expect: [0.35, 0.75] },
  'callout':      { copy: 'top', kind: 'callout', css: 'left:50%;top:1080px;transform:translateX(-50%) scale(.88)', shadow: true, expect: [0.55, 0.75] },
};

function deviceHTML(screen, frame, extraCss = '', shotKey = 'shot') {
  const shot = screen[shotKey] ?? screen.shot;
  if (!shot) return '';
  const sc = frame.screen;
  return `<div class="device" style="${extraCss}">
    <img class="shot" src="${b64(resolveAsset(shot))}" style="left:${sc.x}px;top:${sc.y}px;width:${sc.w}px;height:${sc.h}px;border-radius:${sc.radius}px">
    <img class="frame" src="${b64(path.join(ROOT, 'assets/frames', frame.file))}">
  </div>`;
}
// frameless card: the screenshot itself, rounded, 1320×2868 box
function cardHTML(screen, frame, extraCss = '', shotKey = 'shot') {
  const shot = screen[shotKey] ?? screen.shot;
  if (!shot) return '';
  const sc = frame.screen;
  return `<div class="device card" style="width:${sc.w}px;height:${sc.h}px;${extraCss}"><img class="shot" src="${b64(resolveAsset(shot))}" style="left:0;top:0;width:100%;height:100%;border-radius:96px"></div>`;
}
// crop card: a region of the screenshot, magnified. crop = {x,y,w,h} in screenshot px.
function cropHTML(screen, frame, extraCss = '', width = 1120) {
  const sc = frame.screen;
  const c = screen.crop ?? { x: 0, y: 0, w: sc.w, h: Math.round(sc.w * 1.3) };
  const k = width / c.w, h = Math.round(c.h * k);
  return `<div class="device crop" style="width:${width}px;height:${h}px;${extraCss}"><img class="shot" src="${b64(resolveAsset(screen.shot))}" style="left:${-c.x * k}px;top:${-c.y * k}px;width:${sc.w * k}px;height:${sc.h * k}px"></div>`;
}
// callout bubble: circular magnifier over a point of the screenshot. focus = {x,y} in screenshot px, zoom factor
function bubbleHTML(screen, frame, size = 560, zoom = 2.2) {
  const sc = frame.screen;
  const f = screen.focus ?? { x: sc.w / 2, y: sc.h / 2 };
  const pos = screen.bubble ?? { right: '70px', top: '1180px' };
  const style = Object.entries(pos).map(([k, v]) => `${k}:${v}`).join(';');
  return `<div class="bubble" style="width:${size}px;height:${size}px;${style}"><img src="${b64(resolveAsset(screen.shot))}" style="position:absolute;left:${size / 2 - f.x * zoom}px;top:${size / 2 - f.y * zoom}px;width:${sc.w * zoom}px;height:${sc.h * zoom}px"></div>`;
}

function composeDevices(screen, layout, frame) {
  const shadow = layout.shadow ? 'filter:drop-shadow(0 60px 90px rgba(0,0,0,.45));' : '';
  const css = (k) => `${layout[k]};${shadow}`;
  switch (layout.kind) {
    case 'frameless': return cardHTML(screen, frame, css('css'));
    case 'stack': return cardHTML(screen, frame, css('second') + 'z-index:1;opacity:.92', 'shot2') + cardHTML(screen, frame, css('css'));
    case 'mosaic': return cardHTML(screen, frame, css('second') + 'z-index:1', 'shot2') + cardHTML(screen, frame, css('third') + 'z-index:1', 'shot3') + cardHTML(screen, frame, css('css') + 'z-index:2');
    case 'crop': return cropHTML(screen, frame, css('css'));
    case 'callout': return deviceHTML(screen, frame, css('css')) + bubbleHTML(screen, frame);
    case 'peek': return deviceHTML(screen, frame, css('css')) + deviceHTML(screen, frame, css('second'), 'shot2');
    default: return deviceHTML(screen, frame, css('css')) + (layout.second && screen.shot2 ? deviceHTML(screen, frame, css('second'), 'shot2') : '');
  }
}

function buildHTML(screen, brand, styleSrc, layout, frame, canvas) {
  const copyPos = screen.copy ?? layout.copy;
  const device = composeDevices(screen, layout, frame);
  const brandCss = ['bg', 'ink', 'accent', 'accent2'].filter((k) => brand[k]).map((k) => `--${k}:${brand[k]};`).join('');
  const ctx = {
    ...brand, ...screen,
    brand, brandCss, canvas, layoutName: screen.layout, copyPos,
    titleSize: screen.titleSize ?? brand.titleSize ?? (canvas.h < 1000 ? 62 : copyPos === 'right' ? 104 : 150),
    device,
    bgImage: screen.bgImage ? b64(resolveAsset(screen.bgImage)) : (brand.bgImage ? b64(resolveAsset(brand.bgImage)) : ''),
    fontsHead: fontsHead(brand),
    baseCss: `*{margin:0;box-sizing:border-box}html,body{width:${canvas.w}px;height:${canvas.h}px;overflow:hidden}body{position:relative}
      .device{position:absolute;width:${frame.width}px;height:${frame.height}px;transform-origin:top center;z-index:2}
      .device .frame{position:absolute;inset:0;width:100%;height:100%}
      .device .shot{position:absolute;object-fit:cover}
      .copy{position:absolute;z-index:3;left:var(--pad,110px);right:var(--pad,110px)}
      .copy.top{top:var(--copy-top,180px)} .copy.bottom{bottom:var(--copy-bottom,180px)} .copy.none{display:none}
      .copy.center{text-align:center}
      .copy.right{top:50%;left:49%;right:70px;transform:translateY(-50%);text-align:left}
      .device.card{overflow:hidden;border-radius:96px;background:#000}
      .device.card .shot{position:absolute;object-fit:cover}
      .device.crop{overflow:hidden;border-radius:64px;background:#000;box-shadow:0 50px 90px rgba(0,0,0,.35)}
      .device.crop .shot{position:absolute}
      .bubble{position:absolute;z-index:4;border-radius:50%;overflow:hidden;border:10px solid #fff;box-shadow:0 40px 80px rgba(0,0,0,.45)}
      ${canvas.span > 1 ? `.copy{right:auto;width:calc(${canvas.tile}px - 2 * var(--pad,110px))}` : ''}`,
  };
  return tpl(styleSrc, ctx);
}

// ---------- preview fan-out ----------
const preview = opt('--preview', null); // 'styles' | 'layouts'
if (preview) {
  // Take the first screen (or --only) and fan it out so a human can pick.
  const base = manifest.screens.find((sc) => !only.length || only.some((o) => (sc.id ?? '').startsWith(o))) ?? manifest.screens[0];
  const stylesDir = path.join(ROOT, 'styles');
  const names = preview === 'styles'
    ? fs.readdirSync(stylesDir).filter((f) => f.endsWith('.html') && f !== 'feature-graphic.html').map((f) => f.replace('.html', ''))
    : Object.keys(LAYOUTS);
  manifest.screens = names.map((n) => {
    const sc = { ...base, shot2: base.shot2 ?? base.shot, shot3: base.shot3 ?? base.shot2 ?? base.shot, id: n, span: preview === 'layouts' && n === 'panorama' ? 2 : 1 };
    if (preview === 'styles') { sc.style = n; delete sc.layout; delete manifest.layout; } else sc.layout = n;
    return sc;
  });
  only.length = 0;
}

// ---------- main ----------
const browser = await chromium.launch();
const brand = manifest.brand ?? {};
const frame = frames[manifest.frame ?? 'iphone-16-pro-max'];
const report = [];
let failures = 0;
const t0 = Date.now();

for (let i = 0; i < manifest.screens.length; i++) {
  const screen = { ...manifest.screens[i] };
  const id = screen.id ?? String(i + 1).padStart(2, '0');
  if (only.length && !only.some((o) => id.startsWith(o))) continue;
  const styleName = screen.style ?? manifest.style ?? 'editorial-light';
  const styleSrc0 = fs.readFileSync(path.join(ROOT, 'styles', styleName + '.html'), 'utf8');
  const defLayout = (styleSrc0.match(/<!--\s*default-layout:\s*([\w-]+)\s*-->/) || [])[1];
  let layoutName = screen.layout ?? manifest.layout ?? defLayout ?? 'bleed-bottom';
  if (!LAYOUTS[layoutName]) { console.error(`unknown layout ${layoutName}; have ${Object.keys(LAYOUTS).join(', ')}`); process.exit(2); }
  const stylePath = path.join(ROOT, 'styles', styleName + '.html');
  if (!fs.existsSync(stylePath)) { console.error(`unknown style ${styleName}; have ${fs.readdirSync(path.join(ROOT, 'styles')).map((f) => f.replace('.html', '')).join(', ')}`); process.exit(2); }
  // a style may restrict which layouts make sense for it: <!-- layouts: float,hero -->
  const lim = styleSrc0.match(/<!--\s*layouts:\s*([\w,\- ]+)-->/);
  if (lim) {
    const allowed = lim[1].split(',').map((x) => x.trim()).filter(Boolean);
    if (!allowed.includes(layoutName)) {
      console.log(`ℹ ${id}  ${styleName} does not support layout ${layoutName}; using ${allowed[0]} (supports: ${allowed.join(', ')})`);
      layoutName = allowed[0];
    }
  }
  const layout = LAYOUTS[layoutName];
  const size = screen.size ?? manifest.size ?? [1320, 2868];
  const span = layout.span && screen.span !== 1 ? (screen.span ?? layout.span) : 1;
  const canvas = { w: size[0] * span, h: size[1], tile: size[0], span };
  screen.layout = layoutName;
  if (span > 1) {
    // panorama: titles per tile come from screen.tiles[] (title/subtitle/badge each)
    screen.panoTiles = (screen.tiles ?? [screen]).map((t, k) => ({ ...t, left: k * size[0], width: size[0] }));
  }

  const styleSrc = styleSrc0;
  // <!-- device-offset: 120 --> pushes the device down (px) for styles whose copy block is taller
  const off = styleSrc.match(/<!--\s*device-offset:\s*(-?\d+)\s*-->/);
  const layoutUsed = off ? { ...layout, css: layout.css.replace(/top:(-?\d+)px/, (_, t) => `top:${Number(t) + Number(off[1])}px`) } : layout;
  // a style that positions the device itself can declare its own device-height range
  const exp = styleSrc.match(/<!--\s*expect:\s*([\d.]+)-([\d.]+)\s*-->/);
  const expect = exp ? [Number(exp[1]), Number(exp[2])] : layout.expect;
  const html = buildHTML(screen, brand, styleSrc, layoutUsed, frame, canvas);
  if (flag('--html')) fs.writeFileSync(path.join(outDir, `${id}.html`), html);

  const page = await browser.newPage({ viewport: { width: canvas.w, height: canvas.h }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // quality bar
  const q = await page.evaluate(() => {
    const H = document.documentElement.clientHeight, W = document.documentElement.clientWidth;
    const dev = document.querySelector('.device');
    let devRatio = null;
    if (dev) {
      const r = dev.getBoundingClientRect();
      const visible = Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0));
      devRatio = visible / H;
    }
    const h1 = document.querySelector('.copy h1, h1');
    const overflow = h1 ? (h1.scrollWidth > h1.clientWidth + 2 || h1.getBoundingClientRect().right > W || h1.getBoundingClientRect().left < 0) : false;
    const copy = document.querySelector('.copy');
    const cr = copy ? copy.getBoundingClientRect() : null;
    const copyDevOverlap = dev && cr ? Math.max(0, Math.min(cr.bottom, dev.getBoundingClientRect().bottom) - Math.max(cr.top, dev.getBoundingClientRect().top)) : 0;
    return { devRatio, overflow, copyDevOverlap, copyBottom: cr?.bottom ?? 0 };
  });
  const issues = [];
  if (canvas.h >= 1000 && q.devRatio != null && (q.devRatio < expect[0] || q.devRatio > expect[1]))
    issues.push(`device occupies ${(q.devRatio * 100).toFixed(0)}% of canvas height (want ${Math.round(expect[0] * 100)}–${Math.round(expect[1] * 100)}%)`);
  if (q.overflow) issues.push('headline overflows horizontally — shorten or add a line break');
  if (q.copyDevOverlap > 40 && layout.copy !== 'none' && !layout.allowOverlap) issues.push(`copy overlaps device by ${q.copyDevOverlap.toFixed(0)}px`);

  if (span > 1) {
    for (let k = 0; k < span; k++) {
      const file = path.join(outDir, `${id}-${k + 1}.png`);
      await page.screenshot({ path: file, clip: { x: k * size[0], y: 0, width: size[0], height: size[1] } });
      report.push({ id: `${id}-${k + 1}`, file, style: styleName, layout: layoutName, issues });
    }
  } else {
    const file = path.join(outDir, `${id}.png`);
    await page.screenshot({ path: file });
    report.push({ id, file, style: styleName, layout: layoutName, issues });
  }
  await page.close();
  const mark = issues.length ? '⚠' : '✓';
  console.log(`${mark} ${id}  ${styleName} × ${layoutName}${issues.length ? '\n    - ' + issues.join('\n    - ') : ''}`);
  if (issues.length) failures++;
}
if (preview) {
  // contact sheet via the same browser: one labelled tile per rendered file
  const page = await browser.newPage({ viewport: { width: 1, height: 1 }, deviceScaleFactor: 1 });
  const tiles = report.map((r) => `<figure><img src="${b64(r.file)}"><figcaption>${r.id}${r.issues.length ? ' ⚠' : ''}</figcaption></figure>`).join('');
  const cols = Math.min(report.length, 6);
  const tw = 300, th = Math.round(tw * (report[0] ? 2868 / 1320 : 2));
  await page.setContent(`<style>body{margin:0;background:#151515;font:600 22px/1.3 -apple-system,Helvetica,sans-serif;color:#fff}
    .g{display:grid;grid-template-columns:repeat(${cols},${tw}px);gap:18px;padding:18px}
    figure{margin:0}img{width:${tw}px;height:${th}px;object-fit:cover;border-radius:14px;display:block}figcaption{padding:8px 2px 0}</style><div class="g">${tiles}</div>`);
  const sheet = path.join(outDir, `preview-${preview}.png`);
  await page.screenshot({ path: sheet, fullPage: true });
  await page.close();
  console.log(`preview sheet → ${sheet}`);
}
await browser.close();
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(`${report.length} image(s) in ${Date.now() - t0} ms → ${outDir}${failures ? `  (${failures} with quality warnings)` : ''}`);
if (failures && flag('--strict')) process.exit(1);
