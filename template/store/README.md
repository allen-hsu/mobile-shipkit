# store/ — canonical store copy for both stores

```
metadata/app-info/<locale>.json        ASC app-level: name(30) subtitle(30) privacyPolicyUrl
metadata/version/<ver>/<locale>.json   ASC per-version: description(4000) keywords(100) promotionalText(170) whatsNew supportUrl marketingUrl
play/<locale>.json                     Play listing: title(30) shortDescription(80) fullDescription(4000)
play-notes/<locale>.txt                Play release notes (500)
datasafety-no-collection.csv           the minimal valid Data safety form
```

Locale codes differ: ASC uses `zh-Hant`, `ja`, `en-US`; Play uses `zh-TW`, `ja-JP`, `en-US`.
ASC descriptions reject emoji; Play accepts them — keep the two copies separate on purpose.

Push with:
  asc metadata push --dir store/metadata            (see skills/store-listing, vendor asc-metadata-sync)
  gpc listing push --dir store/play
  gpc track set … --notes-dir store/play-notes
  gpc datasafety push store/datasafety-no-collection.csv
