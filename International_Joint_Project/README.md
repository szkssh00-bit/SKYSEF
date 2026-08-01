# SKYSEF 2026 International Joint Project

## Files

- `Code.gs`: Google Apps Script backend
- `Index.html`: GAS HTML frontend
- `assets/tamiya-logo.jpg`: TAMIYA logo
- `assets/skysef-2026-logo.jpg`: SKYSEF 2026 logo
- `appsscript.json`: Apps Script manifest

## GitHub Pages asset URLs

- `https://szkssh00-bit.github.io/SKYSEF/International_Joint_Project/assets/tamiya-logo.jpg`
- `https://szkssh00-bit.github.io/SKYSEF/International_Joint_Project/assets/skysef-2026-logo.jpg`

`Index.html` uses these absolute URLs so the images can be displayed from the deployed GAS web app.

## Important

GitHub Pages can host the image files and static documentation, but it cannot execute
`google.script.run` or the Apps Script backend. Deploy the application itself as a
Google Apps Script web app.

For local Git/GitHub management, use `clasp` to pull and push the Apps Script project.
Do not commit `.clasprc.json`, because it contains authentication credentials.
