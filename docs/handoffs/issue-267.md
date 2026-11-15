# Issue #267: compact NASA-inspired mission dashboard

Base: main 37ea4aa (unchanged at report time). Files: index.html, src/styles.css, src/main.js (presentation only), tests/mission-dashboard.test.mjs.

## Before / after
- Header. Before: title plus four stacked prose paragraphs (scope, P/D/S framing, partial-gravity note, dataset line). After: one row with `REDLINE` (28 px) and the subtitle "Cabin fire evidence workbench · NASA PSI combustion data", plus an evidence-status rail with five cells: Evidence rows, Verified, Labels = verified rows only, Moon/Mars = estimate with a 0 g–1 g bound, and Research preview · not certification. All earlier wording and `#dataset` now sit in a closed native `<details>` called "Scope and limits".
- Rail values. `#rail-rows` and `#rail-verified` start as the word "loading". `showDataset` in main.js fills them from the loaded evidence file (currently 45 and 0). Zero verified rows add `data-state="none"`, which draws a dashed outline. If loading fails, both show "unavailable". The markup contains no hard-coded counts.
- Research-preview notices (5 tabs). Before: a dashed box per tab with an h2/h3 and a full paragraph. After: one line per tab (a `Research preview` tag plus a short hold, e.g. "Rankings held for scientific review") inside a closed native `<details>`. The full original sentence is the disclosed `<p>`. The tab labels show "Research preview" as an inline dashed tag, so tabs stay one line high.
- Cabin Check. Region headings are now Cabin setup / Results / Evidence. The duplicate h2s that the modules render ("Cabin Check", "Results") are hidden with display:none, and aria-labelledby still resolves. The injected `.cabin-ui` box-in-box padding and background are removed and fieldset/label spacing is tighter. The rover demo and Evaluate cabin buttons are full-width crimson primaries (#C62828, white text 5.6:1, fill vs bg 3.4:1). This hue is distinct from the reserved ev-burned vermilion and is a deliberate user-requested deviation from DESIGN.md §1 "red only for BURNED".
- Controls are at least 40 px (tabs 44 px). Checkboxes and radios stay at 24 px. The summary chevron is a CSS line glyph. There are no gradients other than the existing DESIGN.md estimate hatch, and no glow, emoji or logos. Tables keep local `overflow-x`. Below 1080 px the rail becomes an auto-fit grid (minmax 132 px), and at 480 px or less the title drops to 20 px.
- Unchanged: the six tab IDs, arrow-key tab behaviour (main.js wireTabs is untouched), all source links, label/science wording and data.

## Tests
- New file `tests/mission-dashboard.test.mjs` (8 tests): compact header, no static rail numbers, real 45/0 counts through `showDataset` with a stub doc, closed native details with the summary as first child and the full wording kept, one-line notices for all 5 preview tabs, no script toggling of details and no CSS hiding the disclosed text, tab IDs and 40/44 px sizes, and a no-gradient/glow/emoji check with files under 500 lines.
- `node --check` passed on src/main.js and the new test. styles.css has 467 lines and index.html has 104.
- Full `node --test` before the change: 1163 tests, 1119 pass, 0 fail, 44 todo (issue #265 receipt). After: 1171 tests, 1127 pass, 0 fail, 0 cancelled, 0 skipped, 44 todo; exit 0.
- I did not start a browser or server. The coordinator still needs to visually check at 1440, 390 and 320 px.
