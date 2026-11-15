# Engine worked examples

Generated with `node scripts/engine-examples.mjs --write`; stdout is the same Markdown.

Dataset: [S1 holdout fixture](../tests/fixtures/holdout-evidence.json), not the production evidence inventory. Primary repository context: [NASA PSI](https://psi.nasa.gov/). Fixture review status is test metadata, not independent verification.

Queries copy the linked seed record except where the heading specifies an illustrative change. Modified queries are hypothetical inputs, not NASA measurements. Each result is returned by `labelMaterial`; row diagnostics come from `compareRow`. Candidate rows are not necessarily used to support the label.

Lunar queries are estimates using separate 0 g and 1 g results; they do not establish a measured lunar limit.

**BLOCKED by #55:** the checked-in comparison engine has no rule diagnostics. Current labels are provisional stub output, not scientific findings. These 12 calls demonstrate integration only; regenerate after the real engine lands.

## Example 1: Spread observation

Query seed: [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%).

```json
{
  "material_id": "pmma",
  "form": "rod",
  "thickness_mm": 6.4,
  "width_mm": null,
  "o2_pct": 17.5,
  "pressure_kpa": null,
  "flow_speed_cm_s": null,
  "flow_direction": "opposed",
  "gravity_g": 0,
  "external_heat_flux_kw_m2": 0
}
```

Engine label: **NOT_ESTABLISHED**; reason: NE-no-data.

Engine wording: Not found in the sources reviewed.

Flags: none; cross-gravity: false.

Evidence rows used / cited by the engine:

- None. No NASA row supports this current engine output; do not interpret it as an experimental finding.

Candidate-row diagnostics (including rows not cited):

- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Endpoint: burn/no-burn; outcome: no-spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.

## Example 2: No-spread observation

Query seed: [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract.

```json
{
  "material_id": "pmma",
  "form": "rod",
  "thickness_mm": null,
  "width_mm": null,
  "o2_pct": 17,
  "pressure_kpa": null,
  "flow_speed_cm_s": null,
  "flow_direction": "opposed",
  "gravity_g": 0,
  "external_heat_flux_kw_m2": 0
}
```

Engine label: **NOT_ESTABLISHED**; reason: NE-no-data.

Engine wording: Not found in the sources reviewed.

Flags: none; cross-gravity: false.

Evidence rows used / cited by the engine:

- None. No NASA row supports this current engine output; do not interpret it as an experimental finding.

Candidate-row diagnostics (including rows not cited):

- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Endpoint: burn/no-burn; outcome: no-spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.

## Example 3: Normal-gravity observation

Query seed: [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion.

```json
{
  "material_id": "pmma",
  "form": "rod",
  "thickness_mm": null,
  "width_mm": null,
  "o2_pct": 18,
  "pressure_kpa": null,
  "flow_speed_cm_s": null,
  "flow_direction": "opposed",
  "gravity_g": 1,
  "external_heat_flux_kw_m2": 0
}
```

Engine label: **NOT_ESTABLISHED**; reason: NE-no-data.

Engine wording: Not found in the sources reviewed.

Flags: none; cross-gravity: false.

Evidence rows used / cited by the engine:

- None. No NASA row supports this current engine output; do not interpret it as an experimental finding.

Candidate-row diagnostics (including rows not cited):

- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Endpoint: burn/no-burn; outcome: no-spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.

## Example 4: Normal-gravity measured limit

Query seed: [OSORIO2014-ETFE-1G](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 74, 79, 84.

```json
{
  "material_id": "etfe",
  "form": "wire",
  "thickness_mm": 0.3,
  "width_mm": null,
  "o2_pct": 31.5,
  "pressure_kpa": 100,
  "flow_speed_cm_s": 12,
  "flow_direction": "opposed",
  "gravity_g": 1,
  "external_heat_flux_kw_m2": 0
}
```

Engine label: **NOT_ESTABLISHED**; reason: NE-no-data.

Engine wording: Not found in the sources reviewed.

Flags: none; cross-gravity: false.

Evidence rows used / cited by the engine:

- None. No NASA row supports this current engine output; do not interpret it as an experimental finding.

Candidate-row diagnostics (including rows not cited):

- [OSORIO2014-ETFE-1G](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 74, 79, 84. Endpoint: LOC-FS; outcome: null; limit: 31.5 % O2. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100. Endpoint: LOC-FS; outcome: null; limit: 26 % O2. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.

## Example 5: Microgravity measured limit

Query seed: [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100.

```json
{
  "material_id": "etfe",
  "form": "wire",
  "thickness_mm": 0.3,
  "width_mm": null,
  "o2_pct": 26,
  "pressure_kpa": 100,
  "flow_speed_cm_s": 12,
  "flow_direction": "opposed",
  "gravity_g": 0,
  "external_heat_flux_kw_m2": 0
}
```

Engine label: **NOT_ESTABLISHED**; reason: NE-no-data.

Engine wording: Not found in the sources reviewed.

Flags: none; cross-gravity: false.

Evidence rows used / cited by the engine:

- None. No NASA row supports this current engine output; do not interpret it as an experimental finding.

Candidate-row diagnostics (including rows not cited):

- [OSORIO2014-ETFE-1G](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 74, 79, 84. Endpoint: LOC-FS; outcome: null; limit: 31.5 % O2. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100. Endpoint: LOC-FS; outcome: null; limit: 26 % O2. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.

## Example 6: One oxygen percentage point below a measured limit

Query seed: [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100.

```json
{
  "material_id": "etfe",
  "form": "wire",
  "thickness_mm": 0.3,
  "width_mm": null,
  "o2_pct": 25,
  "pressure_kpa": 100,
  "flow_speed_cm_s": 12,
  "flow_direction": "opposed",
  "gravity_g": 0,
  "external_heat_flux_kw_m2": 0
}
```

Engine label: **NOT_ESTABLISHED**; reason: NE-no-data.

Engine wording: Not found in the sources reviewed.

Flags: none; cross-gravity: false.

Evidence rows used / cited by the engine:

- None. No NASA row supports this current engine output; do not interpret it as an experimental finding.

Candidate-row diagnostics (including rows not cited):

- [OSORIO2014-ETFE-1G](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 74, 79, 84. Endpoint: LOC-FS; outcome: null; limit: 31.5 % O2. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100. Endpoint: LOC-FS; outcome: null; limit: 26 % O2. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.

## Example 7: Below the near-limit band

Query seed: [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100.

```json
{
  "material_id": "etfe",
  "form": "wire",
  "thickness_mm": 0.3,
  "width_mm": null,
  "o2_pct": 23,
  "pressure_kpa": 100,
  "flow_speed_cm_s": 12,
  "flow_direction": "opposed",
  "gravity_g": 0,
  "external_heat_flux_kw_m2": 0
}
```

Engine label: **NOT_ESTABLISHED**; reason: NE-no-data.

Engine wording: Not found in the sources reviewed.

Flags: none; cross-gravity: false.

Evidence rows used / cited by the engine:

- None. No NASA row supports this current engine output; do not interpret it as an experimental finding.

Candidate-row diagnostics (including rows not cited):

- [OSORIO2014-ETFE-1G](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 74, 79, 84. Endpoint: LOC-FS; outcome: null; limit: 31.5 % O2. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [OSORIO2014-ETFE-UG](https://escholarship.org/content/qt3mm1p1tr/qt3mm1p1tr_noSplash_24b02eb4a98746cf8636ab823ac68279.pdf) — pp. 84, 100. Endpoint: LOC-FS; outcome: null; limit: 26 % O2. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.

## Example 8: Different endpoint: quench speed

Query seed: [ZHAO2015-SIBAL-T4](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf) — pp. 2, 3, 5; p. 9 appendix.

```json
{
  "material_id": "sibal",
  "form": "fabric",
  "thickness_mm": 0.32,
  "width_mm": 22,
  "o2_pct": 18.7,
  "pressure_kpa": 101.3,
  "flow_speed_cm_s": 2.2,
  "flow_direction": "concurrent",
  "gravity_g": 0,
  "external_heat_flux_kw_m2": 0
}
```

Engine label: **NOT_ESTABLISHED**; reason: NE-no-data.

Engine wording: Not found in the sources reviewed.

Flags: none; cross-gravity: false.

Evidence rows used / cited by the engine:

- None. No NASA row supports this current engine output; do not interpret it as an experimental finding.

Candidate-row diagnostics (including rows not cited):

- [ZHAO2015-SIBAL-T4](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf) — pp. 2, 3, 5; p. 9 appendix. Endpoint: quench-limit; outcome: quenched; limit: 2.2 cm/s. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.

## Example 9: Form mismatch

Query seed: [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%).

```json
{
  "material_id": "pmma",
  "form": "fabric",
  "thickness_mm": 6.4,
  "width_mm": null,
  "o2_pct": 17.5,
  "pressure_kpa": null,
  "flow_speed_cm_s": null,
  "flow_direction": "opposed",
  "gravity_g": 0,
  "external_heat_flux_kw_m2": 0
}
```

Engine label: **NOT_ESTABLISHED**; reason: NE-no-data.

Engine wording: Not found in the sources reviewed.

Flags: none; cross-gravity: false.

Evidence rows used / cited by the engine:

- None. No NASA row supports this current engine output; do not interpret it as an experimental finding.

Candidate-row diagnostics (including rows not cited):

- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Endpoint: burn/no-burn; outcome: no-spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.

## Example 10: Flow-direction mismatch

Query seed: [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%).

```json
{
  "material_id": "pmma",
  "form": "rod",
  "thickness_mm": 6.4,
  "width_mm": null,
  "o2_pct": 17.5,
  "pressure_kpa": null,
  "flow_speed_cm_s": null,
  "flow_direction": "concurrent",
  "gravity_g": 0,
  "external_heat_flux_kw_m2": 0
}
```

Engine label: **NOT_ESTABLISHED**; reason: NE-no-data.

Engine wording: Not found in the sources reviewed.

Flags: none; cross-gravity: false.

Evidence rows used / cited by the engine:

- None. No NASA row supports this current engine output; do not interpret it as an experimental finding.

Candidate-row diagnostics (including rows not cited):

- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Endpoint: burn/no-burn; outcome: no-spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.

## Example 11: Illustrative pressure of 56.5 kPa

Query seed: [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract.

```json
{
  "material_id": "pmma",
  "form": "rod",
  "thickness_mm": null,
  "width_mm": null,
  "o2_pct": 17,
  "pressure_kpa": 56.5,
  "flow_speed_cm_s": null,
  "flow_direction": "opposed",
  "gravity_g": 0,
  "external_heat_flux_kw_m2": 0
}
```

Engine label: **NOT_ESTABLISHED**; reason: NE-no-data.

Engine wording: Not found in the sources reviewed.

Flags: none; cross-gravity: false.

Evidence rows used / cited by the engine:

- None. No NASA row supports this current engine output; do not interpret it as an experimental finding.

Candidate-row diagnostics (including rows not cited):

- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Endpoint: burn/no-burn; outcome: no-spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.

## Example 12: Lunar estimate query

Query seed: [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%).

```json
{
  "material_id": "pmma",
  "form": "rod",
  "thickness_mm": 6.4,
  "width_mm": null,
  "o2_pct": 17.5,
  "pressure_kpa": null,
  "flow_speed_cm_s": null,
  "flow_direction": "opposed",
  "gravity_g": 0.16,
  "external_heat_flux_kw_m2": 0
}
```

Engine label: **NOT_ESTABLISHED**; reason: NE-no-data.

Engine wording: Not found in the sources reviewed.

Flags: none; cross-gravity: false.

Evidence rows used / cited by the engine:

- None. No NASA row supports this current engine output; do not interpret it as an experimental finding.

Candidate-row diagnostics (including rows not cited):

- [LINK2018-UG-B19](https://www.nature.com/articles/s41598-017-18398-4) — Results with Figs. 4, 6a (sample B19); Fig. 7 caption (±0.3%). Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [LINK2018-UG-17](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion; Abstract. Endpoint: burn/no-burn; outcome: spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
- [LINK2018-1G-18](https://www.nature.com/articles/s41598-017-18398-4) — Results, Fig. 8 discussion. Endpoint: burn/no-burn; outcome: no-spread; limit: null null. Grade: FLAG.
  - No rule explanations returned; dependency #55 is incomplete.
