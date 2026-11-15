# Issue #150 — Engine examples

- Added 12 deterministic calls to the real imported engine using the existing S1 holdout fixture; no replacement engine or invented evidence.
- Markdown includes queries, returned labels, cited rows, source links, and candidate comparison diagnostics. Stub output is prominently marked provisional.
- Dependency #55 is absent: labelMaterial always returns NE-no-data; compareRow returns no rules; lunarEstimate is a stub. Cannot verify meaningful worked classifications until it lands. Regenerate with `node scripts/engine-examples.mjs --write` afterward.
- Verification: full `node --test` run: 868 tests, 779 pass, 2 fail, 87 TODO. One failure was this task's duplicate query (fixture pressure was already null); fixed by using an explicitly hypothetical pressure query. Targeted `node --test tests/engine-examples.test.mjs` then passed 3/3, including CLI/document parity. Remaining unrelated failure: missing-fields report CRLF/LF mismatch. No server/browser started per conductor rule.

STATUS: BLOCKED: #55 real evidence engine is not implemented on this branch.
