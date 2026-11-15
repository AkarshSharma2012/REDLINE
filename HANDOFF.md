# Issue #257
- Added position: relative only to #ask-root .table-scroll. Absolute screen-reader citation/caption text now has a containing block inside the horizontal scrollport instead of escaping local overflow clipping.
- Full citations and native horizontal table scrolling preserved; science, rules and data unchanged.
- Added static containment regression and populated eight-row/full-citation checks using existing node:test patterns. These are source/HTML assertions, not browser geometry proof.
- Verified: node --test: 1069 pass, 0 fail, 83 TODO (1152 total). Coordinator owns real 390px/1440px browser proof. No server or browser started.
STATUS: DONE
