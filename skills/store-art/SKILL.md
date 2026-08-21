---
name: store-art
description: Render finished App Store / Google Play screenshots from raw captures with HTML/CSS + Playwright, driven by one JSON manifest. 30 composable styles (recipes of bg × type × device × decor components) × 30 layouts (bleed, float, tilt, 3D perspective, hand-held tilt, two-up, peek-sides, hero, frameless cards, card-stack, deck, scatter, mosaic, two-strip, crop-zoom, callout, panorama, sandwich, no-device, quote) plus an elements layer (UI crops, laurel/pill/sticky stamps, stars, stats, logos, quotes, feature grids, stickers, captions). iPhone 16/17 Pro Max, iPhone Air, Pixel 5, Galaxy S21 frames per platform; automatic quality bar (device share, headline overflow, copy/device overlap) and store-policy guardrails (Play: no frames / ≤20 % text / banned words / no iPhone imagery; Apple 2.3.10). One command renders a style catalogue for review; one scaffolds a project. Use when the user wants to "frame screenshots", "make store screenshots look professional", a "feature graphic", "panoramic screenshots", CJK captions, to "try all styles", or a Play 512 icon. Copy comes from store-screenshots (write headlines first); this skill only renders.
---

# store-art

Raw capture + headline → store-ready PNG, repeatably. HTML/CSS + Playwright was picked in a
bake-off (`references/renderer-evaluation.md`): no capability gap (any font, CJK, gradients,
blur, multiple devices), 0.3–0.5 s per image. Everything is data: a **manifest** says what,
a **style** says how it looks, a **layout** says where the phone goes, **elements** add the
proof layer. Nothing is hand-positioned in an editor, so a deck re-renders in seconds after a
copy change, a new locale, or a UI update.

## How it fits together

```
manifest.json ──┐
                │   styles/<name>.json  = recipe { bg, type, device, decor, tokens }
raw/*.png ──────┼─►     └─ components/{bg,type,device,decor}/<name>.json  (css + html snippets)
assets/* ───────┤   LAYOUTS (render.mjs) = where the device(s) sit; alt placement when copy flips
                │   elements            = crops / stamps / stats / logos / quotes / images / text
                ▼
          components/base.html  →  Playwright  →  framed/<locale>/NN.png + report.json
                                        │
                                        ├─ quality bar  (device share · overflow · overlap)   → ⚠
                                        └─ store rules  (Play frames/text/words · Apple 2.3.10) → ⚠ / stop
```

| piece | file | you change it when |
|---|---|---|
| manifest | `manifest.<locale>.json` | copy, screenshots, per-screen layout/style/colour, elements, device nudges |
| style | `styles/<name>.json` | a new look: four component names + five colours |
| component | `components/<slot>/<name>.json` | a new background / typography / shadow / decoration reusable by any style |
| layout | `LAYOUTS` in `scripts/render.mjs` | a new composition (device position, rotation, extra cards) |
| frame | `assets/frames/` | a new device bezel |
| house deck | `examples/house-deck/deck.json` | the five-screen story every style is judged on |

`node scripts/render.mjs --list` prints the live catalogue (30 styles, 30 layouts, 20 bg / 25 type /
9 device / 9 decor components). `references/manifest-reference.md` documents every key.

## Folder

```
store-art/
  SKILL.md · SKILL.zh-TW.md
  scripts/render.mjs      the renderer (manifest → PNGs, quality bar, store rules, --preview, --list)
  scripts/catalog.mjs     house deck × every style → review sheets
  scripts/new-deck.mjs    scaffold store/screenshots/ in an app (brief.json, assets.json, copy, manifest)
  scripts/brief.mjs       brief.json → review.html (sign-off page) · brief.json → manifest (compile)
  scripts/gen-assets.mjs  mascots / stickers / icons / backdrops via Codex image generation, auto-cut
  scripts/icon-set.sh     1024 → 512 / 180 icons
  styles/                 30 recipes + feature-graphic.html
  components/             base.html + bg/ type/ device/ decor/
  assets/frames/          bezels + frames.json (platform → frame)
  examples/house-deck/    deck.json + two sample screenshots (what catalog.mjs renders)
  examples/deck.json      a real pain → shift → proof → features deck
  examples/elements-showcase.json · examples/all-styles-layouts.json
  examples/ai-assets.json · examples/ai-assets-deck.json   generated-asset deck
  references/             manifest-reference.md · quality-bar.md · reference-sets.md (31 shipped sets) · landscape.md · renderer-evaluation.md · layouts-research.md
```

## Setup (once)

```sh
cd skills/store-art && npm run setup      # playwright + chromium (~350 MB)
```

## The repeatable flow

### 0. Scaffold (new app) — the five-step flow itself lives in `store-screenshots`

```sh
node skills/store-art/scripts/new-deck.mjs store/screenshots --locale zh-TW --style editorial-light
```

Creates `copy.zh-TW.json`, `manifest.zh-TW.json` (wired to `raw/zh-TW/NN.png`), `raw/`, `assets/`,
and a README with the commands below. Copy comes first — `store-screenshots` §1 owns that step.

### 1. Capture

Release build → `sim-use screenshot --output raw/zh-TW/01.png` (iPhone 1320×2868; Android
1080×2340 from the emulator for the Play deck). Never Expo Go. Details in `store-screenshots` §3.

### 2. Pick the look (🧑 human step)

```sh
node scripts/render.mjs manifest.zh-TW.json --preview styles  --out preview   # screen 1 in every style
node scripts/render.mjs manifest.zh-TW.json --preview layouts --out preview   # screen 1 in every layout
node scripts/catalog.mjs --deck manifest.zh-TW.json --out preview/catalog      # the whole deck in every style
```

The catalogue is the review surface: each row is one style, five screens, same copy. Pick **one
style for the deck** and a **layout per screen** (vary them; strongest on screen 1; ≤ 1 panorama),
write them into the manifest.

### 3. Render

```sh
node scripts/render.mjs manifest.zh-TW.json --out framed/zh-TW --strict          # App Store
node scripts/render.mjs manifest.zh-TW.json --platform android --out framed-android/zh-TW   # Google Play (frameless, Pixel-shot)
node scripts/render.mjs manifest.zh-TW.json --out framed --only 01,fg --html     # one screen, keep the HTML
```

Each screen prints `✓` or `⚠ reason`. `report.json` lists files, style, layout, issues.

### 4. Upload

```sh
gpc images upload --type phoneScreenshots --locale zh-TW --path framed-android/zh-TW --replace --confirm
gpc images upload --type featureGraphic  --locale zh-TW --path framed-android/zh-TW/fg.png
asc screenshots upload …      # vendor/asc-skills → asc-shots-pipeline
```

## The manifest (what you edit)

```json
{
  "platform": "ios", "style": "editorial-light",
  "brand": { "accent": "#F59E0B", "accent2": "#34D399" },
  "screens": [
    { "id": "01", "layout": "bleed-bottom", "badge": "全新 2.0", "title": "一眼看懂\n==今天的行程==",
      "subtitle": "行事曆、待辦與提醒整合在同一個畫面。", "shot": "raw/zh-TW/01.png",
      "elements": [ { "type": "stamp", "kind": "laurel", "value": "4.8", "label": "App Store", "at": { "x": 990, "y": 260 } } ] },
    { "id": "02", "layout": "float", "copy": "bottom", "title": "See the ==pattern==", "shot": "raw/zh-TW/02.png",
      "device": { "top": 150, "scale": 0.66 } },
    { "id": "03", "layout": "two-up", "title": "Light or ==dark==", "shot": "raw/a.png", "shot2": "raw/b.png" },
    { "id": "04", "layout": "no-device", "bg": "#1F6BFF", "title": "近 30 種植物",
      "elements": [ { "type": "crop", "crop": { "x": 0.02, "y": 0.27, "w": 0.96, "h": 0.08 }, "width": 1100, "at": { "x": "50%", "y": 1600 } } ] },
    { "id": "fg", "style": "feature-graphic", "size": [1024, 500], "title": "Your day, ==at a glance==", "shot": "raw/zh-TW/01.png" }
  ]
}
```

- `==word==` = the style's emphasis; `::word::` = solid pill; `\n` breaks lines.
- Per-screen keys override `brand` / top level: `style`, `layout`, `copy`, `align`, `titleSize`,
  colours (`bg bg2 ink accent accent2 accent3 muted`), `device`, `elements`.
- One manifest per locale; `--out framed/<locale>` matches what `gpc` / `asc` upload expect.

## Fine-tuning — which knob for which problem

| you want | edit | key |
|---|---|---|
| phone higher / lower / smaller | screen | `device: { top, scale }` (`top` < 0 bleeds the top edge) |
| phone off-centre | screen | `device.x: "60%"` |
| copy at the bottom instead of top | screen | `copy: "bottom"` — layouts with an `alt` move the phone automatically |
| left / centre / right text | screen | `align` |
| headline too big / wraps | screen | `titleSize`, `\n` |
| different colour on one screen | screen | `bg`, `ink`, `accent`… |
| whole deck recoloured | `brand` | same keys |
| backgrounds rotate per screen | `brand.palette` or style `palette` | array of colours |
| a UI fragment floating out of the phone | screen | `elements: [{type:"crop", crop:{x,y,w,h} fractions, width, at, rotate}]` |
| proof badge / big number / logos / quote | screen | `elements` (`stamp`, `stat`, `logos`, `quote`, `features`, `stars`) |
| mascot / photo / 3D sticker | screen | `elements: [{type:"image", file:"assets/…"}]` or `bgImage`; generate with `gen-assets.mjs` |
| feature grid with image icons | screen | `features.items[].icon` = `assets/icon.png`, `size` for label px |
| blurred phone as backdrop | screen | `device.blur: 14` + a `crop` element in front |
| new look from existing parts | `styles/x.json` | pick `bg/type/device/decor`, set tokens, `defaultLayout` |
| new background / type treatment | `components/<slot>/x.json` | `{css, html}` using `var(--bg)`, `var(--accent)`… |
| new device position | `LAYOUTS` in `render.mjs` | `css`, `second/third`, `kind`, `alt`, `expect` |
| CSS you cannot express in a component | style `css` | appended last |
| look at one screen's CSS live | CLI | `--html`, open the file, edit, port back |

Coordinates: `at` is the element's centre in canvas px or `%`; crop boxes are **fractions 0–1 of
the screenshot**, so one manifest works across iPhone and Pixel captures.

## Styles are recipes

```json
{ "bg": ["blobs", "grid"], "type": "serif-editorial", "device": "soft-shadow", "decor": ["sticker-red"],
  "tokens": { "bg": "#F4EFE6", "ink": "#1B1A17", "accent": "#FFB562", "accent2": "#7FC8A9", "muted": "#4A463F" },
  "defaultLayout": "tilt-left" }
```

Families in the catalogue (`--list` for the full set): **light editorial** (editorial-light,
minimal-light, lavender-serif, dotted-gallery, mint-playful, pastel-soft, pastel-grain,
peach-warm, sage-laurel), **dark / pro** (dark-pro, bold-dark, bento-dark, studio-dark,
navy-photo, mesh-glass, mesh-neon, plum-glow), **vivid** (electric-blue, serif-vivid,
sky-clouds, neon-illustration, playful-pop, neo-brutalist, retro-warm, artsy-flat),
**photo / asset-driven** (photo-backdrop, photo-glass, paper-sticker), plus `feature-graphic`.
One style per deck; the catalogue row tells you in five seconds whether it survives thumbnail size.

## Layouts

`--list` prints all 30 with the copy position and what each needs (`shot2`, `crop`, `focus`,
`elements`). Families: **framed** (bleed-bottom/top, float, tilt-left/right, bleed-top-tilt/right,
tilt-hard-left/right, two-up, peek-sides, hero, persp-left/right, lean-back, iso-pair, panorama,
callout), **frameless** (frameless-bleed/top, card-stack, deck, scatter, mosaic, two-strip,
sandwich, crop-zoom), **device-free** (no-device, quote). On `--platform android` framed layouts
remap to frameless ones (Play guidance) unless `--allow-frames`.

## Elements — the proof layer

From 31 shipped sets (`references/reference-sets.md`): what separates a real store deck from a
framed screenshot is rarely the background; it is UI lifted out of the phone, numbers, stamps,
logos, quotes. `crop` · `image` · `stamp` (laurel / circle / pill / sticky / scallop) · `stars` ·
`stat` · `logos` · `quote` (card / plain) · `features` · `text`. Every text field — headline,
subtitle, badge, element text — goes through the store-rule scan. Only real, current numbers
(Apple 5.2.5, Play promo rules).

## Assets — supplied or generated

Mascots, line art, 3D stickers, photos, hand-holding-phone shots, partner logos: put them in
`assets/` and reference them from `image` / `logos` / `bgImage`. A missing file stops the run with
the path. Licensing is yours (Play rejects unlicensed trademarks; Apple 5.2 too). Without assets,
pick styles that do not need them — everything except photo-backdrop / photo-glass / paper-sticker
renders complete from screenshots alone.

**Generate what nobody on the team can draw** (the makeshots.app trick, but keeping the real UI):

```sh
node scripts/gen-assets.mjs assets.json --out assets --ref raw/zh-TW/01.png
```

`assets.json` lists items (`sticker` / `icon` → square, white background, auto-cut to transparent
PNG; `backdrop` → portrait with a clean centre). Each item is one `codex exec` call to Codex's
built-in image generator (~30 s); the first result is passed back as a reference so later poses
keep the same character and palette. The renderer then places them like any other asset — UI stays
a real screenshot, headlines stay HTML text, store checks still run. Example:
`examples/ai-assets.json` → `examples/ai-assets-deck.json` (poop-garden mascot deck, sky-clouds).
White subjects defeat the white-key matte; ask for a flat colour key in the prompt when that happens.

## Quality bar and store rules

After each render the page is measured: device share of canvas height (per layout; style
`expect` overrides), headline overflow, copy/device overlap > 40 px. Store rules
([Play preview assets](https://support.google.com/googleplay/android-developer/answer/9866151),
[App Store 2.3.10](https://developer.apple.com/app-store/review/guidelines/#accurate-metadata)):

| rule | what happens |
|---|---|
| Play: no device frames | `--platform android` remaps to frameless; `--allow-frames` keeps them |
| Play: no third-party trademarks / Apple: no other platforms' devices | iOS frame on an android deck (or vice versa) **stops the run** unless `--allow-cross-platform` |
| Play: text ≤ 20 % of the image | measured; `⚠` above |
| Play: no Best / #1 / Top / New / Free / Discount / Sale / Million downloads (EN + zh) | `⚠` |
| Apple 2.3.10: no Android / Google Play mentions in iOS copy | `⚠` |
| Feature graphic on Play: no device, no Free/New | device removed automatically |

`--strict` turns every `⚠` into exit 1 for CI. The rest of the bar — one message per shot, three
visual layers max, panorama seams — is on the human (`references/quality-bar.md`).

## Icons

`sh scripts/icon-set.sh assets/images/icon.png out/` → 1024 (ASC), 512 (Play), 180.

## References

- `references/manifest-reference.md` — every key and flag
- `references/quality-bar.md` — composition rules
- `references/reference-sets.md` (+ zh-TW) — 31 shipped App Store sets, each mapped to style × layout × elements
- `references/renderer-evaluation.md` + `.png` — the bake-off
- `references/landscape.md` — every tool / service / template source we looked at, what we took, what is still open
- `references/layouts-research.md` — where the layout patterns come from
- `examples/house-deck/deck.json` — the five-screen story used by `catalog.mjs`
- `examples/deck.json`, `examples/elements-showcase.json`, `examples/all-styles-layouts.json`
