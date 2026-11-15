# Issue #128
- Added tests/validate-rules.test.mjs: 524 passing rule-by-rule cases using fresh synthetic fixtures. No src/ changes or dependencies.
- Covers required/nullable/optional fields, types, all enum values, numeric boundaries, review statuses, references, provenance, conditional rules, source metadata/URLs, materials, presets, and prebreathe entries.
- Verified: node --test (628 pass, 0 fail, 87 existing TODO; exit 0). TODO assertion diagnostics are emitted by the existing suite.
- Verified separately: node --test --test-reporter=tap tests/validate-rules.test.mjs (524 pass, 0 fail, 0 TODO).
- No server or browser started. Nothing remains for this issue.
STATUS: DONE
