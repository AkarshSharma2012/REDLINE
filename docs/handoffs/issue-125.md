# Issue #125 handoff

Created research/material-aliases.csv and research/material-aliases.md. Covers every production evidence material_id, requested material families, proposed catalog IDs, and unresolved brand/family terms. NASA source URLs and locators accompany identity claims; no combustion values introduced. Exact alias matching is a proposal only; preserve grades/forms and clarify ambiguous inputs. No data/ or src/ changes.

Required README, AGENTS, DESIGN and S1/S3/S4/V2 specs read from current checkout. No prior handoff existed. Additional IDs require the catalog owner's integration; this is documented in the owned Markdown file. HANDOFF.md is updated under the task's explicit root-handoff instruction.

Next: validate CSV shape, unique normalized aliases, production ID coverage, source locators and run node --test. No server or browser started.

Verification completed:
- Inline Node assertions using the repository CSV parser passed: requested columns, 44 unique normalized aliases, all production evidence IDs covered, NASA URLs/page or slide locators on resolved entries, and blank identity fields on unresolved entries.
- node --test exited 0. Existing TODO-marked normalization tests report unfinished helper behavior; no application code was changed by this research task.
- NASA PDF text opened directly for the cited identity tables/descriptions. Corrected the acrylic locator to PDF p. 5 during review. The large BASS summary PDF was inaccessible; no new alias was derived from it.
- No server, browser or persistent helper process started.

Next: none for this research deliverable. Catalog registration and resolver implementation belong to their respective owners; proposed IDs must not be used as registered production IDs.

STATUS: DONE

Revalidation on 2026-11-14 (Node v26.13.1): alias assertions passed again (44 unique normalized aliases; all current production material IDs covered). Spot-checked NASA identity tables for PMMA/Plexiglas, Kapton and silicone/polysiloxane. Full `node --test` now exits 1: 782 pass, 1 fail, 87 TODO. The failure is `checked-in report matches current evidence`; its diff shows CRLF in the checked-in missing-field audit versus LF in generated text. This supersedes the earlier full-suite result above. No out-of-scope report/test files were changed; its owner should review newline normalization. Research deliverable remains complete. No persistent process started.

STATUS: DONE
