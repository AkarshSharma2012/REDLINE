# Design and accessibility audit vs DESIGN.md (issue #61)

Audited 2026-11-14 on branch `task/61-q2-design-and-accessibility-audit-vs-des` (main at 31a6acd).
Screens: Investigations, Ask REDLINE, Cabin Check (with the lunar rover demo loaded), Gravity view,
O2 tradeoff, Accuracy. Method: read every `src/ui/*.js` module and `index.html`, computed WCAG
contrast for every token pair used on screen, simulated colour-vision deficiency, and drove the page
in headless Chrome (Playwright) at 1280 and 320 CSS px wide: screenshots, page-overflow check and a
keyboard Tab walk with computed outline styles.

## 1. Checks that pass

| Check | Result |
|---|---|
| Token contrast (DESIGN.md §2) | Every text token is ≥ 4.5:1 on every surface. Lowest: `text-3` on `surface-selected` = **4.53:1**. It passes, but it is below the "aim ≥ 5:1" in §7. |
| BURNED chip text (`bg` on `ev-burned`) | 6.68:1 |
| NEAR / NE chip text on `surface-selected` | 9.70 / 7.72 |
| Focus ring `accent` | 6.88 to 9.22 on all surfaces; 2 px solid + 2 px offset is visible on every Tab stop tested (O2 tradeoff, Investigations, Cabin Check) |
| Colour-blind check (§2.2 asks for a re-check at build time) | Machado 2009 matrices (severity 1.0, linear RGB) → CIELAB ΔE76. BURNED–NEAR: 65 normal / 40 protan / **20 deutan** / 59 tritan. BURNED–NE ≥ 77. NEAR–NE ≥ 54. This matches DESIGN.md. Greyscale luminance Y = 0.32 / 0.67 / 0.52, so the three labels are also distinct in greyscale. Chips also differ by glyph and fill style (solid / outline / dashed). |
| Reflow at 320 px (SC 1.4.10) | All six screens: no page-level horizontal scroll after the fixes below. Tables scroll inside their own container. |
| Reduced motion | `prefers-reduced-motion` turns transitions off. |

Our own calculation, so **[Inference]**: `accent` (links, focus) and `ev-ne` are close hues (ΔE 16, or 7.7 under
tritan). They stay distinct because links are always underlined and NE chips are dashed with a
circle glyph. Keep it that way.

## 2. Fixed in `src/styles.css` (CSS only)

1. `color-scheme: dark`: native selects, number spinners and scrollbars were light on the dark UI.
2. Bare `h2`/`h3`/`h4` (Accuracy, Ask, Fixes, O2 headings) used browser sizes (21 / 18.7 px, weight 700). They now follow the type scale (16/24 and 14/20, weight 600). `strong` and row headers use 600 (DESIGN.md weights stop at 600).
3. **Active tab was shown by border colour only** (SC 1.4.1). It now also gets a `surface-selected` fill and a 2 px accent bottom bar.
4. **Pressed presets** (O2 tradeoff presets) had no visual pressed state outside Cabin Check. Added a global `button[aria-pressed=true]` style: `surface-selected` and an accent bottom bar (DESIGN.md §5.3).
5. **Selected results row** had no highlight: the table marks selection with `aria-pressed` on the row button, but the CSS only targeted `tr[aria-selected]`. Added `tr:has(button[aria-pressed=true])` → `surface-selected` and a 2 px accent left bar on the first cell (§2.1).
6. **Disabled buttons** (e.g. "Load lunar rover demo" before data loads, "Apply preview") looked the same as enabled ones. They now use `text-3` and a dashed border, so the state is not shown by colour alone.
7. Button hover state (`surface-selected`).
8. **O2 slider** used the generic input box styling. It is now styled to §5.3: 4 px `border-control` track, `text-2` filled part (Firefox only, see §3), 16 px `accent` circle thumb, 24 px tall target, and a `text-3` thumb when disabled.
9. `summary` (Ask: "Optional live answer…") was 20 px tall. It is now ≥ 24 px (SC 2.5.8).
10. `input`/`select` get `max-width: 100%`, 14 px text and tabular figures. O2 inputs were inheriting the 12 px label size. Ask's `size="48"` input no longer overflows at 320 px.
11. **Investigations at 320 px scrolled the whole page to ~1020 px** because the compare pickers had long option text. Fixed (`.inv-controls > div, .inv-compare-pickers > div { max-width: 100% }`).
12. Long URLs wrap (`overflow-wrap: break-word` on body; table column widths are not affected).
13. External-link line glyph after every `target=_blank` link (§5.5). Consecutive source links got an 8 px gap: on Cabin Check and O2 they ran together as "…Report; NASA/TM-2021…1385Solid Fuel Ignition…".
14. O2 tradeoff: gap between each preset button and its source link, and between the Reset / Apply / Cancel / Retry buttons.
15. `.sr-only` utility class (ask.js asked for one; see §3).
16. `fieldset`/`legend`/`dt`/`dd` defaults: `divider` border, 6 px radius, no 40 px `dd` indent (wasted space at 320 px).
17. `::placeholder` uses `text-3` (5.09:1 on `surface-2`).
18. `.estimate-hatch`: NEAR/NE chips over the hatch get a solid `surface-1` fill, because the hatch lines crossing `text-1` were only 2.6:1.
19. `nav.tabs` padding drops to 12 px under 480 px, matching the regions.

## 3. Not fixable in styles.css (owners: see file)

| # | Screen | File | Issue | Suggested fix |
|---|---|---|---|---|
| A1 | Cabin Check | `src/ui/results-table.js` | Chips are styled with **inline styles** and Unicode glyphs (■ △ ○), padding 2px 4px, no `.chip` class. Inline styles override styles.css, so the chip rules here (§2.2, §5.2) cannot reach them. NEAR has no explicit fill. | Use `class="chip chip-burned|chip-near|chip-ne"` and drop the inline styles. |
| A2 | Cabin Check | `index.html` vs `results-table.js` | The legend uses the long form ("Burned in testing at these conditions", "Close to a measured limit"). The table chips use the short form ("Burned in comparable test", "Near measured limit"). DESIGN.md §2.2 says chips and legends use the short form, and `label.js` decides. | Generate legend text from `label.js`. |
| A3 | Cabin Check | `results-table.js` (`styleUI`) | Duplicate scoped stylesheet with hard-coded hex values (not tokens). The "Results" heading appears twice (region h2 plus the component's own h2). | Use the tokens; remove the inner heading or make it visually hidden. |
| A4 | Gravity view | `src/ui/gravity-view.js` | Injected stylesheet with hard-coded hex values; `.gv-note`/`article` panels use `border-control` instead of `divider` (§4/§5.8); `h2` is 20 px (`type-title` is reserved for the one page title). | Use the tokens and styles.css. |
| A5 | Gravity view | `gravity-view.js` | Chart points are SVG `<a>` elements. CSS outline on SVG elements is unreliable across browsers, so the focus ring may not show on chart points (SC 2.4.7). | Draw a focus ring in SVG (e.g. a `:focus` stroke on the marker) or rely on the adjacent table links. |
| A6 | O2 tradeoff | `src/ui/o2-slider.js` | Preset button text repeats itself: "101.3 kPa / 21% O2 — 101.3 kPa / 21% O2". The preview line reads "airflow Not stated in this source cm/s" (unit after a missing value). | Fix the label strings. |
| A7 | O2 tradeoff | `o2-slider.js` | Chrome/Safari cannot colour the filled part of a range track in CSS alone (§5.3 "filled part `text-2`"). Firefox shows it. | Set a `--fill` percentage on input from JS and use it in a track gradient, or accept this. |
| A8 | O2 tradeoff | `o2-slider.js` | Count rows under the slider are plain text ("3 — Burned…"), not the three small chips with glyphs that §5.3 asks for. | Render `.chip` counts. |
| A9 | Ask | `src/ui/ask.js` | Screen-reader text uses an inline style string. | Switch to the new `.sr-only` class. |
| A10 | All tables | `investigations.js`, `ask.js`, `index.html` | `.table-scroll` containers are not focusable, so keyboard users in older browsers cannot scroll wide tables (Chrome ≥ 130 makes scrollers focusable itself). Gravity view already uses `tabindex="0" role="region"`. | Add `tabindex="0"`, `role="region"` and an `aria-label` to the scroll wrappers. |
| A11 | Investigations | `investigations.js` | At 1280 px the summary table has 10 narrow columns; most cells wrap to 5–8 lines ("Not found in the sources reviewed" repeated). It works, but the table is very long. | Collapse unknown fields into a single "not in catalog" note, or move some columns into the expanded row. |
| A12 | Cabin Check | `src/ui/fixes.js` / experiments | Field names are raw keys (`thickness_mm`, `o2_pct`, `flow_speed_cm_s`) instead of readable labels with units (§3 "Always show units"). | Map keys to labels, e.g. "Thickness (mm)". |
| A13 | Tokens | DESIGN.md | `text-3` on `surface-selected` = 4.53:1, below the "aim ≥ 5:1". Metadata in selected rows is still AA. | Optional: lighten `text-3` slightly, or keep `text-3` out of selected rows. |

## 4. How to reproduce

```
python -m http.server 8761          # from the repo root
# open http://localhost:8761/index.html, visit each tab at 1280 and 320 px wide,
# Cabin Check → "Load lunar rover demo", then O2 tradeoff; Tab through each screen.
node --test                          # 96/96 pass
```
Contrast and colour-vision numbers come from the WCAG relative-luminance formula and the Machado
2009 matrices, run in Node. They are our own calculations, not a source's.
