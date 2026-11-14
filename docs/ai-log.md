# REDLINE AI-use log

Dated: 2026-11-14. Prepared by a Codex agent for issue #94 from the repository at
`c8f26b0`. This is a development disclosure, not a certification of scientific accuracy
or a complete transcript of every AI interaction.

## How the work was organized

REDLINE used multiple AI coding agents, identified in [ai-use.md](ai-use.md) as
Codex and Claude Code. The [agent instructions](../AGENTS.md) describe a GitHub
Issues queue: the conductor assigns one `ready` issue on a task branch; agents
implement the assigned files, test them, and leave handoff notes; completed work
is integrated through pull requests. Agents drafted specifications, code, tests,
research extractions, verification reports and submission documentation. This log
itself is AI-drafted.

Human review and merge approval are the intended oversight points: humans must
check the changes and scientific claims before accepting them for submission.
The available history records merges by `REDLINE conductor` and `REDLINE integration`;
it does **not** establish that a human personally reviewed or manually merged each
PR. A commit authored under a person's name is also insufficient evidence of
human authorship or review when agents use that account. No blanket claim that
humans verified all code, evidence rows or interpretations is supported here.

## Dated repository evidence

All entries below are dated 2026-11-14 in the inspected git history. Short hashes
identify repository commits; linked handoffs describe the corresponding work.
Handoffs are agent reports, not independent confirmation that every check succeeded.

- `9c0a4fd` and `be423ec` record merges of PRs #34 and #35 for the evidence-table
  specification (#18) and BASS-II data access/draft rows (#19). These demonstrate
  issue-based contributions and integration, not human scientific sign-off.
- `6bb5307`, `affbbde` and `9660efb` record the #68 retrieval, AI-insight, UI and
  disclosure work; `67bd28b` records its integration. The
  [#68 handoff](handoffs/issue-68.md) reports four AI-written insights with
  `checked_by_team: false` and `checked_by: null`, automated tests and mocked
  browser/API checks. It explicitly says no real API call was tested.
- `3920b31` records PR #157 for source verification (#101). Its
  [handoff](handoffs/issue-101.md) reports nine confirmed rows, one mismatch and
  five that could not be checked against that source. It leaves data review status
  unchanged and identifies decisions for a human reviewer. An agent's
  “CONFIRMED” finding is not evidence of human verification.
- `6beea0d` and `2768ca7` record #105 and its merge as PR #163. The
  [handoff](handoffs/issue-105.md) marks both M25 rows CANNOT-CHECK because the
  cited PDF returned HTTP 409; it requests a human source check. No completion
  of that human check is established by these records.
- `96037ed` and `7554381` record the accessibility/design audit and PR #162.
  The [#61 handoff](handoffs/issue-61.md) reports automated browser checks,
  screenshot review and remaining findings. It does not identify an independent
  human accessibility reviewer.
- `8a6aa7e` records changing unfinished draft-data integrity checks to TODO.
  The earlier [#87 handoff](handoffs/issue-87.md) records three completeness
  failures. A later green test run must therefore be read with its TODO count;
  it does not establish that missing measurements were supplied or verified.

## Area / AI role / human check

“Required” below describes the review still needed, not a completed action.

| Area | AI role | Human check |
|---|---|---|
| Issue queue and implementation | Codex/Claude Code agents draft changes on assigned branches; conductor/integration commits record merges. | Review scope, diffs and behavior before approval; individual human approvals are not established by the inspected history. |
| NASA evidence extraction | Agents transcribe source-linked rows and document gaps. | Evidence rows are draft until a human verifies them against the cited NASA source and locator. A source link or passing schema test alone is insufficient. |
| Source verification | Separate agents compare extractions with sources and report mismatches or inaccessible material (#101, #105). | Resolve discrepancies, inspect unavailable sources and record reviewer identity/status; these agent reports do not substitute for human sign-off. |
| Rules, retrieval and tests | Agents draft code and automated checks; ai-use.md distinguishes fixed-rule retrieval from model generation. | Review assumptions, comparability and outputs; passing tests validate only the assertions exercised, with TODOs still unresolved. |
| AI interpretations | #68 generated cited plain-language insights; ai-use.md describes an optional model-written answer using retrieved rows. | Read each interpretation against its cited evidence; record the reviewer before marking it checked. The #68 handoff records unchecked insights. |
| Interface and accessibility | Agents implement screens and report design, browser and accessibility checks (#61). | Human usability/accessibility review remains to be evidenced; an agent's screenshot review is not a human check. |
| Submission disclosure | AI drafts ai-use.md and this dated log from repository records. | Human submission owner must confirm accuracy, review status and any later changes before submission. |

## Product AI and limits

[ai-use.md](ai-use.md) documents pre-generated interpretations and an optional live
Claude answer mode, alongside deterministic retrieval. It describes inputs,
citation checks and key handling. These are documented implementation claims;
this task did not independently audit the runtime, validate model availability or
exercise a live service. Exact model names there are reported metadata, not proof
of a successful model invocation.

AI can misread a source or produce a plausible unsupported interpretation. Citation
checks, automated tests and a merged PR do not establish scientific validity.
Draft evidence must remain identified as draft until human source verification;
unchecked AI prose must remain identified as unchecked. The submission owner
should add dated human review records rather than infer verification from an
agent's `STATUS: DONE` handoff or a merge commit.
