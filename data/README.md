# Evidence ingestion

evidence.csv is the human-edited row source; metadata.json contains dictionaries. Run node scripts/build-evidence.mjs. evidence.json is generated.

Use Node >=22.12, no dependencies. `node --test` checks schema, CSV conversion, scientific holds and build failure behavior. Blank numeric cells become null; whitespace, non-decimal literals, duplicate headers and malformed quoting fail. The builder validates before atomically replacing the generated JSON. `built_from` records the source path and checkout commit at build time; `built_at` records the build timestamp.

The validator follows S4 section 9 / V2 C3 (verified pressure may be unknown) and V2 C1 (MOC, ULOI, extinction-5s). The V1 requirement to preserve unknown heating overrides S1's non-null flux default. Optional provenance fields are strings or null. All source URLs must use NASA domains or the NASA Task Book host.

The three atmosphere presets contain separate 2020 S5 microgravity comparisons and estimated planetary protocols. The 2022 baseline summaries and 2024 chamber protocol remain separate entries, with assumptions and citations. No continuous prebreathe curve is generated. Earlier 2019 comparisons and alternate-atmosphere studies are not preset protocols here; retain the full research/atmosphere.md context when expanding these records.

29 rows, all draft pending independent quantitative verification. V1 verifies only BASS-II transcriptions. Initial/final oxygen and fan settings remain provenance, not limit values. Unknown flux is null (V1). V2 C1 endpoint mappings preserve original endpoint codes, including starred low-gravity criteria and smolder/flame distinctions. Lunar gravity is an editorial regime mapping, not exact measured acceleration. ETFE and PTFE remain separate.

Excluded research-only estimates and explicitly excluded coverage gaps: U25-01-E0, U25-01-E35, U25-01-CF, U25-02-E0, U25-02-E35, U25-02-CF, U25-03-E0, U25-03-E35, U25-03-CF, U25-04-E0, U25-04-E35, U25-04-CF, U25-05-E0, U25-05-E35, U25-05-CF, U25-06-E0, U25-06-E35, U25-06-CF, M25-FR-G, M25-FR-M, M16-INTERCEPT, M16-BASS2-STABLE.

Frozen inputs:
19-r2-bass-ii-psi-25-data-access-and-draft @ 38bb5579947c272f2e4e3863bd3e6ffb16af810a
20-r3-nasa-2025-lunar-gravity-flammability @ 0d0cb9aeba1c93640cedaab916b7a7acc816a9c5
21-r4-pmma-endpoint-studies-and-the-marcum @ 305221f2f0c5f5112df68741cd255ae768dce170
