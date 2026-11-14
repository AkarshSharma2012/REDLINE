# REDLINE: final-app demo and video plan

Issue #63. Updated 2026-11-14 against app source commit `31a6acdd778e766d6a896201f376473155c51bc6`. This is a script for the running checkout, with its current limitations. Timing is a rehearsal target, not a measured delivery. Screenshots are real browser captures; no result or source was inserted for presentation.

## What this build can demonstrate

Start with an illustrative pressurized lunar rover, inspect published research, distinguish draft evidence from reviewed results, preview oxygen while holding other conditions fixed, and turn missing coverage into a candidate experiment question.

The captured dataset has **29 rows and zero verified rows**. The current `src/rules/label.js` is a stub. Cabin Check shows **No verified evidence rows loaded**, not material-specific combustion results; its legend is a key, not an outcome. Gravity research is inspectable but held for scientific review. Accuracy shows **Held-out evaluation not run**. Ask REDLINE retrieves source-linked rows without a key; this is retrieval, not a live generated answer. Do not narrate functioning combustion classification, a changing label, measured accuracy or completed scientific validation.

The Investigations screen is present, but the captured rover ranking has tied zero scores and fields saying **No source given in the catalog**. Treat those as an integration limitation, not NASA findings or evidence of equal relevance. Use the source-linked Gravity detail for the substantive source check. The root HANDOFF.md records changes needed from other owners.

## Before presenting

1. From the repository root, run `python -m http.server 8000` and open `http://localhost:8000/#cabin`. ES modules require HTTP. If Python is unavailable, use an existing static server; do not install dependencies for this demo.
2. Use a 1600 x 1000 viewport at 100% zoom, matching the captures. Click **Load lunar rover demo**. This loads and evaluates four hypothetical items: PMMA sheet window/display panel, cotton fabric clothing, P213 tape and Nomex fabric seat cover. It is not a flight manifest. The loader resets the form to its default exploration atmosphere and lunar scenario.
3. Confirm the inputs show **34% O2, 56.5 kPa** and **Lunar scenario (0.16 g, estimate)**. Atmosphere context: [Abercromby et al., Table 1, journal p.77 / PDF p.2](https://www.nasa.gov/wp-content/uploads/2023/03/abercromby-8.2-34-atm-2015.pdf). The choice of this scenario and item uses is REDLINE's illustration. Leave unknown airflow blank; blank does not mean zero.
4. Preflight **Gravity view**: PMMA / **PMMA sheet · flaming**; expand **Inspect draft research detail · excluded from cabin results**, then **Open evidence record** for `U25-01-L`. Locate the source link, source locator and `HOLD_scientific_review` tag. Close the detail and collapse the draft section, then return to Cabin Check.
5. Preflight **Ask REDLINE** with `Which materials were tested at lunar gravity?`; submit **Ask**. Leave the optional API-key section closed and empty. Return to Cabin Check. No secret or live API call is needed.
6. Check the dataset revision in the header. If it differs from the capture manifest, repeat the walkthrough and update captures before recording. Open the cited NASA PDF in advance if network access at judging is unreliable; keep its title and page visible.

## Two-minute demo click-path

Read only the narration column. Approximately 210 spoken words leave room for clicks and pauses. All times include navigation. Keep the full caveats visible when zooming. Begin after the page has loaded; no typing an API key or waiting for a generated response.

| Time | Exact action and visible state | Narration |
| --- | --- | --- |
| 0:00–0:18 | **Cabin Check → Load lunar rover demo**. Point to scenario and atmosphere, then the zero-verified-results notice. Shot 02. | Imagine reviewing a pressurized lunar rover: a window panel, clothing, tape and a seat cover. This illustrative request asks which published combustion evidence applies. The atmosphere and material forms stay explicit. |
| 0:18–0:30 | **Investigations**. Set **Rank for habitat → Pressurized rover**. Show the catalog and its missing-source fields; do not read tied scores as scientific rankings. Shot 01. | REDLINE brings the PSI investigation catalog into the workflow. This checkout still has missing catalog links and tied scores, so we will inspect a source-linked research record directly. |
| 0:30–0:52 | **Gravity view → PMMA**. Keep **PMMA sheet · flaming**. Expand **Inspect draft research detail · excluded from cabin results**; click the first **Open evidence record** (`U25-01-L`), then scroll to **Selected evidence**. Shots 03–04. | Here is PMMA sheet research, its specimen conditions and a NASA source location. This record remains held for scientific review. Simulated lunar gravity is not a measurement on the lunar surface. |
| 0:52–1:10 | Point to the detail's **Review** cell and NASA source link. Open the presentation link to slide 14, or show its preloaded copy; return to app. | A shared material name does not establish a match. The endpoint, pressure, flow and review status matter. Draft values remain inspectable, but they cannot drive this cabin's result. |
| 1:10–1:28 | **O2 tradeoff**. Set **Preview oxygen (% by volume)** to `30` (or move sweep to 30%). Point to fixed pressure, gravity, four items, and missing-coverage state. Click **Cancel preview**. Shot 05. | Preview oxygen while pressure, airflow, gravity and materials stay fixed. There are no verified rows here, so no changing combustion label is claimed. Cancel preserves the original cabin. |
| 1:28–1:42 | **Accuracy**. Show **Held-out evaluation not run** and the method requirements. Shot 06. | The evaluation screen states what has actually run: no held-out evaluation and no accuracy score. A source check and a predictive validation are different tests. |
| 1:42–2:00 | **Ask REDLINE**; enter the prepared question and **Ask**. Show retrieved rows and draft tags. Return to **Cabin Check**, ending on **Candidate experiment question / REDLINE inference**. Shots 07 and 02. | Ask retrieves relevant records and their sources without a key. Missing coverage becomes a candidate experiment question, not an approved NASA experiment. Can each asserted result survive a source check? That is our test. |

### Presentation rules and fallback

- If a later reviewed build produces labels, use exactly **burned in testing at these conditions**, **close to a measured limit**, or **not found in the sources reviewed**, with the supporting NASA source and locator visible. Rehearse and recapture that build; do not splice new claims into these screenshots.
- Do not read a draft numeric threshold aloud as an established material limit. For this checkout, the source check demonstrates traceability and a review hold, not numerical validation.
- Show lunar estimates only with their assumptions and separate 0 g / 1 g context. Here, the UI says **0 g / 1 g assumed envelope unavailable**. Do not invent a range or imply that the endpoints establish a universal physical bound. V2 D1 documents the limitation.
- The oxygen value of 30% is an illustrative user edit, not a NASA recommendation. Intermediate pre-breathe coverage is not interpolated; show **pre-breathe duration not found in the sources reviewed** if visible. Do not narrate protocol durations.
- If no verified rows remain available, keep the script as written. The legend's three states do not count as demonstrated results. Cabin evidence-row selection is unavailable in this state; Gravity detail supplies the inspectable source record.
- If the app or network fails, say: **“These are captures of the local build; I will walk through its recorded states.”** Use shots in demo order: 02 → 01 → 03 → 04 → 05 → 06 → 07 → 02. Label the presentation **Recorded walkthrough**, not live interaction. Use a preloaded original PDF or its visible link/locator; do not claim a successful fresh source fetch.

## Thirty-second video storyboard

Six five-second segments; narration is approximately 53 words. This is an editing plan, not a rendered video. Use hard cuts and a stationary cursor while reading. Retain source links, draft tags and coverage notices; no fabricated charts, badges or result transitions.

| Time | Picture / action | Voiceover | On-screen caption |
| --- | --- | --- | --- |
| 0:00–0:05 | Shot 02: load rover, show scenario and atmosphere. | A lunar rover review starts with materials and conditions. | Illustrative rover request |
| 0:05–0:10 | Shot 01: Pressurized rover catalog; retain missing-source state. | REDLINE brings NASA's PSI investigation catalog into the workflow. | Catalog integration in progress |
| 0:10–0:15 | Shots 03–04: PMMA detail and source locator, with review tag visible. | Inspect the source, specimen and review status. This record remains draft. | Draft research · excluded from cabin labels |
| 0:15–0:20 | Shot 05: preview 30%; frame fixed pressure and zero-verified notice. | Preview oxygen; missing evidence stays visible. | No verified evidence loaded |
| 0:20–0:25 | Shot 06: not-run banner, then Shot 07 retrieved rows. | No accuracy score is claimed. Ask retrieves source-linked records. | Retrieval shown · evaluation not run |
| 0:25–0:30 | Shot 02: candidate experiment card; finish on REDLINE title and card. | The gap becomes a candidate experiment question for review. | Candidate question · REDLINE inference |

## Screenshot manifest

Captured 2026-11-14 from the source commit above, in installed Microsoft Edge headless through DevTools Protocol. Viewport **1600 x 1000 CSS pixels**, device scale 1. PNGs are unedited viewport captures; scroll where indicated. The app was served over HTTP at `http://127.0.0.1:8063/` with a temporary Node server because `python` and `py` were unavailable on PATH. No dependencies were installed. These images include current integration defects rather than hiding them.

Dataset header: `data/evidence.csv@dbb9db601a4a8d07ad77ec5097f8b6231a3f0e41`; built `2026-11-14T18:22:32.413Z`; 29 rows, zero verified. Gravity research revision: `0d0cb9aeba1c93640cedaab916b7a7acc816a9c5`. Counts and revisions are build metadata, not NASA measurements.

| Shot | Capture / recapture state | Image |
| --- | --- | --- |
| 01 | `#investigations`; **Rank for habitat = Pressurized rover**, other filters at defaults; page top. Current catalog shows missing-source messages and tied zero scores. | [Investigations](screenshots/01-investigations.png) |
| 02 | `#cabin`; click **Load lunar rover demo**; page top. Includes zero-verified notice, atmosphere and candidate experiment card. Material editors continue below the fold. | [Lunar rover cabin](screenshots/02-cabin-rover.png) |
| 03 | `#gravity`; rover already evaluated; PMMA sheet / flaming, draft section collapsed; page top. Review hold and unavailable envelope are visible. | [Gravity view](screenshots/03-gravity.png) |
| 04 | Same screen; expand draft detail, **Open evidence record** for `U25-01-L`; scroll down to the selected-evidence panel. Includes source, locator, conditions and review status. Draft numbers are not approved cabin results. | [Expanded evidence detail](screenshots/04-evidence-detail.png) |
| 05 | `#oxygen`; original rover is 34%; preview is **30%**; pressure remains 56.5 kPa, four items retained; page top. Capture before Cancel. | [Oxygen preview](screenshots/05-oxygen-preview.png) |
| 06 | `#accuracy`; no report file, not-run banner; page top. | [Accuracy](screenshots/06-accuracy.png) |
| 07 | `#ask`; submit **Which materials were tested at lunar gravity?**; eight retrieved rows in this revision; key absent; page top. Draft tags and source locators remain visible. | [Ask REDLINE](screenshots/07-ask-redline.png) |

Recapture after any UI or dataset change. Load the rover before Gravity and Oxygen; visiting those hashes alone does not reconstruct the scenario. Restore the cabin with Cancel after the preview. Capture all six tabs plus the expanded detail; never replace missing states with fixture outputs.

## NASA source register and claim boundaries

- **Primary dataset: [NASA Physical Sciences Informatics Data Repository](https://psi.nasa.gov/).** The investigation inventory comes from this repository. Example original record: [BASS-II, PSI-25](https://psi.nasa.gov/physci/repo/data/investigations/PSI-25). This pitch does not claim complete coverage of every PSI investigation or that the current dashboard successfully resolves every catalog field's source.
- **Atmosphere context:** Abercromby, Conkin and Gernhardt, [Modeling a 15-min extravehicular activity prebreathe protocol using NASA's exploration atmosphere](https://www.nasa.gov/wp-content/uploads/2023/03/abercromby-8.2-34-atm-2015.pdf), Table 1, journal p.77 / PDF p.2. The preset is a source-dated comparison, not a universal mission requirement or medical protocol.
- **PMMA detail:** Urban et al., [Solid Fuel Ignition Testing for Lunar Applications, Theory and Experimental Results](https://ntrs.nasa.gov/api/citations/20250002114/downloads/ICES_2025-392-correctedcaptions.pdf), methods pp.5–8, Fig.7 p.8; [NASA presentation](https://ntrs.nasa.gov/api/citations/20250006779/downloads/ICES%202025-392%20Lunar%20Flam%20070725.pdf), slide 14. The captured digitized row is held for review; the source link does not resolve its extraction discrepancies.
- **Gravity context / Ask retrieval:** Olson and Ferkul, [Evaluating Material Flammability in Microgravity and Martian Gravity Compared to the NASA Standard Normal Gravity Test](https://ntrs.nasa.gov/api/citations/20130010991/downloads/20130010991.pdf), criteria pp.2–4; Table I and Eq.(1), p.6. Preserve the distinction between historical endpoints, test conditions and lunar-surface behavior.
- **Candidate experiment context:** [NASA Glenn, Flammability of Materials on the Moon (FM2)](https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/), Background and Objectives. REDLINE's candidate cards are project inferences, not scheduled or accepted NASA experiments.

Sources and locators above follow the repository's published data and review documents; this documentation task did not independently revalidate their scientific extraction. Runtime behavior was checked locally. No physical prediction, novelty, adoption, time savings or improved fire outcome is established by this walkthrough.

## Demo acceptance check

- [x] Loaded the actual rover preset; scenario persisted across tabs.
- [x] Exercised all six tabs; inspected the expanded draft evidence record and its NASA link/locator.
- [x] Changed only oxygen in preview; confirmed pressure and four items remained fixed. Cancel checked separately before completion.
- [x] Retrieved rows in Ask with no API key and no live generation.
- [x] Captured the missing-evidence, scientific-review-hold and not-run states without invented results.
- [ ] Human rehearsal with stopwatch; confirm 120-second delivery and PDF switching time.
- [ ] Record and edit the 30-second video using the storyboard; no video file is claimed here.
