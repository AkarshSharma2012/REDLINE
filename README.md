# REDLINE

NASA plans to run a Moon base at around 30% oxygen or more, a level hospitals already treat as a fire risk. But cabin materials are still approved with a fire test done in Earth gravity. REDLINE checks whether that holds up.

Enter the materials in a Moon base or lunar rover (Nomex, cotton, Teflon, acrylic and more) with the cabin's oxygen, pressure and airflow. REDLINE compares each material against NASA's space fire experiments and labels it **burned in testing**, **close to the burn limit**, or **never tested**, with a link to the experiment behind every label.

- Oxygen slider: the tradeoff between spacewalk pre-breathe time and how many materials become a fire risk.
- Fixes: swap a material or cap the oxygen level.
- Every untested combination becomes a suggested experiment for NASA's upcoming Moon fire tests.

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
