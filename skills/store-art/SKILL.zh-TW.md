---
name: store-art
description: 用 HTML/CSS + Playwright 把原始截圖渲染成可直接上架的 App Store / Google Play 截圖，一份 JSON manifest 驅動。30 種可組合風格（bg × type × device × decor 元件配方）× 30 種版型（bleed、float、tilt、3D 透視、手持斜角、two-up、peek-sides、hero、無框卡片、card-stack、deck 牌堆、scatter、mosaic、two-strip、crop-zoom、callout、panorama、sandwich、no-device、quote），加上元素層（UI 碎片、桂冠／膠囊／便利貼戳章、星等、大數字、logo、引言、功能格、貼紙、說明文字）。依平台選 iPhone 16/17 Pro Max、iPhone Air、Pixel 5、Galaxy S21 裝置框；自動品質檢查（裝置占比、標題溢出、文案重疊）與商店規範護欄（Play：禁裝置框／文字 ≤20%／禁促銷詞／禁 iPhone 圖像；Apple 2.3.10）。一個指令出全部風格型錄給人審、一個指令建專案骨架。當使用者要「截圖加框」「截圖做專業一點」「feature graphic」「全景截圖」、中日文文案、「全部風格試一遍」、或 Play 512 icon 時使用。文案由 store-screenshots 先寫；本 skill 只負責渲染。
---

# store-art

原始截圖 + 標題 → 可上架 PNG，而且可重複。HTML/CSS + Playwright 是比稿選出來的
（`references/renderer-evaluation.md`）：沒有能力缺口（任何字型、CJK、漸層、模糊、多裝置），
每張 0.3–0.5 秒。所有東西都是資料：**manifest** 說要什麼、**style** 說長什麼樣、
**layout** 說手機放哪、**elements** 加上證明層。沒有任何東西是在編輯器裡手動拖的，
所以改文案、加語系、UI 更新後，整套幾秒就重出。

## 整體架構

```
manifest.json ──┐
                │   styles/<name>.json  = 配方 { bg, type, device, decor, tokens }
raw/*.png ──────┼─►     └─ components/{bg,type,device,decor}/<name>.json  (css + html 片段)
assets/* ───────┤   LAYOUTS (render.mjs) = 裝置放哪；copy 翻面時用 alt 位置
                │   elements            = crop / stamp / stat / logos / quote / image / text
                ▼
          components/base.html  →  Playwright  →  framed/<locale>/NN.png + report.json
                                        │
                                        ├─ 品質檢查（裝置占比 · 溢出 · 重疊）      → ⚠
                                        └─ 商店規則（Play 框/文字/禁詞 · Apple 2.3.10）→ ⚠ / 停止
```

| 層 | 檔案 | 什麼時候改它 |
|---|---|---|
| manifest | `manifest.<locale>.json` | 文案、截圖、每張的版型/風格/顏色、元素、手機微調 |
| style | `styles/<name>.json` | 新的「長相」：四個元件名 + 五個顏色 |
| component | `components/<slot>/<name>.json` | 新的背景／字型處理／陰影／裝飾，所有風格都能用 |
| layout | `scripts/render.mjs` 的 `LAYOUTS` | 新的構圖（裝置位置、旋轉、多張卡） |
| frame | `assets/frames/` | 新的裝置邊框 |
| house deck | `examples/house-deck/deck.json` | 所有風格都用它來評的固定五張故事 |

`node scripts/render.mjs --list` 印出目前型錄（30 風格、30 版型、20 bg / 25 type / 9 device / 9 decor 元件）。
`references/manifest-reference.md` 逐一說明每個欄位。

## 資料夾

```
store-art/
  SKILL.md · SKILL.zh-TW.md
  scripts/render.mjs      渲染器（manifest → PNG、品質檢查、商店規則、--preview、--list）
  scripts/catalog.mjs     house deck × 所有風格 → 審稿大圖
  scripts/new-deck.mjs    在 app 裡建 store/screenshots/ 骨架（brief.json、assets.json、copy、manifest）
  scripts/brief.mjs       brief.json → review.html（簽核頁）· brief.json → manifest（編譯）
  scripts/import-listing.mjs  貼 App Store / Play 連結 → brief.json + listing.json + 現有商店截圖
  scripts/gen-assets.mjs  用 Codex 圖像生成做吉祥物／貼紙／圖示／背景，自動去背
  scripts/icon-set.sh     1024 → 512 / 180 icon
  styles/                 30 個配方 + feature-graphic.html
  components/             base.html + bg/ type/ device/ decor/
  assets/frames/          邊框圖 + frames.json（平台 → 邊框）
  examples/house-deck/    deck.json + 兩張示範截圖（catalog.mjs 用）
  examples/deck.json      一套真實的 痛點 → 轉變 → 證明 → 功能 deck
  examples/elements-showcase.json · examples/all-styles-layouts.json
  examples/ai-assets.json · examples/ai-assets-deck.json   AI 素材套圖
  references/             manifest-reference.md · quality-bar.md · reference-sets.zh-TW.md（31 組上架案例）· landscape.md · renderer-evaluation.md · layouts-research.md
```

## 安裝（一次）

```sh
cd skills/store-art && npm run setup      # playwright + chromium（約 350 MB）
```

## 可重複的流程

### 0. 建骨架（新 app）——五步驟流程本身在 `store-screenshots`

```sh
node skills/store-art/scripts/new-deck.mjs store/screenshots --locale zh-TW --style editorial-light
```

產生 `copy.zh-TW.json`、`manifest.zh-TW.json`（已接到 `raw/zh-TW/NN.png`）、`raw/`、`assets/`、
和一份列好指令的 README。文案先行——那一步由 `store-screenshots` §1 負責。

### 1. 截圖

Release build → `sim-use screenshot --output raw/zh-TW/01.png`（iPhone 1320×2868；Play 版用模擬器
1080×2340）。不要用 Expo Go。細節見 `store-screenshots` §3。

### 2. 選風格（🧑 人工步驟）

```sh
node scripts/render.mjs manifest.zh-TW.json --preview styles  --out preview   # 第 1 張 × 所有風格
node scripts/render.mjs manifest.zh-TW.json --preview layouts --out preview   # 第 1 張 × 所有版型
node scripts/catalog.mjs --deck manifest.zh-TW.json --out preview/catalog      # 整套 × 所有風格
```

型錄就是審稿面：一列一種風格、五張、同樣文案。**一套只選一種風格**、每張各選版型
（要有變化；最強的放第 1 張；panorama ≤ 1），寫回 manifest。

### 3. 渲染

```sh
node scripts/render.mjs manifest.zh-TW.json --out framed/zh-TW --strict          # App Store
node scripts/render.mjs manifest.zh-TW.json --platform android --out framed-android/zh-TW   # Google Play（無框、Pixel 截圖）
node scripts/render.mjs manifest.zh-TW.json --out framed --only 01,fg --html     # 單張，保留 HTML
```

每張印 `✓` 或 `⚠ 原因`。`report.json` 列出檔案、風格、版型、問題。

### 4. 上傳

```sh
gpc images upload --type phoneScreenshots --locale zh-TW --path framed-android/zh-TW --replace --confirm
gpc images upload --type featureGraphic  --locale zh-TW --path framed-android/zh-TW/fg.png
asc screenshots upload …      # vendor/asc-skills → asc-shots-pipeline
```

## Manifest（你真正在編輯的東西）

```json
{
  "platform": "ios", "style": "editorial-light",
  "brand": { "accent": "#F59E0B", "accent2": "#34D399" },
  "screens": [
    { "id": "01", "layout": "bleed-bottom", "badge": "全新 2.0", "title": "一眼看懂\n==今天的行程==",
      "subtitle": "行事曆、待辦與提醒整合在同一個畫面。", "shot": "raw/zh-TW/01.png",
      "elements": [ { "type": "stamp", "kind": "laurel", "value": "4.8", "label": "App Store", "at": { "x": 990, "y": 260 } } ] },
    { "id": "02", "layout": "float", "copy": "bottom", "title": "See the ==pattern==", "shot": "raw/zh-TW/02.png",
      "device": { "top": 150, "scale": 0.66 } },
    { "id": "03", "layout": "two-up", "title": "Light or ==dark==", "shot": "raw/a.png", "shot2": "raw/b.png" },
    { "id": "04", "layout": "no-device", "bg": "#1F6BFF", "title": "近 30 種植物",
      "elements": [ { "type": "crop", "crop": { "x": 0.02, "y": 0.27, "w": 0.96, "h": 0.08 }, "width": 1100, "at": { "x": "50%", "y": 1600 } } ] },
    { "id": "fg", "style": "feature-graphic", "size": [1024, 500], "title": "Your day, ==at a glance==", "shot": "raw/zh-TW/01.png" }
  ]
}
```

- `==字==` = 該風格的強調處理；`::字::` = 實心膠囊；`\n` 換行。
- 每張可覆寫 `brand` / 最上層：`style`、`layout`、`copy`、`align`、`titleSize`、
  顏色（`bg bg2 ink accent accent2 accent3 muted`）、`device`、`elements`。
- 一個語系一份 manifest；`--out framed/<locale>` 對應 `gpc` / `asc` 上傳的結構。

## 微調——什麼問題轉哪個旋鈕

| 你想要 | 改哪裡 | 欄位 |
|---|---|---|
| 手機高一點／低一點／小一點 | screen | `device: { top, scale }`（`top` < 0 從上方出血） |
| 手機偏左／偏右 | screen | `device.x: "60%"` |
| 文案放下面 | screen | `copy: "bottom"`——有 `alt` 的版型會自動把手機挪位 |
| 文字靠左／置中／靠右 | screen | `align` |
| 標題太大／換行 | screen | `titleSize`、`\n` |
| 某一張換色 | screen | `bg`、`ink`、`accent`… |
| 整套換色 | `brand` | 同上 |
| 每張輪流換底色 | `brand.palette` 或風格的 `palette` | 顏色陣列 |
| 一塊 UI 浮出手機外 | screen | `elements: [{type:"crop", crop:{x,y,w,h} 比例, width, at, rotate}]` |
| 獎章／大數字／logo／引言 | screen | `elements`（`stamp`、`stat`、`logos`、`quote`、`features`、`stars`） |
| 吉祥物／照片／3D 貼紙 | screen | `elements: [{type:"image", file:"assets/…"}]` 或 `bgImage`；用 `gen-assets.mjs` 生 |
| 功能格用圖片圖示 | screen | `features.items[].icon` = `assets/icon.png`，`size` 調字級 |
| 手機模糊當背景 | screen | `device.blur: 14` + 前面疊一個 `crop` |
| 一張場景橫跨整套 | `brand` | `bgImage`（N × 1320 寬）+ `bgSpan: true` |
| 品牌色描邊手機 | style | `device: "brand-ring"`（`--ring`、`--frame-radius`） |
| 收尾 CTA 張 | brief | `type: "cta"`（iOS；Play 禁「下載／免費」字樣） |
| 用現有零件拼新風格 | `styles/x.json` | 選 `bg/type/device/decor`、設 tokens、`defaultLayout` |
| 新背景／新字型處理 | `components/<slot>/x.json` | `{css, html}`，用 `var(--bg)`、`var(--accent)`… |
| 新的裝置位置 | `render.mjs` 的 `LAYOUTS` | `css`、`second/third`、`kind`、`alt`、`expect` |
| 元件寫不出來的 CSS | 風格的 `css` | 最後追加 |
| 想直接看某張的 CSS 調 | CLI | `--html`，開檔改，改好搬回元件 |

座標：`at` 是元素**中心**，畫布 px 或 `%`；crop 框是**截圖的 0–1 比例**，所以同一份 manifest
iPhone 與 Pixel 截圖都能用。

## 風格是配方

```json
{ "bg": ["blobs", "grid"], "type": "serif-editorial", "device": "soft-shadow", "decor": ["sticker-red"],
  "tokens": { "bg": "#F4EFE6", "ink": "#1B1A17", "accent": "#FFB562", "accent2": "#7FC8A9", "muted": "#4A463F" },
  "defaultLayout": "tilt-left" }
```

型錄裡的家族（完整清單用 `--list`）：**淺色編輯感**（editorial-light、minimal-light、lavender-serif、
dotted-gallery、mint-playful、pastel-soft、pastel-grain、peach-warm、sage-laurel）、**深色／專業**
（dark-pro、bold-dark、bento-dark、studio-dark、navy-photo、mesh-glass、mesh-neon、plum-glow）、
**鮮豔**（electric-blue、serif-vivid、sky-clouds、neon-illustration、playful-pop、neo-brutalist、
retro-warm、artsy-flat）、**照片／素材驅動**（photo-backdrop、photo-glass、paper-sticker），
另有 `feature-graphic`。一套一種風格；型錄的那一列五秒就能看出它縮圖撐不撐得住。

## 版型

`--list` 印出全部 30 個、文案位置、各自需要什麼（`shot2`、`crop`、`focus`、`elements`）。
家族：**有框**（bleed-bottom/top、float、tilt-left/right、bleed-top-tilt/right、tilt-hard-left/right、
two-up、peek-sides、hero、persp-left/right、lean-back、iso-pair、panorama、callout）、
**無框**（frameless-bleed/top、card-stack、deck、scatter、mosaic、two-strip、sandwich、crop-zoom）、
**無裝置**（no-device、quote）。`--platform android` 時有框版型會改對應到無框版（Play 建議），
除非 `--allow-frames`。

## 元素——證明層

從 31 組上架案例（`references/reference-sets.zh-TW.md`）看：真正的商店圖跟「加框截圖」的差別
很少在背景，而是浮出手機的 UI、數字、戳章、logo、引言。`crop` · `image` · `stamp`
（laurel / circle / pill / sticky / scallop）· `stars` · `stat` · `logos` · `quote`（card / plain）·
`features` · `text`。所有文字欄位——標題、副標、badge、元素文字——都過商店規則掃描。
只能用真實、現在的數字（Apple 5.2.5、Play 促銷規範）。

## 素材——自己給或用 AI 生

吉祥物、線稿、3D 貼紙、照片、手持手機照、合作 logo：放進 `assets/`，從 `image` / `logos` /
`bgImage` 引用。檔案不存在會直接停止並印出路徑。授權是你的責任（Play 會退未授權商標；Apple 5.2 也是）。
沒有素材就選不需要的風格——除了 photo-backdrop / photo-glass / paper-sticker，其他全部只靠截圖就完整。

**團隊畫不出來的東西用生的**（makeshots.app 的做法，但保留真實 UI）：

```sh
node scripts/gen-assets.mjs assets.json --out assets --ref raw/zh-TW/01.png
```

`assets.json` 列出要生的項目（`sticker` / `icon` → 正方形白底、自動去背成透明 PNG；`backdrop` →
直式、中央留白）。每項一次 `codex exec` 呼叫 Codex 內建圖像生成（約 30 秒）；第一張結果會回傳當
參考圖，後面的姿勢角色與配色會一致。渲染器把它們當一般素材放進去——手機裡仍是真截圖、標題仍是
HTML 文字、商店檢查照跑。範例：`examples/ai-assets.json` → `examples/ai-assets-deck.json`
（便便植物園吉祥物套圖，sky-clouds）。白色主體會讓白底去背失效，遇到時在 prompt 裡指定單色底。

## 品質檢查與商店規則

每張渲染後量測：裝置占畫布高度比例（依版型；風格 `expect` 可覆寫）、標題溢出、文案與裝置重疊 > 40 px。
商店規則（[Play 預覽素材](https://support.google.com/googleplay/android-developer/answer/9866151)、
[App Store 2.3.10](https://developer.apple.com/app-store/review/guidelines/#accurate-metadata)）：

| 規則 | 行為 |
|---|---|
| Play：不要裝置框 | `--platform android` 改對應無框版；`--allow-frames` 保留 |
| Play：禁第三方商標／Apple：禁其他平台裝置 | android deck 出現 iOS 框（反之亦然）**直接停止**，除非 `--allow-cross-platform` |
| Play：文字 ≤ 圖的 20% | 量測；超過 `⚠` |
| Play：禁 最佳／第一／Top／全新／免費／折扣／特價／百萬下載（中英） | `⚠` |
| Apple 2.3.10：iOS 文案不提 Android / Google Play | `⚠` |
| Play feature graphic：不放裝置、不寫 Free/New | 自動移除裝置 |

`--strict` 讓每個 `⚠` 變成 exit 1 給 CI。其餘——一張一個訊息、最多三個視覺層、全景接縫——靠人
（`references/quality-bar.md`）。

## Icon

`sh scripts/icon-set.sh assets/images/icon.png out/` → 1024（ASC）、512（Play）、180。

## 參考

- `references/manifest-reference.md` — 所有欄位與旗標
- `references/quality-bar.md` — 構圖規則
- `references/reference-sets.zh-TW.md`（+ 英文版）— 31 組上架 App Store 案例，逐一對應到風格 × 版型 × 元素
- `references/renderer-evaluation.md` + `.png` — 比稿
- `references/landscape.md` — 看過的所有工具／服務／模板來源、拿了什麼、還沒做的
- `references/layouts-research.md` — 版型模式的來源
- `examples/house-deck/deck.json` — `catalog.mjs` 用的五張故事
- `examples/deck.json`、`examples/elements-showcase.json`、`examples/all-styles-layouts.json`
