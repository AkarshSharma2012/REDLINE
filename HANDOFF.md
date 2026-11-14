# HANDOFF — #105 V: Verify OTHER evidence rows against the source

## Done
- `research/verify-other.md` is written. The only "other" source key in `data/evidence.csv` is M25, which has 2 rows: M25-FS-G and M25-FS-M.
- Both rows are CANNOT-CHECK. The cited NASA Task Book PDF (https://taskbook.nasaprs.com/tbp/tbpdf.cfm?id=16225) returns HTTP 409 to every automated request: plain, with a browser User-Agent, with cookies, and with a Referer. The Wayback Machine has no copy. No values were guessed.
- Reviewer note: `run_id` in both rows is an em dash, not blank.
- No data/, src/ or other files changed. The task has no code, so there is nothing to `node --test`. To check: `git diff main --stat` lists only `research/verify-other.md` and `HANDOFF.md`.

## Next (human)
- Open the PDF in a browser and check p. 3, Task Progress, and p. 2 against the fields listed in `research/verify-other.md`. Then update review_status if appropriate.

STATUS: DONE
