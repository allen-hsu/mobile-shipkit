---
name: store-listing
description: Write and organise App Store and Google Play listing copy (name, subtitle, keywords, promotional text, description, short description). Use when the user wants "store copy", an "App Store description", "keywords", copy translated into several locales, when ASC or Play rejects copy for length or character problems, or when setting up a canonical directory compatible with asc metadata pull. Includes the two-store length table, ASC's no-emoji and keyword rules, ja/zh character counting, the zh-source → en/ja localised-rewrite strategy, and the metadata/ and play/ directory layout.
---

# store-listing

Copy rules for both stores. Source: a real three-locale (zh-Hant / en-US / ja)
submission in Aug 2026; ASC and Play each rejected once before the rules settled.

## 1. Length table

| Field | App Store | Google Play |
|---|---|---|
| name / title | **30** | **30** |
| subtitle | 30 | — |
| short description | — | **80** |
| keywords | 100 (ASCII commas, commas count) | — (rely on the description) |
| promotional text | 170 | — |
| description / full | **4000** | **4000** |
| What's New / release notes | 4000 | 500 |

**Counting**: ja / zh full-width characters count as 1, not 2. Both stores count
characters, not bytes. Verify with
`python3 -c "import sys;print(len(sys.argv[1]))" "text"`, do not eyeball.

## 2. Rule differences between the stores

| Rule | App Store | Google Play |
|---|---|---|
| emoji in the description | **forbidden** — the whole batch is rejected (🌱💩📅🔒 all hit) | allowed |
| keywords | separate field, ASCII commas, no repeats of words already in name/subtitle | none; work keywords naturally into title / short / full |
| a subtitle-like phrase in the name | name 30 + subtitle 30 filled separately | squeeze into the 30-char title if it fits (e.g. `Product-tagline, feature keywords`) |
| locale codes | `zh-Hant`, `en-US`, `ja` | `zh-TW`, `en-US`, `ja-JP` |

Conclusion: **two copies**. The ASC copy is canonical and emoji-free; the Play copy
derives from it and may add emoji and section markers.

## 3. Three-locale strategy

zh-Hant is the source; en-US and ja are **localised rewrites, not literal
translations**.

- Name: invented per language, not translated. `產品名` / `Product Name - Tagline` /
  `プロダクト名`.
- Subtitle / short: use the search terms of that language's market, not translations of
  the Chinese words — the common search terms usually differ per market.
- Same description structure (one-line hook → three to five feature paragraphs →
  privacy → disclaimer), **paragraph content rewritten per language**; examples and
  tone follow the language.
- Keywords (ASC): an independent 100 characters per language, excluding words already
  in the name / subtitle.

Have a native speaker (or a human) review the result:

> 🧑 Human step: name and subtitle are brand decisions; a human signs off. The agent
> proposes 3 candidates with character counts.

## 4. Canonical directory layout

`metadata/` is the `asc metadata pull` format and can be pushed with
`asc metadata push` (see asc-metadata-sync):

```
docs/store/
  metadata/
    app-info/
      zh-Hant.json      { "name", "subtitle", "privacyPolicyUrl" }
      en-US.json
      ja.json
    version/
      1.0.0/
        zh-Hant.json    { "description", "keywords", "promotionalText", "supportUrl", "marketingUrl" }
        en-US.json
        ja.json
  play/
    zh-TW.json          { "title", "shortDescription", "fullDescription" }   ← emoji kept
    en-US.json
    ja-JP.json
  listing.md            human-readable overview (languages side by side, counts)
  privacy-policy.html
  screenshots/
```

- `<ver>` under `version/` matches the ASC version string (`1.0.0`; see submit-apple
  section 2).
- The Play copy uses Play locale names; `gpc listing push --dir docs/store/play` reads it
  directly.

## 5. Description template (ASC copy, no emoji)

```
<one-line hook, ≤ 40 chars>

<two or three sentences on what daily use looks like>

Key features
- <feature 1: one sentence, starting with the user's action>
- <feature 2>
- <feature 3>

Privacy
<where data lives, whether it is uploaded, whether it can be exported/deleted>

<disclaimer: not medical advice etc., as the category requires>
```

Play copy: same structure; emoji may precede section headings, `- ` may become `✔`.

## 6. Common rejections and fixes

| Rejection | Fix |
|---|---|
| ASC: description field rejected, vague message | grep for emoji: `grep -P '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' metadata -r` |
| ASC: keywords over 100 | ASCII commas count; drop words already in name / subtitle |
| Play: title over 30 | full-width chars count 1, but `-` and `，` count too; cut modifiers first |
| Play: short over 80 | usually too much Chinese punctuation |
| either: URL unreachable | privacyPolicyUrl / supportUrl must be live first (GitHub Pages works) |

## 7. Update flow

Change copy → edit `metadata/` and `play/` → verify lengths → `asc metadata push` /
`gpc listing push` → commit (the commit message names the language and field changed).
