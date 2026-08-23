---
name: store-screenshots
description: Produce App Store and Google Play screenshots end to end in five steps — (1) App brief from the listing or a sentence, (2) Screens captured on a Release build with sim-use, (3) Look picked from a rendered catalogue of 30 styles or a reference set, (4) Sizes / platforms / locales, (5) Review page (brief + every headline) a teammate signs off before anything renders — then render with store-art, optionally generate mascots / stickers / backdrops with Codex, run the quality bar, upload with gpc / asc, and re-test copy after 30 days. Use when the user wants "store screenshots", "App Store screenshots", "Play screenshots", a "feature graphic", multi-locale screenshots, says their listing "doesn't convert", wants a reviewable plan before rendering, or when Expo Go's floating toolbar shows up in captures. Includes the headline checklist and 58 copy rules distilled from DesignerAnts / Paul Solt.
---

# store-screenshots

**70 % of a screenshot's effect is the text, not the UI.** One app lifted conversion 80 %
by rewriting captions on unchanged screens (Paul Solt, citing DesignerAnts). So the flow
writes the words first, gets them reviewed, and only then renders. Shoot-five-nice-screens-
then-caption-them is the mistake the whole article is about.

Five steps, one file per step, everything reviewable before a pixel is rendered:

```
1 App brief ──► 2 Screens ──► 3 Look ──► 4 Sizes ──► 5 Review ──► render ──► upload ──► measure
  brief.json     raw/<locale>/   style +    platform    review.html   store-art    gpc / asc   30 days
  (listing or    NN.png          catalogue  size        (artifact,    --strict
   a sentence)                   or ref set locale      teammates)
```

Companion skills: `store-art` (rendering, styles, assets), `store-listing` (description /
keywords), `submit-google` / `submit-apple` (upload). Verified on a fresh SDK 57 app, Aug 2026:
Release build → sim-use → store-art → accepted by Play.

## 0. Scaffold

```sh
node skills/store-art/scripts/new-deck.mjs store/screenshots --locale zh-TW
```

Creates `store/screenshots/` with `brief.json`, `copy.<locale>.json`, `raw/<locale>/`, `assets/`,
and a README listing the commands below. Everything that follows lives in that folder.

## 1. App brief (🧑 confirms)

Fill `brief.json → app`: **name, category, core value, target user** — three lines, not a feature
list. Already on a store? Import it:

```sh
node skills/store-art/scripts/import-listing.mjs "https://apps.apple.com/tw/app/…/id123?l=zh" --dir store/screenshots
node skills/store-art/scripts/import-listing.mjs "https://play.google.com/store/apps/details?id=com.x&hl=zh_TW" --dir store/screenshots
```

That fills name / category / rating / core value (first sentence of the description), saves the full
listing to `listing.json`, and downloads the **live** screenshots to `raw/<locale>/store-NN.png` — these
are finished marketing images, good for seeing what is on the store today, not raw UI; re-shoot in
step 2. Otherwise pull from `store/`, the README, onboarding copy, reviews.

Then the **look inputs**: 2–3 background options, 2–4 accent options, text colour, 3–5 tone words.
These are choices the reviewer picks between, not decisions made for them.

Write the **headline sequence** into `brief.json → screens` (one block per screenshot):

| # | role | job | screen type |
|---|---|---|---|
| 1 | `hook` | name the pain or the premise | app |
| 2 | `shift` | what changes for them | app |
| 3 | `proof` | a number, a collection, an outcome | app / text |
| 4–5 | `feature` | what makes the promise true | app |
| 6+ | `objection` / `social` / `platform` | privacy, price, a real quote, device breadth | text / testimonial |

Each block: `role`, `note` (why this screen exists), `type` (`app` \| `text` \| `testimonial`),
`shot` (a raw path or `auto`), `title`, `subtitle`, and for text/testimonial screens the
`features` row or the `quote`. Rules (full list: `references/copywriting.md`):

- ≤ 8 words / 12 CJK characters per headline; subtitle optional, ≤ 12 words.
- Outcome, not feature. "Dark mode" → "Easy on your eyes at 2 a.m."
- Verb-led or user-situation-led; never the app name or "Introducing".
- No "#1", "Best", "Download now", "Free", no emoji, no exclamation marks.
- **Cover-the-UI test**: the headlines alone, in order, must read as a story.
- Every locale is a rewrite, not a translation (`brief.zh-TW.json`, `brief.ja.json`…).

## 2. Screens (Release build, sim-use, no blind taps)

For each `app` screen decide which state proves the headline — often not the prettiest screen
("30 days of data", "3 items in list" → staging list). Then:

```sh
npx expo run:ios --configuration Release --device "iPhone 16 Pro Max"   # never Expo Go (floating toolbar)
sim-use describe-ui && sim-use tap @14 && sleep 1
sim-use screenshot --output raw/zh-TW/01.png                             # 1320×2868
```

- Staging tweaks get `// DO NOT COMMIT: screenshot staging`; `git checkout -- .` after.
- Release build fails → `eas-build-doctor` case 5 (Xcode 26.3 + expo-modules-jsi patch). Delete `ios/` after (CNG).
- One raw folder per locale; switch language in-app and rerun the same script.
- **Android for Play**: same steps on an emulator (`npx expo run:android --variant release`,
  `sim-use android screenshot --output raw-android/zh-TW/01.png`, 1080×2340). Never reuse iPhone
  captures in a Pixel frame.

Fill `shot` in the brief (or leave `auto` to let the compiler rotate through the captures).

## 3. Look (🧑 picks)

```sh
node skills/store-art/scripts/catalog.mjs --deck manifest.zh-TW.json --out preview/catalog   # 30 styles × the real copy
```

Show the catalogue sheets; the reviewer picks **one style for the whole deck** — it should contrast
with the category's usual palette. Alternatives: match one of the 31 analysed reference sets
(`store-art/references/reference-sets.md`, each mapped to a style), or a reference image the
team supplies (pick the closest style, tune tokens). Write it into `brief.json → look.style`.

Assets the deck needs that no one can draw — mascot, 3D stickers, feature icons, a backdrop —
are listed in `assets.json` and generated once:

```sh
node skills/store-art/scripts/gen-assets.mjs assets.json --out assets --ref raw/zh-TW/01.png
```

(Codex image generation; the real UI stays a screenshot, the headline stays text.) Without assets,
pick a style that needs none — all but photo-backdrop / photo-glass / paper-sticker.

## 4. Sizes

`brief.json → output`: `platform` (`ios` \| `android`), `size` (iPhone 6.9" 1320×2868 is the one
required size; iPad 13" 2064×2752 if universal; Play accepts the iPhone size), `locale`,
`subtitles` on/off. One brief per locale; one manifest per platform.

## 5. Review (🧑 signs off — the gate)

```sh
node skills/store-art/scripts/brief.mjs brief.json --review review.html          # the page
node skills/store-art/scripts/brief.mjs brief.json --review review.html --thumbs framed/zh-TW   # with renders, second round
```

`review.html` is one self-contained page: app facts, the look choices with the chosen option
marked, the cover-the-UI line, one card per screen (type · screenshot · headline · subtitle), and
the review checklist. Publish it as an artifact so teammates comment in place; fold the comments
into `brief.json` and regenerate. Nothing renders until this page gets a yes.

## Render

```sh
node skills/store-art/scripts/brief.mjs brief.json --compile manifest.zh-TW.json
node skills/store-art/scripts/render.mjs manifest.zh-TW.json --out framed/zh-TW --strict
node skills/store-art/scripts/render.mjs manifest.zh-TW.json --platform android --out framed-android/zh-TW
```

The compiler maps screen types to layouts (`app` → framed rotation, `text` → no-device with the
feature row, `testimonial` → quote card + stars); edit the manifest for per-screen nudges
(`device`, `elements`, `layout`) — `store-art/references/manifest-reference.md` lists every knob.
`⚠` lines are the quality bar; fix the manifest, don't ignore them. Open the PNGs at thumbnail
size once: can you read every headline?

## Upload

```sh
gpc images upload --type phoneScreenshots --locale zh-TW --path ./framed-android/zh-TW/ --replace --confirm
gpc images upload --type featureGraphic  --locale zh-TW --path ./framed-android/zh-TW/fg.png
asc screenshots upload …    # vendor/asc-skills asc-shots-pipeline; per-locale fan-out matches framed/<locale>
```

## Measure, rewrite, repeat

Store pages are ads; ads get tested. After 30 days read App Analytics / Play Console conversion.
If flat, rewrite the headlines in `brief.json` — not the design — and rerun steps 5 → render.
Apple: Product Page Optimization (3 treatments); Play: Store Listing Experiments. Change the
first screenshot first.

## Sizes

| Store | Required | Pixels | Notes |
|---|---|---|---|
| App Store | iPhone 6.9" | 1320×2868 | 16 Pro Max simulator; ASC scales to smaller iPhones |
| App Store | iPad 13" (if iPad) | 2064×2752 | |
| Google Play | phone 2–8 shots | 1320×2868 accepted; 16:9 or 9:16, 320–3840 px | same files work |
| Google Play | feature graphic | 1024×500 | `style: feature-graphic` |

## References

- `references/optimization-theory.md` — the working model (funnel, words, sequence, visuals, compliance, testing) with the one-page checklist
- `references/copywriting.md` — 58 rules, 15 before→after rewrites, the 10-item checklist, sources
- `references/paul-solt-screenshot-mistake.md` — the article this workflow is built on
- `../store-art/examples/brief.json` — a complete six-screen brief (app / text / testimonial screens)
- `../store-art/references/quality-bar.md` — composition rules
