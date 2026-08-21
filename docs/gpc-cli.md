English | [繁體中文](gpc-cli.zh-TW.md)

# gpc — Google Play Console CLI design

> The implementation lives in its own repo: https://github.com/allen-hsu/gpc
> (`cli/gpc` in this repo is a submodule). This document records design intent and
> the hard-won facts; for the command surface, trust that repo's README / `--help`.

gpc is to Google Play what asc is to App Store Connect: a thin, agent-friendly wrapper
over the Android Publisher API v3 that covers what fastlane supply does not
(dataSafety, details, the track state machine).

## Language: Go + cobra (same stack as asc)

- asc is Go — one static binary, no runtime, millisecond startup; what a CLI should be
- Official client: `google.golang.org/api/androidpublisher/v3` +
  `golang.org/x/oauth2/google` (service account); resumable media upload built in
- cobra generates the `--help` tree, which agents discover well; conventions match asc
- Distribution: GitHub Releases + brew tap (allen-hsu/homebrew-tap already exists)
- The Python session scripts that worked on submission day become the reference
  implementation (appendix); gpc matches their behaviour

## Auth

Service-account JSON, looked up in this order: `--service-account` flag →
`GPC_SERVICE_ACCOUNT` env → `~/.config/gpc/service-account.json`. No interactive
login exists — the Play API only accepts service accounts.

## Command surface (all exercised on a real submission)

```
gpc auth status                          # verify credentials: open an edit, delete it
gpc listing push --dir ./play-metadata   # one json per locale: title/short/full
gpc listing pull --dir ./play-metadata
gpc images upload --type icon|featureGraphic|phoneScreenshots \
                  --locale zh-TW,en-US,ja-JP --path ./shots/
gpc bundle upload app.aab                # resumable + retry (4MB chunks, 600s socket timeout)
gpc track set --track internal|alpha|production --status draft|completed \
              --version-codes 10 --notes-dir ./notes
gpc track promote --from internal --to production
gpc datasafety push labels.csv           # CSV format below
gpc details set --email ... --website ... --phone ...
```

## Conventions (borrowed from asc)

- JSON when piped, table on a TTY; destructive operations require `--confirm`
- Google's 400 messages are passed through verbatim — they are precise and are the
  main feedback loop when iterating on a payload
- Every command's `--help` names the Console page it corresponds to

## Hard facts (must appear in `--help` or error hints)

1. **The API cannot create an app.** The `applications` resource has only the
   `dataSafety` method. The app must be created in the Console UI; the package name is
   bound by the first AAB uploaded.
2. **On a draft (never-published) app, only the internal track accepts a `completed`
   release.** production/alpha/beta answer "Only releases with status draft may be
   created on draft app." until the first review passes. (Verified per track, Aug 2026.)
   Internal app sharing is stricter still: `NOT_PUBLISHED` until the app has shipped once.
3. **An open Console tab steals the edit**: "A change was made to the application
   outside of this Edit" → reopen the edit and retry; tell the user to close any
   unsaved Console form.
4. **The real dataSafety CSV header** (buried in the docs; the API answers
   "Invalid header row" to anything else):

   ```csv
   Question ID (machine readable),Response ID (machine readable),Response value,Answer requirement,Human-friendly question label
   PSL_DATA_COLLECTION_COLLECTS_PERSONAL_DATA,,false,REQUIRED,Does your app collect or share any of the required user data types?
   ```

   "Collects nothing" = those two lines are a complete, valid submission (verified 200).
5. **Console-only list** (gpc cannot do these; the skill must hand them to a human):
   create app, IARC content rating questionnaire, target audience, health apps
   declaration, app category, countries/regions, and the "send for review" button on
   Publishing overview.

## Appendix: where the behaviour comes from

The Python session scripts that ran successfully on submission day (Aug 2026) —
listing / images / bundle / tracks / datasafety / details — live in the maintainer's
private project; gpc mirrors them.
