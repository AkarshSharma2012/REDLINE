# Issue #167

- Added static navigation regression checks; all 7 fail against the original UI as expected.
- Next: lead with Cabin Check, add persistent preview notices, run `node --test` once, push.
- Scope: index.html, src/styles.css, tests/nav-static.test.mjs; minimal main.js tab-order/default change only. No module computations change.
- No server or browser will be started, per the issue's hard rule.
