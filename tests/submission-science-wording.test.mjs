import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const draft = readFileSync(new URL('../docs/submission-draft.md', import.meta.url), 'utf8');
const checklist = readFileSync(new URL('../docs/submission-checklist.md', import.meta.url), 'utf8');

test('submission does not promise a lunar bracket without compatible reviewed endpoints', () => {
  assert.doesNotMatch(draft, /Lunar (?:results|values) are (?:an?|a labelled) estimate (?:bounded by|between)/i);
  assert.doesNotMatch(draft, /Lunar displays use an explicitly labeled estimate\/assumed envelope/i);
  assert.match(draft, /No reviewed compatible (?:0 g and 1 g )?endpoint pair/);
  assert.match(draft, /gravity transfer is not established/i);
  assert.match(draft, /no universal 0 g\/1 g (?:bracket|envelope)/i);
});

test('submission separates requested lunar scenarios from simulated-gravity research', () => {
  assert.match(draft, /requested lunar scenario/i);
  assert.match(draft, /measured simulated-partial-gravity tests/i);
  assert.match(draft, /original simulated-gravity sources remain (?:a )?research preview/i);
  assert.match(draft, /No on-Moon material behavior is established/);
  assert.match(draft, /Held-out accuracy: not run; no percentage available/);
  assert.match(draft, /Human source review is still required before promotion/);
});

test('submission reports the zero-verified UI state without invented per-line labels', () => {
  assert.match(draft, /45 evidence rows, all `draft`; 0 are `verified`/);
  assert.match(draft, /No verified evidence rows loaded/);
  assert.match(draft, /no verified evidence-backed cabin labels are produced/i);
  assert.doesNotMatch(draft, /Every line gets one label|every bill-of-materials line currently reads/i);
  assert.doesNotMatch(draft, /Missing coverage reads/i);
});

test('checklist requires compatible endpoints before any lunar envelope', () => {
  assert.doesNotMatch(checklist, /Label lunar envelopes as estimates/);
  assert.match(checklist, /no universal 0 g\/1 g (?:bracket|envelope)/i);
  assert.match(checklist, /reviewed compatible endpoints/i);
  assert.match(checklist, /simulated partial-gravity/);
});

test('checklist summary link resolves to the current draft heading', () => {
  const link = checklist.match(/\[([^\]]+)\]\(submission-draft\.md#([^\)]+)\) describes the problem/);
  assert.ok(link, 'project summary must link to the draft section');
  const anchors = [...draft.matchAll(/^## (.+)$/gm)].map(([, heading]) =>
    heading.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/ /g, '-'));
  assert.ok(anchors.includes(link[2]), `missing draft anchor: ${link[2]}`);
});
