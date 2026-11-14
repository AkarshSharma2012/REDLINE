# HANDOFF — Issue #27 S2: DESIGN.md (UI rules)

## Done
- `DESIGN.md` at repo root: principles + banned list, colour tokens (neutrals; three evidence
  labels BURNED / NEAR / NOT_ESTABLISHED with text + glyph + fill-style redundancy), qualifiers
  (flags, cross-gravity, lunar estimate) in neutrals only, type scale, spacing/layout,
  components (results table, label chip, O2 slider + presets, chart, source link, mismatch
  warning, buttons/inputs, cards), focus/keyboard/motion, accessibility targets, sources.
- Sources verified by fetch: WCAG 2.2, APG slider + table patterns, Okabe & Ito CUD page, MDN
  prefers-reduced-motion and font-variant-numeric.
- Read other agents' specs: R1 (#18), S1 (#26), S4 (#29), V2 (#32).

## How it was checked
- Every token contrast ratio computed with the WCAG 2.2 relative-luminance formula (script
  run outside the repo; numbers in DESIGN.md §2).
- Colour-blind separation simulated (protan/deutan/tritan, Machado-type matrices from memory,
  labelled as inference). Flag/estimate colours failed against NE blue, so they were dropped
  in favour of neutrals + line style.

## Key decisions
- Hue choices are our own (Okabe & Ito hex values not in the page text; PDF not opened).
- Chip short text per issue #27; full sentences come only from `label.js` (S4 §6 wins).
- No green anywhere for results; evidence hues reserved; links/focus use a separate accent
  with underline / ring shape.

## Next (for build team)
- B5/B7/B8/B9 follow DESIGN.md. Re-run contrast if hex values change; check with a
  deuteranopia emulator at build time.
- Team lead to confirm chip short forms vs S4 §6 wording (V2 C5).

STATUS: DONE
