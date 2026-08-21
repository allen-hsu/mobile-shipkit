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
const b64 = (p) => {
  if (!fs.existsSync(p)) { console.error(`✖ missing asset: ${p}\n  (screenshots go in raw/, user-supplied illustrations / stickers / photos / logos in assets/ — see SKILL.md "Your assets")`); process.exit(4); }
  const ext = path.extname(p).slice(1).toLowerCase();
  const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';
  return `data:${mime};base64,` + fs.readFileSync(p).toString('base64');
};
const resolveAsset = (p) => (path.isAbsolute(p) ? p : path.resolve(mdir, p));
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// ==word== → <em>word</em> (style decides what em looks like), \n → <br>
const rich = (s = '') => esc(s).replace(/==(.+?)==/g, '<em>$1</em>').replace(/::(.+?)::/g, '<mark>$1</mark>').replace(/\n/g, '<br>');

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
  'bleed-bottom': { copy: 'top', css: 'left:50%;top:1010px;transform:translateX(-50%) scale(.92)', expect: [0.55, 0.75] },
  'bleed-top':    { copy: 'bottom', css: 'left:50%;top:-900px;transform:translateX(-50%) scale(.92)', expect: [0.55, 0.75] },
  'float':        { copy: 'top', css: 'left:50%;top:1000px;transform:translateX(-50%) scale(.6)', shadow: true, expect: [0.58, 0.7] },
  'tilt-left':    { copy: 'top', css: 'left:50%;top:1060px;transform:translateX(-50%) rotate(-7deg) scale(.92)', shadow: true, expect: [0.55, 0.8] },
  'tilt-right':   { copy: 'top', css: 'left:50%;top:1060px;transform:translateX(-50%) rotate(7deg) scale(.92)', shadow: true, expect: [0.55, 0.8] },
  'two-up':       { copy: 'top', css: 'left:-170px;top:1150px;transform:scale(.52)', second: 'left:305px;top:1000px;transform:scale(.52)', shadow: true, expect: [0.5, 0.7] },
  'hero':         { copy: 'none', css: 'left:50%;top:200px;transform:translateX(-50%) scale(.84)', shadow: true, expect: [0.8, 0.92] },
  'peek-sides':   { copy: 'top', kind: 'peek', css: 'left:-700px;top:1080px;transform:rotate(6deg) scale(.72)', second: 'left:560px;top:1000px;transform:rotate(-6deg) scale(.72)', shadow: true, expect: [0.45, 0.75] },
  'split-right':  { copy: 'right', css: 'left:-640px;top:380px;transform:scale(.8)', shadow: true, allowOverlap: true, expect: [0.75, 0.9] },
  // --- sandwich: two frameless cards bleeding top and bottom, copy in the middle (#29) ---
  'sandwich':     { copy: 'middle', kind: 'stack', css: 'left:50%;top:1650px;transform:translateX(-50%) scale(.8)', second: 'left:50%;top:-1250px;transform:translateX(-50%) scale(.8)', shadow: true, allowOverlap: true, expect: [0.3, 0.85] },
  // --- no device at all: headline + elements (illustration, stats, logos, quote) ---
  'no-device':    { copy: 'top', kind: 'none', expect: [0, 1] },
  'quote':        { copy: 'none', kind: 'none', expect: [0, 1] },
  // --- 3D: perspective angles (CSS 3D on the flat bezel; reads as a turned device) ---
  'persp-left':   { copy: 'top', css: 'left:50%;top:1000px;transform:translateX(-50%) perspective(4000px) rotateY(26deg) scale(.9)', shadow: true, expect: [0.55, 0.8] },
  'persp-right':  { copy: 'top', css: 'left:50%;top:1000px;transform:translateX(-50%) perspective(4000px) rotateY(-26deg) scale(.9)', shadow: true, expect: [0.55, 0.8] },
  'lean-back':    { copy: 'top', css: 'left:50%;top:1040px;transform:translateX(-50%) perspective(3600px) rotateX(22deg) scale(.95)', shadow: true, expect: [0.5, 0.8] },
  'iso-pair':     { copy: 'top', css: 'left:-120px;top:1150px;transform:perspective(4000px) rotateY(30deg) scale(.58)', second: 'left:400px;top:1040px;transform:perspective(4000px) rotateY(30deg) scale(.58)', shadow: true, expect: [0.45, 0.7] },
  // --- panorama: same device across 2 tiles, rendered wide and clipped ---
  'panorama':     { copy: 'top', css: 'left:50%;top:1000px;transform:translateX(-50%) rotate(-8deg) scale(1.3)', shadow: true, span: 2, expect: [0.6, 1] },
  // --- frameless: the screenshot itself as a rounded card ---
  'frameless-bleed': { copy: 'top', kind: 'frameless', css: 'left:50%;top:980px;transform:translateX(-50%) scale(.86)', shadow: true, expect: [0.55, 0.72] },
  'card-stack':   { copy: 'top', kind: 'stack', css: 'left:50%;top:1060px;transform:translateX(-50%) rotate(-5deg) scale(.7)', second: 'left:50%;top:1120px;transform:translateX(-50%) rotate(6deg) scale(.66)', shadow: true, expect: [0.5, 0.75] },
  'frameless-top': { copy: 'bottom', kind: 'frameless', css: 'left:50%;top:-860px;transform:translateX(-50%) scale(.86)', shadow: true, expect: [0.5, 0.72] },
  // scatter: four small frameless cards thrown across the canvas (Artsy-style collage); copy at the bottom
  'scatter':      { copy: 'bottom', kind: 'scatter', shadow: true, expect: [0.25, 0.7],
                    css: 'left:-520px;top:120px;transform:rotate(-18deg) scale(.34)',
                    second: 'left:300px;top:-160px;transform:rotate(14deg) scale(.34)',
                    third: 'left:-260px;top:900px;transform:rotate(22deg) scale(.3)',
                    fourth: 'left:480px;top:760px;transform:rotate(-12deg) scale(.32)' },
  'mosaic':       { copy: 'top', kind: 'mosaic', shadow: true, expect: [0.3, 0.75],
                    // triptych: three equal frameless cards side by side, middle raised, no overlap
                    css: 'left:50%;top:1080px;transform:translateX(-50%) scale(.31)',
                    second: 'left:-436px;top:1180px;transform:rotate(-4deg) scale(.31)',
                    third: 'left:436px;top:1180px;transform:rotate(4deg) scale(.31)' },
  // --- crop / zoom: show the part of the UI the headline is about ---
  'crop-zoom':    { copy: 'top', kind: 'crop', css: 'left:50%;top:960px;transform:translateX(-50%)', shadow: true, expect: [0.35, 0.75] },
  'callout':      { copy: 'top', kind: 'callout', css: 'left:50%;top:1080px;transform:translateX(-50%) scale(.88)', shadow: true, expect: [0.55, 0.75] },
};

function deviceHTML(screen, frame, extraCss = '', shotKey = 'shot') {
  const shot = screen[shotKey] ?? screen.shot;
  if (!shot) return '';
  const sc = frame.screen;
  const z = (1470 / frame.width).toFixed(4);
  return `<div class="device" style="zoom:${z};width:${frame.width}px;height:${frame.height}px;${extraCss}">
    <img class="shot" src="${b64(resolveAsset(shot))}" style="left:${sc.x}px;top:${sc.y}px;width:${sc.w}px;height:${sc.h}px;border-radius:${sc.radius}px">
    <img class="frame" src="${b64(path.join(ROOT, 'assets/frames', frame.file))}">
  </div>`;
}
// frameless card: the screenshot itself, rounded, 1320×2868 box
function cardHTML(screen, frame, extraCss = '', shotKey = 'shot') {
  const shot = screen[shotKey] ?? screen.shot3 ?? screen.shot2 ?? screen.shot;
  if (!shot) return '';
  const sc = frame.screen;
  const z = (1320 / sc.w).toFixed(4);
  return `<div class="device card" style="zoom:${z};width:${sc.w}px;height:${sc.h}px;${extraCss}"><img class="shot" src="${b64(resolveAsset(shot))}" style="left:0;top:0;width:100%;height:100%;border-radius:96px"></div>`;
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

// ---------- elements: floating UI fragments, stamps, stats, logos, quotes, stickers ----------
// screen.elements = [{ type, at:{x,y} (px or %), ... }]. Rendered above the device (z 4).
function elementsHTML(screen, frame) {
  const sc = frame.screen;
  const pos = (e) => `left:${typeof e.at?.x === 'number' ? e.at.x + 'px' : (e.at?.x ?? '50%')};top:${typeof e.at?.y === 'number' ? e.at.y + 'px' : (e.at?.y ?? '50%')};` +
    `transform:translate(-50%,-50%) rotate(${e.rotate ?? 0}deg);`;
  return (screen.elements ?? []).map((e) => {
    switch (e.type) {
      case 'crop': { // a piece of the UI lifted out of the screenshot, e.g. a card or a row
        const c = e.crop, w = e.width ?? 700, k = w / c.w, h = Math.round(c.h * k);
        const src = e.shot ?? screen.shot;
        return `<div class="el el-crop" style="${pos(e)}width:${w}px;height:${h}px;border-radius:${e.radius ?? 40}px"><img src="${b64(resolveAsset(src))}" style="position:absolute;left:${-c.x * k}px;top:${-c.y * k}px;width:${sc.w * k}px;height:${sc.h * k}px"></div>`;
      }
      case 'image': // sticker, 3D icon, illustration, photo (PNG/JPG/SVG); width in px
        return `<img class="el el-image" src="${b64(resolveAsset(e.file))}" style="${pos(e)}width:${e.width ?? 300}px;${e.shadow === false ? 'filter:none;' : ''}">`;
      case 'stamp': // proof badge: laurel | circle | pill
        return `<div class="el el-stamp ${e.kind ?? 'laurel'}" style="${pos(e)}${e.size ? `font-size:${e.size}px;` : ''}"><span class="k">${rich(e.value ?? '')}</span>${e.label ? `<span class="v">${rich(e.label)}</span>` : ''}</div>`;
      case 'stars': { const r = Math.max(0, Math.min(5, Number(e.rating ?? 5))); const full = Math.round(r);
        return `<div class="el el-stars" style="${pos(e)}"><span class="s">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</span>${e.label ? `<span class="v">${rich(e.label)}</span>` : ''}</div>`; }
      case 'stat': // one big number with a small label
        return `<div class="el el-stat" style="${pos(e)}${e.size ? `font-size:${e.size}px;` : ''}"><span class="k">${rich(e.value ?? '')}</span><span class="v">${rich(e.label ?? '')}</span></div>`;
      case 'logos': // press / brand logo row or grid
        return `<div class="el el-logos" style="${pos(e)}width:${e.width ?? 1000}px;grid-template-columns:repeat(${e.cols ?? Math.min(3, e.files.length)},1fr)">${e.files.map((f) => `<img src="${b64(resolveAsset(f))}">`).join('')}</div>`;
      case 'quote': // testimonial card
        return `<div class="el el-quote" style="${pos(e)}width:${e.width ?? 1000}px"><div class="q">“</div><p>${rich(e.text ?? '')}</p><div class="who">${e.avatar ? `<img src="${b64(resolveAsset(e.avatar))}">` : ''}<span><b>${esc(e.author ?? '')}</b>${e.role ? `<i>${esc(e.role)}</i>` : ''}</span></div></div>`;
      case 'features': // icon + label grid (emoji or image icons)
        return `<div class="el el-features" style="${pos(e)}width:${e.width ?? 1000}px;grid-template-columns:repeat(${e.cols ?? 2},1fr)">${e.items.map((it) => `<div><span class="ic">${/\.(png|jpg|jpeg|svg)$/i.test(it.icon ?? '') ? `<img src="${b64(resolveAsset(it.icon))}">` : esc(it.icon ?? '')}</span><span>${rich(it.label)}</span></div>`).join('')}</div>`;
      case 'text': // free text block (small caption, footnote, list)
        return `<div class="el el-text" style="${pos(e)}width:${e.width ?? 900}px;${e.size ? `font-size:${e.size}px;` : ''}${e.align ? `text-align:${e.align};` : ''}">${rich(e.text ?? '')}</div>`;
      default: return '';
    }
  }).join('');
}

function composeDevices(screen, layout, frame) {
  const shadow = layout.shadow ? 'filter:drop-shadow(0 60px 90px rgba(0,0,0,.45));' : '';
  const css = (k) => `${layout[k]};${shadow}`;
  switch (layout.kind) {
    case 'frameless': return cardHTML(screen, frame, css('css'));
    case 'stack': return cardHTML(screen, frame, css('second') + 'z-index:1;opacity:.92', 'shot2') + cardHTML(screen, frame, css('css'));
    case 'mosaic': return cardHTML(screen, frame, css('second'), 'shot2') + cardHTML(screen, frame, css('third'), 'shot3') + cardHTML(screen, frame, css('css'));
    case 'scatter': return cardHTML(screen, frame, css('css')) + cardHTML(screen, frame, css('second'), 'shot2') + cardHTML(screen, frame, css('third'), 'shot3') + cardHTML(screen, frame, css('fourth'), 'shot4');
    case 'crop': return cropHTML(screen, frame, css('css'));
    case 'callout': return deviceHTML(screen, frame, css('css')) + bubbleHTML(screen, frame);
    case 'peek': return deviceHTML(screen, frame, css('css')) + deviceHTML(screen, frame, css('second'), 'shot2');
    case 'none': return '';
    default: return deviceHTML(screen, frame, css('css')) + (layout.second && screen.shot2 ? deviceHTML(screen, frame, css('second'), 'shot2') : '');
  }
}

// ---------- style recipes: styles/<name>.json assembled from components/ ----------
// { "bg": "blobs", "type": "serif-editorial", "device": "soft-shadow", "decor": ["grid","sticker-red"],
//   "tokens": { "bg": "#F4EFE6", "ink": "#1B1A17", "accent": "#FFB562", "accent2": "#7FC8A9", "muted": "#4A463F", "pad": "110px", "copyTop": "190px" },
//   "defaultLayout": "tilt-left", "layouts": ["float","hero"], "expect": "0.4-0.75", "deviceOffset": 110, "css": "extra css" }
const COMP = path.join(ROOT, 'components');
const readComp = (kind, name) => {
  const f = path.join(COMP, kind, name + '.json');
  if (!fs.existsSync(f)) throw new Error(`unknown ${kind} component "${name}" (have: ${fs.readdirSync(path.join(COMP, kind)).map((x) => x.replace('.json', '')).join(', ')})`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
};
function assembleStyle(recipe) {
  const bgs = [].concat(recipe.bg ?? 'solid').map((n) => readComp('bg', n));
  const type = readComp('type', recipe.type ?? 'clean-centered');
  const dev = readComp('device', recipe.device ?? 'soft-shadow');
  const decors = (recipe.decor ?? []).map((d) => readComp('decor', d));
  const t = recipe.tokens ?? {};
  const tokensCss = Object.entries(t).map(([k, v]) => `--${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v};`).join('');
  const header = [
    recipe.defaultLayout ? `<!-- default-layout: ${recipe.defaultLayout} -->` : '',
    recipe.layouts ? `<!-- layouts: ${recipe.layouts.join(',')} -->` : '',
    recipe.expect ? `<!-- expect: ${recipe.expect} -->` : '',
    recipe.deviceOffset ? `<!-- device-offset: ${recipe.deviceOffset} -->` : '',
  ].join('');
  const base = fs.readFileSync(path.join(COMP, 'base.html'), 'utf8');
  return header + base
    .replace('{{{tokensCss}}}', () => tokensCss + `--title:{{{titleSize}}}px;`)
    .replace('{{{componentCss}}}', () => [...bgs.map((b) => b.css), type.css, dev.css, ...decors.map((d) => d.css)].filter(Boolean).join('\n'))
    .replace('{{{extraCss}}}', () => recipe.css ?? '')
    .replace('{{{bgHTML}}}', () => bgs.map((b) => b.html ?? '').join(''))
    .replace('{{{decorHTML}}}', () => decors.map((d) => d.html ?? '').join(''))
    .replace(/{{#panel}}|{{\/panel}}/g, () => (decors.some((d) => d.panel) ? '' : '{{#__never__}}'))
    .replace(/{{#__never__}}([\s\S]*?){{#__never__}}/g, '');
}
// a style is either styles/<name>.html (hand-written) or styles/<name>.json (recipe)
function loadStyleSrc(name) {
  const html = path.join(ROOT, 'styles', name + '.html');
  const json = path.join(ROOT, 'styles', name + '.json');
  if (fs.existsSync(json)) return assembleStyle(JSON.parse(fs.readFileSync(json, 'utf8')));
  if (fs.existsSync(html)) return fs.readFileSync(html, 'utf8');
  return null;
}
function listStyles() {
  return [...new Set(fs.readdirSync(path.join(ROOT, 'styles')).filter((f) => /\.(html|json)$/.test(f)).map((f) => f.replace(/\.(html|json)$/, '')))].sort();
}

function buildHTML(screen, brand, styleSrc, layout, frame, canvas) {
  const copyPos = screen.copy ?? layout.copy;
  const device = composeDevices(screen, layout, frame) + elementsHTML(screen, frame);
  const b2 = { ...brand };
  if (Array.isArray(brand.palette) && brand.palette.length) b2.bg = screen.bg ?? brand.palette[(screen._i ?? 0) % brand.palette.length];
  if (screen.bg) b2.bg = screen.bg;
  const brandCss = ['bg', 'ink', 'accent', 'accent2'].filter((k) => b2[k]).map((k) => `--${k}:${b2[k]};`).join('');
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
      .copy.middle{top:50%;transform:translateY(-50%);text-align:center}
      .device.card{overflow:hidden;border-radius:96px;background:#000}
      .device.card .shot{position:absolute;object-fit:cover}
      .device.crop{overflow:hidden;border-radius:64px;background:#000;box-shadow:0 0 0 8px rgba(255,255,255,.55),0 50px 90px rgba(0,0,0,.35)}
      .device.crop .shot{position:absolute}
      .bubble{position:absolute;z-index:4;border-radius:50%;overflow:hidden;border:10px solid #fff;box-shadow:0 40px 80px rgba(0,0,0,.45)}
      h1 mark{background:var(--accent,#F59E0B);color:var(--bg,#fff);padding:0 .18em;border-radius:.22em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
      .el{position:absolute;z-index:4}
      .el-crop{overflow:hidden;background:#fff;box-shadow:0 30px 60px rgba(0,0,0,.28),0 0 0 2px rgba(0,0,0,.06)}
      .el-crop img{position:absolute}
      .el-image{filter:drop-shadow(0 24px 40px rgba(0,0,0,.3))}
      .el-stamp{display:flex;flex-direction:column;align-items:center;text-align:center;font-size:40px;line-height:1.1;font-weight:800;color:var(--ink,#111)}
      .el-stamp .k{font-size:1.7em;font-weight:900}.el-stamp .v{font-size:.75em;font-weight:600;opacity:.8;margin-top:.2em}
      .el-stamp.laurel{padding:28px 110px}.el-stamp.laurel::before,.el-stamp.laurel::after{content:'❦';position:absolute;top:50%;transform:translateY(-50%) scaleX(-1);font-size:2.6em;opacity:.55;left:0}
      .el-stamp.laurel::after{transform:translateY(-50%);left:auto;right:0}
      .el-stamp.circle{width:420px;height:420px;border-radius:50%;justify-content:center;background:var(--ink,#111);color:var(--bg,#fff);padding:30px;box-shadow:0 24px 50px rgba(0,0,0,.3)}
      .el-stamp.circle .v{opacity:.85}
      .el-stamp.pill{flex-direction:row;gap:.5em;border-radius:999px;padding:.45em 1em;background:var(--accent,#F59E0B);color:var(--bg,#fff);font-size:44px}
      .el-stamp.pill .k{font-size:1em}.el-stamp.pill .v{font-size:.85em;margin:0;opacity:1}
      .el-stars{display:flex;flex-direction:column;align-items:center;gap:.2em;color:var(--ink,#111)}
      .el-stars .s{font-size:84px;letter-spacing:.08em;color:var(--accent,#F59E0B)}.el-stars .v{font-size:40px;font-weight:600;opacity:.8}
      .el-stat{display:flex;flex-direction:column;align-items:center;text-align:center;font-size:60px;color:var(--ink,#111)}
      .el-stat .k{font-size:3.2em;font-weight:900;letter-spacing:-.03em;line-height:1}.el-stat .v{font-size:.75em;font-weight:600;opacity:.75;margin-top:.3em}
      .el-logos{display:grid;gap:40px 60px;align-items:center;justify-items:center}.el-logos img{max-width:100%;max-height:120px;object-fit:contain}
      .el-quote{background:#fff;color:#111;border-radius:48px;padding:60px 64px;box-shadow:0 30px 70px rgba(0,0,0,.25)}
      .el-quote .q{font-size:140px;line-height:.6;font-family:Georgia,serif;opacity:.25;margin-bottom:30px}
      .el-quote p{font-size:54px;line-height:1.35;font-weight:600}
      .el-quote .who{display:flex;align-items:center;gap:24px;margin-top:40px;font-size:36px}.el-quote .who img{width:96px;height:96px;border-radius:50%;object-fit:cover}.el-quote .who span{display:flex;flex-direction:column}.el-quote .who i{font-style:normal;opacity:.6;font-size:.85em}
      .el-features{display:grid;gap:44px 48px;color:var(--ink,#111);font-size:46px;font-weight:700}.el-features>div{display:flex;align-items:center;gap:26px}.el-features .ic{width:112px;height:112px;border-radius:30px;background:#00000010;display:flex;align-items:center;justify-content:center;font-size:60px;flex:none}.el-features .ic img{width:60%;height:60%;object-fit:contain}
      .el-text{font-size:40px;line-height:1.4;color:var(--ink,#111);font-weight:500}
      ${canvas.span > 1 ? `.copy{right:auto;width:calc(${canvas.tile}px - 2 * var(--pad,110px))}` : ''}`,
  };
  return tpl(styleSrc, ctx);
}

// ---------- preview fan-out ----------
const preview = opt('--preview', null); // 'styles' | 'layouts'
const allowFrames = flag('--allow-frames');            // android: keep device frames despite Play guidance
const allowCross = flag('--allow-cross-platform');     // let an iOS frame appear on an android deck or vice versa
// Store rules encoded as checks (sources in SKILL.md → "Store rules"):
const PLAY_BANNED = /\b(best|#1|top|new|free|discount|sale|million downloads)\b/i;
const IOS_BANNED = /\b(android|google play|play store|galaxy|pixel)\b/i;
const PLAY_BANNED_ZH = /(最佳|第一名|冠軍|全新|免費|折扣|特價|百萬下載)/;
const IOS_BANNED_ZH = /(安卓|Google Play|Play 商店)/;
// framed layout → frameless equivalent, used for android decks unless --allow-frames
const FRAMELESS_FOR = { 'bleed-bottom': 'frameless-bleed', 'bleed-top': 'frameless-top', float: 'frameless-bleed', 'tilt-left': 'card-stack', 'tilt-right': 'card-stack',
  'two-up': 'mosaic', 'peek-sides': 'mosaic', hero: 'frameless-bleed', 'split-right': 'frameless-bleed', 'persp-left': 'card-stack', 'persp-right': 'card-stack',
  'lean-back': 'frameless-bleed', 'iso-pair': 'mosaic', panorama: 'frameless-bleed', callout: 'crop-zoom' };
if (preview) {
  // Take the first screen (or --only) and fan it out so a human can pick.
  const base = manifest.screens.find((sc) => !only.length || only.some((o) => (sc.id ?? '').startsWith(o))) ?? manifest.screens[0];
  const stylesDir = path.join(ROOT, 'styles');
  const names = preview === 'styles'
    ? listStyles().filter((n) => n !== 'feature-graphic')
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
const platform = opt('--platform', manifest.platform ?? 'ios');
const frameName = opt('--frame', manifest.frame ?? frames.platforms[platform] ?? 'iphone-16-pro-max');
const frame = frames[frameName];
if (!frame) { console.error(`unknown frame ${frameName}; have ${Object.keys(frames).filter((k) => !k.startsWith('_') && k !== 'platforms').join(', ')}`); process.exit(2); }
const FRAME_W = 1470; // layouts are authored for this width; other frames are zoomed to match
const report = [];
let failures = 0;
const t0 = Date.now();

for (let i = 0; i < manifest.screens.length; i++) {
  const screen = { ...manifest.screens[i], _i: i };
  const id = screen.id ?? String(i + 1).padStart(2, '0');
  if (only.length && !only.some((o) => id.startsWith(o))) continue;
  const styleName = screen.style ?? manifest.style ?? 'editorial-light';
  const styleSrc0 = loadStyleSrc(styleName);
  if (!styleSrc0) { console.error(`unknown style ${styleName}; have ${listStyles().join(', ')}`); process.exit(2); }
  const defLayout = (styleSrc0.match(/<!--\s*default-layout:\s*([\w-]+)\s*-->/) || [])[1];
  let layoutName = screen.layout ?? manifest.layout ?? defLayout ?? 'bleed-bottom';
  if (!LAYOUTS[layoutName]) { console.error(`unknown layout ${layoutName}; have ${Object.keys(LAYOUTS).join(', ')}`); process.exit(2); }
  // a style may restrict which layouts make sense for it: <!-- layouts: float,hero -->
  const lim = styleSrc0.match(/<!--\s*layouts:\s*([\w,\- ]+)-->/);
  if (lim) {
    const allowed = lim[1].split(',').map((x) => x.trim()).filter(Boolean);
    if (!allowed.includes(layoutName)) {
      console.log(`ℹ ${id}  ${styleName} does not support layout ${layoutName}; using ${allowed[0]} (supports: ${allowed.join(', ')})`);
      layoutName = allowed[0];
    }
  }
  const notes = [];
  if (platform === 'android' && !allowFrames && FRAMELESS_FOR[layoutName] && preview !== 'layouts') {
    notes.push(`Play guidance: no device frames — ${layoutName} → ${FRAMELESS_FOR[layoutName]} (pass --allow-frames to keep frames)`);
    layoutName = FRAMELESS_FOR[layoutName];
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
  const fr = screen.frame ? (frames[screen.frame] ?? frame) : frame;
  if (fr.platform !== platform && !allowCross) {
    console.error(`✖ ${id}: frame ${screen.frame ?? frameName} is ${fr.platform} but the deck is --platform ${platform}. Apple (2.3.10) and Play (third-party trademarks) both reject the other platform's devices. Pass --allow-cross-platform only if you know what you are doing.`);
    process.exit(3);
  }
  if (styleName === 'feature-graphic' && platform === 'android' && !allowFrames) { screen.shot = undefined; notes.push('Play feature graphic: device imagery removed (policy: no device imagery)'); }
  const html = buildHTML(screen, brand, styleSrc, layoutUsed, fr, canvas);
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
    // visual top edge of the (possibly rotated) device: bbox inflates with rotation,
    // so derive it from the element's centre and its scaled height instead.
    let devTop = null, devBottom = null;
    if (dev) {
      const r = dev.getBoundingClientRect();
      const m = new DOMMatrixReadOnly(getComputedStyle(dev).transform);
      const scale = Math.hypot(m.a, m.b) || 1, ang = Math.atan2(m.b, m.a);
      const elH = dev.getBoundingClientRect().height / (Math.abs(Math.cos(ang)) + (dev.offsetWidth / dev.offsetHeight) * Math.abs(Math.sin(ang)));
      devTop = r.top + r.height / 2 - elH / 2;
      devBottom = r.top + r.height / 2 + elH / 2;
    }
    const copyDevOverlap = dev && cr && devTop != null ? Math.max(0, Math.min(cr.bottom, devBottom) - Math.max(cr.top, devTop)) : 0;
    const copyArea = cr ? (Math.min(cr.right, W) - Math.max(cr.left, 0)) * (Math.min(cr.bottom, H) - Math.max(cr.top, 0)) / (W * H) : 0;
    return { devRatio, overflow, copyDevOverlap, copyBottom: cr?.bottom ?? 0, copyArea };
  });
  const issues = [...notes];
  const text = [screen.title, screen.subtitle, screen.badge, screen.sticker].filter(Boolean).join(' ');
  if (platform === 'android') {
    if (PLAY_BANNED.test(text) || PLAY_BANNED_ZH.test(text)) issues.push(`Play metadata: copy contains a banned promo word (best/#1/top/new/free/discount/sale/million downloads): "${text.match(PLAY_BANNED)?.[0] ?? text.match(PLAY_BANNED_ZH)?.[0]}"`);
    if (q.copyArea > 0.2) issues.push(`Play guidance: text overlay covers ${(q.copyArea * 100).toFixed(0)}% of the image (max 20%)`);
  } else if (IOS_BANNED.test(text) || IOS_BANNED_ZH.test(text)) {
    issues.push(`App Store 2.3.10: copy references another platform: "${text.match(IOS_BANNED)?.[0] ?? text.match(IOS_BANNED_ZH)?.[0]}"`);
  }
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
