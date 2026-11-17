// #336 (B1 fallback): x-ray, isolate and evidence-review overlay on the real illustrative scene.
// Colours are categorical review states from triage, never risk or probability.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../src/vendor/three/three.module.min.js';
import { buildRoverScene, EVIDENCE_COLORS, SELECTED_COLOR } from '../src/ui/rover-scene.js';
import { evidenceStatesFromTriage, sanitizeEvidenceStates, EVIDENCE_STATE_TEXT } from '../src/ui/rover-model.js';

const ids = ['pmma', 'cotton', 'p213', 'nomex'];
const hex = (mesh) => mesh.material.color.getHex();

test('evidence overlay tints requested parts by review state; selection stays neutral white; off restores base', () => {
  const r = buildRoverScene(THREE);
  const evidence = { pmma: 'review-required', cotton: 'review-ready', p213: 'no-record' };
  r.applyState({ highlightId: 'nomex', inRequest: new Set(ids), evidence });
  assert.equal(hex(r.partMeshes('pmma')[0]), EVIDENCE_COLORS['review-required']);
  assert.equal(hex(r.partMeshes('cotton')[0]), EVIDENCE_COLORS['review-ready']);
  assert.equal(hex(r.partMeshes('p213')[0]), EVIDENCE_COLORS['no-record']);
  assert.equal(hex(r.partMeshes('nomex')[0]), SELECTED_COLOR);
  r.applyState({ highlightId: null, inRequest: new Set(ids), evidence: null });
  assert.equal(hex(r.partMeshes('pmma')[0]), r.partMeshes('pmma')[0].userData.baseColor);
  r.dispose();
});

test('isolate shows only the selected part; x-ray makes structure translucent; both reversible', () => {
  const r = buildRoverScene(THREE);
  r.applyState({ highlightId: 'pmma', inRequest: new Set(ids), isolate: true });
  assert.ok(r.partMeshes('pmma').every((m) => m.visible));
  assert.ok(r.partMeshes('nomex').every((m) => !m.visible));
  assert.ok(r.occluders.every((m) => !m.visible));
  r.applyState({ highlightId: 'pmma', inRequest: new Set(ids), isolate: false });
  assert.ok(r.partMeshes('nomex').every((m) => m.visible));
  r.setXray(true);
  assert.ok(r.occluders.filter((m) => m.isMesh && !m.isInstancedMesh).every((m) => m.material.transparent && m.material.opacity < 0.5));
  r.setXray(false);
  assert.ok(r.occluders.every((m) => m.material.opacity === 1));
  r.dispose();
});

test('evidence states come from triage status only: ready > review required > no record; labels say review, not risk', () => {
  const t = { items: [
    { material_id: 'pmma', candidates: [{ review_ready: false }, { review_ready: false }] },
    { material_id: 'pmma', candidates: [{ review_ready: false }, { review_ready: false }] },
    { material_id: 'mystery', candidates: [] },
    { material_id: 'cotton', candidates: [{ review_ready: true }] },
  ] };
  const s = evidenceStatesFromTriage(t);
  assert.equal(s.pmma.state, 'review-required'); assert.equal(s.pmma.records, 2);
  assert.equal(s.mystery.state, 'no-record');
  assert.equal(s.cotton.state, 'review-ready');
  for (const v of Object.values(s)) assert.doesNotMatch(v.label, /safe|risk|probab|%/i);
  for (const v of Object.values(EVIDENCE_STATE_TEXT)) assert.doesNotMatch(v, /safe|risk/i);
  assert.deepEqual(evidenceStatesFromTriage(null), {});
  assert.deepEqual(sanitizeEvidenceStates({ pmma: { state: 'fire-score', label: 'x' }, cotton: s.cotton }), { cotton: { state: 'review-ready', label: s.cotton.label } });
  assert.equal(sanitizeEvidenceStates(undefined), null);
});
