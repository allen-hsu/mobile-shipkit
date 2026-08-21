---
name: store-art
description: Render finished App Store / Google Play screenshots from raw captures with HTML/CSS styles and Playwright — fifteen visual styles (editorial-light, bento-dark, minimal-light, bold-dark, pastel-soft, mesh-glass, paper-sticker, photo-backdrop, neo-brutalist, playful-pop, retro-warm, dark-pro, artsy-flat, photo-glass, bento-light; plus feature-graphic) × twenty-four compositions (bleed, float, tilt, 3D perspective, lean-back, iso-pair, two-up, peek-sides, hero, split-right, frameless cards, card-stack, scatter collage, mosaic triptych, crop-zoom, callout magnifier, panorama, sandwich, no-device, quote) plus an elements layer (UI crops, laurel/circle/pill stamps, stars, big stats, logo grids, testimonial cards, feature grids, stickers), with iPhone 16/17 Pro Max, iPhone Air, Pixel 5 and Galaxy S21 frames selected per platform, driven by one JSON manifest, with an automatic quality check (device height ratio, headline overflow, copy/device overlap) and store-policy guardrails (Play: no frames / ≤20 % text / banned promo words / no iPhone imagery; Apple 2.3.10). Use when the user wants to "frame screenshots", "make store screenshots look professional", needs a "feature graphic", "panoramic / continuous screenshots", CJK captions, or a Play 512 icon from a 1024 master. Copy comes from store-screenshots (write headlines first); this skill only renders.
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

## Store rules the renderer enforces

Sources: [Play Console Help — preview assets](https://support.google.com/googleplay/android-developer/answer/9866151),
[App Store Review Guidelines 2.3.10](https://developer.apple.com/app-store/review/guidelines/#accurate-metadata).

| rule | what happens |
|---|---|
| Play: no device frames in phone screenshots ("highly recommended"; featuring eligibility) | `--platform android` maps framed layouts to frameless ones and says so; `--allow-frames` keeps them |
| Play: no third-party trademarks / Apple: no other platforms' devices | an iOS frame on an android deck (or vice versa) **stops the run** unless `--allow-cross-platform` |
| Play: text overlay ≤ 20 % of the image | measured; `⚠` above 20 % |
| Play: no "Best / #1 / Top / New / Free / Discount / Sale / Million downloads" (EN + zh) | `⚠` when copy contains one |
| Play feature graphic: no device imagery, no "Free/New" | device removed automatically on android |
| Apple 2.3.10: no references to Android / Google Play in iOS copy | `⚠` when copy contains one |
| Apple / Play: screenshots must show the real app | on you — staging data yes, fake UI no |

`--strict` turns every `⚠` into a non-zero exit for CI.

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
| `photo-glass` | full-bleed photo + frosted dark panel holding UI crops (the Haptic look) | no-device | journaling, lifestyle, premium |
| `bento-light` | light version of bento-dark | float | data, health |
| `artsy-flat` | one flat colour per screen (`brand.palette` cycles), white-mat frameless phones with a black outline, left-aligned grotesk | scatter | marketplaces, culture, fashion (the Artsy look) |
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
| `frameless-bleed` / `frameless-top` | the screenshot itself as a rounded card, cut by the bottom / top edge | top / bottom | |
| `sandwich` | two frameless cards bleeding off top and bottom, copy in the middle | middle | `shot2` |
| `no-device` / `quote` | headline + elements only / a testimonial card alone | top / none | `elements` |
| `scatter` | four small tilted cards thrown across the canvas (Artsy-style collage), copy at the bottom | bottom | `shot2..shot4` |
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

## 4a. Styles are recipes of components

A style is `styles/<name>.json` assembled from `components/`:

```json
{ "bg": ["blobs", "grid"], "type": "serif-editorial", "device": "soft-shadow", "decor": ["sticker-red"],
  "tokens": { "bg": "#F4EFE6", "ink": "#1B1A17", "accent": "#FFB562", "accent2": "#7FC8A9", "muted": "#4A463F" },
  "defaultLayout": "tilt-left", "layouts": ["float","hero"], "expect": "0.4-0.75", "deviceOffset": 110, "css": "…" }
```

| slot | components |
|---|---|
| `bg` (one or many) | `solid` `gradient` `blobs` `grid` `mesh` `glow` `beam` `stripes` `arcs` `circles` `bubbles` `boxes` `photo` `dots` |
| `type` | `serif-editorial` `grotesk-upper` `clean-centered` `rounded-playful` `soft-centered` `gradient-text` `handwritten-accent` `photo-overlay` `brutal-block` `italic-serif` `mono-pro` `grotesk-left` `bento-cards` |
| `device` | `soft-shadow` `light-shadow` `deep-shadow` `hard-offset` `flat-pop` `paper-cut` `glow-ring` `white-mat` `none` |
| `decor` | `sticker-red` `sticker-hand` `tape` `rim` `glass-panel` `dark-glass-panel` `bento-tiles` `copy-card` |

Tokens become CSS variables (`--bg --ink --accent --accent2 --accent3 --muted --em --pad
--copy-top --copy-bottom --grid-color …`). A new style is usually four names and five
colours; a new component is one small JSON with `css` (+ optional `html`). Hand-written
`styles/<name>.html` still works for one-offs (`feature-graphic.html`).

## 4c. Your assets (what the renderer cannot invent)

Of the 31 reference sets, 11 depend on artwork the app team supplies: mascots, line-art
illustrations, 3D stickers, product photos, hand-holding-phone photos, partner logos. The
manifest takes them as files — put them under `assets/` next to the manifest:

```json
{ "id": "01", "layout": "no-device", "bgImage": "assets/hero.jpg",
  "elements": [ { "type": "image", "file": "assets/mascot.png", "width": 900, "at": {"x": "50%", "y": 1500} },
                { "type": "logos", "files": ["assets/press/time.svg", "assets/press/forbes.svg"], "cols": 2, "at": {"x":"50%","y":2500} } ] }
```

PNG / JPG / WebP / SVG. A missing file stops the run with the path. Licensing is on you:
stock photos, third-party logos and Apple/Google artwork need permission (Play rejects
unlicensed trademarks; Apple 5.2 too).

## 4b. Elements — the layer that makes real store sets look real

Analysis of 31 shipped App Store sets (`references/reference-sets.zh-TW.md`) found the
difference is rarely the background: it is **UI fragments lifted out of the phone, proof
stamps, big numbers, logo rows, quotes**. Each screen takes `elements: [...]`, rendered
above the device; `at` is `{x, y}` in px or `%` of the canvas (element centre).

| type | what | keys |
|---|---|---|
| `crop` | a piece of the screenshot lifted out as a floating card (a row, a button, a bubble) | `crop:{x,y,w,h}` in screenshot px, `width`, `rotate`, `radius`, `shot` |
| `stamp` | proof badge — `laurel` (wreath), `circle` (dark stamp), `pill` | `kind`, `value`, `label`, `size` |
| `stars` | ★★★★★ + caption | `rating`, `label` |
| `stat` | one big number + small label | `value`, `label`, `size` |
| `logos` | press / partner logo grid | `files[]`, `cols`, `width` |
| `quote` | testimonial card | `text`, `author`, `role`, `avatar`, `width` |
| `features` | icon + label grid | `items:[{icon,label}]`, `cols`, `width` |
| `image` | sticker, 3D icon, illustration, photo | `file`, `width`, `rotate`, `shadow` |
| `text` | free caption | `text`, `size`, `width`, `align` |

Headline emphasis: `==word==` (style's accent treatment) and `::word::` (solid pill). Two
device-free layouts carry these: `no-device` (copy + elements) and `quote` (elements only).
`examples/elements-showcase.json` renders one of each.

Proof elements are where Play's banned words bite ("million downloads", "#1", "best") and
where Apple's 5.2.5 applies (no fabricated endorsements) — only real, current numbers.

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
- `examples/elements-showcase.json` — every element type once
- `references/reference-sets.zh-TW.md` — 31 shipped sets analysed one by one, mapped to style × layout × elements, with store-rule flags
- `example-manifest.json` — every style and layout in one file
