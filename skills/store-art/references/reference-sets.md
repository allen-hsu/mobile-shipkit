# 31 reference store screenshot sets — analysed one by one, mapped to our system

Source: 31 real App Store listings (4–5 screens each) supplied by the user. One entry per set: what it
does, how the copy is written, how to build it in store-art (`style` × `layout` × `elements`), and
what to watch for in review and optimisation.
"Doable" = the current system produces it directly; "needs assets" = the user must supply
illustration / photo / 3D art; "don't" = non-compliant or not worth it.

Legend: 🍎 Apple guideline note　🤖 Play policy note　📈 confirmed by the optimisation references (DesignerAnts / Paul Solt / Playbook)

---

### #1 DMV driving-test app (dark green → photo → blue)
- **Technique**: screen 1 is a "laurel proof wall": app name + three laurel numbers (7 million downloads / 160,000 ratings 4.8★ / 95.2% pass rate) + a small green sticker (Specific to your state) on top of the phone; screen 2 is a full-bleed portrait photo + one line + logo; screen 3 a photo collage; screen 4 a feature screenshot + big number "600+ exam-like questions".
- **Copy**: proof first (all three numbers on screen 1) → outcome (test done in no time) → scope (Car, CDL & Motorcycle) → scale (600+). 📈 playbook "numbers add credibility".
- **Build**: `style: dark-pro` or `photo-backdrop`; screen 1 `bleed-bottom` + `elements: [{type:'stamp',kind:'laurel'} ×3, {type:'stamp',kind:'pill'}]`; screen 2 `no-device` + `bgImage`; screen 3 `no-device` + `image` ×3 tilted; screen 4 `crop-zoom` + `stat`.
- **Watch**: 🤖 "7 million downloads" is a banned Play phrase (Million Downloads) — the guardrail blocks it; 🍎 fine. Portrait photo needs a licence.

### #2 BOEF gang game (pink background + illustrated characters)
- **Technique**: full illustrated characters as the hero, phone shrunk in the middle, big outlined headlines top and bottom (CREATE YOUR GANG / CASH IN ON CRIME). Screens 3–4: phone + characters layered in front, covering the phone edge.
- **Copy**: all imperative, verb-first, two words per line, uppercase outlined type. Game-category "emotion first".
- **Build**: `style: bold-dark` (pink palette) + `layout: float` + `elements:[{type:'image'}]` character PNGs in front of the device (z 4 already sits above the device). Outlined type: add an `h1{-webkit-text-stroke}` variant to the style. **Needs assets** (character illustrations).
- **Watch**: 🍎 screenshots must "primarily show the app" — illustration-heavy screens are a risk, games get more leeway; 🤖 same on Play.

### #3 AI headshot generator (dark brown + portraits)
- **Technique**: full-bleed portrait photo, semi-transparent phone, screen 1 has a circular "ORIGINAL" comparison thumb bottom-left + "Ultra resolution" bottom-right; screen 2 a card stack (portraits fanned like a deck) + fake terminal-font logs; screen 4 a 2×2 icon feature grid at the bottom (real-time processing / 30 shots…).
- **Copy**: short noun phrases (AI headshot generator / Realistic headshots).
- **Build**: `photo-backdrop` + `frameless-bleed`; `elements: crop` (original as a circle, `radius: 9999`), `features` 2×2 grid; deck via `card-stack`.
- **Watch**: AI-generated portraits must be labelled; 🍎 no misleading before/after (must be a real output).

### #4 AI character chat (blue-purple gradient + anime illustration)
- **Technique**: full-body anime illustration + chat-bubble UI fragments floating outside, screen 2 a pile of scattered character cards (scatter), screen 4 phone + list. Italic serif display headline (Dive into the AI world).
- **Copy**: emotion + scale (Billions of AI personas…).
- **Build**: `mesh-glass` + `scatter` (avatar cards as `elements: image` or `crop`); chat bubbles as `crop` lifted from the screenshot. **Needs assets** (illustration).
- **Watch**: 🍎 4.3 / 1.1 suggestive content; 🤖 "Billions" reads as exaggeration.

### #5 Framer (dark blue → purple gradient)
- **Technique**: screen 1 phone surrounded by a collage of website cards (tilted thumbnails scattered) + an input-field UI fragment at the bottom; screen 2 a **quote card** (“ ” + name + title + Dribbble); screen 3 big phone + the "Publish" button magnified and floating; screen 4 phone + analytics card floating.
- **Copy**: outcome-led (Create and publish your site with AI in secs / The internet is your creative playground). 📈 quote = social proof.
- **Build**: `mesh-glass`; screen 1 `scatter` + `crop` input field; screen 2 **`layout: quote` + `elements: quote`**; screen 3 `bleed-bottom` + `crop` (button enlarged, `width: 500`); screen 4 `float` + `crop`.
- **Watch**: quotes must be real and verifiable (🍎 5.2.5 no fabricated endorsements).

### #6 Amie calendar (pink / light grey)
- **Technique**: the textbook case of **UI fragments flying out**: 3D app icons, event cards and timeline fragments float around the phone; screen 2 is a magnified calendar UI with event cards on top; screen 4 a scatter of widget cards. Left-aligned two-tone headline (black + grey).
- **Copy**: emotion + function (Joyfull productivity / Amie cares about your well-being).
- **Build**: `minimal-light` (`bg: #FFD6DC`); `bleed-bottom` + `elements: crop` ×3 (event card, time row) + `image` (3D icons need assets); screen 2 `crop-zoom`; screen 4 `no-device` + `crop` ×6 tilted. Two-tone headline via `==grey words==` (in minimal-light set `em` to muted).
- **Watch**: Play — fragments are not device frames, compliant ✅.

### #7 Crypto wallet (cyan gradient + clouds)
- **Technique**: cloud / star sticker background, phone + 3D stickers (planet, rainbow) layered on the edges, screen 4 shows only the top half of the phone + a big star.
- **Copy**: Experience Crypto in Color / Discover new tokens / Swap and bridge — three-word verb lines.
- **Build**: `playful-pop` (cyan palette) + `bleed-bottom` / `bleed-top` + `elements: image` (stickers, **needs assets**).
- **Watch**: 🍎 3.1.5 crypto app restrictions; screenshots must not imply returns.

### #8 Web3 browser Zerion (purple + comic stickers)
- **Technique**: comic-style stickers (explosion, hand, cat) pressed against the phone edges, screen 2 app-icon row + phone, screen 3 top half of phone + illustrated hand.
- **Build**: same as #7: `playful-pop` (purple) + `image` stickers. **Needs assets**.
- **Watch**: same as #7.

### #9 Furry Nomad tax (light purple + monochrome line illustration)
- **Technique**: **device-free and device screens alternate**: odd screens are a serif headline + monochrome line illustration, even screens a clean phone. Minimal, lots of whitespace, brand logo top-left.
- **Copy**: feature statements, but full sentences (Tax & residency info overview by country).
- **Build**: `minimal-light` (`bg:#F2EEF8`); odd screens `no-device` + `elements: image` (line-art SVG, **needs assets**) + `text` (logo name); even screens `float` (smaller `titleSize` or no headline via `copy:'none'`).
- **Watch**: none. The safest set of the 31 (fully matches Play's "pure interface + little text").

### #10 AI character app (dark blue → black)
- **Technique**: screen 1 avatar grid inside the phone plus a ring of avatars floating outside (crop); screen 2 phone + 3D trophy sticker; screen 3 a magnified "personality matrix" UI, frameless; screen 4 big GEN-4 / GEN-3 type cards + a 4-icon feature row at the bottom.
- **Build**: `dark-pro`; `bleed-bottom` + `crop` circular avatars ×6; `crop-zoom`; `no-device` + `stat` (GEN-4) + `features`.
- **Watch**: 🤖 "Find right engine" is fine; avoid naming third-party marks such as GPT.

### #11 Dating reply generator (cream + orange-red)
- **Technique**: **italic handwritten words as emphasis** (*upload* / *answer*), chat bubbles cropped and floating out of the phone, app-icon stickers, an orange arrow pointing at the button, green pill tags (82 playful, witty).
- **Copy**: step by step (upload → get an answer → 18+ tones → copy & send). 📈 one step per screen.
- **Build**: `paper-sticker` (cream); `float` + `crop` bubbles + `stamp pill` + `image` (arrow SVG); italic emphasis = set `em` in the style to `font-family:Caveat;font-style:italic`.
- **Watch**: 🍎 1.1.4 dating content; bubble text must comply.

### #12 AI boyfriend (purple-black + neon pink)
- **Technique**: full-bleed illustrated character, neon handwritten "Loves", chat bubbles floating out, screen 3 a photo collage (scattered polaroids).
- **Build**: `mesh-glass` (pink-purple) + `no-device` + `image` (character, **needs assets**) + `crop` bubbles; screen 3 `scatter`.
- **Watch**: 🍎 adult-content boundary; AI-generated people must be labelled.

### #13 Playground AI (light grey → blue)
- **Technique**: screen 1 headline + 4 AI images scattered + caption pills; screen 2 clean phone; screen 3 image cards + input-field crop; screen 4 top half of phone + big type below.
- **Build**: `minimal-light`; `no-device` + `image` ×4 + `stamp pill`; `float`; `bleed-top`.
- **Watch**: AI images must be actual app output.

### #14 F1 race app (blue-black + photos)
- **Technique**: **real people / object photos as background** (driver, gloved hand holding the phone), device-in-hand, screen 4 type so large it bleeds off as a background texture. Badge "Designed for F1 fans".
- **Build**: `photo-backdrop` + `bgImage`; device-in-hand = the user's own composited photo as `bgImage` + `no-device` (we do not composite hands). Type texture: `elements: text` enlarged, `opacity` tuned in the style.
- **Watch**: 🍎 / 🤖 **F1 and driver likenesses are third-party trademarks / publicity rights** — an unofficial app gets rejected. 🤖 Play: "avoid people interacting with the device" unless core usage is off-device.

### #15 AI playlists (neon green + black phone)
- **Technique**: neon green background + black frameless phone, screen 1 circular covers inside and outside the phone, screen 3 Spotify / Apple Music logos scattered + centred headline. Footer "Featured in TechCrunch / Fast Company".
- **Build**: `playful-pop` (`bg:#5CFF8A`, `ink:#000`) + `frameless-bleed`; `no-device` + `logos`; `elements: logos` (press).
- **Watch**: 🍎 / 🤖 **third-party service logos (Spotify etc.) must follow each brand's guidelines**; Play forbids unlicensed trademarks.

### #16 Anki Pro flashcards (photo + blue)
- **Technique**: screen 1 hand-held phone photo + laurel "3 million ANKI PRO USERS"; screen 2 scattered flashcards (scatter) + category list; screen 4 a "forgetting curve" chart + person photo + circular stamp badge.
- **Build**: `photo-backdrop` (phone photo as `bgImage`) + `stamp laurel`; `scatter` (card PNGs); `no-device` + `image` (chart) + `stamp circle`.
- **Watch**: 🤖 "3 million users" is not literally "Million Downloads" but is an exaggeration risk; 🤖 person holding the device.

### #17 Dive Chat (red → pink gradient)
- **Technique**: screen 1 phone + "MAKE MOMENTS HAPPEN" sticker + star rating "★★★★½ 500+ Reviews"; screen 2 3D icon grid + two enlarged icon cards; screen 3 calendar crop + event-card crop; screen 4 chat UI magnified (frameless). Headline at the **bottom**, key word in a white pill (the best).
- **Build**: `playful-pop` (red-pink palette); `bleed-top` + `stars` + `image` sticker; `no-device` + `crop` ×2; `frameless-top`. Pill emphasis = `::the best::`.
- **Watch**: 🤖 "the best" is a banned Play word (Best) — the guardrail blocks it; 🍎 fine.

### #18 Degoo cloud (light blue / off-white + line illustration)
- **Technique**: **top/bottom split**: headline above, phone or illustration below; black circular stamps "700 million+ registered users" / "Trusted by most of the Fortune 500"; even screens on black. Line illustrations (person taking a photo / on a plane).
- **Build**: `minimal-light` ↔ `dark-pro` alternating (two-colour palette); `bleed-bottom` + `stamp circle`; `no-device` + `image` (line art, **needs assets**).
- **Watch**: 🤖 "700 million+ users" exaggeration risk; "Fortune 500" must be provable.

### #19 Home-maintenance app (light blue / cream / grey / purple)
- **Technique**: one pastel background per screen; screen 1 mascot illustration + user quote + five stars; screen 2 phone + circular "300+ preset tasks" stamp in a corner; screen 3 phone + achievement-badge crop; screen 4 three Memoji + small card. Headline + two-line subtitle.
- **Build**: `pastel-soft` + four-colour `palette`; `no-device` + `image` (mascot) + `quote` + `stars`; `bleed-bottom` + `stamp circle`; `float` + `crop`.
- **Watch**: 🍎 Memoji are Apple assets, avoid.

### #20 Drop cashback (pink / navy)
- **Technique**: big headline top-left + tilted phone bleeding off; screen 2 phone surrounded by circular brand badges (ebay / amazon / adidas…); screen 3 3D card illustration floating; italic DROP logo.
- **Build**: `pastel-soft` / `dark-pro` alternating; `tilt-right`; `float` + `elements: image` (circular logo badges); `image` (3D card, **needs assets**).
- **Watch**: 🤖 third-party brand logos need permission; 🍎 same.

### #21 M1 AI phone (light grey / black, minimal)
- **Technique**: every screen opens with a **pill label** (Call Notes / Personal Secretary) → headline → clean phone. Screen 2 black background + call-summary card crop floating in front of the phone (bigger than the phone).
- **Build**: `minimal-light` (alternate `bg` grey / black on odd/even screens) + `badge` (pill) + `float`; screen 2 `float` + `crop` (`width: 1000`).
- **Watch**: 🍎 must not imitate the system call UI (this set uses its own UI, fine).

### #22 Health tracker (yellow → blue gradient, screen 1)
- **Technique**: single wide image: phone + **Apple Watch side by side**, two Editor's Choice laurels, magnified UI card grid (6-tile frameless bento), screen 3 two phones stacked.
- **Build**: `bento-dark` in a light variant → `bento-light`; the Watch needs a Watch frame (Koubou has one) → add to `frames.json`; `stamp laurel` ×2.
- **Watch**: 🍎 Editor's Choice may only be used if Apple awarded it; 🤖 Play forbids Apple device imagery (Watch).

### #23 Health app (yellow-blue gradient, screen 2)
- **Technique**: 3D glass-jar illustration filled with emoji stickers + phone inside the jar (creative container), StandBy-mode phone in landscape + iOS 17 badge, finger tapping a widget.
- **Build**: container idea = `image` (jar PNG) + device layering (needs assets); landscape phone: add a landscape frame (Koubou has them).
- **Watch**: 🍎 an "iOS 17" badge in Apple's official style must follow Apple's marketing rules; 🤖 not applicable to Play.

### #24 Simple diet (cream + food photos)
- **Technique**: screen 1 **full-bleed food photo** + chat bubble + headline + two laurels (App of the Day / 303,000 reviews); screen 2 chat UI frameless; screen 3 food photo + food-card crop; screen 4 phone + "Type / Snap / Speak" three 3D buttons floating.
- **Build**: `photo-backdrop` (cream tone) + `no-device` + `crop` bubble + `stamp laurel` ×2; `frameless-bleed`; `float` + `image` ×3.
- **Watch**: 🍎 App of the Day only if actually awarded; 🤖 Play does not recognise Apple awards.

### #25 Copilot money (magenta / white / blue)
- **Technique**: **UI redrawn large, no phone at all**: four balance cards stacked in a column, spending list magnified, transaction cards scattered; screen 1 circular bank-logo badges scattered. One flat colour per screen.
- **Build**: `artsy-flat` (palette magenta / white / blue) + `no-device` + `crop` ×N (cards cut from the screenshot); or `crop-zoom`.
- **Watch**: 🤖 fully compliant (no frames, pure UI); bank logos are third-party marks.

### #26 Story maker (black / blue-purple)
- **Technique**: black background + coloured key words (collage cyan / Stories pink / Widget cyan), big-number card 8,560,675 followers, app icons in a circular arc, "#1 Product of the Day" laurel + Product Hunt.
- **Build**: `dark-pro`; multi-colour `==word==` needs several accents → in the style give `em:nth-of-type(2)` accent2; `stat` card; `image` icon arc; `stamp laurel`.
- **Watch**: 🤖 **"#1" is a banned Play word**, guardrail blocks it; Instagram / YouTube marks need permission.

### #27 Allset restaurant rewards (light grey + purple pills)
- **Technique**: **purple pill highlights on key words** (Save big / on every order / real-time), tilted phone + 3D food icons floating, screen 3 a 15% card crop enlarged over the phone.
- **Build**: `minimal-light` + `::word::` pills (new marker) + `tilt-left` + `image` (food icons) + `crop`.
- **Watch**: 🤖 "Save big / 15% back" are promotional; Play is sensitive to Discount/Sale wording; the guardrail does not block "15%" but the docs must warn.

### #28 Foodvisor (light green / cream)
- **Technique**: screen 1 pure text page: logo + headline + App of the Day / Editor's Choice laurels + press logo row (GMA / TIME / Men's Health / Forbes); screen 2 illustrated path + UI card crop; screen 3 food photo + scan frame; screen 4 barcode scan + food photo.
- **Build**: `pastel-soft` (green); **`no-device` + `stamp laurel` ×2 + `logos`**; `no-device` + `image` (illustration) + `crop`; `photo-backdrop` + `crop` (scan frame).
- **Watch**: 🍎 press logos need permission; 🤖 Play forbids third-party marks.

### #29 Zip buy-now-pay-later (light purple + line icons)
- **Technique**: screen 1 device-free: hand-drawn line icons (bag, bill, travel) + stars + big type; screen 2 **two phones sandwiching the copy** (one bleeding off the top, one off the bottom, headline in between); screen 3 phone + payment-plan card crop; screen 4 phone + card crop.
- **Build**: `pastel-soft` (purple); `no-device` + `image` line art; **new layout `sandwich`** (`frameless-top` above + `frameless-bleed` below + copy in the middle) — a `two-up` variant; `bleed-bottom` + `crop`.
- **Watch**: 🍎 3.1 financial services need compliant disclosure; Visa mark needs permission.

### #30 Haptic journal (photo + dark glass card)
- **Technique**: **photo background + translucent dark glass panel** holding a UI list (no phone), headline above the panel; screen 4 glass panel + white card floating. Minimal, moody photos (fabric, light trails, stairs).
- **Build**: a **`photo-glass` style**: `photo-backdrop` + the `mesh-glass` panel combined, device replaced by a `crop` inside the panel. `no-device` + `crop`.
- **Watch**: photos need a licence; 🤖 compliant (no frames).

### #31 Carrot shopping rewards (orange / light grey)
- **Technique**: screen 1 hand-held phone photo + quote + "SHOPPER'S CHOICE" laurel; screen 2 phone + 🔥 emoji headline; screen 3 phone + confetti + big number 55,150; screen 4 a 12-cell brand logo grid + bottom pill CTA "Works wherever you shop".
- **Build**: `photo-backdrop` + `quote` + `stamp laurel`; `bleed-bottom`; `bleed-bottom` + `image` (confetti) + `stat`; `no-device` + `logos` (12 cells) + `stamp pill`.
- **Watch**: 🤖 "90% off deals" = Discount/Sale category; "Works wherever you shop" reads like a CTA, 🍎 2.3.10 bans CTA-style text (Download now etc.), this line is borderline; brand logos need permission.

---

## The "elements layer" shared by these 31 sets → now `elements`

| sets | element | `elements.type` | seen in |
|---|---|---|---|
| 18 | UI fragments lifted out of the phone (cards, bubbles, enlarged buttons) | `crop` | #5 #6 #10 #11 #12 #17 #19 #21 #24 #25 #27 #28 #29 #30 … |
| 12 | proof stamps (laurel, circle, stars) | `stamp` (laurel/circle/pill), `stars` | #1 #16 #17 #18 #19 #22 #24 #26 #28 #31 |
| 9 | stickers / 3D icons / illustrations | `image` | #2 #4 #7 #8 #9 #12 #18 #20 #24 |
| 6 | brand / press logo rows | `logos` | #15 #20 #25 #28 #31 |
| 5 | big numbers | `stat` | #1 #10 #26 #31 |
| 4 | quote cards | `quote` | #5 #19 #31 |
| 4 | icon + label feature grids | `features` | #3 #10 #16 |
| 9 | device-free screens (illustration / photo / pure text / logo wall) | `layout: no-device` | #9 #13 #15 #18 #25 #28 #29 #31 |
| 3 | photo background + glass panel | `style: photo-glass` (new) | #30 #14 |
| 2 | two phones sandwiching the copy | `layout: sandwich` (new) | #29 |

## Review summary (what would get these 31 into trouble)

- 🤖 Play banned words hit: #1 "7 million downloads", #17 "the best", #26 "#1", #16/#18 "million users" (exaggeration), #27/#31 discount/promo wording. → the guardrail already blocks the first three classes; promo wording is warned only.
- 🍎🤖 Third-party trademarks: #14 F1, #15 Spotify/Apple Music, #20/#25/#31 brand logos, #26 Instagram/YouTube, #29 Visa, #28 press logos. → the tool cannot judge this; the docs require a human to confirm licences.
- 🤖 Apple devices / awards on Play: #22 Apple Watch, #24/#28 App of the Day, #23 iOS 17. → cross-platform frames are hard-blocked; award wording on Play is partly caught by the "Best/Top" rules, the rest is manual.
- 🤖 People interacting with the device: #14 #16 #31 hand-held phone photos. → Play advises against it; the docs warn.
- 🍎 Screenshots must primarily show the app: #2 #4 #12 are illustration-heavy and a risk.

## 📈 Against the optimisation references (who did it right)

- Screen 1 leads with pain / proof: #1 (three laurels), #24 (App of the Day + 303k reviews), #31 (quote + Shopper's Choice).
- One message per screen, ≤ 8 words: almost all; best are #25 (3–4 words) and #21 (pill + one line).
- The sequence is a story: #11 (upload → answer → tones → send), #29 (Pay later → where → how it splits → virtual card).
- Counter-examples: #26 is four screens of stacked feature nouns; #13 screen 1 "Create AI art like a pro" is a feature, not an outcome.
