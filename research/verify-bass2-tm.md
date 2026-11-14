# Verification: BASS2-TM evidence rows against NASA/TM-20210011385

Issue #101. Checked the 15 rows in `data/evidence.csv` with `source_key = BASS2-TM`
(PSI25-B1, B6, B10–B22) against the real NASA source. No data file or `review_status`
changed; a human decides.

- Source: Olson, Ferkul, Bhattacharjee, Miller, Fernandez-Pello, Link, T'ien, Wichman,
  *Burning and Suppression of Solids--II (BASS-II) Summary Report*, NASA/TM-20210011385.
  PDF: https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf
  (downloaded 2026-11-14, 48,972,416 bytes).
- Page offset: PDF page = printed page + 8 (printed p. 103 = PDF p. 111, printed p. 13 = PDF p. 21).
- Table A.1 "Bhattacharjee Test Matrix": printed p. 103 (PDF p. 111,
  [link](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=111))
  and "Table A.1.--Concluded." printed p. 104 (PDF p. 112,
  [link](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=112)).
- Method: text extracted with `pdftotext -raw`; column order checked by text position with
  `pypdf` (header x-positions: Igniter, Flow restrictor, Sample distance, Fan display, Air display).
  No visual render of the pages was made.

## Verdicts

- **CONFIRMED**: every populated field in the row matches the TM.
- **MISMATCH**: at least one populated field differs from what the TM prints (stated below).
- **CANNOT-CHECK**: no field contradicts the TM, but at least one populated field has no value in the TM.

Blank fields (`flow_speed_cm_s`, `o2_pct`, `pressure_kpa`, `endpoint`, `value`, `value_unit`,
`outcome`, `external_heat_flux_kw_m2`) are blank in every row, so there is nothing to check;
see "Shared fields" for what the TM says about them.

## One line per evidence_id

| evidence_id | Verdict | Locator check | Notes (TM = Table A.1 values) |
|---|---|---|---|
| PSI25-B1 | CONFIRMED | p. 103 / PDF p. 111 ✔ | TM: 2/19/2014; as-run 7; sample 147; "100-µm PMMA film, 2 cm wide" (0.1 mm, 20 mm ✔); flow restrictor 2; Opposed; fan 62; air 5; calibrated O2 22.2 → 22.2; "Ignited very quickly, turned flow off after spread halfway; flame extinguished very quickly". [PDF p. 111](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=111) |
| PSI25-B6 | CONFIRMED | p. 104 / PDF p. 112 ✔ | TM: 7/7/2014; as-run 57; sample 153m; "2-cm, 0.1-mm PMMA film"; FR 2; fan "0.9, 1.3, 2.75"; air "3, 5, approaching 10"; cal. O2 21.0 → 20.9; "Steady burning at 3 and 5 cm/s, did not reach 10 cm/s before end of sample, complete burnout". [PDF p. 112](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=112) |
| PSI25-B10 | CONFIRMED | p. 103 / PDF p. 111 ✔ | TM: 7/7/2014; as-run 62; sample 173m; "1-cm, 0.2-mm PMMA film" (0.2 mm, 10 mm ✔); FR 2; fan "1.7 (52), 1.25, 0.9, 0.6, 0.4, 0.35"; air "5, 4, 3, 2, 1"; cal. O2 21.0 → 20.8; "Multiple velocities for steady spread, extinguished at pot 0.35". [PDF p. 111](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=111) |
| PSI25-B11 | CONFIRMED | p. 103 / PDF p. 111 ✔ | TM: 7/7/2014; as-run 61; sample 158m; "2-cm, 0.2-mm PMMA film"; FR 2; fan "2.5 (59), 1.3, 0.7, 0.5, 0.35"; air "5, 3, 1, <1"; cal. O2 21.0 → 20.7; "Multiple velocities for steady spread, extinguished at pot 0.35". [PDF p. 111](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=111) |
| PSI25-B12 | CONFIRMED | p. 103 / PDF p. 111 ✔ | TM: 2/19/2014; as-run 13; sample 160; "300-µm film, 2 cm wide" (cell does not say PMMA; §2.1.1 says all samples were PMMA, see Shared fields); FR 2; fan 46.5; air 2; cal. O2 22.2 → 22.1; "Mostly blue, soot only on bottom". [PDF p. 111](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=111) |
| PSI25-B13 | CONFIRMED | p. 103 / PDF p. 111 ✔ | TM: 7/7/2014; as-run 63; sample 162m; "2-cm, 0.4-mm thick film" (no "PMMA" in cell; §2.1.1 covers it); FR 2; fan "3.5 (68), 1.7, 1.25, 0.9, 0.6, 0.4, 0.35"; air "10, 5, 4, 3, 2, 1"; cal. O2 21.0 → 20.5; "Multiple velocities for steady spread, extinguished at pot 0.35". [PDF p. 111](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=111) |
| PSI25-B14 | CANNOT-CHECK | p. 103 / PDF p. 111 ✔ | `fan_display_source` "pot 0.9 0.5 and down" is not in the TM: the Fan display cell prints dashes; this value is from the PSI-25 CSV only (the row's notes already say so). Everything else matches: 7/2/14; as-run 47; sample 174m; "1-cm-wide, 200-µm-thick PMMA"; FR 2; air "5, 3, 2, extinction"; cal. O2 initial 15.0, final printed as dashes (blank in data ✔); "only brief ignition, flame extinguished". [PDF p. 111](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=111) |
| PSI25-B15 | CONFIRMED | p. 103 / PDF p. 111 ✔ | TM: 7/7/2014; as-run 59; sample 149m; "2-cm, 0.1-mm PMMA film"; FR 0; fan "1.4 (50) increase to 10.0 pot"; air "10, max"; cal. O2 21.0 → 20.8; observation "Spread at 10 cm/s, did not blowoff". The paraphrase "spread at the recorded starting speed" does not contradict this but is less specific than the TM, which names 10 cm/s. [PDF p. 111](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=111) |
| PSI25-B16 | MISMATCH | p. 103 / PDF p. 111 ✔ | (1) `air_display_source` "3 0.5 pot 0.4 pot": the TM prints **"3, 5 pot, 0.4 pot"** (this is the known open B16 discrepancy). (2) `fan_display_source` "44 (pot 0.68)": the TM Fan display cell prints dashes, so the value is not in the TM. Matches: 7/2/14; as-run 51; sample 150m; "2-cm 100-µm-thick PMMA"; FR 2; cal. O2 17.3 → 17.2; "flame quenched after prolonged burn at 0.4 pot, one-sided flame; spread to top side and quenched immediately". [PDF p. 111](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=111) |
| PSI25-B17 | CANNOT-CHECK | p. 103 / PDF p. 111 ✔ | `fan_display_source` "pot 1.2 (48) 0.9 0.4" is not in the TM (Fan display prints dashes). Matches: 7/2/14; as-run 48; sample 175m; "1-cm-wide, 200-µm-thick PMMA"; FR 2; air "5, 3, pot 0.4"; cal. O2 17.5 → 17.4; "Burned steadily at higher flows, extinguished just as we reached a pot of 0.4". [PDF p. 111](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=111) |
| PSI25-B18 | CANNOT-CHECK | p. 104 / PDF p. 112 ✔ | `fan_display_source` "pot 1.02 (47) incr to 7.0" is not in the TM (Fan display prints dashes; the observation text does give "fan pot of 7.0"). Matches: 7/2/14; as-run 49; sample 176m; "1-cm-wide, 200-µm-thick PMMA"; FR 0; air "10, blowoff"; cal. O2 17.4 → 17.4; "flame blew out at a fan pot of 7.0". [PDF p. 112](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=112) |
| PSI25-B19 | CANNOT-CHECK | p. 104 / PDF p. 112 ✔ | `fan_display_source` "47 (pot 1.05) incr to pot 6.0" is not in the TM (Fan display prints dashes). Matches: 7/2/14; as-run 52; sample 151m; "2-cm, 100-µm-thick PMMA"; FR 0; air "10, blowoff"; cal. O2 17.3 → 17.2; "flame blew out at a pot of 6.0". [PDF p. 112](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=112) |
| PSI25-B20 | CANNOT-CHECK | p. 104 / PDF p. 112 ✔ | `fan_display_source` "48 pot 0.9 0.5" is not in the TM (Fan display prints dashes). Matches: 7/2/14; as-run 50; sample 152m; "2-cm, 100-µm-thick PMMA"; FR 2; air "5, 3, pot 0.5"; cal. O2 17.4 → 17.4; "flame burned entire sample". [PDF p. 112](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=112) |
| PSI25-B21 | CONFIRMED | p. 104 / PDF p. 112 ✔ | TM: 8/4/14; as-run 121; sample 174m; "1-cm-wide, 200-µm-thick PMMA"; FR 1; fan "53 and down"; air "5 down to extinction"; cal. O2 20.8 → 20.6; "Ignition at 5 cm/s then fan pot turned down slowly after flame; spreads halfway; flame goes out at 0.355 pot setting". The Igniter cell prints "46", not "Integral" (not used in the data). [PDF p. 112](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=112) |
| PSI25-B22 | CONFIRMED | p. 104 / PDF p. 112 ✔ | TM: 8/4/14; as-run 126; sample 176m; "1-cm-wide, 200-µm-thick PMMA"; FR 1; fan "53, 42, 41, 40.5"; air "5, 2, 0"; cal. O2 20.7 → 20.5; "decreased flow in step, fan pot 1.7, 0.5, 0.4, 0.36 (flame out)". Igniter cell prints "39" (not used). [PDF p. 112](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=112) |

Summary: **9 CONFIRMED** (B1, B6, B10, B11, B12, B13, B15, B21, B22), **1 MISMATCH** (B16),
**5 CANNOT-CHECK** (B14, B17, B18, B19, B20). Total 15.

## Shared fields (same value in every row)

| Field | Data value | Verdict | What the TM says |
|---|---|---|---|
| material / material_id | PMMA film / `pmma` | CONFIRMED | §2.1.1: "Samples were 1- and 2-cm-wide thin films of plastic (PMMA (polymethylmethacrylate)). Thicknesses were between 0.1 and 0.4 mm." Printed p. 13, [PDF p. 21](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=21). |
| form | `sheet` | CANNOT-CHECK | The TM says "film" / "thin films"; "sheet" is an editorial category (the row notes say so). |
| thickness_mm, width_mm | per row | CONFIRMED | Unit conversions of each Table A.1 material cell (100 µm = 0.1 mm, 2 cm = 20 mm, etc.) check out for all 15 rows. |
| flow_direction | `opposed` | CONFIRMED | Table A.1 prints "Opposed" for every row (by text position it sits under the column headed "Sample distance"); §2.1 defines Vg as "opposed-flow velocity". Printed p. 13, [PDF p. 21](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=21). |
| gravity_g / gravity_regime / facility | `0` / ISS microgravity / ISS | CONFIRMED (regime) | Summary: BASS-II burned samples "within the Microgravity Science Glovebox (MSG) aboard the International Space Station (ISS)", printed p. 1, [PDF p. 9](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=9). The TM gives no numeric g level; `0` is an encoding of "microgravity", not a source number. |
| pressure_kpa | blank | CANNOT-CHECK (unverified) | No per-test pressure in Table A.1. §1 uses "pressure P = 1 atm" only as a model assumption for the MSG dilution calculation (printed p. 11, [PDF p. 19](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=19)). Leaving it blank is correct. |
| o2_pct | blank | CANNOT-CHECK | Table A.1 gives calibrated initial/final O2 vol% (checked per row above) but no extinction O2. Leaving `o2_pct` blank is correct. |
| endpoint / value / outcome | blank | CANNOT-CHECK (unverified) | Table A.1 gives no per-test endpoint value. §2.1.2.1 gives only summary values not tied to a test number: extinction velocities "about 1 cm/s for 100, 200, and 300 µm and about 1.5 cm/s for 400 µm" and, at "about 16 percent" O2, "about 2.6 cm/s for 100 µm and about 4 cm/s for 200 µm" (printed p. 13, [PDF p. 21](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=21), and printed p. 15, [PDF p. 23](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=23)). Mapping these to individual rows would be a guess, so the fields stay blank. |
| uncertainty | `not stated` | CONFIRMED (no number) | No numeric uncertainty for any test. §2.1.2.1 only says "there are significant uncertainties in these values as the calibration at such low velocity has high error bars" (printed p. 13, [PDF p. 21](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=21)). A reviewer may want the note to say "qualitative only" rather than "not stated". |
| source_locator / observation_source_locator | Table A.1, printed p. / PDF p. | CONFIRMED | Every row's printed page and PDF page match where the test number appears (see the table above). |
| source title / URL | BASS2-TM in `data/metadata.json` | CONFIRMED | Title and report number match the PDF. `metadata.json` lists authors as "Not stated in extraction"; the TM title page names them (printed p. 1, [PDF p. 9](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=9)). |

## Not checked here

- PSI-25 CSV fields (`condition_source_url`, the PSI-25 download) are a different source and are
  out of scope for this issue.
- Table A.1 has 22 tests (B1–B22; §2.1.2 "Twenty-two test points", printed p. 13, [PDF p. 21](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=21)). B2, B3, B4, B5, B7, B8 and B9
  have no BASS2-TM evidence row; this report does not judge whether they should.
