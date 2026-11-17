# Issue #315 — automated evidence audit

- Audited all 45 rows, CSV/JSON/exports, schema, NASA source joins/locators, units/provenance and draft label exclusion. Reproducible finite harness: research/audits/issue-315.audit.mjs; per-record report: research/evidence-audit-315.md.
- Automated coverage 45/45; human-verified rows 0/45. All remain draft, verified_by null. B16 source conflict remains blocked; U25 inferred sheet / 1/6 g versus normalized 0.16 g / plot-derived five-second extinction preserved.
- Fixed validator/exported-schema loophole allowing verified status with HOLD_scientific_review; regression covers all six held rows, with/without synthetic test signatures.
- Links: 43/45 rows HTTP 200 throughout; both M25 rows share HTTP 409 Task Book access blocker. Human scientific review remains required.
- Validation: node --test research/audits/issue-315.audit.mjs: 47 pass. npm ci --ignore-scripts, then node scripts/build-ui.mjs: exit 0. Full node --test once: 1372 total, 1328 pass, 0 fail, 44 TODO (including three unresolved completeness checks). No server/browser; all child command sessions completed.
- Next: conductor review/merge PR. No pitch or app UI changes; no evidence status/value/signature changes.

STATUS: DONE
