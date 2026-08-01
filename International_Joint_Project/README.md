# SKYSEF 2026 International Joint Project

## Architecture

The GitHub Pages site is the actual user interface.

```text
GitHub Pages Index.html
        ↓ JSONP API
Google Apps Script Code.gs
        ↓
Google Spreadsheet
```

There is no page redirect and no `google.script.run`.

## Public site

```text
https://szkssh00-bit.github.io/SKYSEF/International_Joint_Project/
```

## GAS API test

```text
https://script.google.com/macros/s/AKfycbxCP7Yb2_xw6PRdPOiFhRAMokDA9OEmR12fHjn57I5Mz_BGxF3_Nv8XYrf95xWKB-WrpA/exec?api=status
```

## Deployment

Run from this folder:

```cmd
deploy-all.cmd "Update IJP system"
```

This pushes the GAS API, updates the existing GAS deployment, commits the
GitHub changes, and pushes the `main` branch.
