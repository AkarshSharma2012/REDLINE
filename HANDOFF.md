# HANDOFF: #124 R: Compile the known flammability limits (LOC) registry

## Done
- `research/limits-registry.csv`: 88 published limit values (HWB06 Table 2, OF12 Table I, TM-2008-215260 Table 1, MIST FY2025 LOC-FS/LOC-FR, Marcum 2016, Urban ICES-2025 lunar refs, SIBAL quench/blowoff). Every row has source URL + page/table/figure/row locator.
- `research/limits-registry.md`: method classes, sources, caveats, unverified list.

## Key decisions
- Only MIST rows are `LOC-FS`/`LOC-FR`; MOC, ULOI, MOC*, drop-test and flow limits are kept as `other: ...` so they are never presented as LOC-FS.
- MIST LOC-FR value left blank: not found in the sources reviewed.
- OF12 and TM08 disagree on 1 g ULOI/MOC; both listed, none preferred.
- Our own digitized fit extrapolations (lunar-2025 E0/E35) and compensation factors excluded: not published values.

## How tested
- HWB06 p. 3-4, OF12 p. 6, TM08 PDF p. 7, SIBAL p. 9 re-read from NTRS PDF text (pypdf) and every value compared. MIST/M16/U25 values rely on existing verification reports (verify-pmma.md, verify-us25.md).
- CSV parsed with a quote-aware parser: 88 rows, 23 columns each, unique IDs.
- `node --test` full suite run once (no code changed).

## Next / for humans
- If data/ should ingest these, a separate task must map them to the S1 schema (not done here; data/ not owned).

STATUS: DONE
