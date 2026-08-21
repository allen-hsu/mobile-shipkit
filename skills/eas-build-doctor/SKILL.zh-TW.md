---
name: eas-build-doctor
description: 診斷並修復 Expo / EAS build 失敗（雲端或 `eas build --local`），以及 CNG 專案的原生建置問題。當 agent 看到 `npm ci` 拒絕 lockfile、EAS 壓縮包異常肥大、expo-updates runtime/指紋不合、雲端建置額度用完、本地 iOS Swift 編譯錯誤、Android OutOfMemoryError Metaspace、gradle GlobalCacheLocations 錯誤、訊息被吞的「node exited 1」、Android release lint ExtraTranslation 時使用。內含九條來自 2026-08 真實專案上架的真實病歷（症狀→根因→修法），以及 EAS log 解壓、保留工作目錄、手動重放 gradle 的診斷工具箱。
---

# eas-build-doctor

EAS build 失敗病歷本。每條都是 2026-08 一個真實專案（Expo SDK 54 / expo-modules 57）
雙商店上架時真的踩到、真的修好的。**先對症狀，再看根因，最後才動手。**

## 使用原則

1. **先抓完整 log 再猜。**雲端 log 是 brotli 壓縮；本地建置要保留工作目錄。見〈診斷工具箱〉。
2. **本地與雲端要一致。**多數「只在雲端炸」的案例，根因是本機 node_modules 與 lockfile / patch 不同步。
3. **修法要進 repo。**手改 node_modules、手改 gradle.properties 都不算修好——只有 patch-package、
   hook、設定檔進了 git 才算。
4. 修完**把症狀與修法寫進專案的 commit message**，下一個人（或 agent）才查得到。

## 病歷本

### 1. builder `npm ci` 拒絕 lockfile

- **症狀**：雲端 install 階段失敗，訊息類似
  `npm error Invalid: lock file's @emnapi/wasi-threads@1.2.1 does not satisfy @emnapi/wasi-threads@1.2.3`。
  本機 `npm install` 正常。
- **根因**：增量 `npm install` 在 lockfile 留下平台相關殘渣（optional / platform-specific
  套件版本漂移）。macOS 上 `npm ci` 過，不代表 Linux builder 過。
- **修法**：整顆重生。
  ```sh
  rm -rf node_modules package-lock.json
  npm install
  # 在乾淨目錄驗證，不要在原目錄驗證
  mkdir /tmp/ci-check && cp package.json package-lock.json /tmp/ci-check && cd /tmp/ci-check
  npm ci --dry-run --ignore-scripts
  ```
  同一專案此症狀出現兩次，兩次都是重生法治好。
- **怎麼發現**：log 裡找 `npm error Invalid:` / `does not satisfy`，它會直接點名漂移的套件。

- **變體（重生也治不好）**：`npm ls <pkg>` 顯示 `invalid`，就地 `npm ci --dry-run` 也失敗，例如
  `Missing: ajv@6.15.0 from lock file`。npm 11 在單次解析裡把 *optional peer*（`@hookform/resolvers`
  要 `ajv ^8`）錯 dedupe 到別的套件的 `ajv@6`。修法：那個套件**另起一步** `npm install <pkg>`，
  npm 就會巢狀放對的大版本。template 的 `.shipkit-install.sh` 因此固定順序
  （expo → dev → npm → lockfile 檢查）。2026-08 在全新 SDK 57 專案上遇到。

### 2. 壓縮包肥大，上傳慢或超限

- **症狀**：`eas build` 的 archive 大小不降反升（546 MB → 614 MB），即使剛加了 `.easignore`。
- **根因**：**`.easignore` 一旦存在，就完全取代 `.gitignore`**。第一版只列了生成素材目錄，
  結果 node_modules 與 .git 被重新打包進去。
- **修法**：`.easignore` 必須重列 `.gitignore` 原本排除的一切：
  ```gitignore
  # 專案自己的大型素材
  tmp/
  docs/
  tools/
  # .easignore REPLACES .gitignore —— 下面是 .gitignore 原本就排除的
  node_modules/
  .git/
  /ios/
  /android/
  .expo/
  *.log
  .DS_Store
  ```
- **怎麼發現**：`eas build` 上傳前會印 archive 大小；加 `.easignore` 後變大就是這條。

### 3. Configure expo-updates：runtime / 指紋不合

- **症狀**：雲端建置在 `Configure expo-updates` 或 fingerprint 階段失敗，或 `eas update` 算出的
  runtimeVersion 與建置不同。
- **根因**（兩種，都碰過）：
  1. 本地殘留 `ios/` 或 `android/` 目錄（bareNativeDir），指紋把原生目錄算進去。
  2. node_modules 被手改（例如為了讓 Swift 編過），本機與 builder 的 node_modules 不再 byte 一致。
- **修法**：
  1. CNG 專案的 `ios/`、`android/` **永不落地、永不進 repo**；要清就 `rm -rf ios android`。
  2. 所有對 node_modules 的手改一律 `npx patch-package <pkg>` 進 `patches/`，
     `"postinstall": "patch-package"`，兩端安裝後 byte 一致。
- **怎麼發現**：`npx expo-updates fingerprint:generate` 本機算一次、對照雲端 log 印的值；
  `npx @expo/fingerprint . --debug` 可列出哪些檔案進了指紋。

### 4. 雲端建置額度用完

- **症狀**：`eas build` 排隊被拒或提示額度用盡。免費方案 iOS / Android **分開計**。
- **修法**：`eas build --local --platform <ios|android> --profile production`。
  同流程、同憑證（會從 EAS 拉 credentials），本機跑，產物 `.ipa` / `.aab` 可直接
  `eas submit --path` 或 asc / gpc 上傳。
- **代價**：本機 toolchain 問題全部浮上來——病歷 5～8 都是 `--local` 引出的。

### 5. 本地 iOS：Swift 編譯錯（`abs` 歧義）

- **症狀**：`expo-modules-jsi` 編譯失敗，`'abs' is ambiguous` 一類訊息。
- **根因**：本機 Xcode 26 SDK 的 libc++ 新模組化，C shim 的 `abs` 與 Swift 的 `abs` 同時在 scope；
  `expo-modules-jsi` 57.0.4 上游未修。
- **修法**：最小修正（改用 `.magnitude`，或明確 qualify）→ `npx patch-package expo-modules-jsi`
  → patch 進 repo。**追上游 issue，上游修了就刪 patch。**
- **為何不直接改 node_modules**：會觸發病歷 3（指紋不合）。

- **變體（Xcode 26.3 + expo-modules-jsi 57.0.5）**：`RuntimeScheduler.h:61`
  `'RuntimeScheduler' cannot be annotated with either SWIFT_RETURNS_RETAINED or SWIFT_RETURNS_UNRETAINED…`。
  同一家族、不同行：新版 clang 不准在*建構子*上放這個 macro。修法：patch-package 把兩個
  `RuntimeScheduler(...)` 建構子（53、61 行）的 `SWIFT_RETURNS_RETAINED` 拿掉。template 內附
  `patches/expo-modules-jsi+57.0.5.patch`；上游修了就刪。2026-08 在全新 SDK 57 專案遇到。
  **做 patch 時的坑**：失敗過的 `expo run:ios` 會在 `node_modules/<pkg>/apple/.DerivedData/`
  留下建置產物，`npx patch-package <pkg>` 會把 450+ 個檔一起錄進去。用
  `npx patch-package <pkg> --exclude '\.DerivedData'`（或先刪那個目錄），commit 前確認 patch 只有幾行。

### 6. 本地 Android：`OutOfMemoryError: Metaspace`

- **症狀**：`./gradlew :app:bundleRelease` 中途 `java.lang.OutOfMemoryError: Metaspace`。
- **根因**：Expo prebuild 模板的 `android/gradle.properties` 只給 `MaxMetaspaceSize=512m`。
  CNG 專案 `android/` 每次重生，手改無效。
- **修法**：在 `eas-build-post-install` hook 裡 sed：
  ```json
  "eas-build-post-install": "test -f android/gradle.properties && { sed -i.bak -E 's/MaxMetaspaceSize=[0-9]+m/MaxMetaspaceSize=2048m/; s/-Xmx[0-9]+m/-Xmx4096m/' android/gradle.properties; printf '\\norg.gradle.daemon=false\\n' >> android/gradle.properties; } || true"
  ```
  注意 `printf '\n...'`——原因見病歷 8。

### 7. gradle：`Cannot create service of type ... GlobalCacheLocations`

- **症狀**：gradle 啟動即失敗，提到 `GlobalCacheLocations` 或 cache lock。
- **根因**：之前 `pkill -f gradle` 強殺 daemon，把 `~/.gradle` 弄髒。
- **修法**：整個砍掉重來。
  ```sh
  rm -rf ~/.gradle/caches ~/.gradle/daemon
  ```
  第一次重建會重新下載依賴，幾分鐘。

### 8. `node exited 1`，訊息被吞，本地 + 雲端同炸

- **症狀**：Android 建置在 autolinking 階段失敗，只剩一行 `node exited 1` 或類似，沒有 stack。
  本地與雲端**同時**壞——這是關鍵線索：問題在 repo 裡，不在環境。
- **根因**：hook 用 `echo >>` 續寫 `gradle.properties`，而模板產出的該檔**結尾沒有換行**。
  `org.gradle.daemon=false` 黏到上一行 `watchedDirectories=[]` 後面，這個壞值被塞進
  expo-autolinking 的 `--watched-directories-serialized` 參數，node 直接炸。
- **修法**：`printf '\norg.gradle.daemon=false\n' >> android/gradle.properties`。
- **通用教訓 / 怎麼發現**：用 `./gradlew --info` 重跑，能看到 gradle 起的**每一支 node 的完整命令列**，
  壞參數一眼就看得到。任何「續寫設定檔」的 hook 都先 `tail -c1 file | xxd` 確認結尾有換行。

### 9. Android release lint：`ExtraTranslation`

- **症狀**：`:app:lintVitalRelease` 失敗，`ExtraTranslation: "CFBundleDisplayName" is translated here but not found in default locale`。
- **根因**：`app.json` 的 `locales` 用平鋪格式，iOS 的 key（`CFBundleDisplayName`）被灌進
  Android `strings.xml`，而 default locale 沒有這個 key。
- **修法**：locales 檔平台分開：
  ```json
  {
    "ios":     { "CFBundleDisplayName": "我的 App" },
    "android": { "app_name": "我的 App" }
  }
  ```
  副作用是好的：Android launcher 名稱也跟著在地化。

## 診斷工具箱

| 要做什麼 | 怎麼做 |
|---|---|
| 讀雲端完整 log | EAS log 下載下來是 brotli：`brotli -d build.log.br` 或 `python3 -c "import brotli,sys;sys.stdout.buffer.write(brotli.decompress(open(sys.argv[1],'rb').read()))" x.br` |
| 本地建置失敗後保留工作目錄 | `EAS_LOCAL_BUILD_SKIP_CLEANUP=1 eas build --local ...`，失敗後路徑會印在 log 末尾（`/var/folders/.../eas-build-local-nodejs/<id>/build/`） |
| 在保留目錄手動重放 gradle | `cd <保留目錄>/android && EAS_BUILD_WORKINGDIR=<含 credentials.json 的目錄> ./gradlew :app:bundleRelease --info --stacktrace` |
| 看指紋算了什麼 | `npx @expo/fingerprint . --debug` |
| 驗證 lockfile 在乾淨環境可安裝 | 病歷 1 的 `/tmp/ci-check` 流程 |
| 判斷「環境問題」vs「repo 問題」 | 本地與雲端同炸 → repo；只有一邊炸 → 環境（toolchain、cache、額度） |

## 本地建置的前置條件清單

- iOS：Xcode 版本與 EAS image 可能不同（病歷 5），fastlane 已安裝，`eas credentials` 能拉到憑證
- Android：JDK 17、Android SDK、`~/.gradle` 乾淨（病歷 7）、gradle 記憶體夠（病歷 6）
- 兩者：`ios/`、`android/` 不在 repo（病歷 3）、`patches/` 完整、lockfile 重生過（病歷 1）

## 沒列在這裡的失敗

先做三件事：(1) 拿到完整 log（不要只看 EAS 網頁摘要）；(2) 問自己「本地也炸嗎」；
(3) 用 `--info` / `--stacktrace` 重跑一次。然後把新病歷按「症狀→根因→修法」補進這份檔案。

## 附件

- `template/scripts/check-lockfile.sh`:病歷 1 的乾淨目錄 `npm ci --dry-run` 驗證,一行搞定。
- `template/package.json.merge`:病歷 6、8 的 gradle hook 正確版(printf 帶換行)。
- `template/.easignore`、`template/i18n/native/`:病歷 2、9 的修法成品。
