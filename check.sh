#!/bin/bash
#
# Pre-publish check for the AeroFlow site.  bash check.sh
#
# WHY THIS EXISTS: while rewriting the page the checkout UUID was mistyped by a
# single character (…8785… for …8789…). The page looked perfect, every button
# was styled, and all four Buy links led to a dead checkout — a silent, total
# loss of revenue that no amount of visual review would have caught, because a
# wrong UUID looks exactly like a right one. Everything below is a check that a
# human eye cannot reliably perform.
set -uo pipefail
cd "$(dirname "$0")"

APP_PLIST="$HOME/TEMP/AeroFlow/SupportFiles/AeroFlowApp-Info.plist"
BASE="https://khubaevbaysangur-sys.github.io/aeroflow-site"
fail=0
ok()   { printf "  \033[32m✓\033[0m %s\n" "$1"; }
bad()  { printf "  \033[31m✗\033[0m %s\n" "$1"; fail=$((fail+1)); }

echo "── checkout link matches the shipping app ──"
if [[ -f "$APP_PLIST" ]]; then
  REAL=$(/usr/libexec/PlistBuddy -c "Print :AFBuyURL" "$APP_PLIST" 2>/dev/null)
  # Domain-agnostic: the store answers on several hostnames (quellheat.com,
  # store.quellheat.com, aeroflow.lemonsqueezy.com) and all of them resolve to
  # the same cart. Hardcoding one meant this check could not see a mismatch
  # that was only a hostname apart — which is exactly the state it found the
  # site in. What matters is that the page and the shipping app agree.
  SITE=$(grep -o 'https://[a-z0-9.-]*/checkout/buy/[a-f0-9-]*' index.html | sort -u)
  COUNT=$(printf '%s\n' "$SITE" | grep -c . || true)
  if [[ "$COUNT" -ne 1 ]]; then
    bad "site has $COUNT distinct checkout URLs (expected exactly 1): $SITE"
  elif [[ "$SITE" == "$REAL" ]]; then
    ok "checkout URL matches the app's AFBuyURL"
  else
    bad "checkout URL MISMATCH — a buy button would 404"
    echo "      app:  $REAL"
    echo "      site: $SITE"
  fi
else
  bad "app plist not found at $APP_PLIST — cannot cross-check the checkout URL"
fi

echo "── no third-party resources (keeps the CSP honest) ──"
# Only FETCHED resources can violate the CSP. A canonical link and an ordinary
# <a href> are not fetched — flagging them made this check cry wolf, and a check
# that always fails is a check nobody reads. Script, style, image and font
# sources are what actually matter here.
EXT=$(grep -oE '<(script|img|iframe|source|video|audio)[^>]*src="https?://[^"]*"' index.html || true)
EXT="$EXT$(grep -oE '<link[^>]*rel="(stylesheet|preload|prefetch)"[^>]*href="https?://[^"]*"' index.html || true)"
EXT="$(printf '%s' "$EXT" | grep -vE 'khubaevbaysangur-sys|quellheat\.com' || true)"
if [[ -z "$EXT" ]]; then ok "zero external resources"; else bad "external resources present:"; echo "$EXT" | sed 's/^/      /'; fi

echo "── price is consistent ──"
# The $10,000 goal figure (the watch-giveaway meter) is the ONE sanctioned
# dollar amount on the page; strip it before hunting stale $-prices so the
# check keeps catching a resurrected $14.99 without crying wolf at the goal.
if sed 's/\$10,000//g' index.html | grep -q '14\.99\|\$1[0-9]'; then bad "a stale dollar price is still on the page"; else ok "no stale dollar prices"; fi
if [[ $(grep -c 'kr&nbsp;149\|kr 149' index.html) -ge 3 ]]; then ok "kr 149 stated in the hero, pricing card and nav"; else bad "kr 149 appears fewer than 3 times"; fi

echo "── local assets exist ──"
for a in $(grep -oE 'src="[^"h][^"]*"' index.html | sed 's/src="//;s/"//' | sort -u); do
  [[ -f "$a" ]] && ok "$a" || bad "missing asset: $a"
done
[[ -f site.js ]] && ok "site.js" || bad "missing site.js"

echo "── appcast advertises a LIVE item (not one inside a comment) ──"
python3 - <<'PY' || fail=$((fail+1))
import sys, xml.etree.ElementTree as ET
try:
    items = ET.parse('appcast.xml').getroot().find('channel').findall('item')
except Exception as e:
    print(f"  \033[31m✗\033[0m appcast will not parse: {e}"); sys.exit(1)
if not items:
    print("  \033[31m✗\033[0m appcast has no live <item> — updates would silently never appear"); sys.exit(1)
v = items[0].findtext('{http://www.andymatuschak.org/xml-namespaces/sparkle}shortVersionString')
print(f"  \033[32m✓\033[0m appcast advertises {v} ({len(items)} item(s))")
PY

echo
if [[ $fail -eq 0 ]]; then
  echo "All checks passed — safe to publish."
else
  echo "$fail check(s) FAILED — do not publish."; exit 1
fi
