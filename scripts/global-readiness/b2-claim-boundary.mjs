#!/usr/bin/env node
// B2 claim-boundary harness (issue #319). Standalone, read-only diagnostic.
//
// Feeds a fixed matrix of SYNTHETIC answer strings through the production guards
// (src/ui/ask.js answerHtml, src/rules/retrieve.js citationsIn / isNotFound / groundingHits /
// sourceFor / retrieve) and records what each guard enforces MECHANICALLY: withholding,
// unknown-citation caveat, uncited caveat, and which source links get rendered.
//
// None of these strings came from the live Claude API. No network, no API key, no writes.
// Constructed false claims are labeled CONSTRUCTED-FALSE. A row rendering with a real NASA link
// is NOT evidence that the claim is supported: no function here compares claim text to row text.
//
// Exit code: 0 whenever the harness ran (whatever the app does); nonzero only on setup/execution
// errors (missing data file, missing cited row, import failure).
//
// Usage: node scripts/global-readiness/b2-claim-boundary.mjs [--json]

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Synthetic claim matrix. `cites` lists the real production IDs the claim uses; `ground` is the
// pinned grounding set passed to answerHtml (what renderAsk would pass after retrieval).
// class: SUPPORTED = paraphrase of the row's own observation/value; CONSTRUCTED-FALSE = written
// to contradict or exceed the cited row; CONTROL = checks a specific guard path.
const GROUND = ['PSI25-B1', 'U25-01-L', 'U25-06-L'];
const CASES = [
  { id: 'C01', class: 'SUPPORTED', kind: 'bounded observation',
    text: 'In BASS-II test B1 on the ISS, the 100 micron PMMA film ignited rapidly; after the flow stopped the flame quickly extinguished [PSI25-B1]. This row is a draft and not yet verified.' },
  { id: 'C02', class: 'SUPPORTED', kind: 'bounded numeric (simulated lunar)',
    text: 'At 0.16 g simulated lunar gravity, the PMMA sample reached five-second extinction at 13.5% O2 [U25-01-L].' },
  { id: 'C03', class: 'CONSTRUCTED-FALSE', kind: 'valid ID + unsupported approval',
    text: 'This polymer is approved for lunar cabin use [PSI25-B1].' },
  { id: 'C04', class: 'CONSTRUCTED-FALSE', kind: 'valid ID + false number',
    text: 'At 0.16 g the PMMA sample extinguished at 18% O2 [U25-01-L].' },
  { id: 'C05', class: 'CONSTRUCTED-FALSE', kind: 'valid ID + misattributed material',
    text: 'Nomex extinguished at 13.5% O2 in simulated lunar gravity [U25-01-L].' },
  { id: 'C06', class: 'CONSTRUCTED-FALSE', kind: 'valid ID + unsupported lunar transfer',
    text: 'Because the film extinguished in microgravity, it will also self-extinguish in a lunar habitat [PSI25-B1].' },
  { id: 'C07', class: 'CONSTRUCTED-FALSE', kind: 'paraphrased approval, no blocked word',
    text: 'Cleared for use inside pressurized lunar rovers without added fire controls [PSI25-B1].' },
  { id: 'C08', class: 'CONSTRUCTED-FALSE', kind: 'hyphen variant of blocked word',
    text: 'This film is non-flammable in lunar cabins [PSI25-B1].' },
  { id: 'C09', class: 'CONSTRUCTED-FALSE', kind: 'fake citation',
    text: 'PMMA was certified for Artemis cabins [PSI99-Z9].' },
  { id: 'C10', class: 'CONSTRUCTED-FALSE', kind: 'valid + fake citation mixed',
    text: 'PMMA is approved for lunar cabin use [PSI25-B1, PSI99-Z9].' },
  { id: 'C11', class: 'CONSTRUCTED-FALSE', kind: 'no citation',
    text: 'This polymer is approved for lunar cabin use.' },
  { id: 'C12', class: 'CONSTRUCTED-FALSE', kind: 'blocked word + valid ID',
    text: 'This film is safe for lunar cabins [PSI25-B1].' },
  { id: 'C13', class: 'CONTROL', kind: 'exact not-found reply',
    text: 'not found in the sources reviewed.' },
  { id: 'C14', class: 'CONSTRUCTED-FALSE', kind: 'citation-shaped non-ID in brackets',
    text: 'PMMA is rated for lunar use [NASA-STD-6001 approved].' },
];

function fail(msg) {
  console.error(`b2-claim-boundary: SETUP ERROR: ${msg}`);
  process.exit(2);
}

function sha() {
  try { return execSync('git rev-parse HEAD', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch { return 'unknown (git unavailable)'; }
}

const cell = (s) => String(s).replace(/\|/g, '\\|');

async function main() {
  const asJson = process.argv.includes('--json');
  let ask, rules, evidence;
  try {
    ask = await import(new URL('../../src/ui/ask.js', import.meta.url));
    rules = await import(new URL('../../src/rules/retrieve.js', import.meta.url));
    evidence = JSON.parse(readFileSync(path.join(ROOT, 'data', 'evidence.json'), 'utf8'));
  } catch (err) { fail(`could not load app modules or data/evidence.json: ${err.message}`); }

  const byId = new Map((evidence.evidence || []).map((r) => [r.evidence_id, r]));
  const sources = evidence.sources || {};
  const hits = GROUND.map((id) => {
    const row = byId.get(id);
    if (!row) fail(`pinned row ${id} not in data/evidence.json`);
    return { kind: 'evidence', id, score: 1, matched: [], row, source: rules.sourceFor('evidence', row, sources) };
  });
  const ground = rules.groundingHits(hits);
  const groundIds = new Set(ground.map((h) => h.id));

  // Retrieval context: does real retrieval surface PSI25-B1 for a lunar-cabin approval question?
  const q = 'Is the PMMA film approved for lunar cabin use?';
  const ret = rules.retrieve(q, { evidence }, { limit: 8 });
  const retIds = ret.hits.map((h) => h.id);

  const results = CASES.map((c) => {
    const html = ask.answerHtml(c.text, ground);
    const { cited, unknown } = rules.citationsIn(c.text, ground);
    const withheld = html.includes('Live answer withheld');
    const unknownWarn = html.includes('not among the retrieved rows');
    const uncitedWarn = html.includes('cites no retrieved row');
    const links = [...html.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map((m) => ({ id: m[2], url: m[1] }));
    // Draft notice added by answerHtml itself (not copied from the input text).
    const draftShown = !/draft/i.test(c.text) && /draft/i.test(html);
    const flagged = withheld || unknownWarn || uncitedWarn;
    // Boundary observation, purely mechanical: a CONSTRUCTED-FALSE claim that renders with at
    // least one real source link and no caveat is "rendered-as-grounded".
    let observation;
    if (c.class === 'CONSTRUCTED-FALSE') {
      observation = withheld ? 'withheld (word blocklist)'
        : links.length && !flagged ? 'RENDERED WITH REAL LINK, NO CAVEAT'
          : links.length && flagged ? 'rendered with real link + caveat'
            : flagged ? 'rendered + caveat' : 'RENDERED, NO CAVEAT';
    } else {
      observation = withheld ? 'withheld' : flagged ? 'rendered + caveat' : links.length ? 'rendered with link' : 'rendered';
    }
    return {
      ...c, withheld, unknownWarn, uncitedWarn, notFound: rules.isNotFound(c.text),
      cited, unknown, links, draftStatusInOutput: draftShown, observation,
    };
  });

  const commit = sha();
  const cmd = 'node scripts/global-readiness/b2-claim-boundary.mjs';
  if (asJson) {
    console.log(JSON.stringify({ command: cmd, sha: commit, ground: [...groundIds], retrieval: { question: q, ids: retIds }, results }, null, 2));
    return;
  }

  const out = [];
  out.push('# B2 claim-boundary harness (issue #319)');
  out.push('');
  out.push(`Command: \`${cmd}\``);
  out.push(`SHA: ${commit}`);
  out.push(`Data: data/evidence.json (built_at ${evidence.built_at ?? 'not stated'}); primary dataset NASA PSI Data Repository https://psi.nasa.gov/`);
  out.push(`Pinned grounding rows passed to answerHtml: ${[...groundIds].join(', ')} (all review_status: ${[...new Set(ground.map((h) => h.row.review_status))].join(', ')})`);
  for (const h of ground) out.push(`  - ${h.id}: ${h.source.url}`);
  out.push(`Retrieval context: retrieve(${JSON.stringify(q)}) returned ${retIds.length} rows: ${retIds.join(', ') || 'none'}; PSI25-B1 included: ${retIds.includes('PSI25-B1') ? 'yes' : 'no'}`);
  out.push('');
  out.push('All answer strings below are SYNTHETIC inputs written for this harness, not live model output.');
  out.push('');
  out.push('| Case | Class | Kind | Input (synthetic) | Withheld | Unknown-ID caveat | Uncited caveat | Linked IDs | Unknown IDs | Observation |');
  out.push('|---|---|---|---|---|---|---|---|---|---|');
  for (const r of results) {
    out.push(`| ${r.id} | ${r.class} | ${cell(r.kind)} | ${cell(r.text)} | ${r.withheld ? 'yes' : 'no'} | ${r.unknownWarn ? 'yes' : 'no'} | ${r.uncitedWarn ? 'yes' : 'no'} | ${r.links.map((l) => l.id).join(', ') || '-'} | ${r.unknown.join(', ') || '-'} | ${r.observation} |`);
  }
  const falseCases = results.filter((r) => r.class === 'CONSTRUCTED-FALSE');
  const silent = falseCases.filter((r) => r.observation.startsWith('RENDERED WITH REAL LINK'));
  const caught = falseCases.filter((r) => r.withheld || r.unknownWarn || r.uncitedWarn);
  out.push('');
  out.push('## Summary (mechanical only)');
  out.push(`- Constructed-false claims: ${falseCases.length}; withheld or caveated: ${caught.length}; rendered with a real NASA source link and no caveat: ${silent.length} (${silent.map((r) => r.id).join(', ') || 'none'}).`);
  out.push('- answerHtml enforces: (1) a fixed regex word blocklist (safe / never tested / never burns / will burn on the moon / nonflammable) -> whole answer withheld;');
  out.push('  (2) bracketed tokens not in the grounding set -> "not among the retrieved rows" caveat; (3) no recognized citation and not the exact not-found reply -> "cites no retrieved row" caveat;');
  out.push('  (4) escaping + turning known [ID] into the row source link.');
  out.push('- It does NOT check: whether the sentence matches the cited row (material, number, unit, gravity, endpoint), approval/certification language, 0 g -> lunar transfer, hyphen/spelling variants of blocked words, or the row draft status.');
  out.push(`- Draft notice added by answerHtml in any case (all pinned rows are draft): ${results.some((r) => r.draftStatusInOutput) ? 'yes' : 'no'}.`);
  out.push('- Citation presence is therefore an ID-membership check, not a semantic-support check. A rendered link does not mean the claim is supported.');
  out.push('');
  out.push('## Limitations');
  out.push('- Inputs are hand-written synthetic strings; the harness does not call the Claude API and does not show what the live model would generate.');
  out.push('- Grounding set is pinned (not taken from a live retrieve() of each claim) to isolate answerHtml; the retrieval context line shows only one sample question.');
  out.push('- Detection is by substring of the current answerHtml caveat wording; if that wording changes, update the matchers here.');
  out.push('- The harness reports behavior; it does not judge whether the app passes a science or security bar, and exit code 0 means only "ran".');
  console.log(out.join('\n'));
}

main().catch((err) => fail(err.stack || err.message));
