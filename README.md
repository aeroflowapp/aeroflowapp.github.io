# AeroFlow site

Static landing page + Sparkle update feed for AeroFlow. Hosted on GitHub Pages.

## Launch runbook (owner steps — ~20 minutes total)

1. **GitHub** (once): create an account at github.com/signup if needed. Then:
   ```sh
   # from this directory
   gh auth login                 # or create the repo in the web UI
   gh repo create aeroflow-site --public --source . --push
   ```
   Enable Pages: repo ▸ Settings ▸ Pages ▸ Deploy from branch ▸ `main` / root.
   Site appears at `https://<user>.github.io/aeroflow-site/`.

2. **Lemon Squeezy** (once): create a store at lemonsqueezy.com.
   - New product “AeroFlow” — $14.99, single payment.
   - Product ▸ **License keys: ON** (suggested activation limit: 2).
   - Note the **store id** (Settings ▸ Stores — the number) and the product’s **checkout link** (Share ▸ copy link).

3. **Stamp the URLs**:
   ```sh
   bash finalize.sh --user <github-user> --checkout <checkout-link>
   git commit -am "stamp real URLs" && git push
   ```

4. **App side** (Claude does this, or by hand): put the printed `SUFeedURL`,
   `AFLicenseStoreID`, and `AFBuyURL` values into
   `SupportFiles/AeroFlowApp-Info.plist` in the app repo, rebuild + notarize the
   DMG (`make-dmg.sh`), copy it to `downloads/`, add the release `<item>` to
   `appcast.xml` (template inside, signed with Sparkle’s `sign_update`), push.

5. **Test the loop**: buy with LS test mode ON, activate in the app, then flip
   the store to live mode.

## Files

- `index.html` — the page. Buy buttons carry `__LEMON_CHECKOUT_URL__` until finalize.sh runs.
- `appcast.xml` — Sparkle feed. Empty channel is valid (“no updates yet”). `__AEROFLOW_BASE_URL__` until finalize.sh runs.
- `downloads/` — DMGs live here (`AeroFlow.dmg` = latest; versioned copies for the appcast).
- `assets/` — screenshots.
- `finalize.sh` — stamps real URLs (idempotent).

## Support email

The page's Support link currently points at the owner's personal Gmail — swap in
a dedicated address in `index.html` if preferred before announcing.
