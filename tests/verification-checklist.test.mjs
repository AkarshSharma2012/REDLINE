import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateChecklist } from '../scripts/verification-checklist.mjs';

test('generates one unchecked row per draft, grouped by source with traceable claims', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'redline-checklist-'));
  try {
    const input = join(dir, 'fixture.csv');
    const output = join(dir, 'checklist.md');
    await writeFile(input, '\uFEFFevidence_id,material,review_status,source_key,source_url,source_locator,o2_pct,gravity_g,endpoint,value,value_unit,observation_paraphrase,condition_source_url,condition_source_locator\r\n'
      + 'A,"Film, \"\"thin\"\" | sample",draft,NASA,https://ntrs.nasa.gov/a,"p. 2, Fig. 1",21,0,LOC-FS,20,% O2,"First line\nsecond line",https://psi.nasa.gov/a,Table 1\r\n'
      + 'B,Cotton,draft,OTHER,https://ntrs.nasa.gov/b,Table 2,,,,,,,,\r\n'
      + 'C,Nomex,draft,NASA,https://ntrs.nasa.gov/a,p. 3,,,,,,,,\r\n'
      + 'D,Excluded,verified,NASA,https://ntrs.nasa.gov/a,p. 4,,,,,,,,\r\n'
      + 'E,Excluded,reviewed,NASA,https://ntrs.nasa.gov/a,p. 5,,,,,,,,\r\n');
    await generateChecklist({ input, output, sources: {} });
    const result = await readFile(output, 'utf8');
    assert.equal((result.match(/\| \[ \] \|/g) || []).length, 3);
    assert.ok(result.indexOf('| A |') < result.indexOf('| C |'));
    assert.ok(result.indexOf('| C |') < result.indexOf('| B |'));
    assert.match(result, /Film, &quot;thin&quot; &#124; sample/);
    assert.match(result, /O2: 21 %/);
    assert.match(result, /gravity: 0 g/);
    assert.match(result, /LOC-FS; 20 % O2/);
    assert.match(result, /First line<br>second line/);
    assert.match(result, /https:\/\/psi.nasa.gov\/a/);
    assert.match(result, /Table 1/);
    assert.match(result, /not stated/);
    assert.doesNotMatch(result, /Excluded/);
    assert.match(result, /Verified by \/ date/);
    assert.match(result, /\| A \|.*\|  \|/);
    await generateChecklist({ input, output, sources: {} });
    assert.equal(await readFile(output, 'utf8'), result);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('resolves dictionary sources and reports an empty draft inventory', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'redline-checklist-'));
  try {
    const input = join(dir, 'fixture.csv');
    const output = join(dir, 'checklist.md');
    await writeFile(input, 'evidence_id,material,review_status,source_key,source_locator\nA,Film,draft,NASA,Fig. 2\n');
    await generateChecklist({ input, output, sources: { NASA: { title: 'NASA paper', url: 'https://ntrs.nasa.gov/a' } } });
    assert.match(await readFile(output, 'utf8'), /https:\/\/ntrs.nasa.gov\/a/);
    await writeFile(input, 'evidence_id,material,review_status,source_key\nA,Film,verified,NASA\n');
    await generateChecklist({ input, output, sources: {} });
    assert.match(await readFile(output, 'utf8'), /No draft evidence rows/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
