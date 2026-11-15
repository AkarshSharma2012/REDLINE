import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { STOP, validate, report, tick, doctor, withLock, boundedProbe, probeTask, main } from '../scripts/failure-watchdog.mjs';

const now = STOP - 3600000;
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'redline-watchdog-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function incident(extra = {}) { return { version: 1, issue: 241, owner: 'A1', claimed: true, kind: 'task-stalled', summary: 'Read-only task requires inspection', evidence: 'Untrusted $(Remove-Item C:/); do not run', observedAt: new Date(now).toISOString(), taskId: '655450vvjp', ...extra }; }

test('structured intake deduplicates changing logs and routes owner before orchestrator', t => {
  const dir = fixture(t);
  assert.equal(report(dir, incident(), now).count, 1);
  assert.equal(report(dir, incident({ evidence: 'new excerpt', observedAt: new Date(now + 1000).toISOString() }), now).count, 2);
  const first = tick(dir, now);
  assert.equal(first.modelCalls, 0);
  assert.equal(first.requests[0].recipient, 'A1');
  assert.equal(tick(dir, now + 1000).requests.length, 0);
  assert.equal(tick(dir, now + 60000).requests[0].recipient, 'orchestrator');
  assert.equal(tick(dir, now + 120000).requests.length, 0);
  assert.equal(doctor(dir).total, 2);
  t.diagnostic(JSON.stringify({ synthetic: true, events: doctor(dir).events }));
});

test('malformed, oversized, stale and future reports fail closed', async t => {
  const dir = fixture(t);
  for (const value of [null, [], {}, incident({ command: 'echo bad' }), incident({ issue: '241' }), incident({ claimed: 'true' }), incident({ owner: '' }), incident({ evidence: '\x1b[2J' }), incident({ kind: 'unknown' }), incident({ observedAt: 'yesterday' }), incident({ summary: 'a'.repeat(501) })]) assert.throws(() => validate(value));
  assert.throws(() => report(dir, incident({ observedAt: new Date(now - 86400001).toISOString() }), now));
  assert.throws(() => report(dir, incident({ observedAt: new Date(now + 60001).toISOString() }), now));
  const file = path.join(dir, 'large.json'); fs.writeFileSync(file, ' '.repeat(16385));
  await assert.rejects(main(['report', dir, file]), /too large/);
  fs.writeFileSync(file, '{broken');
  await assert.rejects(main(['report', dir, file]));
  assert.equal(doctor(dir).total, 0);
});

test('empty monitoring has zero requests and zero model calls', t => {
  const dir = fixture(t);
  assert.deepEqual(tick(dir, now), { requests: [], remainingBudget: 4, modelCalls: 0 });
  assert.equal(doctor(dir).events.length, 0);
});

test('persistent global budget, deadline and poisoned state stop escalation', t => {
  const dir = fixture(t);
  for (let i = 1; i <= 5; i++) report(dir, incident({ issue: i, claimed: false }), now);
  const result = tick(dir, now);
  assert.equal(result.requests.length, 4);
  assert.ok(result.requests.every(x => x.recipient === 'orchestrator'));
  assert.equal(tick(dir, now + 60000).remainingBudget, 0);
  assert.equal(tick(dir, STOP).stopped, true);
  assert.throws(() => report(dir, incident(), STOP), /deadline/);
  const file = path.join(dir, 'state.json');
  const s = JSON.parse(fs.readFileSync(file)); s.total = 0; fs.writeFileSync(file, JSON.stringify(s));
  assert.throws(() => tick(dir, now), /ledger/);
});

test('exclusive lock rejects concurrent CLI and is released on exceptions', t => {
  const dir = fixture(t);
  withLock(dir, () => {
    assert.throws(() => tick(dir, now), /EEXIST/);
    const child = spawnSync(process.execPath, ['scripts/failure-watchdog.mjs', 'doctor', dir], { encoding: 'utf8', timeout: 5000, windowsHide: true });
    assert.equal(child.status, 1); assert.match(child.stderr, /EEXIST/);
  });
  assert.throws(() => withLock(dir, () => { throw Error('synthetic'); }), /synthetic/);
  assert.equal(fs.existsSync(path.join(dir, 'watchdog.lock')), false);
});

test('bounded probes terminate only their own child and wait for exit', async () => {
  const timed = await boundedProbe(process.execPath, ['-e', 'setTimeout(() => {}, 10000)'], 100);
  assert.equal(timed.timedOut, true);
  const good = await boundedProbe(process.execPath, ['-e', 'process.stdout.write("probe evidence")']);
  assert.equal(good.code, 0); assert.equal(good.output, 'probe evidence');
  const missing = await boundedProbe('redline-nonexistent-executable-241', []);
  assert.ok(missing.error);
  assert.throws(() => boundedProbe(process.execPath, [], 6000));
});

test('real read-only Windows process evidence and PowerShell syntax', { skip: process.platform !== 'win32' }, async t => {
  const probe = await probeTask(process.pid);
  assert.equal(probe.timedOut, false);
  assert.equal(probe.code, 0);
  assert.equal(JSON.parse(probe.output).Id, process.pid);
  t.diagnostic(`Real read-only process probe: ${probe.output}`);
  for (const file of ['scripts/failure-watchdog.ps1', 'scripts/watchdog-doctor.ps1']) {
    const parsed = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', '$e=$null; $t=$null; [System.Management.Automation.Language.Parser]::ParseFile($env:REDLINE_PARSE_FILE,[ref]$t,[ref]$e) | Out-Null; if ($e.Count) { $e | Out-String | Write-Error; exit 1 }'], { encoding: 'utf8', timeout: 5000, windowsHide: true, env: { ...process.env, REDLINE_PARSE_FILE: path.resolve(file) } });
    assert.equal(parsed.status, 0, parsed.stderr);
  }
});

test('CLI report, watch and doctor retain literal untrusted text as JSON data', async t => {
  const dir = fixture(t), file = path.join(dir, 'incident.json');
  // Actual clock is used only for the command-line intake, never to extend deadline.
  if (Date.now() >= STOP) return;
  fs.writeFileSync(file, JSON.stringify(incident({ observedAt: new Date().toISOString() })));
  const result = await main(['report', dir, file]);
  assert.equal(result.modelCalls, 0);
  assert.equal((await main(['watch', dir])).requests[0].recipient, 'A1');
  assert.equal(Object.values((await main(['doctor', dir])).incidents)[0].incident.evidence, incident().evidence);
});
