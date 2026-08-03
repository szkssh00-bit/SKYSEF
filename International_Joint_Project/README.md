# SKYSEF 2026 International Joint Project

## Logo layout

- Left: SKYSEF logo
- Right: TAMIYA logo
- TAMIYA logo is displayed at approximately 50% size
- Home SKYSEF logo is shifted 7 px upward

The same left/right arrangement is used on Home, Live, and Presentation.

## Live display

- Three challenge columns
- Five teams per screen
- Automatic change every 6.5 seconds
- Challenge heading: up to 48 px
- Team number: up to 42 px
- Result: up to 36 px
- Rank: up to 38 px
- Row height: 76 px
- `No result` is displayed as `WAITING`

## Update from inside the project folder

Run:

```cmd
UPDATE_ALL.cmd "Update IJP system"
```

This command performs:

1. JavaScript syntax check
2. `clasp push --force`
3. Existing GAS deployment update
4. `git add`
5. `git commit`
6. `git push origin main`

## Public site

```text
https://szkssh00-bit.github.io/SKYSEF/International_Joint_Project/Index.html
```
