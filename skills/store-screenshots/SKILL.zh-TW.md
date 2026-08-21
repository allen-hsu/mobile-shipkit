---
name: store-screenshots
description: 端到端產出 App Store 與 Google Play 截圖，文案先行——在拍任何畫面之前先寫好標題序列（痛點 → 改變 → 證據 → 功能），再用 sim-use 拍 iOS 模擬器的 Release build、用 store-art 渲染、跑品質檢查、用 gpc / asc 上傳，30 天後重測文案。當使用者要「商店截圖」「App Store 截圖」「Play 截圖」「feature graphic」、多語系截圖、說商店頁「轉換率不好」，或截圖裡出現 Expo Go 的浮動工具列時使用。內含標題檢核表與從 DesignerAnts / Paul Solt 整理的 58 條文案規則。
---

# store-screenshots

**截圖效果的 70% 來自文字，不是 UI。** 有 app 在畫面完全不動的情況下，只改文案就把轉換率
拉高 80%（Paul Solt 引述 DesignerAnts）。所以本 skill 先寫字，再決定哪個畫面能證明那句話，
然後才拍、才渲染。反過來做——先拍五張好看的畫面、再用功能名稱當標題——正是那篇文章在講的錯誤。

2026-08 在全新 SDK 57 專案驗證：Release build → sim-use → store-art → Play 直接收。
搭配 skill：`store-art`（渲染）、`store-listing`（描述／關鍵字）、`submit-google` / `submit-apple`（上傳）。

## 0. 讀 app，不是讀功能清單

寫之前先搞清楚：這給誰用、用之前他們卡在哪、用一週後什麼改變了、有哪一個數字或事實能證明。
從 `store/`、README、onboarding 文案、評論（如果有）挖。輸出三行：**痛點 / 改變 / 證據**。

## 1. 寫標題序列（🧑 人類簽核）

每張截圖是一則廣告、只做一件事。會轉換的順序（DesignerAnts）：

| # | 任務 | 範例 |
|---|---|---|
| 1 | **點出痛點** | 「筆記埋在哪裡再也找不到？」 |
| 2 | **說明改變** | 「你記下的一切，自動整理好。」 |
| 3 | **給證據** | 「每天有 10,000 名開發者在用。」（只能用真數字） |
| 4–5 | **兌現功能**——讓 #2 成立的那一兩個功能 | 「搜尋你想表達的，不是你打的字。」 |
| 6+ | 選配：處理疑慮（價格、隱私）、平台涵蓋、社會認同 | |

規則（完整清單與來源：`references/copywriting.md`）：

- 標題 ≤ 8 個詞，≤ 6 更好。副標 ≤ 12 個詞，可省。
- 寫結果，不寫功能。「深色模式」→「凌晨兩點也不刺眼」。
- 用動詞或使用者的處境開頭，絕不用 app 名稱或「隆重推出」。
- 不用「#1」「最佳」「立即下載」，不用 emoji，不用驚嘆號。
- **遮住 UI 測試**：只照順序讀標題。是一個故事，還是一張規格表？
- 每個語系都是改寫不是翻譯（`copy.zh-TW.json`、`copy.ja.json`…）。
- 標題在縮圖寬度（手機搜尋結果約 120 px）要讀得到。

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

> 🧑 人類時刻：標題就是產品。把清單拿給人看、拿到 yes，再去拍。

進入下一步前的檢核表（10 條，`references/copywriting.md` §3）：字數 · 動詞開頭 ·
結果優於功能 · 無行銷陳腔濫調 · 120 px 看得清 · 沒有翻不過去的慣用語 · 通過遮住 UI 測試 ·
痛點夠具體 · 數字可驗證 · 每個語系都重寫過。

## 2. 為每句標題找證據畫面

到這裡才選畫面：每一句，哪個畫面是*證據*？通常不是最漂亮的那張。記下它需要的狀態
（「30 天資料」「清單裡 3 個項目」）——那就是你的 staging 清單。

## 3. 佈景與拍攝（Release build、sim-use、不盲打）

```sh
npx expo run:ios --configuration Release --device "iPhone 16 Pro Max"   # 絕不用 Expo Go（浮動工具列）
sim-use describe-ui                              # 每個元素都有 @N 別名
sim-use tap @14                                  # 用別名或 --label，絕不用座標
sleep 1                                          # 沒有 `sim-use wait` 這個子命令
sim-use screenshot --output raw/zh-TW/01.png     # 16 Pro Max 上是 1320×2868
```

- 程式碼裡的佈景調參加註 `// DO NOT COMMIT: screenshot staging`；拍完 `git checkout -- .`。
- 長流程：先 `sim-use record-video --output flow.mp4` 錄一次，再拍靜態。
- Release build 失敗？→ `eas-build-doctor` 病歷 5（Xcode 26.3 + expo-modules-jsi 需要 template
  附的 patch）。之後刪掉 `ios/`（CNG）。
- 一個語系一個 raw 資料夾；app 內切語言後重跑同一支腳本。

## 4. 用 store-art 渲染

從 `copy.<locale>.json` + raw 路徑組出 `manifest.<locale>.json`：一套選**一種風格**、
**版面輪著換**（bleed-bottom → tilt → float → two-up → bleed-top…；最多一個 panorama）。然後：

```sh
node ../store-art/scripts/render.mjs manifest.zh-TW.json --out framed/zh-TW --strict
```

`⚠` 是品質標準在說話（裝置佔比、標題溢出、文案重疊）——改 manifest，別無視。
把 PNG 縮到縮圖大小看一次：每個標題都讀得到嗎？

## 5. 上傳

```sh
gpc images upload --type phoneScreenshots --locale zh-TW --path ./framed/zh-TW/ --replace --confirm
gpc images upload --type featureGraphic  --locale zh-TW --path ./framed/zh-TW/fg.png
asc screenshots upload …    # vendor/asc-skills 的 asc-shots-pipeline；每語系 fan-out 對應 framed/<locale>
```

## 6. 量測、改寫、重來

商店頁是廣告；廣告要測。30 天後看 App Analytics / Play Console 的轉換率（曝光 → 安裝）。
不動的話就改標題——不是改設計——再跑一次步驟 1 → 4。Apple 允許最多三組 A/B
（Product Page Optimization）；Play 有 Store Listing Experiments。動 UI 之前先用它們。

## 尺寸

| 商店 | 必交 | 像素 | 備註 |
|---|---|---|---|
| App Store | iPhone 6.9" | 1320×2868 | 16 Pro Max 模擬器；ASC 會縮給較小的 iPhone |
| App Store | iPad 13"（若有 iPad） | 2064×2752 | |
| Google Play | 手機 2–8 張 | 1320×2868 可收；16:9 或 9:16，320–3840 px | 同一批檔案可用 |
| Google Play | feature graphic | 1024×500 | `style: feature-graphic` |

## 參考

- `references/copywriting.md` — 58 條規則、15 組 before→after 改寫、10 條檢核表、來源
- `references/paul-solt-screenshot-mistake.md` — 這套流程所本的文章
- `../store-art/references/quality-bar.md` — 構圖規則
