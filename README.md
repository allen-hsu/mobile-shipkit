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
├── cli/gpc/         # submodule → github.com/allen-hsu/gpc(Google Play CLI,Go + cobra)
├── template/        # create-expo-app 之後套上去的 overlay(apply.sh 冪等)
└── vendor/asc-skills/  # rorkai/app-store-connect-cli-skills submodule,釘 asc install-skills 同一 commit
```

## 依賴分工(不重複造輪子)

| 來源 | 提供 | 引入方式 |
|---|---|---|
| [expo/skills](https://github.com/expo/skills)(官方) | 框架面、eas-app-stores、eas-update-insights | `claude plugin install expo@claude-plugins-official` |
| [asc skills](https://github.com/rorkai/app-store-connect-cli-skills)(asc 隨附,23 個) | Apple 端全部命令面 | `vendor/asc-skills` submodule 或 `asc install-skills` |
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

## 安裝 skills(Claude Code plugin)

```sh
claude plugin marketplace add allen-hsu/mobile-shipkit
claude plugin install mobile-shipkit@mobile-shipkit
```

裝完 `skills/` 下八個 skill 會出現在 Claude Code 的 skill 清單(`/eas-build-doctor`、`/submit-google`…)。
其他 agent(codex / cursor)直接把 `skills/<name>/SKILL.md` 複製或 symlink 進各自的 skills 目錄。

## 前置依賴

- Expo 官方 plugin:`claude plugin install expo@claude-plugins-official`(框架面、eas-app-stores、eas-update-insights)
- `asc`:`brew install rudrankriyam/tap/asc`,再 `asc install-skills`(或用本 repo 的 submodule:`git submodule update --init`)
- `gpc`:`go install github.com/allen-hsu/gpc@latest`(或 `brew install allen-hsu/tap/gpc`,發版後),
  服務帳號放 `~/.config/gpc/service-account.json`。原始碼在 [allen-hsu/gpc](https://github.com/allen-hsu/gpc),此處以 submodule 掛在 `cli/gpc`

## 狀態

- ✅ `cli/gpc`(獨立 repo [allen-hsu/gpc](https://github.com/allen-hsu/gpc)):上架面(auth/listing/images/bundle/track/datasafety/details)+ 營運面
  (reviews/testers/countries/iap/subscriptions/pricing/mapping/sharing/vitals)。唯讀指令與
  listing/images/bundle 的 --dry-run 已對真實 app 驗證;commit 路徑對齊上架當天的 Python 腳本
- ✅ skills/:八份 SKILL.md(六正式 + monetize 兩份規劃中)
- ✅ vendor/asc-skills submodule
- ✅ template/:eas.json 三件組、.easignore、平台分流 locales、gradle hook、patch-package、
  check-lockfile / check-ota 腳本、雙商店 metadata 骨架;`scripts/apply.sh` 對空專案測過兩次(冪等)
