---
name: store-art
description: Render finished App Store / Google Play screenshots from raw captures with HTML/CSS styles and Playwright — twelve visual styles (editorial-light, bento-dark, minimal-light, bold-dark, pastel-soft, mesh-glass, paper-sticker, photo-backdrop, neo-brutalist, playful-pop, retro-warm, dark-pro; plus feature-graphic) × nineteen compositions (bleed, float, tilt, 3D perspective left/right, lean-back, iso-pair, two-up, peek-sides, hero, split-right, frameless card, card-stack, mosaic triptych, crop-zoom, callout magnifier, panorama), with iPhone 16/17 Pro Max, iPhone Air, Pixel 5 and Galaxy S21 frames selected per platform, driven by one JSON manifest, with an automatic quality check (device height ratio, headline overflow, copy/device overlap). Use when the user wants to "frame screenshots", "make store screenshots look professional", needs a "feature graphic", "panoramic / continuous screenshots", CJK captions, or a Play 512 icon from a 1024 master. Copy comes from store-screenshots (write headlines first); this skill only renders.
---

# store-art

Raw capture + headline → store-ready PNG. Chosen after a hands-on bake-off
(`references/renderer-evaluation.md`): HTML/CSS + Playwright was the only approach with
no capability gap — any typography, Google Fonts, CJK, gradients, blur, multiple devices,
0.3–0.5 s per image. Koubou / frameit / Satori / GUI editors were rejected for the reasons
in that report.

## Platforms and device frames

```sh
node scripts/render.mjs manifest.json --platform ios       # iPhone 16 Pro Max bezel (default)
node scripts/render.mjs manifest.json --platform android   # Pixel 5 frame — use for Google Play
node scripts/render.mjs manifest.json --frame galaxy-s21   # or pick a frame explicitly
```

`assets/frames/frames.json`: `iphone-16-pro-max`, `iphone-17-pro-max`, `iphone-air` (Apple bezels
via Koubou), `pixel-5`, `galaxy-s21` (Facebook Design frames via fastlane frameit). Every frame is
normalised to the same on-canvas width, so all layouts work with any frame; a screen can override
with `"frame": "galaxy-s21"` (e.g. an "also on Galaxy" slide). Feed each frame screenshots of its
own aspect: iPhone 1320×2868 from the simulator, Android 1080×2340 from the emulator — the
screenshot is cover-fitted into the frame's screen box, so a wrong aspect gets cropped, not
squashed. Do **not** put iPhone screenshots in Pixel frames for Play or vice versa: reviewers notice.

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
      "subtitle": "行事曆、待辦與提醒整合在同一個畫面。", "sticker": "New", "shot": "raw/zh-TW/01.png" },
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

## 2. Pick style and layouts with the human (🧑)

```sh
node scripts/render.mjs manifest.json --preview styles  --out preview   # screen 1 in every style
node scripts/render.mjs manifest.json --preview layouts --out preview   # screen 1 in every layout
```

Each writes a labelled contact sheet (`preview-styles.png`, `preview-layouts.png`) at thumbnail
size — the size the store actually shows first. Show it, let the human pick **one style for the
deck** and a **layout per screen**, write the choices into the manifest, then render for real.
Styles that position the device themselves (bento-dark) declare the layouts they support and
fall back with an `ℹ` line instead of producing a broken image.

## 3. Render

```sh
node scripts/render.mjs manifest.json --out framed/zh-TW          # all screens
node scripts/render.mjs manifest.json --out framed --only 01,fg   # subset
node scripts/render.mjs manifest.json --out framed --html         # keep the HTML for tweaking
node scripts/render.mjs manifest.json --out framed --strict       # exit 1 on quality warnings (CI)
```

Each screen prints `✓` or `⚠` with the reason. `report.json` in the output dir lists
files, style, layout and issues.

## 4. Styles × layouts

Styles (`styles/<name>.html`, self-contained HTML+CSS; each declares a `default-layout`
so decks differ in composition, not just colour; copy one to make your own):

| style | look | default layout | good for |
|---|---|---|---|
| `editorial-light` | warm paper, serif display, highlighter under ==word==, sticker | tilt-left | lifestyle, journaling, health |
| `bento-dark` | glass cards on a glow, stat `tiles` | float (only float/hero) | data, finance, pro tools |
| `minimal-light` | white, centred, accent on ==word== | frameless-bleed | utilities, Things-style purity |
| `bold-dark` | black, diagonal neon stripes, uppercase grotesk | peek-sides | fitness, games, Gen-Z |
| `pastel-soft` | soft gradient, floating circles | card-stack | couples, kids, wellness |
| `mesh-glass` | mesh gradient, frosted panel, gradient text | callout | AI, productivity |
| `paper-sticker` | craft paper, tape, handwritten badge, marker highlight | mosaic | indie, notes, hobbies |
| `photo-backdrop` | full-bleed photo (`bgImage`) under a scrim | split-right | travel, food, lifestyle |
| `neo-brutalist` | flat yellow, thick borders, hard offset shadows | tilt-right | tools, dev, bold brands |
| `playful-pop` | saturated solid, white rounded type, drop shadows | two-up | learning, kids, games |
| `retro-warm` | 70s arcs, italic serif display | crop-zoom | coffee, music, journaling |
| `dark-pro` | near-black grid, mono badge, gradient headline | bleed-bottom | dev tools, finance, "Linear-like" |
| `feature-graphic` | 1024×500 Play header | — | Google Play only |

Layouts (`render.mjs` `LAYOUTS`) — **composition**, not just device position:

| layout | what it shows | copy | needs |
|---|---|---|---|
| `bleed-bottom` / `bleed-top` | framed device cut by an edge | top / bottom | `shot` |
| `float` | smaller framed device, shadow | top | |
| `tilt-left` / `tilt-right` | ±7° framed device, bleeds bottom | top | |
| `two-up` | two framed devices side by side | top | `shot2` |
| `peek-sides` | two devices entering from left and right edges | top | `shot2` |
| `hero` | big framed device, no copy | none | |
| `split-right` | device on the left half, copy on the right | right | |
| `frameless-bleed` | the screenshot itself as a rounded card | top | |
| `card-stack` | two frameless cards fanned | top | `shot2` |
| `mosaic` | three frameless cards side by side, middle raised (triptych) | top | `shot2`, `shot3` |
| `crop-zoom` | a magnified region of the UI (`crop: {x,y,w,h}`) | top | `crop` |
| `callout` | framed device + circular magnifier (`focus: {x,y}`, `bubble: {right,top}`) | top | `focus` |
| `persp-left` / `persp-right` | device turned ±26° in 3D perspective | top | |
| `lean-back` | device tilted back 22° (rotateX) | top | |
| `iso-pair` | two devices at the same 30° angle, staggered | top | `shot2` |
| `panorama` | one tilted device across two tiles (`id-1.png`, `id-2.png`) | top | |

Pick one style per deck; vary layouts across it (never the same composition twice in a
row, ≤ 1 panorama, the strongest one on screen 1). `crop-zoom` and `callout` are how you
follow the playbook rule "zoom into the part the headline is about".

## 5. Quality bar (automated, from `references/quality-bar.md`)

After each render the page is measured:
- device occupies the expected share of canvas height (per layout; a style can override
  with `<!-- expect: 0.35-0.6 -->`),
- headline does not overflow horizontally (shorten, `\n`, or lower `titleSize`),
- copy block does not overlap the device by more than 40 px.

Warnings are printed; `--strict` fails the run. The rest of the bar (one message per
shot, 3 visual layers max, seam rules for panoramas) is on the human.

## 6. Upload

```sh
gpc images upload --type phoneScreenshots --locale zh-TW --path ./framed/zh-TW/
gpc images upload --type featureGraphic  --locale zh-TW --path ./framed/zh-TW/fg.png
asc screenshots upload …     # vendor/asc-skills → asc-shots-pipeline
```

Sizes produced and accepted as-is: 1320×2868 (iPhone 6.9"), 1024×500 (feature graphic).
Other sizes: set `size` per screen; layouts are tuned for 1320×2868, check the `⚠`.

## 7. Icon derivatives

`sh scripts/icon-set.sh assets/images/icon.png out/` → 1024 (ASC), 512 (Play), 180.

## References

- `references/renderer-evaluation.md` + `.png` — the bake-off (Playwright vs Koubou vs Satori vs frameit vs ParthJadhav)
- `references/quality-bar.md` — composition rules (ParthJadhav, MIT)
- `references/template-research.md` — open-source template repos, Figma CC-BY sets, 10 reference apps
- `references/layouts-research.md` — the 12 layout patterns and size tables
- `references/decks.png` — the same five-screen story rendered in all six styles
- `examples/deck.json` — that deck's manifest (pain → shift → proof → features)
- `example-manifest.json` — every style and layout in one file
