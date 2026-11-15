# Issue #230
- Fixed production aliases and separate provenance resolution; keeps all NASA references, locators, notes and nulls. Sample shape/size combined without invented values. UI renders supplied references and retains missing-source notices.
- Filters/rankings use production need/ranges/habitat relevance and explicit flight microgravity. Planned conditions and model-only records do not receive tested-condition points; absent planetary relevance remains unknown.
- Regression uses actual data/investigations.json (all 26 entries), missing/unresolved provenance, aliases, multi-source sample fields, filters and rover rankings. Legacy fixtures remain supported.
- Verification: initial regressions failed as expected; focused tests 14/14 pass. Full node --test once: exit 0, 1136 tests, 1051 pass, 0 fail, 85 existing TODO. git diff --check passed. No browser, server or background process started; browser behavior unexercised as required.
STATUS: DONE
