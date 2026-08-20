# mobile-shipkit

從 `create-expo-app` 到雙商店上架的完整武器庫:skills（給 AI agent 的工作知識）、
`gpc`（Google Play CLI）、專案模板。**只補官方沒有的缺口,不重寫任何已存在的東西。**

誕生於「便便植物園」的實戰上架:一天內從零商店資料到 Apple + Google 雙送審,
途中修掉十餘個真實故障。本 repo 把那些血淚固化成可重用的形式。

## 結構

```
mobile-shipkit/
├── docs/            # 設計文件(先讀這裡)
├── skills/          # 原創 skills(SKILL.md 格式,相容 Claude Code / codex / cursor)
├── cli/gpc/         # Google Play CLI(Python + typer)
├── template/        # create-expo-app 之後直接套用的起始專案
└── vendor/          # 第三方 skill 包(git submodule,釘版本)
```

## 依賴分工(不重複造輪子)

| 來源 | 提供 | 引入方式 |
|---|---|---|
| [expo/skills](https://github.com/expo/skills)(官方) | 框架面、eas-app-stores、eas-update-insights | `claude plugin install expo@claude-plugins-official` |
| asc skills(App-Store-Connect-CLI 隨附) | Apple 端全部命令面 | vendor/ submodule |
| **本 repo** | 失敗病歷本、Play API 全流程、截圖管線、文案規格、IAP/廣告接入 | skills/ + cli/ |

## 原創 skills 一覽

| skill | 一句話 |
|---|---|
| `eas-build-doctor` | EAS build 失敗病歷本:八次真實失敗的根因與修法 |
| `eas-ota-discipline` | OTA 指紋鐵律:更新為什麼沒人收到 |
| `submit-google` | Play 上架全流程:API 能做的全做、Console-only 清單明列 |
| `store-screenshots` | sim-use 驅動的 release 版截圖管線 |
| `store-listing` | 雙商店文案規格:字數表、emoji 規則、三語策略 |
| `monetize-revenuecat` | IAP 接入(規劃中,待實戰驗證) |
| `monetize-admob` | 廣告接入+隱私申報翻案清單(規劃中,待實戰驗證) |

## 狀態

設計文件完成,實作進行中。實作順序:`gpc` → build-doctor/ota → submit-google → screenshots/listing。
