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


## Reliability fixes

- HTML is explicitly read as UTF-8 before the JavaScript syntax check.
- The temporary JavaScript file is written as UTF-8 without BOM.
- Every `node`, `clasp`, and `git` command is checked for a non-zero exit code.
- A failed command stops the update and no success message is printed.
- `git pull --rebase origin main` runs before `git push` to integrate remote changes.


## Rebuilt logo assets

The attached SKYSEF and TAMIYA image files were added again.

- Left: SKYSEF logo
- Right: TAMIYA logo
- TAMIYA is approximately 50% size
- Applied to Home, Live, and Presentation
- Home SKYSEF remains shifted 7 px upward

## One-command replacement

Place these two files in Downloads:

```text
International_Joint_Project_REBUILT_WITH_LOGOS.zip
ONE_CLICK_REBUILD_IJP.cmd
```

Then run:

```cmd
"C:\Users\fuchigami.yuta\Downloads\ONE_CLICK_REBUILD_IJP.cmd"
```

The updater uses `robocopy` to update the destination folder in place.
It does not move the open `International_Joint_Project` directory.


## TAMIYA logo size

The TAMIYA logo is now twice the size of the previous version:

- Desktop: 40% of the logo frame
- Mobile: 36% of the logo frame


## Live font-size adjustment

The team and result text in the three Live challenge columns has been reduced to approximately half of the previous size.

- Team: maximum 21 px
- Result / WAITING: maximum 18 px


## Live title alignment

All three challenge title areas reserve two lines. As a result, the first
`TEAM / WAITING` row begins at the same vertical position for Balance Beam,
Obstacle Course, and Hill Climb.
