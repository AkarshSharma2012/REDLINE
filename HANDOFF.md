# Issue #58 — suggested experiments and evidence-supported changes

Implemented the owned modules and tests. Experiment cards group identical requested protocols, rank by distinct dependent cabin materials, preserve unknown conditions and label hypotheses as REDLINE inference. Lunar cards cite FM2's 2026 concept without scheduling or compatibility claims. Non-lunar facility assignment remains unestablished.

Changes require verified NASA-linked rows and exact known specimen/conditions. Swaps require a cited covering no-spread row or supported LOC-FS margin. Oxygen previews use the lowest comparable spread point on the 0.5-point UI grid; they describe record applicability, not a safety cap.

Integration needed outside owned files: main.js must pass renderFixes(root, results, { cabinQuery, evidence }). Existing two-argument calls remain valid but cannot produce evidence-supported changes. Engine modules are currently stubs; these modules do not rely on their permissive results. Conditions in cards are requested scenario inputs, not measured values. Pure API: suggestExperiments(results, context), suggestFixes(results, context).

Validation: node --test: 31/31 pass (including 3 new tests). Initial new test failed because suggestFixes was not exported before implementation. Browser verification pending.
