# Holdout query set 2: how the 40 queries were chosen

File: `tests/fixtures/holdout-queries-2.csv` (issue #146). Same columns as
`tests/fixtures/holdout-queries.csv`, which is unchanged. Method: `research/validation-plan.md`
(R8) §2 and §3.

## Sources

Every answerable query copies the conditions of one published row in `data/evidence.csv` or
`research/*.csv` (`from_evidence_id`). Its truth comes from that row alone. `truth_source_key`
and `truth_source_locator` give the NASA paper and the page, table or figure. No value was taken
from anywhere else, and no new value was measured or estimated.

| Group (`holdout_group`) | Source keys | Row file | Queries |
|---|---|---|---|
| BASS-SIBAL-ZHAO15 | ZHAO15 (BASS SIBAL, Zhao et al.) | data/evidence.csv | H2-A01, A02 |
| SAFFIRE-I-III-SIBAL | SAFFIRE21, SF1U17, SF3R17 | data/evidence.csv, rows-saffire1.csv, rows-saffire3.csv | H2-A03 to A07 |
| Saffire-IV-VI | SF4U21, SFV21, SFVI24 | rows-saffire4.csv, rows-saffire56.csv | H2-A08 to A12 |
| CEL08 | CEL08 | rows-cellulose.csv | H2-A13 |
| CEL96 | CEL96 | rows-cellulose.csv | H2-A14, A15 |
| Saffire-II | SF2-F17 | rows-saffire2.csv | H2-A16 to A19 |
| M25 | M25 | data/evidence.csv | H2-A20, A21 |
| OF12-OMR08 | OF12, OMR08 | data/evidence.csv, rows-polyimide.csv, rows-olson-partial-g.csv | H2-A22 to A26 |

## How the truth was set (R8 §3.1)

- `burned` (15): the row reports flame spread, a spread rate, or a consumed sample at these
  conditions. Wording in the app: "burned in testing at these conditions".
- `no-burn` (4): Saffire-II silicone samples did not spread, and the source gives no measured
  limit (its O2 is the initial ISS cabin reading). Wording: "did not spread in testing at these
  conditions". This does not mean the material cannot burn.
- `near` (7): the query O2 equals a measured limit in the same source (LOC-FS, MOC,
  extinction-5s). Wording: "close to a measured limit".

`adjudicator_1` and `adjudicator_2` are `pending`. R8 §3.3 requires two people to label each
query blind from the source page before any scored report. Queries they cannot agree on are
dropped and listed, never decided by REDLINE.

## What was left out

- **Partial gravity** (U25 1/6 g, OF12 lunar and Martian rows, LUCI25): R8 §0 does not score
  lunar gravity, and lunar behaviour must be shown as an estimate between the 0 g and 1 g results.
- **No-ignition, blow-off and quench-speed rows**: R8 §3.1 keeps them out of O2 truth. Quench
  speeds are used only as the V controls.
- **Fit extrapolations and compensation factors** (U25 `-E0`, `-E35`, `-CF`): these are model
  output, not test results.
- **BASS-II PMMA runs (PSI25-B*)**: endpoint and result are unresolved in the draft rows.
- **Rows with no gravity class** (HWB06): these rows are used only for the endpoint (E) controls.

## Why the set is independent of the training rows

1. **Whole groups are held out.** Each answerable query names its row and group. The scorer
   (`scripts/eval-holdout.mjs`) removes every row linked to that group (same source, run or
   reused sample) before it asks REDLINE. `assertNoLeak` fails the run if any of those rows is
   left. So REDLINE never sees the row that gives the truth.
2. **Linked sources are merged.** These groups are merged because their sources share data:
   - Saffire-I opposed (SF1U17) and Saffire-III (SF3R17) are in SAFFIRE-I-III-SIBAL. They are
     the same flights as SAFFIRE21.
   - Saffire-IV (SF4U21) is in Saffire-IV-VI.
   - OMR08 is in OF12-OMR08, because OF12 Table I reprints the OMR08 0g values (Nomex 23 /
     Ultem 24 % O2 ULOI).
   A test that holds out one of these sources therefore cannot use the same data reprinted in
   another source.
3. **No overlap with set 1.** No `from_evidence_id` here is used in `holdout-queries.csv`.
   H2-A01/A02 come from the same source as FX-A5 (ZHAO15) but from different runs (GMT96-T7/T8,
   not GMT45-T4). The two sets are scored separately.
4. **Written before scoring.** These queries were written from the source rows without running
   REDLINE or the baseline on them (R8 §3: freeze before scoring).
5. **Queries in one group are not independent.** For example, the four Saffire-II queries share
   a group. Report results per group, not as 40 independent points.

## Controls

- **Incompatible (9).** REDLINE should answer `NE-incompatible`. Each query has a material that
  has rows, but every one of those rows breaks one R1 rule for this query:
  - D (flow direction): mylar, cellulose
  - F (form): polyetherimide wire
  - E (endpoint): EPDM, PTFE (MOC-T1 rows only)
  - H (heat flux): mylar, Nomex
  - V (flow speed): SIBAL below the 2.2 cm/s quench speed in ZHAO15

  No M (material) control was added: the engine filters rows by `material_id`, so a
  different-material query would return no-data, not incompatible.
- **Absent (5).** REDLINE should answer `NE-no-data`. The materials are nylon, polyurethane
  foam, polyethylene, neoprene and polystyrene. None of them has a row in `data/evidence.csv`
  or `research/*.csv` (checked by script). The app should say "not found in the sources
  reviewed".

## Current limit

`eval-holdout.mjs` scores only `review_status = verified` rows. Every row listed here is
still `draft`. Until the rows are verified, the answerable queries are marked `excluded`.
