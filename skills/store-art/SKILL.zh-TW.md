---
name: store-art
description: 把模擬器原始截圖做成 App Store / Google Play 可上架的圖：九種驗證過的版型（caption-top、caption-bottom、device-only、floating-tilt、feature-focus、before-after、panorama-2、panorama-3、feature-graphic）、1024×500 Play feature graphic、icon 各尺寸。當使用者說「截圖加框」「截圖做好看一點」「加文案」「feature graphic」「接續圖／全景截圖」或要從 1024 母檔出 Play 的 512 icon 時使用。用 JSON manifest + scripts/render.py 驅動 Koubou（asc screenshots frame 同一個渲染器），不需瀏覽器、不需設計工具。
---

# store-art

原始截圖 → 商店成品。搭配 `store-screenshots`（產原始截圖）與 `store-listing`（寫文案）。
2026-08 端到端驗證：模擬器截圖 → `render.py` → `gpc images upload`，Play 直接收。

## 需要什麼

```sh
pip install koubou==0.18.1            # 渲染器；asc screenshots frame 用的就是它
```

裝置框第一次用時從 Koubou 的 GitHub release 下載。字型：Koubou 只認 `Helvetica`、`Arial`、
`System`，或**字型檔路徑**。中日文標題給檔案，例如 `"font": "/System/Library/Fonts/PingFang.ttc"`；
寫其他家族名會「Failed to render text」。

## 1. 寫 manifest

`shots.json`，每張一筆，照商店順序：

```json
{
  "name": "my-app",
  "brand": { "bg": ["#0F172A", "#1E3A5F"], "accent": "#38BDF8",
             "text": "#FFFFFF", "muted": "#CBD5E1", "font": "Helvetica", "direction": 180 },
  "shots": [
    { "file": "raw/zh-TW/01-home.png",  "title": "五秒記錄", "subtitle": "兩下就完成" },
    { "file": "raw/zh-TW/02-graph.png", "title": "看見規律", "badge": "NEW" },
    { "file": "raw/zh-TW/03-a.png", "file2": "raw/zh-TW/03-b.png", "title": "淺色或深色" }
  ]
}
```

文案規則（來自 `references/` 的 ASO 調研）：標題 ≤ 6 個詞、一張一個賣點、第一張要講完整個
故事（七成的人不會滑到第二張）。

## 2. 選版型

```sh
python3 scripts/render.py --manifest shots.json --template caption-top --out framed/zh-TW
```

| 版型 | 構圖 | 什麼時候用 |
|---|---|---|
| `caption-top` | 標題副標在上，裝置底部出血 | 第一張的預設；多數 app |
| `caption-bottom` | 裝置頂部出血，文案在下 | 跟 caption-top 交錯，有節奏 |
| `device-only` | 只有裝置框 + 品牌漸層 | 遊戲／視覺型；文案沒好時的保底 |
| `floating-tilt` | 裝置 −8° 傾斜、陰影、文案在上 | 第 2–4 張 |
| `feature-focus` | 小 badge（NEW / FREE）+ 短標 + 大裝置 | 逐功能介紹 |
| `before-after` | 兩台小裝置並排（`file` + `file2`） | 修圖、健身、深淺模式 |
| `panorama-2` | 一台大裝置橫跨兩張 | 第 1–2 張成對 |
| `panorama-3` | 一台傾斜裝置橫跨三張 | Uber Eats / Airbnb 那種接續圖 |
| `feature-graphic` | 1024×500，標題左、裝置右 | Google Play 頭圖 |

版型是 `templates/` 下的 JSON；座標用畫布百分比，字級以 1320×2868 為準
（標題 80–90 px、副標 44–56 px——調研收斂出的範圍）。複製一份改就是自己的版型。

全景圖是**一次渲染 N 倍寬的畫布再切片**——Koubou 會丟掉位置超出 0–100% 的元素，
「把裝置放在 150%」行不通；切片是接縫像素對齊的唯一方法。

## 3. 輸出結構 → 上傳

`--out framed/<locale>` 每個語系一個目錄，兩邊上傳器都吃這個：

```sh
gpc images upload --type phoneScreenshots --locale zh-TW --path ./framed/zh-TW/iPhone_16_Pro_Max_-_Black_Titanium_-_Portrait/
gpc images upload --type featureGraphic  --locale zh-TW --path ./fg/.../01-home.png
asc screenshots upload …                 # 見 vendor/asc-skills 的 asc-shots-pipeline
```

`render.py` 出來直接被收的尺寸：1320×2868（iPhone 6.9"）、1024×500（feature graphic）。

## 4. Icon 各尺寸

```sh
sh scripts/icon-set.sh assets/images/icon.png out/   # 1024 母檔 → 512（Play）、180／120／60 預覽
```

Play 要 512×512、32-bit PNG、≤ 1 MB；iOS 給 1024 母檔即可（Expo 會生其他尺寸）。

## 會咬人的商店規則

- 截圖必須是**真實 app 畫面**；文案與裝置框可以，假 UI 不行。
- feature graphic 正中 300×240 別放字——播放鈕會蓋在那裡。
- 文案每個語系一份（`shots.<locale>.json`）；Apple 與 Play 都按語言 fan out。
- Apple 禁 emoji 的是*描述欄*不是截圖——但文案還是保持乾淨。

## 參考

`references/layouts-research.md` — 這份版型目錄的出處：12 種 pattern、尺寸表、轉換率數據、工具比較、來源連結。
