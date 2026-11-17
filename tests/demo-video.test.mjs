// Issue #316: the committed 30-second demo clip has captions, wording rules and real-capture log.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const dir = new URL('../docs/demo/', import.meta.url);
const vtt = await readFile(new URL('redline-demo-30s.vtt', dir), 'utf8');
const log = JSON.parse(await readFile(new URL('capture-log.json', dir), 'utf8'));

test('captions are WebVTT, contiguous and end at exactly 30 s', () => {
  assert.ok(vtt.startsWith('WEBVTT'));
  const cues = [...vtt.matchAll(/00:00:(\d\d)\.(\d{3}) --> 00:00:(\d\d)\.(\d{3})/g)].map(m => [+m[1], +m[3]]);
  assert.equal(cues.length, 6);
  assert.equal(cues[0][0], 0);
  assert.equal(cues.at(-1)[1], 30);
  for (let i = 1; i < cues.length; i++) assert.equal(cues[i][0], cues[i - 1][1]);
});

test('captions follow science wording rules and state draft / zero verified', () => {
  assert.doesNotMatch(vtt, /never tested|\bsafe\b|never burns|will burn on the moon|approved/i);
  assert.match(vtt, /0 human verified/);
  assert.match(vtt, /PSI25-B1/);
  assert.match(vtt, /not a fire simulation/);
  assert.match(vtt, /NASA PSI Data Repository/);
});

test('capture log records the real UI flow and draft-only state', async () => {
  assert.equal(log.facts.rows, '45');
  assert.equal(log.facts.verified, '0');
  assert.deepEqual(log.steps.map(s => s.split('@')[0]), ['rover-demo', 'canvas-pick', 'PSI25-B1', 'html-list']);
  assert.equal(log.picked, true);
  assert.match(log.detailText, /draft record, not used for any label/);
  assert.match(log.detailText, /No verified evidence rows loaded/);
  assert.ok((await stat(new URL('redline-demo-30s.mp4', dir))).size > 100_000);
});
