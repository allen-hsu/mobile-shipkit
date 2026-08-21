# 商店截圖渲染方案評估（取代 Koubou）

日期：2026-08-21　環境：macOS arm64、Node 24、Python 3.13、rbenv Ruby 3.3
原始截圖：`e2e-shots/raw/01-home.png`（1320×2868）
裝置框：Koubou 快取 `~/.koubou/frames/0.18.1/iPhone 16 Pro Max - Black Titanium - Portrait.png`（1470×3000；螢幕開口 x=75, y=66，大小 1320×2868，實際量測；與 fastlane `offsets.json` 的 `+75+66` 一致）

對照圖：`render-eval/compare.png`

| # | 方案 | 成品 | 版面自由度 | 字型 / CJK | 單張速度* | 依賴重量 | 批次 / 多語系 |
|---|------|------|-----------|-----------|----------|---------|--------------|
| 1 | **HTML/CSS + Playwright** | `playwright/01-editorial-zh.png`、`02-bento-ja.png`、`03-feature-graphic.png`(1024×500) | ★★★★★ 完整 CSS（grid、blur、gradient、transform、drop-shadow） | ★★★★★ Google Fonts 直接用；Noto Sans/Serif TC、JP 正常 | 截圖 0.3–0.5 s；含字型下載約 4–5 s | 18 MB npm + Chromium ~350 MB | ★★★★★ 自訂 manifest.json 迴圈 |
| 2 | ParthJadhav/app-store-screenshots | `parth/01-parth-zh.png` | ★★★☆☆ 6 種固定 layout + 拖拉元素、5 個主題 | ★★★☆☆ 寫死 Inter；CJK 靠系統 fallback | 48 張（4 尺寸×2 語系×6 頁）20 s | Next.js 15 + React RC，node_modules 380 MB | ★★★☆☆ 有 JSON 狀態檔與 locale，匯出需按 GUI 按鈕 |
| 3 | Satori + resvg | `satori/01-satori-zh.png` | ★★★★☆ flex-only 子集；絕對定位、旋轉、漸層文字可 | ★★★★☆ 須自備字型檔（Noto CJK TC Bold 17 MB）；emoji 另處理 | 排版 0.6 s + 點陣化 5–8 s | 18 MB npm，**不需瀏覽器** | ★★★★★ 純 JS 函式，最好內嵌 |
| 4 | fastlane frameit | `frameit/01-frameit-zh.png` | ★☆☆☆☆ keyword + title + 置中裝置，與 Koubou 同級 | ★★★☆☆ 可指定 .ttf，CJK OK | ~80 s（ImageMagick） | Ruby gems 88 MB + ImageMagick（brew 約 3 分）+ 首次下載 280 張框約 5 分 | ★★★☆☆ Framefile.json + .strings，每語系一資料夾 |
| 5 | Figma 模板 + API（僅評估） | — | ★★★★★ 設計師友善 | ★★★★★ | 受 REST 速率限制 | 需 Figma 帳號／Dev seat | ★★☆☆☆ 換文字需 Plugin/MCP，REST 只能匯出 |

\* 皆為本機實測，詳見各節。

---

## 1. HTML/CSS + Playwright（Chromium 截圖）— 基準線

### 安裝
```bash
npm i playwright
npx playwright install chromium      # ~350 MB，只下 Chromium 即可
```

### 驅動方式
`node playwright/render.mjs manifest.json <outDir>`：讀 `manifest.json`（`screens[]` 每筆含 `template`、`size`、`locale`、`badge`、`title`、`subtitle`、`shot`、可選 `tiles`），以 JS 模板字串組 HTML → `page.setContent()` → 等 `document.fonts.ready` → `page.screenshot()`。裝置框與截圖以 base64 data URI 內嵌，不需 HTTP server。

三個模板證明風格差異：
- **editorial**（亮色）：Noto Serif TC 170px 大標 + 底線色塊、badge、blur 色斑、格線背景、旋轉 -4° 的 PNG 裝置框 + drop-shadow、紅色圓形貼紙。
- **bento**（深色）：CSS grid 卡片、漸層 badge、glass card、三格數據 tile（漸層文字），日文 Noto Sans JP。
- **feature**（1024×500 Google Play 主圖）：雙裝置各自 rotate/scale。

### 實測
- 3 張（2 張 1320×2868 + 1 張 1024×500）共 4.1 s；截圖本身 100–400 ms，其餘是 Google Fonts 下載（每個 page 重抓）。
- 10 張批次 50 s（約 5 s/張）。把字型改成本機 `@font-face`、共用 context 並行，可降到 < 1 s/張。
- 輸出尺寸精準（viewport = 目標尺寸、deviceScaleFactor 1）。

### 優點
- 版面上限 = 瀏覽器上限：grid、backdrop-filter、mask、clip-path、SVG 插圖、可變字重全部可用；AI 或設計師改 HTML 就能出新風格。
- CJK/多語系零成本：Noto 系列 `<link>` 即可；`lang` 屬性讓同一字碼依語系選字形。
- 自動換行、文字量測、`text-wrap: balance` 交給瀏覽器。
- 模板 HTML 可直接在瀏覽器預覽/調整，debug 成本最低。
- 同一套模板換 `size` 即可出 1024×500、iPad、Android 尺寸。

### 缺點
- 需要 Chromium（~350 MB）；CI 要 `playwright install --with-deps chromium`。
- 字型走網路時有非決定性（需等 `document.fonts.ready`）；離線環境要打包字型。
- 啟動瀏覽器約 0.5–1 s 固定成本（批次只付一次）。

---

## 2. ParthJadhav/app-store-screenshots

### 它是什麼
不是渲染函式庫，而是一個 **Claude Code / Cursor 的 Skill**（`SKILL.md` 約 2,700 行提示詞 + 6 份風格提示），會把 `template/` 的 **Next.js 15 + React 19 RC + Tailwind + shadcn** 專案 scaffold 成本機 GUI 編輯器：左側 screen 列表、中間 connected canvas（元素可跨頁拖拉）、右側 inspector。狀態存於 `app-store-screenshots.json`（schema v2：`slidesByDevice`、每 slide 的 `layout`/`label`/`headline`（按 locale）/`transforms`）。匯出用瀏覽器端 `html-to-image` → JSZip 下載。

### 安裝（實測）
```bash
git clone --depth 1 https://github.com/ParthJadhav/app-store-screenshots
cp -R skills/app-store-screenshots/template app && cd app
rm bun.lock && npm install --legacy-peer-deps   # React RC 需 legacy peer deps；380 MB
# 截圖放 public/screenshots/apple/iphone/<locale>/01.png，改 JSON
npx next dev -p 3777
```

### 能不能 CLI？
官方沒有。我用 Playwright 開 `localhost:3777`、點「Export bundle」並攔截 download，**20 s 得到 48 張 PNG**（iPhone 4 尺寸 × en/zh-Hant × 6 slides），可半自動化（腳本 `playwright/drive-parth.mjs`）。代價是要跑 dev server，且 `html-to-image` 是 DOM→canvas 近似實作，不如 Chromium 原生截圖可靠。

### 優點
- 現成 6 種 layout（device-bottom / two-devices / device-top / no-device…）、5 個主題、多 locale、RTL 指引、跨頁連續畫布——概念正確。
- JSON 狀態檔可 git 追蹤，人可用 GUI 微調位置。

### 缺點
- 本質是 GUI 工具 + 龐大提示詞；新風格要靠 agent 改 TSX，不是模板驅動。
- 字型寫死 Inter（`next/font/google`），CJK 只靠 fallback（成品中文為系統 PingFang）。
- 內建 mockup 是**金色 iPhone 15 Pro** 單一 PNG、以 6.1" 為基準，塞 6.9" 截圖時邊緣被裁（見成品）。
- React RC、Next 15.0.3 偏舊，依賴 380 MB，啟動慢。

---

## 3. Satori + @resvg/resvg-js（JSX → SVG → PNG，不需瀏覽器）

### 安裝
```bash
npm i satori @resvg/resvg-js                 # 18 MB，含 darwin-arm64 原生 binding
curl -L -o NotoSansTC-Bold.otf https://github.com/notofonts/noto-cjk/raw/main/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Bold.otf  # 17 MB，字型要自備
```

### 驅動方式
`node satori/render.mjs`：用 `h()` 組 React-like element tree（無需 React），`satori(tree, {width, height, fonts})` 產 SVG，`new Resvg(svg, {font:{loadSystemFonts:false}}).render().asPng()`。

### 驗證結果
- ✅ 繁中 / 日文 / 韓文（Noto CJK TC 含 Hangul）、中英混排、**無手動換行的長句自動折行**正確。
- ✅ `position:absolute`、`transform: rotate()`、`linear-gradient`、`background-clip:text` 漸層文字、`border-radius`、`box-shadow` 可用；雙裝置疊放成功。
- ❌ emoji 顯示豆腐（需提供 emoji 字型或 `graphemeImages`）。
- ❌ `filter: drop-shadow()` 對文字渲染異常（黑色拖影）；CSS `filter`、`backdrop-filter`、`grid`、`float` 不支援，只有 flexbox。
- ❌ 每個文字節點都必須在 `display:flex` 容器內，否則直接 throw；inline 富文字混排限制多。
- 速度：satori 0.2–0.9 s；**resvg 點陣化 5–8 s**（內嵌兩張 1.5K×3K PNG + 旋轉 + 模糊）。純色矩形只要 0.2 s，瓶頸是大圖重採樣而非字型。

### 優點
- 無瀏覽器、純 Node，可嵌進任何 CLI（Go 的 gpc 可透過 `node` 子程序或 WASM 呼叫）。
- 決定性輸出、字型完全受控、離線可用。
- 與 `@vercel/og` 同引擎，生態成熟。

### 缺點
- CSS 子集限制多，設計迭代常踩「不支援」；玻璃、濾鏡、SVG filter 插圖受限。
- 要自行管理字型檔（CJK 一個字重 17 MB；多語系多個檔）。
- 大圖合成比 Chromium 慢一個數量級。

---

## 4. fastlane frameit

### 安裝（實測，很重）
```bash
brew install imagemagick                     # 必要，約 3 分鐘
# 系統 fastlane 2.210 太舊不認得 iPhone 16 Pro Max，另開隔離 bundle：
printf 'source "https://rubygems.org"\ngem "fastlane", "~> 2.238"\n' > Gemfile
bundle config set --local path vendor/bundle && bundle install   # 88 MB
cd screenshots && COLUMNS=120 FASTLANE_SKIP_UPDATE_CHECK=1 bundle exec fastlane frameit
```
踩雷：
- 非 TTY 下因 `"-" * negative` 當掉，要設 `COLUMNS`。
- 首次從 `fastlane.github.io/frameit-frames` 下載 280 張框（約 5 分鐘，附 Facebook 授權聲明）；被 timeout 中斷會從頭再來。
- 檔名必須帶裝置名（`iPhone 16 Pro Max-01.png`），語系靠資料夾名。

### 驅動方式
`Framefile.json`（`default` + `data[]` 以 filter 對應檔名）+ `title.strings`/`keyword.strings`；可指定 `.ttf`、顏色、字級、`background`、`padding`、`stack_title`、`title_below_image`、`show_complete_frame`。成品 1320×2868，繁中字型正確。

### 優點
- 成熟、Apple/Android 裝置框齊全、offsets 官方維護；與 fastlane deliver/snapshot 無縫。
- 可指定 CJK 字型。

### 缺點
- **版面上限等於 Koubou**：只有 keyword + title 兩行、置中裝置、單張背景圖；沒有 badge、多裝置、色塊、自由定位。
- ImageMagick + Ruby 依賴重，單張 80 s。
- 文字用 ImageMagick 排，無自動換行智慧、無富文字。

（appshots / frames-cli / ScreenshotFramer 未實裝：同屬「框 + 文字」級別，能力不會超過 frameit，故以 frameit 代表。）

---

## 5. Figma 模板 + API（僅評估）

- 本機 Figma MCP 已登入（org Dev seat）；REST `GET /v1/images/:file_key?ids=…&format=png&scale=1` 可匯出任意 node 為 PNG，尺寸由 frame 決定，1320×2868 / 1024×500 沒問題。
- **瓶頸在「換字、換截圖」**：REST 不能改文字，須用 Plugin API（Figma desktop 開著跑 plugin）或 `use_figma` MCP 寫入，再呼叫 images 匯出；images endpoint 有速率限制且回傳非同步 CDN 連結。
- 適合設計師主導、數量少、需 100% 貼合品牌的情境；不適合 CI 無人值守、多語系 × 多尺寸幾十張。
- 結論：可作為「設計師在 Figma 定稿 → 轉成方案 1 的 HTML/CSS 模板」的上游，而非渲染引擎。

---

## 最終推薦

**主渲染器：方案 1 — HTML/CSS 模板 + Playwright（Chromium）。**

理由：
1. 需求清單（多字體、色塊、badge、多裝置、背景插圖、CJK、1320×2868 與 1024×500）一次滿足，且是**唯一**在實測中沒有任何能力缺口的方案；其餘三者都在版面或字型上碰壁。
2. 模板就是 HTML，迭代最快：AI 生成新風格、設計師改 CSS、瀏覽器預覽，不需學工具專屬 DSL。
3. 批次與多語系只是 manifest 陣列迴圈；字型透過 Google Fonts 或本地 `@font-face` 覆蓋所有語系。
4. 每張 0.3–0.5 s，瀏覽器固定成本只付一次；Chromium 350 MB 是唯一代價，CI 上 `playwright install chromium` 已是標準操作。

落地建議（給 gpc / mobile-shipkit）：
- 字型改本地 `@font-face`（Noto Sans TC/JP/KR + 一個展示字體）並內嵌 base64，去掉網路依賴與 4 s 字型等待。
- manifest schema 沿用 `playwright/manifest.json` 的形狀：`{frame, frameInset, screens:[{id, template, size, locale, strings…, shot}]}`；文案抽成 `strings/<locale>.json` 以銜接 `asc-localize-metadata`。
- 裝置框直接沿用 Koubou 快取 PNG（offset 75,66 已驗證），不用 CSS 假框。
- 共用一個 `browser.newContext()`，`Promise.all` 並行多 page，10 張可壓到 < 5 s。

**備援：方案 3 Satori** — 若要做成零依賴單一 binary（Go gpc 不想帶 Chromium），Satori 是可接受的退路，但要接受 flex-only、自備字型、大圖合成 5–8 s，視覺上限明顯低於 Chromium。

**不建議**：frameit（與 Koubou 同級、依賴重、慢）與 ParthJadhav skill（GUI 工具、版面靠改 TSX、字型/裝置框寫死，適合互動微調而非 pipeline）。

---

## 檔案索引
- `playwright/render.mjs`、`playwright/manifest.json`；成品 `playwright/01-editorial-zh.png`、`02-bento-ja.png`、`03-feature-graphic.png`（對應 `.html` 可直接開啟）
- `playwright/drive-parth.mjs`：驅動 ParthJadhav 編輯器匯出的腳本
- `parth/app/`：scaffold 出的 Next.js 專案；`parth/editor-ui.png`（編輯器畫面）；成品 `parth/01-parth-zh.png`
- `satori/render.mjs`、`satori/fonts/`；成品 `satori/01-satori-zh.png`；`satori/probe.png`（CJK 折行／emoji／shadow 探測）
- `frameit/screenshots/Framefile.json`、`frameit/run.log`；成品 `frameit/01-frameit-zh.png`
- `assets/frame.png`（iPhone 16 Pro Max 框）、`assets/shot.png`
- `compare.py` → `compare.png`
