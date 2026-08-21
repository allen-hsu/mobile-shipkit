---
name: store-screenshots
description: Produce App Store and Google Play screenshots end to end, copy first — write the headline sequence (pain → shift → proof → features) before capturing anything, then shoot a Release build on the iOS simulator with sim-use, render with store-art, run the quality bar, upload with gpc / asc, and re-test copy after 30 days. Use when the user wants "store screenshots", "App Store screenshots", "Play screenshots", a "feature graphic", multi-locale screenshots, says their listing "doesn't convert", or when Expo Go's floating toolbar shows up in captures. Includes the headline checklist and 58 copy rules distilled from DesignerAnts / Paul Solt.
---

# store-screenshots

**70 % of a screenshot's effect is the text, not the UI.** One app lifted conversion 80 %
by rewriting captions on unchanged screens (Paul Solt, citing DesignerAnts). So this skill
writes the words first, then decides which screen proves each sentence, then shoots,
then renders. Doing it in the other order — shoot five nice screens, caption them with
feature names — is the mistake the whole article is about.

Verified on a fresh SDK 57 app, Aug 2026: Release build → sim-use → store-art → accepted
by Play. Companion skills: `store-art` (rendering), `store-listing` (description/keywords),
`submit-google` / `submit-apple` (upload).

## 0. Read the app, not the feature list

Before writing: who is this for, what were they struggling with before, what changes after
a week of use, what is the one number or fact that proves it. Pull from `store/`, the
README, onboarding copy, reviews if any. Output three lines: **pain / shift / proof**.

## 1. Write the headline sequence (🧑 human signs off)

Each screenshot is one ad with one job. The order that converts (DesignerAnts):

| # | job | example |
|---|---|---|
| 1 | **Name the pain** | "Buried in notes you'll never find again?" |
| 2 | **State the shift** | "Everything you capture, organized automatically." |
| 3 | **Show proof** | "Used by 10,000 developers every day." (real numbers only) |
| 4–5 | **Deliver the features** that make #2 true | "Search by what you meant, not what you typed." |
| 6+ | optional: objections (price, privacy), platform breadth, social proof | |

Rules (full list with sources: `references/copywriting.md`):

- ≤ 8 words per headline; ≤ 6 is better. Subtitle ≤ 12 words, optional.
- Outcome, not feature. "Dark mode" → "Easy on your eyes at 2 a.m."
- Start with a verb or the user's situation, never the app's name or "Introducing".
- No "#1", "Best", "Download now", no emoji, no exclamation marks.
- **Cover-the-UI test**: read only the headlines in order. Is it a story, or a spec sheet?
- Write every locale as a rewrite, not a translation (`copy.zh-TW.json`, `copy.ja.json`…).
- Headlines must read at thumbnail width (~120 px on a phone search result).

Write `copy.<locale>.json`:

```json
[
  { "id": "01", "role": "pain",    "title": "Notes you'll ==never find== again?", "subtitle": "" },
  { "id": "02", "role": "shift",   "title": "Captured, then ==organized== for you", "subtitle": "No folders. No tagging." },
  { "id": "03", "role": "proof",   "title": "==10,000== developers, every day", "badge": "4.8 ★" },
  { "id": "04", "role": "feature", "title": "Search what you ==meant==", "subtitle": "Not what you typed." },
  { "id": "05", "role": "feature", "title": "Works ==offline==", "subtitle": "Syncs when you're back." }
]
```

> 🧑 Human step: the headlines are the product. Show the list, get a yes, then shoot.

Checklist before moving on (10 items, `references/copywriting.md` §3): word count ·
verb-led · outcome over feature · no marketing clichés · legible at 120 px · no idioms
that won't localize · passes cover-the-UI · pain is specific · numbers verifiable ·
every locale rewritten.

## 2. Decide the proof screen for each headline

Only now choose screens: for each line, which screen is the *evidence*? Often it is not
the prettiest screen. Note what state it needs ("30 days of data", "3 items in list") —
that is your staging list.

## 3. Stage and shoot (Release build, sim-use, no blind taps)

```sh
npx expo run:ios --configuration Release --device "iPhone 16 Pro Max"   # never Expo Go (floating toolbar)
sim-use describe-ui                              # aliases @N for every element
sim-use tap @14                                  # by alias or --label, never coordinates
sleep 1                                          # there is no `sim-use wait`
sim-use screenshot --output raw/zh-TW/01.png     # 1320×2868 on 16 Pro Max
```

- Staging tweaks in code get `// DO NOT COMMIT: screenshot staging`; `git checkout -- .` after.
- Long flows: `sim-use record-video --output flow.mp4` once, then stills.
- Release build fails? → `eas-build-doctor` case 5 (Xcode 26.3 + expo-modules-jsi needs
  the patch the template ships). Delete `ios/` afterwards (CNG).
- One raw folder per locale; switch language in-app and rerun the same script.

## 4. Render with store-art

Build `manifest.<locale>.json` from `copy.<locale>.json` + raw paths. Then let the human
choose — never pick the look silently:

```sh
node ../store-art/scripts/render.mjs manifest.zh-TW.json --preview styles  --out preview
node ../store-art/scripts/render.mjs manifest.zh-TW.json --preview layouts --out preview
```

> 🧑 Human step: show `preview-styles.png` (pick **one** style for the whole deck — it should
> contrast with the category's usual palette) and `preview-layouts.png` (pick a layout per
> screen; vary them, ≤ 1 panorama, strongest composition on screen 1). Write the picks into
> the manifest.

```sh
node ../store-art/scripts/render.mjs manifest.zh-TW.json --out framed/zh-TW --strict
```

`⚠` lines are the quality bar talking (device share, headline overflow, copy overlap) —
fix the manifest, don't ignore them. Open the PNGs at thumbnail size once: can you read
every headline?

## 5. Upload

```sh
gpc images upload --type phoneScreenshots --locale zh-TW --path ./framed/zh-TW/ --replace --confirm
gpc images upload --type featureGraphic  --locale zh-TW --path ./framed/zh-TW/fg.png
asc screenshots upload …    # vendor/asc-skills asc-shots-pipeline; per-locale fan-out matches framed/<locale>
```

## 6. Measure, rewrite, repeat

Store pages are ads; ads get tested. After 30 days read App Analytics / Play Console
conversion (impressions → installs). If flat, rewrite the headlines — not the design —
and run steps 1 → 4 again. Apple lets you A/B up to three treatments (Product Page
Optimization); Play has Store Listing Experiments. Use them before touching the UI.

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
- `../store-art/references/quality-bar.md` — composition rules
