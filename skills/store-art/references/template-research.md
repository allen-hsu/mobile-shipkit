# 高品質 App Store/Google Play 截圖模板研究報告

**研究日期**: 2026 年 8 月  
**目標**: 尋找可程式化、支援 JSON/YAML 批次驅動、支援 CJK 字型的截圖模板系統  
**技術棧**: HTML/CSS (Next.js/React) + Playwright 或 Figma API

---

## 1. 開源 HTML/CSS/React 截圖模板 Repository

### 1.1 **ParthJadhav/app-store-screenshots** ⭐ 推薦度：高

**連結**: https://github.com/ParthJadhav/app-store-screenshots

**核心特徵**:
- ⭐ **星數**: 6.4k (最多的開源項目)
- 📜 **授權**: MIT License
- 🎨 **版型數量**: 7 個主要版型 + 6 種風格組合 (clean-light, dark-bold 等)
- 📱 **設備支援**: iOS (多尺寸), iPad, Android Phone, Android Tablet, Play Store 功能圖
- 📋 **配置方式**: **JSON** (app-store-screenshots.json) - 含 app name, active platform, locales, theme, slides, transforms
- 💬 **多語言**: ✅ RTL-aware 且 multi-locale 支援
- 🈳 **CJK 字型**: 未明確支援，但可擴展
- 🌐 **技術**: React + Tailwind + Node.js

**優勢**:
- 連線版畫布編輯器（跨越相鄰截圖的元素）
- 一鍵匯出店鋪標準尺寸 PNG
- 完整的項目狀態持久化
- AI-friendly JSON 結構（可用 Claude 直接編輯生成）

**劣勢**:
- CJK 字型不是一級支援
- 版型數量有限（7 個主版型）

---

### 1.2 **Snapframe** ⭐ 推薦度：中高

**連結**: https://github.com/Pawandeep-prog/Snapframe

**核心特徵**:
- ⭐ **星數**: 278
- 📜 **授權**: MIT License
- 🛠️ **技術**: React 19 + Vite + Tailwind CSS 4 + Zustand
- 📋 **配置方式**: **JSON** (完整 schema 在 JSON_SCHEMA.md)
- 🎨 **版型**: Professional Templates (具體數量未明確)
- 🖼️ **匯出**: PNG, JPG, ZIP (高品質)
- 🔄 **特色**: Undo/Redo 支援、離線優先、AI 工作流友善

**優勢**:
- JSON Editor：可直接貼 JSON，即時預覽
- 完全 AI 驅動工作流（copy JSON → Claude/ChatGPT → paste response）
- 現代技術棧，易於擴展
- GitHub Pages 示範版本

**劣勢**:
- 星數少（278 vs 6.4k）
- 版型數量不清楚
- Chrome 支援優秀，Firefox 有渲染問題
- CJK 字型未提及

---

### 1.3 **Koubou** ⭐ 推薦度：中高

**連結**: https://github.com/bitomule/Koubou

**核心特徵**:
- ⭐ **星數**: 198
- 📜 **授權**: MIT License
- 🎨 **設備框**: **100+ 設備** (iPhone 16 Pro, iPad Air M2, MacBook Pro, Apple Watch Ultra)
- 📝 **配置方式**: **YAML** (declarative, 來自 Xcode xcstrings)
- 🌐 **渲染**: Playwright Chromium + HTML/CSS templates (live preview + hot reload)
- 💬 **多語言**: ✅ Multi-Language Localization (xcstrings format)
- 🈳 **CJK 字型**: ✅ **支援** (`font_family` parameter 可接受系統字型或 .ttf/.otf/.ttc 路徑)
- 🎨 **背景**: 支援線性/徑向/圓錐漸層

**優勢**:
- **YAML 優先** - 宣告式、易讀、版本控制友善
- **100+ 設備框** - 業界最多
- **本地字型支援** - CJK 友善
- 可集成 HTML/CSS 自訂模板
- 熱重載 + 實時預覽

**劣勢**:
- 星數較少 (198)
- YAML 不如 JSON 易於 AI 直接生成
- 版型數量需自行設計

---

### 1.4 **YUZU-Hub/appscreen** ⭐ 推薦度：中

**連結**: https://github.com/YUZU-Hub/appscreen

**核心特徵**:
- ⭐ **星數**: 2.0k
- 📜 **授權**: MIT License
- 🌐 **部署**: 零安裝線上版 (yuzu-hub.github.io/appscreen)
- 📱 **設備**: iPhone 6.9", 6.7", 6.5", 5.5" + iPad 12.9", 11" + 自訂尺寸
- 💻 **技術**: Vanilla JavaScript + HTML5 Canvas + Three.js + IndexedDB
- 🔤 **字型**: 1500+ Google Fonts (但 CJK 支援不明確)
- 🤖 **AI 翻譯**: 支援 Claude/OpenAI/Google AI
- 📦 **批量**: ZIP 匯出所有截圖

**優勢**:
- 開箱即用，無需安裝
- Three.js 3D 支援
- AI 翻譯集成
- Docker 容器化

**劣勢**:
- 無 JSON 配置文件格式記載
- CJK 支援不明確
- 版型靈活性不清

**MCP 擴展**: [AppSolves/appscreen-mcp](https://github.com/AppSolves/appscreen-mcp) - 提供 MCP server，讓 Claude/Codex 可程式化控制

---

### 1.5 **Yesno-Labs/app-store-screenshot-generator**

**連結**: https://github.com/Yesno-Labs/app-store-screenshot-generator

**核心特徵**:
- ⭐ **星數**: 32
- 📜 **授權**: MIT License
- 🛠️ **技術**: React + Next.js + TypeScript + Tailwind CSS + Firebase
- 📋 **配置**: `.env.example` (無 JSON schema 文件)
- 🌐 **備註**: 由 Cursor + Claude 3.7 Sonnet 生成

**優勢**:
- Next.js 技術棧，易於部署到 Vercel
- TypeScript 型安全

**劣勢**:
- 星數少，社群活躍度低
- 無明確配置或版型文件
- CJK 無提及

---

### 1.6 **solesby/appshots**

**連結**: https://github.com/solesby/appshots

**核心特徵**:
- ⭐ **星數**: 7
- 📜 **授權**: MIT License
- 🛠️ **技術**: Bash + ImageMagick (convert 命令)
- 📝 **配置**: Tab-delimited `appshots.txt`
- 📱 **設備**: iPhone 3.5"—6.5", iPad, Apple TV, Apple Watch
- 🌐 **輸出**: HTML 預覽 + 生成的設備截圖
- 🈳 **CJK**: Unimplemented (`lang` 參數已定義但未實作)

**優勢**:
- 輕量級，無依賴
- 易於集成到 CI/CD

**劣勢**:
- 星數極少
- Bash 腳本，不夠現代化
- CJK 未支援
- 靈活性有限

---

### 1.7 **其他 Repo 比較**

| Repo | Stars | 技術 | 配置 | 版型數 | CJK | JSON/YAML | 推薦度 |
|------|-------|------|------|--------|-----|-----------|--------|
| ParthJadhav | 6.4k | React | JSON ✅ | 7+6 | ❌ | JSON | ⭐⭐⭐ |
| Snapframe | 278 | React+Vite | JSON ✅ | ? | ❌ | JSON | ⭐⭐⭐ |
| Koubou | 198 | Playwright | YAML ✅ | 100+ | ✅ | YAML | ⭐⭐⭐ |
| YUZU-Hub | 2.0k | Vanilla JS | 無 | ? | ❌ | 否 | ⭐⭐ |
| Yesno-Labs | 32 | Next.js | 否 | ? | ❌ | 否 | ⭐ |
| appshots | 7 | Bash | Text | ? | ❌ | 否 | ⭐ |

---

## 2. Figma Community 免費模板

### 2.1 高流量模板（無詳細點讚數，但活躍度高）

#### **500+ App Store Screenshot Templates** ⭐ 最大合集

**連結**: https://www.figma.com/community/file/1471925742378558731/500-app-store-screenshot-templates-for-android-and-ios-apps

**特徵**:
- 📱 **版本數**: 500+ 模板
- 📐 **尺寸**: iPhone, iPad, Android 手機, Android 平板
- ✏️ **可客製**: 顏色、漸層、文字、字型、嘲笑圖
- 📜 **授權**: **未確認** (通常 Figma Community 預設為 CC BY 4.0)
- 🎨 **風格**: 多樣（bento, editorial, 3D 等可見）

---

#### **FREE App Store Screenshot Templates**

**連結**: https://www.figma.com/community/file/1256854154932829222/free-app-store-screenshot-templates

**特徵**:
- 📜 **授權**: **CC BY 4.0** ✅
- 🎯 **目標**: Apple App Store + Google Play Store
- ✨ **設計質量**: 專業級，提升 app 可見性

---

#### **Play Store / App Store Screenshots (Fabled Studio)**

**連結**: https://www.figma.com/community/file/1362938662992433314/play-store-app-store-screenshots-free-fabled-studio

**特徵**:
- 📜 **授權**: **CC BY 4.0** ✅
- 🎨 **主題**: 5 個主題
- 🔄 **工作流**: "Replace with your design" 框架
- 💡 **使用**: 適合快速原型

---

#### **Free App Store & Play Store Screenshot Template**

**連結**: https://www.figma.com/community/file/1567178403275769113/free-app-store-play-store-screenshot-template

**特徵**:
- 📜 **授權**: **CC BY 4.0** ✅
- 🎨 **裝置**: iPhone, iPad, Android 手機, Android 平板
- 🔧 **自訂**: 所有視覺元素完全可修改

---

#### **App Store and Play Store Screenshot Template**

**連結**: https://www.figma.com/community/file/1470785181707715005/app-store-and-play-store-screenshot-template

**特徵**:
- 📜 **授權**: **CC BY 4.0** ✅
- 📐 **尺寸**: 6.7", 6.5", 6.1", 5.5", iPad Pro 12.9"
- 🔧 **客製**: 視覺元素、顏色、漸層、文字、字型

---

#### **其他優質模板**

- **[App Store Screenshot Template (aso.dev)](https://aso.dev/figma/screenshot-template/)** - 支援 iPhone, iPad, MacBook，含本地化 + 快速批量匯出
- **[Appstore and Google Play Screenshot Templates](https://www.figma.com/community/file/1470068538633644101/appstore-and-google-play-screenshot-templates)** - CC BY 4.0，多尺寸支援
- **[App Store Screenshots](https://www.figma.com/community/file/1071476530354359587/app-store-screenshots)** - 簡潔設計
- **[Template for App Store Screenshots](https://www.figma.com/community/file/891325178364097650/template-for-app-store-screenshots)** - 經典模板，久經考驗
- **[iOS / iPadOS / visionOS App Store Template](https://www.figma.com/community/file/1288121980561553565/ios-ipados-visionos-app-store-template)** - 支援最新蘋果生態
- **[App Store Previews/Screenshots](https://www.figma.com/community/file/1453702045950213611/app-store-previews-screenshots)** - 全面預覽設計

---

### 2.2 Figma 模板授權小結

**通用授權**: 大多數 Figma Community 截圖模板採用 **CC BY 4.0**，允許：
- ✅ 自由使用、修改、商用
- ✅ 無需請求許可
- ⚠️ 須標明原作者（可選，商用時建議）

---

## 3. 商業工具的免費模板庫

### 3.1 **AppMockUp Studio** - 最簡易

**連結**: https://app-mockup.com/

**特徵**:
- 💰 **價格**: 免費 (Web 版)
- 🎯 **用戶**: 初學者導向
- 🌐 **方式**: 瀏覽器內使用，無登錄
- 🎯 **流程**: 選模板 → 拖入截圖 → 匯出
- 📤 **匯出**: PNG/JPG，可移除浮水印（付費）
- 🔌 **可程式化**: ❌ 無 API

---

### 3.2 **Screenshots.pro** - 自動尺寸調整

**連結**: https://screenshots.pro/

**特徵**:
- 💰 **價格**: 免費方案（有浮水印或匯出限制）
- 📱 **自動尺寸**: 自動調整 iOS & Android 不同尺寸
- 🔌 **可程式化**: ❌ 無 API，網頁介面手動使用
- 📋 **模板庫**: [https://screenshots.pro/templates](https://screenshots.pro/templates)

---

### 3.3 **Hotpot.ai** - AI 輔助

**連結**: https://hotpot.ai/app-store-screenshot-generator

**特徵**:
- 💰 **價格**: 免費基礎版 (浮水印自動移除)
- 🎨 **功能**: 拖放設計、裝置嘲笑圖、社交範本
- 🔧 **編輯**: 字型、背景色、線高、字母間距、陰影
- 📤 **匯出**: PNG/JPG (69% 用戶選 PNG)
- 🔌 **可程式化**: ❌ 無 API

---

### 3.4 **LaunchMatic** - 設計師友善

**連結**: https://www.launchmatic.app/

**特徵**:
- 💰 **價格**: 免費設計，匯出 $5/裝置
- 🎨 **模板**: 由 UIX 設計師 + ASO 營銷人員製作
- 📤 **匯出**: ZIP 檔 (支援多裝置)
- 🔌 **可程式化**: ❌ **無 API**，純網頁界面
- 🔄 **工作流**: 完全手動

---

### 3.5 **Rotato** - Mac 專業版

**連結**: https://rotato.app/ (非官方)

**特徵**:
- 💰 **價格**: ~$69–99 (一次性)
- 💻 **平台**: Mac 專用桌面應用
- 🎬 **特色**: 電影質感旋轉動畫
- 🔌 **可程式化**: ❌ 無 API
- ⚠️ **特性**: 電影級截圖效果，但無批量自動化

---

### 3.6 **AppLaunchpad** - 開源社群版

**連結**: https://theapplaunchpad.com/

**特徵**:
- 💰 **價格**: 免費
- 📚 **資源**: 提供部落格文章 + 比較指南
- 🔌 **可程式化**: ❌ 無 API

---

### 3.7 商業工具小結

| 工具 | 價格 | 平台 | 可程式化 | 最佳用途 |
|------|------|------|---------|---------|
| AppMockUp | 免費 | Web | ❌ | 快速原型 |
| Screenshots.pro | 免費/付費 | Web | ❌ | 自動尺寸調整 |
| Hotpot.ai | 免費 | Web | ❌ | AI 輔助設計 |
| LaunchMatic | 免費/付費 | Web | ❌ | 設計師工作流 |
| Rotato | $69–99 | Mac | ❌ | 電影級動畫 |
| AppLaunchpad | 免費 | Web | ❌ | 教育 + 社群 |

**結論**: 所有商業工具皆**無 API**，不支援程式化批次處理。

---

## 4. 設計靈感來源 - 公認截圖做得好的 App

### 4.1 Duolingo
**連結**: https://apps.apple.com/us/app/duolingo-language-lessons/id570060128

**版型/文案策略**:
- 🎯 **標題**: "學語言最有趣、免費的方式" (benefit-driven)
- 🎨 **設計**: 鮮豔色彩、插圖角色、故事化進度
- 📊 **第一張**: 縱隊進度而非課程 UI
- 💡 **關鍵**: 樂趣 + 成就感，不是功能陳列

---

### 4.2 Notion
**連結**: https://apps.apple.com/us/app/notion-notes-projects-wikis/id1232780281

**版型/文案策略**:
- 🤔 **策略**: 不解釋功能，而是提問和個性化
- 🎯 **第一張**: 聰明問題 → 即時生成客製化工作區
- 💡 **關鍵**: 移除「空白頁焦慮」，讓用戶感覺立即有成就

---

### 4.3 Headspace
**連結**: https://apps.apple.com/us/app/headspace-meditation-sleep/id493145008

**版型/文案策略**:
- 🧘 **標題**: "找到你的寧靜空間" / "睡得更好，活得更好"
- 🎨 **設計**: 寧靜插圖背景、最小 UI、柔和配色
- 📿 **特色**: 動畫角色插圖 + 溫柔標題
- 💡 **關鍵**: 感受優於功能，視覺強化心理狀態

---

### 4.4 Things 3
**連結**: https://apps.apple.com/us/app/things-3/id904280696

**版型/文案策略**:
- 📸 **第一張**: 純 App UI，無框架、無標題、無背景
- 🎯 **策略**: 讓 UI 本身說話，優雅極簡
- 💡 **關鍵**: 編輯選擇獲獎者用此方法（Things 3 - Productivity #3）

---

### 4.5 Bear
**連結**: https://apps.apple.com/us/app/bear/id1091541577

**版型/文案策略**:
- 🏆 **獲獎**: App Store Editors' Choice 獨立應用
- 📋 **4 大設計模式**: 有具體設計分解和教訓
- 💡 **資源**: [Bear App Store Screenshots - ScreenMagic](https://appscreenmagic.com/top-screenshots/bear)

---

### 4.6 Halide (Mark III)
**連結**: https://apps.apple.com/us/app/halide-mark-iii-pro-camera/id885697368

**版型/文案策略**:
- 🏆 **獲獎**: Apple Design Award Winner + Editors' Choice
- ⭐ **評分**: 24,000+ 五星評價
- 📸 **焦點**: 專業攝影功能，視覺品質優先
- 💡 **關鍵**: 高品質視覺，技術導向用戶

---

### 4.7 Flighty
**連結**: https://apps.apple.com/us/app/flighty-live-flight-tracker/id1581830216

**版型/文案策略**:
- 🏆 **獲獎**: Apple Design Award for Interaction (互動設計獎)
- ✈️ **設計**: 美麗飛行追蹤 + 旅行規劃師 + 機場導航
- 🔴 **特色**: Live Activities + Dynamic Island 支援
- 💡 **關鍵**: 互動優先，細節動畫

---

### 4.8 Copilot Money
**連結**: https://apps.apple.com/us/app/copilot-track-budget-money/id1447330651

**版型/文案策略**:
- 🏆 **獲獎**: Apple Design Award 入選者
- 💰 **策略**: 信任 + 資料透明度
- 🔐 **第一步**: 讓用戶先手動新增帳戶，再要求敏感憑證
- 📊 **設計**: 乾淨、資料豐富、可信任的介面
- 💡 **關鍵**: 心理信任優先於功能展示

---

### 4.9 Calm
**連結**: https://apps.apple.com/us/app/calm-sleep-relax-meditate/id571800810

**版型/文案策略**:
- 🌿 **視覺**: 和平自然圖像（風景、天空）
- 🎯 **標題**: "睡得更好，感覺更好"
- 🧘 **焦點**: 冥想 + 睡眠 + 放鬆
- 💡 **關鍵**: 與 Headspace 類似，情感優先

---

### 4.10 Spotify
**連結**: https://apps.apple.com/us/app/spotify-music-and-podcasts/id324684580

**版型/文案策略**:
- 🎵 **排名**: Music 類別 #1
- 🎯 **標題**: 簡潔，強調音樂發現 + 個人化
- 📸 **策略**: 正常說明 screenshot + 上方品牌化處理
- 💡 **關鍵**: 結合設計 + 品牌 + 文案

---

### 4.11 其他參考

- **Instagram** (#2 Photo & Video)
- **Strava** (#1 Health & Fitness)
- **Canva** (#4 Photo & Video)

**通用原則**:
1. 第一張回答 "這是什麼？誰的？" → 結合品牌 + app 身份
2. 第二張開始 "能做什麼？" → 展示主要功能 + 好處
3. 九成情況下，英雄元素是 **benefit-driven headline**（承諾結果，而非列功能）
4. 最小主義尺度：有些 app（Things, Instagram）純 UI 無標題，讓產品說話

---

## 5. 推薦組合：兩週內建立的最優方案

### 5.1 選擇標準

**需求再確認**:
- ✅ 6–8 種風格明顯不同
- ✅ JSON/YAML 批次驅動
- ✅ 中日英支援 (CJK)
- ✅ 程式化產圖
- ⏰ **時間限制**: 2 週內

---

### 5.2 推薦組合方案

#### **方案 A：本地 HTML/CSS + Playwright (推薦度：⭐⭐⭐)**

**基底框架**: [**Koubou**](https://github.com/bitomule/Koubou)

**理由**:
- ✅ YAML 配置 (宣告式、易版本控制)
- ✅ 100+ 設備框 (充分)
- ✅ **CJK 字型原生支援** (✅ 大加分)
- ✅ Playwright 渲染 + HTML/CSS 自訂 (靈活)
- ✅ 熱重載 + 實時預覽 (開發快速)

**視覺參考**: Figma 社群模板
- **500+ App Store Screenshot Templates** (提取 bento, editorial, 3D, pastel, dark 風格)
- **Fabled Studio 的 5 主題** (借鑒色彩 + 排版)
- **FREE App Store Screenshot Templates** (專業級背景漸層)

**自行補充** (2 週內可完成):
1. **6–8 風格 preset**: 定義 YAML 變數 (gradient, color-scheme, font-stack)
   - Light editorial (Notion 風)
   - Dark bold (modern)
   - Bento grid (app showcase)
   - Pastel playful (Duolingo 風)
   - 3D card (premium)
   - Minimal (Things 風)
   - Illustrated (Headspace 風)
   - Gradient cinematic

2. **CJK 字型集成**:
   - 加入開源字型: Noto Sans CJK (Google)
   - 或使用系統字型 (macOS: PingFang, Heiti)
   - 在 YAML `font_family` 欄位指定

3. **JSON 中介層** (可選):
   ```bash
   JSON → YAML converter (python script)
   # 讓 Claude 生成 JSON，轉為 Koubou YAML
   ```

4. **批量渲染**:
   ```bash
   for screenshot in screenshots/*.yaml; do
     koubou generate $screenshot --output dist/
   done
   ```

**優勢**:
- ✅ CJK 原生支援（不是後補）
- ✅ 開源 (MIT)
- ✅ 100+ 設備
- ✅ 可完全自訂 HTML/CSS
- ✅ YAML 版本控制友善

**劣勢**:
- YAML 不如 JSON 直觀
- 需自行設計 6–8 風格

---

#### **方案 B：React UI + JSON Export (高互動度，中等難度)**

**基底框架**: [**Snapframe**](https://github.com/Pawandeep-prog/Snapframe) 或 [**ParthJadhav/app-store-screenshots**](https://github.com/ParthJadhav/app-store-screenshots)

**技術棧**: React 19 + Vite + Tailwind CSS + JSON Schema

**視覺參考**: 同上

**自行補充**:
1. 擴展版型數: 7 → 8–10 (目前缺 bento, 3D, pastel)
2. CJK 字型整合: 加入 Noto Sans CJK 到 Tailwind font-family
3. JSON schema 驗證 (JSON Schema v7)
4. 批量匯出指令碼 (Node.js)

**優勢**:
- ✅ JSON 配置（AI 易生成）
- ✅ 互動式編輯器
- ✅ 龐大星數社群 (6.4k)
- ✅ 現代技術棧

**劣勢**:
- ❌ CJK 不是一級支援（需自行集成）
- ❌ 版型數有限（需自行增加）

---

#### **方案 C：Figma API 驅動批量匯出 (最視覺友善，無程式碼複雜度)**

**基底**: Figma 設計 + [Figma API](https://www.figma.com/developers) + Node.js export script

**視覺資源**:
- 直接複製 **500+ App Store Screenshot Templates** 進自有 Figma project
- 提取 8 風格變體為分離頁面
- 使用 Figma Components + variants (light/dark/bento/etc.)

**工作流**:
1. 在 Figma 設計 8 風格主版本
2. 寫 Node.js 腳本：讀 Figma API → 批量改文本 → 導出 PNG
3. 用 Claude 直接操作 API (結合 [Figma MCP](https://github.com/figma/mcp-server-figma))

**優勢**:
- ✅ 設計師友善（Figma UI）
- ✅ Figma 社群 8+ 風格現成
- ✅ CC BY 4.0 授權（無顧慮）
- ✅ 可程式化匯出 (API)
- ✅ 完整視覺控制

**劣勢**:
- ❌ 字型：Figma 預設字型支援不是 CJK 優先（需 Google Fonts)
- ⚠️ CJK 在 Figma 中需要特別配置
- ⏰ 8 風格手工設計仍需時間（但有 500+ 模板參考)

---

### 5.3 **最終推薦：方案 A (Koubou) + 方案 C (Figma 參考)**

#### **執行計畫 (2 週)**

**第 1 週：架構 + 視覺參考**
- Day 1–2: 
  - Clone [Koubou](https://github.com/bitomule/Koubou)
  - 安裝依賴，跑 demo
  - 理解 YAML 結構 + Playwright 渲染流程
  
- Day 3–4:
  - 進 Figma Community 複製頂級模板到自有專案
  - 提取 8 個視覺風格的顏色/排版規則
  - 建立風格 guideline 文件 (Figma 或 Markdown)
  
- Day 5–7:
  - 擴展 Koubou 模板：新增 8 個 YAML preset （light-editorial, dark-bold, bento, pastel, 3D, minimal, illustrated, cinematic）
  - 集成 Noto Sans CJK (Google Fonts 或本地 .ttf)
  - 寫 shell 批量渲染腳本

**第 2 週：整合 + 測試**
- Day 8–10:
  - 建立 JSON → YAML 轉換器 (Python 或 Node.js)
  - 實作 AI workflow: Claude → JSON → YAML → Koubou render
  - 測試各語言 (簡中、日文、英文)
  
- Day 11–12:
  - 製作 6–8 個完整示例專案 (不同 app 類型)
  - 設計 CLI 工具: `koubou-batch --config all-apps.yaml`
  - 文件 + README
  
- Day 13–14:
  - 測試 & 修復 bug
  - 性能最適化 (Playwright headless)
  - 內部示範

---

### 5.4 技術棧最終方案

```
┌─────────────────────────────────────────────────┐
│  User Input (JSON)                              │
│  - app name, copy, colors, fonts, layout        │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│  JSON Schema Validator (Ajv)                    │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│  JSON → YAML Converter                          │
│  (Python script or zx task)                     │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│  Koubou YAML                                    │
│  + 8 presets (light, dark, bento, etc.)         │
│  + CJK fonts (Noto Sans CJK)                    │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│  HTML/CSS Templates (customizable)              │
│  + Playwright Chromium Renderer                 │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│  PNG/JPG Output                                 │
│  (device-framed, store-ready sizes)             │
└─────────────────────────────────────────────────┘
```

**技術細節**:
- **Koubou**: YAML config + Playwright
- **字型**: Noto Sans CJK (Google, free) + Noto Sans (拉丁)
- **顏色**: CSS 變數 (由 YAML 驅動)
- **設備**: 100+ frames (Koubou built-in)
- **批量**: Bash loop + parallel (GNU parallel)
- **AI 整合**: 用 Claude Code 或 Cursor 直接編輯 JSON → YAML

---

### 5.5 缺什麼要自己補

| 項目 | 現狀 | 補充方案 |
|------|------|---------|
| **6–8 風格** | Koubou 無預設多風格 | 自己定義 8 個 YAML preset + CSS 主題變數 |
| **CJK 字型** | Koubou 支援但預設缺 | 加入 Noto Sans CJK (Google Fonts) |
| **JSON 批量** | Koubou YAML 優先 | 寫轉換器: JSON → YAML |
| **Figma 匯出** | 無直接集成 | 用 Figma API (separate workflow) 或視覺參考 |
| **CLI 工具** | Koubou 有基礎 | 包裝成批量 CLI: `batch-render --config apps.json` |
| **動畫/視頻** | Koubou 無動畫 | 暫不支援（可用 Rotato 補 or Figma video export） |

---

## 6. 快速決策矩陣

| 評分項 | Koubou | Snapframe | YUZU-Hub | Figma |
|-------|--------|----------|---------|-------|
| **CJK 支援** | ⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐ |
| **可程式化** | ⭐⭐⭐ (YAML) | ⭐⭐⭐ (JSON) | ⭐⭐ | ⭐⭐⭐ (API) |
| **版型多樣** | ⭐⭐⭐ (100+ device) | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ (500+) |
| **實時預覽** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **社群/star** | ⭐⭐ (198) | ⭐⭐⭐ (278) | ⭐⭐⭐ (2.0k) | ⭐⭐⭐⭐ (N/A) |
| **開源度** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ❌ (Figma 專有) |
| **授權** | MIT | MIT | MIT | CC BY 4.0 |
| **2週內完成難度** | ⭐⭐ (中) | ⭐⭐⭐ (低) | ⭐⭐ (中) | ⭐⭐⭐ (低—設計導向) |

---

## 7. 終極建議

### **選 Koubou，因為：**
1. ✅ **CJK 原生** — 一級支援，不是後補
2. ✅ **100+ 設備** — 業界最多選擇
3. ✅ **YAML 優先** — 版本控制友善，易於 CI/CD
4. ✅ **Playwright** — 可完全自訂 HTML/CSS，上限無限
5. ✅ **MIT 開源** — 商用無顧慮
6. ✅ **熱重載** — 開發快速

### **輔以 Figma 視覺參考，因為：**
1. ✅ **500+ 現成模板** — 免費借鑒風格
2. ✅ **CC BY 4.0** — 可商用、可修改
3. ✅ **設計師友善** — 團隊可視覺確認
4. ✅ **Figma API** — 可程式化批量匯出（未來擴展）

### **2 週執行計畫**
1. **第 1 週**: Koubou 基礎 + 8 風格 YAML preset + CJK 集成
2. **第 2 週**: JSON converter + batch CLI + 示例 + 文件

---

## 參考資料

### 開源 Repos
- [ParthJadhav/app-store-screenshots](https://github.com/ParthJadhav/app-store-screenshots) (6.4k ⭐)
- [Snapframe](https://github.com/Pawandeep-prog/Snapframe) (278 ⭐)
- [Koubou](https://github.com/bitomule/Koubou) (198 ⭐, **推薦**)
- [YUZU-Hub/appscreen](https://github.com/YUZU-Hub/appscreen) (2.0k ⭐)

### Figma 社群模板
- [500+ App Store Screenshot Templates](https://www.figma.com/community/file/1471925742378558731/500-app-store-screenshot-templates-for-android-and-ios-apps)
- [FREE App Store Screenshot Templates](https://www.figma.com/community/file/1256854154932829222/free-app-store-screenshot-templates)
- [Play Store / App Store Screenshots (Fabled Studio)](https://www.figma.com/community/file/1362938662992433314/play-store-app-store-screenshots-free-fabled-studio)

### 設計靈感
- [ScreenMagic: 50 Best App Store Screenshot Examples](https://appscreenmagic.com/guides/best-app-store-screenshot-examples)
- [QuickScreens: App Store screenshot examples](https://quickscreens.app/blog/app-store-screenshot-examples)
- [APPSHOT.GALLERY](https://www.appshot.gallery/)

### 字型資源
- [Google Fonts: Noto Sans CJK](https://fonts.google.com/noto/specimen/Noto+Sans)
- [Noto Sans](https://fonts.google.com/?query=noto+sans)

### 工具比較
- [ScreenshotWhale: App Store Screenshot Generator Tools](https://screenshotwhale.com/)
- [AlternativeTo: App Store Screenshot](https://alternativeto.net/software/app-store-screenshot/)

---

**最後更新**: 2026 年 8 月 21 日  
**研究方法**: WebSearch + WebFetch + GitHub 深度調查  
**技術深度**: 針對程式化、CJK、可擴展需求最適化
