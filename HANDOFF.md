# Issue #260

- Replaced only four corrupted presentation punctuation literals in `src/ui/ask.js` with ASCII delimiters.
- Added targeted summary, source locator, HTML escaping, input preservation, and pending status regression tests in `tests/ask-punctuation.test.mjs`.
- Next: run full `node --test` once, record results, and push task branch. Coordinator owns browser proof; no server or browser started.
