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

No install step and no dependencies. Local browsing needs Python 3 (any recent version); tests need Node 22.12 or newer.

```sh
python -m http.server 8000     # from the repo root, then open http://localhost:8000/
npm test                       # or: node --test
```

Open the page through the server, not as a `file://` path: browsers block ES modules loaded from `file://`.
The committed `data/evidence.json` supplies the evidence data. After editing its source CSV or metadata, regenerate it with `node scripts/build-evidence.mjs` and commit the updated artifact. This is a data maintenance command, not a deployment build step. If loading fails, check that the JSON file is served successfully from the same site.

Tests run without a server: `node --test` (or `npm test`). See the [testing guide](docs/testing.md) for coverage and limitations; passing Node tests does not establish real-browser layout or accessibility.

## Data sources

The primary dataset is [NASA PSI](https://psi.nasa.gov/), with supporting publications from the [NASA Technical Reports Server](https://ntrs.nasa.gov/). Follow each result's NASA citation and recorded test conditions. See the [data documentation](data/README.md), [source metadata](data/metadata.json), [credits and data attributions](docs/credits.md), and [methods and limitations](docs/methods.md) for provenance, verification status and interpretation limits.

## Team

**Interlake Embers** — NASA Space Apps Challenge 2026, Seattle; **Flame in Freefall**. NASA researchers and contributing investigators are credited in the [source register](docs/credits.md). REDLINE is an independent challenge project; no NASA endorsement is claimed.
