// #68: pre-generated AI insights (data/insights.json) cite only ids that exist in the
// evidence file or the investigation catalog, and follow the science wording rules.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const read = async (p) => JSON.parse(await readFile(new URL(p, import.meta.url), 'utf8'));
const evidence = await read('../data/evidence.json');
const insights = await read('../data/insights.json');
const CATALOG_URL = new URL('../data/investigations.json', import.meta.url);
const catalog = await access(CATALOG_URL).then(() => read('../data/investigations.json'), () => null);
const catalogList = catalog ? (Array.isArray(catalog) ? catalog : catalog.investigations || []) : [];
const catalogIds = new Set(catalogList.map((i) => (typeof i.id === 'object' ? i.id?.value : i.id ?? i.investigation_id)));

const known = new Set([
  ...evidence.evidence.map((r) => r.evidence_id),
  ...Object.keys(evidence.sources),
  ...evidence.cabin_presets.map((p) => p.preset_id),
  ...catalogIds,
]);
const groups = new Set([...evidence.evidence.map((r) => r.holdout_group), ...catalogIds]);
const BANNED = [/\bsafe(ly|ty)?\b/i, /never burns/i, /never tested/i, /will burn on the moon/i, /\bguarantee/i];
const bracketIds = (text) => [...text.matchAll(/\[([^\]]+)\]/g)].flatMap((m) => m[1].split(/,\s*/));
const sentences = (text) => text.trim().split(/(?<=[.?!])\s+(?=[A-Z])/);

test('insights file carries the AI-generated / team-check flags', () => {
  assert.ok(insights.insights.length > 0);
  assert.match(insights.generated_by, /^AI:/);
  const ids = new Set();
  for (const ins of insights.insights) {
    assert.ok(!ids.has(ins.insight_id), `duplicate ${ins.insight_id}`);
    ids.add(ins.insight_id);
    assert.equal(ins.generated_by_ai, true, ins.insight_id);
    assert.equal(typeof ins.checked_by_team, 'boolean', ins.insight_id);
    if (ins.checked_by_team) assert.ok(ins.checked_by, `${ins.insight_id}: checked_by needed when checked`);
    assert.ok(Array.isArray(ins.fire_safety_areas) && ins.fire_safety_areas.length, ins.insight_id);
    for (const a of ins.fire_safety_areas) assert.ok(['prevention', 'detection', 'suppression'].includes(a), a);
  }
});

test('every insight cites only ids present in the catalog/evidence', () => {
  for (const ins of insights.insights) {
    assert.ok(ins.cited_ids.length > 0, `${ins.insight_id} cites nothing`);
    for (const id of ins.cited_ids) assert.ok(known.has(id), `${ins.insight_id} cites unknown id ${id}`);
    const inText = new Set(bracketIds(ins.text));
    for (const id of inText) assert.ok(ins.cited_ids.includes(id), `${ins.insight_id}: [${id}] missing from cited_ids`);
    for (const id of ins.cited_ids) assert.ok(inText.has(id), `${ins.insight_id}: cited ${id} never used in text`);
    assert.ok(groups.has(ins.subject.id), `${ins.insight_id}: subject ${ins.subject.id} not in evidence/catalog`);
  }
});

test('insights are 3-5 sentences and use the science wording rules', () => {
  for (const ins of insights.insights) {
    const n = sentences(ins.text).length;
    assert.ok(n >= 3 && n <= 5, `${ins.insight_id} has ${n} sentences`);
    for (const re of BANNED) assert.doesNotMatch(ins.text, re, `${ins.insight_id} uses banned wording`);
  }
});

test('the unknown-id check really fails on a made-up id', () => {
  assert.ok(!known.has('PSI25-B999'));
  assert.ok(!known.has('MADE-UP-SOURCE'));
});

const missing = catalogList.map((i) => (typeof i.id === 'object' ? i.id?.value : i.id ?? i.investigation_id))
  .filter((id) => !insights.insights.some((ins) => ins.subject.id === id));
test('every catalog investigation has an insight', {
  todo: !catalog ? 'data/investigations.json (#66) not merged yet'
    : missing.length ? `generate insights for: ${missing.join(', ')} (docs/ai-use.md §1)` : false,
}, () => {
  assert.deepEqual(missing, []);
});
