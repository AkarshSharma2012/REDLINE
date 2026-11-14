// Entry point: loads data/evidence.json and wires the UI to the rules (S1 §2-3).
// Scaffold stub: modules below return fixed stubs until their tasks land.
import { labelCabin } from './rules/label.js';
import { renderCabinForm } from './ui/cabin-form.js';
import { renderResultsTable } from './ui/results-table.js';
import { renderEvidencePanel } from './ui/evidence-panel.js';
import { renderO2Slider } from './ui/o2-slider.js';
import { renderFixes } from './ui/fixes.js';

const EVIDENCE_URL = 'data/evidence.json';

export async function loadEvidence(url = EVIDENCE_URL) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

async function start() {
  const status = document.getElementById('status');
  status.textContent = 'Loading evidence…';
  let evidence;
  try {
    evidence = await loadEvidence();
  } catch (err) {
    // TODO (B5): load-error state with a retry button (DESIGN.md 5.1).
    status.textContent = `Evidence file could not be loaded (${err.message}).`;
    return;
  }
  status.textContent = '';

  const cabinQuery = { conditions: {}, materials: [] };
  const results = labelCabin(cabinQuery, evidence);

  // TODO (B5/B7/B8/B9): real wiring of form changes -> labelCabin -> table/panel/slider/fixes.
  // Each screen is mounted on its own: if one throws, the rest of the dashboard still works.
  const mount = (name, fn) => { try { fn(); } catch (err) { console.error(`[REDLINE] ${name} failed to load:`, err); } };
  const lunarCabin = { conditions: { o2_pct: 34, pressure_kpa: 56.5 }, materials: [] };   // 8.2 psia / 34% O2 preset (R7)
  mount('o2-slider', () => renderO2Slider(document.getElementById('o2-slider'), { cabinQuery: lunarCabin, evidence, labelCabin }));
  mount('cabin-form', () => renderCabinForm(document.getElementById('cabin-form'), { materials: evidence.materials, presets: evidence.cabin_presets }));
  mount('results-table', () => renderResultsTable(document.getElementById('results-table'), results, {
    onSelect: (result) => renderEvidencePanel(document.getElementById('evidence-panel'), result, evidence),
  }));
  mount('fixes', () => renderFixes(document.getElementById('fixes'), results));
}

if (typeof document !== 'undefined') start();
