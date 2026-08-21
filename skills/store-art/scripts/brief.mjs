#!/usr/bin/env node
// The review step. A brief is the human-readable plan for a deck — app facts, look, output,
// and one block per screen (role · type · screenshot · headline · subtitle). Two directions:
//
//   node scripts/brief.mjs brief.json --review review.html [--thumbs framed/zh-TW]
//       → a single self-contained page a teammate can read and comment on (publish it as an artifact)
//   node scripts/brief.mjs brief.json --compile manifest.zh-TW.json
//       → the render manifest (screen types map to layouts: app → framed rotation, text → no-device,
//         testimonial → quote); then: node scripts/render.mjs manifest.zh-TW.json --out framed/zh-TW
//
// brief.json shape: see examples/brief.json. Per-screen `layout` / `device` / `elements` pass through when given.
import fs from 'node:fs'; import path from 'node:path';
const args = process.argv.slice(2), src = path.resolve(args.find((a) => !a.startsWith('--')) ?? 'brief.json');
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const B = JSON.parse(fs.readFileSync(src, 'utf8')); const dir = path.dirname(src);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ROLE = { hook: '鉤子 · 痛點或前提', shift: '轉變 · 承諾', proof: '證明 · 數字或收集感', feature: '功能 · 讓承諾成立', objection: '疑慮 · 隱私 / 價格', social: '口碑 · 評論', platform: '平台 · 裝置廣度' };
const TYPE = { app: ['App screen', '真實畫面放在手機或卡片裡'], text: ['Text', '沒有 UI，只有標題、配色與插畫 / 圖示'], testimonial: ['Testimonial', '一則評論：引言、星等、署名，沒有 UI'] };

// ---------- compile → manifest ----------
if (args.includes('--compile')) {
  const rot = ['bleed-bottom', 'float', 'tilt-right', 'bleed-top', 'two-up', 'tilt-left'];
  let k = 0;
  const screens = B.screens.map((s, i) => {
    const id = String(i + 1).padStart(2, '0');
    const out = { id, title: s.title };
    if (B.output?.subtitles !== false && s.subtitle) out.subtitle = s.subtitle;
    if (s.badge) out.badge = s.badge;
    if (s.type === 'testimonial') {
      out.layout = s.layout ?? 'quote'; out.copy = 'top';
      out.elements = [{ type: 'quote', text: s.quote?.text ?? s.title, author: s.quote?.author, role: s.quote?.role, avatar: s.quote?.avatar, width: 1080, at: { x: '50%', y: '52%' } },
        ...(s.quote?.rating ? [{ type: 'stars', rating: s.quote.rating, at: { x: '50%', y: '78%' } }] : [])];
    } else if (s.type === 'text') {
      out.layout = s.layout ?? 'no-device'; out.copy = 'top';
      out.elements = [...(s.illustration ? [{ type: 'image', file: s.illustration, width: 820, at: { x: '50%', y: 1650 } }] : []),
        ...(s.features ? [{ type: 'features', cols: Math.min(3, s.features.length), width: 1180, size: 38, at: { x: '50%', y: 2500 }, items: s.features }] : [])];
    } else {
      out.layout = s.layout ?? rot[k++ % rot.length];
      const shots = B.screens.filter((x) => x.type === 'app' && x.shot && x.shot !== 'auto').map((x) => x.shot);
      out.shot = s.shot && s.shot !== 'auto' ? s.shot : shots[i % Math.max(1, shots.length)];
      if (out.layout === 'two-up') out.shot2 = s.shot2 ?? shots.find((x) => x !== out.shot) ?? out.shot;
      if (s.copy) out.copy = s.copy;
    }
    if (s.device) out.device = s.device;
    if (s.elements) out.elements = [...(out.elements ?? []), ...s.elements];
    if (s.shot === 'auto' && s.type === 'app') out._note = 'auto-picked shot; set "shot" in the brief to override';
    return out;
  });
  const manifest = { platform: B.output?.platform ?? 'ios', style: B.look?.style ?? 'editorial-light', brand: { ...(B.look?.brand ?? {}), ...(B.assets?.find((a) => /bg-|backdrop/i.test(a)) ? { bgImage: B.assets.find((a) => /bg-|backdrop/i.test(a)) } : {}) }, screens };
  const dst = path.resolve(opt('--compile')); fs.writeFileSync(dst, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`wrote ${path.relative(process.cwd(), dst)} — ${screens.length} screens (${screens.map((s) => s.layout).join(', ')})\nnext: node scripts/render.mjs ${path.relative(process.cwd(), dst)} --out framed/${B.output?.locale ?? 'en-US'}`);
  process.exit(0);
}

// ---------- review page ----------
const thumbs = opt('--thumbs'); const b64 = (p) => fs.existsSync(p) ? `data:image/png;base64,${fs.readFileSync(p).toString('base64')}` : '';
const choice = (c) => (c?.options ?? []).map((o, i) => `<span class="opt${i === c.chosen ? ' on' : ''}">${esc(o)}</span>`).join('');
const shotThumb = (s) => { if (!s.shot || s.shot === 'auto') return '<span class="auto">Auto</span>'; const d = b64(path.resolve(dir, s.shot)); return d ? `<img src="${d}" alt="">` : `<code>${esc(s.shot)}</code>`; };
const rendered = (i) => { if (!thumbs) return ''; const p = path.join(path.resolve(dir, thumbs), String(i + 1).padStart(2, '0') + '.png'); const d = b64(p); return d ? `<figure class="out"><img src="${d}" alt="rendered screen ${i + 1}"><figcaption>目前渲染</figcaption></figure>` : ''; };
const screenCards = B.screens.map((s, i) => `
<section class="screen" id="s${i + 1}">
  <header><span class="n">${i + 1}</span><span class="role">${esc(ROLE[s.role] ?? s.role ?? '')}</span>${s.note ? `<span class="note">${esc(s.note)}</span>` : ''}</header>
  <div class="body">
    <div class="form">
      <div class="field"><label>Screen type</label><div class="types">${Object.entries(TYPE).map(([k, [n, d]]) => `<div class="type${s.type === k ? ' on' : ''}"><b>${n}</b><small>${d}</small></div>`).join('')}</div></div>
      ${s.type === 'app' ? `<div class="field"><label>App screenshot</label><div class="shot">${shotThumb(s)}</div></div>` : ''}
      <div class="field"><label>Headline</label><div class="in h">${esc(s.title).replace(/\n/g, '<br>')}</div></div>
      ${s.subtitle ? `<div class="field"><label>Subheadline</label><div class="in">${esc(s.subtitle)}</div></div>` : ''}
      ${s.quote ? `<div class="field"><label>Quote</label><div class="in">“${esc(s.quote.text)}” — ${esc(s.quote.author)}${s.quote.role ? `, ${esc(s.quote.role)}` : ''}${s.quote.rating ? ` · ${'★'.repeat(s.quote.rating)}` : ''}</div></div>` : ''}
      ${s.features ? `<div class="field"><label>Feature row</label><div class="in">${s.features.map((f) => esc(f.label)).join(' · ')}</div></div>` : ''}
    </div>
    ${rendered(i)}
  </div>
</section>`).join('');
const coverTest = B.screens.map((s) => esc(s.title).replace(/\n/g, ' ')).join(' → ');
const html = `<title>${esc(B.app?.name ?? 'Deck')} 截圖審稿</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#F3F6F4;--card:#FFFFFF;--ink:#141A17;--mute:#5E6B65;--line:#D9E1DC;--acc:#1E6B4A;--acc-soft:#E3F0E9;--chip:#EEF3F0}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#111614;--card:#182019;--ink:#EAF0EC;--mute:#9AA8A0;--line:#2A352F;--acc:#6CC79B;--acc-soft:#1F3328;--chip:#202A24}}
:root[data-theme="dark"]{--bg:#111614;--card:#182019;--ink:#EAF0EC;--mute:#9AA8A0;--line:#2A352F;--acc:#6CC79B;--acc-soft:#1F3328;--chip:#202A24}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 "IBM Plex Sans","Noto Sans TC",system-ui,sans-serif}
.wrap{max-width:920px;margin:0 auto;padding:40px 24px 80px}
h1{font-family:"Bricolage Grotesque","Noto Sans TC",sans-serif;font-weight:700;font-size:clamp(28px,4vw,40px);line-height:1.1;margin:0 0 6px;text-wrap:balance}
.sub{color:var(--mute);margin:0 0 28px}
label,.eyebrow{display:block;font:500 11px/1 "IBM Plex Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--mute);margin-bottom:8px}
.grid{display:grid;gap:14px}.g3{grid-template-columns:repeat(3,1fr)}@media(max-width:720px){.g3{grid-template-columns:1fr}}
.box{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px 14px}
.box p{margin:0}
.panel{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;margin:16px 0}
.opts{display:flex;flex-wrap:wrap;gap:8px}.opt{border:1px solid var(--line);border-radius:999px;padding:6px 12px 6px 30px;position:relative;color:var(--mute)}
.opt::before{content:"";position:absolute;left:10px;top:50%;width:12px;height:12px;border-radius:50%;border:1.5px solid var(--line);transform:translateY(-50%)}
.opt.on{color:var(--ink);border-color:var(--acc)}.opt.on::before{background:var(--acc);border-color:var(--acc)}
.tone{display:flex;flex-wrap:wrap;gap:8px}.tone span{background:var(--acc-soft);color:var(--acc);border-radius:999px;padding:5px 12px;font-weight:500}
.screen{background:var(--card);border:1px solid var(--line);border-radius:14px;margin:18px 0;overflow:hidden}
.screen header{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--line);flex-wrap:wrap}
.n{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:7px;background:var(--acc);color:#fff;font:700 13px "IBM Plex Mono",monospace}
.role{font-weight:600}.note{background:var(--chip);border-radius:999px;padding:4px 12px;color:var(--mute);font-size:13px}
.body{display:grid;grid-template-columns:1fr auto;gap:18px;padding:18px}@media(max-width:720px){.body{grid-template-columns:1fr}}
.field{margin-bottom:14px}.types{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}@media(max-width:720px){.types{grid-template-columns:1fr}}
.type{border:1px solid var(--line);border-radius:10px;padding:10px 12px;color:var(--mute)}.type b{display:block;color:var(--ink);margin-bottom:3px}.type small{font-size:12px;line-height:1.4;display:block}
.type.on{border-color:var(--acc);background:var(--acc-soft)}.type.on b::after{content:" ✓";color:var(--acc)}
.in{border:1px solid var(--line);border-radius:8px;padding:10px 12px;background:var(--bg)}.in.h{font-family:"Bricolage Grotesque","Noto Sans TC",sans-serif;font-weight:700;font-size:20px;line-height:1.25}
.shot{display:flex;gap:8px;align-items:center}.shot img{height:72px;border-radius:8px;border:1px solid var(--line)}.auto{border:1px solid var(--acc);color:var(--acc);border-radius:8px;padding:18px 12px;font-weight:600}
.out{margin:0;text-align:center}.out img{width:180px;border-radius:12px;border:1px solid var(--line);display:block}.out figcaption{font-size:12px;color:var(--mute);margin-top:6px}
.cover{font-family:"Bricolage Grotesque","Noto Sans TC",sans-serif;font-size:18px;line-height:1.5;font-weight:500}
.check{list-style:none;padding:0;margin:0;display:grid;gap:6px}.check li::before{content:"☐ ";color:var(--mute)}
.assets{display:flex;flex-wrap:wrap;gap:6px}.assets code{background:var(--chip);border-radius:6px;padding:3px 8px;font-size:12px}
footer{color:var(--mute);font-size:13px;margin-top:40px;border-top:1px solid var(--line);padding-top:14px}
</style>
<div class="wrap">
<h1>${esc(B.app?.name ?? '')} — 商店截圖審稿</h1>
<p class="sub">${B.screens.length} 張 · ${esc(B.look?.style ?? '')} · ${esc(B.output?.platform ?? 'ios')} ${esc(B.output?.size ?? '')} · ${esc(B.output?.locale ?? '')}。看完在有意見的地方留言；沒意見就回「OK」。</p>

<div class="grid g3">
  <div class="box"><label>Category</label><p>${esc(B.app?.category)}</p></div>
  <div class="box"><label>Core value</label><p>${esc(B.app?.coreValue)}</p></div>
  <div class="box"><label>Target user</label><p>${esc(B.app?.targetUser)}</p></div>
</div>

<div class="panel">
  <div class="grid" style="grid-template-columns:1fr 1fr;gap:18px">
    <div><label>Background</label><div class="opts">${choice(B.look?.background)}</div></div>
    <div><label>Accent</label><div class="opts">${choice(B.look?.accent)}</div></div>
    <div><label>Text</label><div class="opts">${choice(B.look?.text)}</div></div>
    <div><label>Tone</label><div class="tone">${(B.look?.tone ?? []).map((t) => `<span>${esc(t)}</span>`).join('')}</div></div>
  </div>
  ${B.assets?.length ? `<div style="margin-top:16px"><label>Assets</label><div class="assets">${B.assets.map((a) => `<code>${esc(path.basename(a))}</code>`).join('')}</div></div>` : ''}
</div>

<div class="panel">
  <span class="eyebrow">Cover-the-UI test · 只讀標題，是不是一個故事？</span>
  <p class="cover">${coverTest}</p>
</div>

${screenCards}

<div class="panel">
  <span class="eyebrow">審稿清單</span>
  <ul class="check">
    <li>每句 ≤ 8 個詞 / 12 個字，縮圖大小看得清</li>
    <li>講結果，不講功能名</li>
    <li>順序：鉤子 → 轉變 → 證明 → 功能 → 疑慮</li>
    <li>數字都是真的、現在的</li>
    <li>沒有「最佳 / 第一 / 免費 / 立即下載」，iOS 文案不提 Android</li>
    <li>每張只有一個訊息</li>
  </ul>
</div>
${B.notes ? `<div class="panel"><span class="eyebrow">Change notes</span><p>${esc(B.notes)}</p></div>` : ''}
<footer>由 store-art <code>brief.mjs</code> 產生 · 改 <code>${esc(path.basename(src))}</code> 後重跑即可更新</footer>
</div>`;
const dst = path.resolve(opt('--review', 'review.html')); fs.writeFileSync(dst, html);
console.log(`wrote ${path.relative(process.cwd(), dst)} (${Math.round(html.length / 1024)} KB)`);
