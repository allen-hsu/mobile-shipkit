---
name: submit-apple
description: App Store 上架的補充踩點，疊在 asc CLI 隨附的 skills 之上。當使用者要「上 App Store」「送 Apple 審核」「建 ASC app」、asc 回報 web session 過期或需要 2FA、版本字串與 binary 不合、描述含 emoji 被拒、定價排程日期被拒、受管制醫療器材宣告缺漏、或 review submission items-add 報錯時使用。主體流程請先讀 vendor/asc-skills/skills/ 的 asc-release-flow、asc-submission-health、asc-metadata-sync；本 skill 只列 2026-08 便便植物園實戰中 asc skills 沒寫的坑。
---

# submit-apple（薄殼）

**主體不在這裡。**Apple 端全部命令面由 asc CLI 及其隨附 skills 提供（`vendor/asc-skills/` submodule，釘在 `asc install-skills` 同一 commit）：

| 要做什麼 | 先讀 |
|---|---|
| 建版本、上傳、送審的整條流程 | `asc-release-flow` |
| 送審卡住、狀態不對、retry | `asc-submission-health` |
| 文案 / 截圖 / 關鍵字同步 | `asc-metadata-sync`、`asc-screenshot-resize`、`asc-localize-metadata` |
| 找 ID | `asc-id-resolver` |
| 簽章、TestFlight、build 管理 | `asc-signing-setup`、`asc-testflight-orchestration`、`asc-build-lifecycle` |

下面只有**那些 skills 沒講、我們真的撞到**的事。順序照上架流程。

## 1. 建 app 需要 web session（2FA）

ASC 公開 API 不能建 app；`asc web apps create` 走 Apple 網頁 session。

```sh
asc web apps create --name "便便植物園" --bundle-id com.unless.gutgame --sku gutgame --apple-id you@example.com
```

> 🧑 人類時刻：會要 Apple ID 密碼與 2FA 驗證碼。**session 會過期**（數小時到一天），
> 之後所有 `asc web ...` 指令都可能再要一次。agent 遇到 session 錯誤就停下來請人類重新登入，
> 不要重試迴圈。

## 2. 版本字串要對齊 binary 的 marketing version

`asc web apps create` 預設建 `1.0`；Expo build 的 `CFBundleShortVersionString` 是 `app.json` 的
`version`（例如 `1.0.0`）。不對齊 → build 掛不上去。

```sh
asc versions list --app <APP_ID>
asc versions update --id <VERSION_ID> --version-string 1.0.0
```

或建 app 時直接 `--version 1.0.0`。

## 3. 描述欄禁 emoji

整批 metadata push 被 ASC 拒絕，原因是描述裡的 🌱 💩 📅 🔒。**Play 允許、ASC 不允許**，
所以兩商店文案分流（見 store-listing）：ASC 版去 emoji，Play 版保留。
錯誤訊息不一定點名 emoji，看到 description 被拒先 grep 非 BMP 字元：

```sh
grep -P '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' metadata/version/*/*.json
```

## 4. 定價排程的時區坑

`asc pricing schedule create --start-date YYYY-MM-DD` 用「今天」可能被拒（Cupertino 時間還沒到今天）。
**用昨天的日期**繞過：

```sh
asc pricing schedule create --app <APP_ID> --free --base-territory TWN --start-date $(date -v-1d +%F)
```

## 5. 新必填：受管制醫療器材宣告

ASC 在 App Information → App Store Regulations & Permits 多了這項，沒填送審會被擋。
asc 目前只自動化「否」的路徑：

```sh
asc web apps medical-device set --app <APP_ID> --declared false
```

（走 web session，見第 1 節。）健康類 app 也是選「否」，除非真的是醫療器材。

## 6. review details 的 demoAccountRequired 會意外為 true

沒有登入功能的 app 也可能看到 `demoAccountRequired: true`，送審時會要求帳密。

```sh
asc review details-for-version --version-id <VERSION_ID>
asc review details-update --id <DETAIL_ID> --demo-account-required=false --contact-email ... --contact-phone ...
```

## 7. 送審順序

```sh
asc apps content-rights edit --app <APP_ID> --uses-third-party-content=false   # 1 內容權利
asc web apps medical-device set --app <APP_ID> --declared false                # 2 醫療器材
asc review submissions-create --app <APP_ID> --platform IOS                    # 3 開 submission
asc review items add --submission <SUB_ID> --item-type appStoreVersions --item-id <VERSION_ID>  # 4
asc review submissions-submit --id <SUB_ID> --confirm                          # 5
```

- **第 4 步的報錯會直接說缺什麼**（截圖尺寸、年齡分級、隱私問卷、build 未選…），是最好的 checklist。
  `asc review doctor --app <APP_ID>` 同功，可先跑。
- 第 5 步 `--confirm` 是不可逆動作。

> 🧑 人類時刻：按下第 5 步前，人類要確認版本、build、定價、隱私問卷。
> 送出後撤回要走 `asc-submission-health` 的 cancel 流程，會影響審核排隊。

## 8. 隱私問卷與年齡分級

純 API 可做，但內容是法律宣告：

> 🧑 人類時刻：隱私問卷（收集哪些資料）與年齡分級問卷的**答案由人類決定**，agent 只負責填。
> 之後接廣告 SDK 要翻案（見 monetize-admob）。

## 找不到命令時

`asc <group> --help` 逐層往下；`asc search <keyword>` 全域找。asc 更新很快，
以 `--help` 為準，不以本檔為準。
