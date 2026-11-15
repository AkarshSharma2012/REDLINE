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
