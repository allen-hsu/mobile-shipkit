English | [繁體中文](AGENTS.zh-TW.md)

# For agents working in this repo

## Current state (2026-08-21)
The design docs in `docs/` are the single source of truth. Steps 1–4 are done:
`cli/gpc` (submodule → allen-hsu/gpc) builds, has unit tests, and its read-only
commands are verified against a live app; `skills/` holds eight SKILL.md files;
`vendor/asc-skills` is a submodule. `template/` is done and verified on a fresh
create-expo-app (SDK 57): apply → npm install → expo-doctor 21/21 → `prebuild android`
yields `values-b+ja/strings.xml` with only `app_name`, the gradle hook appends
correctly to a `gradle.properties` that ends without a newline, check-lockfile passes.
The module system (base modules always on, admob/revenuecat optional) was verified
the same way with `--with admob,revenuecat --install`; native config lands on both
platforms. When you rename a gpc flag, update `skills/submit-google/SKILL.md` too.

## Still to verify (do it during the next real submission)
- Done 2026-08-21 on a brand-new Play app: template → `eas build --local` (first run
  reproduced build-doctor case 1 incl. a new npm optional-peer variant, now in the
  skill) → `gpc bundle upload --track internal` → `track set/promote`, `listing push`,
  `images upload`, `details set`, `datasafety push` all committed. Found and fixed
  hard-rule #2 (draft app: only internal accepts completed) and `NOT_PUBLISHED` for
  internal app sharing (gpc v0.1.1).
- Still unexercised: `mapping upload`, `reviews reply`, `testers set`.
- `gpc vitals`: the Play Developer Reporting API must be enabled in the GCP project
  that owns the service account (human step) before it can be verified.
- Exact asc sub-command flags referenced in submit-apple (`review details-update`,
  `versions update`, `screenshots upload`).
- sim-use sub-command names referenced in store-screenshots.
- ~~Cut a release with goreleaser + brew tap~~ — v0.1.0 is out (formula pushed to
  the tap over an SSH deploy key).

## Build order
1. `cli/gpc` — its own repo, github.com/allen-hsu/gpc, mounted here as a submodule;
   change gpc there (commit + push), then bump the submodule here. Go + cobra, spec in
   `docs/gpc-cli.md`. Behaviour mirrors the Python scripts that worked on submission
   day (see the appendix of docs/gpc-cli). Do `auth status` / `listing push` /
   `bundle upload` / `track set` first, datasafety next.
2. `skills/eas-build-doctor`, `skills/eas-ota-discipline` — expand the matching
   sections of `docs/skills-plan.md` into SKILL.md (frontmatter: name/description,
   body < 500 lines).
3. `skills/submit-google`, `store-screenshots`, `store-listing`.
4. `vendor/` — asc skills submodule; README lists the official Expo plugin as a
   prerequisite.

## Conventions
- SKILL.md follows the expo/skills limits (description < 1024 chars, body < 500 lines)
- Teach *how to find out*, not just facts; human steps (2FA / Console forms / the
  submit button) must be called out explicitly
- Every claim must be traceable: each casebook entry was observed on a real
  submission in Aug 2026

## Case material
Lives in the maintainer's private project; this repo keeps only the de-identified
conclusions.
