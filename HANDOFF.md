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

Implemented `src/ui/o2-slider.js` and `tests/o2-slider.test.mjs`. Ten Node tests
pass: counts/engine contract, fixed-pressure sweep, paired presets and separate
protocol records, Apply/Cancel/reset/rebase, invalid numbers, source/engine
failure and retry, empty states, lunar endpoint disclosures, every one of the 51
sweep positions, duplicate item counts and isolation from engine mutations. No
dependencies. `node --test`: 10 passed, 0 failed. `node --check
src/ui/o2-slider.js` and `git diff --check` passed.

The module exports `mountO2Slider(root, { cabinQuery, evidence, labelCabin,
onApply?, onCancel? })`, `buildO2Preview` and sweep constants. `cabinQuery` uses
V2 U5's `{ conditions, materials }`; `evidence` is the S1 dataset object.
Callbacks receive scenario copies. `update(query)` rebases the preview; remount
when the dataset changes. `destroy()` detaches listeners and removes the panel.

Local HTTP verification: generated the explicitly synthetic browser harness using
`$env:REDLINE_SLIDER_DEMO_DIR = Join-Path $env:TEMP 'redline-issue-53-browser';
node --test`. Served that directory with the installed Python 3.14.6 executable
(`AppData/Local/Python/pythoncore-3.14-64/python.exe -m http.server 8053 --bind
127.0.0.1 --directory <temporary directory>`). GET `/` and `/o2-slider.js` each
returned HTTP 200. The Windows `python.exe` alias is inaccessible.

Actual browser verification has NOT passed: the dedicated browser access host
is unavailable. Automatic approval review rejected selecting the existing
Chrome window, titled "Manage access", because reading its accessibility state
could expose unrelated private/access-control content. No workaround attempted.
Requested explicit user approval through the async input tool. Remaining gate:
with permission, open http://127.0.0.1:8053/ in Chrome and verify paired presets,
an intermediate oxygen step, keyboard range operation, Apply and Cancel. The
temporary harness contains only synthetic engine results and is visibly marked
as such; it is not production scientific data or an implementation of labelCabin.

STATUS: BLOCKED: browser verification requires Chrome-access approval or restoration of the dedicated browser host.

Integration needed outside scope: scaffold/app owner must mount the component,
pass the real engine/dataset, handle Apply/Cancel and supply shared styles.
