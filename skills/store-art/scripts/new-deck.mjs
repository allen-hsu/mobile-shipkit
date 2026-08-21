#!/usr/bin/env node
// Scaffold a screenshot project inside an app:  node scripts/new-deck.mjs <dir> [--locale zh-TW] [--style editorial-light] [--platform ios]
// Creates copy.<locale>.json (headlines first), manifest.<locale>.json (wired to raw/<locale>/NN.png), raw/, assets/, and a README with the commands.
import fs from 'node:fs'; import path from 'node:path';
const args = process.argv.slice(2), dir = path.resolve(args.find((a) => !a.startsWith('--')) ?? 'store/screenshots');
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const locale = opt('--locale', 'en-US'), style = opt('--style', 'editorial-light'), platform = opt('--platform', 'ios');
const skillRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const rel = path.relative(dir, skillRoot) || '.'; const here = rel.split('..').length > 4 ? skillRoot : rel; // absolute when the skill lives far away
for (const d of ['raw/' + locale, 'assets', 'framed']) fs.mkdirSync(path.join(dir, d), { recursive: true });
const copy = [
  { id: '01', role: 'pain', title: 'Notes you ==never find== again?', subtitle: '' },
  { id: '02', role: 'shift', title: 'Captured, then ==organized== for you', subtitle: 'No folders. No tagging.' },
  { id: '03', role: 'proof', title: '==10,000== people every morning', subtitle: '', badge: '4.8 ★' },
  { id: '04', role: 'feature', title: 'Search what you ==meant==', subtitle: 'Not what you typed.' },
  { id: '05', role: 'feature', title: 'Works ==offline==', subtitle: 'Syncs when you are back.' },
];
const layouts = ['bleed-bottom', 'float', 'tilt-left', 'bleed-top', 'two-up'];
const manifest = { platform, style, brand: { accent: '#F59E0B', accent2: '#34D399' },
  screens: copy.map((c, i) => ({ id: c.id, layout: layouts[i], ...(c.badge ? { badge: c.badge } : {}), title: c.title, ...(c.subtitle ? { subtitle: c.subtitle } : {}), shot: `raw/${locale}/${c.id}.png`, ...(layouts[i] === 'two-up' ? { shot2: `raw/${locale}/01.png` } : {}) })) };
const w = (f, v) => { const p = path.join(dir, f); if (fs.existsSync(p)) { console.log('skip (exists)', f); return; } fs.writeFileSync(p, typeof v === 'string' ? v : JSON.stringify(v, null, 2) + '\n'); console.log('wrote', f); };
const brief = { app: { name: '', category: '', coreValue: '', targetUser: '' },
  look: { style, background: { options: ['', ''], chosen: 0 }, accent: { options: ['', ''], chosen: 0 }, text: { options: ['near-black', 'white (dark grounds only)'], chosen: 0 }, tone: [] },
  output: { platform, size: '6.9 inch · 1320×2868', locale, subtitles: true },
  assets: [],
  screens: copy.map((c, i) => ({ role: c.role, note: '', type: 'app', shot: `raw/${locale}/${c.id}.png`, title: c.title, subtitle: c.subtitle })),
  notes: '' };
w('brief.json', brief);
w('assets.json', { style: 'soft 3D sticker look', palette: '', items: [] });
w(`copy.${locale}.json`, copy);
w(`manifest.${locale}.json`, manifest);
w('.gitignore', 'framed/\n');
w('README.md', `# Store screenshots

1. App brief:   fill \`brief.json\` → app (name / category / core value / target user), look options, tone, and one block per screen (role · type · headline · subtitle).
2. Screens:     Release build → \`sim-use screenshot --output raw/${locale}/01.png\` … (1320×2868 iPhone, 1080×2340 Android). Put paths in brief.json → screens[].shot.
3. Look:        node ${here}/scripts/brief.mjs brief.json --compile manifest.${locale}.json
               node ${here}/scripts/catalog.mjs --deck manifest.${locale}.json --out preview/catalog   # pick one style → brief.json → look.style
               node ${here}/scripts/gen-assets.mjs assets.json --out assets --ref raw/${locale}/01.png  # mascot / stickers / icons, if needed
4. Sizes:       brief.json → output (platform · size · locale · subtitles)
5. Review:      node ${here}/scripts/brief.mjs brief.json --review review.html   # publish, get a yes
Render:         node ${here}/scripts/brief.mjs brief.json --compile manifest.${locale}.json
               node ${here}/scripts/render.mjs manifest.${locale}.json --out framed/${locale} --strict
               node ${here}/scripts/render.mjs manifest.${locale}.json --platform android --out framed-android/${locale}
Upload:         gpc images upload --type phoneScreenshots --locale ${locale} --path framed-android/${locale} --replace --confirm
`);
console.log(`\nnext: drop screenshots in ${path.relative(process.cwd(), path.join(dir, 'raw', locale))}/01.png … then run the commands in README.md`);
