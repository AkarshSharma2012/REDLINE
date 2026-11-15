# Issue #267

- Revision B1 for PR #270 is done: header has two counts (Evidence | Verified), a single Research preview line and collapsed Scope and limits. Bound wording and crimson primary are removed. Details are in docs/handoffs/issue-267.md. Notes for #265 are unchanged in docs/handoffs/issue-265.md.
- Full `node --test`: 1175 tests, 1131 pass, 0 fail, 44 todo, exit 0. No server or browser was started.
- Next: the coordinator browser-checks at 1440, 390 and 320 px (Scope disclosures, real 45/0 counts), then refreshes the recording package.

STATUS: DONE

## Issue #271

- Wrapped the unchanged Airflow/Marcum articles in one closed native `details[data-source-context]`, summary `Source context and methods`; scoped summary minimum height 40px with existing keyboard focus styling.
- Envelope-unavailable warning and selected evidence panel remain outside. Draft research disclosure/selectors, scientific text, NASA links, data and event handlers unchanged. No index/main/global CSS edits.
- Added `tests/gravity-source-context.test.mjs`: exact pre-change rendered-article SHA-256, closed disclosure, warning/evidence placement, separate draft disclosure and summary styling.
- Verified: full `node --test` exit 0; focused gravity tests 17 pass / 0 fail; `node --check` for changed JS/test and `git diff --check` pass.
- No server, browser, persistent process or dependency added. Coordinator owns native keyboard open/close and final screenshots after both UI PRs merge.
- Next: coordinator review/merge task-branch PR.

STATUS: DONE

## Issue #273

- Cherry-picked only `49551a6` (seven `docs/screenshots/ui267-*.png`); historic unprefixed PNGs unchanged.
- `docs/pitch.md`: provenance `6455a3c`, current screenshot manifest (2026-11-15 ~08:49 PST, Chrome 1600x1000 CSS, 100%, localhost:5199, Evidence 45 / Verified 0), coordinator 1440/390/320 check, launch preflight for Scope and limits and Source context and methods; `HOLD_scientific_review` retained; Opus #255 "not yet approved" line removed; fallback uses ui267 shots. Historical manifest kept and labelled.
- `docs/pitch-variants.md`: shot-list provenance now points to ui267-02 and the local recording packages (`Downloads/REDLINE-recording-6455a3c`, fallback `52f6e73`); no video completion claimed.
- Full `node --test`: 1176 tests, 1132 pass, 0 fail, 44 todo, exit 0. No server or browser started.

STATUS: DONE

## Issue #170

- `docs/submission-draft.md` now opens with the product: upload/paste a bill-of-materials CSV, set the cabin, get lines ordered Burned → Close → Not established, each evidence-backed label linked to its NASA source.
- Delivery limits now match `main` (5094334): `label.js` uses verified rows only, and `data/evidence.json` has 45 rows, all `draft`, so **0 verified**. On `main` every line reads "Not found in the sources reviewed". The doc says this plainly and claims no verified evidence. There is also no `research/validation-results.csv`, so no accuracy figure.
- Objectives table updated: compare/label are implemented, Ask/accuracy/gravity are mounted, there are 30 insights (not 4), and the BOM sort is listed under Rank. The AI-use paragraph now says 45 draft rows (it said 29) and no longer calls the engine a stub. The NASA resource table is unchanged.
- Verified: grep finds no banned wording (safe, never tested, never burns, will burn); full `node --test` gives 1176 tests, 1132 pass, 0 fail, 44 todo, exit 0. Doc-only change. No server or browser was started.

STATUS: DONE
