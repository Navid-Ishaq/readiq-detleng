# Read IQ — validation

## Passed

- Four source Word files converted: 53, 32, 31, 32 records; 148 total.
- First/last codes: Q1 P01-S1-1 → P01-S2-46; Q2 P01-S2-47 → P01-S2-78; Q3 P01-S2-79 → P01-S2-109; Q4 P01-S2-110 → P01-S2-141.
- Every non-header table row accounted for. Arabic/code and Urdu/English fields checked against original cell text. Only delimiters and surrounding whitespace removed; wording and diacritics not rewritten.
- Source DOCX files copied byte-for-byte; only first filename normalized to IQV-Para-01-01.docx.
- All seven language combinations have complete fields for all 148 records. No selection has an explicit empty state.
- All generated document URLs point to included JSON files.
- Folder discovery, file rename and deletion verified in an isolated temporary project.
- Malformed DOCX rejected before touching previous generated output.
- JavaScript syntax checked; required DOM elements and unique IDs checked; three language checkboxes present; no large library-selection panel.
- ZIP corruption and flat-root packaging checked.

Run `python tools/check.py` to repeat the extraction/build integrity checks. These are not browser interaction tests.

## Limits

The browser preview relay was unavailable in this environment. Fresh visual/mobile/browser interaction testing could not be completed. Before publishing, use START_WINDOWS.bat to check: quarter selection, all language combinations, gear controls, sticky Bismillah, font slider, search, fullscreen, and narrow/mobile layout. No commit, push, DNS edit or deployment has been performed by this delivery.

PUSH.ps1 is supplied for Windows PowerShell 5.1+ and Git; it has not been executed against your Windows machine or authenticated repository in this delivery.
