import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from '../src/schema/csv.js';

test('quoted commas remain inside a field', () => {
  assert.deepEqual(parseCsv('id,note\n1,"alpha,beta"\n'), [
    { id: '1', note: 'alpha,beta' },
  ]);
});

for (const newline of ['\n', '\r\n']) {
  const label = newline === '\n' ? 'LF' : 'CRLF';

  test(`${label} record separators produce the same rows`, () => {
    const expected = [{ id: '1', note: 'first' }, { id: '2', note: 'second' }];
    for (const terminal of ['', newline]) {
      assert.deepEqual(parseCsv(['id,note', '1,first', '2,second'].join(newline) + terminal), expected);
    }
  });

  test(`embedded ${label} stays inside a quoted field`, () => {
    assert.deepEqual(parseCsv(`id,note${newline}1,"first${newline}second"${newline}2,end`), [
      { id: '1', note: `first${newline}second` },
      { id: '2', note: 'end' },
    ]);
  });
}

test('doubled quotes decode to literal quotes', () => {
  assert.deepEqual(parseCsv('id,note\n1,"""quoted"", then ""again"""'), [
    { id: '1', note: '"quoted", then "again"' },
  ]);
});

test('a UTF-8 BOM is removed before parsing the first quoted header', () => {
  const text = Buffer.from('\ufeff"id",note\n1,caf\u00e9', 'utf8').toString('utf8');
  assert.deepEqual(parseCsv(text), [{ id: '1', note: 'caf\u00e9' }]);
});

test('empty trailing fields survive with or without a terminal newline', () => {
  for (const terminal of ['', '\n', '\r\n']) {
    assert.deepEqual(parseCsv('id,note,extra\n1,,' + terminal), [
      { id: '1', note: '', extra: '' },
    ]);
    assert.deepEqual(parseCsv('id,note,extra\n1,"",""' + terminal), [
      { id: '1', note: '', extra: '' },
    ]);
  }
});

test('ragged rows with missing fields are rejected', () => {
  assert.throws(() => parseCsv('id,note\n1,ok\n2'),
    /CSV: data line 2 has 1 fields, header has 2/);
});

test('ragged rows with extra fields are rejected', () => {
  assert.throws(() => parseCsv('id,note\n1,ok,extra'),
    /CSV: data line 1 has 3 fields, header has 2/);
});

test('a very long quoted field is preserved without truncation', () => {
  const value = 'x'.repeat(1024 * 1024) + ',tail\n"end"';
  const encoded = value.replaceAll('"', '""');
  assert.deepEqual(parseCsv(`id,note\n1,"${encoded}"\n2,short`), [
    { id: '1', note: value },
    { id: '2', note: 'short' },
  ]);
});
