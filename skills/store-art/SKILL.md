---
name: store-art
description: Render finished App Store / Google Play screenshots from raw captures with HTML/CSS styles and Playwright — seven visual styles (editorial-light, bento-dark, minimal-light, bold-dark, pastel-soft, mesh-glass, feature-graphic) × eight device layouts (bleed-bottom, bleed-top, float, tilt-left, tilt-right, two-up, hero, panorama), driven by one JSON manifest, with an automatic quality check (device height ratio, headline overflow, copy/device overlap). Use when the user wants to "frame screenshots", "make store screenshots look professional", needs a "feature graphic", "panoramic / continuous screenshots", CJK captions, or a Play 512 icon from a 1024 master. Copy comes from store-screenshots (write headlines first); this skill only renders.
---

# store-art

Raw capture + headline → store-ready PNG. Chosen after a hands-on bake-off
(`references/renderer-evaluation.md`): HTML/CSS + Playwright was the only approach with
no capability gap — any typography, Google Fonts, CJK, gradients, blur, multiple devices,
0.3–0.5 s per image. Koubou / frameit / Satori / GUI editors were rejected for the reasons
in that report.

## Setup (once)

```sh
cd skills/store-art && npm run setup      # playwright + chromium (~350 MB)
```

## 1. Manifest

```json
{
  "brand": { "accent": "#F59E0B", "accent2": "#34D399", "titleSize": 150 },
  "style": "editorial-light", "layout": "bleed-bottom",
  "screens": [
    { "id": "01", "badge": "全新 2.0", "title": "一眼看懂\n==今天的行程==",
      "subtitle": "行事曆、待辦與提醒整合在同一個畫面。", "sticker": "免費\n下載", "shot": "raw/zh-TW/01.png" },
    { "id": "02", "style": "bento-dark", "layout": "float", "title": "See the ==pattern==",
      "tiles": [{"k":"98%","v":"keep logging"},{"k":"3 s","v":"per entry"}], "shot": "raw/zh-TW/02.png" },
    { "id": "03", "layout": "two-up", "title": "Light or ==dark==", "shot": "raw/a.png", "shot2": "raw/b.png" },
    { "id": "04", "layout": "panorama", "title": "One ==timeline==", "shot": "raw/zh-TW/03.png" },
    { "id": "fg", "style": "feature-graphic", "size": [1024, 500], "title": "Your day, ==at a glance==", "shot": "raw/zh-TW/01.png" }
  ]
}
```

- `==word==` highlights a span (each style decides how: underline block, accent colour,
  gradient text). `\n` breaks the line. Per-screen keys override `brand` / top-level.
- `brand.bg / ink / accent / accent2` recolour any style; omit to use the style's palette.
- Fonts: Google Fonts by default (Inter, Fraunces, Noto Sans/Serif TC, Noto Sans JP,
  Space Grotesk, DM Sans). Offline/CI: `"brand": {"fonts": {"local": "./fonts"}}` embeds
  every .ttf/.otf in that folder.
- One manifest per locale (`manifest.zh-TW.json`…); `--out framed/zh-TW` matches what
  `gpc images upload` and `asc screenshots upload` expect.

## 2. Render

```sh
node scripts/render.mjs manifest.json --out framed/zh-TW          # all screens
node scripts/render.mjs manifest.json --out framed --only 01,fg   # subset
node scripts/render.mjs manifest.json --out framed --html         # keep the HTML for tweaking
node scripts/render.mjs manifest.json --out framed --strict       # exit 1 on quality warnings (CI)
```

Each screen prints `✓` or `⚠` with the reason. `report.json` in the output dir lists
files, style, layout and issues.

## 3. Styles × layouts

Styles (`styles/<name>.html`, self-contained HTML+CSS, copy one to make your own):

| style | look | good for |
|---|---|---|
| `editorial-light` | warm paper, serif display, highlighter under ==word==, sticker | lifestyle, journaling, health |
| `bento-dark` | glass cards on a glow, stat tiles (`tiles`) | data, finance, pro tools |
| `minimal-light` | white, centred, accent colour on ==word== | utilities, Things-style purity |
| `bold-dark` | black, diagonal neon stripes, uppercase grotesk | fitness, games, Gen-Z |
| `pastel-soft` | soft gradient, floating circles, rounded badge | couples, kids, wellness |
| `mesh-glass` | mesh gradient, frosted panel, gradient text | AI, productivity, "modern" |
| `feature-graphic` | 1024×500 Play header, headline left, tilted device right | Google Play only |

Layouts (in `render.mjs` `LAYOUTS`, device placement only):

| layout | device | copy | notes |
|---|---|---|---|
| `bleed-bottom` | centred, cut by bottom edge | top | the default first shot |
| `bleed-top` | cut by top edge | bottom | alternate for rhythm |
| `float` | smaller, shadow, centred | top | calm; for hero UIs |
| `tilt-left` / `tilt-right` | ±7°, shadow, bleeds bottom | top | shots 2–4 |
| `two-up` | two devices (`shot` + `shot2`) | top | before/after, light/dark |
| `hero` | big device, no copy | none | when the UI is the message |
| `panorama` | one device across 2 tiles (`--out` gets `id-1.png`, `id-2.png`) | top | Uber-Eats style; use once per deck |

Pick a style per deck and vary layouts across the deck (quality bar: never the same
composition twice in a row; at most one panorama in 5+ shots).

## 4. Quality bar (automated, from `references/quality-bar.md`)

After each render the page is measured:
- device occupies the expected share of canvas height (per layout; a style can override
  with `<!-- expect: 0.35-0.6 -->`),
- headline does not overflow horizontally (shorten, `\n`, or lower `titleSize`),
- copy block does not overlap the device by more than 40 px.

Warnings are printed; `--strict` fails the run. The rest of the bar (one message per
shot, 3 visual layers max, seam rules for panoramas) is on the human.

## 5. Upload

```sh
gpc images upload --type phoneScreenshots --locale zh-TW --path ./framed/zh-TW/
gpc images upload --type featureGraphic  --locale zh-TW --path ./framed/zh-TW/fg.png
asc screenshots upload …     # vendor/asc-skills → asc-shots-pipeline
```

Sizes produced and accepted as-is: 1320×2868 (iPhone 6.9"), 1024×500 (feature graphic).
Other sizes: set `size` per screen; layouts are tuned for 1320×2868, check the `⚠`.

## 6. Icon derivatives

`sh scripts/icon-set.sh assets/images/icon.png out/` → 1024 (ASC), 512 (Play), 180.

## References

- `references/renderer-evaluation.md` + `.png` — the bake-off (Playwright vs Koubou vs Satori vs frameit vs ParthJadhav)
- `references/quality-bar.md` — composition rules (ParthJadhav, MIT)
- `references/template-research.md` — open-source template repos, Figma CC-BY sets, 10 reference apps
- `references/layouts-research.md` — the 12 layout patterns and size tables
- `example-manifest.json` — every style and layout in one file
