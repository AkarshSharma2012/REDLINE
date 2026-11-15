# Material aliases and taxonomy

## Scope and status

This is a research lookup proposal, not an implemented resolver. `data/evidence.csv` currently uses `pmma`, `cotton`, `nomex`, `p213`, `polycarbonate` and `sibal`; every ID is represented in the companion CSV. `data/metadata.json` also registers `etfe`, `ptfe` and `velcro`. These statements describe repository contents, not experimental results.

`silicone`, `kapton`, `cellulose`, `polyetherimide` and `epdm` are proposed identifiers, not registered production IDs. Their CSV notes explicitly require catalog registration. Do not pass these to the engine until the catalog owner registers them. No production file is changed here. Blank `material_id` and `canonical_name` mean unresolved, not a new material or missing experimental evidence.

The primary investigation dataset remains the [NASA PSI Data Repository](https://psi.nasa.gov/). The identity references below are NASA-hosted reports; identity evidence does not establish a combustion endpoint or authorize promoting draft evidence.

## Proposed free-text mapping policy (editorial inference)

- Preserve the original user text. Trim surrounding whitespace, collapse repeated whitespace and compare case-insensitively against whole aliases. Do not remove arbitrary punctuation, digits or words; they can identify a grade or blend.
- Accept an exact alias only after applying its note. Abbreviations such as PC and PEI require an explicit polymer context. For acrylic, confirm that the user means acrylic plastic; acrylic textile, paint and adhesive remain unresolved.
- Keep form, dimensions, colour, grade, backing, coating and blend composition separately. A base-material match is only a retrieval key. It does not establish equivalence with a source specimen. For example, Nomex HT90-40 and Nomex Velcro retrieve the existing `nomex` family while retaining their different constructions.
- Do not use substring, fuzzy spelling or semantic similarity to assign an ID automatically. Suggestions may be shown for user confirmation. Unrecognized input returns an unresolved identity and a clarification request.
- If an alias is ambiguous, has a blank ID, or requires registration, stop before labeling. Ask for the polymer, product datasheet, grade and construction as appropriate. Do not silently fall back to the closest material.
- After resolving an existing ID, apply the evidence engine's review-status, endpoint and comparability rules. Alias matching neither changes the name-only validation baseline nor bypasses those rules. Architecture's aliases are display/search help only (`docs/specs/architecture.md`, Data shape).

## Identity evidence and ambiguity decisions

| Input or family | Mapping and limit | NASA source and locator |
|---|---|---|
| PMMA; Plexiglas | `pmma`; retain product/grade. | [Rehydration report, printed p. 5 / PDF p. 9, Table 1, PMMA row](https://ntrs.nasa.gov/api/citations/20190001084/downloads/20190001084.pdf#page=9). This is identity evidence, not a combustion test. |
| Acrylic plastic | Conditional `pmma`; generic acrylic is not enough for textile/coating uses. | [Optical characterization, PDF p. 5, sections 3.1 and 3.2](https://ntrs.nasa.gov/api/citations/20150017032/downloads/20150017032.pdf#page=5). The PMMA paragraph identifies Plexiglas and acrylic; its section heading repeats polycarbonate, so use the paragraph and the separate PMMA table above. |
| Cotton; Cotton Beefy-T | `cotton`; preserve the Beefy-T product designation. Do not substitute cellulose tissue or a composite. | [Lunar testing presentation, slide 18, table, Beefy-T rows](https://ntrs.nasa.gov/api/citations/20250006779/downloads/ICES%202025-392%20Lunar%20Flam%20070725.pdf#page=18); [SIBAL report, p. 2, Experimental, cotton cellulose discussion](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf#page=2). |
| Cellulose; Kimwipes | Proposed `cellulose`; preserve Kimwipes product and tissue form. Cotton is related chemically, not an interchangeable test specimen. Cellulose acetate/nitrate must not be collapsed into this ID. | [Exploration-atmosphere report, printed p. 3 / PDF p. 7, fuel descriptions](https://ntrs.nasa.gov/api/citations/20080034883/downloads/20080034883.pdf#page=7); [rehydration report, Table 1, printed pp. 5-6 / PDF pp. 9-10, separate cellulose derivatives](https://ntrs.nasa.gov/api/citations/20190001084/downloads/20190001084.pdf#page=9). |
| SIBAL | `sibal`; specific cotton/fiberglass composite, not generic cotton or every cotton/fiberglass blend. No composition percentages are copied here. | [SIBAL report, p. 2, Experimental](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf#page=2). |
| Nomex | `nomex`; preserve HT90-40 fabric versus Nomex Velcro construction. Generic nylon/aramid does not resolve to Nomex. | [Exploration-atmosphere report, printed p. 3 / PDF p. 7, fuel descriptions and Table 1](https://ntrs.nasa.gov/api/citations/20080034883/downloads/20080034883.pdf#page=7); [lunar presentation, slide 18 table](https://ntrs.nasa.gov/api/citations/20250006779/downloads/ICES%202025-392%20Lunar%20Flam%20070725.pdf#page=18). |
| Velcro | Unresolved without composition; do not choose the registered `velcro` ID or `nomex` from the brand alone. This is a conservative resolver policy, not a claim about all branded products. | The source names the specific construction [Nomex Velcro, slide 18 table](https://ntrs.nasa.gov/api/citations/20250006779/downloads/ICES%202025-392%20Lunar%20Flam%20070725.pdf#page=18). Generic product composition is **unverified**. |
| P213 tape | `p213` only; preserve product. Chemical composition is **unverified** here; no generic polymer alias is assigned. | [Lunar presentation, slide 18 table, P 213 row](https://ntrs.nasa.gov/api/citations/20250006779/downloads/ICES%202025-392%20Lunar%20Flam%20070725.pdf#page=18). |
| Polycarbonate; PC | `polycarbonate` in confirmed polymer context; not acrylic. | [Rehydration report, printed p. 5 / PDF p. 9, Table 1, polycarbonate row](https://ntrs.nasa.gov/api/citations/20190001084/downloads/20190001084.pdf#page=9). |
| Kapton; polyimide | Proposed `kapton` for the explicit brand; retain H/HN grade. Generic polyimide remains unresolved because the table lists distinct polyimide products. Do not map Nomex or Ultem to Kapton. | [Rehydration report, printed p. 5 / PDF p. 9, Table 1, polyimide and polyetherimide rows](https://ntrs.nasa.gov/api/citations/20190001084/downloads/20190001084.pdf#page=9). |
| Ultem; PEI | Proposed `polyetherimide`; the supported product alias is Ultem 1000. Bare Ultem grade is **unverified** and is not in the CSV. | [Exploration-atmosphere report, printed p. 3 / PDF p. 7, fuel descriptions](https://ntrs.nasa.gov/api/citations/20080034883/downloads/20080034883.pdf#page=7). |
| PTFE; Teflon TFE | `ptfe`. Bare Teflon remains unresolved: the NASA table also identifies Teflon FEP and Teflon PFA. Never map Teflon to ETFE. | [Pressure-effects report, p. 3, Table 1](https://ntrs.nasa.gov/api/citations/20070005041/downloads/20070005041.pdf#page=3); [rehydration report, printed p. 5 / PDF p. 9, Table 1, fluoropolymer rows](https://ntrs.nasa.gov/api/citations/20190001084/downloads/20190001084.pdf#page=9). |
| ETFE; Tefzel ZM | `etfe`; retain grade. Not PTFE, FEP or PFA. | [Rehydration report, printed p. 5 / PDF p. 9, Table 1](https://ntrs.nasa.gov/api/citations/20190001084/downloads/20190001084.pdf#page=9). |
| Silicone rubber; polysiloxane | Proposed `silicone` in rubber context. Bare silicone sealant/coating requires formulation clarification. Silicon is not accepted as a spelling variant; its intended identity is **unverified**. | [Pressure-effects report, p. 3, Table 1, Silicone Rubber row](https://ntrs.nasa.gov/api/citations/20070005041/downloads/20070005041.pdf#page=3). |
| EPDM; rubber | Proposed `epdm` for explicit EPDM only. Bare rubber remains unresolved; the table distinguishes several elastomers. | [Pressure-effects report, p. 3, Table 1, elastomers](https://ntrs.nasa.gov/api/citations/20070005041/downloads/20070005041.pdf#page=3). |

All matching rules and proposed ID spellings above are project decisions. Numeric strings in product names identify source products, not measured values. No physical property, oxygen threshold, pressure, dimension, blend percentage or lunar prediction is introduced. Unknown equivalences remain unverified and their CSV identity fields stay blank. The large BASS summary PDF could not be opened by the web retrieval tool; no new alias is asserted from its inaccessible pages.

## Integration and verification boundary

The companion CSV has the requested columns only. Citation URLs and locators are carried in `note` because the schema provides no separate citation columns. Unresolved rows deliberately have blank identity fields. Conditional and proposed rows require the policy above; this is not a drop-in unconditional dictionary.

The owning integrator must register proposed IDs and implement clarification handling before using this proposal in search. No changes to data, application code, schema, dependencies or the validation baseline are included. Validation results are recorded in root HANDOFF.md. No web server or browser process is started.

