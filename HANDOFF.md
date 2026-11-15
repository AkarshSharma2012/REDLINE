# Issue #260

- Replaced only four corrupted presentation punctuation literals in `src/ui/ask.js` with ASCII delimiters.
- Added targeted summary, source locator, HTML escaping, input preservation, and pending status regression tests in `tests/ask-punctuation.test.mjs`.
- Verified: full `node --test` once, exit 0; 1,070 passed, 0 failed, 83 TODO (including data-integrity TODO diagnostics). All three new regression tests passed.
- Coordinator owns browser proof; no server or browser started. No scientific wording, research data, rules, URLs, citations, or values changed.
- Next: coordinator review/merge of task branch PR.

STATUS: DONE
