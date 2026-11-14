# BASS-II (PSI-25): data access and draft evidence

Issue #19. Research only. Access checked 2026-11-14; no NASA login, cookies or authorization headers supplied.

## Sources and locators

- **PSI25**: NASA, *Burning and Suppression of Solids - II*, PSI-25, version 4, DOI 10.60555/4qc4-de67. [Investigation](https://psi.nasa.gov/physci/repo/data/investigations/PSI-25); [public metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-25). Locators: `experimentalTable`, `added`, `version`, `public`, `restricted`. The metadata endpoint returned HTTP 200; the investigation page itself is a JavaScript shell.
- **Table**: NASA, *PSI-25_Experimental table_BASS-II.csv*, file version 1. [Download resolver](https://psi.nasa.gov/geode-py/ws/studies/PSI-25/download?redirect=false&file=PSI-25_Experimental%20table_BASS-II.csv). Locators: header and PI/Test #/GMT/Sample # fields. Resolver and resulting object both returned HTTP 200; downloaded CSV was 16,590 bytes and contained 129 data rows (local parse).
- **ReadMe**: NASA, *PSI-25_Science Documents_BASS-II_ReadMe.docx*, file version 2. [Download resolver](https://psi.nasa.gov/geode-py/ws/studies/PSI-25/download?redirect=false&file=PSI-25_Science%20Documents_BASS-II_ReadMe.docx). Locators: opening spreadsheet paragraph, `Test Matrix explanation`, `Columns in test matrix`, `Videos`. Resolver and object both returned HTTP 200; DOCX was 21,538 bytes. Text was extracted from `word/document.xml`; section/field names are used rather than unstable DOCX page numbers.
- **Zhao2015**: X. Zhao, J. S. T'ien, P. V. Ferkul, S. L. Olson, *Concurrent flame growth, spread and extinction over composite fabric samples in low speed purely forced flow in microgravity*, 9th U.S. National Combustion Meeting, 2015. [NASA PDF](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf). Locators: pp. 2-3, Experimental; pp. 5-7, Figs. 5-7; p. 9, Appendix run table.
- **Summary2021**: S. L. Olson et al., *Burning and Suppression of Solids-II (BASS-II) Summary Report*, NASA/TM-20210011385, 2021. [NTRS record](https://ntrs.nasa.gov/citations/20210011385); [PDF](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf). Record abstract reviewed; PDF review pending at this checkpoint.

## File access verified

| Artifact | Format and locator | Anonymous access observed |
|---|---|---|
| Experiment table | CSV; PSI25 `experimentalTable`, Table header | Complete download; HTTP 200, `text/csv` |
| README / data FAQ | DOCX; PSI25 `added`, exact ReadMe filename above | Complete download; HTTP 200, Word Open XML MIME type |
| Sample run video | MP4; PSI25 `added`: `PSI-25_Raw Data_BASS_GMT50_SAMPLE_147_TEST_B1.mp4` | Complete download; HTTP 200, `video/mp4`, 5,803,980 bytes |

The sample video's [download resolver](https://psi.nasa.gov/geode-py/ws/studies/PSI-25/download?redirect=false&file=PSI-25_Raw%20Data_BASS_GMT50_SAMPLE_147_TEST_B1.mp4) identifies GMT50 / sample 147 / B1. Full playback and the entire archive were not reviewed. Successful access to this file does not verify every video. [PSI25, `added`; observed requests.]

More analysis and evidence rows follow in the next checkpoint.
