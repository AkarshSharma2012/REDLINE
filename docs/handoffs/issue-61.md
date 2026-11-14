# HANDOFF — issue #61 Q2: Design and accessibility audit vs DESIGN.md

STATUS: DONE

## Done
- Audited all six screens (Investigations, Ask, Cabin Check + rover demo, Gravity view, O2 tradeoff, Accuracy) against DESIGN.md: contrast, spacing, type, chip colours (colour-blind sim), focus, reflow.
- CSS-only fixes in `src/styles.css` (19 items, listed in `research/design-audit.md` §2). The main ones: the active tab was shown by colour alone; pressed presets and selected result rows had no highlight; disabled buttons looked enabled; the O2 slider is now styled to §5.3; Investigations overflowed at 320 px; source links ran together; added `color-scheme: dark` and a `.sr-only` class.
- Non-CSS issues for other owners: `research/design-audit.md` §3 (A1–A13). The most important: results-table chips use inline styles and bypass `.chip` (A1); legend vs chip wording mismatch (A2); O2 preset label text is duplicated (A6).

## How it was tested
- `node --test`: 96/96 pass.
- `python -m http.server 8761`, then headless Chrome (Playwright, script kept outside the repo) at 1280 and 320 px: no page-level horizontal overflow on any screen; Tab walk shows a 2 px accent outline on every stop; screenshots reviewed.
- Contrast and Machado CVD simulation computed in Node (numbers in the audit file).

## Next (other owners)
- Act on audit §3 items; ask.js can switch to `.sr-only`; results-table.js can switch to `.chip` classes.
