---
name: submit-apple
description: App Store submission gotchas layered on top of the skills that ship with the asc CLI. Use when the user wants to "ship to the App Store", "submit to Apple review", "create the ASC app", when asc reports an expired web session or asks for 2FA, when the version string does not match the binary, when a description is rejected for emoji, when a pricing schedule date is rejected, when the regulated medical device declaration is missing, or when review submission items-add errors. Read asc-release-flow, asc-submission-health and asc-metadata-sync under vendor/asc-skills/skills/ for the main flow first; this skill only lists the traps the asc skills do not cover, observed on a real submission in Aug 2026.
---

# submit-apple (thin layer)

**The body is not here.** The whole Apple command surface comes from the asc CLI and
the skills that ship with it (`vendor/asc-skills/` submodule, pinned to the same
commit `asc install-skills` uses):

| Goal | Read first |
|---|---|
| the full create-version → upload → submit flow | `asc-release-flow` |
| submission stuck, wrong state, retry | `asc-submission-health` |
| copy / screenshots / keywords sync | `asc-metadata-sync`, `asc-screenshot-resize`, `asc-localize-metadata` |
| finding IDs | `asc-id-resolver` |
| signing, TestFlight, build management | `asc-signing-setup`, `asc-testflight-orchestration`, `asc-build-lifecycle` |

Below are only the things **those skills do not say and we actually hit**, in
submission order.

## 1. Creating the app needs a web session (2FA)

The public ASC API cannot create an app; `asc web apps create` uses an Apple web session.

```sh
asc web apps create --name "My App" --bundle-id com.example.app --sku myapp --apple-id you@example.com
```

> 🧑 Human step: it asks for the Apple ID password and a 2FA code. **The session
> expires** (hours to a day), after which every `asc web ...` command may ask again. On
> a session error the agent stops and asks the human to log in again — no retry loops.

## 2. The version string must match the binary's marketing version

`asc web apps create` creates `1.0` by default; an Expo build's
`CFBundleShortVersionString` is `version` from `app.json` (e.g. `1.0.0`). Mismatch →
the build cannot be attached.

```sh
asc versions list --app <APP_ID>
asc versions update --id <VERSION_ID> --version-string 1.0.0
```

Or pass `--version 1.0.0` when creating the app.

## 3. No emoji in the description

A whole metadata push was rejected by ASC because of 🌱 💩 📅 🔒 in the description.
**Play allows them, ASC does not**, so the two stores' copy diverge (see store-listing):
the ASC copy drops emoji, the Play copy keeps them. The error does not always name emoji;
when a description is rejected, grep for non-BMP characters first:

```sh
grep -P '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' metadata/version/*/*.json
```

## 4. Pricing schedule timezone trap

`asc pricing schedule create --start-date YYYY-MM-DD` with "today" can be rejected
(it is not today yet in Cupertino). **Use yesterday's date**:

```sh
asc pricing schedule create --app <APP_ID> --free --base-territory TWN --start-date $(date -v-1d +%F)
```

## 5. New required field: regulated medical device declaration

ASC added this under App Information → App Store Regulations & Permits; submission is
blocked without it. asc currently automates only the "no" path:

```sh
asc web apps medical-device set --app <APP_ID> --declared false
```

(Web session, see section 1.) Health apps also answer "no" unless they really are a
medical device.

## 6. review details' demoAccountRequired can unexpectedly be true

Even an app with no login may show `demoAccountRequired: true`, and review will demand
credentials.

```sh
asc review details-for-version --version-id <VERSION_ID>
asc review details-update --id <DETAIL_ID> --demo-account-required=false --contact-email ... --contact-phone ...
```

## 7. Submission order

```sh
asc apps content-rights edit --app <APP_ID> --uses-third-party-content=false   # 1 content rights
asc web apps medical-device set --app <APP_ID> --declared false                # 2 medical device
asc review submissions-create --app <APP_ID> --platform IOS                    # 3 open a submission
asc review items add --submission <SUB_ID> --item-type appStoreVersions --item-id <VERSION_ID>  # 4
asc review submissions-submit --id <SUB_ID> --confirm                          # 5
```

- **Step 4's error tells you exactly what is missing** (screenshot sizes, age rating,
  privacy questionnaire, no build selected…) — the best checklist there is.
  `asc review doctor --app <APP_ID>` does the same and can run first.
- Step 5's `--confirm` is irreversible.

> 🧑 Human step: before step 5 a human confirms version, build, pricing and the
> privacy questionnaire. Withdrawing afterwards goes through the cancel flow in
> `asc-submission-health` and affects the review queue.

## 8. Privacy questionnaire and age rating

Doable purely through the API, but the content is a legal declaration:

> 🧑 Human step: the **answers** to the privacy questionnaire (what data is collected)
> and the age rating questionnaire are decided by a human; the agent only fills them
> in. Adding an ads SDK later means revising them (see monetize-admob).

## 9. Screenshots upload only into an editable version

`asc screenshots upload` targets a version localization. Versions in `WAITING_FOR_REVIEW`,
`IN_REVIEW` or `READY_FOR_SALE` are locked — the API refuses media changes. Create the next
version first (`asc versions create --app <id> --version x.y.z`), upload there, then submit.
Before uploading run `asc screenshots validate --path <dir> --device-type IPHONE_67`: it rejects
any non-image file in the folder (`report.json`, a 1024×500 feature graphic…) — `store-art`'s
render output is laid out for this. (Observed 2026-08-23: all three live apps had only locked versions.)

## When a command cannot be found

Walk down with `asc <group> --help`; `asc search <keyword>` searches globally. asc
moves fast — trust `--help` over this file.
