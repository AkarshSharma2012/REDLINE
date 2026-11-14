# Evidence ingestion

evidence.csv is the human-edited row source; metadata.json contains dictionaries. Run node scripts/build-evidence.mjs. evidence.json is generated.

29 rows, all draft pending independent quantitative verification. V1 verifies only BASS-II transcriptions. Initial/final oxygen and fan settings remain provenance, not limit values. Unknown flux is null (V1). V2 C1 endpoint mappings preserve original endpoint codes, including starred low-gravity criteria and smolder/flame distinctions. Lunar gravity is an editorial regime mapping, not exact measured acceleration. ETFE and PTFE remain separate.

Excluded research-only estimates and explicitly excluded coverage gaps: U25-01-E0, U25-01-E35, U25-01-CF, U25-02-E0, U25-02-E35, U25-02-CF, U25-03-E0, U25-03-E35, U25-03-CF, U25-04-E0, U25-04-E35, U25-04-CF, U25-05-E0, U25-05-E35, U25-05-CF, U25-06-E0, U25-06-E35, U25-06-CF, M25-FR-G, M25-FR-M, M16-INTERCEPT, M16-BASS2-STABLE.

Frozen inputs:
19-r2-bass-ii-psi-25-data-access-and-draft @ 38bb5579947c272f2e4e3863bd3e6ffb16af810a
20-r3-nasa-2025-lunar-gravity-flammability @ 0d0cb9aeba1c93640cedaab916b7a7acc816a9c5
21-r4-pmma-endpoint-studies-and-the-marcum @ 305221f2f0c5f5112df68741cd255ae768dce170
