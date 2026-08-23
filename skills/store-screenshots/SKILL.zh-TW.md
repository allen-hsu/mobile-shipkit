---
name: store-screenshots
description: 五步驟端到端產出 App Store 與 Google Play 截圖——(1) App brief（從商店頁或一句話）、(2) Release build 用 sim-use 截圖、(3) 從 30 種風格的型錄或參考案例選外觀、(4) 尺寸／平台／語系、(5) 審稿頁（brief + 每句標題）給同事簽核之後才渲染——接著用 store-art 渲染、可選用 Codex 生吉祥物／貼紙／背景、跑品質檢查、用 gpc / asc 上傳、30 天後重測文案。當使用者要「商店截圖」「App Store 截圖」「Play 截圖」「feature graphic」、多語系截圖、說 listing「轉換不好」、想要可審稿的計畫再渲染、或截圖裡出現 Expo Go 浮動工具列時使用。含標題檢查清單與從 DesignerAnts / Paul Solt 整理的 58 條文案規則。
---

# store-screenshots

**截圖效果的 70% 來自文字，不是 UI。** 有 app 只改文案、畫面不動，轉換率 +80%
（Paul Solt 引 DesignerAnts）。所以流程是先寫字、先審、再渲染。「先拍五張漂亮的再想標題」
就是那篇文章在講的錯誤。

五步驟、每步一個檔案，渲染前全部可審：

```
1 App brief ──► 2 Screens ──► 3 Look ──► 4 Sizes ──► 5 Review ──► 渲染 ──► 上傳 ──► 量測
  brief.json     raw/<locale>/   風格 +     平台        review.html   store-art   gpc / asc  30 天
  （商店頁或      NN.png          型錄或     尺寸        （artifact，   --strict
   一句話）                       參考案例   語系         給同事留言）
```

配套 skill：`store-art`（渲染、風格、素材）、`store-listing`（描述／關鍵字）、
`submit-google` / `submit-apple`（上傳）。2026 年 8 月在全新 SDK 57 app 驗證：
Release build → sim-use → store-art → Play 接受。

## 0. 建骨架

```sh
node skills/store-art/scripts/new-deck.mjs store/screenshots --locale zh-TW
```

產生 `store/screenshots/`：`brief.json`、`copy.<locale>.json`、`raw/<locale>/`、`assets/`、
和列好指令的 README。之後全部在這個資料夾裡做。

## 1. App brief（🧑 確認）

填 `brief.json → app`：**名稱、類別、核心價值、目標用戶**——三句話，不是功能清單。已上架的直接匯入：

```sh
node skills/store-art/scripts/import-listing.mjs "https://apps.apple.com/tw/app/…/id123?l=zh" --dir store/screenshots
node skills/store-art/scripts/import-listing.mjs "https://play.google.com/store/apps/details?id=com.x&hl=zh_TW" --dir store/screenshots
```

會填好名稱／類別／評分／核心價值（描述第一句），完整 listing 存到 `listing.json`，並把**現在上架的**截圖
下載到 `raw/<locale>/store-NN.png`——那是做好的行銷圖，用來看目前店面長怎樣，不是原始 UI；步驟 2 要重拍。
沒上架的就從 `store/`、README、onboarding 文案、評論找。

然後是**外觀選項**：2–3 個底色、2–4 個強調色、文字色、3–5 個語氣詞。
這些是給審稿人「選」的，不是替他決定。

把**標題序列**寫進 `brief.json → screens`（一張一個區塊）：

| # | role | 任務 | 類型 |
|---|---|---|---|
| 1 | `hook` | 講痛點或前提 | app |
| 2 | `shift` | 對他有什麼改變 | app |
| 3 | `proof` | 數字、收集感、成果 | app / text |
| 4–5 | `feature` | 讓承諾成立的功能 | app |
| 6+ | `objection` / `social` / `platform` | 隱私、價格、真實評論、裝置廣度 | text / testimonial |

每個區塊：`role`、`note`（這張為什麼存在）、`type`（`app` \| `text` \| `testimonial`）、
`shot`（raw 路徑或 `auto`）、`title`、`subtitle`；text / testimonial 另有 `features` 列或 `quote`。
規則（完整版在 `references/copywriting.md`）：

- 每句 ≤ 8 個詞 / 12 個中文字；副標可省，≤ 12 詞。
- 講結果不講功能。「深色模式」→「凌晨兩點眼睛不累」。
- 動詞開頭或用戶情境開頭；不要 app 名、不要「隆重推出」。
- 不要「第一」「最佳」「立即下載」「免費」、不用 emoji、不用驚嘆號。
- **遮住 UI 測試**：只讀標題、照順序，要是一個故事。
- 每個語系都是重寫，不是翻譯（`brief.zh-TW.json`、`brief.ja.json`…）。

## 2. Screens（Release build、sim-use、不盲點）

每張 `app` 畫面先決定「哪個狀態能證明這句標題」——常常不是最漂亮的那張
（「30 天資料」「清單 3 筆」→ staging 清單）。然後：

```sh
npx expo run:ios --configuration Release --device "iPhone 16 Pro Max"   # 不要 Expo Go（浮動工具列）
sim-use describe-ui && sim-use tap @14 && sleep 1
sim-use screenshot --output raw/zh-TW/01.png                             # 1320×2868
```

- staging 改碼加 `// DO NOT COMMIT: screenshot staging`；拍完 `git checkout -- .`。
- Release build 失敗 → `eas-build-doctor` case 5（Xcode 26.3 + expo-modules-jsi patch）。拍完刪 `ios/`（CNG）。
- 一個語系一個 raw 資料夾；app 內切語言、重跑同一個腳本。
- **Play 要 Android 截圖**（2026-08-23 在 Pixel 3a API 34 AVD 用真 app 驗證）：
  ```sh
  bundletool build-apks --bundle=build.aab --output=tmp/app.apks --mode=universal && bundletool install-apks --apks=tmp/app.apks   # 直接用 release AAB，不必重 build
  sim-use android init --device emulator-5554                      # 每個 AVD 一次；android 指令都要 --device <serial>
  sim-use android describe-ui --device emulator-5554 && sim-use android tap --device emulator-5554 @6
  adb -s emulator-5554 exec-out screencap -p > raw-android/zh-TW/01.png   # 3a 是 1080×2220；`sim-use android screenshot` 在模擬器上會失敗（bridge 限流）——用 screencap
  ```
  先清狀態列：`adb shell settings put global sysui_demo_allowed 1 && adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 0941`（再加 `-e command notifications -e visible false`）。模擬器語言切到要拍的語系。不要拿 iPhone 截圖塞 Pixel 框。

把路徑填進 brief 的 `shot`（留 `auto` 讓編譯器輪流用）。

## 3. Look（🧑 選）

```sh
node skills/store-art/scripts/catalog.mjs --deck manifest.zh-TW.json --out preview/catalog   # 30 種風格 × 真文案
```

給審稿人看型錄；**整套選一種風格**——要跟同類 app 常用的配色拉開。其他路：對照 31 組分析過的
上架案例（`store-art/references/reference-sets.zh-TW.md`，每組對應到風格），或團隊給的參考圖
（選最接近的風格、調 tokens）。寫進 `brief.json → look.style`。

沒人畫得出來的素材——吉祥物、3D 貼紙、功能圖示、背景——列在 `assets.json`，生一次：

```sh
node skills/store-art/scripts/gen-assets.mjs assets.json --out assets --ref raw/zh-TW/01.png
```

（Codex 圖像生成；手機裡仍是真截圖、標題仍是文字。）沒素材就選不需要的風格——
除了 photo-backdrop / photo-glass / paper-sticker 都可以。

## 4. Sizes

`brief.json → output`：`platform`（`ios` \| `android`）、`size`（iPhone 6.9" 1320×2868 是唯一必要尺寸；
通用 app 加 iPad 13" 2064×2752；Play 接受 iPhone 尺寸）、`locale`、`subtitles` 開關。
一個語系一份 brief；一個平台一份 manifest。

## 5. Review（🧑 簽核——這是閘門）

```sh
node skills/store-art/scripts/brief.mjs brief.json --review review.html          # 審稿頁
node skills/store-art/scripts/brief.mjs brief.json --review review.html --thumbs framed/zh-TW   # 第二輪，附渲染結果
```

`review.html` 是一頁自包含的審稿頁：app 資訊、外觀選項（已選的標記）、遮住 UI 測試那一行、
每張一張卡（類型 · 截圖 · 標題 · 副標）、審稿清單。發成 artifact 讓同事就地留言；
把意見改回 `brief.json` 再重產。這頁沒有 OK 之前不渲染。

## 渲染

```sh
node skills/store-art/scripts/brief.mjs brief.json --compile manifest.zh-TW.json
node skills/store-art/scripts/render.mjs manifest.zh-TW.json --out framed/zh-TW --strict
node skills/store-art/scripts/render.mjs manifest.zh-TW.json --platform android --out framed-android/zh-TW
```

編譯器把類型對應到版型（`app` → 有框輪替、`text` → no-device + 功能列、`testimonial` → 引言卡 + 星等）；
每張的微調（`device`、`elements`、`layout`）直接改 manifest——
`store-art/references/manifest-reference.md` 列出所有旋鈕。`⚠` 是品質檢查；改 manifest，不要忽略。
縮圖大小打開一次：每句標題都讀得到嗎？

## 上傳

```sh
gpc images upload --type phoneScreenshots --locale zh-TW --path ./framed-android/zh-TW/ --replace --confirm   # 驗證過：4 張替換成功
gpc images upload --type featureGraphic  --locale zh-TW --path ./framed-android/zh-TW/feature-graphic/fg.png
asc screenshots validate --path ./framed/zh-TW --device-type IPHONE_67                 # 先跑這個：要 0 errors
asc screenshots upload --app <id> --version <x.y.z> --path ./framed/zh-TW --device-type IPHONE_67
```

`render.mjs` 讓輸出資料夾**只有截圖**（report → `<out>.report.json`、feature graphic → `<out>/feature-graphic/`），因為兩個上傳工具都會吃 `--path` 裡的每個檔案：gpc 會把 `fg.png` 當手機截圖上傳、`asc validate` 看到 `report.json` 就報錯。
Apple 只接受 *Prepare for Submission* 狀態版本的媒體——`WAITING_FOR_REVIEW`、`READY_FOR_SALE` 都鎖住；先建下一版（`asc versions create`）。

## 量測、改寫、重來

商店頁是廣告；廣告要測。30 天後看 App Analytics / Play Console 轉換率。沒動就改
`brief.json` 的標題——不是改設計——重跑步驟 5 → 渲染。Apple：Product Page Optimization
（3 組）；Play：Store Listing Experiments。先改第一張。

## 尺寸

| 商店 | 必要 | 像素 | 備註 |
|---|---|---|---|
| App Store | iPhone 6.9" | 1320×2868 | 16 Pro Max 模擬器；ASC 自動縮到小機型 |
| App Store | iPad 13"（有 iPad 版） | 2064×2752 | |
| Google Play | 手機 2–8 張 | 接受 1320×2868；16:9 或 9:16，320–3840 px | 同一批檔案可用 |
| Google Play | feature graphic | 1024×500 | `style: feature-graphic` |

## 參考

- `references/optimization-theory.zh-TW.md` — 工作模型（漏斗、文字、順序、視覺、合規、測試）與一頁清單
- `references/copywriting.md` — 58 條規則、15 組改寫、10 項檢查、出處
- `references/paul-solt-screenshot-mistake.md` — 本流程依據的文章
- `../store-art/examples/brief.json` — 完整六張 brief（app / text / testimonial）
- `../store-art/references/quality-bar.md` — 構圖規則
