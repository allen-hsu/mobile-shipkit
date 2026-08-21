---
name: store-screenshots
description: 端到端產出 App Store 與 Google Play 截圖，文案先行——在拍任何畫面之前先寫好標題序列（痛點 → 改變 → 證據 → 功能），再用 sim-use 拍 iOS 模擬器的 Release build（Play 則用 Android 模擬器）、用 store-art 渲染、跑品質檢查、用 gpc / asc 上傳，30 天後回頭重測文案。當使用者要「商店截圖」「App Store 截圖」「Play 截圖」「feature graphic」、多語系截圖、說自己的商店頁「轉換率不好」，或 Expo Go 的浮動工具列跑進截圖時使用。內含標題檢核表與從 DesignerAnts / Paul Solt 提煉的 58 條文案原則。
---

# store-screenshots

**截圖效果的 70% 來自文字，不是 UI。** 有 app 只改了文案、畫面不動，轉換率就提升 80%
（Paul Solt 引述 DesignerAnts）。所以這個 skill 先寫字，再決定哪個畫面能證明那句話，再拍，再渲染。
反過來做——先拍五張好看的畫面、再用功能名稱當標題——就是那篇文章說的大家都在犯的錯。

2026-08 在全新 SDK 57 專案驗證過：Release build → sim-use → store-art → Play 直接收。
搭配的 skill：`store-art`（渲染）、`store-listing`（描述／關鍵字）、`submit-google` / `submit-apple`（上傳）。

## 0. 讀的是 app，不是功能清單

動筆前：這是給誰用的、他們之前卡在哪、用一週後什麼改變了、哪一個數字或事實能證明。
從 `store/`、README、onboarding 文案、評論（如果有）裡挖。輸出三行：**痛點 / 改變 / 證據**。

## 1. 寫標題序列（🧑 人類簽核）

每張截圖是一則廣告，只做一件事。會轉換的順序（DesignerAnts）：

| # | 任務 | 範例 |
|---|---|---|
| 1 | **點出痛點** | 「筆記埋在再也找不到的地方？」 |
| 2 | **說明改變** | 「你記下的一切，自動歸好位。」 |
| 3 | **給出證據** | 「每天有 10,000 位開發者在用。」（只能用真實數字） |
| 4–5 | **兌現功能**：讓 #2 成立的那一兩個功能 | 「搜你想表達的，不是你打的字。」 |
| 6+ | 選用：疑慮（價格、隱私）、平台廣度、社會認同 | |

規則（完整清單與來源：`references/copywriting.md`）：

- 每句標題 ≤ 8 個字詞；≤ 6 更好。副標 ≤ 12 個字詞，可省略。
- 寫結果，不寫功能。「深色模式」→「凌晨兩點也不刺眼」。
- 以動詞或使用者處境開頭，不要以 app 名稱或「全新推出」開頭。
- 不用「#1」「最佳」「立即下載」，不用 emoji，不用驚嘆號。
- **遮住 UI 測試**：只依序讀標題。是一個故事，還是一張規格表？
- 每個語系都是改寫，不是翻譯（`copy.zh-TW.json`、`copy.ja.json`…）。
- 標題在縮圖寬度（手機搜尋結果約 120 px）下要讀得出來。

寫 `copy.<locale>.json`：

```json
[
  { "id": "01", "role": "pain",    "title": "Notes you'll ==never find== again?", "subtitle": "" },
  { "id": "02", "role": "shift",   "title": "Captured, then ==organized== for you", "subtitle": "No folders. No tagging." },
  { "id": "03", "role": "proof",   "title": "==10,000== developers, every day", "badge": "4.8 ★" },
  { "id": "04", "role": "feature", "title": "Search what you ==meant==", "subtitle": "Not what you typed." },
  { "id": "05", "role": "feature", "title": "Works ==offline==", "subtitle": "Syncs when you're back." }
]
```

> 🧑 人類時刻：標題就是產品。把清單拿給人看，拿到同意，再去拍。

進下一步前的檢核表（10 項，`references/copywriting.md` §3）：字數 · 動詞開頭 · 結果優於功能 ·
沒有行銷陳腔濫調 · 120 px 下可讀 · 沒有翻不過去的慣用語 · 通過遮住 UI 測試 · 痛點具體 ·
數字可驗證 · 每個語系都重寫過。

## 2. 為每句標題決定證據畫面

現在才選畫面：每一句，哪個畫面是*證據*？往往不是最漂亮的那個。記下它需要的狀態
（「30 天的資料」「清單裡 3 個項目」）——那就是你的 staging 清單。

## 3. 佈置並拍攝（Release build、sim-use、不盲點）

```sh
npx expo run:ios --configuration Release --device "iPhone 16 Pro Max"   # 絕不用 Expo Go（浮動工具列）
sim-use describe-ui                              # 每個元素一個 @N 別名
sim-use tap @14                                  # 用別名或 --label，絕不用座標
sleep 1                                          # 沒有 `sim-use wait`
sim-use screenshot --output raw/zh-TW/01.png     # 16 Pro Max 上為 1320×2868
```

- 程式碼裡的 staging 調整要標 `// DO NOT COMMIT: screenshot staging`；拍完 `git checkout -- .`。
- 長流程：先 `sim-use record-video --output flow.mp4` 錄一次，再拍靜態圖。
- Release build 失敗？→ `eas-build-doctor` 病歷 5（Xcode 26.3 + expo-modules-jsi 需要 template 附的
  patch）。拍完刪掉 `ios/`（CNG）。
- 每個語系一個 raw 資料夾；在 app 內切換語言後重跑同一支腳本。

**Android（給 Google Play）**——不要把 iPhone 截圖塞進 Pixel 框重複使用。同樣步驟在模擬器上做；
sim-use 兩邊都能驅動：

```sh
npx expo run:android --variant release --device Pixel_8_API_35   # 在模擬器上跑 Release build
sim-use android describe-ui && sim-use android tap @N
sim-use android screenshot --output raw-android/zh-TW/01.png      # Pixel 級 AVD 上為 1080×2340
```

Play 的 deck 用 `--platform android` 渲染（Pixel 框），App Store 的 deck 用 `--platform ios`；
同一份 `copy.<locale>.json`，兩份 `manifest.*.json`。

## 4. 用 store-art 渲染

由 `copy.<locale>.json` + raw 路徑組出 `manifest.<locale>.json`。然後讓人來選——絕不自己默默決定長相：

```sh
node ../store-art/scripts/render.mjs manifest.zh-TW.json --preview styles  --out preview
node ../store-art/scripts/render.mjs manifest.zh-TW.json --preview layouts --out preview
```

> 🧑 人類時刻：拿出 `preview-styles.png`（整套選**一個**風格——要跟該類別慣用的配色形成對比）
> 與 `preview-layouts.png`（每張選一個版面；要有變化、panorama ≤ 1、最強的構圖放第 1 張）。
> 把選擇寫進 manifest。

```sh
node ../store-art/scripts/render.mjs manifest.zh-TW.json --out framed/zh-TW --strict
```

`⚠` 是品質檢查在說話（裝置佔比、標題溢出、文案重疊）——改 manifest，不要忽略。
把 PNG 縮到縮圖大小看一次：每句標題都讀得出來嗎？

## 5. 上傳

```sh
gpc images upload --type phoneScreenshots --locale zh-TW --path ./framed/zh-TW/ --replace --confirm
gpc images upload --type featureGraphic  --locale zh-TW --path ./framed/zh-TW/fg.png
asc screenshots upload …    # vendor/asc-skills 的 asc-shots-pipeline；每語系 fan-out 對應 framed/<locale>
```

## 6. 量測、改寫、重來

商店頁就是廣告；廣告要測。30 天後看 App Analytics / Play Console 的轉換率（曝光 → 安裝）。
沒起色就改標題——不是改設計——再跑一次步驟 1 → 4。Apple 允許最多三組 A/B
（Product Page Optimization）；Play 有 Store Listing Experiments。動 UI 之前先用這些。

## 尺寸

| 商店 | 必交 | 像素 | 備註 |
|---|---|---|---|
| App Store | iPhone 6.9" | 1320×2868 | 16 Pro Max 模擬器；ASC 會縮放給較小 iPhone |
| App Store | iPad 13"（如支援 iPad） | 2064×2752 | |
| Google Play | 手機 2–8 張 | 1320×2868 可收；16:9 或 9:16，320–3840 px | 同一批檔案可用 |
| Google Play | feature graphic | 1024×500 | `style: feature-graphic` |

## 參考

- `references/optimization-theory.md` — 工作模型（漏斗、文字、順序、視覺、合規、測試）與一頁檢核表
- `references/copywriting.md` — 58 條原則、15 組 before→after 改寫、10 項檢核表、來源
- `references/paul-solt-screenshot-mistake.md` — 本流程所依據的那篇文章
- `../store-art/references/quality-bar.md` — 構圖規則
