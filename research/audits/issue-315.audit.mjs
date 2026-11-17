import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import assert from 'node:assert/strict';
const mod = p => import(pathToFileURL(resolve(p)).href);
const {validateEvidence}=await mod('src/schema/validate.js');
const {convertRows}=await mod('scripts/build-evidence.mjs');
const {auditUnits}=await mod('scripts/units-audit.mjs');
const {checkLinks}=await mod('scripts/check-links.mjs');
const {labelMaterial}=await mod('src/rules/label.js');
const d=JSON.parse(readFileSync('data/evidence.json'));
const meta=JSON.parse(readFileSync('data/metadata.json'));
const rows=convertRows(readFileSync('data/evidence.csv','utf8'));
const urls=new Map(); const results=[];
const nasa = s => {const u=new URL(s);return u.protocol==='https:'&&(u.hostname==='nasa.gov'||u.hostname.endsWith('.nasa.gov')||u.hostname==='taskbook.nasaprs.com')};
function links(r){return [...new Set([d.sources[r.source_key].url,...Object.entries(r).filter(([k,v])=> k.endsWith('_url') && v).map(([k,v])=>v),...(r.notes?.match(/https:\/\/[^\s)]+/g)??[])])];}
test('45-row dataset and CSV/JSON/export parity',()=>{
 assert.equal(rows.length,45);
 assert.deepEqual(rows,d.evidence);
 assert.deepEqual(JSON.parse(readFileSync('data/exports/evidence.json')).evidence,rows);
 assert.deepEqual(convertRows(readFileSync('data/exports/evidence.csv','utf8')),rows);
 assert.deepEqual(validateEvidence(d),{ok:true,errors:[]});
 assert.equal(new Set(rows.map(r=>r.evidence_id)).size,45);
});
for(const r of rows) test(r.evidence_id+' schema, links, units, provenance, draft gate',()=>{
 assert.deepEqual(validateEvidence({...d,evidence:[r]}),{ok:true,errors:[]});
 assert.deepEqual(auditUnits({...d,evidence:[r],cabin_presets:[]}),[]);
 assert.deepEqual(d.sources[r.source_key],meta.sources[r.source_key]);
 for(const u of links(r)){assert.ok(nasa(u),u);if(!urls.has(u))urls.set(u,[]);urls.get(u).push(r.evidence_id)}
 assert.ok(r.source_locator.trim());assert.ok(r.uncertainty.trim());
 for(const p of ['condition','observation']) if(r[p+'_source_url']) assert.ok(r[p+'_source_locator']?.trim());
 assert.equal(r.review_status,'draft');assert.equal(r.verified_by,null);
 assert.equal(labelMaterial({...r},[r]).label,'NOT_ESTABLISHED');
 if(r.value!==null){assert.ok(r.value_unit);assert.ok(Number.isFinite(r.value));}
 if(r.endpoint==='extinction-5s'){assert.equal(r.value_unit,'% O2');assert.equal(r.test_duration_s,5);assert.equal(r.extraction_method,'digitized_plot_reference');assert.equal(r.gravity_source,'1/6 g');assert.equal(r.gravity_g,0.16);}
 if(['quench-limit','blowoff-limit'].includes(r.endpoint))assert.equal(r.value_unit,'cm/s');
 if(['MOC','ULOI','LOC-FS'].includes(r.endpoint))assert.equal(r.value_unit,'% O2');
 results.push({id:r.evidence_id,urls:links(r),missing:['endpoint','value','value_unit','o2_pct','pressure_kpa','thickness_mm','width_mm','flow_speed_cm_s','external_heat_flux_kw_m2'].filter(k=>r[k]===null)});
});
test('live source link reachability (not scientific verification)',async()=>{
 const network=await checkLinks([...urls].map(([url,locations])=>({url,locations})),{timeoutMs:6000,delayMs:100});
 writeFileSync(resolve(tmpdir(),'redline-audit-315-results.json'),JSON.stringify({rows:results,network,checked:new Date().toISOString()},null,2));
 console.log(JSON.stringify(network.map(r=>({url:r.url,head:r.head,get:r.get,status:r.status}))));
 assert.equal(results.length,45);
});
