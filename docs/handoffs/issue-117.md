# Issue #117 — Marcum lunar counter-example extraction

Done:
- Searched every NTRS combustion record by J. W. Marcum (3 PDFs downloaded and text-searched, plus 1 record with no file). None reports a lunar or partial-gravity result. All are 1 g vs BASS-II microgravity blowoff studies.
- Traced the lunar counter-example to the same NASA GRC project (PI S. Olson). Sources: NASA Task Book FY2022/FY2023/FY2025 (PDF p. 2), the NASA LPSC 2026 slides (PDF p. 20), and Olson et al., Fire Safety Journal 150 (2024) 104267. Marcum is not an author of that paper. Its full text was blocked (ScienceDirect 403, not in PMC).
- Only one lunar test point is stated as text (13.8% O2 stable flame, lunar g, 8.2 psia, r = 0.318 cm PMMA rod). That is below the 3-row threshold, so I followed the issue's fallback:
  - `research/rows-marcum-lunar.csv` holds only the exact `data/evidence.csv` header (0 rows).
  - `research/rows-marcum-lunar.md` covers the findings, the candidate row, the skip reasons, the proposed metadata keys (OLSON-TB23, OLSON-FSJ24) and what is missing.

Key decisions: no figure digitization and no guessed values. data/, src/ and metadata.json were not edited.

Next (for a human): get the full text of the Fire Safety Journal 2024 paper (author manuscript), then extract its partial-g run rows. Also confirm whether the issue meant the Olson et al. result.

Testing: the CSV header is byte-identical to data/evidence.csv (diff). `node --test`: 98 passed, 0 failed. The .md was grepped for prohibited wording; none found. This is a research-only change with no UI, so the http.server page check does not apply.

STATUS: DONE
