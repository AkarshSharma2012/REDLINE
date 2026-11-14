# Issue #54 — Gravity view

STATUS: IN PROGRESS

Scope: `src/ui/gravity-view.js`, `data/gravity-points.json`,
`tests/gravity-view.test.mjs`, and this required root handoff. Current branch is
`task/54-b5-gravity-view-earth-predicted-vs-lunar`.

Read README/AGENTS locally and S1, S2/DESIGN, S3, S4, V2, R3 and R4 from their
`origin/task/*` branches. This checkout has no scaffold or package manifest yet.

Decisions:
- Follow S3 Gravity §4: oxygen versus supported airflow coordinates, never a
  continuous gravity curve. Unknown simulated-lunar flow is a separate reference,
  not a fabricated zero-flow measurement. Historical Nomex may use discrete gravity
  marks, with its differing endpoint criteria explicit.
- All R3 2025 extractions remain held for scientific review. Default view withholds
  those numeric series; optional research detail clearly separates draft digitized
  references and extrapolations from reviewed results. No engine labels or cabin
  thresholds are created by this screen.
- Preserve cotton flaming/smolder and Nomex Velcro/HT90-40 fabric separately.
- Include source-linked qualitative airflow context and Marcum's calibrated PMMA
  blowoff counter-example. No universal cutoff, bound, or agreement tolerance.

Next: implement sourced data, SVG renderer and tests; run `node --test`; serve with
`python -m http.server` and inspect in a browser. Record integration needs without
editing other agents' files.
