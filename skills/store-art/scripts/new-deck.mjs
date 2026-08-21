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
w(`copy.${locale}.json`, copy);
w(`manifest.${locale}.json`, manifest);
w('.gitignore', 'framed/\n');
w('README.md', `# Store screenshots

1. Headlines: edit \`copy.${locale}.json\` (pain → shift → proof → features, ≤ 8 words). Get a yes.
2. Capture: Release build → \`sim-use screenshot --output raw/${locale}/01.png\` … (1320×2868 iPhone, 1080×2340 Android).
3. Assets the deck needs (mascot, photos, logos) → \`assets/\`.
4. Pick look:   node ${here}/scripts/render.mjs manifest.${locale}.json --preview styles --out preview
               node ${here}/scripts/catalog.mjs --deck manifest.${locale}.json --out preview/catalog
5. Render:      node ${here}/scripts/render.mjs manifest.${locale}.json --out framed/${locale} --strict
6. Play deck:   node ${here}/scripts/render.mjs manifest.${locale}.json --platform android --out framed-android/${locale}
7. Upload:      gpc images upload --type phoneScreenshots --locale ${locale} --path framed-android/${locale} --replace --confirm
`);
console.log(`\nnext: drop screenshots in ${path.relative(process.cwd(), path.join(dir, 'raw', locale))}/01.png … then run the commands in README.md`);
