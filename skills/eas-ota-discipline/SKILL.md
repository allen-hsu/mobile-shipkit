---
name: eas-ota-discipline
description: 規範 Expo EAS Update（OTA）的發佈與驗證紀律。當 agent 要執行 `eas update`、使用者回報「更新發出去了但沒人收到」、要判斷某個改動能不能走 OTA 還是必須重出安裝檔、或要設定 eas.json 的 channel↔branch↔profile 對映時使用。核心是 runtimeVersion 指紋鐵律：更新只會到達指紋相同的安裝，發完必須比對 `eas update:list` 與 `eas build:list`。附標準三件組 eas.json 範例與「哪些動作會斷指紋」清單。
---

# eas-ota-discipline

OTA 看起來很簡單：`eas update` 一下就好。真實案例（2026-08 便便植物園）：測試者停在舊版一週，
所有人都以為更新出去了。原因不是指令錯，是**指紋不合，更新根本到不了**。這份 skill 就是防這件事。

## 1. 發佈前

- 工作樹**乾淨、已 commit**。EAS 會把 commit hash 記在 update 上，髒樹等於無法追溯。
- 非互動環境（agent、CI）必帶 `--environment`，否則會卡在互動選單：
  ```sh
  eas update --branch production --environment production --message "fix: <一句話>"
  ```
- 先確認改動**沒有斷指紋**（見第 3 節）。斷了就不是 OTA，是重 build。

## 2. 指紋鐵律（發完必查）

> **更新只會送達 runtimeVersion 完全相同的安裝。**

發完立刻比對：

```sh
eas update:list --branch production --limit 3     # 看剛發的 update 的 runtimeVersion
eas build:list --platform all --limit 5            # 看目前使用者裝的 build 的 runtimeVersion
```

兩邊的 `runtimeVersion` 必須一字不差。不一致 = **沒有人收得到**，而且 `eas update` 不會報錯。

`runtimeVersion.policy = "fingerprint"` 時，這個值是原生層的 hash；本機算法：

```sh
npx expo-updates fingerprint:generate     # 或 npx @expo/fingerprint . --debug 看組成
```

若本機算出的值與最新 build 不同，代表你現在的原生層已經變了，OTA 發出去也是打空氣。

## 3. 哪些動作會斷指紋（= 必須重出安裝檔）

| 動作 | 為什麼 |
|---|---|
| 改 app.json 原生設定：icon、name、splash、`locales`、infoPlist、permissions | 進 prebuild 產物 |
| **加任何原生套件**（react-native-purchases、react-native-google-mobile-ads、expo-* 有原生碼的） | 新原生模組 |
| 升 Expo SDK / React Native | 原生層全換 |
| node_modules 手改但**沒進 patch-package** | 本機指紋 ≠ builder 指紋（見 eas-build-doctor 病歷 3） |
| 本地殘留 `ios/`、`android/` 目錄 | bareNativeDir 進指紋 |

純 JS / TS、資產圖片（非 icon/splash）、文案、i18n 字串 → 可以 OTA。

拿不準就算一次指紋，和上一個 build 比。

## 4. 投遞行為

- 使用者端**冷啟兩次**才生效：第一次啟動下載，第二次啟動套用。測試時不要只重開一次就說沒收到。
- icon / 名稱 / splash **永遠不走 OTA**，就算指紋沒變也不會更新——它們是安裝包的一部分。
- 驗證到底收到沒有：app 內用 `Updates.updateId` / `Updates.runtimeVersion` 顯示在關於頁，
  比問使用者「有沒有更新」可靠得多。

## 5. channel ↔ branch ↔ profile 對映（寫死在 eas.json）

三件組：一個 build profile 綁一個 channel，channel 預設對到同名 branch。不要讓名字分叉。

```json
{
  "cli": { "version": ">= 21.5.0", "appVersionSource": "remote" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "channel": "preview"
    },
    "production": {
      "distribution": "store",
      "autoIncrement": true,
      "android": { "buildType": "app-bundle" },
      "channel": "production"
    }
  }
}
```

對應的 `app.json`：

```json
{
  "expo": {
    "runtimeVersion": { "policy": "fingerprint" },
    "updates": { "url": "https://u.expo.dev/<projectId>" }
  }
}
```

發佈時 `--branch` 用同名：

| 目的 | build | update |
|---|---|---|
| 內部測試 | `eas build --profile preview` | `eas update --branch preview --environment preview` |
| 正式 | `eas build --profile production` | `eas update --branch production --environment production` |

查目前 channel 對到哪個 branch：`eas channel:view production`。

## 6. 發佈 checklist（agent 逐項回報）

1. `git status` 乾淨、已 commit
2. 改動不在第 3 節清單內（或已確認要重 build）
3. `eas update --branch <b> --environment <e> --message "..."`
4. `eas update:list` vs `eas build:list` 的 runtimeVersion 一致
5. 告知使用者：冷啟兩次；icon/名稱/splash 不會變

> 🧑 人類時刻：若第 4 步不一致，決定「重出安裝檔並送審」是人類的事——會牽動商店審核時程。
