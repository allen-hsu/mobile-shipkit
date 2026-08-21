---
name: store-art
description: 用 HTML/CSS 風格模板 + Playwright 把原始截圖渲染成 App Store / Google Play 可上架的成品——十二種視覺風格（editorial-light、bento-dark、minimal-light、bold-dark、pastel-soft、mesh-glass、paper-sticker、photo-backdrop、neo-brutalist、playful-pop、retro-warm、dark-pro；另有 feature-graphic）× 十五種構圖（bleed、float、tilt、two-up、peek-sides、hero、split-right、無框卡片、card-stack、mosaic 拼貼、crop-zoom、callout 放大鏡、panorama），一份 JSON manifest 驅動，附自動品質檢查（裝置佔高比例、標題溢出、文案與裝置重疊）。當使用者要「截圖加框」「截圖做得專業一點」、需要「feature graphic」「全景／接續截圖」、中日文文案、或從 1024 母檔出 Play 的 512 icon 時使用。文案來自 store-screenshots（先寫標題）；本 skill 只負責渲染。
---

# store-art

原始截圖 + 標題 → 商店成品 PNG。經實測比較後選定（`references/renderer-evaluation.md`）：
HTML/CSS + Playwright 是唯一沒有能力缺口的方案——任何排版、Google Fonts、CJK、漸層、模糊、
多台裝置，每張 0.3–0.5 秒。Koubou / frameit / Satori / GUI 編輯器被淘汰的理由都在那份報告裡。

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

- `==字==` 標記高亮片段（怎麼呈現由風格決定：底線色塊、強調色、漸層字）。`\n` 換行。
  每張的鍵會覆蓋 `brand` / 頂層設定。
- `brand.bg / ink / accent / accent2` 可為任何風格換色；不給就用風格自己的配色。
- 字型：預設 Google Fonts（Inter、Fraunces、Noto Sans/Serif TC、Noto Sans JP、
  Space Grotesk、DM Sans）。離線／CI：`"brand": {"fonts": {"local": "./fonts"}}` 會把該資料夾內
  所有 .ttf/.otf 內嵌進去。
- 一個語系一份 manifest（`manifest.zh-TW.json`…）；`--out framed/zh-TW` 正好對上
  `gpc images upload` 與 `asc screenshots upload` 要的結構。

## 2. 跟人一起挑風格與版面（🧑）

```sh
node scripts/render.mjs manifest.json --preview styles  --out preview   # 第 1 張 × 每個風格
node scripts/render.mjs manifest.json --preview layouts --out preview   # 第 1 張 × 每個版面
```

各自產出一張有標籤的縮圖對照表（`preview-styles.png`、`preview-layouts.png`），大小就是商店
第一眼看到的縮圖尺寸。拿給人看，讓人挑**整套一個風格**與**每張一個版面**，把選擇寫進
manifest，再正式渲染。自己定位裝置的風格（bento-dark）會宣告它支援的版面，遇到不支援的
會印一行 `ℹ` 退回預設，而不是產出壞圖。

## 3. 渲染

```sh
node scripts/render.mjs manifest.json --out framed/zh-TW          # 全部
node scripts/render.mjs manifest.json --out framed --only 01,fg   # 子集
node scripts/render.mjs manifest.json --out framed --html         # 保留 HTML 方便微調
node scripts/render.mjs manifest.json --out framed --strict       # 有品質警告就 exit 1（CI）
```

每張印 `✓` 或 `⚠` 並附原因。輸出目錄的 `report.json` 列出檔案、風格、版面與問題。

## 4. 風格 × 版面

風格（`styles/<name>.html`，自包含 HTML+CSS；每個都宣告 `default-layout`，所以整套的差別在
構圖不只在顏色；複製一份改就是自己的風格）：

| style | 外觀 | 預設版面 | 適合 |
|---|---|---|---|
| `editorial-light` | 暖色紙張、襯線大標、==字== 底下螢光筆、貼紙 | tilt-left | 生活風格、日記、健康 |
| `bento-dark` | 光暈上的玻璃卡片、數據 `tiles` | float（僅 float/hero） | 數據、金融、專業工具 |
| `minimal-light` | 白底置中、==字== 強調色 | frameless-bleed | 工具類、Things 式純粹 |
| `bold-dark` | 黑底斜向霓虹色條、大寫 grotesk | peek-sides | 健身、遊戲、Gen-Z |
| `pastel-soft` | 柔和漸層、漂浮圓形 | card-stack | 情侶、兒童、身心健康 |
| `mesh-glass` | 網格漸層、毛玻璃面板、漸層字 | callout | AI、生產力 |
| `paper-sticker` | 牛皮紙、膠帶、手寫 badge、麥克筆高亮 | mosaic | 獨立開發、筆記、興趣 |
| `photo-backdrop` | 全出血照片（`bgImage`）加遮罩 | split-right | 旅遊、美食、生活 |
| `neo-brutalist` | 平塗黃底、粗框線、硬陰影 | tilt-right | 工具、開發者、大膽品牌 |
| `playful-pop` | 高飽和純色、白色圓體、投影 | two-up | 學習、兒童、遊戲 |
| `retro-warm` | 70 年代弧形、斜體襯線大標 | crop-zoom | 咖啡、音樂、日記 |
| `dark-pro` | 近黑網格、等寬字 badge、漸層標題 | bleed-bottom | 開發工具、金融、「Linear 風」 |
| `feature-graphic` | 1024×500 Play 頭圖 | — | 僅 Google Play |

版面（`render.mjs` 的 `LAYOUTS`）——是**構圖**，不只是裝置位置：

| layout | 呈現什麼 | 文案 | 需要 |
|---|---|---|---|
| `bleed-bottom` / `bleed-top` | 有框裝置被邊緣切掉 | 上 / 下 | `shot` |
| `float` | 較小的有框裝置、陰影 | 上 | |
| `tilt-left` / `tilt-right` | ±7° 有框裝置，底部出血 | 上 | |
| `two-up` | 兩台有框裝置並排 | 上 | `shot2` |
| `peek-sides` | 兩台裝置從左右邊緣探入 | 上 | `shot2` |
| `hero` | 大裝置、無文案 | 無 | |
| `split-right` | 裝置在左半、文案在右 | 右 | |
| `frameless-bleed` | 截圖本身做成圓角卡片 | 上 | |
| `card-stack` | 兩張無框卡片扇形堆疊 | 上 | `shot2` |
| `mosaic` | 三張無框卡片拼貼 | 上 | `shot2`、`shot3` |
| `crop-zoom` | 放大 UI 的某個區域（`crop: {x,y,w,h}`） | 上 | `crop` |
| `callout` | 有框裝置 + 圓形放大鏡（`focus: {x,y}`、`bubble: {right,top}`） | 上 | `focus` |
| `panorama` | 一台傾斜裝置橫跨兩張（`id-1.png`、`id-2.png`） | 上 | |

一套選一個風格；版面逐張變化（同一構圖不連續出現兩次、panorama ≤ 1 張、最強的放第 1 張）。
`crop-zoom` 與 `callout` 就是 playbook 那條「放大標題在講的那塊 UI」的落實方式。

## 5. 品質檢查（自動，依 `references/quality-bar.md`）

每張渲染後量測：
- 裝置佔畫布高度是否在預期範圍（依版面；風格可用 `<!-- expect: 0.35-0.6 -->` 覆蓋），
- 標題沒有水平溢出（縮短、`\n` 換行、或調低 `titleSize`），
- 文案區塊與裝置重疊不超過 40 px。

警告會印出；`--strict` 會讓執行失敗。其餘規則（一張一訊息、最多三層視覺、全景的接縫規則）
由人把關。

## 6. 上傳

```sh
gpc images upload --type phoneScreenshots --locale zh-TW --path ./framed/zh-TW/
gpc images upload --type featureGraphic  --locale zh-TW --path ./framed/zh-TW/fg.png
asc screenshots upload …     # vendor/asc-skills → asc-shots-pipeline
```

產出即被接受的尺寸：1320×2868（iPhone 6.9"）、1024×500（feature graphic）。
其他尺寸：每張設 `size`；版面是針對 1320×2868 調的，留意 `⚠`。

## 7. Icon 各尺寸

`sh scripts/icon-set.sh assets/images/icon.png out/` → 1024（ASC）、512（Play）、180。

## 參考

- `references/renderer-evaluation.md` + `.png` — 渲染器實測比較（Playwright vs Koubou vs Satori vs frameit vs ParthJadhav）
- `references/quality-bar.md` — 構圖規則（ParthJadhav，MIT）
- `references/template-research.md` — 開源模板 repo、Figma CC-BY 模板集、10 個參考 app
- `references/layouts-research.md` — 12 種版面 pattern 與尺寸表
- `references/decks.png` — 同一段五張故事在所有風格下的渲染
- `examples/deck.json` — 該 deck 的 manifest（痛點 → 改變 → 證據 → 功能）
- `example-manifest.json` — 所有風格與版面集於一檔
