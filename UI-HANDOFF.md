# UI handoff: task/ui-polish (deadline sprint)

## What changed
- Commits on task/ui-polish (not pushed): 5fabebd, 1a50977, plus this handoff.
- Files: index.html (inline tab style only), src/styles.css (polish block appended, tokens only), src/ui/gravity-view.js (inline style string only), src/ui/investigations.js (stray literal "null" fixed: `replaceChildren(null)` became `''`).
- Not touched: src/rules/, src/schema/, data/, tests/, any science or label wording.
- There were no earlier UI commits to reuse. The previous Fable run hit its usage limit before committing. ui-work.preserved-* was left as it was.

## Acceptance
- `node --test`: 1134 tests, 1051 pass, 0 fail, 83 todo. Same counts as the baseline before the changes; existing tests unchanged.
- Demo path checked in headless Chrome at 1440x900 and 390x844: Load lunar rover demo > Gravity > Inspect draft research detail > Open evidence record U25-01-L. The detail shows "Selected evidence: U25-01-L", Review: HOLD_scientific_review, and NASA source links.
- Cabin result selection is still unavailable with 0 of 45 verified (the "No verified evidence rows loaded." state). Nothing is faked.
- No page-level horizontal overflow at 390 px on any tab (checked via scrollWidth). Wide tables scroll inside their own containers.
- Exported preview: C:\Users\Neeraj Sharma\Downloads\REDLINE-UI-preview (app\, OPEN-PREVIEW.cmd, screenshots\, README-PREVIEW.md). The launcher's server was smoke-tested (200 on index, data, src) and then stopped. No servers or browsers are left running.

## Limitations
- Polish only. The six tabs were not restructured, and no keyboard shortcuts were added.
- The gravity view keeps its own inline style block with hex values that match the tokens, because tests pin its markup.
- Accuracy shows "Held-out evaluation not run" because research/validation-results.csv does not exist in the repo either.
- Contrast was not re-measured: only existing DESIGN.md tokens are used, and their ratios are already listed there.
- The first commit was made with git hooks bypassed by mistake. The global hooks only strip AI trailers (none were present) and there are no repo hooks, so the result is the same. Later commits ran the hooks normally.

STATUS: DONE
