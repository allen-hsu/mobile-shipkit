---
name: monetize-admob
description: 規劃中、待實戰驗證。為 Expo app 接入 Google AdMob 廣告的流程骨架，重點是接廣告後兩商店的隱私申報翻案清單：Play Data safety 改申報裝置識別碼、ASC 隱私問卷同步、ASC 年齡分級 advertising 改 true、ATT 與 UMP 同意流程、app-ads.txt。當使用者要「加廣告」「AdMob」「橫幅 / 插頁廣告」時使用，但須告知使用者本 skill 尚未經實際上架驗證。
---

# monetize-admob（規劃中，待實戰驗證）

> ⚠️ 本 skill 還沒在真實 app 上跑通過。骨架與已知硬規則如下，細節以官方文件與實際錯誤為準。

## 第一件事：這會斷 OTA

`react-native-google-mobile-ads` 是原生模組，加了就要重出安裝檔（見 eas-ota-discipline 第 3 節）。

## 流程骨架

1. AdMob 後台建 app（iOS / Android 各一）與廣告單元；拿 App ID。
   > 🧑 人類時刻：AdMob 帳號、付款資料、app 審核是人類的。
2. `npx expo install react-native-google-mobile-ads`，app.json plugin 填兩個 App ID 與
   `userTrackingUsageDescription`（ATT 文案）。
3. **同意流程**：iOS ATT（`requestTrackingPermissionsAsync`）+ Google UMP（GDPR / 美國州法），
   兩者都在第一次顯示廣告前完成。
4. **app-ads.txt** 放在商店資料填的官網 root（GitHub Pages 可），內容從 AdMob 後台複製。
5. 先用測試廣告單元 ID 開發，上架前換正式 ID——**用 `__DEV__` 切，不要手動換**。

## 隱私申報翻案清單（最容易漏）

接廣告前的「完全不收集」申報全部作廢，兩商店都要重填：

| 商店 | 要改什麼 | 怎麼改 |
|---|---|---|
| Play Data safety | 改申報**裝置或其他識別碼**（廣告 ID）、可能含大致位置；用途「廣告或行銷」；是否與第三方分享 = 是 | `gpc datasafety push` 新 CSV（先在 Console 填一次再匯出當模板，見 submit-google） |
| Play 廣告宣告 | 應用程式內容 → 廣告 → 含廣告 | 🧑 Console |
| ASC 隱私問卷（App Privacy） | 新增 Identifiers（Device ID）、Usage Data、可能的 Coarse Location；用途 Third-Party Advertising；linked / tracking 依 ATT 設定 | 🧑 ASC UI（API 無寫入） |
| ASC 年齡分級 | `--advertising` 改 true（「無限制的網路存取」「廣告」項目） | `asc age-rating` 類指令，以 `--help` 為準 |
| ASC ATT | Info.plist `NSUserTrackingUsageDescription`，審核會檢查有沒有真的彈 | app.json plugin |

> 🧑 人類時刻：隱私申報是法律宣告，每一項答案由人類確認後 agent 再填。

## 待驗證清單

- [ ] Expo SDK 54 的 config plugin 是否需要額外 `expo-build-properties`
- [ ] `eas build --local` Android 是否要再調 gradle 記憶體（eas-build-doctor 病歷 6）
- [ ] ASC 年齡分級 advertising 的確切 asc 指令名
- [ ] UMP 在台灣 / 日本地區的實際顯示行為
