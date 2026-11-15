# HANDOFF: issue #83 J1 Judge Q&A prep sheet

- Done: `docs/judge-qa.md` has 20 questions with answers, each citing a repo file or NASA source. It is grounded in `main` at b9e64d0: 45 evidence rows / 0 verified, 26 investigations, 30 insights / 0 team-checked.
- It covers deterministic rules (`label.js`/`compare.js`), draft vs verified, provenance (`source_key` + `source_locator`), gates for unknown conditions (FLAG, never zero), rule tests on fixtures, the 0 g/1 g lunar estimate, the A1/A2/B1/B2 agent PR workflow, and limitations. No evidence status was changed.
- Test: `node --test` ran on b9e64d0 + this doc: 1149 tests, 1066 pass, 0 fail, 83 todo, exit 0. No server was started.
- Note: Q18 says the UI pass has not shipped yet. Update it after the Opus UI merges.

STATUS: DONE
