# React workspace controls (#305)

Production local ESM, built by `npm ci` then `npm run build-ui`. The committed
`../react-controls.js` works without npm or network on static Pages and in the
existing portable package. Source: `scripts/ui/react-controls.js`; no science,
source browser or viewer code is bundled. Named icon imports are tree shaken.

Pinned runtime dependencies: React 19.3.1 and React DOM 19.3.1 (MIT),
React Aria Components 1.22.1 (Apache-2.0), Lucide React 1.73.0 (ISC).
Build: esbuild 0.28.2 (MIT). Node DOM regression fixture: jsdom 31.0.1 (MIT).
Exact transitive versions/integrity are in package-lock.json. Runtime dependency
license texts are reproduced in LICENSES.txt; upstream license banners are kept
in the bundle. No historical provenance or captures were rewritten.

References:
- https://react.dev/reference/react-dom/client/createRoot
- https://react.dev/learn/add-react-to-an-existing-project
- https://react-spectrum.adobe.com/react-aria/Button.html
- https://lucide.dev/guide/react/

The island mounts synchronously before main startup. Existing IDs, labels and
native click listeners remain in use. Mutable disabled/ARIA attributes are
initialized via a stable ref rather than controlled React snapshot props, so
Aria interaction renders do not overwrite workspace changes. Wrapper spans use
display:contents; B2 owns final neutral CSS and native browser acceptance.

Separate 400,000-byte raw budget covers this bundle and its notices only; all
other resources retain the original 2,000,000-byte ceiling. Build logs report
raw and gzip bundle sizes. Node DOM tests do not establish native rendering,
screen reader behavior or final integration with concurrent shell/viewer PRs.
