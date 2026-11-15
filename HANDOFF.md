# Issue #116 — SIBAL research handoff

Completed extraction of four explicit wide-fabric quenching runs into research/rows-sibal.csv. research/rows-sibal.md records source URLs, page locators, exclusions, missing values and proposed source metadata. All rows remain draft. No data/, src/, dependencies or stack changes.

Decisions: final flow is the quench endpoint, not an oxygen limit; one row per run; no inferred heat flux, exact duration or residual acceleration. SIBAL fabric tests are attributed to BASS-II. Source/material registry integration and independent science verification belong to downstream owners. Check run identity against existing BASS-II evidence before merging into data.

Validation pending: node --test; CSV header, column count and transcription checks. No server or browser process started, per conductor hard rule.
