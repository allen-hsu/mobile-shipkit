# 給在此 repo 工作的 agent

## 現況(2026-08-21)
設計文件在 docs/,是唯一 source of truth。步驟 1–4 已完成:cli/gpc(submodule → allen-hsu/gpc)可編譯、有單元測試、
唯讀命令對真實 app 驗證過;skills/ 八份 SKILL.md;vendor/asc-skills submodule。
template/ 完成,已對真的 create-expo-app(SDK 57)驗過:apply → npm install → expo-doctor 21/21 →
prebuild android 產出 values-b+ja/strings.xml 只有 app_name、gradle hook 在無換行結尾的
gradle.properties 上正確換行、check-lockfile 過。模組系統(base 六個一律裝、admob/revenuecat 可選)同樣在
真專案上以 --with admob,revenuecat --install 驗過,兩平台 prebuild 原生設定正確落地。改 gpc flag 名時記得同步 skills/submit-google/SKILL.md。

## 待驗證(下次真實上架時順手做)
- gpc 的 commit 路徑(track set / datasafety push / details set / mapping upload / sharing upload /
  reviews reply / testers set)在新 app 上完整跑一遍;listing push、images upload、bundle upload
  已用 --dry-run 對真 app 驗過(API 接受 payload、edit 丟棄)
- `gpc vitals`:要先在 GCP 專案 999979065408 開 Play Developer Reporting API(人類),再驗
- submit-apple 裡 asc 子命令 flag 名(review details-update、versions update、screenshots upload)
- store-screenshots 裡 sim-use 子命令名
- goreleaser + brew tap 實際發一版(gpc repo 要加 HOMEBREW_TAP_TOKEN secret)

## 實作順序
1. cli/gpc — 獨立 repo github.com/allen-hsu/gpc,此處為 submodule;改 gpc 要在那邊 commit/push
   再在這裡 bump submodule。Go + cobra,規格見 docs/gpc-cli.md。行為對齊附錄提到的已驗證 Python 腳本
   (在 gut-game repo docs/store/play_listing.py)。先做 auth status / listing push /
   bundle upload / track set 四個指令,datasafety 其次。
2. skills/eas-build-doctor、skills/eas-ota-discipline — 內容直接從 docs/skills-plan.md
   對應章節展開成 SKILL.md(frontmatter: name/description,正文 < 500 行)。
3. skills/submit-google、store-screenshots、store-listing。
4. vendor/ 掛 asc skills submodule;README 標注 expo 官方 plugin 為前置依賴。

## 慣例
- SKILL.md 遵循 expo/skills 的限制(描述 <1024 字元,正文 <500 行)
- 教「怎麼發現」不只寫死事實;人類時刻(2FA/Console 表單/送審鈕)必須明標
- 所有宣稱要可追溯:每條病歷本條目都來自 2026-08 便便植物園上架實戰

## 素材庫
- gut-game repo(~/orca/projects/gut-game):docs/store/*(metadata、play_listing.py、
  screenshots、隱私政策)、tmp/imagegen/*(codex briefs)
- 該專案 git log 的 commit message 本身就是病歷本的長文版
