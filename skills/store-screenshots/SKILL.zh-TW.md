---
name: store-screenshots
description: 端到端產出 App Store 與 Google Play 截圖，文案先行——在拍任何畫面之前先寫好標題序列（痛點 → 改變 → 證據 → 功能），再用 sim-use 拍 iOS 模擬器的 Release build、用 store-art 渲染、跑品質檢查、用 gpc / asc 上傳，30 天後回頭測文案。當使用者要「商店截圖」「App Store 截圖」「Play 截圖」「feature graphic」、多語系截圖、說自己的商店頁「轉換不好」、或截圖裡出現 Expo Go 的浮動工具列時使用。內含標題檢核表與從 DesignerAnts / Paul Solt 蒸餾出的 58 條文案規則。
---

# store-screenshots

**截圖效果的 70% 來自文字，不是 UI。**有 app 只改文案、畫面不動，轉換率提升 80%
（Paul Solt 引述 DesignerAnts）。所以本 skill 先寫字，再決定哪個畫面能證明那句話，再拍，
再渲染。反過來做——先拍五張好看的畫面、再用功能名當標題——正是那篇文章講的錯誤。

2026-08 在全新 SDK 57 app 驗證：Release build → sim-use → store-art → Play 直接收。
搭配 skill：`store-art`（渲染）、`store-listing`（描述 / 關鍵字）、`submit-google` / `submit-apple`（上傳）。

## 0. 讀 app，不是讀功能清單

動筆前先弄清楚：這是給誰用的、他們之前在掙扎什麼、用一週後什麼改變了、哪一個數字或事實能證明。
從 `store/`、README、onboarding 文案、評論（若有）裡挖。輸出三行：**痛點 / 改變 / 證據**。

## 1. 寫標題序列（🧑 人類簽核）

每張截圖是一則只做一件事的廣告。會轉換的順序（DesignerAnts）：

| # | 任務 | 範例 |
|---|---|---|
| 1 | **點出痛點** | 「筆記埋在深處再也找不到？」 |
| 2 | **說明改變** | 「你記下的一切，自動歸位。」 |
| 3 | **給出證據** | 「每天 10,000 名開發者在用。」（只能用真數字） |
| 4–5 | **兌現功能**，讓 #2 成立 | 「用你的意思搜尋，不是你打的字。」 |
| 6+ | 選配：反對意見（價格、隱私）、平台廣度、社會認同 | |

規則（含來源的完整清單：`references/copywriting.md`）：

- 每條標題 ≤ 8 個詞；≤ 6 更好。副標 ≤ 12 個詞，可省。
- 結果，不是功能。「深色模式」→「凌晨兩點也不刺眼」。
- 以動詞或使用者處境開頭，永遠不要用 app 名或「隆重推出」開頭。
- 不用「#1」「最佳」「立即下載」、不用 emoji、不用驚嘆號。
- **遮住 UI 測試**：只按順序讀標題。是一個故事，還是規格表？
- 每個語系都是改寫，不是翻譯（`copy.zh-TW.json`、`copy.ja.json`…）。
- 標題在縮圖寬度（手機搜尋結果約 120 px）也要讀得出來。

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

> 🧑 人類時刻：標題就是產品。把清單拿給人看，拿到 yes 才開拍。

往下走之前的檢核（10 條，`references/copywriting.md` §3）：字數 · 動詞開頭 · 結果優於功能 ·
無行銷陳腔 · 120 px 可讀 · 沒有難以在地化的慣用語 · 通過遮住 UI 測試 · 痛點具體 ·
數字可驗證 · 每個語系都改寫過。

## 2. 為每條標題決定「證據畫面」

到這一步才選畫面：每一句話，哪個畫面是*證據*？通常不是最漂亮的那個。記下它需要的狀態
（「30 天的資料」「清單裡 3 個項目」）——那就是你的 staging 清單。

## 3. 佈景與拍攝（Release build、sim-use、不盲點）

```sh
npx expo run:ios --configuration Release --device "iPhone 16 Pro Max"   # 永遠不用 Expo Go（浮動工具列）
sim-use describe-ui                              # 每個元素給 @N 別名
sim-use tap @14                                  # 用別名或 --label，永遠不用座標
sleep 1                                          # 沒有 `sim-use wait`
sim-use screenshot --output raw/zh-TW/01.png     # 16 Pro Max 上是 1320×2868
```

- 程式裡的佈景調整標 `// DO NOT COMMIT: screenshot staging`；拍完 `git checkout -- .`。
- 長流程：先 `sim-use record-video --output flow.mp4` 錄一次，再拍靜態圖。
- Release build 失敗？→ `eas-build-doctor` 病歷 5（Xcode 26.3 + expo-modules-jsi 需要 template
  附的 patch）。之後刪掉 `ios/`（CNG）。
- 一個語系一個 raw 目錄；在 app 內切語言，重跑同一支腳本。

## 4. 用 store-art 渲染

由 `copy.<locale>.json` + raw 路徑組出 `manifest.<locale>.json`。然後讓人選——
不要默默替人決定外觀：

```sh
node ../store-art/scripts/render.mjs manifest.zh-TW.json --preview styles  --out preview
node ../store-art/scripts/render.mjs manifest.zh-TW.json --preview layouts --out preview
```

> 🧑 人類時刻：給人看 `preview-styles.png`（整套挑**一個**風格——要跟同類 app 慣用的配色
> 形成對比）與 `preview-layouts.png`（每張挑一個版面；要有變化、≤ 1 個 panorama、
> 第 1 張用最強的構圖）。把選擇寫進 manifest。

```sh
node ../store-art/scripts/render.mjs manifest.zh-TW.json --out framed/zh-TW --strict
```

`⚠` 是品質檢查在說話（裝置佔比、標題溢出、文案重疊）——改 manifest，別忽略。
打開 PNG 用縮圖大小看一次：每條標題都讀得出來嗎？

## 5. 上傳

```sh
gpc images upload --type phoneScreenshots --locale zh-TW --path ./framed/zh-TW/ --replace --confirm
gpc images upload --type featureGraphic  --locale zh-TW --path ./framed/zh-TW/fg.png
asc screenshots upload …    # vendor/asc-skills 的 asc-shots-pipeline；每語系的 fan-out 對應 framed/<locale>
```

## 6. 量測、改寫、重來

商店頁就是廣告；廣告要測。30 天後看 App Analytics / Play Console 的轉換率
（曝光 → 安裝）。沒起色就改標題——不是改設計——再跑一次步驟 1 → 4。Apple 最多可 A/B 三個
版本（Product Page Optimization）；Play 有 Store Listing Experiments。動 UI 之前先用這些。

## 尺寸

| 商店 | 必交 | 像素 | 備註 |
|---|---|---|---|
| App Store | iPhone 6.9" | 1320×2868 | 16 Pro Max 模擬器；ASC 會縮放給較小 iPhone |
| App Store | iPad 13"（若支援 iPad） | 2064×2752 | |
| Google Play | 手機 2–8 張 | 1320×2868 可收；16:9 或 9:16，320–3840 px | 同一批檔案可用 |
| Google Play | feature graphic | 1024×500 | `style: feature-graphic` |

## 參考

- `references/optimization-theory.md` — 工作模型（漏斗、文字、順序、視覺、合規、測試）與一頁檢核表
- `references/copywriting.md` — 58 條規則、15 組 before→after 改寫、10 條檢核表、來源
- `references/paul-solt-screenshot-mistake.md` — 本流程所依據的那篇文章
- `../store-art/references/quality-bar.md` — 構圖規則
