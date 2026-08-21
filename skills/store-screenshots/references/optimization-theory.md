# Store screenshot optimization — the working theory

A compact model of *why* screenshots convert, distilled from DesignerAnts (Teodora, 1,000+
App Store screenshot sets), the "App Store Screenshot Optimization Playbook" (100 practices
compiled from her feed — a gated PDF, summarized here in our own words, not reproduced),
Paul Solt's "The Screenshot Mistake That's Costing You Downloads", and the copy research in
`copywriting.md`. Each principle ends with **→ tooling**: what in this kit enforces or helps it.

## 0. The funnel you are optimizing

```
impression (search result: icon + name + first 1–3 screenshots, ~7 s, thumbnail-sized)
  → tap → product page (full-size carousel, one at a time)
    → install
```

- ~70 % never swipe past screenshot 1; ~90 % stop by screenshot 3. The first three carry the
  decision; 4+ are for the already-convinced.
- Screenshots are read at **thumbnail size first**. Anything that needs zooming does not exist.
- Conversion (page view → install) is the only score. "Beautiful" is an opinion; the number is not.

→ tooling: `render.mjs --preview` sheets are thumbnail-sized on purpose; judge there first.

## 1. Words carry ~70 % of the effect

Same screens, rewritten captions: +80–90 % conversion in DesignerAnts' cases. So:

1. **Headline first, screen second.** Write the sentence, then pick the screen that proves it.
2. **Outcome, not feature.** "Cloud sync" → "Your notes on every device." Ask "so what?" until it
   describes the user's life, not the app's spec.
3. **≤ 8 words, verb-led, plain language.** No jargon, no culture-bound references ("Pong"),
   no marketing clichés (#1, Best, Download now — the last is also an Apple rejection).
4. **One message per screen.** A comma or "and" in a headline is two screens.
5. **Specific beats vague.** "10,000 people every morning" > "Loved by many" — but only numbers
   you can defend and keep current.
6. **Tone matches the audience**; casing and punctuation consistent across the set; proofread.
7. **Localize as rewriting**, with room for 30 % expansion (DE/FR) and shorter CJK lines.

→ tooling: `copy.<locale>.json` with `role` per screen; the 10-item checklist in
`copywriting.md` §3; the headline-overflow check in `render.mjs`; `==word==` highlights
keep emphasis typographic instead of adding words.

## 2. The sequence is a story, not a catalogue

| # | job | why it is here |
|---|---|---|
| 1 | **Hook** — name the pain or ask the question | earns the swipe; gets tested most |
| 2 | **Shift** — what changes for them | the promise |
| 3 | **Proof** — number, rating, outcome visual | removes doubt before they leave |
| 4–5 | **Features** that make the promise true | for people still reading |
| 6+ | objections (privacy, price), platforms, second proof | optional |

If the screens work in any order, it is a catalogue. Reinforce the core value from different
angles rather than listing unrelated features. Put social proof where doubt peaks (3), not last.

→ tooling: `store-screenshots` §1 writes the sequence before capture; decks in
`store-art/references/decks/` show the rhythm; `--strict` refuses headline/device collisions.

## 3. Visual rules that serve the words

- **Contrast first.** Light on dark or dark on light; scrim or shadow over photos. Readable at
  postage-stamp size or it is decoration.
- **Stand out from the category, stay true to the brand.** If every competitor is blue/white,
  a warm or neon palette stops the scroll; extend the in-app palette for marketing if needed.
- **Real UI, enhanced.** Actual screens, best state, aspirational but achievable data. Crop or
  zoom into the part the headline is about; dim or remove the rest.
- **Three layers max**: background → device/illustration → headline + one accent. Every extra
  sticker must earn its place.
- **Familiar cues grab eyes**: a notification banner, badge, chat bubble — things people already
  recognise. (Do not fake *system* UI convincingly; Apple rejects that.)
- **Whitespace and safe margins**: ≥ 60 px from edges; the age-rating badge sits top-right of
  shot 1 and the video play button sits centre — keep copy away from both.
- **Device frame is a choice**, not a rule: frames add context, framelessness adds UI size. Vary
  device placement across the set (bleed / tilt / float / two-up) but never the style.
- **Dark vs light**: dark often pops on the white store page; pick by what the app looks best in,
  and keep the whole set consistent.
- **Panoramas** reward the swipe, but each tile must stand alone; the seam never cuts a
  headline, a face, or a key number.

→ tooling: one `style` per deck + varied `layout` per screen; the device-share / overlap
checks; `references/quality-bar.md` for the composition ranges; 60 px margins are baked into
every style's `--pad`.

## 4. Compliance — things that get a build rejected

- Show the app itself; no screens from other apps, no generic stock as the "screenshot".
- No calls to action ("Download now", "Install"), no price claims like "Free" in imagery, no
  "#1 / Best" superlatives you cannot source.
- No convincing fake system UI (notification shade, system dialogs) — stylised cues are fine.
- No Apple device trademarks misused; use official bezels or neutral frames.
- Upload the required sizes (iPhone 6.9" = 1320×2868; iPad 13" if universal) and per-locale
  sets; keep screenshots current with the shipped UI.

→ tooling: `store-art` ships Apple's bezel; sizes are defaults; `submit-apple` / `submit-google`
carry the store-specific rules.

## 5. Test, measure, iterate

- Ship a baseline, then run **Product Page Optimization** (App Store, up to 3 treatments) or
  **Store Listing Experiments** (Play). Change the **first screenshot first** — it moves the needle
  most. Test copy before design.
- Read conversion (page views → installs) for 2–4 weeks per variant; keep a log of what was
  tried. Refresh seasonally or on major releases; re-check after each iOS/Play UI change.

→ tooling: `store-screenshots` §6; `gpc images upload --replace --confirm` / `asc screenshots
upload` make a variant a one-command swap.

## One-page checklist (print this)

1. Headlines written and approved before any capture. Pain → shift → proof → features.
2. Every headline ≤ 8 words, outcome-phrased, readable at thumbnail.
3. Cover-the-UI test passes (the headlines alone tell the story).
4. One style, varied layouts, ≤ 1 panorama, first screen strongest.
5. `render.mjs --strict` is green; preview sheet checked at thumbnail size.
6. Nothing Apple/Google would reject (§4).
7. Per-locale copy rewritten, not translated; per-locale folders uploaded.
8. Date noted; conversion re-read in 30 days; first-screen variant queued.
