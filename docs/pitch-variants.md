# REDLINE pitch variants

## Delivery contract

Two minutes total, probably no Q&A (event-lead information supplied in issue #91). The demo is a **pre-recorded 30-second video**, embedded at 0:45â€“1:15; narration below continues over it. The app may be clicked through afterwards. Do not depend on questions to explain limitations. One scenario throughout: an illustrative pressurized lunar rover, not an actual rover manifest.

The story starts with Earth-based material fire testing. Do not literally claim that everything sent to the Moon is burned: NASA's material-screening requirements include exceptions and configurational testing [T]. â€œLunar atmosphereâ€ here means the rover's internal exploration atmosphere, not the Moon's exterior.

## One-line pitch

REDLINE asks whether an Earth fire test applies inside a lunar rover, tracing material concerns and evidence gaps back to NASA sources.

## 280-character pitch

REDLINE asks whether an Earth fire test applies inside a lunar rover at 8.2 psia and 34% oxygen. Our goal: drop in a bill of materials; get concerns ranked, each linked to NASA evidence. Today: 45 draft rows, zero verified; lunar results remain estimates, not certification.

The paragraph above is 274 characters, including spaces and punctuation. Atmosphere: [A]. Counts: [D]. The goal is not a claim that import or material-priority sorting is implemented.

## 30-second version

> Before materials go to the Moon, NASA screens their flammability on Earth. But does that test apply inside a lunar rover? At 8.2 psia and 34 percent oxygen, gravity matters. REDLINE's goal is a bill of materials ordered from most to least concern, every line linked to NASA evidence. Today, all 45 evidence rows are draft. We expose that gap instead of inventing a result.

Sources: Earth screening [T]; atmosphere [A]; gravity [G]; counts [D]. Rehearse at roughly 145 words per minute.

## Two-minute spoken script

Read only the blockquotes. Time markers include pauses and the embedded video. Bracketed placeholders are production markers, not words to read aloud; use the fallback instruction below until a result is verified.

### 0:00 â€” Hook

> Before materials go to the Moon, NASA screens their flammability on Earth. But does that fire test still apply inside a lunar rover?

### 0:12 â€” Problem

> Our rover scenario uses the exploration atmosphere: 8.2 psia, 34 percent oxygen. An Earth test is evidence at particular conditions, not an automatic answer for lunar gravity.

### 0:28 â€” Insight

> Ferkul's LPSC 2026 presentation places lunar gravity near the most flammable condition in the evidence presented. That is a reason to check comparability, not a prediction for every material.

### 0:45 â€” Demo; play the pre-recorded video through 1:15

> Here is our illustrative rover's material list. The goal: a researcher drops in a bill of materials and gets a list ordered from most to least concern, every line linked to its NASA source. Today, this screen reports that no verified evidence rows are loaded. A verified material comparison: [PLACEHOLDER: verified result here].

### 1:15 â€” Proof

> The current evidence file contains 45 rows across six evidence-source keys. All 45 are draft; zero are verified. Those counts describe our inventory, not validated accuracy. NASA's PSI Data Repository anchors the investigation evidence; NASA publications supply context.

### 1:35 â€” Impact

> Researchers can see what needs review before relying on a comparison. Lunar outputs remain estimates beside zero-gravity and Earth-gravity results, not lunar measurements. Those endpoints do not guarantee a physical bound.

### 1:50 â€” Close

> REDLINE makes the question inspectable: which Earth fire evidence applies to this lunar rover, and what evidence is still missing? Follow the source. Challenge the comparison.

Sources by beat: hook [T]; problem [A, T]; insight [G]; demo [D, U]; proof [D, P]; impact [G, U]. No measured performance or material outcome is claimed.

**Current recording fallback:** omit â€œA verified material comparisonâ€ and its placeholder from narration; hold on the actual empty-evidence message. Keep the marker in this document until a reviewer supplies a source-linked verified result. Do not replace it with a fixture result. The goal sentence describes the intended workflow: the current form supports manual material entry and a prepared rover list; bill-of-materials file import and concern sorting are not established by the current implementation.

## 30-second video shot list

Use this clip during 0:45â€“1:15 of the pitch. Stay in Cabin Check; do not change the environment or atmosphere. These controls/states are implemented and covered by Node tests, but no browser recording was performed for this documentation task. Capture only the actual current states; if a control fails during recording, retain the preceding working shot and cut the failed action. No mock screens or fabricated result rows.

| Clip time | On screen / action | Narration or caption |
|---|---|---|
| 0:00â€“0:05 | Open `index.html#cabin`; frame Cabin Check and the rover-demo button. | â€œIllustrative lunar rover; not a flight manifest.â€ |
| 0:05â€“0:12 | Click **Load lunar rover demo**. Frame the manually editable PMMA sheet, cotton fabric, P213 tape and Nomex fabric list. | â€œA prepared material list; file import is a goal.â€ |
| 0:12â€“0:18 | Close crop of the same form's 34% oxygen, 56.5 kPa / 8.2 psia pressure and lunar-gravity setting. Leave its NASA atmosphere citation visible. | â€œExploration atmosphereâ€ [A]; do not adjust controls. |
| 0:18â€“0:26 | Frame Results: **No verified evidence rows loaded.** | â€œ45 draft evidence rows; zero verifiedâ€ [D]. Hold long enough to read. |
| 0:26â€“0:30 | Widen to the material list, Results and Evidence panel's selection prompt. | â€œVerified comparison: [PLACEHOLDER: verified result here]â€ stays an editor note, not a rendered caption. Spoken fallback: â€œThe next step is verified evidence.â€ |

Do not show a ranked-results table, a populated material Evidence panel, an upload interaction or an accuracy score in this revision: the current dataset cannot support that demonstration. After the pitch, optional click-through repeats the same rover workflow and its actual coverage state.

## Claim ledger and source links

- **[T] Earth screening:** [NASA JSC 27301 Revision J](https://standards.nasa.gov/system/files/tmp/JSC-27301J_Final.pdf), Â§5.1â€“5.1.1, printed pp. 51â€“53: Test 1 or appropriate configurational testing, with exceptions. [NASA-STD-6001B, Change 3](https://standards.nasa.gov/sites/default/files/standards/NASA/B-w/CHANGE-3/3/2025_06_25_NASA-STD-6001B_w_Change_3_FINAL_Admin-Change-FINAL.pdf), Â§7.1, printed pp. 27â€“30: upward flame propagation. Repository extraction: [NASA context](../research/nasa-context.md), Â§Â§1â€“2. This supports material screening, not a universal claim about every shipped object.
- **[A] Atmosphere:** [NASA Life Support Baseline Values and Assumptions Document](https://ntrs.nasa.gov/citations/20210024855), Â§4.6.3.6, printed p. 142 / PDF p. 156: 8.2 psia / 34% O2 exploration baseline for surface habitat/pressurized rover context. This is a study baseline, not certification of this illustrative rover.
- **[G] Gravity:** [Ferkul et al., Material Flammability at Lunar and Martian Gravity, LPSC 2026](https://ntrs.nasa.gov/api/citations/20260001966/downloads/Ferkul-Lunar%20and%20Planetary%20Science%20Conf%202026%20v2.pdf), PDF p. 18 (printed slide 17), as extracted in [NASA context](../research/nasa-context.md), Â§3. The near-maximum-flammability statement concerns the presented evidence, not every material. Direct NTRS retrieval failed during this task; attribution and locator follow the existing research extraction. [NASA FM2 background](https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/) independently explains the hypothesis of lower oxygen flammability in lunar gravity. It does not establish an outcome for this rover.
- **[P] Primary dataset:** [NASA PSI Data Repository, BASS-II / PSI-25](https://psi.nasa.gov/physci/repo/data/investigations/PSI-25). Distinguish the primary experiment repository from published-paper extractions and atmosphere context.
- **[D] Inventory snapshot:** [data/evidence.json](../data/evidence.json), checked on 2026-11-14: 45 evidence rows; 45 draft; 0 verified; 6 distinct `evidence[].source_key` values; 10 entries in the top-level source registry; 9 material definitions. Six is the count of keys actually referenced by evidence rows, not ten independent experimental campaigns. Counts are REDLINE file arithmetic, not NASA measurements. Follow each row's `source_key` into `sources` and its `source_locator` to the NASA publication; draft status does not validate an outcome. Recount after any data merge before recording.
- **[U] Runtime scope:** [main.js](../src/main.js) (`ROVER_DEMO`, `verifiedOnly`, `loadRoverDemo`), [results-table.js](../src/ui/results-table.js) (zero-verified-row state), [Cabin Check](../index.html#cabin), and [review](specs/review.md), C4/D1. Concern ordering is an intended evidence-review priority, not a probability of ignition; missing evidence must remain explicit. Lunar estimates beside 0 g and 1 g observations are not guaranteed bounds.

