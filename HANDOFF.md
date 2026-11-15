# Issue #265

- Synced origin/main (9c9bf01). Only tests/edge-cases.test.mjs changed; no src/data edits.
- Every one of the 39 `test.todo` cases in tests/edge-cases.test.mjs passed when run as enforced tests, so all were promoted to `test(...)`. They use synthetic boundary inputs only (software rules: compareRow P/T/W/V boundaries and quench, labelMaterial/baselineLabel precedence, O2 limits, missing O2, kPa O2 partial pressure, labelCabin routing, citation register lookup). No assertion weakened or case removed. Nothing left as TODO in this file: no case was failing or scientifically blocked.
- Full `node --test` before: 1158 tests, 1075 pass, 0 fail, 83 TODO. After: 1158 tests, 1114 pass, 0 fail, 44 TODO (remaining TODOs are in other files). edge-cases file: 6 pass / 39 TODO -> 45 pass / 0 TODO.
- No server, browser or persistent process started.
- Next: coordinator review and merge existing PR #266.


- Integration: merged origin/main f065251 (PR #264 engine examples). Preserved issue #150 receipt in docs/handoffs/issue-150.md. Edge-case assertions unchanged; full-suite verified: 1163 tests, 1119 pass, 0 fail, 44 TODO; exit 0. Existing scientific/data-integrity TODOs retained.

Exact 39 promoted cases (assertions unchanged):
- compareRow: one fully specified comparable row has all 13 rules in binding order
- compareRow: missing query pressure raises P without invalidating burning evidence
- compareRow: missing row pressure raises P without invalidating burning evidence
- compareRow: pressure gap of exactly 10 kPa is allowed; larger gap flags
- compareRow: dimensions in mm and flow in cm/s use strict ratio > 2
- compareRow: quench speed at the upper endpoint invalidates; at the lower endpoint it does not
- labelMaterial: empty evidence is NE-no-data with no citations
- labelMaterial: a single spread row at exactly query O2 is BURNED
- labelMaterial: duplicate spread rows do not change the answer or citation
- labelMaterial: BURNED beats NEAR regardless of row order
- labelMaterial: measured limit 21 % O2, query 21 % O2 => BURNED
- labelMaterial: measured limit 21 % O2, query 20 % O2 => NEAR
- labelMaterial: measured limit 21 % O2, query 20.999 % O2 => NEAR
- labelMaterial: missing spread-row O2 is unknown rather than zero
- labelMaterial: missing query O2 cannot produce BURNED or NEAR
- baselineLabel: empty evidence is NE-no-data with no citations
- baselineLabel: a single spread row at exactly query O2 is BURNED
- baselineLabel: duplicate spread rows do not change the answer or citation
- baselineLabel: BURNED beats NEAR regardless of row order
- baselineLabel: measured limit 21 % O2, query 21 % O2 => BURNED
- baselineLabel: measured limit 21 % O2, query 20 % O2 => NEAR
- baselineLabel: measured limit 21 % O2, query 20.999 % O2 => NEAR
- baselineLabel: missing spread-row O2 is unknown rather than zero
- baselineLabel: missing query O2 cannot produce BURNED or NEAR
- labelMaterial: duplicate NEAR rows do not duplicate citations
- labelMaterial: draft and unrelated rows cannot supply a label
- labelMaterial: kPa O2 limit uses partial pressure: 20% at 50 kPa
- labelMaterial: kPa O2 limit uses partial pressure: 19% at 50 kPa
- labelMaterial: kPa O2 limit uses partial pressure: 18.99% at 50 kPa
- labelMaterial: kPa O2 limit with missing query pressure cannot produce a numeric label
- labelMaterial: a cm/s quench value cannot be interpreted as an oxygen limit
- labelCabin: empty material list returns no results
- labelCabin: empty evidence preserves requested materials in input order
- labelCabin: routes one verified row and excludes unrelated and draft rows
- labelCabin: duplicates and conflicting rows retain BURNED precedence
- labelCabin: shared O2 and pressure reach the kPa O2 limit calculation
- labelMaterial: winning citations resolve through the NASA source register and retain wording
- baselineLabel: units in names normalize, and missing pressure is deliberately ignored
- baselineLabel: kPa O2 value is not treated as % O2 (uses reported row O2)

STATUS: DONE
