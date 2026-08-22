# QuellHeat site

Landing page and Sparkle update feed for [QuellHeat](https://quellheat.com/),
a Mac fan-control app. Static, hosted on GitHub Pages.

**This repo stays live forever.** Every shipped DMG checks `appcast.xml` here
for updates. Taking it down, renaming it, or breaking the URL structure strands
every installed copy silently — Sparkle just reports "no updates".

## Shipping a release

One command, run from the **app** repo, not this one:

```sh
bash SupportFiles/scripts/release.sh 1.4.0 "What changed, in the user's words."
```

It stamps the version, builds and notarizes the DMG, signs it with the Sparkle
EdDSA key, writes the appcast item, copies the DMG into `downloads/`, stamps the
footer version in `index.html`, and pushes. Do not do these by hand: each step
fails silently on its own, and doing them in one scripted pass is what keeps the
update path honest.

It stages only `appcast.xml`, `index.html` and the DMGs. Any other change here —
new screenshots, copy edits — needs its own commit.

## Before you push

```sh
bash check.sh
```

Verifies the things an eye cannot: that the checkout URL matches the one
compiled into the shipping app, that the appcast's signature and byte length
match the DMG actually in `downloads/`, that every referenced asset exists. It
exists because a single mistyped character in the checkout UUID once sent all
four Buy buttons to a dead checkout, on a page that looked perfect.

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole page — styles inline, no third-party requests. |
| `site.js` | Reveal-on-scroll and parallax. Same-origin; the page is fully readable without it. |
| `appcast.xml` | Sparkle feed. Written by `release.sh` — do not hand-edit. |
| `downloads/` | `QuellHeat.dmg` is the latest; `AeroFlow.dmg` is a legacy alias kept for old links; versioned copies are what the appcast points at. |
| `assets/` | Screenshots, and `backdrops.jpg` — the seven window backdrops as one strip. |
| `check.sh` | Pre-publish verification. |

Only keep DMGs the appcast still references. Old ones are dead weight in a repo
that is cloned on every deploy.

## Content Security Policy

The page sets a strict CSP: `default-src 'none'`, with `script-src 'self'` the
only relaxation. No CDN, no analytics, no fonts fetched — type is New York over
SF, both of which every visitor to a macOS-app site already has. Nobody but
GitHub can see who visits. Adding any third-party resource means loosening this,
so don't.

## Support

The Support link points at the owner's personal address. Swap in a dedicated one
in `index.html` before any wider announcement.
