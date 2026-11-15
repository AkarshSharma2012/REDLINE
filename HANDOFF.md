# Issue #234
- Fixed NE-no-burn fallback: requires covering no-spread evidence at/above query O2 or a measured LOC-FS oxygen limit above it. Missing oxygen and uncovered observation points return NE-incompatible. BURNED/NEAR precedence retained; no-burning citations include only covering rows.
- Removed TODO from both U1 regressions; added synthetic missing-O2, measured-limit and citation checks. Updated older label/wording expectations that contradicted U1, including the lunar 1 g sub-result. NASA data unchanged; U2 pressure semantics remain out of scope.
- Verification: original focused run failed both regressions; final node --test exited 0 (1133 tests: 1048 pass, 0 fail, 85 existing TODO). Initial full run exposed legacy expectations; rerun after corrections passed. git diff --check passed. No server, browser or background process started.
STATUS: DONE
