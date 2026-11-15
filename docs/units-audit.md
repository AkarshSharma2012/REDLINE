# Units and range audit

Run `node scripts/units-audit.mjs` to inspect `data/evidence.json`, or pass an
explicit JSON path. Output is JSON with findings, error count and warning count.
Exit codes: **0** no findings; **1** any error or review warning; **2** unreadable,
malformed or unsupported input. Imports have no CLI side effects.

`auditUnits(data)` checks all S1 `evidence` rows, including drafts, and optional
`cabin_presets`. Each finding identifies collection, zero-based index, record ID,
field, original value, severity, code, message, source URL and source locator.
Source links are copied from the row or its `source_key` registry entry; missing
provenance is null. This tool does not validate citations or certify a record.
The primary dataset is the [NASA PSI Data Repository](https://psi.nasa.gov/).

| Field / unit | Error | Review warning |
|---|---|---|
| `o2_pct` / percent | Outside inclusive 0–100 | None |
| `pressure_kpa` / kPa | Nonpositive | Inclusive 5–20: resembles cabin psia |
| `gravity_g` / g | Outside inclusive 0–1.1 | None |
| `thickness_mm` / mm | Nonpositive | Positive but below 0.001 or above 100 |
| `flow_speed_cm_s` / cm/s | Negative | Positive but below 0.01 or above 1000 |

Present values must be finite numbers; numeric strings are errors. Null and
absent fields are unknown and skipped, leaving required-field checks to the
schema validator. Zero flow is allowed. An empty evidence array is allowed.

Units and basic sign/O2 rules follow [S1 architecture §4.2](specs/architecture.md).
The gravity upper bound is the issue #139 audit requirement. **Magnitude windows
are project review heuristics, not NASA experimental bounds**, physical limits,
or engine comparability thresholds. Values exactly at thickness/flow window
edges pass. Pressure warnings include both edges.

For example, 14.7 stored in `pressure_kpa` deserves source review because it may
have been copied from psia. A real 14.7 kPa experiment produces the same warning.
Thickness stored in metres may be unusually small in a millimetre field; a flow
unit transcription may produce an unusually small or large cm/s value. These
checks cannot identify every conversion error: 0.12 m/s copied as 0.12 cm/s can
remain plausible. O2 fractions such as 0.21 also remain within the valid percent
range. Review the linked source and locator before changing any value. No
conversion, source retrieval, data mutation or scientific label is performed.

Verification: `node --test` includes synthetic S1-shaped cases for ranges,
threshold edges, types, unknowns, provenance, presets, immutability and CLI exits.
