---
name: store-art
description: 用 HTML/CSS 風格模板 + Playwright 把原始截圖渲染成 App Store / Google Play 成品——七種視覺風格（editorial-light、bento-dark、minimal-light、bold-dark、pastel-soft、mesh-glass、feature-graphic）× 八種裝置版面（bleed-bottom、bleed-top、float、tilt-left、tilt-right、two-up、hero、panorama），一份 JSON manifest 驅動，附自動品質檢查（裝置佔高比例、標題溢出、文案與裝置重疊）。當使用者要「截圖加框」「把商店截圖做專業」、需要「feature graphic」「全景／接續截圖」、中日文文案、或要從 1024 母檔出 Play 的 512 icon 時使用。文案來自 store-screenshots（先寫標題）；本 skill 只負責渲染。
---

# store-art

原始截圖 + 標題 → 可上架的 PNG。這是實際比過四種方案後的選擇（`references/renderer-evaluation.md`）：
HTML/CSS + Playwright 是唯一沒有能力缺口的——任何排版、Google Fonts、CJK、漸層、模糊、多台裝置，
每張 0.3–0.5 秒。Koubou / frameit / Satori / GUI 編輯器被淘汰的理由都在該報告裡。

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
      "subtitle": "行事曆、待辦與提醒整合在同一個畫面。", "sticker": "New", "shot": "raw/zh-TW/01.png" },
    { "id": "02", "style": "bento-dark", "layout": "float", "title": "See the ==pattern==",
      "tiles": [{"k":"98%","v":"keep logging"},{"k":"3 s","v":"per entry"}], "shot": "raw/zh-TW/02.png" },
    { "id": "03", "layout": "two-up", "title": "Light or ==dark==", "shot": "raw/a.png", "shot2": "raw/b.png" },
    { "id": "04", "layout": "panorama", "title": "One ==timeline==", "shot": "raw/zh-TW/03.png" },
    { "id": "fg", "style": "feature-graphic", "size": [1024, 500], "title": "Your day, ==at a glance==", "shot": "raw/zh-TW/01.png" }
  ]
}
```

- `==字==` 高亮一段（各風格自己決定怎麼呈現：底線色塊、強調色、漸層文字）。`\n` 換行。
  每張的鍵會覆蓋 `brand` / 頂層設定。
- `brand.bg / ink / accent / accent2` 可替任何風格換色；不給就用風格預設配色。
- 字型：預設走 Google Fonts（Inter、Fraunces、Noto Sans/Serif TC、Noto Sans JP、
  Space Grotesk、DM Sans）。離線 / CI：`"brand": {"fonts": {"local": "./fonts"}}` 會把該目錄所有
  .ttf/.otf 內嵌。
- 一個語系一份 manifest（`manifest.zh-TW.json`…）；`--out framed/zh-TW` 正好對上
  `gpc images upload` 與 `asc screenshots upload` 要的結構。

## 2. 跟人一起挑風格與版面（🧑）

```sh
node scripts/render.mjs manifest.json --preview styles  --out preview   # 第 1 張在每種風格各渲染一次
node scripts/render.mjs manifest.json --preview layouts --out preview   # 第 1 張在每種版面各渲染一次
```

各自輸出一張有標籤的對照圖（`preview-styles.png`、`preview-layouts.png`），縮圖大小——
就是商店真正先秀出來的大小。拿給人看，讓人挑**整套一個風格**與**每張一個版面**，把選擇寫進
manifest，再正式渲染。自己定位裝置的風格（bento-dark）會宣告它支援的版面，不支援時印一行 `ℹ`
並退回，不會吐出壞圖。

## 3. 渲染

```sh
node scripts/render.mjs manifest.json --out framed/zh-TW          # 全部
node scripts/render.mjs manifest.json --out framed --only 01,fg   # 子集
node scripts/render.mjs manifest.json --out framed --html         # 保留 HTML 方便微調
node scripts/render.mjs manifest.json --out framed --strict       # 有品質警告就 exit 1（CI 用）
```

每張印 `✓` 或 `⚠` 加原因。輸出目錄的 `report.json` 列出檔案、風格、版面與問題。

## 4. 風格 × 版面

風格（`styles/<name>.html`，自包含的 HTML+CSS，複製一份改就是自己的）：

| 風格 | 樣子 | 適合 |
|---|---|---|
| `editorial-light` | 暖紙色、襯線大標、==字== 下有螢光筆、貼紙 | 生活、日誌、健康 |
| `bento-dark` | 光暈上的玻璃卡片、數據 tile（`tiles`） | 數據、金融、專業工具 |
| `minimal-light` | 白底、置中、==字== 用強調色 | 工具類、Things 式純淨 |
| `bold-dark` | 黑底、斜向霓虹色帶、大寫 grotesk | 健身、遊戲、Gen-Z |
| `pastel-soft` | 柔和漸層、漂浮圓形、圓角 badge | 情侶、兒童、身心 |
| `mesh-glass` | 網格漸層、毛玻璃面板、漸層文字 | AI、生產力、「現代感」 |
| `feature-graphic` | 1024×500 Play 頭圖，標題左、傾斜裝置右 | 只給 Google Play |

版面（在 `render.mjs` 的 `LAYOUTS`，只管裝置位置）：

| 版面 | 裝置 | 文案 | 備註 |
|---|---|---|---|
| `bleed-bottom` | 置中、被底邊切掉 | 上 | 第一張的預設 |
| `bleed-top` | 被頂邊切掉 | 下 | 交錯用出節奏 |
| `float` | 較小、陰影、置中 | 上 | 沉穩；給主畫面 |
| `tilt-left` / `tilt-right` | ±7°、陰影、底部出血 | 上 | 第 2–4 張 |
| `two-up` | 兩台裝置（`shot` + `shot2`） | 上 | 前後對比、深淺模式 |
| `hero` | 大裝置、無文案 | 無 | UI 本身就是訊息時 |
| `panorama` | 一台裝置橫跨 2 張（`--out` 得到 `id-1.png`、`id-2.png`） | 上 | Uber Eats 風；一套用一次 |

一套挑一個風格，版面逐張變化（quality bar：連續兩張不可同構圖；5 張以上最多一個 panorama）。

## 5. 品質檢查（自動，依 `references/quality-bar.md`）

每張渲染後量測：
- 裝置佔畫布高度是否在預期範圍（依版面；風格可用 `<!-- expect: 0.35-0.6 -->` 覆蓋），
- 標題沒有水平溢出（縮短、`\n`、或降低 `titleSize`），
- 文案區塊與裝置重疊不超過 40 px。

警告會印出；`--strict` 會讓執行失敗。其餘規則（一張一訊息、最多 3 個視覺層、全景接縫規則）
由人把關。

## 6. 上傳

```sh
gpc images upload --type phoneScreenshots --locale zh-TW --path ./framed/zh-TW/
gpc images upload --type featureGraphic  --locale zh-TW --path ./framed/zh-TW/fg.png
asc screenshots upload …     # vendor/asc-skills → asc-shots-pipeline
```

產出並直接被收的尺寸：1320×2868（iPhone 6.9"）、1024×500（feature graphic）。
其他尺寸：每張設 `size`；版面是針對 1320×2868 調的，留意 `⚠`。

## 7. Icon 各尺寸

`sh scripts/icon-set.sh assets/images/icon.png out/` → 1024（ASC）、512（Play）、180。

## 參考

- `references/renderer-evaluation.md` + `.png` — 渲染器實測（Playwright vs Koubou vs Satori vs frameit vs ParthJadhav）
- `references/quality-bar.md` — 構圖規則（ParthJadhav，MIT）
- `references/template-research.md` — 開源模板 repo、Figma CC-BY 合集、10 個參考 app
- `references/layouts-research.md` — 12 種版型 pattern 與尺寸表
- `references/decks.png` — 同一個五張故事在六種風格下的成品
- `examples/deck.json` — 那套 deck 的 manifest（痛點 → 改變 → 證據 → 功能）
- `example-manifest.json` — 每種風格與版面各一張
