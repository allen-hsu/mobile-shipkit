---
name: store-listing
description: 撰寫與整理 App Store 與 Google Play 的商店文案（名稱、副標、關鍵字、促銷文字、描述、簡短描述）。當使用者要「寫商店文案」「App Store 描述」「關鍵字」、要把文案翻成多語、文案被 ASC 或 Play 以長度或字元問題退回、或要建立 asc metadata pull 相容的 canonical 目錄時使用。含雙商店字數表、ASC 禁 emoji 與關鍵字規則、ja/zh 字數計算、zh 源→en/ja 在地化改寫策略、以及 metadata/ 與 play/ 目錄結構。
---

# store-listing

雙商店文案規格。來源：2026-08 一次三語（zh-Hant / en-US / ja）真實上架，ASC 與 Play 各被退一次才定型。

## 1. 字數表

| 欄位 | App Store | Google Play |
|---|---|---|
| 名稱 / title | **30** | **30** |
| 副標 subtitle | 30 | — |
| 簡短描述 short description | — | **80** |
| 關鍵字 keywords | 100（半形逗號分隔，逗號算字） | —（靠描述內文） |
| 促銷文字 promotional text | 170 | — |
| 描述 description / full | **4000** | **4000** |
| What's New / release notes | 4000 | 500 |

**字數計算**：ja / zh 全形字算 1，不是 2。兩商店都用「字元數」而非 byte。
驗證用 `python3 -c "import sys;print(len(sys.argv[1]))" "文字"`，不要目測。

## 2. 兩商店規則差異

| 規則 | App Store | Google Play |
|---|---|---|
| 描述含 emoji | **禁止**，整批退回（🌱💩📅🔒 全中招） | 允許 |
| 關鍵字 | 獨立欄位，半形逗號，不重複名稱與副標裡的詞 | 無；把關鍵詞自然寫進 title / short / full |
| 名稱含副標式短語 | 名稱 30 + 副標 30 分開填 | title 30 塞得下就塞（例：`產品名-一句話副標，功能關鍵字`） |
| locale 代碼 | `zh-Hant`、`en-US`、`ja` | `zh-TW`、`en-US`、`ja-JP` |

結論：**文案分流**。ASC 版為 canonical 無 emoji；Play 版從 ASC 版衍生、可加 emoji 與 section 符號。

## 3. 三語策略

zh-Hant 是源；en-US、ja **在地化改寫，不是直譯**。

- 名稱：各語言獨立想，不翻。`產品名` / `Product Name - Tagline` / `プロダクト名`。
- 副標 / short：用該語言市場的搜尋詞，不是中文詞的直譯——各語言市場的慣用搜尋詞通常不同。
- 描述結構同（hook 一句 → 三到五段功能 → 隱私 → 免責），**段落內容各自改寫**，例子、語氣按語言。
- 關鍵字（ASC）：每語言獨立 100 字，不含名稱 / 副標已有的詞。

翻完給母語者（或人類）過一次：

> 🧑 人類時刻：名稱與副標是品牌決策，人類拍板；agent 提 3 個候選 + 字數。

## 4. Canonical 目錄結構

`metadata/` 即 `asc metadata pull` 的格式，可直接 `asc metadata push`（見 asc-metadata-sync）：

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
    zh-TW.json          { "title", "shortDescription", "fullDescription" }   ← emoji 保留
    en-US.json
    ja-JP.json
  listing.md            人類可讀總表（各語言並排、字數）
  privacy-policy.html
  screenshots/
```

- `version/<ver>/` 的 `<ver>` 對齊 ASC 版本字串（`1.0.0`，見 submit-apple 第 2 節）。
- Play 版用 Play locale 命名，`gpc listing push --dir docs/store/play` 直接吃。

## 5. 描述模板（ASC 版，無 emoji）

```
<一句 hook，≤ 40 字>

<兩三句說「每天用起來長什麼樣」>

主要功能
- <功能 1：一句話，以使用者動作開頭>
- <功能 2>
- <功能 3>

隱私
<資料存哪、有沒有上傳、能不能匯出刪除>

<免責聲明：非醫療建議等，依類別>
```

Play 版：同結構，section 標題前可加 emoji，`- ` 可換 `✔`。

## 6. 常見退件與修法

| 退件 | 修法 |
|---|---|
| ASC: description 欄被拒、訊息籠統 | grep emoji：`grep -P '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' metadata -r` |
| ASC: keywords 超 100 | 半形逗號也算字；拿掉名稱 / 副標已有的詞 |
| Play: title 超 30 | 全形字算 1，但「-」「，」也算；先砍修飾語 |
| Play: short 超 80 | 通常是中文標點太多 |
| 任一：URL 無法連線 | privacyPolicyUrl / supportUrl 要先上線（GitHub Pages 可） |

## 7. 更新流程

改文案 → 改 `metadata/` 與 `play/` → 字數驗證 → `asc metadata push` / `gpc listing push`
→ commit（commit message 寫改了哪個語言哪個欄位）。
