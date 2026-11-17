// #277 progressive-enhancement motion. GSAP 3.15.1 core is vendored locally
// (src/vendor/gsap, see PROVENANCE.md) and loaded on demand; without it, or with
// reduced motion, every element is already in its final visible state.
// Only short opacity/transform tweens; no scroll hijacking, no intros, no camera moves.

export const GSAP_VERSION = '3.15.1';
const DURATION = { enter: 0.2, select: 0.16 };
const CLEAR = 'opacity,transform';

export function prefersReducedMotion(win) {
  try { return Boolean(win?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches); } catch { return false; }
}

// The vendored UMD build registers window.gsap when evaluated as a module script.
async function importGsap() {
  await import('../vendor/gsap/gsap.min.js');
  return globalThis.gsap ?? null;
}

const usable = g => Boolean(g && typeof g.fromTo === 'function' && typeof g.killTweensOf === 'function' && typeof g.set === 'function');

export function createMotion({ window: win = globalThis.window ?? null, importer = importGsap } = {}) {
  let gsap = null;
  let loading = null;
  let query = null;
  const active = new Set();

  function settle(el) {
    if (!gsap) return;
    try { gsap.killTweensOf(el); gsap.set(el, { clearProps: CLEAR }); } catch { /* element already gone */ }
    active.delete(el);
  }
  function settleAll() { for (const el of [...active]) settle(el); }

  // Live reduced-motion changes stop anything in flight and leave elements visible.
  const onPreference = () => { if (prefersReducedMotion(win)) settleAll(); };
  try {
    query = win?.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
    query?.addEventListener?.('change', onPreference);
  } catch { query = null; }

  function preload() {
    loading ??= Promise.resolve().then(importer).then(g => (gsap = usable(g) ? g : null)).catch(() => (gsap = null));
    return loading;
  }

  function tween(el, from, duration) {
    if (!el || !gsap || prefersReducedMotion(win)) return false;
    try {
      active.add(el);
      gsap.fromTo(el, from, {
        opacity: 1, y: 0, duration, ease: 'power2.out', overwrite: true, clearProps: CLEAR,
        onComplete: () => active.delete(el), onInterrupt: () => settle(el),
      });
      return true;
    } catch { settle(el); return false; }
  }

  return {
    preload,
    get loaded() { return Boolean(gsap); },
    enter: el => tween(el, { opacity: 0, y: 6 }, DURATION.enter),
    select: el => tween(el, { opacity: 0.6, y: 2 }, DURATION.select),
    destroy() { settleAll(); query?.removeEventListener?.('change', onPreference); },
  };
}
