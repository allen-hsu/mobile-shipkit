---
name: store-art
description: 用 HTML/CSS 風格 + Playwright 把原始截圖渲染成可直接上架的 App Store / Google Play 截圖——十五種視覺風格（editorial-light、bento-dark、minimal-light、bold-dark、pastel-soft、mesh-glass、paper-sticker、photo-backdrop、neo-brutalist、playful-pop、retro-warm、dark-pro、artsy-flat、photo-glass、bento-light；另有 feature-graphic）× 二十四種構圖（bleed、float、tilt、3D 透視、lean-back、iso-pair、two-up、peek-sides、hero、split-right、無框卡片、card-stack、scatter 拼貼、mosaic 三聯、crop-zoom、callout 放大鏡、panorama、sandwich、no-device、quote），加上元素層（UI 碎片、桂冠／圓形／膠囊戳章、星等、大數字、logo 格、引言卡、功能格、貼紙），依平台選用 iPhone 16/17 Pro Max、iPhone Air、Pixel 5、Galaxy S21 裝置框，一份 JSON manifest 驅動，內建自動品質檢查（裝置高度比例、標題溢出、文案與裝置重疊）與商店規範護欄（Play：禁裝置框／文字 ≤20%／禁促銷詞／禁 iPhone 圖像；Apple 2.3.10）。當使用者要「截圖加框」「截圖做得專業一點」、需要「feature graphic」「全景／接續截圖」、中日文文案、或要從 1024 母檔出 Play 512 icon 時使用。文案來自 store-screenshots（先寫標題）；本 skill 只負責渲染。
---

# store-art

原始截圖 + 標題 → 可上架的 PNG。經實測比較（`references/renderer-evaluation.md`）後選定：
HTML/CSS + Playwright 是唯一沒有能力缺口的方案——任何排版、Google Fonts、CJK、漸層、模糊、
多台裝置，每張 0.3–0.5 秒。Koubou / frameit / Satori / GUI 編輯器被淘汰的理由都在那份報告裡。

## 平台與裝置框

```sh
node scripts/render.mjs manifest.json --platform ios       # iPhone 16 Pro Max 邊框（預設）
node scripts/render.mjs manifest.json --platform android   # Pixel 5 框——Google Play 用這個
node scripts/render.mjs manifest.json --frame galaxy-s21   # 或直接指定某個框
```

`assets/frames/frames.json`：`iphone-16-pro-max`、`iphone-17-pro-max`、`iphone-air`（Apple 邊框，
來自 Koubou）、`pixel-5`、`galaxy-s21`（Facebook Design 框，來自 fastlane frameit）。每個框都會
正規化成相同的畫布寬度，所以所有版面對任何框都通用；單張可用 `"frame": "galaxy-s21"` 覆寫
（例如「也支援 Galaxy」那張）。餵給每個框它自己比例的截圖：iPhone 1320×2868 來自模擬器、
Android 1080×2340 來自 emulator——截圖是以 cover 方式塞進框的螢幕區，比例錯了會被裁切、不會被
壓扁。**不要**把 iPhone 截圖放進 Pixel 框給 Play，反之亦然：審核人員看得出來。

## 渲染器強制執行的商店規則

來源：[Play Console Help — preview assets](https://support.google.com/googleplay/android-developer/answer/9866151)、
[App Store Review Guidelines 2.3.10](https://developer.apple.com/app-store/review/guidelines/#accurate-metadata)。

| 規則 | 工具行為 |
|---|---|
| Play：手機截圖不放裝置框（「highly recommended」；影響 featuring 資格） | `--platform android` 把有框版面換成無框版面並提示；`--allow-frames` 可保留 |
| Play：禁第三方商標 / Apple：禁他平台裝置 | Android deck 出現 iOS 框（或反過來）**直接中止**，除非 `--allow-cross-platform` |
| Play：文字疊層 ≤ 20% 畫面 | 量測；超過 20% 出 `⚠` |
| Play：禁「Best / #1 / Top / New / Free / Discount / Sale / Million downloads」（中英） | 文案含有就 `⚠` |
| Play feature graphic：禁裝置圖像、禁「Free/New」 | Android 時自動拿掉裝置 |
| Apple 2.3.10：iOS 文案不得提及 Android / Google Play | 文案含有就 `⚠` |
| Apple / Play：截圖必須是真實 app | 看你——staging 資料可以，假 UI 不行 |

`--strict` 把每個 `⚠` 變成非零 exit，給 CI 用。

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

- `==word==` 標出強調段（各風格自己決定表現：底線色塊、強調色、漸層字）。`\n` 換行。
  單張的 key 會覆寫 `brand` / 頂層設定。
- `brand.bg / ink / accent / accent2` 可重新上色任何風格；不給就用風格自己的配色。
- 字型：預設 Google Fonts（Inter、Fraunces、Noto Sans/Serif TC、Noto Sans JP、Space Grotesk、
  DM Sans）。離線／CI：`"brand": {"fonts": {"local": "./fonts"}}` 會把該資料夾所有 .ttf/.otf 內嵌。
- 每個語系一份 manifest（`manifest.zh-TW.json`…）；`--out framed/zh-TW` 對應
  `gpc images upload` 與 `asc screenshots upload` 期待的結構。

## 2. 跟人類一起挑風格與版面（🧑）

```sh
node scripts/render.mjs manifest.json --preview styles  --out preview   # 第 1 張 × 所有風格
node scripts/render.mjs manifest.json --preview layouts --out preview   # 第 1 張 × 所有版面
```

各輸出一張有標籤的對照表（`preview-styles.png`、`preview-layouts.png`），縮圖尺寸——商店
最先呈現給人看的就是這個尺寸。拿給人看，讓人類挑**整套一個風格**、**每張一個版面**，把選擇
寫進 manifest，再正式渲染。自己控制裝置位置的風格（bento-dark）會宣告支援的版面，不支援時
退回並印一行 `ℹ`，不會產出壞圖。

## 3. 渲染

```sh
node scripts/render.mjs manifest.json --out framed/zh-TW          # 全部
node scripts/render.mjs manifest.json --out framed --only 01,fg   # 子集
node scripts/render.mjs manifest.json --out framed --html         # 保留 HTML 方便微調
node scripts/render.mjs manifest.json --out framed --strict       # 有品質警告就 exit 1（CI）
```

每張印 `✓` 或 `⚠` 並附原因。輸出目錄的 `report.json` 列出檔案、風格、版面與問題。

## 4. 風格 × 版面

風格（`styles/<name>.html`，自包含 HTML+CSS；每個都宣告 `default-layout`，所以整套 deck 的
差異在構圖不只在顏色；複製一份就能做自己的）：

| 風格 | 外觀 | 預設版面 | 適合 |
|---|---|---|---|
| `editorial-light` | 暖色紙感、襯線大標、==word== 下螢光筆、貼紙 | tilt-left | 生活風格、日誌、健康 |
| `bento-dark` | 發光底上的玻璃卡片、數據 `tiles` | float（僅 float/hero） | 數據、金融、專業工具 |
| `minimal-light` | 白底、置中、==word== 上強調色 | frameless-bleed | 工具類、Things 式純淨 |
| `bold-dark` | 黑底、斜向霓虹條紋、大寫 grotesk | peek-sides | 健身、遊戲、Gen-Z |
| `pastel-soft` | 柔和漸層、漂浮圓形 | card-stack | 情侶、兒童、身心健康 |
| `mesh-glass` | mesh 漸層、毛玻璃面板、漸層字 | callout | AI、生產力 |
| `paper-sticker` | 牛皮紙、膠帶、手寫 badge、麥克筆強調 | mosaic | 獨立開發、筆記、興趣 |
| `photo-backdrop` | 全出血照片（`bgImage`）+ 暗幕 | split-right | 旅遊、美食、生活 |
| `neo-brutalist` | 純黃底、粗框、硬偏移陰影 | tilt-right | 工具、開發、大膽品牌 |
| `playful-pop` | 飽和純色、白色圓體字、落下陰影 | two-up | 學習、兒童、遊戲 |
| `retro-warm` | 70 年代弧線、斜體襯線大標 | crop-zoom | 咖啡、音樂、日誌 |
| `dark-pro` | 近黑網格、mono badge、漸層標題 | bleed-bottom | 開發工具、金融、「Linear 系」 |
| `photo-glass` | 全出血照片 + 深色毛玻璃面板裝 UI 碎片（Haptic 那種） | no-device | 日誌、生活、高級感 |
| `bento-light` | bento-dark 的亮色版 | float | 數據、健康 |
| `artsy-flat` | 每張一個純色（`brand.palette` 輪替）、白邊黑描邊的無框手機、左對齊 grotesk | scatter | 市集、文化、時尚（Artsy 那種） |
| `feature-graphic` | 1024×500 Play 頭圖 | — | 僅 Google Play |

版面（`render.mjs` 的 `LAYOUTS`）——是**構圖**，不只是裝置位置：

| 版面 | 呈現什麼 | 文案 | 需要 |
|---|---|---|---|
| `bleed-bottom` / `bleed-top` | 有框裝置被邊緣切掉 | 上 / 下 | `shot` |
| `float` | 較小的有框裝置、帶陰影 | 上 | |
| `tilt-left` / `tilt-right` | ±7° 有框裝置、底部出血 | 上 | |
| `two-up` | 兩台有框裝置並排 | 上 | `shot2` |
| `peek-sides` | 兩台裝置從左右邊緣探入 | 上 | `shot2` |
| `hero` | 大裝置、無文案 | 無 | |
| `split-right` | 裝置在左半、文案在右 | 右 | |
| `frameless-bleed` / `frameless-top` | 截圖本身當圓角卡片，被底部／頂部切掉 | 上 / 下 | |
| `sandwich` | 兩張無框卡片上下出血、文案在中間 | 中 | `shot2` |
| `no-device` / `quote` | 只有標題 + 元素 / 只有一張引言卡 | 上 / 無 | `elements` |
| `scatter` | 四張小傾斜卡片散落畫布（Artsy 式拼貼）、文案在下 | 下 | `shot2..shot4` |
| `card-stack` | 兩張無框卡片扇形疊 | 上 | `shot2` |
| `mosaic` | 三張無框卡片並排、中間略高（三聯） | 上 | `shot2`、`shot3` |
| `crop-zoom` | UI 的一塊放大區域（`crop: {x,y,w,h}`） | 上 | `crop` |
| `callout` | 有框裝置 + 圓形放大鏡（`focus: {x,y}`、`bubble: {right,top}`） | 上 | `focus` |
| `persp-left` / `persp-right` | 裝置 3D 透視轉 ±26° | 上 | |
| `lean-back` | 裝置後仰 22°（rotateX） | 上 | |
| `iso-pair` | 兩台同 30° 角度、錯開 | 上 | `shot2` |
| `panorama` | 一台傾斜裝置橫跨兩張（`id-1.png`、`id-2.png`） | 上 | |

一套 deck 選一個風格；版面逐張變化（同樣的構圖不連續出現兩次、panorama ≤ 1、最強的
構圖放第 1 張）。`crop-zoom` 與 `callout` 就是 playbook 所說「放大標題在講的那塊 UI」的做法。

## 4a. 風格是元件的配方

一個風格就是 `styles/<name>.json`，由 `components/` 組裝：

```json
{ "bg": ["blobs", "grid"], "type": "serif-editorial", "device": "soft-shadow", "decor": ["sticker-red"],
  "tokens": { "bg": "#F4EFE6", "ink": "#1B1A17", "accent": "#FFB562", "accent2": "#7FC8A9", "muted": "#4A463F" },
  "defaultLayout": "tilt-left", "layouts": ["float","hero"], "expect": "0.4-0.75", "deviceOffset": 110, "css": "…" }
```

| 槽位 | 元件 |
|---|---|
| `bg`（一個或多個） | `solid` `gradient` `blobs` `grid` `mesh` `glow` `beam` `stripes` `arcs` `circles` `bubbles` `boxes` `photo` `dots` |
| `type` | `serif-editorial` `grotesk-upper` `clean-centered` `rounded-playful` `soft-centered` `gradient-text` `handwritten-accent` `photo-overlay` `brutal-block` `italic-serif` `mono-pro` `grotesk-left` `bento-cards` |
| `device` | `soft-shadow` `light-shadow` `deep-shadow` `hard-offset` `flat-pop` `paper-cut` `glow-ring` `white-mat` `none` |
| `decor` | `sticker-red` `sticker-hand` `tape` `rim` `glass-panel` `dark-glass-panel` `bento-tiles` `copy-card` |

Tokens 會變成 CSS 變數（`--bg --ink --accent --accent2 --accent3 --muted --em --pad
--copy-top --copy-bottom --grid-color …`）。一個新風格通常就是四個名字加五個顏色；一個新元件
就是一份小 JSON，含 `css`（可選 `html`）。手寫的 `styles/<name>.html` 仍然可用，給一次性的
情況（`feature-graphic.html`）。

## 4c. 你的素材（渲染器變不出來的）

31 組參考集裡有 11 組依賴 app 團隊自己提供的圖：吉祥物、線稿插畫、3D 貼紙、產品照、手握
手機照片、合作夥伴 logo。manifest 以檔案接收——放在 manifest 旁邊的 `assets/` 下：

```json
{ "id": "01", "layout": "no-device", "bgImage": "assets/hero.jpg",
  "elements": [ { "type": "image", "file": "assets/mascot.png", "width": 900, "at": {"x": "50%", "y": 1500} },
                { "type": "logos", "files": ["assets/press/time.svg", "assets/press/forbes.svg"], "cols": 2, "at": {"x":"50%","y":2500} } ] }
```

PNG / JPG / WebP / SVG。檔案缺了會帶路徑中止執行。授權是你的責任：圖庫照片、第三方 logo、
Apple/Google 圖像都要有授權（Play 會退未授權商標；Apple 5.2 同）。

## 4b. 元素——讓真實商店套圖看起來像真的那一層

分析 31 組已上架的 App Store 套圖（`references/reference-sets.zh-TW.md`）發現，差別很少在
背景：在於**從手機裡抽出來的 UI 碎片、證據戳章、大數字、logo 列、引言**。每張接受
`elements: [...]`，渲染在裝置之上；`at` 是 `{x, y}`，單位 px 或畫布的 `%`（元素中心點）。

| type | 是什麼 | keys |
|---|---|---|
| `crop` | 截圖的一塊被抽出來當漂浮卡片（一列、一顆按鈕、一個泡泡） | `crop:{x,y,w,h}`（截圖 px）、`width`、`rotate`、`radius`、`shot` |
| `stamp` | 證據徽章——`laurel`（桂冠）、`circle`（深色戳章）、`pill` | `kind`、`value`、`label`、`size` |
| `stars` | ★★★★★ + 說明 | `rating`、`label` |
| `stat` | 一個大數字 + 小標 | `value`、`label`、`size` |
| `logos` | 媒體／合作夥伴 logo 格 | `files[]`、`cols`、`width` |
| `quote` | 引言卡 | `text`、`author`、`role`、`avatar`、`width` |
| `features` | icon + 文字格 | `items:[{icon,label}]`、`cols`、`width` |
| `image` | 貼紙、3D icon、插畫、照片 | `file`、`width`、`rotate`、`shadow` |
| `text` | 自由文字 | `text`、`size`、`width`、`align` |

標題強調：`==word==`（風格的強調處理）與 `::word::`（實心膠囊）。兩個無裝置版面承載這些：
`no-device`（文案 + 元素）與 `quote`（只有元素）。`examples/elements-showcase.json` 每種都
渲染一次。

證據元素正是 Play 禁語會咬人的地方（"million downloads"、"#1"、"best"），也是 Apple 5.2.5
適用之處（不得捏造背書）——只放真實、現行的數字。

## 5. 品質檢查（自動，依 `references/quality-bar.md`）

每次渲染後量測頁面：
- 裝置佔畫布高度的比例符合預期（依版面；風格可用 `<!-- expect: 0.35-0.6 -->` 覆寫），
- 標題沒有水平溢出（縮短、用 `\n`、或調低 `titleSize`），
- 文案區塊與裝置重疊不超過 40 px。

警告會印出；`--strict` 會讓執行失敗。其餘的規範（一張一訊息、最多 3 個視覺層、panorama
的接縫規則）靠人。

## 6. 上傳

```sh
gpc images upload --type phoneScreenshots --locale zh-TW --path ./framed/zh-TW/
gpc images upload --type featureGraphic  --locale zh-TW --path ./framed/zh-TW/fg.png
asc screenshots upload …     # vendor/asc-skills → asc-shots-pipeline
```

產出並直接被接受的尺寸：1320×2868（iPhone 6.9"）、1024×500（feature graphic）。
其他尺寸：每張設 `size`；版面是以 1320×2868 調校的，留意 `⚠`。

## 7. Icon 衍生尺寸

`sh scripts/icon-set.sh assets/images/icon.png out/` → 1024（ASC）、512（Play）、180。

## 參考

- `references/renderer-evaluation.md` + `.png` — 渲染器實測（Playwright vs Koubou vs Satori vs frameit vs ParthJadhav）
- `references/quality-bar.md` — 構圖規則（ParthJadhav，MIT）
- `references/template-research.md` — 開源模板 repo、Figma CC-BY 合集、10 個參考 app
- `references/layouts-research.md` — 12 種版型 pattern 與尺寸表
- `references/decks.png` — 同一個五張故事以全部六種風格渲染
- `examples/deck.json` — 那套 deck 的 manifest（痛點 → 改變 → 證據 → 功能）
- `examples/elements-showcase.json` — 每種元素各一次
- `references/reference-sets.zh-TW.md` — 31 組已上架套圖逐組分析，對應到 style × layout × elements，附商店規範標記
- `example-manifest.json` — 所有風格與版面集中在一份
