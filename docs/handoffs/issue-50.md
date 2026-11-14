# HANDOFF — issue #50 (B1/B0: scaffold the app)

STATUS: DONE

## Done
- `index.html` at repo root: loads `src/styles.css` and `src/main.js` (`type="module"`); three regions per DESIGN.md §4 (Cabin left 320 px, Results centre, Evidence right 380 px) with mount points `#o2-slider`, `#cabin-form`, `#status` (polite live region), `#results-table`, `#fixes`, `#evidence-panel`; a label-key legend showing the three chips.
- `src/styles.css`: all DESIGN.md tokens as CSS custom properties (neutrals, `ev-*`, type scale classes, spacing 2–32, radii), focus ring, table, inputs/buttons (24 px min target), the three label chips (`.chip-burned` solid + filled square, `.chip-near` outline + outlined triangle, `.chip-ne` dashed + hollow circle; glyphs are SVG masks in `currentColor`), qualifiers (`.flag`, `.tag-cross-gravity`, `.estimate-hatch`, `.caveat`), reduced-motion. Stacks to one column under 1080 px.
- `src/main.js`: fetches `data/evidence.json`, calls `labelCabin`, hands results to the UI stubs. Shows "Evidence file could not be loaded (…)" while that file does not exist (expected until B2).
- Stub modules (S1 §2 layout), each with TODO body and a fixed stub return:
  - `src/rules/compare.js` `compareRow(query, row, ctx)`; `src/rules/label.js` `labelMaterial`, `labelCabin`; `src/rules/baseline.js` `baselineLabel` — names binding per S1 §3.1.
  - Names **chosen by this task** (S1 gives none; owners may rename but must update `tests/smoke.test.mjs`): `normalize.js` `o2PartialKpa`, `gravityClass`; `lunar.js` `lunarEstimate`; `experiments.js` `suggestExperiments`; `schema/validate.js` `validateEvidence`; `ui/*` `renderCabinForm`, `renderResultsTable`, `renderEvidencePanel`, `renderO2Slider`, `renderFixes`.
  - `labelCabin` takes V2 U5's shape: `{ conditions: {...}, materials: [{ material_id, form, thickness_mm, width_mm }] }`.
- `package.json`: only `"type": "module"` and `"test": "node --test"`; no dependencies.
- `tests/smoke.test.mjs`: index.html loads main.js as module; every module exports its function; `labelCabin` returns an S1-shaped result; CSS has the tokens and chips.
- README: "Run locally" section.

## Key decisions / notes for other tasks
- Stub files outside this task's owned list (`src/rules/*`, `src/schema/*`, `src/ui/*`) were created because the issue asks for them. If your branch also adds one, resolve the add/add conflict by taking your version.
- `data/` and `tests/fixtures/` are not created (empty dirs are not tracked); B2 / engine tasks add them.

## GitHub Pages check (result)
- `gh repo view`: repo `AkarshSharma2012/REDLINE` is **PRIVATE**; `gh api repos/.../pages` returns **404** (Pages not enabled).
- Pages on a private repo needs a paid plan for the owner (GitHub Pro — included in the Student Developer Pack — or Team); otherwise make the repo public. Not changed here (repo setting, needs the owner).
- The layout already works for Pages: `index.html` is at the root of `main`, all paths are relative, no build step. To enable: Settings → Pages → Source "Deploy from a branch", `main` / `(root)`.
- Fallback: demo from `python -m http.server` on a laptop.

## How it was tested
- `node --test` (Node v24.17.0): 4/4 pass.
- `python -m http.server 8765` (Python 3.14): `/`, `src/main.js`, `src/styles.css`, `src/ui/fixes.js` return 200 with correct MIME types; `data/evidence.json` 404 shows the load-error message.
- Headless Edge screenshots at 1400 px (three columns, chips render with glyphs) and inside a 320 px iframe (stacks, no horizontal page scroll, chips wrap).

## Next (other tasks)
- B2 builds `data/evidence.json`; B3/B4 replace rules stubs; B5/B7/B8/B9 replace UI stubs and wire `main.js` (load-error retry button TODO is in `main.js`).
