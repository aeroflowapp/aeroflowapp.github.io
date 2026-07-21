#!/usr/bin/env bash
# Stamp the real URLs into the AeroFlow site once the accounts exist.
#
#   bash finalize.sh --user GITHUB_USER [--repo aeroflow-site] --checkout https://YOURSTORE.lemonsqueezy.com/buy/PRODUCT
#
# What it does (idempotent):
#   - appcast.xml : __AEROFLOW_BASE_URL__      -> https://USER.github.io/REPO
#   - index.html  : __LEMON_CHECKOUT_URL__     -> your Lemon Squeezy checkout link
# Then prints the two values the APP build needs (SUFeedURL + AFLicenseStoreID reminder).
set -euo pipefail
cd "$(dirname "$0")"

REPO="aeroflow-site"; USER=""; CHECKOUT=""
while [[ $# -gt 0 ]]; do case "$1" in
  --user) USER="$2"; shift 2;;
  --repo) REPO="$2"; shift 2;;
  --checkout) CHECKOUT="$2"; shift 2;;
  *) echo "unknown arg: $1" >&2; exit 1;;
esac; done
[[ -n "$USER" ]] || { echo "need --user GITHUB_USER" >&2; exit 1; }

BASE="https://${USER}.github.io/${REPO}"
sed -i '' "s|__AEROFLOW_BASE_URL__|${BASE}|g" appcast.xml
if [[ -n "$CHECKOUT" ]]; then
  sed -i '' "s|__LEMON_CHECKOUT_URL__|${CHECKOUT}|g" index.html
else
  echo "NOTE: no --checkout given; Buy buttons still hold __LEMON_CHECKOUT_URL__."
fi

echo ""
echo "Site stamped for ${BASE}"
echo ""
echo "Now the APP needs (in SupportFiles/AeroFlowApp-Info.plist of the app repo):"
echo "  SUFeedURL        = ${BASE}/appcast.xml"
echo "  AFLicenseStoreID = <your Lemon Squeezy store id (Settings ▸ Stores — the number)>"
echo "  AFBuyURL         = ${CHECKOUT:-<your checkout link>}"
echo "…then rebuild the DMG (make-dmg.sh) so the shipped app carries them."
