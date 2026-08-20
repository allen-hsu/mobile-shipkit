# Skills 設計書

每個 skill = 一份 SKILL.md(< 500 行,遵循 expo/skills 的 CI 慣例)+ scripts/ 附件。
原則:**編「怎麼發現」而非只有「事實」**(商店 API 會變,教 agent 用 --help/asc search/
API 錯誤訊息迭代);**明標「人類時刻」**(2FA、Console 表單、送審鈕);
**失敗目錄比成功路徑值錢**。

---

## eas-build-doctor

真實失敗病歷本,每條:症狀 → 根因 → 修法。

| 症狀 | 根因 | 修法 |
|---|---|---|
| builder `npm ci` 拒絕 lockfile(@emnapi 系列版本漂移) | 增量 `npm install` 留下平台相關殘渣 | 整顆重生:rm node_modules+lock → npm install → **乾淨目錄** `npm ci --dry-run --ignore-scripts` 驗證(macOS 過≠Linux 過,但重生法兩次都治好) |
| 壓縮包肥大(546MB→614MB) | **`.easignore` 一旦存在就完全取代 `.gitignore`** | .easignore 必須重列 node_modules/.git 等所有排除項 |
| Configure expo-updates: runtime 指紋不合 | ① 本地殘留 `ios/` 目錄(bareNativeDir) ② node_modules 被手改 | ① CNG:ios/android 永不落地/進 repo ② 手改一律 patch-package 進 repo,兩端 byte 一致 |
| 雲端額度用完 | 免費方案 iOS/Android 分開計 | `eas build --local`:同流程同憑證,本機跑,產物可直接 submit |
| 本地 iOS: Swift 編譯錯(abs 歧義) | 本機 Xcode 26 SDK 的 libc++ 新模組化 vs expo-modules-jsi C++ interop,上游未修 | patch-package 帶最小修正(qualify 或 .magnitude);追上游 issue,修了就刪 patch |
| 本地 Android: OutOfMemoryError Metaspace | Expo 模板 gradle.properties 只給 512m | post-install hook sed 調大(2048m/4G) |
| gradle: Cannot create service ...GlobalCacheLocations | pkill gradle 弄髒 ~/.gradle | 整個 ~/.gradle/caches + daemon 砍掉重來 |
| **node exit 1(訊息被吞),本地+雲端同炸** | hook 用 `echo >>` 續寫**無換行結尾**的 gradle.properties,屬性黏死,毒到 autolinking 參數 | `printf '\n...'`;通用教訓:`--info` 重跑能看到 gradle 起的每支 node 完整命令列 |
| Android release lint: ExtraTranslation | app.json locales 的 iOS key(CFBundleDisplayName)灌進 Android strings.xml | locales 檔平台分開:`{"ios":{"CFBundleDisplayName":..},"android":{"app_name":..}}` |

診斷工具箱:EAS log 是 brotli;`EAS_LOCAL_BUILD_SKIP_CLEANUP=1` 保留工作目錄;
在保留目錄手動 `./gradlew --info/--stacktrace` 重放(要補 `EAS_BUILD_WORKINGDIR` 指向含
credentials.json 的目錄)。

---

## eas-ota-discipline

1. 發佈:乾淨已 commit 的樹;`eas update --branch B --environment E`(非互動必帶 --environment)。
2. **指紋鐵律**:更新只達指紋相同的安裝。發完必查
   `eas update:list` vs `eas build:list` 的 runtimeVersion——不一致=沒人收得到
   (真實案例:測試者停在舊版一週,所有人都以為更新出去了)。
3. 斷指紋的動作(=必須重出安裝檔):原生設定(icon/名稱/locales/plist)、加原生套件
   (IAP/AdMob!)、node_modules 手改未進 patch。
4. 投遞:冷啟兩次生效;icon/名稱/splash 永不走 OTA。
5. channel↔branch↔profile 對映寫死於 eas.json,skill 附標準三件組。

---

## submit-google(搭配 gpc)

流程圖:Console 建 app(人類) → gpc listing/images/datasafety/details → AAB(build doctor)
→ gpc bundle upload → gpc track set draft → Console-only 表單(人類:IARC/目標對象/健康/
類別/國家) → 發布總覽送審(人類按鈕)。
硬知識全在 docs/gpc-cli.md(draft app 規則、CSV 表頭、edit 衝突)。
健康 app 加碼:健康功能宣告選「其他」+150 字內描述模板(不勾醫療類)。

---

## submit-apple(薄殼,主體 vendor asc skills)

只寫 asc skills 沒講的踩點:
- `asc web apps create` 需 web session(2FA=人類時刻,session 會過期)
- 版本字串要對齊 binary marketing version(create 給 1.0 → versions update 1.0.0)
- **描述欄禁 emoji**(整批被拒:🌱💩📅🔒...),Play 允許 → 兩商店文案分流
- 定價時區坑:schedule create --start-date 用「昨天」繞 Cupertino 時差
- 新必填:受管制醫療器材宣告(`asc web apps medical-device set --declared false`)
- review details 的 demoAccountRequired 可能意外為 true,details-update 修掉
- 送審順序:content-rights → 醫療器材 → submissions-create → items-add → submit --confirm
  (items-add 的報錯會直接說缺什麼,`asc review doctor` 同功)

---

## store-screenshots

1. **release 獨立版**,不是 Expo Go(浮動工具鈕殺不掉):`expo run:ios --configuration Release`
2. 操作全走 sim-use;**describe-ui alias 定位,禁盲打座標**(盲打曾誤觸走完整記錄流程)
3. 佈景:臨時調參(生長加速等)加 DO NOT COMMIT 標記,拍完 git checkout 還原
4. 長流程驗證用 sim-use record-video 省 token
5. 尺寸:iOS 6.9"=1320×2868(16 Pro Max);Play 手機圖同源+feature graphic 1024×500 另構
6. 多語:app 內切語言重跑同腳本,輸出按 locale 分目錄(對齊 asc screenshots upload fan-out)
7. 後段加框:asc screenshots frame(自動)或 ParthJadhav/app-store-screenshots(手工打磨)

---

## store-listing

字數表:ASC name/subtitle 30、keywords 100、promo 170、desc 4000;
Play title 30、short 80、full 4000。
規則:ASC 描述禁 emoji;關鍵字半形逗號;ja/zh 全形字算 1;
三語策略與模板(zh 源→en/ja 在地化改寫,非直譯);
canonical 目錄結構 = asc metadata pull 格式,Play 版另存(emoji 保留)。

---

## monetize-revenuecat / monetize-admob(規劃,待實戰)

RC:react-native-purchases=原生模組→斷 OTA 警告置頂;ASC/Play 商品→RC offerings→
asc-revenuecat-catalog-sync 對帳;Restore 按鈕(Apple 必退件項);sandbox 測試員。
AdMob:react-native-google-mobile-ads+app.json plugin;app-ads.txt 放官網;ATT+UMP;
**隱私申報翻案清單**:Play Data safety 改申報裝置識別碼、ASC 隱私問卷同步、
ASC 年齡分級 --advertising 改 true。
