# Issue #63 handoff

## Done
- Read README.md, AGENTS.md, DESIGN.md and all five required spec/review documents from the current checkout; none needed remote fallback.
- Inspected the actual six-tab app and lunar rover loader at source commit 31a6acdd778e766d6a896201f376473155c51bc6.
- Captured seven real 1600 x 1000 PNGs with installed headless Edge via its DevTools protocol, using Node built-ins; no dependencies added.
- Observed 29 evidence rows, zero verified; label.js remains a stub. Cabin results therefore show no verified evidence; Gravity detail remains HOLD_scientific_review. Accuracy says held-out evaluation not run. Ask retrieval works without a key.

## Verification so far
- node --test: 96 passed, zero failed.
- Python and py are unavailable on PATH; used a temporary Node static HTTP server on 127.0.0.1:8063 instead. Opened the real index page and exercised all tabs, rover load, oxygen preview and question submission in headless Edge.
- Temporary server/capture scripts and browser profile are outside the repository.

## Next
- Replace pre-kickoff pitch with the observed demo path, 30-second storyboard and screenshot manifest; verify and commit.

## Changes needed outside issue ownership
- Engine/data owners: label.js remains a stub; data/evidence.json has zero verified rows. Do not promise changing combustion labels or a selectable cabin evidence row in this revision.
- Dashboard owner: Investigations renders a literal null line above ranking text. Captures preserve it; no UI changes made here.
- Science lead: reconcile AGENTS bounded-lunar wording with V2 D1. This pitch uses the current UI's unavailable envelope and makes no universal physical bound claim.
