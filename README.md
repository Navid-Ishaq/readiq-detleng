# Irfan-ul-Quran — DeTLeng Read IQ

Website target: https://readiq.detleng.com/
Repository: https://github.com/Navid-Ishaq/readiq-detleng

## Extract directly into the existing project root

This ZIP has **no enclosing readiq-detleng folder**. Extract its contents directly into:

`D:\DETLENG2\readiq-detleng`

The content root is named exactly `Read Irfanul Quran`, not `content`:

`D:\DETLENG2\readiq-detleng\Read Irfanul Quran\Para-01\IQV-Para-01-01.docx`

Four supplied Para-01 files are included. The uploaded first-quarter filename's `(2)` suffix has only been removed from its filename; its DOCX bytes are unchanged. Add the remaining Para-02 through Para-30 folders alongside Para-01. Copy your folders from `C:\Users\mnvid\Downloads\Read Irfanul Quran` into this project's `Read Irfanul Quran` folder, avoiding another nested copy of the same parent folder.

## Naming and automatic discovery

- Folder: `Para-01` through `Para-30`.
- Files: `IQV-Para-01-01.docx`, `IQV-Para-01-02.docx`, `IQV-Para-01-03.docx`, `IQV-Para-01-04.docx`; replace the Para number for later folders.
- Library discovers Para folders and quarter files automatically at build time. Folders sort numerically. Each has four compact rows, not cards or a separate selection screen.
- 01: First Quarter — پہلا ربع
- 02: Second Quarter — نصف
- 03: Third Quarter — تیسرا ربع
- 04: Fourth Quarter — آخری ربع
- A missing quarter appears disabled. An empty Para folder can be retained in Git using `.gitkeep`; PUSH.ps1 creates these for empty folders.

## Reading rules

The converter consumes every valid verse row from the complete selected Word file. It discards the serial-number column and the table header from display. It separates the code from Arabic in column 2 and splits Urdu/English at the first spaced en/em dash in column 3. Other punctuation, spelling, diacritics, notes and wording are retained from the source; no translations or verses are generated, corrected or inferred.

Each verse displays its small code once at the top. Selected text follows in fixed order: Arabic, Urdu, English. Arabic is larger and bold; translations have separate paragraphs and their proper reading directions. A single selected language still displays the code for every record. All seven nonempty combinations are supported; no selections produces a clear empty state. Selections and last quarter are remembered locally on that browser.

Malformed rows, duplicate codes within a file, duplicate quarter files, invalid filenames or mismatched folder numbers fail the build with a source filename/row error. They are not silently skipped. A failed build does not replace the last hosted deployment. To keep this behavior predictable, preserve the supplied three-column Word structure.

## Local preview

Python 3 and Git are needed for the standard workflow; no pip or npm dependencies.

Double-click `START_WINDOWS.bat`, or run `python tools/serve.py`. Local preview: http://127.0.0.1:8101/. Keep the terminal open. The local server checks source changes every three seconds; the browser checks the catalogue every 30 seconds. Refresh for interface changes. Do not open index.html directly with file:// because it loads JSON files.

Manual build: `python tools/build.py`.

Generated output goes into `_site/` and includes app.js, catalogue and all quarter payloads. Do not edit generated output. Edit `interface.html`, `app.js`, or the Word source files instead. The ZIP includes a ready-built snapshot for convenience; Git ignores it.

## Publish and later updates

Nothing has been pushed or deployed by this delivery.

1. Extract into the project root; review the local preview.
2. Copy the rest of your Para folders into `Read Irfanul Quran`.
3. One-time GitHub Pages setting: Settings → Pages → Build and deployment → Source → **GitHub Actions**. The screenshot showed Deploy from a branch; the conversion workflow requires GitHub Actions. Do not configure an additional Jekyll or Static HTML workflow.
4. Double-click `PUSH.cmd`. On the first run it adopts the existing remote main history while preserving local files. It then stages local additions, edits, renames and deletions, including PUSH.cmd/PUSH.ps1 themselves. Local project files are authoritative on this initial adoption; remote files absent locally are staged for deletion. Review your local content first.
5. Subsequent runs fetch remote history and stop if someone made an unseen remote change. There is no force-push and no separate publish folder.
6. GitHub Actions builds and deploys `_site`. When the run is green, open https://readiq.detleng.com/ and reload. Open readers check for new catalogue revisions every 30 seconds. Build success is separate from local push success.
7. Preserve the existing custom domain/DNS. Enable Enforce HTTPS in Pages when available.

The script requires an existing remote `main` branch, as shown in your setup. GitHub authentication uses your installed Git credentials; no credentials belong in these files.

## Interface baseline

The reader uses the established sun icon, Noto Naskh Arabic font, soft changing backgrounds, font slider, search and fullscreen. Mobile reading settings are collapsed behind a gear button. Bismillah remains sticky below the dynamically sized header. Language checkboxes and four quarter rows remain inside the compact Library dropdown; selecting a quarter closes it and opens the document immediately. There is no Continue screen or forced full-window library selector.

Google Fonts requires internet when the font is not cached. Fallback fonts remain available. Browser fullscreen support varies, especially on mobile.
