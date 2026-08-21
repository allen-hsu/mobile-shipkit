---
name: store-art
description: Turn raw simulator screenshots into finished App Store / Google Play artwork — framed screenshots in one of nine proven layouts (caption-top, caption-bottom, device-only, floating-tilt, feature-focus, before-after, panorama-2, panorama-3, feature-graphic), a 1024×500 Play feature graphic, and icon derivatives. Use when the user asks to "frame screenshots", "make store screenshots look good", "add captions to screenshots", wants a "feature graphic", "panoramic / continuous screenshots", or needs the Play 512×512 icon from a 1024 master. Driven by a JSON manifest and scripts/render.py on top of Koubou (the same renderer asc screenshots frame uses); no browser, no design tool.
---

# store-art

Raw screenshots → store-ready images. Companion to `store-screenshots` (which produces
the raw captures) and `store-listing` (which writes the copy). Verified end to end in
Aug 2026: simulator capture → `render.py` → `gpc images upload` accepted by Play.

## What you need

```sh
pip install koubou==0.18.1            # renderer; asc screenshots frame uses the same one
```

Device frames download on first use from Koubou's GitHub release. Fonts: Koubou accepts
`Helvetica`, `Arial`, `System`, or a **path to a .ttf/.ttc**. For CJK titles pass a file,
e.g. `"font": "/System/Library/Fonts/PingFang.ttc"`; a bare family name that is not one
of the three fails with "Failed to render text".

## 1. Write the manifest

`shots.json` — one entry per screenshot, in store order:

```json
{
  "name": "my-app",
  "brand": { "bg": ["#0F172A", "#1E3A5F"], "accent": "#38BDF8",
             "text": "#FFFFFF", "muted": "#CBD5E1", "font": "Helvetica", "direction": 180 },
  "shots": [
    { "file": "raw/en-US/01-home.png",  "title": "Log in five seconds", "subtitle": "Two taps. Done." },
    { "file": "raw/en-US/02-graph.png", "title": "See the pattern",     "badge": "NEW" },
    { "file": "raw/en-US/03-a.png", "file2": "raw/en-US/03-b.png", "title": "Light or dark" }
  ]
}
```

Copy rules (from the ASO research in `references/`): ≤ 6 words per title, one benefit per
screen, the first screenshot carries the whole pitch (70 % of visitors never swipe past it).

## 2. Pick a layout

```sh
python3 scripts/render.py --manifest shots.json --template caption-top --out framed/en-US
```

| template | composition | when |
|---|---|---|
| `caption-top` | title + subtitle on top, device bleeding off the bottom | default first shot; most apps |
| `caption-bottom` | device bleeding off the top, caption below | alternate with caption-top for rhythm |
| `device-only` | framed device on the brand gradient, no text | games / visual apps; fallback when copy is not ready |
| `floating-tilt` | device rotated −8°, shadow, caption on top | shots 2-4 of a set |
| `feature-focus` | small accent badge (NEW / FREE) + short title + big device | feature-by-feature sets |
| `before-after` | two smaller devices side by side (`file` + `file2`) | photo, fitness, light/dark |
| `panorama-2` | one large device spanning two consecutive shots | shots 1-2 as a pair |
| `panorama-3` | one tilted device across three shots | the Uber Eats / Airbnb look |
| `feature-graphic` | 1024×500, headline left, device right | Google Play header |

Templates are JSON in `templates/`; coordinates are canvas percentages, sizes in px at
1320×2868 (titles 80-90 px, subtitles 44-56 px — the range the research converged on).
Copy one and tweak to make your own.

Panoramas are rendered **once on a canvas N× wide and sliced** — Koubou drops any element
positioned outside 0-100 %, so "place the device at 150 %" does not work; slicing is the
only way to get pixel-exact seams.

## 3. Output layout → upload

`--out framed/<locale>` gives one directory per locale, which is what both uploaders want:

```sh
gpc images upload --type phoneScreenshots --locale en-US --path ./framed/en-US/iPhone_16_Pro_Max_-_Black_Titanium_-_Portrait/
gpc images upload --type featureGraphic  --locale en-US --path ./fg/.../01-home.png
asc screenshots upload …                 # see vendor/asc-skills asc-shots-pipeline
```

Sizes that came out of `render.py` and were accepted as-is: 1320×2868 (iPhone 6.9"),
1024×500 (feature graphic).

## 4. Icon derivatives

```sh
sh scripts/icon-set.sh assets/images/icon.png out/   # 1024 master → 512 (Play), 180/120/60 previews
```

Play wants 512×512 32-bit PNG ≤ 1 MB; iOS takes the 1024 master (Expo generates the rest).

## Store rules that bite

- Screenshots must show the **actual app**; captions and device frames are fine, fake UI is not.
- Don't put text in the centre 300×240 of the feature graphic — the play button overlay sits there.
- Localize captions per locale (`shots.<locale>.json`); Apple and Play both fan out per language.
- Apple rejects emoji in the *description*, not in screenshots — but keep captions plain anyway.

## References

`references/layouts-research.md` — the layout survey this catalogue was distilled from
(12 patterns, size tables, conversion data, tool comparison, sources).
