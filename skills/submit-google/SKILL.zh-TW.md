---
name: submit-google
description: 帶領 Expo / React Native app 走完 Google Play 上架全流程：Console 建 app、用 gpc CLI 推商店文案、圖片、Data safety、聯絡資料，上傳 AAB、設定 track、再回 Console 完成只能手點的表單並送審。當使用者說「上 Google Play」「送 Play 審核」「Play Console 怎麼填」、要上傳 .aab、要設 internal/production track、或遇到 "Only releases with status draft may be created on draft app"、"A change was made to the application outside of this Edit"、"Invalid header row" 等 Android Publisher API 錯誤時使用。明列 API 做不到、必須人類在 Console 操作的項目。
---

# submit-google

Google Play 上架 = **API 能做的全用 gpc 做，做不到的明列給人類**。
gpc 是獨立的 Go CLI（[allen-hsu/gpc](https://github.com/allen-hsu/gpc)，`go install github.com/allen-hsu/gpc@latest`；
本 repo 以 submodule 掛在 `cli/gpc`，設計文件 `docs/gpc-cli.md`），薄封裝 Android Publisher API v3。

## 流程總覽

```
① Console 建 app（人類）
② gpc auth status
③ gpc listing push / images upload / details set / datasafety push
④ 產 AAB（eas build --profile production，失敗看 eas-build-doctor）
⑤ gpc bundle upload app.aab
⑥ gpc track set --track internal --status draft --version-codes N
⑦ Console-only 表單（人類）
⑧ 發布總覽 → 送審（人類按鈕）
```

## ① 建 app

> 🧑 人類時刻：**Android Publisher API 不能建 app**（`applications` 資源只有 `dataSafety` 方法）。
> 在 Play Console → 所有應用程式 → 建立應用程式。名稱、預設語言、是否免費在這裡選。
> **套件名由第一個上傳的 AAB 綁定**，不是在表單填的；確認 `app.json` 的 `android.package` 是你要的。

同時請人類準備服務帳號：Google Cloud 建服務帳號 → Play Console → 使用者和權限 → 邀請該帳號
email，給「管理正式版」「管理商店資訊」權限。下載 JSON 放到 `~/.config/gpc/service-account.json`
（或 `GPC_SERVICE_ACCOUNT` env / `--service-account` flag）。

## ② 驗證憑證

```sh
gpc auth status --package com.example.app
```

它會開一個 edit 再刪掉。常見失敗：
- 403 → 服務帳號沒被邀進 Play Console，或權限不足，或**邀請後要等幾分鐘～幾小時生效**。
- 404 `applicationNotFound` → app 還沒建，或套件名打錯，或還沒上傳過任何 AAB（部分 API 要等第一個 AAB）。

## ③ 商店資料（可在 AAB 之前做）

### 文案

每 locale 一個 json（`title` ≤30、`shortDescription` ≤80、`fullDescription` ≤4000）：

```
play-metadata/
  zh-TW.json   { "title": "...", "shortDescription": "...", "fullDescription": "..." }
  en-US.json
  ja-JP.json
```

```sh
gpc listing push --package com.example.app --dir ./play-metadata
gpc listing pull --package com.example.app --dir ./play-metadata   # 反向，確認結果
```

Play 的 locale 代碼是 `zh-TW` / `ja-JP`，**不是** ASC 的 `zh-Hant` / `ja`。文案規格見 store-listing。
Play 描述**允許 emoji**（ASC 不允許），所以 Play 版文案可以獨立於 ASC 版。

### 圖片

```sh
gpc images upload --package com.example.app --type icon            --locale zh-TW,en-US,ja-JP --path ./shots/icon.png
gpc images upload --package com.example.app --type featureGraphic  --locale zh-TW,en-US,ja-JP --path ./shots/feature.png
gpc images upload --package com.example.app --type phoneScreenshots --locale zh-TW --path ./shots/zh-TW/
```

- icon 512×512、featureGraphic 1024×500（**必填**，沒有它商店資訊不完整）、手機截圖 2～8 張。
- 截圖產線見 store-screenshots。

### 聯絡資料

```sh
gpc details set --package com.example.app --email support@example.com --website https://example.com --phone "+886..."
```

### Data safety

```sh
gpc datasafety push --package com.example.app labels.csv
```

CSV 表頭有固定格式，錯了 API 回 `Invalid header row`。**完全不收集資料**的合法最小提交就是兩行：

```csv
Question ID (machine readable),Response ID (machine readable),Response value,Answer requirement,Human-friendly question label
PSL_DATA_COLLECTION_COLLECTS_PERSONAL_DATA,,false,REQUIRED,Does your app collect or share any of the required user data types?
```

（2026-08 已驗證回 200。）有收集資料的完整問卷：在 Console → 應用程式內容 → 資料安全 → 匯出 CSV，
拿那份當模板改，不要手寫。加了廣告 SDK 之後要翻案（見 monetize-admob）。

## ④⑤ AAB 與上傳

```sh
eas build --platform android --profile production        # 或 --local，見 eas-build-doctor
gpc bundle upload --package com.example.app ./app.aab    # resumable，4MB chunk，自動重試
```

上傳成功會回 `versionCode`，下一步要用。重複上傳同 versionCode 會被拒（`Version code N has already been used.`）——
`autoIncrement` 要開。

**不確定簽章或 versionCode 對不對時先 `--dry-run`**：真的上傳、真的讓 Play 解析，然後把 edit 丟掉，
不碰線上任何東西。`listing push` 與 `images upload` 也有同樣的 `--dry-run`，驗 payload 用。

測試者要先拿到 build、不想走 track：`gpc sharing upload ./app.aab` 回一個 internal app sharing 連結
（Console → 設定 → 內部應用程式分享 要先允許該 email），不開 edit、不進任何 track、連 debug build 都收。

R8 mapping 記得一起上，否則之後 crash 看不懂：
`gpc mapping upload android/app/build/outputs/mapping/release/mapping.txt --version-code N`。

## ⑥ Track

```sh
gpc track set --package com.example.app --track internal --status draft --version-codes 12 --notes-dir ./notes
```

`notes/` 每 locale 一個 txt（`zh-TW.txt`…）當 release notes。

**硬規則**：
- **草稿 app（還沒發過任何版本）只接受 `--status draft`**。給 `completed` 會收到
  `Only releases with status draft may be created on draft app.` 不是你的錯，改 draft 即可，
  正式「發布」動作留給 Console。
- 先上 `internal` 測一輪再 `gpc track promote --from internal --to production --confirm`。
  任何非 draft 的 status（completed/inProgress/halted）與 `images upload --replace` 都要帶 `--confirm`，
  這是會直接影響測試者／使用者或刪資料的操作。

### edit 衝突

`A change was made to the application outside of this Edit` → 有人（通常是你自己）在 Console
開著未存的表單。gpc 會重開 edit 重試一次；仍失敗就：

> 🧑 人類時刻：關掉 Play Console 所有開著的該 app 分頁（或存檔/捨棄變更），再重跑。

## ⑦ Console-only 清單

以下 API 完全沒有對應端點，**gpc 做不到**，每一項都要人類在 Console 點：

> 🧑 人類時刻（逐項確認，缺一項送審鈕是灰的）：
> 1. **建立應用程式**（本檔 ①）
> 2. **內容分級**：IARC 問卷（應用程式內容 → 內容分級）
> 3. **目標對象與內容**：年齡層、是否吸引兒童
> 4. **健康功能宣告**（健康類 app 必填）：選「其他」+ 150 字內描述，**不勾醫療類**，否則進醫療審查。
>    模板：「本應用程式讓使用者自行記錄日常生活習慣並以遊戲化方式回顧，不提供診斷、治療或醫療建議。」
> 5. **應用程式類別**與標籤（商店設定 → 應用程式類別）
> 6. **國家 / 地區**選擇（正式版 → 國家 / 地區）
> 7. 廣告、新聞 app、政府 app、金融功能等宣告（依 app 而定）
> 8. **發布總覽 → 傳送變更以供審查**（⑧，最後的按鈕）

agent 能做的是：在每一項前把要填的內容準備好（文字、選項）貼給人類，**然後用 API 驗證人類有沒有做**：

```sh
gpc countries get --package com.example.app            # 第 6 項：回 NONE 就是還沒選
gpc track get    --package com.example.app             # 版本有沒有掛在對的 track
gpc testers get  --package com.example.app --track internal
```

## ⑧ 送審後

- 首次審核通常 1～7 天。狀態在 Console 發布總覽；API 沒有審核狀態端點。
- 被退件的理由會寄 email 並顯示在 Console「政策狀態」；修完重複 ⑤⑥⑧。
- 上線後的日常（都唯讀、可放 cron）：
  - `gpc reviews list`：只回最近 7 天、有留言的評論；回覆用 `gpc reviews reply <id> --text … --confirm`（公開，≤350 字）。
  - `gpc vitals issues --days 7`：crash / ANR 叢集。要先在服務帳號所屬的 GCP 專案開
    **Play Developer Reporting API**（錯誤訊息會直接給連結）——這是一次性的人類動作。
    沒上 mapping 的 build，堆疊是混淆過的。

## 出錯時怎麼讀

Google 的 400 錯誤訊息原文通常寫得很清楚（欄位名、長度上限、哪個 locale），gpc 原樣透傳。
**先讀原文，再改格式，再重跑**——不要先猜。`gpc <cmd> --help` 會標注該操作對應 Console 哪個頁面，
對不上時去那一頁看目前值。
