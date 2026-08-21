English | [繁體中文](README.zh-TW.md)

# mobile-shipkit

Everything between `create-expo-app` and a listing on both stores: skills (working
knowledge for AI agents), `gpc` (a Google Play CLI), and a starter overlay for Expo
projects. **Only the gaps the official tooling leaves open — nothing that already
exists is rewritten here.**

Distilled from a real dual-store submission (Aug 2026): zero store data to Apple + Google
review, fixing a dozen genuine failures along the way. This repo turns that into
something reusable.

## Layout

```
mobile-shipkit/
├── docs/               # design docs (read these first)
├── skills/             # original skills (SKILL.md format; Claude Code / codex / cursor)
├── cli/gpc/            # submodule → github.com/allen-hsu/gpc (Google Play CLI, Go + cobra)
├── template/           # overlay applied after create-expo-app (idempotent apply.sh)
└── vendor/asc-skills/  # rorkai/app-store-connect-cli-skills submodule, pinned to the commit asc install-skills uses
```

## Who provides what (no reinvented wheels)

| Source | Provides | How it gets in |
|---|---|---|
| [expo/skills](https://github.com/expo/skills) (official) | framework side, eas-app-stores, eas-update-insights | `claude plugin install expo@claude-plugins-official` |
| [asc skills](https://github.com/rorkai/app-store-connect-cli-skills) (ships with asc, 23 skills) | the whole Apple command surface | `vendor/asc-skills` submodule or `asc install-skills` |
| **this repo** | failure casebook, full Play API flow, screenshot pipeline, listing copy rules, IAP/ads wiring | skills/ + cli/ |

## Original skills

| skill | one line |
|---|---|
| `eas-build-doctor` | EAS build failure casebook: root cause and fix for each real failure |
| `eas-ota-discipline` | the OTA fingerprint rule: why nobody received your update |
| `submit-google` | the full Play flow: everything the API can do, plus the explicit Console-only list |
| `submit-apple` | App Store gotchas layered on top of the asc skills |
| `store-screenshots` | sim-use-driven screenshot pipeline on a release build |
| `store-listing` | copy rules for both stores: length table, emoji rule, three-locale strategy |
| `monetize-revenuecat` | IAP wiring (planned, not yet field-tested) |
| `monetize-admob` | ads wiring + the privacy re-declaration checklist (planned, not yet field-tested) |

## Install the skills (Claude Code plugin)

```sh
claude plugin marketplace add allen-hsu/mobile-shipkit
claude plugin install mobile-shipkit@mobile-shipkit
```

The eight skills under `skills/` then show up in Claude Code's skill list
(`/eas-build-doctor`, `/submit-google`, …). Other agents (codex / cursor): copy or
symlink `skills/<name>/SKILL.md` into their skills directory.

## Prerequisites

- Official Expo plugin: `claude plugin install expo@claude-plugins-official`
  (framework side, eas-app-stores, eas-update-insights)
- `asc`: `brew install rudrankriyam/tap/asc`, then `asc install-skills`
  (or this repo's submodule: `git submodule update --init`)
- `gpc`: `go install github.com/allen-hsu/gpc@latest` or `brew install allen-hsu/tap/gpc`;
  service account at `~/.config/gpc/service-account.json`. Source lives in
  [allen-hsu/gpc](https://github.com/allen-hsu/gpc), mounted here as the `cli/gpc` submodule.

## Status

- ✅ `cli/gpc` (own repo, [allen-hsu/gpc](https://github.com/allen-hsu/gpc)): shipping surface
  (auth / listing / images / bundle / track / datasafety / details) + operating surface
  (reviews / testers / countries / iap / subscriptions / pricing / mapping / sharing / vitals).
  Read-only commands and the `--dry-run` paths of listing / images / bundle are verified against
  a live app; the committing paths mirror the Python scripts used on submission day.
- ✅ `skills/`: eight SKILL.md files (six finished + two monetize skills marked as planned)
- ✅ `vendor/asc-skills` submodule
- ✅ `template/`: eas.json profile triple, `.easignore`, platform-split locales, gradle hook,
  patch-package, check-lockfile / check-ota scripts, two-store metadata skeleton, module system
  (base stack always on, native extras optional); verified on a fresh SDK 57 project end to end
