# gpc — Google Play Console CLI 設計

> 實作已獨立成 repo:https://github.com/allen-hsu/gpc(本 repo 的 cli/gpc 是 submodule)。
> 本文件是設計意圖與硬知識的出處;命令面以該 repo 的 README / --help 為準。

asc 之於 App Store Connect,gpc 之於 Google Play。薄封裝 Android Publisher API v3,
agent 友善,填補 fastlane supply 不覆蓋的面(dataSafety、details、track 狀態機)。

## 語言選擇:Go + cobra(與 asc 同技術棧)

- asc 就是 Go——單一靜態 binary、零執行環境依賴、啟動毫秒級,CLI 該有的樣子
- 官方 client:`google.golang.org/api/androidpublisher/v3` +
  `golang.org/x/oauth2/google`(服務帳號),resumable media upload 內建
- cobra 生成 `--help` 樹,agent 指令發現友善,慣例與 asc 一致
- 發佈:GitHub Releases + brew tap(allen-hsu/homebrew-tap 已存在,直接加 formula)
- 驗證過的 Python session scripts 降級為參考實作(附錄),行為對齊它們即可

## 認證

服務帳號 JSON,尋找順序:`--service-account` flag → `GPC_SERVICE_ACCOUNT` env →
`~/.config/gpc/service-account.json`。無互動登入(Play API 只有服務帳號一途)。

## 命令面(全部經實戰驗證)

```
gpc auth status                          # 驗證憑證:開一個 edit 再刪掉
gpc listing push --dir ./play-metadata   # 每 locale 一份 json: title/short/full
gpc listing pull --dir ./play-metadata
gpc images upload --type icon|featureGraphic|phoneScreenshots \
                  --locale zh-TW,en-US,ja-JP --path ./shots/
gpc bundle upload app.aab                # resumable + 重試(4MB chunk, socket timeout 600s)
gpc track set --track internal|alpha|production --status draft|completed \
              --version-codes 10 --notes-dir ./notes
gpc track promote --from internal --to production
gpc datasafety push labels.csv           # 見下方 CSV 格式
gpc details set --email ... --website ... --phone ...
```

## 慣例(抄 asc 的)

- pipe 時輸出 JSON,tty 時 table;`--confirm` 才准破壞性操作
- Google 的 400 錯誤訊息原樣透傳 —— 它們寫得很清楚,是迭代表單格式的主要回饋來源
- 每個指令的 --help 附「此操作對應 Console 哪個頁面」

## 硬知識(必須寫進 --help 或錯誤提示)

1. **API 不能建 app。**`applications` 資源只有 `dataSafety` 方法。app 必須在 Console UI 建立,
   套件名由第一個上傳的 AAB 綁定。
2. **草稿 app 只接受 status=draft 的 release**,錯誤訊息:
   "Only releases with status draft may be created on draft app."
3. **Console 開著的分頁會搶 edit**:"A change was made to the application outside of this
   Edit" → 重開 edit 重試即可,提示用戶關掉 Console 未存表單。
4. **dataSafety CSV 真實表頭**(官方文件藏很深,API 對錯誤格式報 "Invalid header row"):

   ```csv
   Question ID (machine readable),Response ID (machine readable),Response value,Answer requirement,Human-friendly question label
   PSL_DATA_COLLECTION_COLLECTS_PERSONAL_DATA,,false,REQUIRED,Does your app collect or share any of the required user data types?
   ```

   「完全不收集」= 上面兩行就是完整合法提交(已驗證回 200)。
5. **Console-only 清單**(gpc 做不到,skill 要引導用戶手點):
   建立應用程式、內容分級 IARC 問卷、目標對象、健康功能宣告、應用程式類別、
   國家/地區選擇、發布總覽的「送審」按鈕。

## 附錄:實戰代碼來源

上架當天(2026-08)跑通的 Python session scripts(listing/images/bundle/tracks/datasafety/details),
留在維護者的私人專案;gpc 的行為對齊它們。
