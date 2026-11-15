# Quintiere partial-gravity evidence: extraction result (issue #119)

Research only; reviewed 2026-11-14. **Outcome: no rows extracted.** [rows-quintiere.csv](rows-quintiere.csv)
holds only the exact header line of `data/evidence.csv`. In the sources reviewed, fewer than 3
experimental flammability points from Quintiere and co-workers could be cited to a page with a
value written in the text, so the issue's fallback applies.

## 1. What was searched

- NASA NTRS API (`/api/citations/search`), queries: `Quintiere gravity`, `Quintiere flame spread`,
  `Quintiere ignition`, `Quintiere partial gravity`, `Quintiere microgravity`, `Quintiere reduced gravity`,
  `Quintiere Steinhaus`, `Quintiere`, `Lateral Ignition Flame Spread Experiment`,
  `flammability diagrams solid fuels`. Results were filtered to records with Quintiere as an author.
- Web search for Quintiere plus partial gravity, PMMA, centrifuge, variable gravity and LIFT/FIST.

Quintiere records found in NTRS:

| NTRS ID | Title (authors, year) | Experimental gravity data? | Used? |
|---|---|---|---|
| [19990053973](https://ntrs.nasa.gov/citations/19990053973) | Flow Effects on the Flammability Diagrams of Solid Fuels: Microgravity Influence on Ignition Delay (Cordova, Walther, Fernandez-Pello, Steinhaus, Torero, Quintiere, Ross, 1999) | Yes: PMMA piloted-ignition delay on the KC-135 aircraft. Values are in a figure only | Candidate. See §2 |
| [19970020612](https://ntrs.nasa.gov/citations/19970020612) | Flow Effects on the Flammability Diagrams of Solid Fuels (Cordova, Ceamanos, Fernandez-Pello, Long, Torero, Quintiere, 1997) | Normal-gravity FIST development, according to the 1999 paper's introduction (ref. [6]) | Not reviewed. The NTRS record has no PDF, and the proceedings scan ([19970020547](https://ntrs.nasa.gov/citations/19970020547), 110 MB) has no text layer. **unverified** |
| [20160010073](https://ntrs.nasa.gov/citations/20160010073), [20170009141](https://ntrs.nasa.gov/citations/20170009141) | Burning Rate Emulator (BRE) for study in microgravity (Markan, Sunderland, Quintiere, de Ris, Stocker) | Gas-burner emulator, not a solid-material flammability test | Out of scope (no material flammability endpoint) |
| NTRS 27482090396921 / 17720132749449 | Burning in microgravity: experimental results and analysis; Theoretical analysis... burning emulator (Dehghani, Quintiere et al.) | BRE gas burner. The second paper is theory | Out of scope. No PDF on NTRS |
| [20210022402](https://ntrs.nasa.gov/api/citations/20210022402/downloads/217-_GollnerMichaelJ.pdf) | Topical: Solid Fuel Combustion in Partial and Micro-Gravity (Gollner, ..., Quintiere, ..., 2021 Decadal white paper) | No new data. It says partial-gravity testing to date was "limited" and done mostly in parabolic-flight aircraft (p. 3) | Context only. Its partial-gravity data references are Sacksteder/T'ien, Feier et al. and Kleinhenz et al., not Quintiere |

No Quintiere-authored paper with **partial-gravity** (lunar or Mars level) flame-spread or ignition test
points was found in the sources reviewed. The NTRS partial-gravity flame-spread experiments
(for example [19990054085](https://ntrs.nasa.gov/citations/19990054085) and
[20010074003](https://ntrs.nasa.gov/citations/20010074003)) are by Sacksteder, Ferkul, Feier, Shih and
T'ien, and Quintiere is not an author. **Inference:** the issue's "Quintiere partial gravity" may refer to
the FIST/LIFT microgravity work below, or to a paper that is not in NTRS. A human with journal access
should check before anyone cites a Quintiere partial-gravity result.

## 2. The one candidate source and why it gives no rows

Cordova et al. (1999), Fifth International Microgravity Combustion Workshop, NASA/CP-1999-208917,
proceedings PDF [19990053965](https://ntrs.nasa.gov/api/citations/19990053965/downloads/19990053965.pdf),
printed pp. 34–37 (PDF pp. 49–52). Facts stated in the text:

- KC-135 parabolic flight with up to about 25 s of low gravity (printed p. 34).
- Spacecraft Fire Safety Facility chamber, 36 L, held at 1 atm. Oxidizer is bottled zero air. Forced flow
  was 0.02–0.25 m/s during tests (printed p. 36).
- Samples were 12 mm thick, 40 mm square PMMA, two per card, with a Nichrome wire pilot igniter (printed p. 36).
- The microgravity tests were limited to high radiant fluxes, 35–55 kW/m², because some samples were
  heated during pull-up (printed p. 36).
- Result, qualitative only: at flows below about 0.5 m/s, microgravity ignition delays were "significantly below the
  minimums measured in normal-gravity buoyant flows" (printed p. 37, Fig. 2). The data are
  "preliminary" and "subject to g-jitter" (printed p. 37).

Why no rows:
- The ignition-delay values exist only as points in **Fig. 2** (printed p. 36). The text layer
  has no numbers for them, and reading values off a scanned plot would be estimation. Per-run flow,
  flux and delay are therefore **unverified**.
- The Fig. 2 legend in the text layer lists "Microgravity, 35 kW/m2" and "Microgravity, 25 kW/m2". The body text
  gives a 35–55 kW/m² range. This conflict could not be resolved from the scan, which is one more reason not
  to extract values.
- The statement that ignition "is no longer possible for oxygen concentrations below 17%" (printed
  p. 36) is a **normal-gravity** result quoted from the paper's ref. [8], not from this study. No flow
  or flux is attached to it, so it is not a usable row for this issue.
- Gravity is microgravity (aircraft), not partial gravity. No lunar or Mars-level points were found.

If a human later digitizes Fig. 2 with care, the rows would be: material `PMMA` (`pmma`), form `slab`,
thickness 12 mm, width 40 mm, `flow_direction` blank (flow geometry relative to the sample is not stated in
the text: **unverified**), `pressure_kpa` 101.3 (1 atm), O2 about 20.9% (zero air; inference, not stated as
a percentage), `facility` aircraft, `endpoint` ignition, `value_unit` s (ignition delay), and
`external_heat_flux_kw_m2` per the legend. They would carry a short-duration / g-jitter caveat. The engine
does not have `s` as a listed `value_unit`, so the spec would need a change (note for the science lead).

## 3. Proposed `data/metadata.json` entry (not edited)

No rows use this key yet. It is proposed so the source can be cited later.

```json
"QUINT-FIST99": {
  "title": "Flow Effects on the Flammability Diagrams of Solid Fuels: Microgravity Influence on Ignition Delay (Fifth International Microgravity Combustion Workshop, NASA/CP-1999-208917, pp. 34-37)",
  "authors": "J. L. Cordova; D. C. Walther; A. C. Fernandez-Pello; T. Steinhaus; J. L. Torero; J. G. Quintiere; H. D. Ross",
  "year": 1999,
  "url": "https://ntrs.nasa.gov/citations/19990053973"
}
```

The NTRS record lists the author as "Quintere, J. G." (a typo). The paper header on printed p. 34 reads
"J. G. Quintiere". The report number NASA/CP-1999-208917 is printed in the proceedings PDF (front matter).

## 4. Still missing

- Any Quintiere-authored partial-gravity (0.16 g or 0.38 g) test data: not found in the sources reviewed.
- Full text of the 1997 FIST paper (NASA CP-10194, pp. 405–410): the scan has no text layer.
- Tabulated KC-135 FIST ignition delays (thesis by J. L. Cordova, UC Berkeley, per the 1999 paper's ref. [7]): not retrieved.
