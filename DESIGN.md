# REDLINE — DESIGN.md (UI rules)

Rules for every UI task (S1 B5, B7, B8, B9). Rules only; no code. Where this file and the
wording table in `label.js` disagree on **text**, `label.js` wins ([S4] §6). Where this file and
AGENTS.md disagree on **science wording**, AGENTS.md wins.

Notation: **[Inference]** = our own design choice, not a sourced fact. Every numeric
accessibility threshold below cites WCAG 2.2 by success criterion (SC). Contrast ratios for our
tokens were computed with the WCAG relative-luminance formula ([WCAG22] §6 "relative
luminance", "contrast ratio"); the numbers are our calculation, not a source's.

---

## 1. Principles

1. **A tool, not a poster.** Restrained, dark, high-contrast, dense. Reference feel: Linear,
   Raycast, mission-control consoles (style direction from issue #27, not a sourced fact).
2. **The evidence is the interface.** Every label is next to its reason, its flags and a
   source link. Nothing decorative competes with that.
3. **Never colour alone.** Every state that has a colour also has text and a shape or line
   style ([WCAG22] SC 1.4.1, Level A; [OkabeIto] "Most important practical points").
4. **Uncertainty is visible, not hidden.** Weaker comparisons look weaker (outlined, dashed,
   flagged); they are never styled the same as a clean comparison ([R1] §4 "FLAG": show the
   label as weaker and say why).
5. **Calm by default.** Motion only to show a value changed; none that moves layout.

### Banned

- Gradients, glass/blur/frosted panels, glow, drop shadows used as decoration, neon.
- Emoji anywhere (UI, labels, tooltips, empty states). Icons are simple line glyphs only.
- Illustrations, hero images, stock photos, rocket/flame/Moon art, decorative backgrounds,
  animated starfields.
- Green or "check" styling for any evidence result. **[Inference]** green reads as "safe", and
  "safe" is a banned word ([S4] §6 banned list).
- Red/flame imagery for anything that is not the BURNED label.
- Marketing copy, exclamation marks, "AI-powered" badges.

---

## 2. Colour tokens

Dark theme only. Hex values are **[Inference]** choices; the ratios are computed (see note at
top). "On" columns = contrast against that background.

### 2.1 Neutrals

| Token | Hex | Use | On `bg` | On `surface-1` | On `surface-2` |
|---|---|---|---|---|---|
| `bg` | `#0E1013` | Page background | — | — | — |
| `surface-1` | `#16191E` | Panels, table body | 1.08 | — | — |
| `surface-2` | `#1E2228` | Table header, hovered row, input fill | 1.19 | 1.10 | — |
| `surface-selected` | `#262B33` | Selected table row | — | — | — |
| `divider` | `#2C313A` | Hairline row/panel dividers (decorative only) | 1.46 | 1.35 | 1.22 |
| `border-control` | `#737B88` | Borders of inputs, buttons, slider track, chips that are controls | 4.46 | 4.13 | 3.74 |
| `text-1` | `#E8EAED` | Primary text, values | 15.81 | 14.62 | 13.25 |
| `text-2` | `#A9B0BB` | Secondary text, column headers, units | 8.72 | 8.07 | 7.31 |
| `text-3` | `#8A929E` | Tertiary text, metadata, source locators | 6.07 | 5.61 | 5.09 |
| `accent` | `#7CB8FF` | Links, focus ring, active slider thumb | 9.22 | 8.52 | 7.73 |

Rules:
- `divider` is below 3:1 on purpose: it only separates rows. It must never be the only thing
  that shows where a control is. Anything a user operates uses `border-control`, which is
  ≥ 3:1 on all surfaces ([WCAG22] SC 1.4.11, AA: 3:1 against adjacent colours for component
  boundaries and states).
- `text-1` on `surface-selected` = 11.81. Selection is also shown by a 2 px `accent` left bar,
  not by fill alone (SC 1.4.1).
- No other neutrals. If a new grey seems needed, use the nearest token.

### 2.2 Evidence labels (the three results)

The engine returns `BURNED`, `NEAR` or `NOT_ESTABLISHED` ([S1] §3.1 `labelMaterial`). Hues
follow the Okabe & Ito colour-universal-design advice: vermilion instead of pure red, yellow
and sky blue kept apart by brightness, no colours between yellow and green ([OkabeIto]
"Set of colors that is unambiguous…"). Exact hex values are ours: the Okabe & Ito pages give
the palette only as an image, so their hex values were **not found in the sources reviewed**.

| Engine value | Chip text (short) | Token | Hex | On `bg` | Shape glyph | Chip style |
|---|---|---|---|---|---|---|
| `BURNED` | Burned in comparable test | `ev-burned` | `#FF6A33` | 6.68 | Filled square | **Solid** fill `ev-burned`, text `bg` (6.68:1) |
| `NEAR` | Near measured limit | `ev-near` | `#F0D545` | 12.98 | Outlined triangle | **Outline** 1.5 px `ev-near`, text `ev-near`, fill `bg`/surface |
| `NOT_ESTABLISHED` | Not established | `ev-ne` | `#8EC5F0` | 10.34 | Hollow circle | **Dashed** 1.5 px outline `ev-ne`, text `ev-ne` |

Rules:
- **Three redundant channels, always:** text + glyph + fill style (solid / outline / dashed).
  A greyscale screenshot must still show all three labels apart ([OkabeIto] "Do not convey
  information in color only"; combine colours with shapes and line types).
- Chip text above is the **short form** for chips, legends and slider counts. **[Inference]**
  wording follows issue #27 and R8's "burned in a comparable test" ([V2] C5). The full
  sentence in the row and evidence panel comes **only** from `label.js` ([S4] §6, e.g. "Burned
  in testing at these conditions"). If `label.js` changes the short form, `label.js` wins.
- `NOT_ESTABLISHED` sub-reasons (`NE-no-burn`, `NE-incompatible`, `NE-no-data`, [S1] §3.1) are
  shown as text after the chip, never as different colours.
- Never write "never tested", "safe", "never burns", "nonflammable", "fire-safe" or "will burn
  on the Moon" in any UI string, tooltip or alt text ([S4] §6 banned list). Say "not found in
  the sources reviewed".
- **Colour-blind check ([Inference], our own check):** we simulated protanopia, deuteranopia
  and tritanopia with Machado-type matrices and measured CIELAB distance between the three
  hues. Every pair stayed apart (smallest: BURNED vs NEAR under deuteranopia, ΔE ≈ 20). That
  pair is also separated by fill style (solid vs outline) and glyph. The matrices were used
  from memory; the original paper was not opened for this task. Re-check with a simulator
  (e.g. a browser devtools vision-deficiency emulation) at build time.
- These three hues are **reserved**. No other element may use them (no orange buttons, no
  yellow highlights, no blue badges). Links and focus use `accent`, which is a different blue
  and is always paired with underline (links) or a ring shape (focus).

### 2.3 Qualifiers (no new colours)

**[Inference], our own check:** earlier candidate colours for flags and estimates collapsed into `ev-ne` under simulated
protanopia/deuteranopia (ΔE 13–18), so qualifiers use **neutrals and line style only**:

| Qualifier | Source of truth | Treatment |
|---|---|---|
| Flag letters (E, M, F, T, W, D, V, P, G, X, H, A, U) | [R1] §4, [S1] §3.1 `flags` | Monospace letters in 1 px `border-control` boxes, `text-2`; each has a tooltip and an accessible name with the rule name and `why` |
| Cross-gravity | [S4] §6 "Cross-gravity comparison" | Text tag, `text-1`, 1 px dashed `border-control` |
| Lunar estimate | [S4] §6 lunar prefix; [V2] C4 | Diagonal hatch (45°, `text-3` lines) behind the g0 / g1 cells; prefix text from `label.js`; never shown as a single merged label |
| Draft / non-NASA source | [V2] §7 "non-NASA source tag (D2)" | Text tag `text-2`, square brackets style `[non-NASA source]` |

---

## 3. Typography

| Token | Size / line height | Weight | Use |
|---|---|---|---|
| `type-title` | 20 / 28 px | 600 | Page title (one per page) |
| `type-heading` | 16 / 24 px | 600 | Region headings (Cabin, Results, Evidence) |
| `type-body` | 14 / 20 px | 400 | Default text, table cells |
| `type-small` | 13 / 18 px | 400 | Secondary text, source locators |
| `type-label` | 12 / 16 px | 500 | Column headers, chip text, units; sentence case, no all-caps tracking |
| `type-data` | 14 / 20 px mono | 400 | O2 %, pressures, flow speeds, flag letters |

Rules ([Inference] unless cited):
- Fonts: the platform system UI stack and system monospace stack. No web-font downloads
  (fits S1's no-install static site, [S1] §1).
- No text below 12 px. All text, including 12 px labels and `text-3`, meets **4.5:1**. We do
  not rely on the large-text 3:1 allowance ([WCAG22] SC 1.4.3, AA; "large scale" = 18 pt or
  14 pt bold, §6 glossary).
- All numbers that line up in columns use tabular figures (`tabular-nums`, figures of equal
  width "easily aligned like in tables", [MDNfvn] "Values"). Right-align numeric columns.
- Always show units next to values: `34 % O2`, `56.5 kPa (8.2 psia)`, `cm/s`, `g`. Pressure
  shows kPa first and psia in `text-2` ([V2] §7 cabin form row).
- Layout must survive WCAG text-spacing overrides (line height 1.5×, paragraph spacing 2×,
  letter spacing 0.12×, word spacing 0.16×) without clipping ([WCAG22] SC 1.4.12, AA). No
  fixed-height text containers.

---

## 4. Spacing, layout, shape

- **Spacing scale (px):** 2, 4, 8, 12, 16, 24, 32. Nothing else. [Inference]
- **Radius:** 4 px for controls and chips; 6 px for panels; 0 for table cells. No pills
  except the slider thumb (circle).
- **Borders over shadows.** Panels are separated by `divider` lines and surface steps, never
  by drop shadows.
- **Layout (one page, three regions, per [V2] §7):** cabin form (left, ~320 px), results table
  (centre, flexible), evidence panel (right, ~380 px, shows the selected row). Slider and
  presets sit at the top of the cabin form. Changes/experiment cards sit under the table.
- **Density:** table row height 36 px (compact), 8 px vertical / 12 px horizontal cell
  padding.
- **Narrow screens:** at 320 CSS px width, regions stack vertically with no horizontal page
  scrolling. The results table may scroll horizontally inside its own container: data tables
  are an allowed exception ([WCAG22] SC 1.4.10, AA).

---

## 5. Components

### 5.1 Results table

- Native HTML table semantics, not a grid widget: a static table is not an interactive
  widget and native `table` is strongly encouraged ([APGtable] "About This Pattern", note).
  Label it with a visible heading (`aria-labelledby`) ([APGtable] "Roles").
- Columns, in order: Material · Label (chip) · Reason (text from `label.js`) · Flags ·
  Gravity (0 g / 1 g side by side for lunar, hatched) · Source (first citation link).
  Material is a row header.
- Row selection opens the evidence panel. Selection is done with a real button in the Material
  cell (one tab stop per row); the row itself is not focusable.
- Sorting, if built: by label severity (BURNED, NEAR, NOT_ESTABLISHED) then material name;
  sorted header gets `aria-sort` ([APGtable] "Roles").
- Required states ([V2] §7): loading (skeleton rows in `surface-2`, no shimmer animation),
  load error (inline message + retry button), 0 verified rows, NE-no-data, NE-incompatible,
  lunar disagreement (g0 and g1 differ: show both chips; never only the worse one, [V2] D1).
- Empty-state text is plain and factual (e.g. "No verified evidence rows loaded."). No
  illustrations.

### 5.2 Label chip

- Height 20 px, padding 0 6 px, radius 4 px, `type-label`, glyph 10 px left of text with 4 px
  gap. Styles per §2.2.
- Chips are **not** buttons. If clickable, the click target is the row's button, not the chip.
- Accessible name = full `label.js` sentence plus reason (e.g. chip "Not established" has the
  name "Not established: tests were found, but none is comparable to this cabin").
- Never truncate chip text. If space is short, wrap the cell.
- Lunar rows show two chips labelled "0 g" and "1 g" over the hatch, with the `label.js`
  lunar prefix above them.

### 5.3 Oxygen slider and presets

- One horizontal slider for cabin O2 %. Track 4 px `border-control`; filled part `text-2`;
  thumb 16 px circle `accent` with a 24 × 24 px hit area ([WCAG22] SC 2.5.8, AA: 24 × 24 CSS
  px minimum; a slider counts as one target, Note 1).
- Keyboard ([APGslider] "Keyboard Interaction"): Right/Up = +1 step, Left/Down = −1 step,
  Home = min, End = max, Page Up/Down = larger step. Step and range come from the data, not
  from this file.
- ARIA ([APGslider] "Roles, States, and Properties"): `role="slider"` on the thumb,
  `aria-valuenow/min/max`, `aria-valuetext` like "34 percent oxygen", visible label linked with
  `aria-labelledby`.
- Preset buttons (3, from R7, [V2] §7) sit above the slider as a segmented control; the
  active preset uses `surface-selected` + `accent` bottom bar + `aria-pressed`.
- Counts per label sit under the slider as three small chips with numbers
  (`3 Burned in comparable test`, etc.). Count changes are announced through a polite live
  region, without moving focus ([WCAG22] SC 4.1.3, AA).
- Pre-breathe notes appear **only at preset positions**. Between presets, show the text "not
  found in the sources reviewed" ([S1] §3.3; [R7] via [S1]). No curve, no interpolated time.
- No "fire risk" meter, gauge, heat colour or danger gradient on the track ([V2] D4 flags
  "fire risk" slider wording).

### 5.4 Chart (if built)

- Allowed forms: a step chart or small bar strip of counts per label vs O2 %, and a dot plot
  of tested O2 limits per material with the cabin O2 as a vertical rule. [Inference]
- Marks use the three evidence tokens **plus** shape (square / triangle / circle markers) and
  are labelled directly on the chart, not only in a legend ([OkabeIto] "label lines on the
  graph"; different symbols and line types).
- Axes and gridlines: `text-2` labels, `divider` gridlines, tabular figures. Data marks and
  any line a user must read meet 3:1 against the background ([WCAG22] SC 1.4.11).
- Lunar ranges are hatched spans between the 0 g and 1 g marks, captioned with the `label.js`
  lunar prefix. Never draw a filled band that suggests a measured bound ([V2] D1, C4).
- Every chart has a text equivalent: the same numbers available as a table (toggle or
  adjacent) ([WCAG22] SC 1.3.1, A).
- No 3D, no pie/donut, no animated draw-in.

### 5.5 Source link

- Format: `Title — locator` (e.g. page, figure, table), title in `accent` and underlined,
  locator in `text-3`. Opens in a new tab with an "opens in new tab" accessible hint and a
  small external-link line glyph.
- Every label shows at least one source link in the row; the evidence panel lists all cited
  rows with title, URL and locator ([AGENTS] "Science rules": every value and label links to
  its NASA source).
- Non-NASA sources carry the `[non-NASA source]` tag (§2.3).
- Links are always underlined; colour is never the only cue (SC 1.4.1).

### 5.6 Mismatch warning (comparability caveat)

- Shown when a comparison is graded FLAG, or in lunar / cross-gravity mode ([R1] §4: FLAG =
  "show the label as weaker and say why in the UI").
- Inline block inside the evidence panel (and a compact one-line version in the row):
  `surface-2` fill, 2 px left bar `text-1`, warning line glyph (triangle with "!" drawn as a
  line icon, not emoji), heading "Comparison caveat" in `type-heading`, then one line per
  rule: `Rule letter · field · cabin value vs test value · why` (why text from the engine).
- Neutral colours only; it must not use `ev-near` yellow (reserved for NEAR, §2.2).
- INVALID pairings never produce a label, so there is no INVALID warning style; the row shows
  `NOT_ESTABLISHED` / `NE-incompatible` instead ([R1] §4; [S1] §3.2 step 1).
- Never dismissible and never collapsed by default while the row is selected.

### 5.7 Buttons and inputs

- Primary button: `text-1` text on `surface-2`, 1 px `border-control`. There is no filled
  coloured primary button. Secondary: text only with underline on hover.
- Inputs: `surface-2` fill, 1 px `border-control`, `text-1` value, `text-2` label above
  (never placeholder-only labels). Inline error below the field in `text-1` with the prefix
  "Error:" (text, not red colour, carries the meaning).
- Minimum target size 24 × 24 CSS px for every control ([WCAG22] SC 2.5.8).

### 5.8 Changes and experiment cards

- Plain bordered blocks (`surface-1`, 1 px `divider`, title `type-heading`).
- Fixes wording never claims "safe"; use the D3 wording from `label.js` ([V2] D3).
- Experiment cards appear only for NOT_ESTABLISHED rows and list missing conditions as a
  plain definition list ([S1] §5 B9).

---

## 6. Interaction, focus and motion

- **Keyboard covers everything** ([WCAG22] SC 2.1.1, A); no keyboard traps ([WCAG22] SC
  2.1.2, A). Tab order: presets → slider → cabin inputs → material list → results table row
  buttons → evidence panel links → cards ([WCAG22] SC 2.4.3, A).
- **Focus ring:** 2 px solid `accent` outline with 2 px offset on every focusable element,
  visible for keyboard focus ([WCAG22] SC 2.4.7, AA). `accent` vs `surface-1` = 8.52:1, which
  also meets the AAA focus-appearance test (2 CSS px perimeter, 3:1 change; [WCAG22] SC
  2.4.13). Never remove the outline without replacing it.
- Sticky headers or panels must not cover the focused element ([WCAG22] SC 2.4.11, AA).
- **Shortcuts ([Inference], optional):** `/` focuses material search, `Esc` clears the
  selected row, `[` / `]` move between presets. All are single keys only when focus is not in
  a text field, and all are listed in a visible "Keyboard" help line.
- **Motion:** only opacity/colour transitions ≤ 150 ms for state changes. No layout motion,
  no number counters, no pulsing alarms. Respect `prefers-reduced-motion: reduce` (user asked
  to minimise non-essential motion, [MDNprm]) by turning transitions off ([WCAG22] SC 2.3.3).
- Hover is never the only way to see information: tooltip content is also reachable by focus
  and present in the evidence panel.

---

## 7. Accessibility targets (summary)

| Target | Value | Source |
|---|---|---|
| Body and small text contrast | ≥ 4.5:1 (we aim ≥ 5:1; all tokens in §2 meet it on all surfaces) | [WCAG22] SC 1.4.3 AA |
| Primary text | ≥ 7:1 (`text-1`, `text-2` meet it) | [WCAG22] SC 1.4.6 AAA |
| Control borders, chart marks, focus ring | ≥ 3:1 against adjacent colours | [WCAG22] SC 1.4.11 AA |
| Colour as only cue | Never | [WCAG22] SC 1.4.1 A |
| Keyboard | All functions, no traps, visible focus | [WCAG22] SC 2.1.1, 2.1.2, 2.4.7 |
| Target size | ≥ 24 × 24 CSS px | [WCAG22] SC 2.5.8 AA |
| Status updates (counts, errors, load) | Live region, no focus move | [WCAG22] SC 4.1.3 AA |
| Reflow | 320 CSS px wide, table may scroll | [WCAG22] SC 1.4.10 AA |

**Build-time checks ([Inference]):** recompute contrast if any hex changes; tab through the
whole demo path from W2 with the mouse unplugged; view the page in greyscale and with a
deuteranopia emulator and confirm all three labels are still distinct.

---

## 8. Sources

| Key | Title | URL | Locator used |
|---|---|---|---|
| WCAG22 | Web Content Accessibility Guidelines (WCAG) 2.2, W3C Recommendation 12 Dec 2024 | https://www.w3.org/TR/WCAG22/ | SC 1.3.1, 1.4.1, 1.4.3, 1.4.6, 1.4.10, 1.4.11, 1.4.12, 2.1.1, 2.1.2, 2.3.3, 2.4.3, 2.4.7, 2.4.11, 2.4.13, 2.5.8, 4.1.3; §6 glossary "contrast ratio", "relative luminance", "large scale" |
| APGslider | Slider Pattern, ARIA Authoring Practices Guide, W3C WAI | https://www.w3.org/WAI/ARIA/apg/patterns/slider/ | "Keyboard Interaction"; "WAI-ARIA Roles, States, and Properties" |
| APGtable | Table Pattern, ARIA Authoring Practices Guide, W3C WAI | https://www.w3.org/WAI/ARIA/apg/patterns/table/ | "About This Pattern" and note; "WAI-ARIA Roles, States, and Properties" |
| OkabeIto | Okabe M., Ito K., Color Universal Design (CUD) / Colorblind Barrier Free | https://jfly.uni-koeln.de/color/ | "Set of colors that is unambiguous…" (Fig. 16, image only: hex values not in text); "Most important practical points"; "How to select colors" 1) and 4) |
| MDNprm | prefers-reduced-motion, MDN | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion | Description; "Syntax" |
| MDNfvn | font-variant-numeric, MDN | https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric | "Values": `tabular-nums` |
| AGENTS | Rules for AI agents working on REDLINE | `AGENTS.md` (repo root, main) | "Science rules"; "Engineering rules" |
| R1 | Evidence table spec and comparability rules (#18) | `origin/task/18-r1-evidence-table-spec-and-comparability:research/evidence-spec.md` | §4 grades and "How REDLINE should use the grade" |
| S1 | Architecture plan and data schema (#26) | `origin/task/26-s1-architecture-plan-and-data-schema:docs/specs/architecture.md` | §1, §3.1, §3.2, §3.3, §5 |
| S4 | Evidence engine build spec (#29) | `origin/task/29-s4-evidence-engine-build-spec-for-fable:docs/specs/evidence-engine.md` | §6 wording table and banned words |
| V2 | Review of all specs for gaps and contradictions (#32) | `origin/task/32-v2-review-all-specs-for-gaps-and-contrad:docs/specs/review.md` | C4, C5, D1, D3, D4, §7 minimum screen list |
| R7 | Cabin atmosphere and pre-breathe values (#24) | `origin/task/24-r7-cabin-atmosphere-and-pre-breathe-valu:research/atmosphere.md` | Cited only via S1 §3.3; not re-read for this task |

Not found in the sources reviewed: published hex values for the Okabe & Ito palette (the
jfly pages show it as an image; the linked PDF brochure was not opened).
