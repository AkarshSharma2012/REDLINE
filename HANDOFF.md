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

Next: implement, run `node --test`, and serve a temporary fixture harness for an
actual browser check. Python launcher availability needs checking: `python.exe`
currently resolves to an inaccessible Windows alias.

Integration needed outside scope: scaffold/app owner must mount the component,
pass the real engine/dataset, handle Apply/Cancel and supply shared styles.
