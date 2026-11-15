# Issue #287 verification

Tested integrated SHA: f6158b50d0d994b3528f9956bdd8c5eb24f5177a

Inputs: main bed640032c895dfa9c8abefb815d5658efd5b37a; PR285 f44d08bf02fa6452bcb92ff525ab327e08bb02af; PR286 531b949e1ec03bb41004d066966ed41bd4827251.

## Validation

Full node --test ran once, exit 0:

```text
tests 1247
suites 0
pass 1203
fail 0
cancelled 0
skipped 0
todo 44
duration_ms 14453.7118
```

Existing repository size budget (2,000,000 bytes), named import resolution and viewer module graph checks passed in this suite. No tests changed beyond the exact accepted inputs. git diff --check passed.

Live evidence: 45 total, 45 draft, 0 verified. data, research, src/rules and src/schema have zero diff against main. Both archived input handoffs are byte-identical to their input blobs. No server or browser started.

## Source file differences against PR285

```text
M	src/ui/investigations.js
A	tests/investigation-gravity-wording.test.mjs
```

Both listed files match PR286 exactly; every other source, test, design and configuration file matches PR285 exactly.

## Source file differences against PR286

```text
A	.gitattributes
M	DESIGN.md
M	index.html
M	src/main.js
A	src/styles/rover-viewer.css
A	src/styles/workspace.css
A	src/ui/rover-model.js
A	src/ui/rover-scene.js
A	src/ui/rover-viewer.js
A	src/ui/workspace-evidence.js
A	src/ui/workspace-motion.js
A	src/ui/workspace.js
A	src/vendor/gsap/PROVENANCE.md
A	src/vendor/gsap/gsap.min.js
A	src/vendor/three/LICENSE
A	src/vendor/three/PROVENANCE.md
A	src/vendor/three/three.core.min.js
A	src/vendor/three/three.module.min.js
A	tests/fixtures/workspace-dom.mjs
A	tests/rover-model.test.mjs
A	tests/rover-scene.test.mjs
A	tests/rover-viewer.test.mjs
A	tests/workspace-evidence.test.mjs
A	tests/workspace-integration.test.mjs
A	tests/workspace-shell.test.mjs
```

These files match PR285 exactly. Integration adds only root handoff bookkeeping and archived handoffs; no invented source resolution.

## Remaining TODOs

The suite retains 44 TODO tests (including three expected TODO assertion failures for incomplete O2, pressure and result endpoint/outcome fields). Unique TODO test names below; parameterized cases account for repeated names. No test or scientific gate was weakened.


- every row has finite O2 percent between 0 and 100 inclusive
- every row has finite pressure above zero
- every row has a known result endpoint and any outcome is known
- o2PartialKpa(21, 100) preserves calculation precision
- o2PartialKpa(34, 56.5) preserves calculation precision
- o2PartialKpa(26.5, 70.3) preserves calculation precision
- o2PartialKpa(0, 101.3) preserves calculation precision
- o2PartialKpa(100, 101.3) preserves calculation precision
- o2PartialKpa(34, 0) preserves calculation precision
- o2PartialKpa(17.123456789, 56.54321) preserves calculation precision
- o2PartialKpa accepts kPa converted from 8.2 psia without early rounding
- o2PartialKpa accepts kPa converted from 10.2 psia without early rounding
- o2PartialKpa accepts kPa converted from 14.7 psia without early rounding
- o2PartialKpa treats null oxygen as unknown
- o2PartialKpa treats null pressure as unknown
- gravityClass treats null gravity as unknown
- o2PartialKpa treats absent oxygen as unknown
- o2PartialKpa treats absent pressure as unknown
- gravityClass treats absent gravity as unknown
- o2PartialKpa treats empty oxygen as unknown
- o2PartialKpa treats empty pressure as unknown
- gravityClass treats empty gravity as unknown
- o2PartialKpa treats whitespace oxygen as unknown
- o2PartialKpa treats whitespace pressure as unknown
- gravityClass treats whitespace gravity as unknown
- o2PartialKpa treats NaN oxygen as unknown
- o2PartialKpa treats NaN pressure as unknown
- gravityClass treats NaN gravity as unknown
- o2PartialKpa treats infinity oxygen as unknown
- o2PartialKpa treats infinity pressure as unknown
- gravityClass treats infinity gravity as unknown
- o2PartialKpa treats negative infinity oxygen as unknown
- o2PartialKpa treats negative infinity pressure as unknown
- gravityClass treats negative infinity gravity as unknown
- o2PartialKpa returns null with both inputs absent
- gravityClass(0) is 0g
- gravityClass(0.01) is 0g
- gravityClass(0.010001) is partial
- gravityClass(0.16) is partial
- gravityClass(0.5) is partial
- gravityClass(0.899999) is partial
- gravityClass(0.9) is 1g
- gravityClass(1) is 1g
- gravityClass(1.1) is 1g

Coordinator still owns final real browser acceptance at 1440/390/320, zoom, keyboard, WebGL/fallback and release. No merge, deployment or superseded PR closure performed.
