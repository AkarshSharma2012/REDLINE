# Issue #53 — Oxygen tradeoff slider

Branch: `task/53-b4-oxygen-tradeoff-slider-illustrative`.

Read README.md and AGENTS.md locally; DESIGN.md, S1 architecture, S3 screens,
S4 evidence engine, V2 review and R7 atmosphere research from their origin/task
branches. No scaffold, engine, dataset or entry page exists on this branch.

Decisions: plain ES module, no dependencies. Inject the shared `labelCabin` engine
and S1 dataset into `mountO2Slider`; do not implement scientific rules in the UI.
V2 U3 governs the slider (15–40%, step 0.5, pressure fixed); preset buttons set
both pressure and oxygen. Protocols require an exact pair and retain separate
source/context records. No pre-breathe calculation or interpolation.

Only implementation files owned by this issue will be changed, plus this required
root handoff. Test fixtures stay inside the owned test file because creating
`tests/fixtures/` files would exceed file ownership.

Implemented `src/ui/o2-slider.js` and `tests/o2-slider.test.mjs`. Eight Node tests
pass: counts/engine contract, fixed-pressure sweep, paired presets and separate
protocol records, Apply/Cancel/reset/rebase, invalid numbers, source/engine
failure and retry, empty states, lunar endpoint disclosures. No dependencies.

The module exports `mountO2Slider(root, { cabinQuery, evidence, labelCabin,
onApply?, onCancel? })`, `buildO2Preview` and sweep constants. `cabinQuery` uses
V2 U5's `{ conditions, materials }`; `evidence` is the S1 dataset object.
Callbacks receive scenario copies. `update(query)` rebases the preview; remount
when the dataset changes. `destroy()` detaches listeners and removes the panel.

Next: actual browser verification using an opt-in temporary fixture harness.
The Windows Python alias is inaccessible; the installed Python executable was
located under AppData/Local/Python/pythoncore-3.14-64.

Integration needed outside scope: scaffold/app owner must mount the component,
pass the real engine/dataset, handle Apply/Cancel and supply shared styles.
