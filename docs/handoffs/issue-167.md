# Issue #167

- Cabin Check leads navigation and is the visible initial/fallback view. All modules retained; preview labels/notices cover Investigations, Gravity, Accuracy, Ask and O2 tradeoff. Notices live outside module roots so rerenders retain them; incomplete scores/citations are explained. No visible TODO/placeholder in index.html.
- Minimal W1 overlap: main.js changes only TABS order (therefore default and keyboard order) and two comments. No computations changed. Preserve this order when integrating #164; #165/#166 own import/ranking behavior.
- Verification: new static tests first failed 7/7, then passed 7/7 in the one full `node --test` run. Suite: 894 tests, 804 passed, 3 failed, 87 TODO. `git diff --check` passed. No server/browser started per hard rule; visual/runtime module review not performed.
- Integration follow-up outside owned files: tests/main.test.mjs:12,20 still demand Investigations as default/visible; update them to Cabin Check. tests/missing-fields.test.mjs:64 reports checked-in/generated report mismatch (output shows CRLF versus LF). Neither file changed here. Full suite is not green.

STATUS: DONE
