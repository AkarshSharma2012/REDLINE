# REDLINE submission checklist — Seattle 2026

Checked 14 November 2026; updated 15 November 2026 against `main` at `5094334`, merged into this branch. `done` means the named repository artifact exists, not that it has been uploaded or accepted. `todo` means explicit remaining production work; `unknown` means completion cannot be verified, including anything held outside this repo. Only `done` items are checked. This is a preparation checklist, not proof of submission.

## Requirements and verification boundaries

Sources: [2026 challenge](https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/), [2026 event timeline](https://www.spaceappschallenge.org/2026/), [submission guide](https://www.spaceappschallenge.org/resources/project-submission-guide/), [participant terms](https://www.spaceappschallenge.org/legal/), and [Seattle event page](https://www.spaceappschallenge.org/2026/local-events/seattle/). Direct retrieval of the challenge, guide, Seattle and legal pages failed during this check. Search-index excerpts verified the challenge summary, global timeline and selected legal requirements; the complete 2026 guide and Seattle instructions remain unverified. No older year's guide is treated as a 2026 rule.

The issue records the event lead's instruction: judges use slides, a video and an app click-through; the requested package below includes a 2-minute pitch video and a separate demo video. This is team-reported local guidance. Global organizing-team [submission-field guidance](https://github.com/nasa/spaceapps/discussions/1858) and [demo/hosting guidance](https://github.com/nasa/spaceapps/discussions/1991) describe separate demo and final-project links, with a short demo video or up to seven slides. Confirm the current guide and local upload channels before uploading; the two-minute pitch must not be assumed to replace the global short demo.

## Submission package

- [ ] slides — status: unknown — No deck file or public deck link is in the repo; [pitch.md](pitch.md) and [pitch-variants.md](pitch-variants.md) are scripts, not slides. External deck completion cannot be verified. Confirm the global seven-slide limit if the deck doubles as the global demo.
- [ ] 2-minute pitch video — status: todo — [pitch.md](pitch.md) holds a [60-second demo script](pitch.md#current-60-second-demo-2026-11-15) and a historical two-minute click-path; delivery time is unmeasured and no recording or link is recorded.
- [ ] demo video — status: todo — The [current screenshot set](pitch.md#current-screenshot-manifest-6455a3c) is captured and a recording package exists outside the repo, but pitch.md states no rendered or edited video is claimed; record, edit and host it, confirming the guide's duration limit.
- [x] public app link — status: done — [akarshsharma2012.github.io/REDLINE](https://akarshsharma2012.github.io/REDLINE/) is listed in [README](../README.md#live-app-and-deployment) and returned HTTP 200 to an anonymous request on 15 November 2026; pitch.md records a coordinator browser check of build `6455a3c`. Re-check after the final merge.
- [ ] repo link — status: todo — [github.com/AkarshSharma2012/REDLINE](https://github.com/AkarshSharma2012/REDLINE) returned HTTP 404 to an anonymous request on 15 November 2026, so it appears private to judges. A repo admin must make it public (or supply another public link), then re-check signed out.
- [x] AI-use disclosure — status: done — [AI disclosure](ai-use.md), [AI log](ai-log.md) and [submission draft](submission-draft.md#ai-use-and-checking) describe development agents, stored interpretations, optional generation and checking limits; final consistency review remains below.
- [x] credits — status: done — [Credits and data attributions](credits.md) registers NASA sources, investigators, research links and tools. Team contributor names and item-level reuse rights are not listed there; see the team and rights checks below.

## Project page and NASA data

- [x] Project title and challenge identification — status: done — REDLINE / Flame in Freefall / Interlake Embers appear in [submission draft](submission-draft.md).
- [x] Project summary draft — status: done — [What we built and why](submission-draft.md#what-we-built-and-why) describes the problem, approach and delivery limits; portal length constraints remain unverified.
- [x] Detailed project description draft — status: done — [Objective-to-feature table](submission-draft.md#challenge-objectives-and-exact-features) maps summarizing, ranking and interpreting combustion research to the prototype and its limits.
- [x] NASA data used and specific uses — status: done — [NASA resource inventory](submission-draft.md#nasa-data-and-resources-what-each-contributes) identifies the [PSI Data Repository](https://psi.nasa.gov/physci/repo/) as primary, with PSI accessions, NASA/NTRS links and locators.
- [ ] Other space-agency data, external resources and tools field — status: unknown — Confirm the complete inventory with the team, including any assets outside the repo; do not infer that none were used.
- [ ] Reconcile final description and AI disclosure with the submission build — status: todo — Draft and pitch describe different integration snapshots; review actual features, review flags, model metadata and limitations before copying text to the portal.
- [ ] Confirm final challenge coverage in the running app — status: unknown — Descriptive catalog, ranking and interpretation artifacts exist, but this documentation task does not establish complete end-to-end functionality or scientific validity.
- [ ] Audit final slides, narration and page for supported science claims — status: unknown — Preserve NASA source links, draft/review states and limits; use “burned in testing at these conditions,” “close to a measured limit,” and “not found in the sources reviewed.” Label lunar envelopes as estimates, distinct from simulated partial-gravity studies; do not claim operational certification or a completed accuracy result without evidence.
- [ ] Verify final NASA/Space Apps branding compliance — status: unknown — Check all submitted assets against the [official brand guidance](https://www.spaceappschallenge.org/brand/); no completed review is recorded.

## Links and judge walkthrough

- [ ] Verify public app link in a signed-out browser — status: unknown — Anonymous HTTP 200 confirmed for the Pages URL; a full signed-out click-through of the final build is not recorded here.
- [ ] Verify repo link in a signed-out browser — status: todo — Anonymous request returned HTTP 404 on 15 November 2026; fix visibility, then re-check.
- [ ] Verify public slides and both video links — status: unknown — Check playback, permissions, sound, legibility and duration without the team's accounts.
- [ ] Rehearse the app click-through and two-minute pitch — status: todo — Use [pitch.md](pitch.md); confirm actual controls, source drill-down, review/empty states and a timed delivery, with local fallback available.
- [ ] Populate separate project-demo and final-project links — status: unknown — Required by the organizing-team guidance above; no submitted project page is recorded.

## Team information and consent

- [x] Team name in repository — status: done — Interlake Embers is recorded in [README](../README.md) and the submission draft; portal roster is not verified.
- [ ] Confirm participant registrations, Seattle event selection and challenge selection — status: unknown — No authenticated Space Apps registration or team-page evidence inspected.
- [ ] Confirm complete roster, member names, roles and team-size eligibility — status: unknown — The [2026 timeline](https://www.spaceappschallenge.org/2026/) states no more than six participants; actual membership and any other applicable eligibility conditions need portal confirmation.
- [ ] Confirm parent/guardian registration and accompaniment for any participant under 18 — status: unknown — [Participant terms](https://www.spaceappschallenge.org/legal/) specify these conditions; applicability and completion are not recorded here.
- [ ] Confirm required Seattle/event consent forms and any guardian signatures — status: unknown — Exact forms, delivery channel and completion cannot be verified from the repo or inaccessible local page; check with the lead. Keep signed forms and personal information out of the public repo.
- [ ] Confirm written permission from every identifiable person featured in submitted media — status: unknown — Participant terms require likeness consent and evidence on request; no permission records were inspected.
- [ ] Confirm rights and attribution for all submitted code, images, music and video — status: unknown — Terms address third-party rights; no complete rights/credits audit is recorded.
- [ ] Accept current submission requirements and participant terms in the portal — status: unknown — No evidence of the team's acceptance or final checkbox state is available.

## Deadlines and final submission

- [x] Record published global submission window — status: done — [2026 timeline](https://www.spaceappschallenge.org/2026/): opens Saturday 14 November at 09:00, closes Sunday 15 November at 23:59 local time; Seattle interpretation is Pacific Standard Time (UTC−08:00), subject to local confirmation below.
- [ ] Confirm Seattle pitch slot, slide/video delivery channel and any earlier local cutoff — status: unknown — Lead's judging format is reported, but exact Seattle deadlines and upload instructions are not verified; do not substitute the global cutoff for a local judging deadline.
- [ ] Read the complete current 2026 submission guide and inspect all required portal fields — status: unknown — Guide retrieval failed; confirm character limits, media format, required acknowledgments and any additional requirements before submission.
- [ ] Enter final project text, NASA references, other resources, AI disclosure and links in the team's Project tab — status: unknown — Repository drafts do not establish saved portal content.
- [ ] Submit through the official Space Apps project page before the applicable cutoff — status: unknown — No submission confirmation, timestamp or final project URL is recorded.
- [ ] Verify submitted state and retain the confirmation/project URL privately with the team — status: unknown — Reopen the project page and inspect final fields and public links; a saved draft is not evidence of submission.
