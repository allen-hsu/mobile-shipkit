#!/usr/bin/env node
// Generate the artwork a deck needs (mascot, stickers, icons, backdrops) with Codex's built-in image
// generator, knock out white backgrounds, and drop the files in assets/.
//
//   node scripts/gen-assets.mjs assets.json [--out assets] [--ref raw/01.png ...]
//
// assets.json = { "style": "soft 3D Pixar / Apple-emoji sticker look, warm light",
//                 "palette": "sky blue #57C8FF, grass green, warm brown",
//                 "items": [ { "file": "mascot.png", "prompt": "a round smiling poop character with a straw hat holding a watering can", "kind": "sticker" },
//                            { "file": "icon-lock.png", "prompt": "a rounded green padlock", "kind": "icon" },
//                            { "file": "bg-sky.png", "prompt": "blue sky with fluffy clouds around the edges", "kind": "backdrop" } ] }
// kind: sticker | icon  → square 1024, white bg, auto-cut to transparent PNG
//       backdrop        → portrait 1024×1536, centre kept clean for the phone, no cut
// Each item is one codex exec call (~40 k tokens, ~30 s). Reference images (--ref, and previously generated
// items) are attached so later items match the first one's character and palette.
// Needs: codex CLI (image_generation feature on), python3 + Pillow + numpy for the matte.
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync, spawnSync } from 'node:child_process';
const args = process.argv.slice(2), spec = path.resolve(args.find((a) => !a.startsWith('--')) ?? 'assets.json');
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const outDir = path.resolve(opt('--out', 'assets')); fs.mkdirSync(outDir, { recursive: true });
const refs = []; for (let i = 0; i < args.length; i++) if (args[i] === '--ref') refs.push(path.resolve(args[i + 1]));
const S = JSON.parse(fs.readFileSync(spec, 'utf8'));
const work = path.join(outDir, '.gen'); fs.mkdirSync(work, { recursive: true });
const MATTE = `
import sys; from PIL import Image; import numpy as np; from collections import deque
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB'); a = np.asarray(im).astype(float); d = 255 - a.min(axis=2)
alpha = np.clip((d - 12) / 40, 0, 1); h, w = d.shape; bg = np.zeros((h, w), bool); q = deque(); near = d < 25
for y, x in [(0,0),(0,w-1),(h-1,0),(h-1,w-1)]: q.append((y,x)); bg[y,x] = True
while q:
    y, x = q.popleft()
    for ny, nx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
        if 0 <= ny < h and 0 <= nx < w and not bg[ny,nx] and near[ny,nx]: bg[ny,nx] = True; q.append((ny,nx))
Image.fromarray(np.dstack([a, np.where(bg, alpha, 1.0) * 255]).astype(np.uint8), 'RGBA').save(dst)
`;
fs.writeFileSync(path.join(work, 'matte.py'), MATTE);
const done = [];
for (const it of S.items) {
  const target = path.join(outDir, it.file);
  if (fs.existsSync(target) && !args.includes('--force')) { console.log('skip (exists)', it.file); done.push(target); continue; }
  const kind = it.kind ?? 'sticker';
  const size = kind === 'backdrop' ? 'portrait 1024x1536' : 'square 1024x1024';
  const bgRule = kind === 'backdrop'
    ? 'Leave the centre of the image as clean, plain background so a phone mockup can be placed there; NO characters, NO text.'
    : 'Plain pure white background (#FFFFFF), subject centred with generous margin, full subject visible, no text, no ground shadow.';
  const prompt = `Use your image generation tool once. Style: ${S.style ?? 'soft 3D sticker look'}. Palette: ${S.palette ?? 'match the attached reference'}. ${refs.length || done.length ? 'Match the character design and palette of the attached reference images exactly.' : ''}
Subject: ${it.prompt}. ${bgRule} ${size}.
Copy the generated PNG to ./${path.basename(work)}/${it.file} inside the current working directory and print its absolute path.`;
  const imgs = [...refs, ...done.filter((f) => /mascot|hero/i.test(f) || done.indexOf(f) === 0)].slice(0, 3).flatMap((f) => ['-i', f]);
  console.log('gen', it.file, '…');
  const r = spawnSync('codex', ['exec', '--skip-git-repo-check', '-s', 'workspace-write', '-C', outDir, ...imgs, '-'], { input: prompt, encoding: 'utf8', timeout: 600000 });
  const raw = path.join(work, it.file);
  if (!fs.existsSync(raw)) { console.log('✖', it.file, (r.stdout + r.stderr).split('\n').filter((l) => /rror|fail/i.test(l)).slice(-3).join(' | ')); continue; }
  if (kind === 'backdrop') fs.copyFileSync(raw, target);
  else execFileSync('python3', [path.join(work, 'matte.py'), raw, target]);
  done.push(target); console.log('✓', path.relative(process.cwd(), target));
}
console.log(`\n${done.length}/${S.items.length} assets in ${path.relative(process.cwd(), outDir)}. Reference them from the manifest: {"type":"image","file":"assets/<name>.png"} or "bgImage".`);
