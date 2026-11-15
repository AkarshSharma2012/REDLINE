# Issue #267: compact NASA-inspired mission dashboard (revision B1, PR #270)

Base: main 37ea4aa. Files: index.html, src/styles.css, src/main.js (presentation only), tests/mission-dashboard.test.mjs. No data or rules changes.

## Revision B1 (replaces the five-cell rail)
- Header: one wrapping flex row. `REDLINE` (24 px, 20 px under 480 px), subtitle "Cabin fire evidence workbench", rail `Evidence 45 | Verified 0`, one visible line "Research preview · not certification", closed native `<details>` "Scope and limits". All text 14 px.
- Rail has exactly two `dt/dd` pairs. `#rail-rows` and `#rail-verified` start as "loading"; `showDataset` fills them from data/evidence.json; load failure shows "unavailable". Zero verified rows get a dashed outline (`data-state="none"`).
- Removed: the 5-cell grid, the Labels cell, the Moon/Mars cell and all "Estimate, 0 g–1 g bound" wording. There is no reviewed endpoint pair, so no lunar bound is claimed. The original partial-gravity caveat (no partial-gravity PSI data; estimates are never lunar measurements) stays verbatim in Scope and limits, together with a new note that labels use verified rows only and unverified rows never produce a label.
- Colour: removed `--primary`/`--primary-hover` crimson tokens. Per DESIGN.md (no filled coloured primary; red only for BURNED), `.btn-primary` and the cabin submit use `surface-2` with a `text-2` border and weight 600.
- Tabs: the visible tag is now "Preview" (aria-hidden), and the sr-only text ", Research preview" keeps the full status in the accessible name. Tab IDs, roving focus and Escape are unchanged.
- Estimated header height (no browser run): about 145 px at 390 px and about 165 px at 320 px (the subtitle wraps). Desktop fits in one row of about 57 px.

## Tests
- mission-dashboard.test.mjs now checks: exactly two rail counts, starting as "loading"; one visible Research preview line; no Labels, Moon or Mars text; no `bound` wording anywhere in index.html; caveat kept in the disclosure; no crimson tokens; vermilion only on `--ev-burned`; neutral primary; no grid rail; 14 px rail text; no nowrap or clipping; compact tab tags keep sr-only "Research preview".
- Full `node --test`: 1175 tests, 1131 pass, 0 fail, 44 todo (pre-existing), exit 0. `node --check` on src/main.js passes.
- No server or browser was started. The coordinator still needs a real-browser check at 1440, 390 and 320 px.
