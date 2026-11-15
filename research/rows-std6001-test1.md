# NASA-STD-6001 Test 1 thresholds: issue #120

## Extracted

`research/rows-std6001-test1.csv` has 26 draft rows. They all come from one public NTRS paper,
Hirsch, Williams, Harper, Beeson and Pedley (2007), [NTRS 20070018178](https://ntrs.nasa.gov/citations/20070018178)
([PDF](https://ntrs.nasa.gov/api/citations/20070018178/downloads/20070018178.pdf)). Source key: `HWHBP07`.

- **Test:** NASA-STD-6001 Test 1 (upward burning in a quiescent chamber), run at WSTF in a 1400-L chamber (PDF p. 2, sec. 2).
- **Atmosphere:** 70.1 kPa total pressure for every row (PDF p. 3; Table 2 title, PDF p. 4). Oxygen was lowered in 1% steps (PDF p. 3). The paper gives 70.1 kPa / 30% O2 as the Shuttle and ISS-airlock EVA-prebreathe atmosphere. It also gives the planned baselines of 30% O2 for Orion and 34% O2 for the lunar lander (PDF p. 1).
- **Endpoint:** the MOC is the oxygen level at which at least three samples passed the burn-length criterion of less than 15.2 cm (PDF p. 3). It is stored as `MOC-T1`. Values marked `*` passed on 5 samples (Table 2, Note 7).
- **20 `MOC-T1` rows**, split into three groups:
  - 13 numeric MOCs: Lexan F-6000, Kydex 100, Ultem 1668/2300/2310/CRS5301, SYGEF, P1700, Nomex double layer at 15°, glass-filled PEEK, melamine laminate G-9-818, Zotek F30 and Solimide AC-530.
  - 4 rows reported as "> 40": Torlon 4203, Ryton R-4-06, Armalon TG4060 and copper clad laminate 307404. Each is stored as a lower bound, `value = 40` with a qualifier. The text says these burned less than 15.2 cm in 40% O2 (PDF p. 3, sec. 3).
  - 3 rows reported as "> 99.5": Fiberite graphite/epoxy, bismaleimide/graphite and FL 74-24. These are also stored as lower bounds. `o2_pct` is left blank because the text does not describe the oxygen level of those tests.
- **6 `burn/no-burn` rows** (`outcome = spread`, `o2_pct = 30`): Lexan 6006, three Nomex HT90-40 configurations (single layer in the J configuration, single layer at 15°, double layer in the J configuration), CTD-528 and CTD-112P.
  - Table 2 lists them as "< 30". The text says these materials "burned at least 15.2 cm in 30 % oxygen" (PDF p. 3, sec. 3), so each row is a direct Test 1 fail point: **burned in testing at these conditions**. No lower threshold was measured, because testing stopped once a sample failed in 30% O2 (PDF p. 3).
- **ULOI:** stored in `notes`, not as a separate row. The ULOI is the oxygen level at which a sample passes about half the time (PDF p. 2). It is neither `LOI-D2863` nor `MOC-T1`.
- **Dimensions:** taken from Table 1 (PDF p. 2), in mm. Nomex note: the J configuration had a longer leg of about 20 cm, and the 15° samples were about 30 cm long.

All rows are `review_status = draft`. `run_id` is `—` because the paper gives no run IDs. Uncertainty is not stated: the only indication is the 1% step size.
`material_id` is filled only where an id already exists (`polycarbonate`, `nomex`).

**How I verified it:** I extracted the text with pdftotext. I also checked every Table 2 value
(material, ULOI, MOC, `*`, observations) against a rendered image of PDF p. 4, because the text
layer puts some material names one line off from their values. A script confirmed that the CSV
header is byte-identical to `data/evidence.csv` and that all rows have the same field count.

## Science caveats for the app

- `MOC-T1` is a 1 g pass/fail screening result. It is not a flame-spread limit (`LOC-FS`). Rule E in `research/evidence-spec.md` says it must never be compared with ISS, drop-tower or lunar rows.
- 70.1 kPa is not 56.5 kPa. To compare these rows with the 56.5 kPa / 34% preset, rule P needs a FLAG. The paper itself recommends testing at other pressures (PDF p. 3).
- Suggested wording: "Nomex HT90-40 burned in testing at 30% O2, 70.1 kPa, 1 g upward test [HWHBP07 p. 3–4]". For a threshold row, the wording should be "close to a measured Test 1 threshold". Never say "safe" or "passes on the Moon".

## Skipped and why

- **MAPTIS:** excluded by the issue.
- **NTRS 20090012334**, *Pressure Effects on the Self-Extinguishment Limits of Aerospace Materials* (Orion: 30% O2 at 10.2, 14.7 and 17.3 psia): the PDF download returned "Not found", so I read only the abstract. **No rows** were taken from it. Its values are unverified.
- **NTRS 20100028155 and 20100015582** (*Pressure Flammability Thresholds ... of Selected Aerospace Materials*): found but not reviewed, to keep this task bounded. A human could extract them next.
- **NTRS 20070005041** (Hirsch, Williams, Beeson 2006, pressure effects): its PTFE rows already exist as `HWB06` in `research/rows-ptfe-silicone.csv`, so I did not duplicate them.
- **Tests at 34% O2 / 56.5 kPa:** not found in the sources reviewed.
- **PDF metadata:** the embedded PDF title says "Pressure Effects on Oxygen Concentration and Oxygen Partial Pressure..." but the printed title and the NTRS record give the title below. I used the printed title.

## Proposed `data/metadata.json` entry (not merged)

```json
{
  "HWHBP07": {
    "title": "Oxygen Concentration Flammability Thresholds of Selected Aerospace Materials Considered for the Constellation Program",
    "authors": ["David B. Hirsch", "James H. Williams", "Susana A. Harper", "Harold Beeson", "Michael D. Pedley"],
    "year": 2007,
    "url": "https://ntrs.nasa.gov/api/citations/20070018178/downloads/20070018178.pdf"
  }
}
```

The authors and title come from the printed title page (PDF p. 1). NTRS spells the third author
"Harper, Susan A."; the paper prints "Susana A. Harper". The year 2007 is the NTRS publication
date, and the paper was presented at the 2nd IAASS Conference in Chicago, 14–16 May 2007 (NTRS record).

Material ids still need registering before promotion: polyetherimide, PVDF, polyamideimide,
polysulfone, PPS, PEEK, graphite/epoxy, bismaleimide, polyimide laminate, polyimide foam,
fluorocarbon/fiberglass fabric, melamine laminate and PVC/PMMA alloy. Do not alias them to existing ids.

The NASA [PSI Data Repository](https://www.nasa.gov/physical-sciences-informatics-psi/) is the
project's primary dataset. These rows come from a public NTRS report, not from PSI files.
