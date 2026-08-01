# SKYSEF 2026 International Joint Project

## Why GitHub Pages buttons previously did not work

The GAS user interface uses `google.script.run` and Apps Script template syntax.
Those features only work when the page is served by Google Apps Script. They do
not work when `GAS_Index.html` is opened directly from GitHub Pages.

Therefore:

- `Index.html` is a GitHub Pages launcher that redirects to the GAS web app.
- `GAS_Index.html` is the actual Apps Script interface.
- `Code.gs` loads `GAS_Index.html`.

The launcher preserves query parameters such as:

```text
?id=SKYSEF2026-207
?mode=live
?mode=staff
```

## One-command deployment

Run this command inside `International_Joint_Project`:

```cmd
deploy-all.cmd "Update message"
```

It performs:

1. `clasp push --force`
2. Update the existing GAS web-app deployment
3. `git add`
4. `git commit`
5. `git push origin main`

## Public URLs

GitHub Pages launcher:

```text
https://szkssh00-bit.github.io/SKYSEF/International_Joint_Project/Index.html
```

GAS web app:

```text
https://script.google.com/macros/s/AKfycbxCP7Yb2_xw6PRdPOiFhRAMokDA9OEmR12fHjn57I5Mz_BGxF3_Nv8XYrf95xWKB-WrpA/exec
```

## Live screen

The live screen shows three challenge columns simultaneously. Five teams are
shown at a time, and the displayed team range changes automatically every
6.5 seconds. No manual scrolling is required.
