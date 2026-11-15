import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { reviewedGravity } from '../src/ui/evidence-provenance.js';
test('293 correction preserves review hold and B16', () => {
 const data = JSON.parse(readFileSync('data/evidence.json')).evidence;
 const row = data.find(r => r.evidence_id === 'U25-01-L');
 assert.equal(row.gravity_g, 0.16);
 assert.equal(row.gravity_source, '1/6 g');
 assert.match(reviewedGravity(row), /1\/6 g NASA nominal.*0.16 g project normalization/);
 for (const text of ['sheet is inferred', '13.5 mol% O2', 'five-second', '0.8 mm', '56.5 kPa absolute']) assert.ok(row.notes.includes(text));
 assert.equal(row.review_status, 'draft');
 assert.ok(Object.values(row).includes('HOLD_scientific_review'));
 assert.match(row.uncertainty, /0.5/);
 const record = readFileSync('research/reviews/U25-01-L-2026-11-15.md', 'utf8');
 for (const text of ['Lakshya', 'CORRECTION NEEDED', '2026-11-15', 'relayed by the user through this chat']) assert.ok(record.includes(text));
 const before = JSON.parse(execFileSync('git', ['show', 'c4e68732269e8986849109612a5d806fea401d15:data/evidence.json'], {encoding:'utf8'})).evidence;
 assert.deepEqual(data.find(r=>r.evidence_id==='PSI25-B16'), before.find(r=>r.evidence_id==='PSI25-B16'));
 assert.deepEqual(data.filter(r=>r.evidence_id!=='U25-01-L'), before.filter(r=>r.evidence_id!=='U25-01-L'));
});


test('295 U25 qualifiers reach Workspace, Ask and separate Gravity research surfaces', async () => {
 const { describeRecord } = await import('../src/ui/workspace-evidence.js');
 const { summarize } = await import('../src/ui/ask.js');
 const { renderGravityView } = await import('../src/ui/gravity-view.js');
 const evidence = JSON.parse(readFileSync('data/evidence.json')).evidence;
 const row = evidence.find(r => r.evidence_id === 'U25-01-L');
 const conditions = Object.fromEntries(describeRecord(row).conditions);
 assert.equal(conditions.Form, 'sheet (inferred, not source-stated)');
 const endpoint = '13.5 mol% O2 (plot-derived five-second extinction; 0.8 mm PMMA at 56.5 kPa absolute)';
 assert.equal(conditions.Endpoint, endpoint);
 const answer = summarize({kind:'evidence', row});
 assert.ok(answer.includes(conditions.Form));
 assert.ok(answer.includes(endpoint));
 const root = { innerHTML: '', addEventListener() {}, removeEventListener() {} };
 const controller = renderGravityView(root, { data: JSON.parse(readFileSync('data/gravity-points.json')) });
 await controller.ready;
 const detail = root.innerHTML.split('<details data-research>')[1];
 assert.ok(detail.includes('sheet (inferred, not source-stated)'));
 assert.ok(detail.includes(endpoint));
 // Numeric and endpoint cells themselves carry provenance, outside the notes column.
 assert.match(detail, /<td>13\.5 mol% O2 \(plot-derived five-second extinction; 0\.8 mm PMMA at 56\.5 kPa absolute\)/);
 controller.destroy();
 const other = evidence.find(r => r.evidence_id === 'PSI25-B16');
 assert.equal(Object.fromEntries(describeRecord(other).conditions).Form, other.form);
});
