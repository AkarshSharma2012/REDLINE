# Issue #257
- Diagnosis: Ask citations/caption use absolute screen-reader text; the table scrollport is not their containing block, allowing their static positions to escape its overflow clipping on narrow screens.
- Next: anchor absolute descendants to the Ask table scrollport; preserve native table scrolling and full citations. Add static regression coverage, then full node --test. Browser proof belongs to coordinator; no server/browser started.
