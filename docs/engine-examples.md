# Engine worked examples

Generated with `node scripts/engine-examples.mjs --write`; stdout is the same Markdown.

Dataset: [S1 holdout fixture](../tests/fixtures/holdout-evidence.json), not the production evidence inventory. Primary repository context: [NASA PSI](https://psi.nasa.gov/). Fixture review status is test metadata, not independent verification.

Queries copy the linked seed record except where the heading says SYNTHETIC; those change one field and are hypothetical inputs, not NASA measurements or production evidence. Each result is returned by `labelMaterial`; row diagnostics come from `compareRow`. Candidate rows are not necessarily used to support the label.

Lunar queries are estimates using separate 0 g and 1 g results; they do not establish a measured lunar limit.

## Example 1: Microgravity spread observation at 17.5% O2

Query seed: [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%).

Query: `{"material_id":"pmma","form":"rod","thickness_mm":6.4,"width_mm":null,"o2_pct":17.5,"pressure_kpa":null,"flow_speed_cm_s":null,"flow_direction":"opposed","gravity_g":0,"external_heat_flux_kw_m2":0}`

Engine label: **BURNED**; reason: none. Engine wording: Burned in testing at these conditions. Flags: M, P, T, U, V; cross-gravity: false.

Evidence rows used / cited by the engine:

- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Engine reason: BURNED; comparison: FLAG.
- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Engine reason: BURNED; comparison: FLAG.

Candidate-row diagnostics (including rows not cited):

- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: OK — thickness: cabin 6.4 mm vs row 6.4 mm | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: OK — gravity: cabin 0 g vs row 0 g | X: OK — facility: cabin (long duration) vs row ISS | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row lower-flow; pass criterion: query not specified vs row not stated | U: FLAG — uncertainty: cabin 17.5% O2 vs row 17.5% O2, row uncertainty ±0.3; cabin oxygen is within the row's stated uncertainty
- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: FLAG — thickness: cabin 6.4 mm vs row not stated | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: OK — gravity: cabin 0 g vs row 0 g | X: OK — facility: cabin (long duration) vs row ISS | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row lower-flow; pass criterion: query not specified vs row not stated | U: OK — uncertainty: cabin 17.5% O2 vs row 17% O2, row uncertainty ±0.3
- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Endpoint: burn/no-burn; outcome: no-spread; limit: null null. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: FLAG — thickness: cabin 6.4 mm vs row not stated | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: FLAG — gravity: cabin 0 g vs row 1 g; cross-gravity comparison | X: OK — facility: cabin (long duration) vs row ground | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row raise-flow; pass criterion: query not specified vs row not stated | U: FLAG — uncertainty: cabin 17.5% O2 vs row 18% O2, row uncertainty not stated

## Example 2: Microgravity spread observation at 17% O2

Query seed: [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract.

Query: `{"material_id":"pmma","form":"rod","thickness_mm":null,"width_mm":null,"o2_pct":17,"pressure_kpa":null,"flow_speed_cm_s":null,"flow_direction":"opposed","gravity_g":0,"external_heat_flux_kw_m2":0}`

Engine label: **BURNED**; reason: none. Engine wording: Burned in testing at these conditions. Flags: M, P, T, U, V; cross-gravity: false.

Evidence rows used / cited by the engine:

- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Engine reason: BURNED; comparison: FLAG.

Candidate-row diagnostics (including rows not cited):

- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: FLAG — thickness: cabin not specified vs row 6.4 mm | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: OK — gravity: cabin 0 g vs row 0 g | X: OK — facility: cabin (long duration) vs row ISS | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row lower-flow; pass criterion: query not specified vs row not stated | U: OK — uncertainty: cabin 17% O2 vs row 17.5% O2, row uncertainty ±0.3
- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: FLAG — thickness: cabin not specified vs row not stated | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: OK — gravity: cabin 0 g vs row 0 g | X: OK — facility: cabin (long duration) vs row ISS | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row lower-flow; pass criterion: query not specified vs row not stated | U: FLAG — uncertainty: cabin 17% O2 vs row 17% O2, row uncertainty ±0.3; cabin oxygen is within the row's stated uncertainty
- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Endpoint: burn/no-burn; outcome: no-spread; limit: null null. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: FLAG — thickness: cabin not specified vs row not stated | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: FLAG — gravity: cabin 0 g vs row 1 g; cross-gravity comparison | X: OK — facility: cabin (long duration) vs row ground | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row raise-flow; pass criterion: query not specified vs row not stated | U: FLAG — uncertainty: cabin 17% O2 vs row 18% O2, row uncertainty not stated

## Example 3: Normal-gravity no-spread observation at 18% O2

Query seed: [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion.

Query: `{"material_id":"pmma","form":"rod","thickness_mm":null,"width_mm":null,"o2_pct":18,"pressure_kpa":null,"flow_speed_cm_s":null,"flow_direction":"opposed","gravity_g":1,"external_heat_flux_kw_m2":0}`

Engine label: **NOT_ESTABLISHED**; reason: NE-incompatible. Engine wording: Not established: tests were found, but none is comparable to this cabin. Flags: M, P, T, U, V; cross-gravity: false.

Evidence rows used / cited by the engine:

- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Engine reason: NE-incompatible; comparison: FLAG.

Candidate-row diagnostics (including rows not cited):

- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: FLAG — thickness: cabin not specified vs row 6.4 mm | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: FLAG — gravity: cabin 1 g vs row 0 g; cross-gravity comparison | X: OK — facility: cabin (long duration) vs row ISS | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row lower-flow; pass criterion: query not specified vs row not stated | U: OK — uncertainty: cabin 18% O2 vs row 17.5% O2, row uncertainty ±0.3
- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: FLAG — thickness: cabin not specified vs row not stated | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: FLAG — gravity: cabin 1 g vs row 0 g; cross-gravity comparison | X: OK — facility: cabin (long duration) vs row ISS | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row lower-flow; pass criterion: query not specified vs row not stated | U: OK — uncertainty: cabin 18% O2 vs row 17% O2, row uncertainty ±0.3
- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Endpoint: burn/no-burn; outcome: no-spread; limit: null null. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: FLAG — thickness: cabin not specified vs row not stated | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: OK — gravity: cabin 1 g vs row 1 g | X: OK — facility: cabin (long duration) vs row ground | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row raise-flow; pass criterion: query not specified vs row not stated | U: FLAG — uncertainty: cabin 18% O2 vs row 18% O2, row uncertainty not stated

## Example 4: Normal-gravity measured limit

Query seed: [OSORIO2014-ETFE-1G](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 74, 79, 84.

Query: `{"material_id":"etfe","form":"wire","thickness_mm":0.3,"width_mm":null,"o2_pct":31.5,"pressure_kpa":100,"flow_speed_cm_s":12,"flow_direction":"opposed","gravity_g":1,"external_heat_flux_kw_m2":0}`

Engine label: **BURNED**; reason: none. Engine wording: Burned in testing at these conditions. Flags: M; cross-gravity: false.

Evidence rows used / cited by the engine:

- [OSORIO2014-ETFE-1G](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 74, 79, 84. Engine reason: BURNED; comparison: FLAG.

Candidate-row diagnostics (including rows not cited):

- [OSORIO2014-ETFE-1G](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 74, 79, 84. Endpoint: LOC-FS; outcome: null; limit: 31.5 % O2. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row LOC-FS | M: FLAG — material: cabin etfe vs row "ETFE insulation on copper"; grade, colour or maker may differ | F: OK — form: cabin wire vs row wire | T: OK — thickness: cabin 0.3 mm vs row 0.3 mm | W: OK — width: cabin not specified vs row wire, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: OK — flow speed: cabin 12 cm/s vs row 12 cm/s | P: OK — pressure: cabin 100 kPa vs row 100 kPa | G: OK — gravity: cabin 1 g vs row 1 g | X: OK — facility: cabin (long duration) vs row ground | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row not stated; pass criterion: query not specified vs row flame spread > 100 mm | U: OK — uncertainty: cabin 31.5% O2 vs row 31.5% O2, row uncertainty O2 drift < 1.0% of set value
- [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100. Endpoint: LOC-FS; outcome: null; limit: 26 % O2. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row LOC-FS | M: FLAG — material: cabin etfe vs row "ETFE insulation on copper"; grade, colour or maker may differ | F: OK — form: cabin wire vs row wire | T: OK — thickness: cabin 0.3 mm vs row 0.3 mm | W: OK — width: cabin not specified vs row wire, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: OK — flow speed: cabin 12 cm/s vs row 12 cm/s | P: OK — pressure: cabin 100 kPa vs row 100 kPa | G: FLAG — gravity: cabin 1 g vs row 0 g; cross-gravity comparison | X: FLAG — facility: cabin (long duration) vs row aircraft, a short-duration test | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row not stated; pass criterion: query not specified vs row flame still present at end of µg period | U: OK — uncertainty: cabin 31.5% O2 vs row 26% O2, row uncertainty O2 drift < 1.0% of set value

## Example 5: Microgravity measured limit

Query seed: [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100.

Query: `{"material_id":"etfe","form":"wire","thickness_mm":0.3,"width_mm":null,"o2_pct":26,"pressure_kpa":100,"flow_speed_cm_s":12,"flow_direction":"opposed","gravity_g":0,"external_heat_flux_kw_m2":0}`

Engine label: **BURNED**; reason: none. Engine wording: Burned in testing at these conditions. Flags: M, X; cross-gravity: false.

Evidence rows used / cited by the engine:

- [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100. Engine reason: BURNED; comparison: FLAG.

Candidate-row diagnostics (including rows not cited):

- [OSORIO2014-ETFE-1G](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 74, 79, 84. Endpoint: LOC-FS; outcome: null; limit: 31.5 % O2. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row LOC-FS | M: FLAG — material: cabin etfe vs row "ETFE insulation on copper"; grade, colour or maker may differ | F: OK — form: cabin wire vs row wire | T: OK — thickness: cabin 0.3 mm vs row 0.3 mm | W: OK — width: cabin not specified vs row wire, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: OK — flow speed: cabin 12 cm/s vs row 12 cm/s | P: OK — pressure: cabin 100 kPa vs row 100 kPa | G: FLAG — gravity: cabin 0 g vs row 1 g; cross-gravity comparison | X: OK — facility: cabin (long duration) vs row ground | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row not stated; pass criterion: query not specified vs row flame spread > 100 mm | U: OK — uncertainty: cabin 26% O2 vs row 31.5% O2, row uncertainty O2 drift < 1.0% of set value
- [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100. Endpoint: LOC-FS; outcome: null; limit: 26 % O2. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row LOC-FS | M: FLAG — material: cabin etfe vs row "ETFE insulation on copper"; grade, colour or maker may differ | F: OK — form: cabin wire vs row wire | T: OK — thickness: cabin 0.3 mm vs row 0.3 mm | W: OK — width: cabin not specified vs row wire, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: OK — flow speed: cabin 12 cm/s vs row 12 cm/s | P: OK — pressure: cabin 100 kPa vs row 100 kPa | G: OK — gravity: cabin 0 g vs row 0 g | X: FLAG — facility: cabin (long duration) vs row aircraft, a short-duration test | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row not stated; pass criterion: query not specified vs row flame still present at end of µg period | U: OK — uncertainty: cabin 26% O2 vs row 26% O2, row uncertainty O2 drift < 1.0% of set value

## Example 6: SYNTHETIC query: one oxygen percentage point below a measured limit

Query seed: [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100.

Query: `{"material_id":"etfe","form":"wire","thickness_mm":0.3,"width_mm":null,"o2_pct":25,"pressure_kpa":100,"flow_speed_cm_s":12,"flow_direction":"opposed","gravity_g":0,"external_heat_flux_kw_m2":0}`

Engine label: **NEAR**; reason: none. Engine wording: Close to a measured limit. Flags: M, X; cross-gravity: false.

Evidence rows used / cited by the engine:

- [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100. Engine reason: NEAR; comparison: FLAG.

Candidate-row diagnostics (including rows not cited):

- [OSORIO2014-ETFE-1G](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 74, 79, 84. Endpoint: LOC-FS; outcome: null; limit: 31.5 % O2. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row LOC-FS | M: FLAG — material: cabin etfe vs row "ETFE insulation on copper"; grade, colour or maker may differ | F: OK — form: cabin wire vs row wire | T: OK — thickness: cabin 0.3 mm vs row 0.3 mm | W: OK — width: cabin not specified vs row wire, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: OK — flow speed: cabin 12 cm/s vs row 12 cm/s | P: OK — pressure: cabin 100 kPa vs row 100 kPa | G: FLAG — gravity: cabin 0 g vs row 1 g; cross-gravity comparison | X: OK — facility: cabin (long duration) vs row ground | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row not stated; pass criterion: query not specified vs row flame spread > 100 mm | U: OK — uncertainty: cabin 25% O2 vs row 31.5% O2, row uncertainty O2 drift < 1.0% of set value
- [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100. Endpoint: LOC-FS; outcome: null; limit: 26 % O2. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row LOC-FS | M: FLAG — material: cabin etfe vs row "ETFE insulation on copper"; grade, colour or maker may differ | F: OK — form: cabin wire vs row wire | T: OK — thickness: cabin 0.3 mm vs row 0.3 mm | W: OK — width: cabin not specified vs row wire, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: OK — flow speed: cabin 12 cm/s vs row 12 cm/s | P: OK — pressure: cabin 100 kPa vs row 100 kPa | G: OK — gravity: cabin 0 g vs row 0 g | X: FLAG — facility: cabin (long duration) vs row aircraft, a short-duration test | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row not stated; pass criterion: query not specified vs row flame still present at end of µg period | U: OK — uncertainty: cabin 25% O2 vs row 26% O2, row uncertainty O2 drift < 1.0% of set value

## Example 7: SYNTHETIC query: below the near-limit band

Query seed: [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100.

Query: `{"material_id":"etfe","form":"wire","thickness_mm":0.3,"width_mm":null,"o2_pct":23,"pressure_kpa":100,"flow_speed_cm_s":12,"flow_direction":"opposed","gravity_g":0,"external_heat_flux_kw_m2":0}`

Engine label: **NOT_ESTABLISHED**; reason: NE-no-burn. Engine wording: No burning found in comparable tests at or below this oxygen level in the sources reviewed. Flags: M, X; cross-gravity: false.

Evidence rows used / cited by the engine:

- [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100. Engine reason: NE-no-burn; comparison: FLAG.

Candidate-row diagnostics (including rows not cited):

- [OSORIO2014-ETFE-1G](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 74, 79, 84. Endpoint: LOC-FS; outcome: null; limit: 31.5 % O2. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row LOC-FS | M: FLAG — material: cabin etfe vs row "ETFE insulation on copper"; grade, colour or maker may differ | F: OK — form: cabin wire vs row wire | T: OK — thickness: cabin 0.3 mm vs row 0.3 mm | W: OK — width: cabin not specified vs row wire, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: OK — flow speed: cabin 12 cm/s vs row 12 cm/s | P: OK — pressure: cabin 100 kPa vs row 100 kPa | G: FLAG — gravity: cabin 0 g vs row 1 g; cross-gravity comparison | X: OK — facility: cabin (long duration) vs row ground | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row not stated; pass criterion: query not specified vs row flame spread > 100 mm | U: OK — uncertainty: cabin 23% O2 vs row 31.5% O2, row uncertainty O2 drift < 1.0% of set value
- [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100. Endpoint: LOC-FS; outcome: null; limit: 26 % O2. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row LOC-FS | M: FLAG — material: cabin etfe vs row "ETFE insulation on copper"; grade, colour or maker may differ | F: OK — form: cabin wire vs row wire | T: OK — thickness: cabin 0.3 mm vs row 0.3 mm | W: OK — width: cabin not specified vs row wire, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: OK — flow speed: cabin 12 cm/s vs row 12 cm/s | P: OK — pressure: cabin 100 kPa vs row 100 kPa | G: OK — gravity: cabin 0 g vs row 0 g | X: FLAG — facility: cabin (long duration) vs row aircraft, a short-duration test | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row not stated; pass criterion: query not specified vs row flame still present at end of µg period | U: OK — uncertainty: cabin 23% O2 vs row 26% O2, row uncertainty O2 drift < 1.0% of set value

## Example 8: Different endpoint: quench speed

Query seed: [ZHAO2015-SIBAL-T4](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf) — pp. 2, 3, 5; p. 9 appendix.

Query: `{"material_id":"sibal","form":"fabric","thickness_mm":0.32,"width_mm":22,"o2_pct":18.7,"pressure_kpa":101.3,"flow_speed_cm_s":2.2,"flow_direction":"concurrent","gravity_g":0,"external_heat_flux_kw_m2":0}`

Engine label: **NOT_ESTABLISHED**; reason: NE-incompatible. Engine wording: Not established: tests were found, but none is comparable to this cabin. Flags: E, M, U; cross-gravity: false.

Evidence rows used / cited by the engine:

- [ZHAO2015-SIBAL-T4](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf) — pp. 2, 3, 5; p. 9 appendix. Engine reason: NE-incompatible; comparison: INVALID.

Candidate-row diagnostics (including rows not cited):

- [ZHAO2015-SIBAL-T4](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf) — pp. 2, 3, 5; p. 9 appendix. Endpoint: quench-limit; outcome: quenched; limit: 2.2 cm/s. Grade: INVALID.
  - Rules: E: INVALID — endpoint: cabin asks about flame spread vs row quench-limit, which is not a flame-spread endpoint | M: FLAG — material: cabin sibal vs row "SIBAL, 75% cotton / 25% fiberglass"; grade, colour or maker may differ | F: OK — form: cabin fabric vs row fabric | T: OK — thickness: cabin 0.32 mm vs row 0.32 mm | W: OK — width: cabin 22 mm vs row 22 mm | D: OK — flow direction: cabin concurrent vs row concurrent | V: OK — flow speed: cabin 2.2 cm/s vs row 2.2 cm/s | P: OK — pressure: cabin 101.3 kPa vs row 101.3 kPa | G: OK — gravity: cabin 0 g vs row 0 g | X: OK — facility: cabin (long duration) vs row ISS | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row not stated; pass criterion: query not specified vs row not stated | U: FLAG — uncertainty: cabin 18.7% O2 vs row 18.7% O2, row uncertainty not stated

## Example 9: SYNTHETIC query: form mismatch

Query seed: [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%).

Query: `{"material_id":"pmma","form":"fabric","thickness_mm":6.4,"width_mm":null,"o2_pct":17.5,"pressure_kpa":null,"flow_speed_cm_s":null,"flow_direction":"opposed","gravity_g":0,"external_heat_flux_kw_m2":0}`

Engine label: **NOT_ESTABLISHED**; reason: NE-incompatible. Engine wording: Not established: tests were found, but none is comparable to this cabin. Flags: F, G, M, P, T, U, V; cross-gravity: true.

Evidence rows used / cited by the engine:

- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Engine reason: NE-incompatible; comparison: INVALID.
- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Engine reason: NE-incompatible; comparison: INVALID.
- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Engine reason: NE-incompatible; comparison: INVALID.

Candidate-row diagnostics (including rows not cited):

- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: INVALID.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: INVALID — form: cabin fabric vs row rod | T: OK — thickness: cabin 6.4 mm vs row 6.4 mm | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: OK — gravity: cabin 0 g vs row 0 g | X: OK — facility: cabin (long duration) vs row ISS | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row lower-flow; pass criterion: query not specified vs row not stated | U: FLAG — uncertainty: cabin 17.5% O2 vs row 17.5% O2, row uncertainty ±0.3; cabin oxygen is within the row's stated uncertainty
- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: INVALID.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: INVALID — form: cabin fabric vs row rod | T: FLAG — thickness: cabin 6.4 mm vs row not stated | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: OK — gravity: cabin 0 g vs row 0 g | X: OK — facility: cabin (long duration) vs row ISS | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row lower-flow; pass criterion: query not specified vs row not stated | U: OK — uncertainty: cabin 17.5% O2 vs row 17% O2, row uncertainty ±0.3
- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Endpoint: burn/no-burn; outcome: no-spread; limit: null null. Grade: INVALID.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: INVALID — form: cabin fabric vs row rod | T: FLAG — thickness: cabin 6.4 mm vs row not stated | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: FLAG — gravity: cabin 0 g vs row 1 g; cross-gravity comparison | X: OK — facility: cabin (long duration) vs row ground | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row raise-flow; pass criterion: query not specified vs row not stated | U: FLAG — uncertainty: cabin 17.5% O2 vs row 18% O2, row uncertainty not stated

## Example 10: SYNTHETIC query: flow-direction mismatch

Query seed: [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%).

Query: `{"material_id":"pmma","form":"rod","thickness_mm":6.4,"width_mm":null,"o2_pct":17.5,"pressure_kpa":null,"flow_speed_cm_s":null,"flow_direction":"concurrent","gravity_g":0,"external_heat_flux_kw_m2":0}`

Engine label: **NOT_ESTABLISHED**; reason: NE-incompatible. Engine wording: Not established: tests were found, but none is comparable to this cabin. Flags: D, G, M, P, T, U, V; cross-gravity: true.

Evidence rows used / cited by the engine:

- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Engine reason: NE-incompatible; comparison: INVALID.
- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Engine reason: NE-incompatible; comparison: INVALID.
- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Engine reason: NE-incompatible; comparison: INVALID.

Candidate-row diagnostics (including rows not cited):

- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: INVALID.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: OK — thickness: cabin 6.4 mm vs row 6.4 mm | W: OK — width: cabin not specified vs row rod, where width does not apply | D: INVALID — flow direction: cabin concurrent vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: OK — gravity: cabin 0 g vs row 0 g | X: OK — facility: cabin (long duration) vs row ISS | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row lower-flow; pass criterion: query not specified vs row not stated | U: FLAG — uncertainty: cabin 17.5% O2 vs row 17.5% O2, row uncertainty ±0.3; cabin oxygen is within the row's stated uncertainty
- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: INVALID.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: FLAG — thickness: cabin 6.4 mm vs row not stated | W: OK — width: cabin not specified vs row rod, where width does not apply | D: INVALID — flow direction: cabin concurrent vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: OK — gravity: cabin 0 g vs row 0 g | X: OK — facility: cabin (long duration) vs row ISS | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row lower-flow; pass criterion: query not specified vs row not stated | U: OK — uncertainty: cabin 17.5% O2 vs row 17% O2, row uncertainty ±0.3
- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Endpoint: burn/no-burn; outcome: no-spread; limit: null null. Grade: INVALID.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: FLAG — thickness: cabin 6.4 mm vs row not stated | W: OK — width: cabin not specified vs row rod, where width does not apply | D: INVALID — flow direction: cabin concurrent vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: FLAG — gravity: cabin 0 g vs row 1 g; cross-gravity comparison | X: OK — facility: cabin (long duration) vs row ground | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row raise-flow; pass criterion: query not specified vs row not stated | U: FLAG — uncertainty: cabin 17.5% O2 vs row 18% O2, row uncertainty not stated

## Example 11: SYNTHETIC query: pressure of 56.5 kPa

Query seed: [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract.

Query: `{"material_id":"pmma","form":"rod","thickness_mm":null,"width_mm":null,"o2_pct":17,"pressure_kpa":56.5,"flow_speed_cm_s":null,"flow_direction":"opposed","gravity_g":0,"external_heat_flux_kw_m2":0}`

Engine label: **BURNED**; reason: none. Engine wording: Burned in testing at these conditions. Flags: M, P, T, U, V; cross-gravity: false.

Evidence rows used / cited by the engine:

- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Engine reason: BURNED; comparison: FLAG.

Candidate-row diagnostics (including rows not cited):

- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: FLAG — thickness: cabin not specified vs row 6.4 mm | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin 56.5 kPa vs row not stated | G: OK — gravity: cabin 0 g vs row 0 g | X: OK — facility: cabin (long duration) vs row ISS | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row lower-flow; pass criterion: query not specified vs row not stated | U: OK — uncertainty: cabin 17% O2 vs row 17.5% O2, row uncertainty ±0.3
- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: FLAG — thickness: cabin not specified vs row not stated | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin 56.5 kPa vs row not stated | G: OK — gravity: cabin 0 g vs row 0 g | X: OK — facility: cabin (long duration) vs row ISS | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row lower-flow; pass criterion: query not specified vs row not stated | U: FLAG — uncertainty: cabin 17% O2 vs row 17% O2, row uncertainty ±0.3; cabin oxygen is within the row's stated uncertainty
- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Endpoint: burn/no-burn; outcome: no-spread; limit: null null. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: FLAG — thickness: cabin not specified vs row not stated | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin 56.5 kPa vs row not stated | G: FLAG — gravity: cabin 0 g vs row 1 g; cross-gravity comparison | X: OK — facility: cabin (long duration) vs row ground | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row raise-flow; pass criterion: query not specified vs row not stated | U: FLAG — uncertainty: cabin 17% O2 vs row 18% O2, row uncertainty not stated

## Example 12: SYNTHETIC query: lunar gravity (0.16 g) estimate

Query seed: [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%).

Query: `{"material_id":"pmma","form":"rod","thickness_mm":6.4,"width_mm":null,"o2_pct":17.5,"pressure_kpa":null,"flow_speed_cm_s":null,"flow_direction":"opposed","gravity_g":0.16,"external_heat_flux_kw_m2":0}`

Engine label: **BURNED**; reason: none. Engine wording: Estimate between 0 g and 1 g results: Burned in testing at these conditions. Flags: G, M, P, T, U, V; cross-gravity: true.

Evidence rows used / cited by the engine:

- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Engine reason: BURNED; comparison: FLAG.
- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Engine reason: BURNED; comparison: FLAG.
- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Engine reason: BURNED; comparison: FLAG.

Candidate-row diagnostics (including rows not cited):

- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: OK — thickness: cabin 6.4 mm vs row 6.4 mm | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: FLAG — gravity: cabin 0.16 g vs row 0 g; cross-gravity comparison | X: OK — facility: cabin (long duration) vs row ISS | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row lower-flow; pass criterion: query not specified vs row not stated | U: FLAG — uncertainty: cabin 17.5% O2 vs row 17.5% O2, row uncertainty ±0.3; cabin oxygen is within the row's stated uncertainty
- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: FLAG — thickness: cabin 6.4 mm vs row not stated | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: FLAG — gravity: cabin 0.16 g vs row 0 g; cross-gravity comparison | X: OK — facility: cabin (long duration) vs row ISS | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row lower-flow; pass criterion: query not specified vs row not stated | U: OK — uncertainty: cabin 17.5% O2 vs row 17% O2, row uncertainty ±0.3
- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Endpoint: burn/no-burn; outcome: no-spread; limit: null null. Grade: FLAG.
  - Rules: E: OK — endpoint: cabin asks about flame spread vs row burn/no-burn | M: FLAG — material: cabin pmma vs row "PMMA, cast black"; grade, colour or maker may differ | F: OK — form: cabin rod vs row rod | T: FLAG — thickness: cabin 6.4 mm vs row not stated | W: OK — width: cabin not specified vs row rod, where width does not apply | D: OK — flow direction: cabin opposed vs row opposed | V: FLAG — flow speed: cabin not specified vs row not stated | P: FLAG — pressure: cabin not specified vs row not stated | G: FLAG — gravity: cabin 0.16 g vs row 1 g; cross-gravity comparison | X: OK — facility: cabin (long duration) vs row ground | H: OK — external heat flux: cabin 0 kW/m2 vs row 0 kW/m2 | A: OK — limit approach: query not specified vs row raise-flow; pass criterion: query not specified vs row not stated | U: FLAG — uncertainty: cabin 17.5% O2 vs row 18% O2, row uncertainty not stated

Separate gravity results bounding the estimate (no direct lunar data):

- g0: **BURNED**; cited: LINK2018-UG-17, LINK2018-UG-B19; wording: Burned in testing at these conditions.
- g1: **NOT_ESTABLISHED** (NE-incompatible); cited: LINK2018-1G-18; wording: Not established: tests were found, but none is comparable to this cabin.
