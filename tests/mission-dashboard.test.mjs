// #267 compact mission dashboard: header rail, disclosed notices, structure and CSS budget.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { datasetStatus, showDataset } from '../src/main.js';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const css = await readFile(new URL('src/styles.css', root), 'utf8');
const evidence = JSON.parse(await readFile(new URL('data/evidence.json', root), 'utf8'));
const header = html.match(/<header class="app-header">([\s\S]*?)<\/header>/)[1];
const VIEWS = ['investigations', 'gravity', 'oxygen', 'accuracy', 'ask'];

test('header is a short title, subtitle and status rail, not an essay', () => {
  assert.match(header, /<h1 class="type-title">REDLINE<\/h1>/);
  assert.match(header, /<p class="mission-sub">[^<]{10,40}<\/p>/);
  const visible = header.replace(/<details[\s\S]*?<\/details>/, '').replace(/<[^>]+>/g, ' ');
  assert.ok(visible.split(/\s+/).filter(Boolean).length < 20, 'visible header text stays compact');
  assert.doesNotMatch(header, /<img|nasa-logo|meatball/i, 'no NASA logo or affiliation art');
});

test('status rail is exactly two data-driven counts plus one research-preview line', () => {
  const rail = header.match(/<dl class="status-rail"[^>]*>([\s\S]*?)<\/dl>/)[1];
  assert.deepEqual([...rail.matchAll(/<dt>([^<]+)<\/dt>/g)].map(m => m[1]), ['Evidence', 'Verified']);
  for (const id of ['rail-rows', 'rail-verified']) {
    const cell = rail.match(new RegExp(`<dd id="${id}"[^>]*>([^<]*)</dd>`));
    assert.ok(cell, id);
    assert.equal(cell[1], 'loading', `${id} starts as loading, never a static number`);
  }
  const visible = header.replace(/<details[\s\S]*?<\/details>/, '');
  assert.equal(visible.match(/Research preview/g).length, 1, 'one visible research-preview line');
  assert.match(visible, /<p class="rail-status"><span class="hold-tag">Research preview · not certification<\/span><\/p>/);
  assert.doesNotMatch(visible, /Labels|Moon|Mars/, 'no Labels or Moon/Mars cell');
});

test('no lunar bound is asserted anywhere; the full gravity caveat stays disclosed', () => {
  assert.doesNotMatch(html, /\bbound\b|Estimate, 0 g/i, 'no reviewed endpoint pair, so no 0 g–1 g bound wording');
  const notes = header.match(/<details class="mission-notes">([\s\S]*?)<\/details>/)[1];
  assert.match(notes, /no partial-gravity data in PSI yet/);
  assert.match(notes, /never as a lunar measurement/);
  assert.match(notes, /Labels use verified evidence rows only/);
});

test('red stays reserved for BURNED: no crimson primary token or filled red action', () => {
  assert.doesNotMatch(css, /--primary\b|#C62828|#A61F1F/i);
  const primary = css.match(/\.btn-primary, \.layout \.cabin-ui button\[type="submit"\] \{([^}]*)\}/)[1];
  assert.match(primary, /background: var\(--surface-2\)/);
  assert.match(primary, /font-weight: 600/);
  assert.doesNotMatch(primary, /ev-burned|#|red/i);
  const tokens = css.match(/:root \{([\s\S]*?)\n\}/)[1];
  const reds = [...tokens.matchAll(/--([\w-]+):\s*#FF6A33/gi)].map(m => m[1]);
  assert.deepEqual(reds, ['ev-burned'], 'vermilion only on the BURNED token');
});

test('rail shows the real dataset counts and flags zero verified rows', () => {
  const expected = { rows: evidence.evidence.length, verified: evidence.evidence.filter(r => r.review_status === 'verified').length };
  assert.deepEqual(datasetStatus(evidence), expected);
  const cells = {};
  const doc = { getElementById: (id) => (cells[id] ??= { textContent: '', parentElement: { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } } }) };
  showDataset(evidence, doc);
  assert.equal(cells['rail-rows'].textContent, String(expected.rows));
  assert.equal(cells['rail-verified'].textContent, String(expected.verified));
  assert.equal(cells['rail-verified'].parentElement.attrs['data-state'], expected.verified === 0 ? 'none' : 'some');
  assert.match(cells.dataset.textContent, new RegExp(`${expected.rows} evidence rows, ${expected.verified} verified`));
});

test('scope notes keep the full scientific wording in a closed native details', () => {
  const notes = header.match(/<details class="mission-notes">([\s\S]*?)<\/details>/);
  assert.ok(notes, 'mission-notes details');
  assert.match(notes[1], /^\s*<summary>Scope and limits<\/summary>/, 'summary is the first child so native toggle works');
  for (const phrase of ['Evidence review, not cabin certification', 'Prevention · Detection · Suppression',
    'no partial-gravity data in PSI yet', 'estimate beside 0 g and 1 g results', 'never as a lunar measurement', 'id="dataset"']) {
    assert.ok(notes[1].includes(phrase), phrase);
  }
});

test('each research-preview notice is one visible line with the full text disclosed', () => {
  for (const view of VIEWS) {
    const panel = html.match(new RegExp(`id="panel-${view}"[\\s\\S]*?</section>`))[0];
    const aside = panel.match(/<aside class="research-preview"[^>]*>([\s\S]*?)<\/aside>/)[1];
    const details = aside.match(/^\s*<details>([\s\S]*?)<\/details>\s*$/);
    assert.ok(details, `${view}: notice wraps a native details with no open attribute`);
    assert.match(details[1], /^\s*<summary><span class="hold-tag">Research preview<\/span> [^<]+<\/summary>/, `${view} summary`);
    assert.match(details[1], /<\/summary>\s*<p>[^<]*(review|evaluation)[^<]*<\/p>\s*$/, `${view} full wording`);
  }
});

test('native details are not overridden by script or hidden content rules', async () => {
  const main = await readFile(new URL('src/main.js', root), 'utf8');
  assert.doesNotMatch(main, /details|summary|\.open\s*=/, 'no script toggling of disclosures');
  assert.doesNotMatch(css, /details[^{]*>\s*(p|\*)[^{]*\{[^}]*display:\s*none/, 'disclosed text not force-hidden');
  assert.match(css, /details\[open\] > summary::before \{ transform: rotate\(45deg\)/, 'open state has a visible marker');
  assert.match(css, /summary::-webkit-details-marker \{ display: none; \}/);
});

test('header stays compact: no grid rail, readable 14 px rail text, scope collapsed', () => {
  assert.doesNotMatch(css, /\.status-rail \{[^}]*grid/, 'no metric grid with empty slots');
  assert.match(css, /\.status-rail \{[^}]*font-size: 14px;/);
  assert.match(css, /\.rail-status \.hold-tag \{[^}]*font-size: 14px;/);
  assert.doesNotMatch(css, /\.(status-rail|rail-status|hold-tag|mission-notes)[^{]*\{[^}]*(white-space: nowrap|text-overflow)/, 'warnings wrap, never clip');
  assert.doesNotMatch(header, /<details[^>]*\bopen/);
});

test('tab research-preview labels are compact but keep the full status for assistive tech', () => {
  for (const view of VIEWS) {
    const tab = html.match(new RegExp(`id="tab-${view}"[^>]*>([\\s\\S]*?)</button>`))[1];
    assert.match(tab, /<span class="preview-label" aria-hidden="true">Preview<\/span><span class="sr-only">, Research preview<\/span>$/);
  }
});

test('tabs, panels and primary controls keep IDs and sizes', () => {
  const tabs = [...html.matchAll(/role="tab" id="tab-([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(tabs, ['cabin', ...VIEWS]);
  assert.match(html, /<button type="button" id="rover-demo" class="btn-primary"[^>]*disabled>/);
  assert.match(css, /button, input, select \{[^}]*min-height: 40px;/);
  assert.match(css, /\.tabs \[role="tab"\] \{[^}]*min-height: 44px;/);
  assert.match(css, /\[hidden\] \{ display: none !important; \}/);
  assert.match(css, /\.table-scroll \{ overflow-x: auto; \}/);
});

test('styling stays restrained: no gradients except the estimate hatch, no glow, no emoji', () => {
  const gradients = css.match(/gradient\(/g) || [];
  assert.equal(gradients.length, 1, 'only the DESIGN.md estimate hatch');
  assert.doesNotMatch(css, /text-shadow|backdrop-filter|filter:\s*blur|drop-shadow/);
  assert.doesNotMatch(html + css, /\p{Extended_Pictographic}/u);
  for (const file of [html, css]) assert.ok(file.split('\n').length < 500);
});
