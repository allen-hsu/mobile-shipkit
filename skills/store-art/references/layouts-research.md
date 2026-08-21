# App Store / Google Play 截圖版型目錄

**調研日期**：2026年8月21日  
**基準尺寸**：1320×2868px (iPhone 6.9")、1320×2796px (iPhone 6.7")、2064×2752px (iPad 13")

---

## 📊 主流版型分類（8-12 種）

### 1. **全出血背景 (Full-Bleed / Panoramic)**

**英文名稱**：Full-Bleed Panoramic  
**中文名稱**：全出血全景背景

**構圖特徵**：
- 裝置框：置中或偏下（40-60% 垂直位置）
- 背景：漸層、情境攝影或插圖橫跨整個螢幕邊界（無安全邊距限制）
- 文案位置：上半部或懸浮於裝置上方
- 多張連續：支援全景模式（panoramic），相鄰截圖的背景無縫接續
- 裝置占比：30-50% 螢幕寬度

**適用場景**：
- 旅遊、生活風格、娛樂、設計類應用
- 品牌故事敍述、情感連結重於功能展示

**知名例子**：Uber Eats、Menulog、Deliveroo、Hello Fresh、Instagram

**合成參數**（基準 1320×2868）：
- 裝置縮放：40-50% (528-660px 寬)
- 文案區高度：20-30% (574-860px)
- 安全邊距：60px（上下）、80px（左右，相對全局）
- 字級建議：
  - 主標題：80-90pt（San Francisco Pro / Inter 700）
  - 副標題：48-56pt（400-500 weight）
  - 最多 6 字/標題

**Apple 審核要點**：
- ✅ 背景必須是實際應用內可見元素或品牌素材
- ✅ 允許濾鏡和漸層疊層於截圖上方
- ⚠️ 不能誤導使用者關於應用實際外觀
- ⚠️ 若使用真人模特，避免冒充用戶或明星代言

**已驗證工具支援**：  
[Previewed](https://previewed.app/app-store-screenshot-generator/)、[Screenshots.pro](https://screenshots.pro/)、[appshots CLI](https://github.com/albertnahas/appshots)

---

### 2. **裝置持握式 (Device-in-Hand)**

**英文名稱**：Device-in-Hand / Handheld Context  
**中文名稱**：實手持握 / 真實情境使用

**構圖特徵**：
- 裝置框：15-20° 傾斜角、陰影效果
- 背景：純色（深色/中性）或淺層漸層
- 文案位置：上方區塊或懸浮
- 多張連續：通常單一設備，不跨螢幕
- 裝置占比：60-70% 螢幕（透視變形）

**適用場景**：
- 金融、生產力、冥想、健身、醫療應用
- 信任感、專業感為優先

**知名例子**：Calm、Headspace、Square Cash、Robinhood、Fitbit

**合成參數**（基準 1320×2868）：
- 裝置縮放：65-75% (858-990px，考慮透視扭曲)
- 文案區高度：20-28% (574-804px)
- 安全邊距：40-50px（因為透視傾斜，上邊界更安全）
- 傾斜角度：15-20° (沿 y 軸)
- 字級建議：
  - 主標題：72-84pt（San Francisco Pro 600-700）
  - 副標題：44-52pt（300-400）
  - 6 字以內

**Apple 審核要點**：
- ✅ 允許藝術性裝置框架和陰影
- ⚠️ 透視必須物理真實（不能超過 30° 變形）
- ✅ 真實人手照片應避免特定識別特徵（用模特手替代）

**已驗證工具支援**：  
[Rotato](https://preview.rotato.app/features)（3D 旋轉）、[AppMockUp Studio](https://app-mockup.com/)、[frames-cli](https://github.com/viticci/frames-cli)

---

### 3. **浮空 UI (Floating UI)**

**英文名稱**：Floating UI / Cropped Screen  
**中文名稱**：介面浮空 / 無框 UI 聚焦

**構圖特徵**：
- 裝置框：無（app UI 直接浮空）
- 背景：純色（高對比）或低飽和漸層
- 文案位置：下方塊狀或側邊標註
- 多張連續：單獨設計，可並排或序列
- 裝置占比：70-90% 螢幕高度

**適用場景**：
- 社交媒體、設計工具、內容平台
- UI 本身具高視覺識別度

**知名例子**：Instagram、Figma、Twitter、TikTok、Dribbble、Pinterest

**合成參數**（基準 1320×2868）：
- UI 尺寸：90-95% 畫布寬 (1188-1254px)
- 文案區高度：15-20% (430-574px，通常在下方)
- 安全邊距：30-40px（上下邊界）、60-80px（左右）
- 字級建議：
  - 標題：64-80pt（Montserrat / Plus Jakarta Sans 700）
  - 說明：40-48pt（400-500）
  - 最多 8 字/行

**Apple 審核要點**：
- ✅ 完全裁切的 app UI 可被 Apple 自動加框
- ⚠️ 不能使用虛假裝置框架冒充真實設備
- ✅ 背景中若有其他應用，需標記清楚

**已驗證工具支援**：  
[appshots CLI](https://github.com/albertnahas/appshots)、[AppScreenStudio](https://www.appscreenstudio.com/)、[AppDrift](https://appdrift.co/screenshot-generator)

---

### 4. **文案主導 (Caption Heavy)**

**英文名稱**：Caption Heavy / Headline Dominant  
**中文名稱**：文案置頂 / 主題標語型

**構圖特徵**：
- 裝置框：下方或角落（15-30% 垂直）
- 背景：純色或漸層
- 文案位置：上方 50-60% 區域，大字標題
- 多張連續：各自獨立主題
- 裝置占比：20-40% 螢幕

**適用場景**：
- 教育、金融、抽象價值主張應用
- 複雜功能簡化敍述

**知名例子**：Duolingo、Revolut、Stripe、Notion、Wave

**合成參數**（基準 1320×2868）：
- 標題區域：50-60% 螢幕高度 (1434-1721px)
- 裝置尺寸：30-40% 寬 (396-528px)
- 裝置距底部：60-100px
- 安全邊距：80-120px（左右邊界給標題留白）
- 字級建議：
  - 主標題：90-110pt（San Francisco Pro / Inter 700-900）
  - 副標題：54-64pt（300-400，較細以區隔）
  - 最多 5 字主標、10 字副標

**Apple 審核要點**：
- ✅ 允許大量留白和排版聚焦
- ⚠️ 文字必須準確反映應用功能，不能誤導
- ✅ 若使用吸引眼球的視覺，確保不會模糊應用本體

**已驗證工具支援**：  
[Figma 社群範本](https://www.figma.com/community)、[Previewed](https://previewed.app/)、[AppScreenStudio](https://www.appscreenstudio.com/)

---

### 5. **社群認證 (Social Proof)**

**英文名稱**：Social Proof / Testimonial  
**中文名稱**：社群驗證 / 用戶見證型

**構圖特徵**：
- 裝置框：中央置中或偏右 (40-50% 水平)
- 背景：品牌色或白色
- 文案位置：左側或分散（評分、引文、下載數）
- 多張連續：不連接
- 裝置占比：40-50%

**適用場景**：
- 成熟應用、已有用戶基數
- 轉換率提升 20-90% 可能

**知名例子**：Slack、Zoom、Airbnb、Booking.com、Spotify

**合成參數**（基準 1320×2868）：
- 裝置寬度：40-50% (528-660px)
- 認證區高度：35-45% (1000-1291px，包括評分+引文)
- 星級圖示尺寸：48-60pt
- 引文文字：40-48pt（斜體 Italic）
- 安全邊距：60-80px（四周）
- 字級建議：
  - 數字統計：80-96pt（San Francisco Pro 700）
  - 引文：42-54pt（400 italic）
  - 最多 15 字/引文

**Apple 審核要點**：
- ✅ 允許用戶評論、獎項、下載統計
- ⚠️ 引用必須真實（檢查可驗證來源或明確標註「代表性評論」）
- ⚠️ 避免使用假頭像或冒充名人

**已驗證工具支援**：  
[Nakxi](https://www.nakxi.com/templates/)、[Screenshots.pro](https://screenshots.pro/)、[AppScreenStudio](https://www.appscreenstudio.com/)

---

### 6. **功能聚焦 (Feature Focus)**

**英文名稱**：Feature Focus / Step-by-Step  
**中文名稱**：單一功能展示 / 逐步教學

**構圖特徵**：
- 裝置框：置中 (40-50% 位置)
- 背景：品牌色漸層或純色
- 文案位置：上方或下方（一行標題+簡短說明）
- 多張連續：支援編號序列 (1, 2, 3...)
- 裝置占比：50-65% 螢幕

**適用場景**：
- 工具類、生產力、健康、遊戲
- 教學新功能或複雜流程

**知名例子**：Adobe Lightroom、Photoshop、Asana、Todoist、Canva

**合成參數**（基準 1320×2868）：
- 裝置寬度：50-65% (660-858px)
- 背景漸層：垂直方向，上色相 > 下色相
- 編號標籤：70-90pt 圓形背景，置頂或頂角
- 字級建議：
  - 標題：68-80pt（San Francisco Pro 600-700）
  - 說明文：40-48pt（300-400）
  - 最多 6 字標題、15 字說明

**Apple 審核要點**：
- ✅ 允許編號、箭頭、高亮區塊指導注意力
- ✅ 序列號應清楚易讀（40pt 以上）
- ⚠️ 指向標記不能遮蓋關鍵 UI

**已驗證工具支援**：  
[AppScreenStudio](https://www.appscreenstudio.com/)、[appshots CLI](https://github.com/albertnahas/appshots)、[AppMockUp](https://app-mockup.com/)

---

### 7. **前後對比 (Before & After)**

**英文名稱**：Before & After / Transformation  
**中文名稱**：對比轉變 / 結果展示

**構圖特徵**：
- 裝置框：二台設備並排（各佔 40-45% 寬）或疊層
- 背景：純色或淺色漸層（強調對比）
- 文案位置：上方（「前」「後」標籤）或中央分隔線
- 多張連續：通常獨立展示
- 裝置占比：80-90% 合計螢幕寬

**適用場景**：
- 健身、美妝、修圖、家居、瘦身應用
- 結果導向的體驗類應用

**知名例子**：Snapsie、Fitness Camera、Progress Snapshot、VSCO、Lightroom Mobile、Facetune

**合成參數**（基準 1320×2868）：
- 左裝置：40-45% 寬 (528-594px)，左對齐
- 右裝置：40-45% 寬，右對齐
- 中央間距：30-50px
- 文案區高度：15-25% (430-715px，置頂)
- 「前」「後」標籤：56-68pt，高對比顏色
- 字級建議：
  - 標籤：56-72pt（San Francisco Pro 600）
  - 上方標題：64-76pt（700）
  - 最多 5 字/標籤

**Apple 審核要點**：
- ✅ 允許真實的轉變結果（用戶進度、編輯結果）
- ⚠️ 健身/美妝應用必須確認使用真實內容或明確標記為示意
- ⚠️ 避免誤導性的誇大效果

**已驗證工具支援**：  
[Figma 範本](https://www.figma.com/community)、[SnapMonk](https://www.snapmonk.com/screenshot-templates/fitness)、[HotPot](https://hotpot.ai/)

---

### 8. **全景連續 (Continuous Panorama)**

**英文名稱**：Continuous Panorama / Gallery Flow  
**中文名稱**：全景無縫 / 連貫視覺敍事

**構圖特徵**：
- 裝置框：相同尺寸跨越多張截圖（像素完美對齐）
- 背景：連貫背景橫跨多張（上下/左右 seamless）
- 文案位置：隨視覺流動，漸進揭露
- 多張連續：必須 2-3 張以上，邊界無違突感
- 裝置占比：50-60% 螢幕高度（每張）

**適用場景**：
- 內容應用、食物配送、旅遊、社交
- 敍事連貫性、鼓勵用戶滑動截圖

**知名例子**：Uber Eats、Sweat、Hello Fresh、Medium、Notion、Airbnb

**合成參數**（基準 1320×2868）：
- **截圖 1** - 頂部文案：標題 80pt，背景上半色系
- **截圖 2** - 中間過度：交界處無明顯分界，設備置中
- **截圖 3** - 底部號召：行動按鈕伪示意，背景下色系
- 設備邊界對齐：
  - 頂部邊緣必須 Y = 340px（假定在所有相鄰截圖中相同）
  - 任何誤差 >2px 將被看出「斷層」
- 安全邊距：100px（橫向），允許 80px（縱向）
- 字級建議：
  - 漸進標題：80-90pt (截圖1) → 60-70pt (截圖2) → 50-60pt (截圖3)
  - 最多 4-6 字/截圖

**Apple 審核要點**：
- ✅ 允許創意連貫設計，鼓勵用戶查看完整集合
- ⚠️ 設備框架對齐必須像素完美
- ✅ 背景可漸層或漸進色系，但過度區域應平滑

**已驗證工具支援**：  
[HotPot Panorama](https://hotpot.ai/blog/how-to-make-app-store-panorama-screenshots)、[Previewed](https://previewed.app/mockups/screenshots/appstore/)、[appframe](https://github.com/andresdefi/appframe)

---

### 9. **品牌情境 (Lifestyle / Branded Context)**

**英文名稱**：Lifestyle Context / Brand Narrative  
**中文名稱**：生活情景 / 品牌故事型

**構圖特徵**：
- 裝置框：斜置或置於情景中（30-50% 佔比）
- 背景：高品質環境攝影或插圖（工作桌、咖啡館、戶外等）
- 文案位置：上方或浮空於背景
- 多張連續：敍事序列（場景 1→2→3 推進故事）
- 裝置占比：30-50%

**適用場景**：
- 生活風格、工作應用、財務、旅遊
- 情感連結、使用情境想像

**知名例子**：Apple Reminders、Splitwise、Tripadvisor、Notion、Arc、Morning Routine

**合成參數**（基準 1320×2868）：
- 背景攝影：60-70% 螢幕（高分辨率 300dpi 最佳）
- 裝置疊層：40-50% 寬 (528-660px)，通常右側或左下角
- 文案區高度：20-25% (574-715px)
- 文案背景：可用半透明遮罩 (黑 40-60% 透明度) 提升易讀性
- 字級建議：
  - 標題：76-88pt（San Francisco Pro 600-700，白色）
  - 副標題：44-52pt（300-400 white）
  - 最多 6 字標題

**Apple 審核要點**：
- ✅ 允許生活情景攝影背景
- ⚠️ 若含人物，避免冒充專業代言人或名人（用隱晦模特）
- ⚠️ 背景應相關且不分散焦點

**已驗證工具支援**：  
[Figma 社群](https://www.figma.com/community)、[Previewed](https://previewed.app/)、[ParthJadhav/app-store-screenshots](https://github.com/ParthJadhav/app-store-screenshots)

---

### 10. **數據視覺 (Data Visualization)**

**英文名稱**：Data Visualization / Chart Focus  
**中文名稱**：數據展示 / 圖表聚焦

**構圖特徵**：
- 裝置框：置中或偏上（60-70% 高度內容區）
- 背景：明亮純色（白或淺灰）
- 文案位置：上方摘要、圖表旁標註
- 多張連續：各異圖表類型序列
- 裝置占比：60-70%

**適用場景**：
- 金融、健康、分析、追蹤應用
- 資料導向決策展示

**知名例子**：Mint、Robinhood、Oura Ring、Strava、Timing、Numbers

**合成參數**（基準 1320×2868）：
- 圖表尺寸：65-75% 螢幕寬度 (858-990px)
- 數據標籤字級：36-48pt（清晰易讀）
- 標題區：20% (574px)
- 圖例/說明：32-40pt
- 安全邊距：60-80px（避免裁切坐標軸）
- 字級建議：
  - 摘要標題：72-84pt（San Francisco Pro 700）
  - 數值標籤：40-48pt（600 monospace 推薦）
  - 說明文：36-44pt（400）

**Apple 審核要點**：
- ✅ 允許真實應用內數據示意
- ⚠️ 金融數據必須真實或清楚標記為示意
- ✅ 圖表應無誤導性（坐標軸清楚、數據源標記）

**已驗證工具支援**：  
[AppScreenStudio](https://www.appscreenstudio.com/)、[ScreenKit Fitness Generator](https://screenkit.tools/tools/fitness-app-screenshot-generator)

---

### 11. **互動引導 (Interactive Flow / Walkthrough)**

**英文名稱**：Interactive Flow / Gesture Callout  
**中文名稱**：互動教學 / 手勢提示

**構圖特徵**：
- 裝置框：置中（40-50% 水平位置）
- 背景：漸層或純色（視覺重點在裝置）
- 文案位置：下方或側邊（步驟編號 + 說明）
- 多張連續：多步驟序列（1→2→3→4），漸進揭露
- 裝置占比：50-65%

**適用場景**：
- 複雜新功能、首次使用教學
- 遊戲、教育、生產力應用

**知名例子**：Duolingo、Slack、Trello、Figma、Procreate

**合成參數**（基準 1320×2868）：
- 裝置寬度：50-65% (660-858px)
- 手勢圖示：80-120px（在裝置上方或側邊）
- 步驟編號圓圈：64-84pt，明亮高對比色
- 文案區：20-25% (574-715px)
- 安全邊距：60px（四周），手勢圖示距離設備 20-30px
- 字級建議：
  - 步驟標題：68-80pt（San Francisco Pro 700）
  - 步驟說明：40-48pt（400）
  - 最多 6 字標題、12 字說明

**Apple 審核要點**：
- ✅ 允許手勢示意（輕點、滑動、長按圖示）
- ⚠️ 手勢圖示應符合 iOS 慣例（不能冒充 Apple 官方）
- ✅ 每步驟應清楚獨立

**已驗證工具支援**：  
[AppScreenStudio](https://www.appscreenstudio.com/)、[Figma 範本](https://www.figma.com/community)

---

### 12. **RTL 本地化版型 (Right-to-Left Localization)**

**英文名稱**：RTL-Aware Layout / Localized Variant  
**中文名稱**：右至左本地化 / 市場專用版

**構圖特徵**：
- 裝置框：鏡像置中（阿拉伯/希伯來市場左對齊設備 ≠ 英文右對齊）
- 背景：針對文化適配（顏色、圖像可能異）
- 文案位置：完全鏡像排列
- 多張連續：全套鏡像（不只文字翻轉）
- 裝置占比：40-60%（與 LTR 版相同比例）

**適用場景**：
- 面向中東、北非、以色列市場的應用
- 要求高信任感的本地化

**已驗證例子**：WhatsApp (AR)、LinkedIn (HE)、Spotify (AR)、Twitter/X (AR/HE)

**合成參數**（基準 1320×2868 + 鏡像）：
- **整體布局鏡像**：包括設備位置、所有 UI 元素、箭頭方向、編號序列方向
- 文案方向：阿拉伯語從右到左，希伯來語從右到左
- 標點符號：阿拉伯文獨特的連接字符（ligatures），希伯來文無
- 字級建議（相同 pt 數）：
  - 主標題：80-90pt（San Francisco Pro 600-700）
  - 副標題：48-56pt（300-400）
  - RTL 字體推薦：
    - 阿拉伯：Segoe UI / Arabic Typesetting / Tahoma
    - 希伯來：Segoe UI / Calibri / Arial

**文化適配（非純技術）**：
- 顏色含義：綠色在海灣地區可能與伊斯蘭象徵關聯（謹慎使用）
- 人物/圖像：選用中東模特代替西方模特
- 數字格式：東阿拉伯數字 (٠١٢) vs. 西阿拉伯數字 (0-9)
- 貨幣符號：若涉及價格，改用本地貨幣 (SAR, AED, ILS)

**Apple 審核要點**：
- ✅ RTL 應用必須有原生 RTL 截圖（不能是 LTR 截圖配阿拉伯文案）
- ⚠️ 半鏡像（只翻轉文字不翻轉 UI）將觸發 Apple 審核拒絕
- ✅ 清楚標記本地化版本（在 App Store Connect 分別上傳各語言套件）

**已驗證工具支援**：  
[ScreenshotFramer CLI](https://github.com/Patrick-Kladek/ScreenshotFramer)（支援 .strings 本地化檔案）、[Figma RTL Plugin](https://www.figma.com/community)、[ParthJadhav/app-store-screenshots](https://github.com/ParthJadhav/app-store-screenshots)（RTL 感知配置）

---

## 📱 尺寸規格與平台限制

### Apple App Store 當前必交尺寸 (2026)

| 裝置 | 尺寸 (px) | 寬高比 | 說明 |
|-----|---------|-------|------|
| **iPhone 6.9"** | 1320×2868 | 11:24 | 新基準（必交） |
| iPhone 6.7" | 1290×2796 | ~11:24 | 舊基準（可替代 6.9") |
| iPhone 6.5" | 1242×2688 | ~9:19.5 | 仍接受 |
| **iPad 13"** | 2064×2752 | 3:4 | 新基準（必交） |
| iPad 11" | 1668×2224 | 3:4 | 舊基準（可替代 13") |

**現行簡化政策**（Apple 2024 更新）：  
- 僅需上傳 **6.9" iPhone 集合 + 13" iPad 集合**
- Apple 將自動縮放至其他舊設備型號
- 不再要求上傳多尺寸組合

**最多截圖**：10 張 + 3 支預覽影片（15-30秒）

---

### Google Play Store 規格

| 項目 | 規格 |
|-----|------|
| **截圖數量** | 最少 2 張，最多 8 張 |
| **檔案格式** | JPEG 或 24-bit PNG（無透明度） |
| **解析度** | 最小 320px，最大 3840px（短邊） |
| **建議尺寸（手機）** | 1080×1920 (9:16) 或 1440×2560 (9:16) |
| **建議尺寸（平板 7")** | 600×1024 (或類似比例) |
| **建議尺寸（平板 10")** | 1024×768 (或 4:3 比例) |
| **Feature Graphic** | **1024×500px** (JPEG/PNG 無透明度) |
| **最大檔案**| 不可超過 8MB |

**轉換率提示**：  
- 最佳化截圖可驅動 **~24.3% 轉換率提升**
- 包含亮色 + 暗色主題版本可提升信任感

---

## 🎨 Feature Graphic 1024×500 構圖最佳實踐

**用途**：Google Play Store 頁面頂部大型橫幅、預覽視頻封面、促銷置頂

**安全區域**：
- 中央 800×400px 為最安全區域（邊緣可能被 UI 遮擋或裁切）
- 避免在 50px 內邊距內放置重要元素

**設計原則**：
1. **簡潔文案**：最多 2-3 行短句（如「5M 用戶信任」、「免費下載」）
2. **高對比**：背景 vs. 前景色差達 AAA 標準（確保行動設備上可讀）
3. **避免播放按鈕遮擋**：若有宣傳影片，半透明播放鈕將覆蓋中央，設計時應避免放置關鍵訊息在中央 300×240px 區域
4. **品牌一致**：與截圖集合主視覺搭配
5. **本地化版本**：建議準備主市場版本（含文字）+ 通用版本（無文字以支援多語言）

**字級範例**（1024×500 基準）：
- 主標題：72-90pt（San Francisco Pro / Montserrat 700）
- 副標題：48-60pt（400）
- 統計數據：64-80pt（Monospace 700）

**已驗證工具**：  
[AppLaunchFlow Feature Graphic Generator](https://www.applaunchflow.com/tools/feature-graphics)、[ScreenKit](https://screenkit.tools/specs/google-play-feature-graphic-size)

---

## 📊 轉換率 & 第一張截圖影響

### 關鍵數據

| 指標 | 數值 | 來源 |
|-----|------|------|
| **最優化截圖轉換率提升** | +18% ~ +60% | SplitMetrics |
| **高效截圖集合平均提升** | +20% ~ +35% | 多家 ASO 調查 |
| **用戶不滑過第1張的比例** | 70% | AppScreenshotStudio |
| **用戶不滑過第3張的比例** | 90% | ASO 研究 |
| **用戶平均停留時間** | ~7 秒 | 應用商店研究 |
| **閱讀描述的用戶** | ~2% (iOS) | Apple 審核指南分析 |
| **第1張加社證元素提升** | +90% (條件性) | SplitMetrics A/B 測試 |
| **季度截圖測試提升** | +20% ~ +30% | SplitMetrics 2025 報告 |
| **本地化轉換提升（非英文市場）** | +15% ~ +40% (可達 +200%) | ZiMAD Magic Jigsaw 案例 |

### 第一張截圖的戰略角色

**核心事實**：
- 第 1-3 張完成 90% 的轉換「決策」
- 大多數用戶在 7 秒內形成下載決定
- **第 1 張直接影響 50-70% 的裝置通過率**

**第 1 張最佳實踐**：
1. **明確傳達核心價值**：一句話說明應用的主要功能（不要模稜兩可）
2. **視覺焦點**：單一清晰的行動召喚或功能示意（不要堆疊太多）
3. **品牌色彩**：立即建立視覺認同（用戶會與 icon 對比）
4. **高對比文字**：80pt+ 主標題，使用明亮前景色
5. **避免通用**：不要用 app icon、公司 logo、登入畫面開頭

**測試建議**：
- A/B 測試第 1 張通常能帶來 **+10% ~ +25% 提升**
- 連同截圖文案進行關鍵字測試（Apple 2025 新增索引截圖字幕功能，可提升關鍵字排名）

---

## 🛠️ 開源 / 免費工具與版型支援

### CLI 優先工具

#### **1. appshots** ⭐ 推薦
- **GitHub**：[albertnahas/appshots](https://github.com/albertnahas/appshots)
- **類型**：CLI + Node.js 庫
- **授權**：MIT
- **支援裝置**：26 個預設（iPhone、iPad、Android、Apple Watch、Vision Pro、Mac、Apple TV）

**主要特性**：
- `npx appshots frame ./screenshots --device iphone-6.9`
- 支援自訂背景漸層、標題、副標題
- `--padding` 配置 (0.08 = 8% 邊距)
- 自動驗證尺寸、透明度、檔案格式
- `appshots.config.ts` 配置檔可重複執行
- **支援版型**：Full-Bleed、Device-in-Hand、Floating UI、Caption Heavy

**合成範例**：
```bash
npx appshots frame ./screenshots \
  --device iphone-6.9 \
  --background "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" \
  --title "Manage Your Time" \
  --title-position top
```

---

#### **2. frames-cli**
- **GitHub**：[viticci/frames-cli](https://github.com/viticci/frames-cli)
- **類型**：CLI
- **授權**：Open Source
- **支援裝置**：Apple 官方設備框（從螢幕像素寬度自動檢測）

**主要特性**：
- 自動化裝置檢測（依截圖尺寸自動選框）
- 支援錄影框架（螢幕錄製）
- 快速批量處理
- **支援版型**：Device-in-Hand、全景化整合

---

#### **3. ScreenshotFramer** (Swift)
- **GitHub**：[Patrick-Kladek/ScreenshotFramer](https://github.com/Patrick-Kladek/ScreenshotFramer)
- **類型**：CLI (Command-line) + Swift GUI
- **授權**：Open Source

**主要特性**：
- 本地化支援（`.strings` 檔案批量翻譯 UI 文案）
- `Screenshot-Framer-CLI` 用於自動化 CI/CD
- 支援文字疊層、自訂背景
- **支援版型**：Caption Heavy、本地化版本、RTL (阿拉伯/希伯來)

**自動化範例**：
```bash
./Screenshot-Framer-CLI --input screenshots.json --output dist/
```

---

#### **4. appframe**
- **GitHub**：[andresdefi/appframe](https://github.com/andresdefi/appframe)
- **類型**：Web UI + 本地 CLI 執行
- **授權**：Open Source

**主要特性**：
- 本地優先（無雲端、無追蹤）
- 拖放式 UI 搭配 CLI 執行
- 支援 Panoramic 模式（多張無縫連接）
- 內建網絡字型，支援全球文案
- **支援版型**：全景、Caption Heavy、Feature Focus

---

### Web / 付費工具（含免費方案）

| 工具 | URL | 免費方案 | 推薦版型 |
|-----|-----|---------|--------|
| **Previewed** | https://previewed.app/ | ✅ 免費（基礎範本） | Full-Bleed、Device-in-Hand、Panoramic |
| **Screenshots.pro** | https://screenshots.pro/ | ✅ 免費版 | 全景、社群認證、本地化 |
| **AppMockUp Studio** | https://app-mockup.com/ | ✅ 免費基礎版 | Caption Heavy、Feature Focus、Data Viz |
| **AppScreenStudio** | https://www.appscreenstudio.com/ | ✅ 免費版（限制） | Feature Focus、互動教學 |
| **HotPot** | https://hotpot.ai/ | ✅ 免費（部分） | Panorama、Before&After |
| **LaunchMatic** | (商業工具) | ❌ | AI 自動生成（快速草稿） |
| **Rotato** | https://preview.rotato.app/ | ✅ 免費基礎版 | 3D Device-in-Hand、動畫展示 |
| **ScreenKit** | https://screenkit.tools/ | ✅ 完全免費 | Fitness、Data Viz、Feature Graphic |

### Figma 社群範本庫

- **主要資源**：https://www.figma.com/community（搜尋「App Store screenshot」）
- **推薦高品質範本**：
  - [500+ App Store Templates](https://www.figma.com/community/file/1471925742378558731/500-app-store-screenshot-templates-for-android-and-ios-apps)（完整分類）
  - [App Store & Play Store Screenshots Template](https://www.figma.com/community/file/1470785181707715005/app-store-and-play-store-screenshot-template)（多平台）
  - 客製化優勢：可直接調整字級、顏色、排版並批量匯出各種尺寸

---

## ⚙️ 合成參數速查表（基準 1320×2868）

### 安全邊距與對齐參考值

| 區域 | 推薦值 (px) | 說明 |
|-----|----------|------|
| **上邊界安全** | 100-120 | 預留 iPhone notch/Dynamic Island |
| **下邊界安全** | 80-100 | home indicator 區域 |
| **左邊界** | 60-80 | 標準邊距 |
| **右邊界** | 60-80 | 標準邊距 |
| **文案背景高度** | 20-30% (574-860px) | 典型文案區域 |
| **設備框中心X** | 660px (50%) | 置中參考 |
| **設備框中心Y** | 1200-1400px | 偏下置中 |

### 字級參考（Adobe Illustrator / Figma 設定）

| 元素 | 小版型 | 標準版型 | 大版型 |
|-----|--------|---------|--------|
| 主標題 | 60-72pt | **80-90pt** | 100-110pt |
| 副標題 | 40-48pt | **48-56pt** | 64-76pt |
| 說明文 | 32-40pt | **40-48pt** | 50-60pt |
| 編號/圓圈 | 56-64pt | **68-80pt** | 80-96pt |
| 圖例/統計 | 36-44pt | **44-52pt** | 56-72pt |

**字體推薦**：
- **標題首選**：San Francisco Pro (Apple官方), Inter, Montserrat (700-900 weight)
- **說明文**：San Francisco Pro (400-600), Poppins, Plus Jakarta Sans
- **RTL**：Segoe UI, Arabic Typesetting (AR), Calibri (HE)
- **CJK**：SF Pro Display (預設支援), DIN Next (中文), Hiragino Sans (日文)

---

## 📋 Apple 審核審查清單

### ❌ 會被拒絕的截圖特徵

- [ ] 非應用實際運行畫面（外部攝影、AI 生成、虛假 mock）
- [ ] 含有誤導性資訊（如虛假評分、下載數、功能展示不符實)
- [ ] 使用 Apple 商標或冒充 Apple 設計風格（藍色漸層、系統字型刻意模擬）
- [ ] 裝置框架是品牌冒充（用真實 Apple frame 無問題，但標誌不能使用）
- [ ] 含有年齡不合適內容（需符合應用內容等級）
- [ ] 冒充名人、公眾人物或造假用戶頭像
- [ ] 在截圖中展示競爭對手應用（可以提及但不能在螢幕中顯示）
- [ ] 含有私人用戶資訊（真實姓名、電話、信用卡）

### ✅ 審核通過的常見做法

- ✅ 官方應用截圖 + 自訂背景、漸層、文案疊層
- ✅ 裝置框架（Apple 官方或商業化合法框架）
- ✅ 真實用戶照片（若獲取同意）或代表性模特
- ✅ 真實用戶評論摘錄或獲授權引文
- ✅ 應用獲得的獎項、下載數、評分（必須真實或標記為示意）
- ✅ 高亮、箭頭、編號指導用戶注意
- ✅ 本地化文案翻譯（需準確）

---

## 📚 調研資源與來源

### 官方文件
1. **Apple App Store Connect Screenshot Guidelines** - [App Store Connect Help](https://help.apple.com/app-store-connect/)
2. **Google Play Console Screenshot Specifications** - [Play Console Help](https://support.google.com/googleplay/android-developer/answer/1078870)

### ASO 權威指南
1. [SplitMetrics ASO Screenshot Guide](https://splitmetrics.com/blog/app-store-screenshots-aso-guide/) - 詳細轉換率研究
2. [AppScreenshotStudio - 2026 Design Guide](https://appscreenshotstudio.com/blog/app-store-screenshots-that-convert-the-2026-design-guide)
3. [Gummicube - ASO Academy](https://www.gummicube.com/blog/aso-academy/)
4. [MobileAction Screenshot Sizes Guide](https://www.mobileaction.co/guide/app-screenshot-sizes-and-guidelines-for-the-app-store/)

### 版型分類資源
1. [AppScreens - Screenshot Patterns Guide](https://appscreens.store/guides/screenshot-patterns) - 四大版型敍事
2. [Shotlingo - 15 Screenshot Examples](https://shotlingo.com/blog/app-store-screenshot-examples-that-convert/) - 實際案例
3. [ScreenMagic - 50 Best Examples](https://appscreenmagic.com/guides/best-app-store-screenshot-examples)

### 工具與社群
1. [Figma Community - App Store Templates](https://www.figma.com/community/) (搜尋「App Store screenshot」)
2. [GitHub - Open Source Screenshot Tools](https://github.com/) (appshots, frames-cli, appframe, ScreenshotFramer)

### 本地化與 RTL
1. [AppScreenshotStudio - RTL Cultural Adaptation](https://appscreenshotstudio.com/blog/app-store-screenshot-cultural-adaptation-rtl-color-imagery-2026)
2. [AppScreens - Localization Guide](https://appscreens.com/blog/how-to-translate-localize-app-store-screenshots)

### 前後對比與特定用途
1. [SnapMonk - Fitness Screenshot Templates](https://www.snapmonk.com/screenshot-templates/fitness)
2. [ScreenKit - Fitness App Generator](https://screenkit.tools/tools/fitness-app-screenshot-generator)
3. [HotPot - Panorama Screenshots](https://hotpot.ai/blog/how-to-make-app-store-panorama-screenshots)

### Feature Graphic 設計
1. [Google Play Feature Graphic Best Practices](https://www.apptamin.com/blog/feature-graphic-play-store/)
2. [AppLaunchFlow - Feature Graphic Generator](https://www.applaunchflow.com/tools/feature-graphics)
3. [ScreenKit Feature Graphic Specs](https://screenkit.tools/specs/google-play-feature-graphic-size)

---

## 🎯 快速決策樹

**選擇合適版型的邏輯**：

```
問：應用是否需要展示真實結果或進度？
├─ 是 → 選「前後對比」(Before & After)
└─ 否 → 繼續

問：應用的核心是視覺化資料還是數字？
├─ 是 → 選「數據視覺」(Data Visualization)
└─ 否 → 繼續

問：應用主要面向新用戶學習曲線陡峭？
├─ 是 → 選「互動引導」(Interactive Flow) 或「功能聚焦」(Feature Focus)
└─ 否 → 繼續

問：應用強調生活型態或品牌故事？
├─ 是 → 選「品牌情境」(Lifestyle) 或「全出血」(Full-Bleed)
└─ 否 → 繼續

問：需要展現用戶信任 / 社群驗證？
├─ 是 → 選「社群認證」(Social Proof)
└─ 否 → 繼續

問：應用的主要價值是一個複雜概念或抽象功能？
├─ 是 → 選「文案主導」(Caption Heavy)
└─ 否 → 繼續

問：需要鼓勵用戶滑動整個截圖集合？
├─ 是 → 選「全景連續」(Continuous Panorama)
└─ 否 → 繼續

問：應用 UI 本身具有高視覺辨識度？
├─ 是 → 選「浮空 UI」(Floating UI)
└─ 否 → 預設選「裝置持握式」(Device-in-Hand) 或「裝置置中」(standard framing)

問：面向阿拉伯、希伯來或其他 RTL 市場？
└─ 是 → 選「RTL 本地化」並準備完整鏡像設計
```

---

## 📌 總結與行動清單

### 核心洞察
1. **版型多樣性**：12 種主流版型涵蓋 80% 應用場景，無需全部採用
2. **首 3 張最重要**：90% 用戶不滑過第 3 張，集中火力在開頭
3. **測試驅動轉換**：A/B 測試單一截圖可獲得 +10% ~ +25% 提升
4. **本地化 ROI 高**：非英文市場投資本地化版本可達 +15% ~ +40% 甚至 +200% 提升
5. **工具自動化**：CLI 工具（appshots、ScreenshotFramer）可實現多語言、多裝置批量生成

### 實施優先級
1. **第 1 優先**：確定應用類型 → 選擇 2-3 核心版型
2. **第 2 優先**：使用開源 CLI 或 Figma 範本建立基礎集合
3. **第 3 優先**：準備 A/B 測試版本（標題、圖像變體）
4. **第 4 優先**：本地化關鍵市場（中文、日文、阿拉伯文等）
5. **第 5 優先**：定期更新（季度 1-2 次） + 監測轉換率

### 推薦工具堆棧
- **CLI 自動化**：`appshots` (通用) + `ScreenshotFramer` (本地化)
- **設計階段**：Figma 社群範本 + 自訂
- **預覽/測試**：Previewed 或 Screenshots.pro
- **3D 展示**：Rotato (如有預算)
- **驗證**：appshots validate + Apple App Store Connect 預覽

---

**報告編製完成**  
*基於 2024-2026 最新 ASO 研究、官方指南與開源工具檢驗*
