# Issue #287 verification

Tested integrated SHA: f6158b50d0d994b3528f9956bdd8c5eb24f5177a

Inputs: main bed640032c895dfa9c8abefb815d5658efd5b37a; PR285 f44d08bf02fa6452bcb92ff525ab327e08bb02af; PR286 531b949e1ec03bb41004d066966ed41bd4827251.

## Validation

Full node --test ran once, exit 0:

```text

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



Coordinator still owns final real browser acceptance at 1440/390/320, zoom, keyboard, WebGL/fallback and release. No merge, deployment or superseded PR closure performed.
