---
name: store-screenshots
description: 用 iOS 模擬器產出 App Store 與 Google Play 的商店截圖。當使用者要「拍商店截圖」「產 App Store 截圖」「feature graphic」、要多語系截圖、或截圖裡出現 Expo Go 的浮動工具鈕時使用。流程：跑 release 組態的獨立 app（不是 Expo Go）、以 sim-use 的 describe-ui 定位元素而非盲打座標、臨時佈景參數標記 DO NOT COMMIT 拍完還原、按 locale 分目錄輸出以對齊 asc screenshots upload，最後加框。含 iOS 6.9" 與 Play 尺寸表。
---

# store-screenshots

商店截圖不是「隨便 cmd+S」。2026-08 真實專案的經驗：第一輪全部重拍，因為用了 Expo Go。

## 1. 跑 release 獨立版，不是 Expo Go

Expo Go / dev client 的**浮動工具鈕殺不掉**，會出現在每張圖上。

```sh
npx expo run:ios --configuration Release --device "iPhone 16 Pro Max"
```

- 第一次要 prebuild，幾分鐘。prebuild 產出的 `ios/` 拍完要刪（CNG 專案不進 repo，見 eas-build-doctor 病歷 3）。
- 如果 release build 失敗，先去 eas-build-doctor（病歷 5 的 Swift 錯在這裡也會出現）。

## 2. 操作全走 sim-use，用 describe-ui 定位

用 `sim-use`（或等價的 simulator 驅動工具）操作 app。**鐵律：先 describe-ui 拿 accessibility 元素，
用 alias / label 點擊，禁止盲打座標。**

真實事故：盲打座標誤觸主要動作按鈕，走完整段流程，佈景被改掉，整組重拍。

典型一張圖的腳本：

```sh
sim-use describe-ui                      # 看畫面上有什麼、拿到 label
sim-use tap --label "首頁"               # 用 label，不用 (x,y)
sleep 1                                  # 沒有 `sim-use wait` 這個子命令
sim-use screenshot --output shots/zh-TW/01-home.png
```

多步驟流程（例如「完成一次操作後狀態改變」）**先用 `sim-use record-video` 錄一次看流程對不對**，
再拍靜態圖——省 token，也省重拍。

## 3. 佈景：臨時調參要標記、要還原

商店圖要「有內容的畫面」「三十天的資料」，但新安裝是空的。做法：

1. 在程式碼加臨時參數（預填資料、跳過 onboarding、加速狀態），**每處加註解 `// DO NOT COMMIT: screenshot staging`**。
2. 拍完 `git checkout -- .` 還原；`git diff` 確認乾淨。
3. 絕不把 staging 參數 commit 進去——它會跟著下一個 OTA 出去。

## 4. 尺寸

| 商店 | 規格 | 像素 | 備註 |
|---|---|---|---|
| App Store iPhone 6.9" | iPhone 16 Pro Max | **1320×2868** | 必填；模擬器原生截圖就是這個尺寸 |
| App Store iPad 13" | 若 `supportsTablet: true` 才需要 | 2064×2752 | 範例專案關掉 tablet，免拍 |
| Play 手機截圖 | 同源 iOS 圖 | 任意 16:9～9:16，最長邊 ≤3840 | 直接用 1320×2868 |
| Play feature graphic | 另構，不能用截圖 | **1024×500** | 必填，沒有它商店頁不完整 |
| Play icon | | 512×512 | |

其他 iPhone 尺寸 ASC 會從 6.9" 縮放；`asc screenshots resize`（見 asc-screenshot-resize）能補。

## 5. 多語系

app 內切語言（設定頁或改模擬器語言 `xcrun simctl spawn booted defaults write .GlobalPreferences AppleLanguages -array ja`），
**重跑同一支腳本**，輸出按 locale 分目錄：

```
shots/
  zh-Hant/ 01-home.png 02-action.png ...
  en-US/
  ja/
```

目錄名用 ASC locale（`zh-Hant`、`ja`），直接對齊 `asc screenshots upload` 的 fan-out；
上 Play 時目錄對應到 `zh-TW` / `ja-JP`（gpc images upload 的 `--locale`）。

## 6. 加框與文案

- 自動：`asc screenshots frame`（Koubou 引擎，見 asc-shots-pipeline）。
- 手工打磨：`ParthJadhav/app-store-screenshots` 之類的模板專案，適合要大標題文案的圖。
- 每張圖一句話標題，≤ 8 個中文字 / 5 個英文字，三語各自改寫（見 store-listing）。

## 7. 上傳

```sh
asc screenshots upload --app <APP_ID> --version <VERSION_ID> --dir ./shots     # ASC
gpc images upload --type phoneScreenshots --locale zh-TW --path ./shots/zh-Hant/  # Play，逐 locale
```

## Checklist

1. release 獨立版，畫面無 dev 工具鈕
2. 每個操作都經 describe-ui 定位
3. staging 參數已還原，`git diff` 乾淨，`ios/` 已刪
4. 1320×2868；Play 另有 1024×500 feature graphic
5. 按 locale 分目錄
6. 拍完的圖人類過目一次再上傳

> 🧑 人類時刻：截圖選哪幾張、順序、標題文案，是產品決定；agent 拍完交清單，不要自行上傳。

## 接著：store-art

原始截圖交給 `store-art`（`scripts/render.py`）加文案、裝置框、Play feature graphic，再
`gpc images upload` / `asc screenshots upload`。2026-08 在全新 SDK 57 專案驗過：iPhone 16 Pro Max
Release build → 兩張截圖 → caption-top → Play 直接收。
