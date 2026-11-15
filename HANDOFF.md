# Issue #116 — SIBAL research handoff

Completed extraction of four explicit wide-fabric quenching runs into research/rows-sibal.csv. research/rows-sibal.md records source URLs, page locators, exclusions, missing values and proposed source metadata. All rows remain draft. No data/, src/, dependencies or stack changes.

Decisions: final flow is the quench endpoint, not an oxygen limit; one row per run; no inferred heat flux, exact duration or residual acceleration. SIBAL fabric tests are attributed to BASS-II. Source/material registry integration and independent science verification belong to downstream owners. Check run identity against existing BASS-II evidence before merging into data.

Validation: node --test completed with 826 tests, 739 pass, 0 fail, 87 existing TODO. A Node stdin check using the project CSV parser verified the exact header, four parsed rows, all run IDs / terminal flows / oxygen values, draft status and blank unknown heat flux. Source locators were checked against the NASA appendix text. No server or browser process started, per conductor hard rule.

STATUS: DONE
