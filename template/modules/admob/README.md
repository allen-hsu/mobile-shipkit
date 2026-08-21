# admob module

Installs `react-native-google-mobile-ads` and adds its Expo config plugin.
Source of the plugin keys: https://github.com/invertase/react-native-google-mobile-ads/blob/main/docs/index.mdx

After apply:
1. Replace both `ca-app-pub-REPLACE~REPLACE` with the App IDs from AdMob → Apps → App settings
   (app ID uses `~`; ad unit IDs use `/` — don't mix them up).
2. `app-ads.txt` on the site you declared as developer website (both stores).
3. iOS: ATT prompt (`userTrackingUsageDescription` is the string shown); EU: UMP consent form.
4. Privacy re-declarations, both stores — see skills/monetize-admob "翻案清單":
   Play Data safety → Device or other IDs; ASC privacy questionnaire; ASC age rating advertising=true.
5. This is a native module: `eas build` again; the next `eas update` will not reach old installs.
