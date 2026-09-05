---
name: app-scout
description: 用公開商店資料決定下一個要做什麼 app——篩選階段不需要付費市場情報。一支零依賴腳本，接 iTunes Search/Lookup API、舊版 iTunes RSS 榜單（各國 × 類別的 grossing / free / paid）與 Google Play 商店頁（安裝數區間、更新日、廣告 / IAP 標記）。策略即指令：geo-gap（日本強、美國沒有或沒在地化）、zombies（還在榜上但 18 個月沒更新）、weak（評分數上千但 ≤ 3.9★）、paid-gaps（付費 app 沒有強的免費替代）；另有 charts、search、跨國 app 比較、play、一鍵 Markdown 報告。當使用者問「該做什麼 app」「找 X 類別的機會」「這個點子在 Y 市場有人做了嗎」「哪些競品已經放棄」「app 市場調查」「驗證 app 點子」、或要做地理套利／付費轉免費／殭屍 app 掃描時使用。選定點子後交給 store-screenshots / store-listing。
---

# app-scout

`create-expo-app` 之前的問題：**要做什麼**。公開商店資料足以篩點子；付費估算（AppFigures、AppMagic、
Sensor Tower）只在你已經有短名單、要算市場規模時才需要。評分數與其增速是免費的量級代理；
Play 的安裝數區間是唯一免費的絕對數字。

```sh
node skills/app-scout/scripts/scout.mjs genres                                  # App Store 類別 id
node skills/app-scout/scripts/scout.mjs charts    --country jp --genre 6013     # grossing 榜（或 --kind free|paid）
node skills/app-scout/scripts/scout.mjs geo-gap   jp us --genre 6013            # 策略 1
node skills/app-scout/scripts/scout.mjs zombies   --country us --genre 6013     # 策略 3
node skills/app-scout/scripts/scout.mjs weak      --country us --genre 6013     # 策略 4
node skills/app-scout/scripts/scout.mjs paid-gaps --country us --genre 6013     # 策略 2
node skills/app-scout/scripts/scout.mjs app  904237743 --countries jp,us,tw     # 單一 app 跨國
node skills/app-scout/scripts/scout.mjs play com.duolingo --hl zh_TW --gl tw    # Play 事實
node skills/app-scout/scripts/scout.mjs search "家計簿" --country jp
node skills/app-scout/scripts/scout.mjs reviews com.duolingo --n 300 --stars 1,2,3        # Play 評論 + 抱怨關鍵字
node skills/app-scout/scripts/scout.mjs complaints 680170305                              # App Store id → Play 對應版 → 1–3★ 評論
node skills/app-scout/scripts/scout.mjs play-search "7 minute workout"                    # 找 Play package
node skills/app-scout/scripts/scout.mjs landscape "倒數日,紀念日,countdown,D-Day" --country tw --min-hits 2   # 同義詞合併競品地圖，💀 = 停更 > 1 年
node skills/app-scout/scripts/scout.mjs report --genre 6013 --countries jp,us   # 全部跑一遍 → scout-<genre>-jp-us.md
```

`--json` 原始資料、`--out file.md` 追加輸出、`--limit 100`（榜單深度，最多 200）、`--ttl 24`
（快取小時數，`.scout-cache/` 在 cwd）、`--no-cache`。每次約 10–60 個請求；腳本會間隔並在 403/429 時重試。

## 各來源給什麼（2026-08-23 實測）

| 來源 | 欄位 | 備註 |
|---|---|---|
| iTunes Lookup / Search（按 `country`） | 名稱、開發者、類別、價格、評分、**評分數**、**最後更新日**、首次上架、版本、語言、最低 OS | 事實；lookup 對長 id 清單會靜默截斷，腳本每 40 個一批 |
| 舊版 RSS `itunes.apple.com/{cc}/rss/topgrossingapplications/limit=100/genre=6013/json` | 各國 × 類別 grossing / free / paid 前 100–200 | 新版 `rss.marketingtools.apple.com` v2 **沒有 grossing、不能按類別**——用舊版 |
| Play 商店頁 | 安裝數區間（`500M+`）、更新日、**Contains ads / In-app purchases**、JSON-LD 評分與評分數、價格 | 抓 HTML；Google 改版會壞 |
| Play 評論（`reviews`、`complaints`） | 內文、星等、日期、版本、👍、開發者回覆；走 batchexecute 分頁 | 每次 150 則；`--stars 1,2,3` 每個星等分開抓；對 ≤ 3★ 做單字／雙字詞統計 |
| App Store 評論 | **目前拿不到**——評論 RSS 回空、amp-api token 已不在頁面裡 | `complaints <appstore-id>` 用名稱 + 開發者找 Play 對應版改讀那邊；會印出配對結果讓你判斷對錯 |

## 策略 → 訊號

| 指令 | 找什麼 | 分數 |
|---|---|---|
| `geo-gap A B` | A 榜上的 app 在 B **不存在**、**沒有 B 語言**、或在 B **很弱**（< A 評分數 5%） | log10(A 評分數) ×（absent 1.5 / no-lang 1.2 / weak 1）+ 近期有更新加分 |
| `zombies` | ≥ 500 評分、`--months`（18）沒更新、仍在榜上或 `--terms a,b` 搜得到 | log10(評分數) × 停更天數 / 100 |
| `weak` | ≥ 1 000 評分、評分 ≤ 3.9——需求證實、用戶不滿 | (4.6 − 評分) × log10(評分數) × 10 |
| `paid-gaps` | 付費 app（≥ 200 評分）且最強的**免費**同類別、名稱重疊替代品評分數 < 20%（`—` = 沒找到，請手動看類別） | log10(評分數) × 10 × 缺口係數 |

同樣資料還能看的（跑 `charts` / `search` 自己讀）：**平台缺口**（只有 iOS、`play` 回 404）、
**語系缺口**（頭部 app 的 `langs` 沒有 zh/ja/ko）、**開發者集中度**（前 20 都是 1–2 家 → 避；
indie 多 → 進）、**變現常態**（對前 10 跑 `play`：全 ads → 免費加廣告類別；全 IAP → 訂閱類別）、
**訂閱疲勞**（領先者全是訂閱 → 一次買斷切入）、**功能拆分**（大 app 的單一功能做成專用小 app）、
**新系統能力時機**（Widgets / Live Activities / App Intents 趁類別還沒跟上先做）。

## 怎麼讀結果（在愛上點子之前）

1. **需求**：來源市場評分數 ≥ 1 萬，或 Play 安裝 ≥ 100 萬。低於這個，市場可能只存在於某個品牌。
2. **可移植性**（geo-gap）：這個 app 是否綁在本地生態（樂天點數、docomo、保險公司、健身房連鎖）？
   那不是缺口，是護城河。日本 Health 榜有一半是「走路賺點數」——**機制**可以搬，app 不能。
3. **為什麼是空的**：B 沒有是因為沒人做，還是 B 早就用別的名字解決了？不要用一個關鍵字下判斷——把用戶真的會打的同義詞全部丟給 `landscape`（`--min-hits 2` 去噪）。一個詞看是殭屍市場；十二個詞看出三個子市場、其中兩個活著（countdown-tw 案例）。
4. **能不能贏下 listing**：`weak` / `zombies` 給你要修的抱怨——讀 Play 評論；前三張截圖回答它們
   （`store-screenshots` §1）。
5. **然後才算規模**：這時再花錢買 AppFigures / AppMagic 看前 5 名的下載與營收。

## 交棒

選定點子 → `store-screenshots` 的 `brief.json` 從同一組事實開始（`app.category`、`coreValue` 來自
那個致勝的抱怨），`store-listing` 對著 `scout` 剛產出的競品組寫描述。
