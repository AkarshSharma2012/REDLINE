# Issue #107 — Saffire-II evidence extraction

Implemented `research/rows-saffire2.csv` and `research/rows-saffire2.md`: four draft silicone no-spread test points, NASA PDF page citations, proposed source metadata, source search and exclusions. Production data and application files untouched.

Key decisions: preserve initial flight oxygen as qualified context; do not invent per-test pressure, heat flux or duration. No-spread is distinct from no-ignition. `0` gravity represents microgravity class. Fabric flow assignment conflict excluded. Source/material registration belongs to the data owner.

Next: validate CSV and run repository checks; commit and push current issue branch.
