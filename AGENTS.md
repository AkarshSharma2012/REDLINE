# Rules for AI agents working on REDLINE

## How work is assigned
- Tasks are GitHub issues labeled `ready`. The REDLINE conductor gives you one issue at a time on its own branch (`task/<number>-<slug>`).
- Work only on your issue, on your branch. Never push to `main`; finished work becomes a pull request.
- Read `HANDOFF.md` first if it exists: another agent may have started this task.
- Commit after every meaningful step. Keep `HANDOFF.md` updated: what is done, what is next, key decisions.
- When the issue is fully done and verified, add the line `STATUS: DONE` to `HANDOFF.md`. If you need a human, add `STATUS: BLOCKED: <reason>`.

## What the challenge requires (Flame in Freefall)
- An SI-powered, web-based dashboard that summarizes, ranks and interprets the combustion investigations in NASA's PSI database (BASS, BASS-II, Saffire, SAME/SAME-R, FLEX/FLEX-2, CFI, ACME, SPICE, SLICE...), for fire safety (prevention, detection, suppression) in spacecraft, stations, lunar/Mars bases and pressurized rovers.
- The PSI Data Repository is the primary NASA dataset: cite it. Rockets/propellants are out of scope.

## Science rules (judges score validity)
- Every data value and every label must link to its NASA source (PSI investigation, NTRS paper, or nasa.gov page). No source, no value.
- Use careful wording: "burned in testing at these conditions", "close to a measured limit", "not found in the sources reviewed". Never say "never tested", "safe" or "never burns", and never claim a material will burn on the Moon.
- Lunar-gravity behavior has no direct data yet; show it as a range bounded by 0 g and 1 g results, clearly labeled as an estimate.

## Engineering rules
- Do not choose or change the stack outside the scaffold issue.
- Never commit keys, tokens or secrets. Use environment variables and `.env` (ignored).
- UI work follows `DESIGN.md` once it exists; until then use a restrained, dark, high-contrast pro-tool style (no gradients, glass, emoji or decorative filler).
- Test what you build and say in `HANDOFF.md` how you tested it.
