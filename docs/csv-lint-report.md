# CSV lint report

Input: data/evidence.csv

Data rows: 45. Errors: 1.

Run `node scripts/lint-csv.mjs [input.csv] [report.md]` from any directory. Defaults use repository paths. Exit status is 1 for lint or I/O errors, 0 for a clean file. Data is never modified. Row numbers below count parsed data records, excluding the header; quoted multiline cells count as one record.

Checks: trailing cell whitespace; common mojibake/replacement characters; finite unit-free numeric cells and schema value units; differing value units within an endpoint; inconsistent case for the same material ID; blank primary or populated secondary source locators; duplicate evidence IDs. Mixed endpoint units require review, not automatic conversion. Blank optional secondary provenance is allowed. Free-text source quotations are not unit-normalized. This is a hygiene check, not scientific or source verification.

| Data row | Column | Code | Finding |
| --- | --- | --- | --- |
| 10 | fan_display_source | trailing-space | Cell ends in whitespace. |
