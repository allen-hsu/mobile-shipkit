---
name: monetize-revenuecat
description: 規劃中、待實戰驗證。為 Expo app 接入 RevenueCat 訂閱 / IAP 的流程骨架：App Store Connect 與 Play 商品建立、RevenueCat offerings 對帳、Restore 按鈕、sandbox 測試。當使用者要「加訂閱」「接 IAP」「RevenueCat」時使用，但須告知使用者本 skill 尚未經實際上架驗證。
---

# monetize-revenuecat（規劃中，待實戰驗證）

> ⚠️ 本 skill 還沒在真實 app 上跑通過。以下是骨架與已知的硬規則，細節以官方文件與實際錯誤為準。
> 跑通後請把病歷補進來。

## 第一件事：這會斷 OTA

`react-native-purchases` 是原生模組。加進去 = runtimeVersion 指紋改變 = **必須重出安裝檔並送審**，
現有安裝收不到之後的 OTA（見 eas-ota-discipline 第 3 節）。排程時把這件事放最前面。

## 流程骨架

1. **商店商品**
   - ASC：`asc iap` / `asc subscriptions` 建商品與訂閱群組，三語 display name 用 `asc-subscription-localization`。
   - Play：Console → 營利 → 產品 建商品；建好後用 `gpc iap list` / `gpc subscriptions list` 讀回
     productId、purchaseOptionId / basePlanId、state，這就是 RC 要對的字串（RC 的 Play product 是
     `productId:basePlanId`）。注意 legacy `inappproducts` 端點對新 app 回 403
     「Please migrate to the new publishing API」，gpc 走的是 `monetization.onetimeproducts`。
   - 定價先 `gpc pricing convert 4.99 --currency USD` 看各區換算（純計算），再決定要不要 PPP 手調。
   > 🧑 人類時刻：定價與商品 ID 命名是商業決策；Play 訂閱的基礎方案 / 優惠要在 Console 建。
2. **RevenueCat 後台**：建 project、接兩個商店的憑證（ASC in-app purchase key、Play 服務帳號）、建 entitlements → products → offerings。
3. **對帳**：`asc-revenuecat-catalog-sync` 比對 ASC 商品與 RC products / offerings，確保 product ID 一字不差。
4. **app 端**：`npx expo install react-native-purchases`，config plugin 進 app.json；
   `Purchases.configure` 於啟動、`getOfferings` 顯示 paywall、`purchasePackage`、`restorePurchases`。
5. **Restore 按鈕**：Apple 必退件項——paywall 上**必須有**可見的「恢復購買」。
6. **測試**：ASC sandbox 測試員（`asc-testflight-orchestration` 附近）；Play 授權測試帳號（Console → 設定 → 授權測試）。
7. **送審補充**：ASC 的 IAP 要隨版本一起送（review items 加 IAP）；Apple 會要 paywall 截圖。

## 待驗證清單

- [ ] Expo SDK 54 + react-native-purchases 最新版的 config plugin 是否零手改
- [ ] `eas build --local` 能否編過（iOS StoreKit 2 entitlement）
- [ ] RC 的 Play 服務帳號與 gpc 共用一個是否權限夠
- [ ] 首次送審 IAP 被退的實際理由
