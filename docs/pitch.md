# REDLINE: final-app demo and video plan

Issue #249 update, 2026-11-15, written against `main` at `9b7250a346c86f9f491d15cb82389dbe4d1facc9` (includes merged PRs #238, #239, #244, #246, #248, #250 and #251). The current 60-second script below follows a browser path reported in #249 as checked three times; this documentation task re-ran only the Node suite, not a browser. The two-minute script, storyboard and screenshots further down are historical captures from 2026-11-14 at `31a6acdd778e766d6a896201f376473155c51bc6`; they do not establish current UI behavior. Delivery time remains an unmeasured target. The Opus UI polish pass is separate and not yet approved; recheck the click labels below against any build that includes it.

## Current 60-second demo (2026-11-15)

Path reported in #249: verified three times; all six tabs and Escape focus restore pass at 1440 px and 320 px widths. Begin with the page loaded on **Cabin Check**. No API key, no typing. About 120 spoken words.

| Time | Exact click and visible state | Narration |
| --- | --- | --- |
| 0:00–0:12 | **Cabin Check → Load lunar rover demo**. Point to **34% O2, 56.5 kPa**, **Lunar scenario (0.16 g, estimate)** and the zero-verified notice. | This illustrative pressurized lunar rover lists four cabin materials. REDLINE matches them against forty-five evidence rows. None is human-verified yet, so each result reads: not found in the sources reviewed. |
| 0:12–0:24 | **Gravity** tab. Keep **PMMA sheet · flaming**. Expand **Inspect draft research detail · excluded from cabin results**. | Gravity shows PMMA research from NASA simulated lunar-gravity tests, held as draft and excluded from cabin results. |
| 0:24–0:42 | Click **Open evidence record** for `U25-01-L`. Point to `HOLD_scientific_review`, the NASA source link and its source locator. | Each record carries a NASA citation and a page or slide locator. This one is on scientific-review hold, so it cannot drive a cabin label. Simulated lunar gravity is not a measurement on the Moon. |
| 0:42–0:52 | Return to **Cabin Check**. Point to the results; evidence-row selection is intentionally unavailable. | Row selection stays off until reviewed evidence exists. Unknown airflow stays blank, never zero, so missing conditions cannot fake a match. |
| 0:52–1:00 | Hold on the results and the candidate experiment card. | Every value traces to a NASA source; every gap stays visible as a candidate experiment question, not a conclusion. |

Do not open **Accuracy** in the 60-second cut. Its optional `research/validation-results.csv` returns 404 because held-out evaluation has not been run; no accuracy is claimed.

## Technical workflow (best use of technology)

- **Deterministic evidence matching.** `src/rules/label.js` compares each cabin item with evidence rows for the same material in the same gravity class, then grades how closely each row's test conditions match the cabin. The same inputs always produce the same label; no model generates a result. Only `verified` rows can drive a label, and the checked-in inventory has none.
- **Source locators.** Every evidence row keeps a NASA source URL plus a page, table, figure or slide locator, and a review status such as `HOLD_scientific_review`. Retrieval in **Ask REDLINE** returns these rows and links without an API key.
- **Unknown-condition safeguards.** Blank airflow or heat flux stays `null`, never zero. Missing coverage returns **NOT_ESTABLISHED** (`NE-no-data`, `NE-incompatible`) instead of a guess. Lunar values are labeled estimates, not on-Moon measurements.
- **Static ES modules.** The dashboard is plain HTML, CSS and browser ES modules under `src/`, with no build step and no runtime dependencies. `data/evidence.json` is generated from `data/evidence.csv` by `scripts/build-evidence.mjs`.
- **Node tests.** `node --test` runs the full suite with Node's built-in runner: data integrity, labels, wording, accessibility statics and this demo's data path. Tests check software behavior only; they do not validate material behavior.
- **GitHub task workflow.** Agent lanes A1, A2, B1 and B2 each claim one GitHub issue, work on a `task/<number>-<slug>` branch and open a pull request. The full Node suite gates each merge; nobody pushes to `main` directly.

Claim boundary: no measured physical outcome, completed human verification, accuracy score or bug-free status is claimed.

## What this build can demonstrate

Start with an illustrative pressurized lunar rover, inspect published research, distinguish draft evidence from reviewed results, preview oxygen while holding other conditions fixed, and turn missing coverage into a candidate experiment question.

The checked-in `data/evidence.json` has **45 rows and zero verified rows**, built from `data/evidence.csv@c78b68c2b7ae1c952eb9feb0d51c1a6e7f08b5aa`. These are repository metadata, not NASA measurements. `src/rules/label.js` implements evidence matching, review-status filtering and labels; the Node suite exercises that logic. The current rover evaluation returns four **NOT_ESTABLISHED / NE-no-data** results. Its four materials have no verified evidence in this inventory; this does not establish measured material outcomes. Cabin Check's zero-verified notice and legend must not be presented as combustion findings. Ask retrieval works without a key; retrieval is not a live generated answer. No measured accuracy or completed scientific validation is established here.

The historical Investigations capture has tied zero scores and missing-source fields. Those observations apply to that capture, not necessarily to the current catalog. Historical Gravity and Accuracy screens likewise require a fresh UI check before presenting their visible states as current.

## Before presenting

During conductor work, **do not start a server, browser or background process**. Run `node --test` from the repository root. `tests/pitch-demo.test.mjs` rehearses the current data path without HTTP, a DOM or external requests. It checks inventory metadata, all four rover results, a 30% oxygen preview with other conditions preserved, and source-linked draft retrieval. It does not rehearse clicks, rendering, PDF switching or delivery time.

Short data-only statement (#233, still accurate; use the 60-second script above for the demo): “REDLINE implements evidence matching and labels, but this inventory contains 45 rows with none verified. This illustrative rover returns four results saying not found in the sources reviewed. Changing oxygen to 30% retains that missing-coverage result. Ask retrieves draft research and source links; neither retrieval nor these software tests validates material behavior.”

A current live UI demo requires a separate authorized human walkthrough and fresh captures. Until then, use the dated recorded walkthrough below and identify it as historical. Do not substitute synthetic test outcomes for measured evidence.

## Historical browser preflight (2026-11-14; not rerun for #233)

The following steps describe the captured build only. They are not instructions to launch a browser or server during conductor work.

1. The captured app was already served over HTTP; its browser setup is recorded in the historical screenshot manifest below.
2. Use a 1600 x 1000 viewport at 100% zoom, matching the captures. Click **Load lunar rover demo**. This loads and evaluates four hypothetical items: PMMA sheet window/display panel, cotton fabric clothing, P213 tape and Nomex fabric seat cover. It is not a flight manifest. The loader resets the form to its default exploration atmosphere and lunar scenario.
3. Confirm the inputs show **34% O2, 56.5 kPa** and **Lunar scenario (0.16 g, estimate)**. Atmosphere context: [Abercromby et al., Table 1, journal p.77 / PDF p.2](https://www.nasa.gov/wp-content/uploads/2023/03/abercromby-8.2-34-atm-2015.pdf). The choice of this scenario and item uses is REDLINE's illustration. Leave unknown airflow blank; blank does not mean zero.
4. Preflight **Gravity view**: PMMA / **PMMA sheet · flaming**; expand **Inspect draft research detail · excluded from cabin results**, then **Open evidence record** for `U25-01-L`. Locate the source link, source locator and `HOLD_scientific_review` tag. Close the detail and collapse the draft section, then return to Cabin Check.
5. Preflight **Ask REDLINE** with `Which materials were tested at lunar gravity?`; submit **Ask**. Leave the optional API-key section closed and empty. Return to Cabin Check. No secret or live API call is needed.
6. Check the dataset revision in the header. If it differs from the capture manifest, repeat the walkthrough and update captures before recording. Open the cited NASA PDF in advance if network access at judging is unreliable; keep its title and page visible.

## Historical two-minute demo click-path (2026-11-14)

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

## Historical thirty-second video storyboard (2026-11-14)

Six five-second segments; narration is approximately 53 words. This is an editing plan, not a rendered video. Use hard cuts and a stationary cursor while reading. Retain source links, draft tags and coverage notices; no fabricated charts, badges or result transitions.

| Time | Picture / action | Voiceover | On-screen caption |
| --- | --- | --- | --- |
| 0:00–0:05 | Shot 02: load rover, show scenario and atmosphere. | A lunar rover review starts with materials and conditions. | Illustrative rover request |
| 0:05–0:10 | Shot 01: Pressurized rover catalog; retain missing-source state. | REDLINE brings NASA's PSI investigation catalog into the workflow. | Catalog integration in progress |
| 0:10–0:15 | Shots 03–04: PMMA detail and source locator, with review tag visible. | Inspect the source, specimen and review status. This record remains draft. | Draft research · excluded from cabin labels |
| 0:15–0:20 | Shot 05: preview 30%; frame fixed pressure and zero-verified notice. | Preview oxygen; missing evidence stays visible. | No verified evidence loaded |
| 0:20–0:25 | Shot 06: not-run banner, then Shot 07 retrieved rows. | No accuracy score is claimed. Ask retrieves source-linked records. | Retrieval shown · evaluation not run |
| 0:25–0:30 | Shot 02: candidate experiment card; finish on REDLINE title and card. | The gap becomes a candidate experiment question for review. | Candidate question · REDLINE inference |

## Historical screenshot manifest (2026-11-14)

Captured 2026-11-14 from historical commit `31a6acdd778e766d6a896201f376473155c51bc6`, in installed Microsoft Edge headless through DevTools Protocol. Viewport **1600 x 1000 CSS pixels**, device scale 1. PNGs are unedited viewport captures; scroll where indicated. The app was served over HTTP at `http://127.0.0.1:8063/` with a temporary Node server because `python` and `py` were unavailable on PATH. No dependencies were installed. These images document integration defects observed then, not the current checkout. No recapture was performed for #233.

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

Sources and locators above follow the repository's published data and review documents; this documentation task did not independently revalidate their scientific extraction. Current software behavior is checked through Node tests only; browser observations belong to the dated captures. No physical prediction, novelty, adoption, time savings or improved fire outcome is established by this walkthrough.

## Historical browser acceptance check (2026-11-14 only)

- [x] Loaded the actual rover preset; scenario persisted across tabs.
- [x] Exercised all six tabs; inspected the expanded draft evidence record and its NASA link/locator.
- [x] Changed only oxygen in preview; confirmed pressure and four items remained fixed. Cancel checked separately before completion.
- [x] Retrieved rows in Ask with no API key and no live generation.
- [x] Captured the missing-evidence, scientific-review-hold and not-run states without invented results.
- [ ] Human rehearsal with stopwatch; confirm 120-second delivery and PDF switching time.
- [ ] Record and edit the 30-second video using the storyboard; no video file is claimed here.
