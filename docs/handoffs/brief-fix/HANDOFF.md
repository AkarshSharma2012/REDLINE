# Brief fix (#327, review of PR #324) — operational marker, exclude from integration

Done in src/rules/research-brief.js + tests/research-brief.test.mjs only:
- missing_fields label: "Missing or unknown fields (request or source side)", entries verbatim.
- Per-candidate baseline changes: lines matched by line_id, candidates by evidence_id;
  `lines[ID].candidates[EID]` added/removed (summary objects) and `.review_status/.grade/.review_ready/.conflicts/.missing_fields`
  changed, same before/after/MISSING semantics. Order: current candidates in triage order, then removed in baseline order.
  Duplicate evidence_id within a line is rejected.
- Gravity 0.16 -> 1 fixture adding a gravity_g conflict on a draft row, plus controls (unchanged row, same evidence_id on another line, no-baseline, no-change).
- Root HANDOFF.md dropped from PR.
Tested: node --test tests/research-brief.test.mjs (13/13); npm test (1252 pass, 0 fail, 44 todo); npm run build-ui OK.

STATUS: DONE
