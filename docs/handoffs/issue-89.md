# HANDOFF: #89 D1 Plain-language glossary

## Done
- `docs/glossary.md`: 30 numbered entries (PSI, investigations, ISS, MSG/CIR, BASS/BASS-II, Saffire, SAME/SAME-R/DAFT,
  FLEX/FLEX-2, cool flame/CFI, ACME, SPICE/SLICE, FM2, microgravity, partial gravity, buoyant flow, opposed vs
  concurrent, drop tower/parabolic flight, ignition vs spread, quench/blow-off, LOC, LOC-FS, LOC-FR, LOI,
  NASA-STD-6001 Test 1, MOC/self-extinguishing, JSC 27301, psia/partial pressure, 8.2 psia/34% atmosphere,
  PMMA/SIBAL/Nomex, thin vs thick). Each has 1-2 plain sentences plus source keys with locators; full URL table at the end.

## Key decisions
- Sources reused from REDLINE research branches (R1 #18, R5 #22, R7 #24) and `data/*.json`; marked "via R1/R5/R7"
  where the original was not re-opened. The NASA ISS Combustion Science guide was downloaded and text-searched
  for this glossary (PDF page numbers).
- Marked **unverified**: lunar gravity = 0.16 g (no NASA source checked here); Nomex fiber type (aramid).
- LOC-FS/LOC-FR labels: source paper (ICES-2025-323) was not readable; meanings rely on Huang 2019 (noted in entry 22).
- No web server started. No files other than `docs/glossary.md` and `HANDOFF.md` touched.

## Testing
- Checked every `[KEY]` cited in the glossary resolves to a row in its Sources tables (script: comm of used vs defined keys).
- `node --test`: 799 pass, 1 fail (`tests/missing-fields.test.mjs`, "checked-in report matches current evidence").
  The same failure occurs with the glossary removed, so it is pre-existing and outside this task.

STATUS: DONE
