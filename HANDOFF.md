# Issue #85 — static accessibility tests

STATUS: BLOCKED: Required browser opening could not be verified because the browser access host is unavailable. Implementation and Node tests are complete.

## Done

- Added only `tests/a11y-static.test.mjs` plus this required root handoff. No `src/`, HTML, dependencies or stack changes.
- Read README.md, AGENTS.md, DESIGN.md, docs/specs/architecture.md (S1), screens.md (S3), evidence-engine.md (S4), and review.md (V2); all were available locally.
- Node-built-in source checks cover document language, exactly one page h1 (and no additional UI h1), heading jumps, image alt attributes, input/select/textarea and slider labels, button names, and visible text on label chips.
- Checks scan index.html and every src/ui/*.js file, including nested templates and ordinary quoted HTML strings. Failures identify file, line, column, rule and opening tag.
- Three inline regression fixtures verify rejection, valid alternatives, exact diagnostic location, nested templates and quotes inside regex literals. No evidence fixtures are needed: these checks do not invoke the engine.

## Verification and failures

- `node --test`: **109 passed, 0 failed**, including all **13** tests in the new file (3 checker tests plus index.html and 9 UI modules).
- No accessibility failures were reported within the static scanner's coverage. An initial false positive at gravity-view.js:193:51 was caused by the scanner reading quotes in a regex literal as strings. Fixed the scanner and added a regression fixture; source was unchanged.
- `git diff --check`: passed before staging (new files checked again with the staged diff).
- Started `python -m http.server 8085 --bind 127.0.0.1` with sandbox escalation after sandboxed Python launchers failed. A Node fetch of http://127.0.0.1:8085/ returned HTTP 200 and verified the REDLINE title and main module reference.
- Browser opening was attempted twice. The first attempt timed out; the second returned **The browser access host is unavailable**. No rendered-page, accessibility-tree or screenshot verification is claimed.

## Scope and limits

- This is a string/regex source lint, not an HTML/JavaScript parser or WCAG certification. JavaScript regex detection is heuristic. UI files that build DOM nodes rather than HTML literals are inventoried but those DOM calls are outside these checks.
- Each literal's first heading inherits caller context. Heading order is checked within each literal and throughout index.html, not by assuming helper declaration order is render order. Concatenated fragments and insertion-point hierarchy require rendered review.
- Dynamic expressions are text candidates, not proof of nonempty runtime strings. aria-labelledby targets and explicit labels resolve within the same source file; actual mounted relationships require rendered review.
- Empty alt is accepted for decorative images. Chips require visible letters/numbers, so glyph-only or aria-label-only chips fail. This does not evaluate CSS-generated content, contrast, keyboard behavior, all conditional states, or dynamic DOM construction.

## Next

Open the served page once browser access is restored and record the result here. Then replace the blocked status with `STATUS: DONE`. No source changes are requested by these results.

## Resume verification � 2026-11-14

- Re-ran node --test: 109 passed, 0 failed (13 static accessibility tests).
- Retried browser inventory through cua_repl: no browsers available; returned 'The browser access host is unavailable'. Required rendered-page opening remains blocked.
- Implementation remains unchanged; no src/ edits. Retaining STATUS: BLOCKED until browser verification can be completed.
