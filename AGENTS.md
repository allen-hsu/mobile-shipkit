# 給在此 repo 工作的 agent

## 現況
設計文件在 docs/,是唯一 source of truth。skills/ cli/ template/ 都還是空的,照文件實作。

## 實作順序
1. cli/gpc — Go + cobra,規格見 docs/gpc-cli.md。行為對齊附錄提到的已驗證 Python 腳本
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
