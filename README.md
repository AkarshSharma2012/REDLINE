# REDLINE

REDLINE is a web-based dashboard for exploring combustion evidence for spacecraft and habitat fire-safety research. Its primary NASA dataset is the [Physical Sciences Informatics (PSI) Data Repository](https://psi.nasa.gov/).

Enter cabin materials and conditions, including oxygen, pressure and airflow. REDLINE uses only verified evidence rows for results and checks whether test conditions are comparable. Results use qualified wording such as **burned in testing at these conditions**, **close to a measured limit**, or **not found in the sources reviewed**. Evidence-backed results link to their NASA sources; a missing result describes a gap in the reviewed evidence, not a conclusion about all testing. If no verified evidence is loaded, no evidence-backed result is available.

- Oxygen exploration: see how many materials have a burned-in-testing result as the selected oxygen changes, subject to comparability checks. These counts describe reviewed evidence, not a physical fire-risk score.
- What changes the label: explore material and oxygen selections alongside their supporting test conditions. A label change does not establish an oxygen operating limit, certify a material, or demonstrate suitability for a cabin.
- Evidence gaps: identify candidate research questions where comparable results are not found in the sources reviewed; these are not commitments to future NASA experiments.

NASA Space Apps Challenge 2026, Seattle. Challenge: Flame in Freefall. Team: Interlake Embers.

## Live app and deployment

[Open REDLINE](https://akarshsharma2012.github.io/REDLINE/).

The app uses plain HTML, CSS and JavaScript ES modules. GitHub Pages publishes the committed files from `main`, at the repository root, with no application build step or dependency installation. Keep `.nojekyll` in the root. There is no checked-in Pages workflow; GitHub manages the existing **pages build and deployment** workflow.

Pages is already enabled and HTTPS is enforced; no settings change is currently required. If restoring the setup, a repository administrator can open **Settings → Pages → Build and deployment**, select **Deploy from a branch**, choose **main** and **/ (root)**, then **Save**. Keep **Enforce HTTPS** enabled. Merge reviewed changes into `main` to publish; check the Pages deployment result in **Actions**.

## Run locally

No dependency installation or application build is needed. Local browsing needs Python 3 (any recent version); tests need Node 22.12 or newer.

The released workspace described below bundles pinned browser libraries locally: **GSAP 3.15.1** ([provenance](src/vendor/gsap/PROVENANCE.md), [GSAP standard license](https://gsap.com/standard-license)) and **Three.js r187 (0.187.0)** ([provenance](src/vendor/three/PROVENANCE.md), [MIT license](src/vendor/three/LICENSE)). These are browser dependencies, not packages you need to install. Source browsing and the illustrative model require no CDN, paid service or API key; opening original citations requires access to the linked sites.

```sh
python -m http.server 8000     # from the repo root, then open http://localhost:8000/
npm test                       # or: node --test
```

Open the page through the server, not as a `file://` path: browsers block ES modules loaded from `file://`.
The committed `data/evidence.json` supplies the evidence data. After editing its source CSV or metadata, regenerate it with `node scripts/build-evidence.mjs` and commit the updated artifact. This is a data maintenance command, not a deployment build step. If loading fails, check that the JSON file is served successfully from the same site.

Tests run without a server: `node --test` (or `npm test`). See the [testing guide](docs/testing.md) for coverage and limitations; passing Node tests does not establish real-browser layout or accessibility.

## NASA workspace quickstart

These instructions describe the workspace released from `main` at `8b46d11937165779b1987a5a086956930d39ab68`, incorporating PR #285 at `f44d08bf02fa6452bcb92ff525ab327e08bb02af` and science wording from PR #286 at `531b949e1ec03bb41004d066966ed41bd4827251`. The [Pages build and deployment](https://github.com/AkarshSharma2012/REDLINE/actions/runs/43749579228) succeeded for that exact release commit.

1. In Cabin setup, choose **Load lunar rover demo**. The cabin items and their uses are hypothetical, not a real rover manifest.
2. Browse **NASA source records**. Search by material, investigation or source and filter by review status. Check the total, matching and verified counts. Open a record to inspect its original citation, locator and recorded test conditions; follow the citation to the original source.
3. Choose **Model + evidence** to open the illustrative cabin model alongside evidence. Selecting a cabin material in the HTML item list or a model part synchronizes the selection/highlight and scopes the source records to that material. Clear the material filter to browse all records again.
4. Adjust pane widths with the narrow/widen buttons or draggable separators; show/hide panes, choose **Comfortable** or **Compact** density, or **Reset layout**. Layout preferences are stored locally when browser storage is available. On narrow screens, panes stack and jump buttons reach each pane.

Use native keyboard controls: Tab/Shift+Tab move focus, Enter/Space activate buttons, and native select controls choose filters. **Escape** closes an open source record and returns focus to its list button. With a pane separator focused, Left/Right adjust width, Home/End choose its minimum/maximum, and Enter resets that pane's width.

For the 3D camera, use the orbit, zoom and **Reset view** buttons. With the view focused, arrow keys orbit, **+ / -** zoom and **Home** resets; drag to orbit and click a part to select it. Tab remains available to leave the view. The HTML cabin-item buttons provide material selection without canvas interaction.

The workspace respects reduced-motion preferences. If animation or WebGL is unavailable, the HTML source browser, citation details and cabin-item controls remain usable; the viewer provides a schematic fallback. The model is **illustrative, not a fire simulation**. Inspecting a draft record does not verify it or make it eligible for results. **Zero verified rows cannot produce evidence-backed cabin results.** Model selection does not change review status, establish gravity transfer or validate a cabin design. No universal measured 0 g/1 g gravity bounds are inferred.

## Evidence review workflow

The **Evidence review** panel (Model and evidence pane) turns the cabin setup into a research handoff:

1. Choose **Load lunar rover scenario**. Each BOM line, including duplicates, lists its candidate NASA records; a material with no record is shown as a research task, not as a finding.
2. Pick a line and a candidate record. The matrix puts the requested conditions beside the source's stated conditions, with the citation and locator. **Unknown** stays unknown (never 0), **Conflict** marks a differing condition, and rod/wire width is **Not applicable**.
3. **Pin baseline**, then change oxygen, pressure or gravity in Cabin setup. The panel lists which records changed state, condition by condition, and the ordered research questions update.
4. **Download Markdown brief** / **Download JSON brief**, or **Open brief** to read the exact export. A reviewer can open a downloaded brief file later.

Walkthrough video (96 s, live recording of this build with captions and synthetic narration): [MP4](docs/pitch/walkthrough/redline-evidence-review-walkthrough.mp4), [captions (WebVTT)](docs/pitch/walkthrough/redline-evidence-review-walkthrough.vtt), [transcript](docs/pitch/walkthrough/redline-evidence-review-walkthrough-transcript.md), and the [Markdown](docs/pitch/walkthrough/redline-brief-lunar-pressurized-rover-cabin-illustrative.md) and [JSON](docs/pitch/walkthrough/redline-brief-lunar-pressurized-rover-cabin-illustrative.json) briefs exported on screen. The scenario is illustrative and is not an experimental result.

**Review-ready** means a verified record whose stated conditions all match the request, ready for bounded source review; it is not a safety finding. With the current dataset all 45 records are drafts and 0 are review-ready. Fewer gaps do not mean lower fire risk. The brief is built from data only; Ask REDLINE text is never included.

## Data sources

The primary dataset is [NASA PSI](https://psi.nasa.gov/), with supporting publications from the [NASA Technical Reports Server](https://ntrs.nasa.gov/). Follow each result's NASA citation and recorded test conditions. See the [data documentation](data/README.md), [source metadata](data/metadata.json), [credits and data attributions](docs/credits.md), and [methods and limitations](docs/methods.md) for provenance, verification status and interpretation limits.

## Team

**Interlake Embers** — NASA Space Apps Challenge 2026, Seattle; **Flame in Freefall**. NASA researchers and contributing investigators are credited in the [source register](docs/credits.md). REDLINE is an independent challenge project; no NASA endorsement is claimed.
