# REDLINE: rover-cabin demo and pitch

Issue #30. Pre-kickoff planning only. All actions below are proposed presentation directions, not implemented or verified product behavior. Scenario choices are author proposals, not a real rover bill of materials. Bracketed source IDs resolve to titles, URLs and locators below; citations and stage directions are not spoken.

## The one falsifiable question

**For this rover cabin's material list and stated conditions, can REDLINE trace each displayed test result to a NASA source that actually supports it, while making missing or mismatched evidence explicit?**

Proposed evaluation: freeze a reviewed source set and a small cabin list before the demo. An independent reviewer checks every result against its cited location, including material grade/form, dimensions, oxygen, total pressure, airflow, gravity and measured endpoint. Include one deliberately mismatched specimen and one combination absent from that source set. Pass only if every asserted result is supported and both controls are identified correctly; one unsupported assertion falsifies the claim for that evaluation. This is a proposed evidence-traceability test, not physical validation of lunar fire predictions. No evaluation result is claimed here.

## Two-minute demo script

Target: 120 seconds including actions. Read only the spoken column; rehearse with a stopwatch before claiming the timing is demonstrated. Approximately 240 spoken words. Keep the rover cabin visible throughout.

| Time | Proposed action | Spoken words |
| --- | --- | --- |
| 0:00–0:20 | Open the illustrative pressurized lunar rover cabin list. | Imagine reviewing a pressurized lunar rover cabin. You have a material list and a proposed atmosphere. Which fire-test results actually apply? NASA already requires reduced-gravity effects to be evaluated. REDLINE's proposed contribution is to make that evidence easier to inspect for this cabin. [S1, section 5.1.1(i), p.53] |
| 0:20–0:40 | Show material identity, oxygen, total pressure and airflow. Open one reviewed evidence record. | Start with one cabin item. Keep its material grade and physical form visible alongside oxygen, pressure and airflow. Open the evidence. Here are the experiment's conditions and the source location. A result describes that specimen under those conditions; it does not certify this rover. [Author's proposed interpretation rule.] |
| 0:40–1:00 | Put the experiment record beside the cabin request; highlight gravity and specimen differences. | Now compare the record with our request. A specimen mismatch stays visible. Microgravity evidence stays labeled microgravity. We do not silently turn it into a lunar measurement. If the requested combination is absent, the answer is: not found in the sources reviewed. [Author's proposed evidence rule.] |
| 1:00–1:20 | Change oxygen only, keeping pressure, airflow and the cabin list fixed. | Change the proposed oxygen setting. The question is whether the evidence still matches, not whether a color makes the rover safe. If coverage disappears, keep the gap visible. We will not invent a boundary or promise a safer cabin from this control. [Author's proposed demo.] |
| 1:20–1:40 | Open the candidate experiment note and NASA context citation. | That gap becomes a candidate experiment with the missing conditions attached. NASA's FM2 experiment already addresses lunar material flammability. Our proposal complements that work by connecting a cabin question to published evidence and an explicit next question. [S2, Objectives; final sentence is inference.] |
| 1:40–2:00 | Return to the cabin and display the falsifiable question. | Can every displayed result survive a source check? That is our test. REDLINE's intended output is a traceable review and a list of evidence gaps for further investigation. [Author's proposed evaluation and benefit.] |

### Presenter preparation and honest fallback

- Select a genuinely reviewed NASA result before rehearsing. Populate the record with its exact material, specimen, conditions, outcome and page/table/figure. Do not fabricate a convenient numerical threshold to make the slider change a label.
- If a burn observation is shown, say **burned in testing at these conditions** and attach the source. Use **close to a measured limit** only with a reviewed numerical limit, uncertainty and an explicit proximity rule labeled as an inference. Neither label is guaranteed to appear in this demo.
- If no supported numerical endpoint is ready, show a source record and a missing-evidence comparison. Do not promote a run narrative or initial oxygen reading into an extinction threshold. This guardrail follows the limitations reported in the #19 research branch listed below.
- Present the hypothetical cabin list as illustrative. Do not imply that PMMA rods, fabric coupons or any selected test specimen are installed rover hardware.
- No lunar numerical estimate is needed for this script. If the later build includes a range between microgravity and Earth-gravity results, label it **estimate / assumed envelope**. Do not call that range a proven physical bound: NASA's FM2 background describes the possibility of lower lunar oxygen limits. [S2, Background; envelope caution is inference.]
- If interaction or data loading is unavailable at judging, walk through the same source-linked Markdown record and clearly announce a planned workflow. Do not narrate planned features as running software.

## Pitch outline mapped to judging criteria

The five criterion names are supplied by issue #30; this is a proposed mapping, not a claim about official scoring weights or verified 2026 rules.

| Criterion | Pitch point | Evidence or demonstration to put in front of judges | Boundary |
| --- | --- | --- | --- |
| Impact | **Proposed benefit:** help a rover materials reviewer identify which cabin questions have supporting evidence and which need investigation. | Cabin list → source record → explicit evidence-gap note. Evaluate traceability using the test above. | Time savings, adoption and improved safety remain unmeasured. |
| Creativity | **Proposed contribution:** connect a cabin scenario to condition-specific evidence and a candidate experiment in one review sequence. | Change one condition and explain what support remains or disappears. | No verified originality claim; no invented combustion model or claim NASA missed the problem. |
| Validity | NASA's JSC plan explicitly calls for reduced-gravity evaluation. [S1, section 5.1.1(i), p.53] | Open the original source; show specimen and gravity mismatches; report the evaluation only after it runs. | Evidence traceability does not establish predictive accuracy or certify hardware. |
| Relevance | FM2's objectives include connecting Earth screening to reduced-gravity material behavior. [S2, Objectives] | Explain how the proposed gap note could inform a question for the existing research effort. **Inference:** that is a possible use, not NASA endorsement. | No promised NASA uptake or flight date. |
| Presentation | **Proposed delivery:** one rover cabin, one item, one condition change and one source check. | Use the timed sequence above, with readable source locators and a static fallback. | Rehearsal and functioning interactive behavior must be verified after kickoff. |

## Source register and access notes

- **S1 — NASA Johnson Space Center, _Materials and Processes Selection, Control, and Implementation Plan for JSC Flight Hardware_, JSC 27301 Rev J, 31 July 2025.** [Original PDF](https://standards.nasa.gov/system/files/tmp/JSC-27301J_Final.pdf). Locators: section 5.1.1(e), printed p.52, reduced-gravity discussion; section 5.1.1(i), printed p.53, evaluation requirement. Opened and checked directly for this task. NASA's catalog reader labels the result “JSC 27301G,” but the actual PDF cover identifies Rev J; use the document itself.
- **S2 — NASA Glenn, _Flammability of Materials on the Moon (FM2)_.** [NASA page](https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/). Locators: **Background** and **Objectives** (HTML sections; no page, figure or table numbering). Opened directly for this task. The shorter alternate NASA URL failed to fetch; no claim depends on that failed response.

No source text is quoted in the spoken script. Product proposals, the hypothetical scenario, timing targets, acceptance criteria and inferred benefits are editorial choices, not NASA findings.

### Cross-branch context reviewed

Read with `git branch -r`, `git ls-tree` and `git show` from the fetched refs; files were not copied into this branch:

- `origin/task/22-r5-nasa-s-position-standards-fm2-saffire:research/nasa-context.md`: NASA already studies the issue; supplied S1/S2 routes, independently opened above.
- `origin/task/24-r7-cabin-atmosphere-and-pre-breathe-valu:research/atmosphere.md`: atmosphere context. Its reported planning values are deliberately omitted from the spoken script because the cited 2026 NTRS deck could not be retrieved in this task. Both web retrieval and direct shell download failed. No deck contents are independently asserted here.
- `origin/task/18-r1-evidence-table-spec-and-comparability:research/evidence-spec.md`: proposed comparison fields and endpoint separation; used as planning context, not an independently validated algorithm.
- `origin/task/19-r2-bass-ii-psi-25-data-access-and-draft:research/bass2.md`: reports that draft run narratives lack finalized numeric endpoints and must not drive automated boundaries before review. Its raw data were not independently revalidated for this writing task.
- The fetched #20 branch contained no research document. This script makes no claim based on its intended research.

### Claims intentionally excluded

No claim that NASA overlooked reduced gravity, that a material will burn on the Moon, that a material substitution certifies a rover, that all relevant experiments have been reviewed, or that REDLINE has demonstrated safety improvement. No medical pre-breathe duration, mission atmosphere requirement or official judging weight is asserted.
