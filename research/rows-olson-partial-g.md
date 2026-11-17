# Partial-gravity flammability limits (Olson / Ferkul): draft evidence rows

Issue #118. Research only, reviewed 2026-11-14. Rows: [rows-olson-partial-g.csv](rows-olson-partial-g.csv)
(24 rows, every one `review_status = draft`, same column order as `data/evidence.csv`).
Page numbers are one-based PDF pages. For OF12 they match the printed page numbers.

These are tests at **simulated** reduced gravity: a centrifuge in a drop tower, or a spinning
sounding rocket. None of them was measured on the Moon or Mars. In the app, lunar values must still be shown as an estimate
between the 0 g and 1 g results (`AGENTS.md`).

## Sources

| Key | Source | Status |
|---|---|---|
| OF12 (existing key) | S. L. Olson and P. V. Ferkul, *Evaluating Material Flammability in Microgravity and Martian Gravity Compared to the NASA Standard Normal Gravity Test*, ICES 2012. [NTRS record](https://ntrs.nasa.gov/citations/20130010991), [PDF](https://ntrs.nasa.gov/api/citations/20130010991/downloads/20130010991.pdf) | Read in full. Table I (p. 6) checked on a rendered page image. |
| LUCI25 (**new**) | P. V. Ferkul, M. C. Johnston, N. Kralik, Y.-T. Liao, *Lunar Combustion Investigation: Flammability Results from a Rotating Sounding Rocket*, ASGSR 2025 presentation. [NTRS record](https://ntrs.nasa.gov/citations/20250010653), [PDF](https://ntrs.nasa.gov/api/citations/20250010653/downloads/ASGSR%202025-LUCI-Ferkul-Presentation-v2-20250010653.pdf) | Read in full (44 slides). PDF pp. 22 and 33 checked on rendered images. |

OF12 is already in `data/metadata.json`, so its rows reuse the key `OF12` rather than adding
a second key for the same paper. Only LUCI25 needs a new entry.

### Proposed `data/metadata.json` entry (not edited)

```json
"LUCI25": {
  "title": "Lunar Combustion Investigation: Flammability Results from a Rotating Sounding Rocket (presentation)",
  "authors": "Paul V. Ferkul; Michael C. Johnston; Nathan Kralik; Ya-Ting Liao",
  "year": 2025,
  "url": "https://ntrs.nasa.gov/api/citations/20250010653/downloads/ASGSR%202025-LUCI-Ferkul-Presentation-v2-20250010653.pdf"
}
```

Title and authors come from the title slide (PDF p. 1). The year comes from the meeting, ASGSR 2025 Annual Meeting, Phoenix, 3–6 Dec 2025
(PDF p. 1 and the NTRS record).

## What was extracted

### OF12 limits: 18 rows (`OFPG-*`)

These are upward (concurrent) flame-spread oxygen limits from Table I (p. 6) at 1 g, Martian g, lunar g and 0 g:

| Material (pressure) | 1g ULOI / MOC | Martian ULOI* / MOC* | Lunar ULOI* / MOC* | 0g* ULOI* / MOC* |
|---|---|---|---|---|
| Mylar G, 0.127 mm (10.2 psia = 70.3 kPa) | 21.2 / 20.0 | 18.0 / 17.0 | 15.6 / 14.1 | 17.0 / 16.0 |
| Ultem 1000, 0.254 mm (10.2 psia) | 23.5 / 23.0 | 22.0 / 21.1 | 21.0 / 19.9 | 24.0 / 23.0 |
| Nomex HT90-40 (14.7 psia), **Martian only** | (already in data) | 19.9 / 19.0 | (already in data) | (already in data) |

How the values were checked: Table I was read on the rendered page, because the text layer
scrambles the Nomex column. Every value was then re-checked with the paper's Eq. (1). The recomputed
ΔO2 values match the printed ones: Mylar −3.1 / −5.75 / −4.1 and Ultem −1.7 / −2.8 / +0.25 (Martian / lunar / 0 g), and Nomex
Martian −3.35.

Sourced conditions:
- Martian g is 0.38 g (p. 1). The centrifuge ran at 30.8 RPM (p. 3).
- The exposed sample was 5 × 15 cm (p. 3), with hot-wire ignition (58 W) giving concurrent spread (pp. 3–4).
- Drop time was 5.18 s (Fig. 4 caption, p. 4).
- The 0 g rows had a forced concurrent flow of 30 cm/s (p. 4).
- The 1 g rows come from a modified NASA-STD-6001 Test 1 at WSTF with a hot-wire igniter (p. 4). The ULOI/MOC definitions are on p. 2, and MOC*/ULOI* on pp. 4 and 6.
- Thickness: Mylar 5 mil (p. 3), Ultem 10 mil (p. 2) and Nomex 12 mil (p. 3), converted to mm.

Caveats, all stated in the source:
- The low-g extinction criteria differ from the 1 g criteria because of the short drop time (p. 6).
- The authors call the Martian limits "conservative" because the Nomex and Ultem flames were weak and shrinking when the drop ended (p. 4).
- Endpoints are stored as `MOC` / `ULOI`, matching the existing OF12 rows. The asterisk (reduced-g definition) is kept in `source_locator` and `pass_criterion`.

Wording for the app:
- "Mylar G burned in testing at 15.6% O2 and 10.2 psia in simulated lunar gravity (drop-tower centrifuge), below its 1 g limit of 20.0–21.2% [OF12, Table I p. 6]."
- Do not say it "will burn on the Moon".

### LUCI25 spread rates: 6 rows (`LUCI25-*`)

LUCI burned samples on a spinning Blue Origin New Shepard (11 RPM, effective radius 1.22 m, air at normal pressure, PDF p. 12). The samples were a SIBAL fabric 5 cm wide × 30 cm long and a 4 mm diameter PMMA rod (p. 4). SIBAL burned downward and PMMA burned upward in lunar g (p. 16).

| Row | Value (mm/s) | Locator |
|---|---|---|
| SIBAL flame base, lunar g | 0.92 | p. 19 (p. 33 rounds to .9) |
| SIBAL flame tip, lunar g | 1.1 | pp. 19, 33 |
| SIBAL flame base, 1 g | 1.5 | p. 33 |
| SIBAL flame tip, 1 g | 2.8 | p. 33 |
| PMMA flame tip, lunar g | 1.5 | p. 21 (p. 36: .15 cm/s) |
| PMMA flame tip, 1 g | 3.95 | p. 29 (p. 36: .40 cm/s) |

These are `spread-rate` rows, **not limits**. The tip values for PMMA describe flame growth, and the PMMA base spread was not steady (p. 20).

## Skipped, and why

- **LUCI PMMA chamber O2 of 14.3% (p. 22).** The chamber O2 fell from 20% to 14.3% while the PMMA flame was still being tracked in lunar g, then rose to 15.8% after the g-level dropped at 125 s. The slides do not call this an extinction limit. The O2 is a chamber average, and the g-level changed during the burn, so I did not make a limit row from it. It is recorded in the notes only.
- **LUCI 1 g SIBAL flame-width extinction "~45 s sooner" (p. 34).** This is a timing comparison, not a value with a defined endpoint.
- **LUCI facility, g and pressure.** The facility value `sounding-rocket` is outside the evidence-spec enum, and the reviewer needs to map it. The numeric g-level is not printed: 11 RPM at 1.22 m works out to about 0.165 g, but that is my own calculation (an inference), so `gravity_g` is blank. Pressure is "normal pressure" with no number, so `pressure_kpa` is blank.
- **LUCI 1 g burns.** The facility and sample orientation for the 1 g burns are not stated, so `facility` and `flow_direction` are blank.
- **OF12 Fig. 7.** This is Mylar LOC versus g-level, including sub-lunar and "Pluto" g points (pp. 7–8). It is a plot only, and the authors say the curve shapes are not known. Not digitised.
- **OF12 lunar g-level.** The paper does not give a number for lunar g, so `gravity_g` is blank (**unverified**). The lunar and 0 g values are "earlier data from ref. 8" (p. 5).
- **Ref. 8: Ferkul and Olson, "Zero-Gravity Centrifuge Used for the Evaluation of Material Flammability in Lunar Gravity", J. Thermophys. Heat Transfer 25(3), 2011.** This is the primary source for the lunar and 0 g values, but it was not found on NTRS and was not retrieved. Its test durations and sample sizes are **unverified**.
- **Olson et al., "Flammability Limits from BASS-II Testing in Microgravity Compared to Normal Gravity Limits", ICES 2019** ([TTU record](https://ttu-ir.tdl.org/items/1922ad9f-ef4c-4f52-96a4-980c23debe5e)). Not reviewed: earlier agents got HTTP 403 from this repository (`research/evidence-spec.md` §6).
- **Ferkul et al., LPSC 2026 (NTRS 20260001966).** Already used as F26 in `research/lunar-2025.md`. Not repeated here.
- **FM2 / Zayac 2024 poster (NTRS 20240015307)** and **"Fire on the Moon" charts (NTRS 20210020516).** These are overviews. Not opened for row extraction.

## Method

1. Both PDFs were downloaded from NTRS into a temporary folder and converted with `pdftotext -layout`.
2. Key pages were rendered with `pdftoppm` and read by eye: OF12 p. 6, and LUCI pp. 22 and 33.
3. The rows were generated by a script that copies the header from `data/evidence.csv`.
4. A check confirmed that the header matches exactly and that every row has the same number of fields.
