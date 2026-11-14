# Issue #77 handoff

Task: B14 evidence additions. Branch: task/77-b14-more-evidence-rows-saffire-bass-same.

Read README, AGENTS, DESIGN, S1 architecture, S3 screens, S4 engine, V2 review and R1 evidence specification. No prior handoff existed.

Research underway: inspected NTRS 20150008962 (BASS/BASS-II SIBAL appendix and methods), 20210011521 (Saffire Table 2), 20250002114 (2025 comparison methods/results), 20220007191 (BRE slide 4), 20130000422 (SAME-2).

Decisions: append only; retain literal requested review_status=unverified. Do not turn ignition failures into no-spread outcomes or smoke/burner observations into solid-material limits. Keep unknown fields empty.

Integration blockers identified before editing: src/schema/validate.js accepts only draft/reviewed/verified; data/metadata.json lacks new literature source keys. Both files are outside ownership. Record required owner changes in research/evidence-additions.md; do not change those files.

Next: append traceable rows, document exclusions, run build and tests, check static page, and record exact results.
