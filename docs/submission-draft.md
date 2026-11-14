# REDLINE — submission draft

> Pre-kickoff research draft for issue #33. This describes the proposed product and evidence workflow, not a completed application. Replace planned-use statements only after checking the delivered artifact and its evidence ledger. No application was built for this issue.

## What we propose

REDLINE is a proposed evidence explorer for comparing cabin material choices with NASA combustion experiments. Users would select a material, oxygen concentration, pressure and airflow, then inspect relevant experimental conditions and their sources. This follows the project pitch [P1]; the intended contribution is traceable comparison and visibility of missing evidence, rather than a new combustion prediction model.

NASA's spacecraft fire-safety presentation identifies material flammability and propagation in low and partial gravity as a capability gap [N1, slide 3]. NASA's SoFIE description explains why reduced-gravity ignition and flame behavior matter to material selection [N2, “Science Objectives” and “Spacecraft Applications”]. **Our inference:** linking each displayed result to its actual test conditions could help users distinguish measured behavior from extrapolation. That benefit remains to be evaluated.

## NASA data and resources: what each contributes

The following is the resource inventory reviewed for this draft. “Planned” means no ingestion, numerical extraction or working product use is established here. A catalog entry is not an experimental result. Other agents' research was unavailable in the fetched branches at review time; this inventory must be reconciled with the final data manifest before submission.

| NASA resource | Source location and what was reviewed | Exact REDLINE use and status |
| --- | --- | --- |
| PSI BASS — Burning and Suppression of Solids | NASA PSI catalog [N3], “Combustion Science,” BASS entry; investigation listed separately from BASS-II. | Planned discovery source for microgravity solid-fuel evidence. No raw BASS file was inspected or imported for this draft; no numerical material label is justified by this catalog entry. |
| PSI BASS-II — Burning and Suppression of Solids-II | [N3], “Combustion Science,” BASS-II entry. | Planned discovery source for a separate investigation-specific evidence set. Keep its provenance separate from BASS. Raw files, conditions and outcomes remain unverified here. |
| PSI SAFFIRE-I — Spacecraft Fire Experiment-I | [N3], “Combustion Science,” SAFFIRE-I entry; candidate repository record PSI-98 [N4]. | Planned source of experiment-specific comparisons. PSI-98 surfaced in search, but direct opening returned no readable content. No raw files or values from that record were used; confirm record metadata and file-level locators before ingestion. |
| PSI SAFFIRE-II — Spacecraft Fire Experiment-II | [N3], “Combustion Science,” SAFFIRE-II entry. | Planned separate source for material/condition evidence. No raw files reviewed here. Do not transfer a result from another Saffire mission to this one. |
| PSI SAFFIRE-III — Spacecraft Fire Experiment-III | [N3], “Combustion Science,” SAFFIRE-III entry. | Planned separate source for material/condition evidence. No raw files reviewed here; mission-level availability alone supplies no burn threshold. |
| NTRS: *Development of Spacecraft Fire Safety Technology for Exploration* | [N1], slides 3–7. Slide 4 defines ULOI and MOC; slide 5 discusses exploration atmospheres; slide 7 lists partial-gravity assessment tools. | Used in this draft for problem context, to keep different flammability-limit definitions separate, and to constrain uncertainty language. Planned product explanations should cite the relevant slide. No plotted threshold was digitized for this issue. This is a NASA technical presentation, not a new REDLINE measurement. |
| NASA-STD-6001B with Change 3: *Flammability, Offgassing, and Compatibility Requirements and Test Procedures* | [N5], landing-page “Document Identifiers” and “Document Scope”; linked PDF opened successfully. | Used for the scope of NASA material evaluation and testing. Planned standards context only. Detailed Test 1 criteria must receive a verified PDF section/page before being reproduced; this draft does not claim certification or standards compliance. |
| SoFIE: *Solid Fuel Ignition and Extinction* | [N2], “Science Objectives,” “Facility Description,” and “Spacecraft Applications.” | Used to explain the research motivation and relevant atmospheric variables. This overview is context, not a table of measured limits, and supplies no numerical REDLINE result. |
| SoFIE-MIST: *Material Ignition and Suppression Test* | [N6], “Science Objectives” and “Experiment Description.” | Used to identify flow, oxygen, pressure and external heating as relevant experimental variables. Planned comparison metadata must retain heating and specimen geometry rather than matching on material name alone. The overview describes an investigation; it is not evidence that any selected scenario burned. |

## How the evidence would be presented

The following are **proposed REDLINE policies**, not findings attributed to NASA:

- “Burned in testing at these conditions” would require an inspected evidence row with material identity, specimen geometry, gravity, oxygen, pressure, airflow, outcome and a source locator. A result applies to its documented conditions.
- “Close to a measured limit” would require a cited limit definition and a documented proximity rule. ULOI and MOC are distinct quantities in [N1, slide 4]; no universal proximity margin is established by this draft.
- Missing coverage would read **“not found in the sources reviewed.”** It means the reviewed evidence did not supply the requested match, not that an experiment has not occurred.
- If the product displays a range between selected 0 g and 1 g results, it must say **“estimate based on selected endpoint experiments.”** This is a proposed display convention, not a demonstrated physical bound or a measured lunar-gravity result. Comparability and the bounding assumption need explicit review. [N1, slide 7] includes partial-gravity assessment methods, so we do not claim that all partial-gravity evidence is absent.
- Suggested material swaps or oxygen changes would be exploratory comparisons, with their evidence and unmatched conditions visible. They would not certify a habitat, establish an operational oxygen cap or guarantee lunar behavior.

## AI use and human responsibility

The team-supplied workflow names **Codex, Claude Opus and Claude Fable** as agents for research, specifications and building through a GitHub issue queue [P2]. These names are reported as supplied; this draft has not independently verified exact provider/model identifiers or each agent's activity. Codex performed source review and Markdown drafting for issue #33. Building is reserved for the official kickoff under the task instructions [P2]; this document does not report pre-kickoff app development.

The planned extraction workflow is **AI-assisted extraction with hand-checked evidence rows** [P2]. AI may suggest candidate passages, transcribe conditions or propose structured rows. Before a row can support a displayed result, a human reviewer should compare it with the original page, figure or table, check units and specimen/test identity, and record corrections and review status. An AI summary, generated citation or agent-to-agent agreement is not a substitute for that check. **No completed human checking of experiment rows is evidenced in the sources available to this issue.**

Before final submission, the team should record which agents actually contributed to research, specifications and post-kickoff building, and retain issue/commit links supporting that disclosure. Report only work that happened. AI did not conduct the NASA experiments, and this draft claims no model training, predictive accuracy, scientific validation or NASA endorsement.

## Finalization checklist

- Reconcile every shipped dataset and resource with the table above: add file/version identifiers and exact page, figure, table or raw-file row locators; remove unused planned resources.
- Link the final evidence ledger and human-review record. Keep unchecked or inaccessible evidence out of measured-result labels.
- Replace planned product behavior with verified delivered behavior and link its issue/commit evidence.
- Verify exact AI model names and roles; disclose actual post-kickoff building separately from this preparation.
- Check submission-field limits and official organizer requirements before pasting. This draft follows issue #33's supplied requirements; the official rules were not independently reviewed here.

## References

Format: author/organization. *Title*. Identifier/version where available. URL. Specific locator. Web resources reviewed 14 November 2026. HTML pages have no fixed page numbers, so named sections/entries are used. No direct quotations from NASA sources are reproduced.

- **[N1]** Ruff, Gary A. (NASA Glenn Research Center). *Development of Spacecraft Fire Safety Technology for Exploration*. FLARE 2021 Workshop, 8 September 2021; NTRS 20210021318. https://ntrs.nasa.gov/citations/20210021318 ; PDF: https://ntrs.nasa.gov/api/citations/20210021318/downloads/Tech%20Dev%20for%20Spacecraft%20Fire%20Safety_Location_10-7-2021.pdf . Locators: slides 3–7 (PDF pages 3–7), particularly slide 4, “Flammability Limit Definitions,” and slide 7, “Partial-Gravity Assessment Tools.”
- **[N2]** NASA Science. *Solid Fuel Ignition and Extinction (SoFIE)*. https://science.nasa.gov/biological-physical/investigations/sofie/ . Locators: “Science Objectives,” “Facility Description,” “Spacecraft Applications.”
- **[N3]** NASA. *PSI Investigations by Research Area*. https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/ . Locator: “Combustion Science,” individual BASS, BASS-II, SAFFIRE-I, SAFFIRE-II and SAFFIRE-III entries. Catalog only; underlying experiment files not reviewed here.
- **[N4]** NASA Physical Sciences Informatics. *Spacecraft Fire Safety Experiment-I (SAFFIRE-I)*, candidate record PSI-98. https://psi.nasa.gov/physci/repo/data/investigations/PSI-98 . Locator: investigation landing record. Access limitation: direct page opening yielded no readable text; no page/figure/table or raw data inspected. Included for follow-up, not as scientific result evidence.
- **[N5]** NASA Office of the Chief Engineer. *Flammability, Offgassing, and Compatibility Requirements and Test Procedures*. NASA-STD-6001B with Change 3. https://standards.nasa.gov/standard/nasa/nasa-std-6001 . Locators: “Document Identifiers” and “Document Scope.” Linked PDF: https://standards.nasa.gov/sites/default/files/standards/NASA/B-w/CHANGE-3/3/2025_06_25_NASA-STD-6001B_w_Change_3_FINAL_Admin-Change-FINAL.pdf . PDF accessible; detailed test criteria not extracted for this draft.
- **[N6]** NASA Science. *Solid Fuel Ignition and Extinction – Material Ignition and Suppression Test (SoFIE-MIST)*. https://science.nasa.gov/biological-physical/investigations/sofie-mist/ . Locators: “Science Objectives” and “Experiment Description.”
- **[P1]** Interlake Embers / REDLINE repository. *README.md*. https://github.com/AkarshSharma2012/REDLINE/blob/main/README.md . Locator: opening pitch and “Status”; local assigned-branch copy reviewed. Project intent, not independent scientific evidence.
- **[P2]** REDLINE issue assignment. *W1: Draft the submission write-up (data + AI use + citations)*, issue #33. https://github.com/AkarshSharma2012/REDLINE/issues/33 . Locator: task details, AI-use requirements and overnight rules as supplied in this session. Team-reported workflow, not an independently audited activity log.
