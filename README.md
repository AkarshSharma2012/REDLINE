# REDLINE

REDLINE is a web-based dashboard for exploring combustion evidence for spacecraft and habitat fire-safety research. Its primary NASA dataset is the [Physical Sciences Informatics (PSI) Data Repository](https://psi.nasa.gov/).

Enter cabin materials and conditions, including oxygen, pressure and airflow. REDLINE uses only verified evidence rows for results and checks whether test conditions are comparable. Results use qualified wording such as **burned in testing at these conditions**, **close to a measured limit**, or **not found in the sources reviewed**. Evidence-backed results link to their NASA sources; a missing result describes a gap in the reviewed evidence, not a conclusion about all testing. If no verified evidence is loaded, no evidence-backed result is available.

- Oxygen exploration: see how many materials have a burned-in-testing result as the selected oxygen changes, subject to comparability checks. These counts describe reviewed evidence, not a physical fire-risk score.
- What changes the label: explore material and oxygen selections alongside their supporting test conditions. A label change does not establish an oxygen operating limit, certify a material, or demonstrate suitability for a cabin.
- Evidence gaps: identify candidate research questions where comparable results are not found in the sources reviewed; these are not commitments to future NASA experiments.

NASA Space Apps Challenge 2026, Seattle. Challenge: Flame in Freefall. Team: Interlake Embers.

## Status

Stack and architecture are decided at kickoff. Work is tracked in GitHub Issues; see `AGENTS.md` for how agents pick up tasks.

## Run locally

No install step and no dependencies. Needs Python 3 (any recent version) and Node 22.12 or newer.

```sh
python -m http.server 8000     # from the repo root, then open http://localhost:8000/
npm test                       # or: node --test
```

Open the page through the server, not as a `file://` path: browsers block ES modules loaded from `file://`.
Until `data/evidence.json` exists (built by `scripts/build-evidence.mjs`), the page shows an "Evidence file could not be loaded" message; that is expected.
