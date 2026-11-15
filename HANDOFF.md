# Issue #142 — Data package export

- Added dependency-free exporter and isolated temporary-directory tests.
- Run `node scripts/export-datapackage.mjs` from any working directory; writes portable descriptor and byte-identical evidence copies under `data/exports/`.
- Sources map metadata keys/URLs to Frictionless names/paths, retaining bibliographic details. Licenses pass through when supplied; current metadata has no licenses, so none are invented.
- Generated all three export artifacts. Full `node --test` completed with exit code 0; existing normalization TODO assertions remain. Export tests cover exact bytes, deterministic output, sources/licenses, custom paths, invalid JSON and missing inputs.
- No servers or persistent processes started.

STATUS: DONE

