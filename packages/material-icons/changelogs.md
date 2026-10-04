# 📌 Change Log

---
## • Version 2.0.0 (2026-10-04)

- Migrated to the new `fileIcons` pack API (CodeMirror / Acode 1012+). Removed the legacy Ace CSS injection.
- Icons now load from a single data-URI stylesheet instead of ~800 individual SVG requests.
- Synced with vscode-material-icon-theme upstream: ~240 new icons (copilot, cursor, biome, astro-config, nx, toml…) and 1400+ new file/folder associations.
- Added generic `document` fallback icon for unmatched files.
- Fixed off-center/clipped artwork (`git`, `vue`, `hex`, `roblox`, `codeowners`, `adonis`, `moonscript`) and normalized viewBoxes.
- Added missing mappings for `js`, `ts`, `html`, `php` and dotfiles (`.env`, `.npmrc`, …).
- New Go-powered build (`npm run build` in ~3s).

---
## • Version 1.2.4

- Legacy Ace-based icon injection (deprecated).
