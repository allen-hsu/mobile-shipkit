---
name: store-art
description: 用 HTML/CSS 風格模板 + Playwright 把原始截圖渲染成可上架的 App Store / Google Play 截圖——13 種視覺風格（editorial-light、bento-dark、minimal-light、bold-dark、pastel-soft、mesh-glass、paper-sticker、photo-backdrop、neo-brutalist、playful-pop、retro-warm、dark-pro、artsy-flat；另有 feature-graphic）× 21 種構圖（bleed、float、tilt、3D 透視、lean-back、iso-pair、two-up、peek-sides、hero、split-right、無框卡片、card-stack、scatter 拼貼、mosaic 三聯、crop-zoom、callout 放大鏡、panorama），依平台選用 iPhone 16/17 Pro Max、iPhone Air、Pixel 5、Galaxy S21 裝置框，一份 JSON manifest 驅動，內建自動品質檢查（裝置高度比例、標題溢出、文案與裝置重疊）與商店規範護欄（Play：禁裝置框／文字 ≤20%／禁促銷字眼／禁 iPhone 圖像；Apple 2.3.10）。當使用者要「截圖加框」「讓商店截圖更專業」、需要 feature graphic、「全景／接續截圖」、中日文字幕，或要從 1024 母檔產 Play 512 icon 時使用。文案來自 store-screenshots（先寫標題）；本 skill 只負責渲染。
---

# store-art

原始截圖 + 標題 → 可上架的 PNG。經實測比較後選定（`references/renderer-evaluation.md`）：
HTML/CSS + Playwright 是唯一沒有能力缺口的方案——任何排版、Google Fonts、CJK、漸層、模糊、
多台裝置，每張 0.3–0.5 秒。Koubou / frameit / Satori / GUI 編輯器被淘汰的理由都在那份報告裡。

## 平台與裝置框

```sh
node scripts/render.mjs manifest.json --platform ios       # iPhone 16 Pro Max 邊框（預設）
node scripts/render.mjs manifest.json --platform android   # Pixel 5 邊框——Google Play 用這個
node scripts/render.mjs manifest.json --frame galaxy-s21   # 或直接指定某個框
```

`assets/frames/frames.json`：`iphone-16-pro-max`、`iphone-17-pro-max`、`iphone-air`（Apple 邊框，
來自 Koubou）、`pixel-5`、`galaxy-s21`（Facebook Design 裝置框，來自 fastlane frameit）。每個框都
會正規化到同一個畫布寬度，所以所有版面對任何框都適用；單張可用 `"frame": "galaxy-s21"` 覆寫
（例如「也支援 Galaxy」那張）。每個框要餵自己比例的截圖：iPhone 用模擬器的 1320×2868，Android 用
模擬器的 1080×2340——截圖會以 cover 方式填入框的螢幕區，比例不對會被裁切而不是壓扁。**不要**把
iPhone 截圖放進 Pixel 框拿去 Play，反之亦然：審核人員看得出來。

## 渲染器強制執行的商店規則

來源：[Play Console Help — preview assets](https://support.google.com/googleplay/android-developer/answer/9866151)、
[App Store Review Guidelines 2.3.10](https://developer.apple.com/app-store/review/guidelines/#accurate-metadata)。

| 規則 | 會發生什麼 |
|---|---|
| Play：手機截圖不放裝置框（「highly recommended」；影響推薦資格） | `--platform android` 會把有框版面改成無框版面並說明；`--allow-frames` 可保留 |
| Play：禁第三方商標／Apple：禁其他平台的裝置 | android deck 出現 iOS 框（或反過來）會**直接中止**，除非 `--allow-cross-platform` |
| Play：文字疊層 ≤ 畫面 20% | 會量測；超過 20% 出 `⚠` |
| Play：禁「Best / #1 / Top / New / Free / Discount / Sale / Million downloads」（英＋中） | 文案含有時出 `⚠` |
| Play feature graphic：禁裝置圖像、禁「Free/New」 | android 下自動移除裝置 |
| Apple 2.3.10：iOS 文案不得提及 Android / Google Play | 文案含有時出 `⚠` |
| Apple / Play：截圖必須是真實 app | 靠你——staging 資料可以，假 UI 不行 |

`--strict` 會把每個 `⚠` 變成非零 exit，給 CI 用。

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

- `==字==` 標出高亮（由各風格決定呈現方式：底線色塊、強調色、漸層文字）。`\n` 換行。
  每張的鍵會覆寫 `brand` / 頂層設定。
- `brand.bg / ink / accent / accent2` 可替任何風格換色；不給就用該風格的預設配色。
- 字型：預設走 Google Fonts（Inter、Fraunces、Noto Sans/Serif TC、Noto Sans JP、
  Space Grotesk、DM Sans）。離線／CI：`"brand": {"fonts": {"local": "./fonts"}}` 會把該資料夾內
  所有 .ttf/.otf 內嵌。
- 每個語系一份 manifest（`manifest.zh-TW.json`…）；`--out framed/zh-TW` 正好對應
  `gpc images upload` 與 `asc screenshots upload` 要的結構。

## 2. 跟人一起挑風格與版面（🧑）

```sh
node scripts/render.mjs manifest.json --preview styles  --out preview   # 第 1 張套所有風格
node scripts/render.mjs manifest.json --preview layouts --out preview   # 第 1 張套所有版面
```

各自輸出一張有標籤的縮圖對照表（`preview-styles.png`、`preview-layouts.png`），大小就是商店
第一眼看到的尺寸。拿給人看，讓人選定**整套用一種風格**、**每張各一個版面**，把選擇寫進 manifest，
再正式渲染。自己決定裝置位置的風格（bento-dark）會宣告支援的版面，不支援時用 `ℹ` 提示退回，
不會產出壞圖。

## 3. 渲染

```sh
node scripts/render.mjs manifest.json --out framed/zh-TW          # 全部
node scripts/render.mjs manifest.json --out framed --only 01,fg   # 部分
node scripts/render.mjs manifest.json --out framed --html         # 保留 HTML 方便微調
node scripts/render.mjs manifest.json --out framed --strict       # 有品質警告就 exit 1（CI）
```

每張印 `✓` 或 `⚠` 並附原因。輸出目錄的 `report.json` 列出檔案、風格、版面與問題。

## 4. 風格 × 版面

風格（`styles/<name>.html`，獨立的 HTML+CSS；每個都宣告 `default-layout`，讓整套在構圖上
有差異而不只是換色；複製一份就能做自己的）：

| 風格 | 樣子 | 預設版面 | 適合 |
|---|---|---|---|
| `editorial-light` | 暖色紙張、襯線標題、==字== 下方螢光筆、貼紙 | tilt-left | 生活風格、日記、健康 |
| `bento-dark` | 發光背景上的玻璃卡片、數據 `tiles` | float（只支援 float/hero） | 數據、金融、專業工具 |
| `minimal-light` | 白底、置中、==字== 用強調色 | frameless-bleed | 工具類、Things 式純淨感 |
| `bold-dark` | 黑底、斜向螢光條、大寫 grotesk | peek-sides | 健身、遊戲、Z 世代 |
| `pastel-soft` | 柔和漸層、漂浮圓形 | card-stack | 情侶、兒童、身心健康 |
| `mesh-glass` | 網格漸層、毛玻璃面板、漸層文字 | callout | AI、生產力 |
| `paper-sticker` | 牛皮紙、膠帶、手寫 badge、麥克筆高亮 | mosaic | 獨立開發、筆記、嗜好 |
| `photo-backdrop` | 全出血照片（`bgImage`）加暗幕 | split-right | 旅遊、美食、生活風格 |
| `neo-brutalist` | 平塗黃底、粗邊框、硬偏移陰影 | tilt-right | 工具、開發者、大膽品牌 |
| `playful-pop` | 飽和純色、白色圓體字、投影 | two-up | 學習、兒童、遊戲 |
| `retro-warm` | 70 年代弧形、斜體襯線標題 | crop-zoom | 咖啡、音樂、日記 |
| `dark-pro` | 近黑網格、等寬 badge、漸層標題 | bleed-bottom | 開發工具、金融、「Linear 風」 |
| `artsy-flat` | 每張一個純色（`brand.palette` 輪替）、白色襯底 + 黑描邊的無框手機、左對齊 grotesk | scatter | 市集、文化、時尚（Artsy 那種風格） |
| `feature-graphic` | 1024×500 Play 頭圖 | — | 只給 Google Play |

版面（`render.mjs` 的 `LAYOUTS`）——是**構圖**，不只是裝置位置：

| 版面 | 呈現什麼 | 文案 | 需要 |
|---|---|---|---|
| `bleed-bottom` / `bleed-top` | 有框裝置被邊緣切掉 | 上 / 下 | `shot` |
| `float` | 較小的有框裝置，帶陰影 | 上 | |
| `tilt-left` / `tilt-right` | ±7° 有框裝置，底部出血 | 上 | |
| `two-up` | 兩台有框裝置並排 | 上 | `shot2` |
| `peek-sides` | 兩台裝置從左右邊緣探入 | 上 | `shot2` |
| `hero` | 大型有框裝置，無文案 | 無 | |
| `split-right` | 裝置在左半、文案在右 | 右 | |
| `frameless-bleed` / `frameless-top` | 截圖本身作為圓角卡片，被底部 / 頂部邊緣切掉 | 上 / 下 | |
| `scatter` | 四張小卡傾斜散落畫面（Artsy 式拼貼），文案在下 | 下 | `shot2..shot4` |
| `card-stack` | 兩張無框卡片扇形堆疊 | 上 | `shot2` |
| `mosaic` | 三張無框卡片並排、中間略高（三聯） | 上 | `shot2`、`shot3` |
| `crop-zoom` | 放大 UI 的某個區域（`crop: {x,y,w,h}`） | 上 | `crop` |
| `callout` | 有框裝置 + 圓形放大鏡（`focus: {x,y}`、`bubble: {right,top}`） | 上 | `focus` |
| `persp-left` / `persp-right` | 裝置在 3D 透視中側轉 ±26° | 上 | |
| `lean-back` | 裝置後仰 22°（rotateX） | 上 | |
| `iso-pair` | 兩台同為 30° 角度、錯開排列 | 上 | `shot2` |
| `panorama` | 一台傾斜裝置橫跨兩張（`id-1.png`、`id-2.png`） | 上 | |

一套選一種風格；版面逐張變化（不連續兩張同構圖、panorama ≤ 1 張、最強的放第 1 張）。
`crop-zoom` 與 `callout` 就是 playbook 說的「放大標題所講的那個部分」。

## 5. 品質標準（自動化，來自 `references/quality-bar.md`）

每次渲染後量測頁面：
- 裝置佔畫布高度是否在預期範圍（依版面；風格可用 `<!-- expect: 0.35-0.6 -->` 覆寫），
- 標題沒有水平溢出（縮短、加 `\n`，或調低 `titleSize`），
- 文案區塊與裝置重疊不超過 40 px。

警告會印出；`--strict` 讓整次失敗。其餘標準（一張一訊息、最多 3 個視覺層次、panorama 的
接縫規則）靠人判斷。

## 6. 上傳

```sh
gpc images upload --type phoneScreenshots --locale zh-TW --path ./framed/zh-TW/
gpc images upload --type featureGraphic  --locale zh-TW --path ./framed/zh-TW/fg.png
asc screenshots upload …     # vendor/asc-skills → asc-shots-pipeline
```

產出並直接被接受的尺寸：1320×2868（iPhone 6.9"）、1024×500（feature graphic）。
其他尺寸：逐張設 `size`；版面是以 1320×2868 調校的，留意 `⚠`。

## 7. Icon 衍生尺寸

`sh scripts/icon-set.sh assets/images/icon.png out/` → 1024（ASC）、512（Play）、180。

## 參考

- `references/renderer-evaluation.md` + `.png` — 渲染器實測比較（Playwright vs Koubou vs Satori vs frameit vs ParthJadhav）
- `references/quality-bar.md` — 構圖規則（ParthJadhav，MIT）
- `references/template-research.md` — 開源模板 repo、Figma CC-BY 模板、10 個參考 app
- `references/layouts-research.md` — 12 種版型模式與尺寸表
- `references/decks.png` — 同一個五張故事用六種風格渲染
- `examples/deck.json` — 該 deck 的 manifest（痛點 → 改變 → 證據 → 功能）
- `example-manifest.json` — 所有風格與版面集於一檔
