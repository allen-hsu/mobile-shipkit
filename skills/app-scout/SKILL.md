---
name: app-scout
description: Find what app to build next from public store data — no paid market-intel needed for screening. One zero-dependency script over the iTunes Search/Lookup API, the legacy iTunes RSS charts (top grossing / free / paid per country × genre) and the Google Play listing page (installs bucket, updated date, ads / IAP flags). Strategies as commands — geo-gap (strong in Japan, absent or un-localised in the US), zombies (still charting, not updated in 18 months), weak (thousands of ratings, ≤ 3.9★), paid-gaps (paid apps with no strong free alternative) — plus charts, search, app-across-storefronts, play, and a one-shot markdown report. Use when the user asks "what app should I build", "find opportunities in category X", "is this idea already taken in market Y", "which competitors are abandoned", "app market research", "app idea validation", or wants a geo-arbitrage / paid-to-free / abandoned-app scan. Hands off to store-screenshots / store-listing once an idea is picked.
---

# app-scout

The question before `create-expo-app`: *what* to build. Public store data is enough to screen
ideas — you only need paid estimates (AppFigures, AppMagic, Sensor Tower) when sizing a market you
have already shortlisted. Rating-count and its growth is the free volume proxy; Play's installs
bucket is the only free absolute number.

```sh
node skills/app-scout/scripts/scout.mjs genres                                  # App Store genre ids
node skills/app-scout/scripts/scout.mjs charts    --country jp --genre 6013     # top grossing (or --kind free|paid)
node skills/app-scout/scripts/scout.mjs geo-gap   jp us --genre 6013            # strategy 1
node skills/app-scout/scripts/scout.mjs zombies   --country us --genre 6013     # strategy 3
node skills/app-scout/scripts/scout.mjs weak      --country us --genre 6013     # strategy 4
node skills/app-scout/scripts/scout.mjs paid-gaps --country us --genre 6013     # strategy 2
node skills/app-scout/scripts/scout.mjs app  904237743 --countries jp,us,tw     # one app across storefronts
node skills/app-scout/scripts/scout.mjs play com.duolingo --hl zh_TW --gl tw    # Play facts
node skills/app-scout/scripts/scout.mjs search "家計簿" --country jp
node skills/app-scout/scripts/scout.mjs reviews com.duolingo --n 300 --stars 1,2,3        # Play reviews + complaint keywords
node skills/app-scout/scripts/scout.mjs complaints 680170305                              # App Store id → Play twin → 1–3★ reviews
node skills/app-scout/scripts/scout.mjs play-search "7 minute workout"                    # find the Play package
node skills/app-scout/scripts/scout.mjs report --genre 6013 --countries jp,us   # all of the above → scout-<genre>-jp-us.md
```

`--json` for raw rows, `--out file.md` to append, `--limit 100` (chart depth, max 200), `--ttl 24`
(cache hours, `.scout-cache/` in cwd), `--no-cache`. Each run is ~10–60 requests; the script sleeps
between calls and retries on 403/429.

## What each source gives (verified 2026-08-23)

| source | fields | notes |
|---|---|---|
| iTunes Lookup / Search (per `country`) | name, seller, genre, price, rating, **rating count**, **last update**, first release, version, languages, min OS | facts; lookup silently truncates long id lists, the script batches by 40 |
| legacy RSS `itunes.apple.com/{cc}/rss/topgrossingapplications/limit=100/genre=6013/json` | top 100–200 grossing / free / paid per country × genre | the new `rss.marketingtools.apple.com` v2 feed has **no grossing and no genre filter** — use the legacy one |
| Play listing page | installs bucket (`500M+`), updated date, **Contains ads / In-app purchases**, JSON-LD rating + count, price | scrape; breaks when Google reshuffles markup |
| Play reviews (`reviews`, `complaints`) | text, stars, date, version, thumbs-up, developer reply; paginated via the batchexecute endpoint | 150 per call; `--stars 1,2,3` fetches each star separately; keyword tally (uni/bigrams) over ≤ 3★ |
| App Store reviews | **not available** — the reviews RSS returns empty and the amp-api token is no longer in the page | `complaints <appstore-id>` finds the Play twin by name + developer and reads those instead; it prints the match so you can reject a wrong twin |

## Strategies → signals

| command | finds | score |
|---|---|---|
| `geo-gap A B` | apps in A's top charts that are **absent** in B, have **no B-language** localisation, or are **weak** there (< 5 % of A's ratings) | log10(ratings in A) × (absent 1.5 / no-lang 1.2 / weak 1) + recently-updated bonus |
| `zombies` | ≥ 500 ratings, not updated for `--months` (18), still charting or found by `--terms a,b` | log10(ratings) × days stale / 100 |
| `weak` | ≥ 1 000 ratings, rating ≤ 3.9 — proven demand, unhappy users | (4.6 − rating) × log10(ratings) × 10 |
| `paid-gaps` | paid apps (≥ 200 ratings) whose best **free** same-genre, name-overlapping alternative has < 20 % of their ratings (`—` = none found; check the category by hand) | log10(ratings) × 10 × gap factor |

Other plays the same data supports (run `charts` / `search` and read): **platform gap** (iOS only,
no Play package — `play` returns 404), **language gap** (top apps whose `langs` lacks zh/ja/ko),
**developer concentration** (top 20 all from 1–2 sellers → avoid; many indies → enter),
**monetisation norm** (`play` on the top 10: all ads → free+ads category, all IAP → subscription
category), **subscription fatigue** (every leader is IAP-subscription → a one-time-purchase angle),
**unbundling** (a big app's single feature as a focused app), **new-OS-feature timing** (ship a
Widgets / Live Activities / App Intents take before the category catches up).

## How to read a result (before falling in love)

1. **Demand**: ratings ≥ 10k in the source market, or Play installs ≥ 1M. Below that the market may
   not exist outside one brand.
2. **Transferability** (geo-gap): is the app tied to a local ecosystem (Rakuten points, docomo,
   insurers, a gym chain)? Those are not gaps, they are moats. The JP Health list is half
   "walk-for-points" apps — the *mechanic* may transfer, the apps cannot.
3. **Why is it empty**: absent in B because nobody tried, or because B already solved it under a
   different name? Run `search` with B's vocabulary.
4. **Can you win the listing**: `weak` / `zombies` give you the complaints to fix — read the Play
   reviews; your first three screenshots should answer them (`store-screenshots` §1).
5. **Then size it**: only now spend on AppFigures / AppMagic for downloads and revenue of the top 5.

## Hand-off

Picked an idea → `brief.json` for `store-screenshots` starts from the same facts (`app.category`,
`coreValue` from the winning complaint), and `store-listing` writes the description against the
competitor set `scout` just produced.
