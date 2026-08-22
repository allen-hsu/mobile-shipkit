# Manifest reference — every knob, where it lives, what it changes

The manifest is the only input. Everything below is a key in it (or a CLI flag). Keys cascade:
**style tokens → `brand` → screen**; the most specific wins. Run `node scripts/render.mjs --list`
for the current catalogue of styles, layouts and components — this file documents the keys, not the names.

## 1. Top level

| key | type | effect |
|---|---|---|
| `platform` | `ios` \| `android` | frame family + store rules. Android maps framed layouts to frameless ones (`FRAMELESS_FOR`) unless `--allow-frames`. CLI `--platform` overrides. |
| `frame` | frame name | explicit bezel (`assets/frames/frames.json`); CLI `--frame` overrides. |
| `style` | style name | deck-wide look; a screen may override, but one style per deck is the rule. |
| `layout` | layout name | deck-wide default; usually set per screen instead. |
| `titleSize` | px | default headline size (150 on phones, 62 on feature graphic). |
| `brand` | object | colour / font overrides for the whole deck, see §2. |
| `screens` | array | one object per output image, see §3. |

## 2. `brand` (deck-wide) — also valid per screen

| key | effect |
|---|---|
| `bg`, `bg2`, `ink`, `accent`, `accent2`, `accent3`, `muted`, `dotColor` | recolour the style. Written as CSS variables after the style's tokens, so they always win. `bg2` is the gradient end; `accent3` the third mesh blob; `dotColor` the dot grid. |
| `palette` | array of colours; screen *i* gets `palette[i % n]` as `bg`. Styles can declare their own (`pastel-grain`, `artsy-flat`). |
| `bgImage` | backdrop image under every style (z 0; the `photo` bg component adds its scrim). |
| `bgSpan` | `true` → `bgImage` is one wide picture shared by the whole deck; screen *i* shows slice *i* of *N* so the set reads as a continuous scene when swiped (the 500+-templates trick). `bgSpanCount` overrides *N*; `bgImageOpacity` fades it. Make the picture `N × 1320` wide. |
| `fontFamilies` | Google Fonts query list, replaces the default set. |
| `fonts.local` | folder of .ttf/.otf/.woff2 embedded as `@font-face` (offline/CI). |
| `titleSize` | as top level. |

## 3. Screen

### Identity & copy

| key | effect |
|---|---|
| `id` | output filename (`01.png`). Panorama emits `id-1.png`, `id-2.png`. |
| `size` | `[w, h]`, default 1320×2868; `feature-graphic` uses 1024×500. |
| `span` | 2 = panorama across two tiles. `tiles: [{title, subtitle, badge}]` gives each tile its own copy. |
| `badge` | small label above the headline (pill, wordmark or mono tag — the type component decides). |
| `title` | headline. `\n` breaks lines. `==word==` = the style's emphasis (underline, colour, script, gradient, box…). `::word::` = solid pill. |
| `subtitle` | one line under the headline. |
| `copy` | `top` \| `bottom` \| `middle` \| `right` \| `none`. Flipping it away from the layout's default switches the layout to its `alt` placement when one exists (e.g. `float` + `copy:bottom` moves the phone up). |
| `align` | `left` \| `center` \| `right` — overrides the type component's alignment for this screen. |
| `titleSize` | px, this screen only. |

### Screenshots

| key | effect |
|---|---|
| `shot` | main screenshot (path relative to the manifest). iPhone 1320×2868 for iOS frames, 1080×2340 for Android. Cover-fitted: wrong aspect is cropped, never squashed. |
| `shot2` … `shot4` | extra screenshots for multi-device layouts (`two-up`, `peek-sides`, `mosaic`, `scatter`, `card-stack`, `deck`, `two-strip`, `sandwich`, `iso-pair`). Missing ones fall back to `shot`. |
| `frame` | bezel for this screen only (an "also on Galaxy" slide). Cross-platform frames stop the run unless `--allow-cross-platform`. |
| `crop` | `{x,y,w,h}` as **fractions 0–1 of the screenshot** — region shown by `crop-zoom`. |
| `cropWidth` | px width of the crop-zoom card (default 1120). |
| `focus` / `bubble` | `callout`: `{x,y}` fraction to magnify; `{right, top}` px for the bubble. |
| `strip` / `stripWidth` | `two-strip`: crop fraction per strip (default middle 64 %) and width (560). |

### Device placement (`device`)

```json
"device": { "top": -300, "scale": 0.8, "x": "46%", "blur": 14 }
```

| key | effect |
|---|---|
| `top` | px, replaces the layout's `top:` (negative = bleeds the top edge). |
| `scale` | 0–1.2, replaces the layout's `scale()`; the frame is normalised to 1470 px wide at scale 1, so `0.9` ≈ full width on a 1320 canvas. |
| `x` | px or `%`, replaces `left:`. Phones are centred by `translateX(-50%)`, so `50%` is centred. |
| `blur` | px — defocused backdrop phone (put a `crop` element in front of it). |

Rotation/perspective stay with the layout; change the layout (`tilt-*`, `persp-*`, `lean-back`, `tilt-hard-*`) rather than fighting it.

### Colour (per screen)

`bg`, `bg2`, `ink`, `accent`, `accent2`, `accent3`, `muted`, `dotColor` — same as `brand`, this screen only. This is how one deck goes green → blue mid-way (#1) or neon → black (#10).

### Elements (`elements: [...]`)

Rendered above the device (z 4). Every element has `at: {x, y}` (px or `%`, the element's **centre**) and optional `rotate` (deg).

| type | keys | notes |
|---|---|---|
| `crop` | `crop` {x,y,w,h} fractions, `width`, `radius`, `shot` | a piece of UI lifted out as a card. `radius` = half the width gives a circle. |
| `image` | `file`, `width`, `shadow:false` | PNG/JPG/WebP/SVG from `assets/` — mascots, 3D stickers, photos. |
| `stamp` | `kind` = `laurel` \| `circle` \| `pill` \| `sticky` \| `scallop`, `value`, `label`, `size` | proof badges. Laurel is an SVG wreath coloured by `--laurel` (falls back to accent). |
| `stars` | `rating`, `label` | ★★★★★ |
| `stat` | `value`, `label`, `size` | one big number |
| `logos` | `files[]`, `cols`, `width` | press / partner row |
| `quote` | `text`, `author`, `role`, `avatar`, `width`, `kind: "plain"` | card by default; `plain` = big quote mark + text, no card |
| `features` | `items:[{icon,label}]`, `cols`, `width` | emoji or image icons |
| `text` | `text`, `size`, `width`, `align`, `opacity`, `weight` | captions, footnotes, faded word lists. `〔需素材：…〕` placeholders go here. |

Text inside elements is scanned by the store-rule checks like the headline is.

## 4. Style recipe (`styles/<name>.json`)

```json
{ "bg": ["grid", "beam"], "type": "mono-pro", "device": "glow-ring", "decor": ["rim"],
  "tokens": { "bg": "#0A0A0B", "ink": "#F5F5F7", "accent": "#7C8CF8", "accent2": "#34D399", "muted": "#A1A1AA",
              "pad": "110px", "copyTop": "180px", "copyBottom": "190px", "cropRing": "rgba(255,255,255,.35)" },
  "defaultLayout": "bleed-bottom", "layouts": ["float", "hero"], "expect": "0.4-0.75", "deviceOffset": 110,
  "palette": ["#DCCBFF", "#FFD9E4"], "css": "…extra css…" }
```

| key | effect |
|---|---|
| `bg` / `type` / `device` / `decor` | component names (`components/<slot>/<name>.json`). `bg` and `decor` take arrays; later entries paint on top. |
| `tokens` | become `--kebab-case` CSS variables. Common: `bg bg2 ink accent accent2 accent3 muted pad copyTop copyBottom cropRing gridColor gridSize dotColor dotSize laurel stickyInk stroke bgAngle`. |
| `defaultLayout` | used when the manifest gives none. |
| `layouts` | whitelist; other layouts fall back with an `ℹ` (styles that place the device themselves, e.g. bento). |
| `expect` | device-height share the quality bar accepts for this style. |
| `deviceOffset` | px pushed down for tall copy blocks. |
| `palette` | per-screen background rotation. |
| `css` | escape hatch appended after the components. |

A component is `{ "css": "…", "html": "…" }`. `base.html` is the skeleton every style is poured into: `:root{tokens; brand}` → bg html → `.copy` (badge/h1/p) → device(s) → elements → decor.

## 5. Layout (`LAYOUTS` in `render.mjs`)

```js
'bleed-top': { copy: 'bottom', css: 'left:50%;top:-1060px;transform:translateX(-50%) scale(.98)', expect: [0.6, 0.8],
               alt: { css: '…' } }
```

`css` positions the `.device` (transform-origin top centre). `second`/`third` position extra cards; `kind` picks the renderer (`device` default, `frameless`, `stack`, `mosaic`, `scatter`, `deck`, `strips`, `crop`, `callout`, `peek`, `none`). `alt` is used when the screen flips `copy`. `expect` is the device-height range the quality bar checks. `FRAMELESS_FOR` maps each framed layout to its Play-safe equivalent.

## 6. CLI

| flag | effect |
|---|---|
| `--out DIR` | output folder (default `framed`) |
| `--only 01,fg` | subset by id prefix |
| `--platform ios\|android`, `--frame NAME` | see top level |
| `--preview styles\|layouts` | screen 1 fanned out into a contact sheet |
| `--html` | keep the HTML next to each PNG (open it, tweak CSS live, port the change back to a component) |
| `--strict` | any `⚠` → exit 1 |
| `--allow-frames`, `--allow-cross-platform` | override the two Play guardrails |
| `--list [--json]` | print the catalogue |

`scripts/catalog.mjs [--deck X] [--styles a,b] [--platform] [--tile 520] [--per-sheet 10]` renders the house deck in every style into review sheets. `scripts/new-deck.mjs DIR [--locale] [--style] [--platform]` scaffolds a project.

## 7. Quality bar & store rules (what the `⚠` lines mean)

- *device occupies N % (want a–b)* — phone too small/large for this layout; change `device.scale/top` or the layout.
- *headline overflows* — shorten, add `\n`, lower `titleSize`.
- *copy overlaps device by N px* — move copy (`copy`, `copyTop/Bottom` token) or device (`device.top`).
- *Play: text covers N %* / *banned word* / *iPhone frame on android* — policy; fix the copy or let `--platform android` remap.
- *missing asset* — path in the message; screenshots go in `raw/`, user art in `assets/`.

## 8. Brief (`brief.json`, the step-1…5 file) → manifest

`scripts/brief.mjs brief.json --compile manifest.json` maps the review-level plan to render-level keys:

| brief | manifest |
|---|---|
| `look.style`, `look.brand` | `style`, `brand` |
| `output.platform` | `platform` |
| `assets[]` containing `bg-`/`backdrop` | `brand.bgImage` |
| screen `type: "app"` + `shot` | framed layout rotation (bleed-bottom → float → tilt-right → bleed-top → two-up → tilt-left), `shot`; `auto` rotates through the captures |
| screen `type: "text"` + `features` / `illustration` | `no-device` + `features` / `image` elements |
| screen `type: "testimonial"` + `quote` | `quote` layout + `quote` (+ `stars`) elements |
| screen `type: "cta"` + `cta` text | `no-device`, copy middle, one pill; flagged on Play (no download / install / free wording) |
| `output.subtitles: false` | subtitles dropped |
| per-screen `layout`, `device`, `elements`, `copy`, `badge` | passed through unchanged |

`--review review.html [--thumbs framed/<locale>]` renders the same file as the sign-off page.
