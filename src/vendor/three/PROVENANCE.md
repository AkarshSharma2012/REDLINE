# Three.js r187 (0.187.0), local ES module build

- Upstream: https://github.com/mrdoob/three.js tag `r187` (released 2026-10-30), npm `three@0.187.0`
  (gitHead `7e89746a687bb88271253698fa108b1dd59825d0`).
- Tarball: https://registry.npmjs.org/three/-/three-0.187.0.tgz, integrity
  `sha512-Qiu7R+Cmh8CstZsY1uJOSWnVlfo7ZtNLV7mF8Jltk3LB3AtDu9cRZlcnRKkAk8Y4z6KKw35z7Y7Urd7jWY8etA==`.
- License: MIT. `LICENSE` is the unchanged `package/LICENSE` (SHA-256 `8b378ebe60e2fe500158cb0ac71cb5e8b7d92953c2abcc63a0eb90499653b5bc`).
  The `@license` header is kept at the top of both build files.

## Why minified, and exactly how

r187 publishes no `.min.js` builds. The unminified `build/three.core.js` (1,474,799 bytes,
SHA-256 `613e370f76638fdef83926642bf256dc9615684922de1ce1f63a8583e5d78578`) and `build/three.module.js`
(658,900 bytes, SHA-256 `104f56145899722094556490d787aae0617cc2fc3382f31df02d724ea1aee341`) total
2,133,699 bytes, more than the whole-site 2,000,000-byte budget (`scripts/size-budget.mjs`).
Both files were minified without bundling or tree-shaking; no source line was edited:

```sh
npx esbuild@0.25.12 package/build/three.core.js   --minify --format=esm --legal-comments=inline --outfile=three.core.min.js
npx esbuild@0.25.12 package/build/three.module.js --minify --format=esm --legal-comments=inline --outfile=three.module.min.js
sed -i 's#from"\./three\.core\.js"#from"./three.core.min.js"#g' three.module.min.js   # 2 import specifiers
```

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `three.core.min.js` | 395,915 | `04750c60541ce68acf84ea72bdaea4b2dc7696b0501d36faeaa9d1d0cc63ba78` |
| `three.module.min.js` | 376,437 | `9d3faf332390190af0092aefeb6ad944cd4de3382cc0221b15d4f08ef1d353aa` |

No addons (OrbitControls etc.) are vendored. `src/ui/rover-viewer.js` imports
`../vendor/three/three.module.min.js` module-relatively, only inside `mountRoverViewer`, so the
library loads on the Pages `/REDLINE/` subpath and never before the viewer is requested.
