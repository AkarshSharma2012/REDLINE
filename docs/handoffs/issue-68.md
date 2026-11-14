# HANDOFF — #68 B12: SI layer (AI interpretations + Ask REDLINE)

STATUS: DONE

## Done
- `data/insights.json`: 4 AI-written insights (3-5 sentences, lunar fire-safety focus), one per
  evidence group in `data/evidence.json` (BASS-II/PSI-25, US25, OF12, M25). Each stores
  `cited_ids`, `generated_by_ai: true`, `checked_by_team: false`, `checked_by: null`.
- `src/rules/retrieve.js` (pure): `retrieve(question, { evidence, investigations, insights }, { limit })`,
  `queryTerms`, `tokenize`, `buildPrompt`, `SYSTEM_PROMPT`, `groundingHits`, `citationsIn`,
  `isNotFound`, `NOT_FOUND`. Keyword + field-weight scoring, small synonym list, material aliases,
  derived gravity words; shows matched words so the ranking is explainable.
- `src/ui/ask.js`: `renderAsk(root, data)` and `mountAsk(root, evidence)` (loads optional
  `data/investigations.json` + `data/insights.json`; a 404 is an empty state). No key: retrieved
  rows table (id, kind, what the source says, matched words, NASA source link + locator) and
  related insights tagged "AI-generated, not yet checked by team". Key: held in a closure
  variable only (no storage/cookies), sends question + retrieved catalog/evidence rows only
  (insights excluded) to the Messages API (`claude-sonnet-5-5`, browser-access header); answer
  HTML-escaped, `[ID]` citations linked to sources, unknown or missing citations get a caveat.
- `docs/ai-use.md`: every AI use, inputs, checks, key handling, limits.
- Tests: `tests/insights.test.mjs` (cited ids exist in evidence ids / source keys / preset ids /
  catalog; bracket ids == cited_ids; 3-5 sentences; banned wording; catalog coverage as a `todo`
  until #66 lands), `tests/retrieve.test.mjs` (ranking, aliases, determinism, prompt contents,
  insight exclusion, mocked API call, escaping/citation caveats).
- Fixture: `tests/fixtures/investigations.sample.json` (B10-shaped stand-in; per-field `{value, source}`).

## How tested
- `node --test`: 44 tests, 43 pass, 0 fail, 1 todo (catalog coverage; waits for #66).
- Browser: served the repo with `python -m http.server`, a temporary page (deleted, not committed)
  called `mountAsk` on a `<section>`; Playwright (Python) typed questions, checked 8 retrieved rows
  + 2 insights without a key, then with a fake key and the Anthropic endpoint mocked: request had
  only catalog/evidence row ids, `x-api-key` set, answer citation linked, made-up `[MADE-UP]`
  flagged; localStorage/sessionStorage/cookies empty; "Forget key" cleared the field. Only console
  error: expected 404 for the not-yet-merged `data/investigations.json`.
- Live call against the real API not run (no key used by this agent).

## Next (outside this task's files)
- **B9 / main.js + index.html:** add `<section id="ask">` (heading "Ask REDLINE") and in `start()`:
  `import { mountAsk } from './ui/ask.js'; mountAsk(document.getElementById('ask'), evidence);`
- **styles.css:** add a `.visually-hidden` class; `ask.js` uses an inline SR-only style meanwhile.
- **When #66 merges `data/investigations.json`:** the todo test lists investigations without an
  insight. Generate them with the instruction in `docs/ai-use.md` §1 (subject.kind
  `investigation`, subject.id = catalog id), cite only catalog/evidence ids, rerun `node --test`.
  If B10's schema differs from the fixture (id / name / psi_url keys), adjust
  `investigationId` / `sourceFor` in `retrieve.js`.
- **Team check:** a human reads each insight against its cited rows and sets
  `checked_by_team: true`, `checked_by: "<name or PR>"`.

## Key decisions
- Insights never feed the live model (they are AI text, not sources).
- Ask REDLINE shows draft status on every draft row; no new data values are created.
- Model id `claude-sonnet-5-5` for live mode (user pays with their own key); constant `MODEL` in `ask.js`.
