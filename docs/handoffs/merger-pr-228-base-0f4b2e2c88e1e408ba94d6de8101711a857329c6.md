# Issue #235
- No-burning coverage now requires compareRow rule P OK (known pressures within its existing 10 kPa tolerance). Flagged burning/NEAR evidence remains eligible; NASA data unchanged.
- Enforced both U2 regressions; added query-pressure gaps, both boundary directions, measured-limit coverage and mixed-row citation checks. Updated legacy T3 and mismatched partial-pressure expectations to U2.
- Verification: focused pre-fix run failed both regressions as expected. Final node --test exited 0: 1134 tests, 1051 pass, 0 fail, 83 existing TODO. Initial full run exposed five stale assertions; corrected and reran. git diff --check passed. No server, browser or background process started.
STATUS: DONE
