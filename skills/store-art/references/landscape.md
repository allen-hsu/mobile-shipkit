# Landscape — what exists, what we took from it, what we dropped

Updated 2026-08-22. Replaces the 2026-08-21 template research (which recommended Koubou; the
bake-off in `renderer-evaluation.md` overturned that).

## Renderers / editors

| tool | stars | what it is | what we took | why not use it |
|---|---|---|---|---|
| [ParthJadhav/app-store-screenshots](https://github.com/ParthJadhav/app-store-screenshots) | 6.4k | React editor, JSON project, 7 layouts × 6 themes | quality-bar numbers (`quality-bar.md`), frameless-card idea, the JSON-project shape | editor-first; CJK not first-class; fewer compositions |
| [YUZU-Hub/appscreen](https://github.com/YUZU-Hub/appscreen) | 2.0k | vanilla JS + Canvas + Three.js, runs in browser, IndexedDB projects, AI translation | multi-stop gradients, noise overlay (→ `bg/grain`), web sizes (OG 1200×630, hero 1920×1080) worth adding, **GLB 3D phones** (iPhone 15 Pro Max, S25 Ultra) for true 3D angles | no named templates; browser-only; 3D would need Three.js in Playwright — possible later |
| [bitomule/Koubou](https://github.com/bitomule/Koubou) | 198 | Python, YAML, 100+ frames, Playwright | the Apple bezel PNGs in `assets/frames/` | tested: every style looked the same (YAML knobs only), see bake-off |
| [Snapframe](https://github.com/Pawandeep-prog/Snapframe) | 278 | React editor, JSON schema | — | same family as ParthJadhav |
| fastlane frameit | — | bezels + simple captions | Pixel 5 / Galaxy S21 frames | no layouts |
| Satori / vercel-og | — | JSX → SVG | — | no CSS filters/blur, weak CJK fallback |

## AI screenshot services (what they actually do)

| service | mechanism | lesson |
|---|---|---|
| [makeshots.app](https://www.makeshots.app/) | OpenAI image model (their unlimited tier asks for your OpenAI key); you upload 3 screenshots + a reference style; AI writes headlines; exports every store size + 33 locales | the value is the generated illustration/mascot/backdrop, not the layout. Their own testimonials flag "didn't mangle my UI" as the differentiator → UI inside the phone must stay a real screenshot |
| Hotpot.ai, AppMockUp, Screenshots.pro, LaunchMatic, Rotato | template editors, no API | nothing programmable |

**Our split:** generated art for what humans can't draw (`scripts/gen-assets.mjs` → Codex
image_generation), real screenshots + HTML text for everything the stores check. Verified
2026-08-22 on the poop-garden deck: mascot, 2 stickers, 3 icons, 1 backdrop in ~6 min, character
stayed consistent across poses when the first render is passed back as a reference image.

## Figma community templates

[500+ templates](https://www.figma.com/community/file/1471925742378558731), [Fabled Studio 5 themes](https://www.figma.com/community/file/1362938662992433314), [Free App Store templates](https://www.figma.com/community/file/1256854154932829222) — mostly CC BY 4.0. The Figma MCP cannot open a community page by its numeric id; **duplicate the file into your drafts first**, then `get_screenshot` on a node URL pulls frames as references. Used so far only as visual inspiration; our styles are rebuilt from the 31 shipped sets in `reference-sets.md`, which are closer to what actually converts.

## Shipped sets we learned from

`reference-sets.md` — 31 App Store sets analysed one by one (DMV prep, BOEF, AI headshot, Framer,
Amie, Rainbow, Zerion, Furry Nomad, Rizz, Playground, F1, …), each mapped to the style × layout ×
elements that reproduce it and to the assets it needs. 20 of 31 render complete from screenshots;
11 need artwork, which `gen-assets.mjs` now covers.

## Still open

- 3D phone renders (GLB via Three.js in the Playwright page) — appscreen proves it works in a browser.
- Web sizes (OG / hero) as extra `size` presets.
- iPad 13" layouts.
- White-on-white subjects defeat the white-key matte in `gen-assets.mjs`; ask for a flat colour key when the subject is white.
