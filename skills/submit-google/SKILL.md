---
name: submit-google
description: Walk an Expo / React Native app through the whole Google Play submission: create the app in Console, push listing copy, images, Data safety and contact details with the gpc CLI, upload the AAB, set the track, then return to Console for the forms only a human can click and send for review. Use when the user says "ship to Google Play", "submit to Play review", "how do I fill in Play Console", wants to upload an .aab, set an internal/production track, or hits Android Publisher API errors such as "Only releases with status draft may be created on draft app", "A change was made to the application outside of this Edit", or "Invalid header row". Lists explicitly what the API cannot do and a human must do in Console.
---

# submit-google

Google Play submission = **do everything the API can do with gpc, and hand the rest to
a human as an explicit list**. gpc is a standalone Go CLI
([allen-hsu/gpc](https://github.com/allen-hsu/gpc), `go install github.com/allen-hsu/gpc@latest`;
mounted in this repo as the `cli/gpc` submodule, design in `docs/gpc-cli.md`), a thin
wrapper over the Android Publisher API v3.

## Overview

```
① create the app in Console (human)
② gpc auth status
③ gpc listing push / images upload / details set / datasafety push
④ build the AAB (eas build --profile production; failures → eas-build-doctor)
⑤ gpc bundle upload app.aab
⑥ gpc track set --track internal --status draft --version-codes N
⑦ Console-only forms (human)
⑧ Publishing overview → send for review (human button)
```

## ① Create the app

> 🧑 Human step: **the Android Publisher API cannot create an app** (the `applications`
> resource has only the `dataSafety` method). Play Console → All apps → Create app.
> Name, default language and free/paid are chosen here. **The package name is bound by
> the first AAB uploaded**, not typed into a form; make sure `android.package` in
> `app.json` is what you want.

Also have the human prepare the service account: create one in Google Cloud → Play
Console → Users and permissions → invite that account's email with "Release to
production" and "Manage store presence" permissions. Download the JSON to
`~/.config/gpc/service-account.json` (or `GPC_SERVICE_ACCOUNT` env / `--service-account`
flag).

## ② Verify credentials

```sh
gpc auth status --package com.example.app
```

It opens an edit and deletes it. Common failures:
- 403 → the service account was not invited in Play Console, lacks permissions, or
  **the invitation needs minutes to hours to propagate**.
- 404 `applicationNotFound` → the app does not exist yet, the package name is wrong, or
  no AAB has been uploaded yet (some endpoints wait for the first AAB).

## ③ Store data (can be done before the AAB)

### Copy

One json per locale (`title` ≤30, `shortDescription` ≤80, `fullDescription` ≤4000):

```
play-metadata/
  zh-TW.json   { "title": "...", "shortDescription": "...", "fullDescription": "..." }
  en-US.json
  ja-JP.json
```

```sh
gpc listing push --package com.example.app --dir ./play-metadata
gpc listing pull --package com.example.app --dir ./play-metadata   # the reverse, to confirm
```

Play locale codes are `zh-TW` / `ja-JP`, **not** ASC's `zh-Hant` / `ja`. Copy rules are
in store-listing. Play descriptions **allow emoji** (ASC does not), so the Play copy can
diverge from the ASC copy.

### Images

```sh
gpc images upload --package com.example.app --type icon            --locale zh-TW,en-US,ja-JP --path ./shots/icon.png
gpc images upload --package com.example.app --type featureGraphic  --locale zh-TW,en-US,ja-JP --path ./shots/feature.png
gpc images upload --package com.example.app --type phoneScreenshots --locale zh-TW --path ./shots/zh-TW/
```

- icon 512×512, featureGraphic 1024×500 (**required** — the listing is incomplete
  without it), 2–8 phone screenshots.
- Screenshot pipeline: store-screenshots.

### Contact details

```sh
gpc details set --package com.example.app --email support@example.com --website https://example.com --phone "+886..."
```

### Data safety

```sh
gpc datasafety push --package com.example.app labels.csv
```

The CSV header is fixed; anything else gets `Invalid header row` from the API. The
minimal valid submission for **collects no data** is two lines:

```csv
Question ID (machine readable),Response ID (machine readable),Response value,Answer requirement,Human-friendly question label
PSL_DATA_COLLECTION_COLLECTS_PERSONAL_DATA,,false,REQUIRED,Does your app collect or share any of the required user data types?
```

(Verified 200 in Aug 2026.) For an app that does collect data: Console → App content →
Data safety → Export CSV, and edit that as the template — do not hand-write it. After
adding an ads SDK the declaration must be revised (see monetize-admob).

## ④⑤ AAB and upload

```sh
eas build --platform android --profile production        # or --local, see eas-build-doctor
gpc bundle upload --package com.example.app ./app.aab    # resumable, 4MB chunks, auto-retry
```

A successful upload returns the `versionCode`, needed next. Re-uploading the same
versionCode is rejected (`Version code N has already been used.`) — turn on
`autoIncrement`.

**Unsure about signing or the versionCode? `--dry-run` first**: it really uploads, really
lets Play parse the bundle, then discards the edit — nothing live is touched.
`listing push` and `images upload` have the same `--dry-run` for validating payloads.

Testers need a build before any track exists: `gpc sharing upload ./app.aab` returns an
internal app sharing link (allow their email first under Console → Setup → Internal
app sharing); no edit, no track, even debug builds are accepted.

Upload the R8 mapping too, or later crashes are unreadable:
`gpc mapping upload android/app/build/outputs/mapping/release/mapping.txt --version-code N`.

## ⑥ Track

```sh
gpc track set --package com.example.app --track internal --status draft --version-codes 12 --notes-dir ./notes
```

`notes/` holds one txt per locale (`zh-TW.txt` …) as release notes.

**Hard rules**:
- **On a draft app (never released anything) only the `internal` track accepts
  `--status completed`.** production/alpha/beta return
  `Only releases with status draft may be created on draft app.` until the first
  review passes. Not your bug. So: `--track internal --status completed --confirm` to
  get testers a build, and keep production as `draft` for the human to release.
- Then `gpc track promote --from internal --to production --status draft` (notes come
  along); once the app is published, promote with `completed --confirm`.
- `gpc sharing upload` (internal app sharing) answers `NOT_PUBLISHED` until the app has
  shipped once — use the internal track instead on a new app.
  Any non-draft status (completed/inProgress/halted) and `images upload --replace`
  require `--confirm` — they affect testers/users directly or delete data.

### Edit conflicts

`A change was made to the application outside of this Edit` → someone (usually you)
has an unsaved form open in Console. gpc reopens the edit and retries once; if it
still fails:

> 🧑 Human step: close every Play Console tab for this app (or save/discard the
> changes), then rerun.

## ⑦ Console-only list

None of these has an API endpoint — **gpc cannot do them**; each needs a human click in
Console:

> 🧑 Human step (confirm each; the review button stays grey if one is missing):
> 1. **Create the app** (① above)
> 2. **Content rating**: the IARC questionnaire (App content → Content ratings)
> 3. **Target audience and content**: age groups, appeal to children
> 4. **Health apps declaration** (required for health apps): pick "Other" + a
>    ≤150-character description; **do not tick medical**, or you enter medical review.
>    Template: "This app lets users log everyday habits and review them in a gamified
>    way. It does not provide diagnosis, treatment or medical advice."
> 5. **App category** and tags (Store settings → App category)
> 6. **Countries / regions** (Production → Countries / regions)
> 7. Ads, news app, government app, financial features declarations (as applicable)
> 8. **Publishing overview → Send changes for review** (⑧, the final button)

What the agent can do: prepare the content for each item (text, options) and hand it
to the human, **then verify through the API that the human did it**:

```sh
gpc countries get --package com.example.app            # item 6: NONE means not chosen yet
gpc track get    --package com.example.app             # is the version on the right track
gpc testers get  --package com.example.app --track internal
```

## ⑧ After submission

- First review usually takes 1–7 days. Status is on Console's Publishing overview; the
  API has no review-status endpoint.
- Rejection reasons arrive by email and under Console "Policy status"; fix and repeat
  ⑤⑥⑧.
- Day-to-day once live (all read-only, cron-friendly):
  - `gpc reviews list`: only the last 7 days, only reviews with a comment; reply with
    `gpc reviews reply <id> --text … --confirm` (public, ≤350 chars).
  - `gpc vitals issues --days 7`: crash / ANR clusters. The **Play Developer Reporting
    API** must first be enabled in the GCP project that owns the service account (the
    error message links straight to it) — a one-time human action. Builds without an
    uploaded mapping show obfuscated stacks.

## Reading errors

Google's 400 messages are usually precise (field name, length limit, which locale), and
gpc passes them through verbatim. **Read the message, fix the format, rerun** — do not
guess first. `gpc <cmd> --help` names the Console page the operation maps to; when
something does not add up, look at the current value on that page.
