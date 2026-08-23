---
name: monetize-revenuecat
description: Planned, not yet field-tested. Skeleton for wiring RevenueCat subscriptions / IAP into an Expo app — creating products in App Store Connect and Play, reconciling RevenueCat offerings, the Restore button, sandbox testing. Use when the user wants to "add subscriptions", "add IAP" or "RevenueCat", but tell the user this skill has not yet been verified on a real submission.
---

# monetize-revenuecat (planned, awaiting field use)

> ⚠️ This skill has not been run end to end on a real app. Below is the skeleton and the
> known hard rules; defer to the official docs and actual errors for details. Once it
> has been run, add the cases here.

## First thing: this breaks OTA

`react-native-purchases` is a native module. Adding it changes the runtimeVersion
fingerprint = **a new binary and a new review are required**, and existing installs
stop receiving OTAs (see eas-ota-discipline section 3). Put this at the top of the
schedule.

## Skeleton

1. **Store products**
   - ASC: `asc iap` / `asc subscriptions` to create products and subscription groups;
     three-locale display names via `asc-subscription-localization`.
   - Play: Console → Monetize → Products; then read back productId,
     purchaseOptionId / basePlanId and state with `gpc iap list` /
     `gpc subscriptions list` — these are the strings RC must match (RC's Play product is
     `productId:basePlanId`). Note the legacy `inappproducts` endpoint answers 403
     "Please migrate to the new publishing API" for new apps; gpc uses
     `monetization.onetimeproducts`.
   - Pricing: `gpc pricing convert 4.99 --currency USD` shows the per-region conversion
     (pure computation) before deciding on manual PPP adjustments.
   > 🧑 Human step: pricing and product ID naming are business decisions; Play
   > subscription base plans / offers are created in Console.
2. **RevenueCat dashboard**: create the project, connect both stores' credentials (ASC
   in-app purchase key, Play service account), create entitlements → products →
   offerings.
3. **Reconcile**: `asc-revenuecat-catalog-sync` compares ASC products with RC products /
   offerings so product IDs match character for character.
4. **App side**: `npx expo install react-native-purchases`, config plugin in app.json;
   `Purchases.configure` at startup, `getOfferings` for the paywall, `purchasePackage`,
   `restorePurchases`.
5. **Restore button**: Apple rejects without it — the paywall **must** show a visible
   "Restore purchases".
6. **Testing**: ASC sandbox testers (near `asc-testflight-orchestration`); Play license
   testers (Console → Setup → License testing).
7. **Submission extras**: ASC IAPs are submitted together with the version (add the IAP
   as a review item); Apple asks for a paywall screenshot.

## Pattern: several one-time packs + a bundle (theme packs, level packs, "pro" unlocks)

The model small utility apps actually use (no ads, no subscription): free core + N
**non-consumable** products + one bundle. The rules that bite:

| store | product type | notes |
|---|---|---|
| App Store | *Non-Consumable* | one per pack (`pack_sakura`, `pack_neon`…) + `pack_all`. Each needs a localized display name + review screenshot; all submitted with the first version. Family Sharing optional. |
| Google Play | *One-time product* (`gpc iap list` → `monetization.onetimeproducts`) | same IDs; Play has no "bundle" concept — `pack_all` is just another product. |
| RevenueCat | one **entitlement per pack** (`pack_sakura`…) + `pack_all` grants every entitlement | offerings: `default` = all packs + bundle; use `offering.availablePackages` and show `entitlements.active` keys to unlock. |

App side:
```ts
const info = await Purchases.getCustomerInfo();
const owned = new Set(Object.keys(info.entitlements.active));          // "pack_sakura", "pack_all"…
const has = (pack: string) => owned.has(pack) || owned.has('pack_all');
// bundle pricing: keep pack_all ≈ price of 3 packs; show "already own 2 → upgrade" by checking owned.size
```

- **Restore** still mandatory (non-consumables are restorable; Apple checks).
- **Upgrade path**: a user who bought two packs then wants the bundle pays full bundle price — there is no store-level credit. Either accept it, or price the bundle so it only makes sense from zero.
- **Do not** make packs consumables to "sell again" — Apple rejects unlock-style consumables.
- Launch promo (first-month bundle price) = a second non-consumable `pack_all_launch` you stop selling, **not** a price change (price changes are global and slow on Play).
- IDs are forever: never reuse a product ID after deleting it on either store.

## To verify

- [ ] whether the config plugin of the latest react-native-purchases needs no manual edits on Expo SDK 54
- [ ] whether `eas build --local` compiles (iOS StoreKit 2 entitlement)
- [ ] whether one Play service account shared between RC and gpc has enough permissions
- [ ] the actual reason the first IAP submission gets rejected
