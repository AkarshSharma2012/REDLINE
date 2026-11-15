import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as watchdog from '../scripts/failure-watchdog.mjs';
const now = Date.parse('2026-11-15T07:35:00-08:00');
const cutoff = '2026-11-15T08:00:00-08:00';
const config = { cutoff, routes: { A1: 240, A2: 239, B1: 238, B2: 237, orchestrator: 236 }, coordinator: 'akarshsharma2012' };
function setup(t) { const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'watchdog-dispatch-')); t.after(() => fs.rmSync(dir, { recursive:true, force:true })); return dir; }
const incident = {version:1, issue:241, owner:'A1', claimed:true, kind:'task-stalled', summary:'Inspect task', evidence:'$(evil) is data', observedAt:new Date(now).toISOString(), taskId:'655450vvjp'};
test('dispatch requires explicit future cutoff and configured authorized routes', () => {
  assert.equal(typeof watchdog.validateConfig, 'function');
  for (const value of [undefined, {...config,cutoff:'bad'}, {...config,cutoff:'2026-11-15T06:20:00-08:00'}, {...config,routes:{A1:1}}, {...config,routes:{...config.routes,A1:'x'}}]) assert.throws(() => watchdog.validateConfig(value,now));
  assert.ok(watchdog.validateConfig(config,now));
});
test('empty finite dispatch performs zero gh/model calls', async t => {
  assert.equal(typeof watchdog.watch, 'function');
  const result = await watchdog.watch(setup(t),config,now,()=>{throw Error('unexpected gh');});
  assert.equal(result.modelCalls,0); assert.equal(result.ghCalls,0);
});
test('outage remains pending, rate limited; successful comment delivered; subsequent ACK stops escalation', async t => {
  assert.equal(typeof watchdog.watch, 'function');
  const dir=setup(t); watchdog.report(dir,incident,now,cutoff);
  let calls=0;
  const outage=async()=>{calls++;return {code:1,output:'offline'};};
  await watchdog.watch(dir,config,now,outage);
  let request=Object.values(watchdog.doctor(dir).incidents)[0].requests[0];
  assert.equal(request.status,'pending'); assert.equal(request.commentURL,undefined);
  await watchdog.watch(dir,config,now+1000,outage); assert.equal(calls,1);
  const comments=[]; const argsSeen=[];
  const gh=async(args)=>{argsSeen.push(args); if(args[0]==='api') return {code:0,output:JSON.stringify(comments)}; return {code:0,output:'https://github.com/AkarshSharma2012/REDLINE/issues/240#issuecomment-100'};};
  await watchdog.watch(dir,config,now+60000,gh);
  request=Object.values(watchdog.doctor(dir).incidents)[0].requests[0];
  assert.equal(request.status,'delivered'); assert.match(request.commentURL,/#issuecomment-100$/);
  assert.equal(argsSeen[1][0],'issue'); assert.equal(argsSeen[1][2],'240');
  const body=fs.readFileSync(path.join(dir,request.bodyFile),'utf8'); assert.match(body,/\$\(evil\)/);
  comments.push({id:101,body:`REDLINE-WATCHDOG-ACK ${request.id}:${request.attempt}`,user:{login:config.coordinator}});
  await watchdog.watch(dir,config,now+120000,gh);
  assert.equal(Object.values(watchdog.doctor(dir).incidents)[0].requests[0].status,'acknowledged');
  assert.equal(watchdog.doctor(dir).total,1);
});
test('unacknowledged delivery becomes overdue, never fixed, routes orchestrator next', async t=>{
  assert.equal(typeof watchdog.watch,'function'); const dir=setup(t); watchdog.report(dir,incident,now,cutoff);
  const gh=async args=>({code:0,output:args[0]==='api'?'[]':`https://github.com/AkarshSharma2012/REDLINE/issues/${args[2]}#issuecomment-100`});
  await watchdog.watch(dir,config,now,gh); await watchdog.watch(dir,config,now+60000,gh);
  const s=watchdog.doctor(dir); const requests=Object.values(s.incidents)[0].requests;
  assert.equal(requests[0].status,'overdue'); assert.equal(requests[1].recipient,'orchestrator'); assert.equal(s.total,2);
});
