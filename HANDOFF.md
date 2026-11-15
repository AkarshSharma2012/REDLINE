# Issue #234
- Activated both V2 U1 regressions (confirmed failing before fix) and added synthetic missing-O2, measured-limit and citation coverage checks.
- Fallback now requires oxygen coverage from no-spread observations or measured LOC-FS limits, with comparable pressure. BURNED/NEAR precedence is unchanged; only covering rows support NE-no-burn citations.
- Focused node --test: 3 ordinary tests passed; 5 related existing TODO checks also passed.
- Next: full node --test once, inspect diff, finalize and push.
