# 31 組商店截圖參考集 — 逐組分析與對應實作

來源：使用者提供的 31 組 App Store 實際上架截圖（每組 4–5 張）。每組一條：它在做什麼、文案怎麼寫、
在 store-art 裡怎麼做（`style` × `layout` × `elements`）、審核與優化要注意什麼。
「可做」= 現有系統直接做得出來；「需素材」= 需要使用者提供插畫／照片／3D 圖；「不做」= 違規或不值得。

圖例：🍎 Apple 規範注意　🤖 Play 規範注意　📈 優化文件（DesignerAnts / Paul Solt / Playbook）的印證

---

### #1 DMV 駕照考試 App（深綠 → 照片 → 藍）
- **手法**：第 1 張「桂冠證據牆」：App 名 + 三個桂冠數字（7 million downloads / 160,000 ratings 4.8★ / 95.2% pass rate）+ 小綠貼紙（Specific to your state）疊在手機上；第 2 張整張真人照片 + 一句話 + logo；第 3 張照片拼貼；第 4 張功能截圖 + 大數字「600+ exam-like questions」。
- **文案**：證據先行（第 1 張就把三個數字丟出來）→ 結果（test done in no time）→ 範圍（Car, CDL & Motorcycle）→ 規模（600+）。📈 playbook「numbers add credibility」。
- **實作**：`style: dark-pro` 或 `photo-backdrop`；第 1 張 `bleed-bottom` + `elements: [{type:'stamp',kind:'laurel'} ×3, {type:'stamp',kind:'pill'}]`；第 2 張 `no-device` + `bgImage`；第 3 張 `no-device` + `image` ×3 傾斜；第 4 張 `crop-zoom` + `stat`。
- **注意**：🤖「7 million downloads」在 Play 是禁語（Million Downloads），護欄會擋；🍎 可以。真人照片需授權。

### #2 BOEF 幫派遊戲（粉紅底 + 插畫角色）
- **手法**：全插畫角色當主視覺、手機縮小在中間、大字描邊標題在上下（CREATE YOUR GANG / CASH IN ON CRIME）。第 3、4 張手機 + 角色疊在前面遮住手機邊。
- **文案**：全部動詞開頭祈使句、兩字一行、大寫描邊字。遊戲類的「情緒優先」。
- **實作**：`style: bold-dark`（改粉紅 palette）+ `layout: float` + `elements:[{type:'image'}]` 角色 PNG 疊在裝置前（z 4 本來就高於裝置）。描邊字：在 style 加 `h1{-webkit-text-stroke}` 變體。**需素材**（角色插畫）。
- **注意**：🍎 截圖必須「主要顯示 app」——插畫佔比過高有風險，遊戲類 Apple 較寬鬆；🤖 Play 同。

### #3 AI 頭像產生器（深棕 + 人像）
- **手法**：人像照片滿版、手機半透明、第 1 張左下圓形「ORIGINAL」對照小圖 + 右下「Ultra resolution」；第 2 張卡片堆疊（多張人像疊成牌堆）+ 終端機字體的假 log；第 4 張底部 2×2 icon 功能格（real-time processing / 30 shots…）。
- **文案**：短、名詞片語（AI headshot generator / Realistic headshots）。
- **實作**：`photo-backdrop` + `frameless-bleed`；`elements: crop`（原圖圓形，`radius: 9999`）、`features` 2×2 格；牌堆用 `card-stack`。
- **注意**：AI 生成人像要標示；🍎 不可誤導（before/after 要是真的輸出）。

### #4 AI 角色聊天（藍紫漸層 + 動漫插畫）
- **手法**：動漫全身插畫 + 聊天泡泡 UI 碎片浮在外面、第 2 張一堆角色頭像卡散落（scatter）、第 4 張手機 + 列表。襯線斜體大標（Dive into the AI world）。
- **文案**：情緒＋規模（Billions of AI personas…）。
- **實作**：`mesh-glass` + `scatter`（頭像卡用 `elements: image` 或 `crop`）；聊天泡泡用 `crop` 從截圖切出來浮出。**需素材**（插畫）。
- **注意**：🍎 4.3 / 1.1 成人暗示內容；🤖「Billions」可視為誇大。

### #5 Framer（深藍 → 紫漸層）
- **手法**：第 1 張手機被網站卡片拼貼包圍（多張網站縮圖傾斜散落）+ 底部輸入框 UI 碎片；第 2 張**引言卡**（“ ” + 名字 + 職稱 + Dribbble）；第 3 張手機大 + 「Publish」按鈕放大浮出；第 4 張手機 + 分析卡片浮出。
- **文案**：結果導向（Create and publish your site with AI in secs / The internet is your creative playground）。📈 引言 = 社會認證。
- **實作**：`mesh-glass`；第 1 張 `scatter` + `crop` 輸入框；第 2 張 **`layout: quote` + `elements: quote`**；第 3 張 `bleed-bottom` + `crop`（按鈕放大，`width: 500`）；第 4 張 `float` + `crop`。
- **注意**：引言需真實可查（🍎 5.2.5 不得捏造背書）。

### #6 Amie 行事曆（粉紅／淺灰）
- **手法**：這是「**UI 碎片飛出來**」的教科書：手機周圍浮著 3D app icon、事件卡、時間表片段；第 2 張整張是放大的行事曆 UI + 事件卡浮在上面；第 4 張一堆 widget 卡散落。標題左對齊、兩色（黑 + 灰）。
- **文案**：情緒 + 功能（Joyfull productivity / Amie cares about your well-being）。
- **實作**：`minimal-light`（改 `bg: #FFD6DC`）；`bleed-bottom` + `elements: crop` ×3（事件卡、時間列）+ `image`（3D icon 需素材）；第 2 張 `crop-zoom`；第 4 張 `no-device` + `crop` ×6 傾斜。雙色標題用 `==灰字==`（在 minimal-light 把 em 改成 muted 即可）。
- **注意**：Play：碎片不算裝置框，合規 ✅。

### #7 Crypto 錢包（青藍漸層 + 雲）
- **手法**：雲朵／星星貼紙背景、手機 + 3D 貼紙（星球、彩虹）疊在邊緣、第 4 張手機只露上半 + 大星星。
- **文案**：Experience Crypto in Color / Discover new tokens / Swap and bridge —— 三字動詞句。
- **實作**：`playful-pop`（青色 palette）+ `bleed-bottom` / `bleed-top` + `elements: image`（貼紙，**需素材**）。
- **注意**：🍎 3.1.5 加密貨幣 app 限制；截圖不可暗示收益。

### #8 Web3 瀏覽器 Zerion（紫 + 漫畫貼紙）
- **手法**：漫畫風貼紙（爆炸、手、貓）壓在手機邊緣、第 2 張 app icon 列 + 手機、第 3 張手機上半 + 插畫手。
- **實作**：同 #7：`playful-pop`（紫）+ `image` 貼紙。**需素材**。
- **注意**：同 #7。

### #9 Furry Nomad 稅務（淡紫 + 單色線稿插畫）
- **手法**：**無裝置頁與裝置頁交錯**：奇數張是襯線標題 + 單色線稿插畫，偶數張是乾淨的手機。極簡、留白多、品牌 logo 在左上。
- **文案**：功能陳述句，但句子完整（Tax & residency info overview by country）。
- **實作**：`minimal-light`（`bg:#F2EEF8`）；奇數 `no-device` + `elements: image`（線稿 SVG，**需素材**）+ `text`（logo 名）；偶數 `float`（`titleSize` 小一點或無標題 `copy:'none'`）。
- **注意**：無。這是最安全的一組（完全符合 Play「純介面 + 少量文字」）。

### #10 AI 角色 App（深藍→黑）
- **手法**：第 1 張手機內是頭像格、手機外再浮一圈頭像（crop）；第 2 張手機 + 3D 獎盃貼紙；第 3 張整張是放大的「人格矩陣」UI（無框）；第 4 張大字 GEN-4 / GEN-3 字卡 + 底部 4 icon 功能列。
- **實作**：`dark-pro`；`bleed-bottom` + `crop` 圓形頭像 ×6；`crop-zoom`；`no-device` + `stat`（GEN-4）+ `features`。
- **注意**：🤖「Find right engine」OK；避免標示 GPT 等第三方商標。

### #11 約會回覆產生器（米色 + 橘紅）
- **手法**：**斜體手寫字當強調**（*upload* / *answer*）、聊天泡泡 crop 浮出手機、app icon 貼紙、橘色箭頭指向按鈕、綠色 pill 標籤（82 playful, witty）。
- **文案**：步驟式（upload → get an answer → 18+ tones → copy & send）。📈 一張一步。
- **實作**：`paper-sticker`（米色）；`float` + `crop` 泡泡 + `stamp pill` + `image`（箭頭 SVG）；斜體強調 = 在 style 把 `em` 設為 `font-family:Caveat;font-style:italic`。
- **注意**：🍎 1.1.4 約會類內容；泡泡文字需合規。

### #12 AI 男友（紫黑 + 霓虹粉）
- **手法**：滿版插畫人物、霓虹手寫字「Loves」、聊天泡泡浮出、第 3 張照片拼貼（polaroid 散落）。
- **實作**：`mesh-glass`（粉紫）+ `no-device` + `image`（人物，**需素材**）+ `crop` 泡泡；第 3 張 `scatter`。
- **注意**：🍎 成人內容邊界；AI 生成人物要標。

### #13 Playground AI（淺灰 → 藍）
- **手法**：第 1 張標題 + 4 張 AI 圖片散落 + 圖說 pill；第 2 張乾淨手機；第 3 張圖片卡 + 輸入框 crop；第 4 張手機上半 + 大字在下。
- **實作**：`minimal-light`；`no-device` + `image` ×4 + `stamp pill`；`float`；`bleed-top`。
- **注意**：AI 生成圖需為 app 實際輸出。

### #14 F1 賽事 App（藍黑 + 照片）
- **手法**：**真人／實物照片當背景**（車手、手套握手機）、手機被手套握著（device-in-hand）、第 4 張文字大到出血當背景紋理。Badge「Designed for F1 fans」。
- **實作**：`photo-backdrop` + `bgImage`；device-in-hand = 使用者自己合成的照片當 `bgImage` + `no-device`（我們不合成手）。文字紋理：`elements: text` 放大、`opacity` 在 style 調。
- **注意**：🍎 / 🤖 **F1、車手肖像是第三方商標／肖像權**——非官方 app 會被退。🤖 Play「避免人物與裝置互動」除非核心用法在裝置外。

### #15 AI 歌單（螢光綠 + 黑手機）
- **手法**：螢光綠底 + 黑色無框手機、第 1 張手機內外都是圓形封面、第 3 張 Spotify/Apple Music 等 logo 散落 + 標題在中。底部「Featured in TechCrunch / Fast Company」。
- **實作**：`playful-pop`（`bg:#5CFF8A`, `ink:#000`）+ `frameless-bleed`；`no-device` + `logos`；`elements: logos`（媒體）。
- **注意**：🍎 / 🤖 **第三方服務 logo（Spotify 等）需符合各家品牌規範**，Play 禁未授權商標。

### #16 Anki Pro 字卡（照片 + 藍）
- **手法**：第 1 張手握手機照片 + 桂冠「3 million ANKI PRO USERS」；第 2 張字卡散落（scatter）+ 類別列表；第 4 張「遺忘曲線」圖表 + 人物照片 + 圓形印章 badge。
- **實作**：`photo-backdrop`（手機照片為 `bgImage`）+ `stamp laurel`；`scatter`（字卡 PNG）；`no-device` + `image`（圖表）+ `stamp circle`。
- **注意**：🤖「3 million users」在 Play 不算 "Million Downloads" 但屬誇大風險；🤖 人物握裝置。

### #17 Dive Chat（紅→粉漸層）
- **手法**：第 1 張手機 + 「MAKE MOMENTS HAPPEN」貼紙 + 星等「★★★★½ 500+ Reviews」；第 2 張 3D icon 格 + 兩張放大 icon 卡；第 3 張行事曆 crop + 事件卡 crop；第 4 張聊天 UI 放大（無框）。標題在**下方**，關鍵詞白底 pill（the best）。
- **實作**：`playful-pop`（紅粉 palette）；`bleed-top` + `stars` + `image` 貼紙；`no-device` + `crop` ×2；`frameless-top`。pill 強調 = `::the best::`。
- **注意**：🤖「the best」是 Play 禁語（Best），護欄會擋；🍎 OK。

### #18 Degoo 雲端（淡藍／米白 + 線稿插畫）
- **手法**：**上下二分**：上半標題、下半手機或插畫；圓形黑色戳章「700 million+ registered users」「Trusted by most of the Fortune 500」；偶數張黑底。線稿插畫（人在拍照 / 飛機上）。
- **實作**：`minimal-light` ↔ `dark-pro` 交錯（palette 兩色輪替）；`bleed-bottom` + `stamp circle`；`no-device` + `image`（線稿，**需素材**）。
- **注意**：🤖「700 million+ users」誇大風險；「Fortune 500」需可證。

### #19 家務管理（淡藍／米／灰／紫四色）
- **手法**：每張一個粉彩底色；第 1 張吉祥物插畫 + 使用者引言 + 五星；第 2 張手機 + 圓形「300+ preset tasks」戳章蓋在角落；第 3 張手機 + 成就 badge crop；第 4 張 Memoji 三顆 + 小卡。標題 + 副標兩行。
- **實作**：`pastel-soft` + `palette` 四色；`no-device` + `image`（吉祥物）+ `quote` + `stars`；`bleed-bottom` + `stamp circle`；`float` + `crop`。
- **注意**：🍎 Memoji 是 Apple 資產，避免。

### #20 Drop 現金回饋（粉紅／深藍）
- **手法**：大字左上 + 手機傾斜出血；第 2 張手機被品牌 logo 圓形徽章包圍（ebay / amazon / adidas…）；第 3 張 3D 卡片插畫浮出；斜體 DROP logo。
- **實作**：`pastel-soft`／`dark-pro` 交錯；`tilt-right`；`float` + `elements: image`（圓形 logo 徽章）；`image`（3D 卡片，**需素材**）。
- **注意**：🤖 第三方品牌 logo 需授權；🍎 同。

### #21 M1 AI 電話（淺灰／黑，極簡）
- **手法**：每張頂部 **pill 標籤**（Call Notes / Personal Secretary）→ 標題 → 乾淨手機。第 2 張黑底 + 通話摘要卡 crop 浮在手機前（比手機還大）。
- **實作**：`minimal-light`（奇偶張 `bg` 切換灰／黑）+ `badge`（pill）+ `float`；第 2 張 `float` + `crop`（`width: 1000`）。
- **注意**：🍎 不得模仿系統來電 UI（此組用自家 UI，OK）。

### #22 健康追蹤（黃→藍漸層，第 1 張）
- **手法**：單張長圖：手機 + **Apple Watch 並排**、兩個 Editor's Choice 桂冠、UI 卡片放大格（bento 6 格無框）、第 3 張兩台手機疊。
- **實作**：`bento-dark` 改亮色 → 做一個 `bento-light`；Watch 需要 Watch 框（Koubou 有）→ 可加 `frames.json`；`stamp laurel` ×2。
- **注意**：🍎 Editor's Choice 是 Apple 頒的才能用；🤖 Play 禁 Apple 裝置圖（Watch）。

### #23 健康 App（黃藍漸層，第 2 張）
- **手法**：玻璃罐 3D 插畫裝滿表情貼紙 + 手機在罐內（創意容器）、StandBy 模式手機橫放 + iOS 17 badge、手指點擊 widget。
- **實作**：容器創意 = `image`（罐子 PNG）+ `device` 疊層順序（需素材）；橫向手機：加 landscape frame（Koubou 有）。
- **注意**：🍎「iOS 17」badge 用 Apple 官方樣式需符合規範；🤖 不適用 Play。

### #24 Simple 飲食（米色 + 食物照片）
- **手法**：第 1 張**食物照片滿版** + 對話泡泡 + 標題 + 兩個桂冠（App of the Day / 303,000 reviews）；第 2 張聊天 UI 無框；第 3 張食物照片 + 食物卡 crop；第 4 張手機 + 「Type / Snap / Speak」三個 3D 按鈕浮出。
- **實作**：`photo-backdrop`（米色調）+ `no-device` + `crop` 泡泡 + `stamp laurel` ×2；`frameless-bleed`；`float` + `image` ×3。
- **注意**：🍎 App of the Day 需真的得過；🤖 Play 禁 Apple 獎項（它不認識）。

### #25 Copilot 記帳（洋紅／白／藍）
- **手法**：**UI 重繪放大、完全無手機**：餘額卡片 ×4 疊成一欄、消費列表放大、交易卡散落；第 1 張銀行 logo 圓形徽章散落。每張一個純色。
- **實作**：`artsy-flat`（palette 洋紅／白／藍）+ `no-device` + `crop` ×N（從截圖切卡片）；或 `crop-zoom`。
- **注意**：🤖 完全合規（無框、純 UI）；銀行 logo 是第三方商標。

### #26 Story 製作工具（黑／藍紫）
- **手法**：黑底 + 彩色關鍵詞（collage 青 / Stories 粉 / Widget 青）、大數字 8,560,675 followers 卡片、app icon 圓形排成弧線、「#1 Product of the Day」桂冠 + Product Hunt。
- **實作**：`dark-pro`；`==word==` 多色需支援多個 accent → 在 style 用 `em:nth-of-type(2)` 給 accent2；`stat` 卡；`image` icon 弧線；`stamp laurel`。
- **注意**：🤖 **「#1」Play 禁語**，護欄擋；Instagram / YouTube 商標需授權。

### #27 Allset 餐廳回饋（淺灰 + 紫 pill）
- **手法**：**紫色 pill 高亮關鍵詞**（Save big / on every order / real-time）、手機傾斜 + 食物 3D icon 浮出、第 3 張 15% 卡 crop 放大蓋在手機上。
- **實作**：`minimal-light` + `::word::` pill（新標記）+ `tilt-left` + `image`（食物 icon）+ `crop`。
- **注意**：🤖「Save big / 15% back」屬促銷，Play 對 Discount/Sale 類字眼敏感；護欄不會擋「15%」但文件要提醒。

### #28 Foodvisor（淡綠／米）
- **手法**：第 1 張純文字頁：logo + 標題 + App of the Day / Editor's Choice 桂冠 + 媒體 logo 列（GMA / TIME / Men's Health / Forbes）；第 2 張插畫路徑 + UI 卡 crop；第 3 張食物照片 + 掃描框；第 4 張條碼掃描 + 食物照片。
- **實作**：`pastel-soft`（綠）；**`no-device` + `stamp laurel` ×2 + `logos`**；`no-device` + `image`（插畫）+ `crop`；`photo-backdrop` + `crop`（掃描框）。
- **注意**：🍎 媒體 logo 需授權；🤖 Play 禁第三方商標。

### #29 Zip 先買後付（淡紫 + 線稿 icon）
- **手法**：第 1 張無裝置：手繪線稿 icon（購物袋、帳單、旅行）+ 星星 + 大字；第 2 張**兩台手機上下夾**（上面出血、下面出血，標題在中間）；第 3 張手機 + 付款計畫卡 crop；第 4 張手機 + 卡片 crop。
- **實作**：`pastel-soft`（紫）；`no-device` + `image` 線稿；**新版面 `sandwich`**（上 `frameless-top` + 下 `frameless-bleed` + 文案在中）— 可用 `two-up` 變體做；`bleed-bottom` + `crop`。
- **注意**：🍎 3.1 金融服務需合規揭露；Visa 商標需授權。

### #30 Haptic 日誌（照片 + 深色玻璃卡）
- **手法**：**照片背景 + 半透明深色玻璃面板**裝著 UI 列表（無手機），標題在面板上方；第 4 張玻璃面板 + 白色卡片浮出。極簡、情緒化照片（布料、光軌、樓梯）。
- **實作**：做一個 **`photo-glass` style**：`photo-backdrop` + `mesh-glass` 的 panel 合體，裝置改成 `crop` 放在面板內。`no-device` + `crop`。
- **注意**：照片需授權；🤖 合規（無框）。

### #31 Carrot 購物回饋（橘／淺灰）
- **手法**：第 1 張手握手機照片 + 引言 + 「SHOPPER'S CHOICE」桂冠；第 2 張手機 + 🔥 emoji 標題；第 3 張手機 + 彩帶 + 大數字 55,150；第 4 張品牌 logo 12 格 + 底部 pill CTA「Works wherever you shop」。
- **實作**：`photo-backdrop` + `quote` + `stamp laurel`；`bleed-bottom`；`bleed-bottom` + `image`（彩帶）+ `stat`；`no-device` + `logos`（12 格）+ `stamp pill`。
- **注意**：🤖「90% off deals」= Discount/Sale 類；「Works wherever you shop」像 CTA，🍎 2.3.10 禁 CTA 式文字（Download now 類），此句邊緣；品牌 logo 需授權。

---

### #32 居家服務平台（淺灰／橘）— 來自 Figma「Beautiful App Store Screenshots」檔
- **手法**：暖淺灰底；第 1–2 張無裝置，插畫服務圖示排成格子、用細橘線串起；第 3–4 張無框手機卡，底部露出一排橘色 3D 圖示，加一個大筆刷「6」裝飾。
- **實作**：`minimal-light`，`bg #EDEDEA`、`accent #F39A2B`；`no-device` + `features`（圖片圖示、3 欄）或 `image` 格；`frameless-bleed` + `image` 圖示列；標題左上兩行。
- **注意**：無——真實 UI、無宣稱。

### #33 fams 親子（鮮橘、襯線 + 手寫）
- **手法**：單一飽和橘；粗襯線標題夾一個手寫字（`==support==`）；第 1 張母子照片 + 散落的 emoji 對話泡 + 「#1 Parents super app」桂冠；第 2 張深色手機下方出血；第 3 張插畫卡 scatter；第 4 張手機 + 插畫。
- **實作**：`retro-warm` tokens `bg #F4501E`、`ink #FFF7EA`；`serif-condensed` 型 + Caveat em；`no-device` + `bgImage`（照片）+ `stamp` pill + `stamp laurel`；`bleed-bottom`；`scatter`；`float` + `image`。
- **注意**：🤖「#1」是 Play 禁用最高級；真人照片需授權。

### #34 fams 親子，另一版（黃／粉／深藍 每張一色）
- **手法**：同一 app，每張不同粉彩底（`palette`），重襯線標題；第 1–2 張手機 ±8° 傾斜下方出血，第 2 張加 ★★★★★ + 評論句；第 3 張深藍 + 浮出的 crop 卡；第 4 張粉色 + 對話泡直排（crop）+ 貼紙卡。
- **實作**：`pastel-grain` 配 `palette ["#F6E7A1","#F7D9D9","#1E2447","#F9C8D0"]` + 襯線型；`tilt-left` / `tilt-right`；`stars`；`bleed-top` + `crop`；`no-device` + `crop` × 5。
- **注意**：🤖 又是「#1」；「Feels like I just saved $1,000」是價格宣稱。

### #35 rabbit OS（螢光綠／黑／橘）
- **手法**：三個平塗底（螢光 `#C6FF00`、黑、橘），幾何無襯線只用兩種字級；第 1 張黑底單色等軸線稿插畫；第 2 張白色膠囊列疊品牌 logo（Spotify、Apple Music…）；第 3 張對話泡疊在傾斜黑手機上；第 4 張橘底超大「LAM」+ 旋轉 30° 手機。
- **實作**：`neo-brutalist` tokens `bg #C6FF00`、`ink #000`、`accent #FF5A1F`；每張 `bg`；`no-device` + `image`；`no-device` + `features`（1 欄、圖片圖示）或 `logos`；`tilt-right` + `crop` 泡泡；`persp-right` + `text`（size 260、weight 900）。
- **注意**：🤖🍎 第三方 logo（Spotify、Apple Music、Twitter…）需授權。

---

## 這 31 組共同的「元素層」→ 已做成 `elements`

| 出現次數 | 元素 | `elements.type` | 出處 |
|---|---|---|---|
| 18 組 | UI 碎片浮出手機（卡片、泡泡、按鈕放大） | `crop` | #5 #6 #10 #11 #12 #17 #19 #21 #24 #25 #27 #28 #29 #30 … |
| 12 組 | 社會認證戳章（桂冠、圓形、星等） | `stamp` (laurel/circle/pill), `stars` | #1 #16 #17 #18 #19 #22 #24 #26 #28 #31 |
| 9 組 | 貼紙 / 3D icon / 插畫 | `image` | #2 #4 #7 #8 #9 #12 #18 #20 #24 |
| 6 組 | 品牌 / 媒體 logo 列 | `logos` | #15 #20 #25 #28 #31 |
| 5 組 | 大數字 | `stat` | #1 #10 #26 #31 |
| 4 組 | 引言卡 | `quote` | #5 #19 #31 |
| 4 組 | icon + 文字功能格 | `features` | #3 #10 #16 |
| 9 組 | 無裝置頁（插畫／照片／純文字／logo 牆） | `layout: no-device` | #9 #13 #15 #18 #25 #28 #29 #31 |
| 3 組 | 照片底 + 玻璃面板 | `style: photo-glass`（新） | #30 #14 |
| 2 組 | 上下兩台手機夾文案 | `layout: sandwich`（新） | #29 |

## 審核總表（這 31 組裡會出事的）

- 🤖 Play 禁語命中：#1 "7 million downloads"、#17 "the best"、#26 "#1"、#16/#18 "million users"（誇大）、#27/#31 折扣促銷字眼。→ 護欄已擋前三類；促銷類只提醒。
- 🍎🤖 第三方商標：#14 F1、#15 Spotify/Apple Music、#20/#25/#31 品牌 logo、#26 Instagram/YouTube、#29 Visa、#28 媒體 logo。→ 工具無法判斷，文件要求人類確認授權。
- 🤖 Apple 裝置／獎項出現在 Play：#22 Apple Watch、#24/#28 App of the Day、#23 iOS 17。→ 跨平台框已硬擋；獎項文字在 Play 會被 "Best/Top" 類規則部分攔截，其餘需人工。
- 🤖 人物與裝置互動：#14 #16 #31 手握手機照片。→ Play 建議避免；文件提醒。
- 🍎 截圖須主要顯示 app：#2 #4 #12 插畫佔比過高是風險。

## 📈 與優化文件對照（哪些組做對了）

- 第 1 張先丟痛點／證據：#1（三桂冠）、#24（App of the Day + 303k reviews）、#31（引言 + Shopper's Choice）。
- 一張一訊息、≤8 字：幾乎全部；最好的是 #25（3–4 字）、#21（pill + 一句）。
- 順序是故事：#11（upload → answer → tones → send）、#29（Pay later → where → how split → virtual card）。
- 反例：#26 四張都是功能名詞堆疊；#13 第 1 張 "Create AI art like a pro" 是功能不是結果。
