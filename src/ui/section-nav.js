// #337 four-section shell: Model, Evidence, Investigations, Review brief. Each top tab owns one
// tabpanel; secondary views (gravity, O2, accuracy, Ask) open inside their parent section and
// keep their old hash links. Also wires contextual help that opens on hover, focus and tap.
// Layout only: nothing here reads, ranks or changes evidence.

export const SECTIONS = Object.freeze(['model', 'evidence', 'investigations', 'brief']);
export const SUBVIEWS = Object.freeze({ gravity: 'evidence', oxygen: 'evidence', accuracy: 'investigations', ask: 'investigations' });
// Older links and in-app "back" actions used #cabin for the cabin workspace.
const ALIASES = Object.freeze({ cabin: 'model' });

// routeFromHash('#gravity') -> { section: 'evidence', view: 'gravity' }; unknown -> Model.
export function routeFromHash(hash = '') {
  const id = String(hash).replace(/^#/, '');
  const view = Object.hasOwn(ALIASES, id) ? ALIASES[id] : id;
  if (SECTIONS.includes(view)) return { section: view, view };
  if (Object.hasOwn(SUBVIEWS, view)) return { section: SUBVIEWS[view], view };
  return { section: SECTIONS[0], view: SECTIONS[0] };
}

// WAI-ARIA tabs: arrows wrap, Home/End jump. Returns null for keys the tablist ignores.
export function nextSection(current, key) {
  const i = Math.max(0, SECTIONS.indexOf(current));
  const n = SECTIONS.length;
  const to = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[key];
  return to === undefined ? null : SECTIONS[to];
}

// Shows exactly one section and, inside it, either its main view or one sub-view.
export function applyRoute(doc, { section, view }) {
  for (const id of SECTIONS) {
    const on = id === section;
    const tab = doc.getElementById(`tab-${id}`);
    if (tab) { tab.setAttribute('aria-selected', String(on)); tab.tabIndex = on ? 0 : -1; }
    const panel = doc.getElementById(`panel-${id}`);
    if (panel) panel.hidden = !on;
    const main = doc.getElementById(`${id}-main`);
    if (main) main.hidden = view !== id;
  }
  for (const sub of Object.keys(SUBVIEWS)) {
    const panel = doc.getElementById(`panel-${sub}`);
    if (panel) panel.hidden = view !== sub;
  }
  for (const link of doc.querySelectorAll?.('.subnav a[href^="#"]') ?? []) {
    if (routeFromHash(link.getAttribute('href')).view === view) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  doc.getElementById('app-main')?.setAttribute('data-section', section);
}

// Help for nonessential explanation: CSS shows the tip on hover and keyboard focus; a click or
// tap pins it open (aria-expanded), Escape or a tap elsewhere closes it. The tip text is also
// the button's accessible description. Critical warnings never live in these tips.
export function wireHelp(doc) {
  const buttons = [...(doc.querySelectorAll?.('.help > .help-btn') ?? [])];
  const closeAll = (except) => { for (const b of buttons) if (b !== except) b.setAttribute('aria-expanded', 'false'); };
  for (const b of buttons) {
    b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') !== 'true';
      closeAll(b);
      b.removeAttribute('data-dismissed');
      b.setAttribute('aria-expanded', String(open));
    });
    b.addEventListener('keydown', (event) => {
      // Escape dismisses the tip even when only hover or focus shows it (WCAG 1.4.13).
      if (event.key !== 'Escape') return;
      event.preventDefault();
      b.setAttribute('aria-expanded', 'false');
      b.setAttribute('data-dismissed', 'true');
    });
    const reset = () => b.removeAttribute('data-dismissed');
    b.addEventListener('blur', reset);
    b.parentElement?.addEventListener('mouseleave', reset);
  }
  doc.addEventListener?.('pointerdown', (event) => {
    if (!event.target?.closest?.('.help')) closeAll(null);
  });
  return buttons.length;
}
