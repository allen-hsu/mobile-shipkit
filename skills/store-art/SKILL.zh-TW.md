---
name: store-art
description: 用 HTML/CSS 風格模板 + Playwright 把原始截圖渲染成 App Store / Google Play 成品——七種視覺風格（editorial-light、bento-dark、minimal-light、bold-dark、pastel-soft、mesh-glass、feature-graphic）× 八種裝置版面（bleed-bottom、bleed-top、float、tilt-left、tilt-right、two-up、hero、panorama），一份 JSON manifest 驅動，附自動品質檢查（裝置佔高比例、標題溢出、文案與裝置重疊）。當使用者要「截圖加框」「商店截圖做專業一點」、需要「feature graphic」「接續圖／全景截圖」、中日文文案，或要從 1024 母檔出 Play 的 512 icon 時使用。文案由 store-screenshots 產出（先寫標題）；本 skill 只負責渲染。
---

# store-art

原始截圖 + 標題 → 商店可用的 PNG。選型來自實測評比（`references/renderer-evaluation.md`）：
HTML/CSS + Playwright 是唯一沒有能力缺口的方案——任何排版、Google Fonts、CJK、漸層、模糊、
多台裝置都行，每張 0.3–0.5 秒。Koubou / frameit / Satori / GUI 編輯器淘汰的理由都在那份報告裡。

## 安裝（一次）

```sh
cd skills/store-art && npm run setup      # playwright + chromium（約 350 MB）
```

## 1. Manifest

```json
{
  "brand": { "accent": "#F59E0B", "accent2": "#34D399", "titleSize": 150 },
  "style": "editorial-light", "layout": "bleed-bottom",
  "screens": [
    { "id": "01", "badge": "全新 2.0", "title": "一眼看懂\n==今天的行程==",
      "subtitle": "行事曆、待辦與提醒整合在同一個畫面。", "sticker": "免費\n下載", "shot": "raw/zh-TW/01.png" },
    { "id": "02", "style": "bento-dark", "layout": "float", "title": "See the ==pattern==",
      "tiles": [{"k":"98%","v":"keep logging"},{"k":"3 s","v":"per entry"}], "shot": "raw/zh-TW/02.png" },
    { "id": "03", "layout": "two-up", "title": "Light or ==dark==", "shot": "raw/a.png", "shot2": "raw/b.png" },
    { "id": "04", "layout": "panorama", "title": "One ==timeline==", "shot": "raw/zh-TW/03.png" },
    { "id": "fg", "style": "feature-graphic", "size": [1024, 500], "title": "Your day, ==at a glance==", "shot": "raw/zh-TW/01.png" }
  ]
}
```

- `==字==` 是高亮（每個風格自己決定長相：底線色塊、強調色、漸層字）。`\n` 換行。
  每張 screen 的欄位會覆蓋 `brand` / 頂層設定。
- `brand.bg / ink / accent / accent2` 可重新配色任何風格；不給就用風格預設。
- 字型：預設走 Google Fonts（Inter、Fraunces、Noto Sans/Serif TC、Noto Sans JP、
  Space Grotesk、DM Sans）。離線／CI：`"brand": {"fonts": {"local": "./fonts"}}` 會把該資料夾
  的 .ttf/.otf 全部內嵌。
- 一個語系一份 manifest（`manifest.zh-TW.json`…）；`--out framed/zh-TW` 正好對上
  `gpc images upload` 與 `asc screenshots upload` 的目錄結構。

## 2. 渲染

```sh
node scripts/render.mjs manifest.json --out framed/zh-TW          # 全部
node scripts/render.mjs manifest.json --out framed --only 01,fg   # 指定幾張
node scripts/render.mjs manifest.json --out framed --html         # 保留 HTML 方便手調
node scripts/render.mjs manifest.json --out framed --strict       # 有品質警告就 exit 1（CI 用）
```

每張印 `✓` 或 `⚠` 加原因。輸出目錄的 `report.json` 列出檔案、風格、版面與問題。

## 3. 風格 × 版面

風格（`styles/<name>.html`，自包含的 HTML+CSS，複製一份就能做自己的）：

| style | 長相 | 適合 |
|---|---|---|
| `editorial-light` | 暖紙色、襯線大標、==字== 下方螢光底線、貼紙 | 生活風格、日記、健康 |
| `bento-dark` | 光暈上的玻璃卡片、數據 tile（`tiles`） | 數據、理財、專業工具 |
| `minimal-light` | 白底置中、==字== 用強調色 | 工具類、Things 式純淨感 |
| `bold-dark` | 黑底、斜向霓虹色帶、全大寫 grotesk | 健身、遊戲、Gen-Z |
| `pastel-soft` | 柔和漸層、漂浮圓形、圓角 badge | 情侶、兒童、身心健康 |
| `mesh-glass` | mesh 漸層、毛玻璃面板、漸層字 | AI、生產力、「現代感」 |
| `feature-graphic` | 1024×500 Play 頭圖，標題左、傾斜裝置右 | 只給 Google Play |

版面（`render.mjs` 的 `LAYOUTS`，只管裝置位置）：

| layout | 裝置 | 文案 | 備註 |
|---|---|---|---|
| `bleed-bottom` | 置中、底部裁切 | 上 | 第一張的預設 |
| `bleed-top` | 頂部裁切 | 下 | 交錯用，有節奏 |
| `float` | 縮小、陰影、置中 | 上 | 安靜；給主視覺 UI |
| `tilt-left` / `tilt-right` | ±7°、陰影、底部出血 | 上 | 第 2–4 張 |
| `two-up` | 兩台裝置（`shot` + `shot2`） | 上 | 前後對比、淺深色 |
| `hero` | 大裝置、無文案 | 無 | UI 本身就是訊息時 |
| `panorama` | 一台裝置橫跨 2 張（`--out` 會得到 `id-1.png`、`id-2.png`） | 上 | Uber Eats 風；一套裡用一次 |

一套截圖選**一種風格**、版面**輪著換**（品質標準：相鄰兩張不准同構圖；5 張以上最多一個 panorama）。

## 4. 品質標準（自動化，來自 `references/quality-bar.md`）

每張渲染後會量測：
- 裝置佔畫布高度是否在該版面的預期範圍（風格可用 `<!-- expect: 0.35-0.6 -->` 覆蓋），
- 標題沒有水平溢出（縮短、`\n`、或調低 `titleSize`），
- 文案區塊與裝置重疊不超過 40 px。

警告會印出；`--strict` 讓整個 run 失敗。其餘規則（一張一訊息、最多 3 個視覺層、
panorama 的接縫規則）靠人把關。

## 5. 上傳

```sh
gpc images upload --type phoneScreenshots --locale zh-TW --path ./framed/zh-TW/
gpc images upload --type featureGraphic  --locale zh-TW --path ./framed/zh-TW/fg.png
asc screenshots upload …     # vendor/asc-skills → asc-shots-pipeline
```

產出即被接受的尺寸：1320×2868（iPhone 6.9"）、1024×500（feature graphic）。
其他尺寸：每張用 `size` 指定；版面是照 1320×2868 調的，注意 `⚠`。

## 6. Icon 各尺寸

`sh scripts/icon-set.sh assets/images/icon.png out/` → 1024（ASC）、512（Play）、180。

## 參考

- `references/renderer-evaluation.md` + `.png` — 渲染引擎評比（Playwright vs Koubou vs Satori vs frameit vs ParthJadhav）
- `references/quality-bar.md` — 構圖規則（ParthJadhav，MIT）
- `references/template-research.md` — 開源模板 repo、Figma CC-BY 模板、10 個參考 app
- `references/layouts-research.md` — 12 種版型 pattern 與尺寸表
- `example-manifest.json` — 所有風格與版面都在同一份裡
