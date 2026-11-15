# Issue #142 — Data package export

- Added dependency-free exporter and isolated temporary-directory tests.
- Run `node scripts/export-datapackage.mjs` from any working directory; writes portable descriptor and byte-identical evidence copies under `data/exports/`.
- Sources map metadata keys/URLs to Frictionless names/paths, retaining bibliographic details. Licenses pass through when supplied; current metadata has no licenses, so none are invented.
- Next: generate exports, run full `node --test` once, record results.
- No servers or persistent processes started.
