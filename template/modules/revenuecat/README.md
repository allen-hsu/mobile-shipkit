# revenuecat module

Installs `react-native-purchases`. After apply:
1. RevenueCat project → API keys per platform; `Purchases.configure({ apiKey })` at app start.
2. Products: ASC (`asc iap` / subscriptions) and Play Console → Monetize; read back with
   `gpc iap list` / `gpc subscriptions list` and map to RC products → entitlements → offerings.
3. Paywall MUST have a visible "Restore purchases" button (Apple rejects without it).
4. Native module: rebuild; OTA cannot add it.
