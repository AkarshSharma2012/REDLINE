# HANDOFF: issue #119 (Quintiere partial-gravity evidence rows)

- Done: searched NTRS and the web for Quintiere et al. gravity-dependent flame spread and ignition data.
- Result: **0 rows** (fallback). `research/rows-quintiere.csv` is the header only, with the exact `data/evidence.csv` column order.
  `research/rows-quintiere.md` explains what was found and skipped, and proposes the metadata key `QUINT-FIST99`.
- Key decision: the KC-135 FIST PMMA ignition-delay points (Cordova...Quintiere 1999, printed p. 36, Fig. 2) exist only in a
  figure, so they were not digitized (no guessed values). No Quintiere partial-gravity (lunar or Mars) data was found.
- Next (human): check for a Quintiere partial-gravity paper outside NTRS; optionally digitize Fig. 2; the spec has no `s` value_unit.
- Tested: CSV header compared byte-for-byte with `data/evidence.csv` line 1; `node --test` exit 0 (191 tests, 104 pass, 0 fail; remainder skipped/todo). No code changed.

STATUS: DONE
