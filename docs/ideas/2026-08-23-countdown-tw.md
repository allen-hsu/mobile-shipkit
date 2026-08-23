# 題目：台灣「倒數日」（殭屍市場重做）

狀態：候選，未驗證商業模式（待 grilling）。來源：`app-scout` 2026-08-23，`report --genre Lifestyle/Productivity --countries jp,tw` + `search "倒數日" --country tw` + `reviews com.clover.daysmatter --hl zh_TW --gl tw --stars 1,2,3`。

## 訊號
| app | 開發者 | TW 評分數 | 最後更新 | 變現 |
|---|---|---|---|---|
| 倒數日°（id 988424260） | rongsheng li（個人） | 60.8k | 1430 天前 | 無 IAP，純免費 |
| 倒數日 · Days Matter（id 406170251 / com.clover.daysmatter） | iDaily / Clover（中國） | 20.2k · Play 1M+ | iOS 10 天 · Play 375 天 | 免費 + 廣告 + 一次性「倒數日 Pro」 |
| iDays（Gerinn） | — | 12.9k | 2081 天前 | — |
| TheDayBefore（韓） | — | 3.4k · Play 10M+ | 2 天 | 免費 + 廣告 + IAP |
| あと何日（JP，id 919998681） | 個人 | 14.5k | 54 天 | — |

需求：三支合計 9.4 萬評分；供給：前兩名 4–6 年沒維護，第三名 Play 評分 4.15。

## 抱怨 → 規格（Days Matter TW Play 150 則 1–3★）
- 桌面小工具不會自己倒數、點進去才動 (19+8) → WidgetKit timeline 每日刷新 + Live Activity 最後 24 小時
- 換手機資料不見 → CloudKit 同步、免帳號
- 閃退、付費後沒人回 → 小而穩，回評論
- 只能從檔案選照片 → PhotosPicker
- 「精確計時」名不符實 → 真的時分秒；鎖定畫面小工具
- 付費反感 → 免費全功能 + 一次買斷去廣告，不做訂閱

## 使用者原話（額外功能訊號，2026-08-23 轉貼）
> 希望背景能放動態圖片（影片），我本身是喜歡二次元的，也是一種記錄，只是每次划開鎖屏都還要按返回才能退回桌面，有點麻煩，希望能直接解鎖就到桌面，但現在的功能也很棒，繼續保持！

→ 兩個需求：(1) **動態／影片背景**（二次元族群，把倒數日當成「收藏 + 記錄」而不只是工具）；(2) **鎖定畫面互動不要多一步**（iOS 鎖定畫面小工具 / Live Activity 可以做到「看完直接解鎖回桌面」，正是原生能力優勢）。

## 變現粗估（TW 月新安裝 2 萬、30 日留存 25%、DAU ~1.5 萬）
- 廣告：eCPM US$1.5–3、每 DAU 3 曝光 → US$2–4k/月
- 一次買斷去廣告 NT$90–150、轉換 2–4% → +US$1.2–3.5k/月
- 天花板：月 US$3–7k，一人維護。

## 風險
Clover 回來更新；ASO 被老 app 佔關鍵字（走「小工具／紀念日／學測倒數」長尾）；台灣用戶對廣告體感差。

## 下一步
1. 用 grilling / 策略審查拷問：定位、護城河、為什麼是我們、退出條件。
2. Go → `new-deck` / `brief.json`，第一張截圖回答「小工具會自己倒數」。

## 市場地圖修正（landscape，12 個同義詞，2026-08-23）
三塊，不是一塊：
1. **通用倒數日（工具型）＝殭屍區**：12 支 💀（倒數日° 60.8k/1430d、iDays 12.9k/2081d、Days Matter Air 2k/403d、迪剛宋 4.2k/2563d…），合計 8.9 萬評分沒人維護。活著的只有 Days Matter iOS（10d）與 TheDayBefore（2d，台灣 3.4k）。**我們的戰場。**
2. **情侶紀念日＝活躍**：Between 43.6k、SumOne 21.8k、情侶小工具 9.6k、The Couple 6.1k、MeetFire 4.6k，全部近期更新。不進。
3. **小工具／主題桌布＝大戶**：iScreen 101k（天天更新）、Mico、翻頁時鐘系列。視覺路線會正面對上 iScreen。不以此為主戰場，二次元風主題只當付費差異化。

## grilling 第一輪決定（2026-08-23）
- Q1 目的：**練手**（shipkit 第一個真實案例）→ 兩週上架、功能最小。
- Q2 二次元優勢：在**分發與品味**（巴哈／Dcard 動漫板／C_Chat 通路、文案用圈內語、主題審美），不在內容（IP 不能用，素材走原創／AI 生）。
- Q3 核心承諾：抱怨 + 情緒 →「重要的日子，自己會倒數、而且好看」；截圖 1 小工具、截圖 2 主題。
- Q4 技術：**Expo 主體 + 兩小塊原生**（見下）。
- Q5 變現：**免費全功能 + 多個主題包買斷**（non-consumable，各 NT$60–120，另有合集）；不放廣告、不訂閱。
- Q6 對 Clover：不賭；ASO 避開「倒數日」正面戰，主打「紀念日 小工具」「倒數 鎖定畫面」+ 圈內長尾（新番、活動、學測、交往天數）。
- Q7 組合策略：一直找題一直做 → 每支 **2 週做 + 60 天量測**；60 天有機安裝 < 1,500 或主題包轉換 < 1.5% → 停止投入（不下架），回 scout。

## 技術架構（Q4 + Android 細節）
```
Expo app（shipkit template）
 ├─ iOS  主畫面／鎖定畫面小工具、Live Activity ─ SwiftUI via @bacons/apple-targets；Text(date, style:.timer) 系統跳秒
 └─ Android widget
     ├─ 天數級：react-native-android-widget 0.16（JSX→RemoteViews，Expo plugin，EAS OK）
     │          + 自寫 AlarmManager：下一個午夜／時區變更／重開機 三種觸發（不能靠 30 分鐘輪詢——這正是 Days Matter 被罵的原因）
     └─ 時分秒級：~150 行 Kotlin Expo Module，RemoteViews + Chronometer(countDown)，系統自己跳、零更新（套件沒暴露此元件）
```
套件事實：無動畫（渲染成圖）、無鎖定畫面小工具、系統最小更新 30 分鐘、JS handler 30 秒上限、無 Glance。
Android 額外賣點：ongoing notification / Android 16 Live Updates 放 Chronometer 當「鎖定畫面倒數」，競品沒做。
Q14 改答：Android 第一批可一起上，但 V1 只做天數級；時分秒原生排 V1.1。

## 待決（第二輪）
Q8 V1 範圍 · Q9 主題包內容來源 · Q10 定價 · Q11 同步（CloudKit vs 自建） · Q12 名字與關鍵字 · Q13 截圖故事線
