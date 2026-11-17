# Issue #60 — independent QA

- Wrote research/qa-report.md against source 9df0e66; dependencies #164–#169 are closed.
- Full `node --test` once: 1,132 total, 1,045 pass, 0 fail, 87 TODO, exit 0 (Node v24.17.0). Four failed TODO assertions expose U1/U2 science defects despite successful exit.
- Separate temporary Node probes reproduced dropped catalog citations, invalid-JSON startup rejection and README wording. Actual rover query: four NE-no-data results; dataset 45 rows / zero verified.
- Filed BUG issues #230–#235 for catalog, startup, README, stale demo script, oxygen coverage and pressure coverage. No app fixes; only owned report and required handoff changed.
- No server/browser/persistent process started. Real demo clicks, browser keyboard/layout and live NASA links remain unverified under the hard rule. Full demo readiness is not certified; follow-up belongs to bug owners and a permitted browser QA session.
- Verification artifacts: full-suite log and temporary reproduction test in OS temp; durable observations/reproduction details in report and issues. No further in-scope edits required.

STATUS: DONE
