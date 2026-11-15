# GSAP core (vendored)

- Package: `gsap@3.15.1` from the npm registry
  (https://registry.npmjs.org/gsap/-/gsap-3.15.1.tgz,
  integrity `sha512-63yjWRFWj3QRP1UOuD8kcidCcy3nxb1mMRpwHr/xJRvPfm9GtWOXFAYUiL0ro1fgPq2nY53LR+98pAgy9BumBg==`).
- File: `package/dist/gsap.min.js` copied unchanged to `gsap.min.js` (core + CSSPlugin, UMD;
  evaluated as a module script it sets `window.gsap`). No plugins, no ScrollTrigger.
- SHA-256: `3d1bea374ab1b703cc5c4105358eec63c4465efdc573931dc116e34a0a190c1b` (73357 bytes).
- Licence: GreenSock "Standard 'no charge' license", https://gsap.com/standard-license
  (package.json `license` field). The original copyright header is kept in the file.
- Fetched 2026-11-15 for issue #277. Loaded on demand by `src/ui/workspace-motion.js`;
  the page works without it.
