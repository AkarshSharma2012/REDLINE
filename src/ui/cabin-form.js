import { element, sourceLink, styleUI } from './results-table.js';
import { renderBomImport } from './bom-import.js';

/** Explicit fixture-only stub. It never invents measurements or infers a cabin outcome. */
export function labelCabin(query, fixture) {
  if (!fixture?.ui_fixture || !Array.isArray(fixture.ui_results)) throw new Error('A UI fixture is required by the stub');
  return query.materials.map(item => {
    const result = fixture.ui_results.find(r => r.material_id === item.material_id) || fixture.ui_default_result;
    if (!result) throw new Error('UI fixture result unavailable');
    const output = { ...structuredClone(result), material_id: item.material_id };
    if (query.conditions?.gravity_g === 0.16 && !output.estimate) {
      output.estimate = { g0: structuredClone(result), g1: structuredClone(result) };
      output.cross_gravity = true;
    }
    return output;
  });
}

let instance = 0;
/** Compatible with B1 scaffold; inject real labelCabin once the engine is available.
 * onEvaluate(results, query), onChange(query); controller.destroy() removes the form.
 */
export function renderCabinForm(root, options = {}) {
  const { materials = [], presets = [], sources = {}, evidence,
    onChange, onEvaluate, evaluate = labelCabin } = options;
  const d = root.ownerDocument, prefix = `cabin-${++instance}`;
  styleUI(root);
  let nextId = 0, removed;
  const form = element(d, 'form'); form.noValidate = true;
  form.append(element(d, 'h2', 'Cabin Check'), element(d, 'p', 'Illustrative scenario — evidence review, not cabin certification. PSI means NASA’s Physical Sciences Informatics data repository.'));
  const errors = element(d, 'div'); errors.setAttribute('role', 'alert');
  const status = element(d, 'p'); status.setAttribute('role', 'status');
  const controls = {};
  function field(parent, key, title, type = 'text', choices) {
    const group = element(d, 'div'), id = `${prefix}-${key}`;
    const label = element(d, 'label', title); label.htmlFor = id;
    const input = element(d, choices ? 'select' : 'input'); input.id = id; input.name = key;
    if (choices) for (const [value, text] of choices) { const option = element(d, 'option', text); option.value = value; input.append(option); }
    else input.type = type;
    const error = element(d, 'p'); error.id = `${id}-error`;
    input.setAttribute('aria-describedby', error.id);
    group.append(label, input, error); parent.append(group);
    return { input, error };
  }
  controls.name = field(form, 'name', 'Scenario name'); controls.name.input.value = 'Lunar pressurized rover cabin';
  controls.context = field(form, 'context', 'Scenario context', null, [['rover', 'Rover'], ['habitat', 'Habitat']]);
  const presetGroup = element(d, 'fieldset'); presetGroup.append(element(d, 'legend', 'Atmosphere presets')); form.append(presetGroup);
  const presetSource = element(d, 'div');
  const presetButtons = [];
  for (const preset of presets) {
    const button = element(d, 'button', preset.label); button.type = 'button'; button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => applyPreset(preset)); presetGroup.append(button); presetButtons.push([button, preset]);
  }
  presetGroup.append(presetSource);
  controls.o2 = field(form, 'o2', 'Oxygen (% by volume: oxygen’s share of the cabin gas)', 'number');
  controls.o2.input.min = '0'; controls.o2.input.max = '100'; controls.o2.input.step = 'any';
  controls.pressure = field(form, 'pressure', 'Absolute pressure', 'number'); controls.pressure.input.step = 'any';
  controls.unit = field(form, 'unit', 'Pressure unit', null, [['kpa', 'kPa'], ['psia', 'psia']]);
  const pressureNote = element(d, 'p'); form.append(pressureNote);
  controls.flow = field(form, 'flow', 'Forced airflow (cm/s; blank = not specified)', 'number'); controls.flow.input.min = '0'; controls.flow.input.step = 'any';
  controls.direction = field(form, 'direction', 'Airflow direction relative to flame spread', null,
    [['', 'Not specified'], ['opposed', 'Opposed'], ['concurrent', 'Concurrent'], ['quiescent', 'Quiescent'], ['upward-buoyant', 'Upward-buoyant']]);
  controls.gravity = field(form, 'gravity', 'Gravity context', null, [['0.16', 'Lunar scenario (0.16 g, estimate)'], ['0', 'Microgravity reference (0 g)'], ['1', 'Earth reference (1 g)']]);
  const list = element(d, 'div'); form.append(list);
  const items = [];
  const importer = renderBomImport(form, { materials, onImport: lines => {
    for (const line of lines) addItem({ ...line, thickness: line.thickness_mm, width: line.width_mm });
    changed();
  } });
  const add = element(d, 'button', 'Add material'); add.type = 'button';
  const undo = element(d, 'button', 'Undo removal'); undo.type = 'button'; undo.hidden = true;
  const submit = element(d, 'button', 'Evaluate cabin'); submit.type = 'submit'; submit.disabled = true;
  const empty = element(d, 'p', 'Add a material to compare evidence');
  empty.id = `${prefix}-empty`;
  submit.setAttribute('aria-describedby', empty.id);
  form.append(empty);
  form.append(add, undo, submit, errors, status);
  function addItem(values = {}) {
    const id = values.item_id || `${prefix}-item-${++nextId}`;
    const group = element(d, 'fieldset'); group.append(element(d, 'legend', 'Material and use'));
    const entry = { item_id: id, group, quantity: values.quantity ?? null, note: values.note ?? '',
      importedMaterial: values.material_recognised === false ? values.material_id : null };
    entry.material = field(group, `${id}-material`, 'Material', null, [['', 'Choose material'], ...materials.map(m => [m.material_id, m.display_name])]);
    if (entry.importedMaterial) {
      const option = element(d, 'option', `${values.name} — material not recognised; not found in the sources reviewed`);
      option.value = entry.importedMaterial; entry.material.input.append(option);
    }
    if (values.quantity != null) group.append(element(d, 'p', `Quantity (user input): ${values.quantity}`));
    if (values.note) group.append(element(d, 'p', `Note (user input): ${values.note}`));
    entry.name = field(group, `${id}-name`, 'Item name');
    entry.use = field(group, `${id}-use`, 'How it is used / location');
    entry.grade = field(group, `${id}-grade`, 'Exact grade / product (optional)');
    entry.form = field(group, `${id}-form`, 'Physical form', null, [['', 'Not specified'], ...['sheet', 'rod', 'fabric', 'tape', 'wire', 'slab', 'foam', 'other'].map(v => [v, v])]);
    entry.thickness = field(group, `${id}-thickness`, 'Thickness / diameter (mm; optional)', 'number');
    entry.width = field(group, `${id}-width`, 'Exposed width (mm; optional)', 'number');
    for (const key of ['thickness', 'width']) { entry[key].input.step = 'any'; entry[key].input.min = '0'; }
    for (const key of ['name', 'use', 'grade', 'form', 'thickness', 'width']) entry[key].input.value = values[key] ?? '';
    entry.material.input.value = values.material_id || '';
    const remove = element(d, 'button', 'Remove material'); remove.type = 'button';
    remove.addEventListener('click', () => {
      const index = items.indexOf(entry); removed = { entry, index }; items.splice(index, 1); group.remove();
      undo.hidden = false; submit.disabled = !items.length; changed(); add.focus();
      empty.hidden = !!items.length;
    });
    group.append(remove); items.push(entry); list.append(group); submit.disabled = false;
    empty.hidden = true;
    return entry;
  }
  function number(control, title, { optional = false, min = 0, strict = false, max = Infinity } = {}, messages = []) {
    const raw = control.input.value.trim(), value = raw === '' ? null : Number(raw);
    const invalid = !!control.input.validity?.badInput || (value === null && !optional) || (value !== null && (!Number.isFinite(value) || (strict ? value <= min : value < min) || value > max));
    control.error.textContent = invalid ? `Error: ${title}` : '';
    control.input.setAttribute('aria-invalid', String(invalid));
    if (invalid) messages.push({ input: control.input, message: title });
    return value;
  }
  function read() {
    const messages = [];
    const o2 = number(controls.o2, 'Enter oxygen from 0 to 100%.', { max: 100 }, messages);
    const pressure = number(controls.pressure, 'Enter pressure greater than zero.', { strict: true }, messages);
    const flow = number(controls.flow, 'Enter nonnegative airflow or leave blank.', { optional: true }, messages);
    controls.direction.error.textContent = '';
    controls.direction.input.setAttribute('aria-invalid', 'false');
    if (flow > 0 && controls.direction.input.value === 'quiescent') {
      controls.direction.error.textContent = 'Error: Quiescent conflicts with nonzero forced airflow.';
      controls.direction.input.setAttribute('aria-invalid', 'true');
      messages.push({ input: controls.direction.input, message: 'Quiescent conflicts with nonzero forced airflow.' });
    }
    const lines = items.map(entry => {
      const material_id = entry.material.input.value;
      const invalid = !materials.some(m => m.material_id === material_id) && material_id !== entry.importedMaterial;
      entry.material.error.textContent = invalid ? 'Error: Choose a material in the material list.' : '';
      entry.material.input.setAttribute('aria-invalid', String(invalid));
      if (invalid) messages.push({ input: entry.material.input, message: 'Choose a material in the material list.' });
      return { item_id: entry.item_id, material_id, name: entry.name.input.value, use: entry.use.input.value,
        quantity: entry.quantity, note: entry.note,
        material_grade: entry.grade.input.value || null, form: entry.form.input.value || null,
        thickness_mm: number(entry.thickness, 'Enter positive thickness or leave blank.', { optional: true, strict: true }, messages),
        width_mm: number(entry.width, 'Enter positive width or leave blank.', { optional: true, strict: true }, messages) };
    });
    const kpa = pressure == null ? null : pressure * (controls.unit.input.value === 'psia' ? 6.894757293 : 1);
    pressureNote.textContent = kpa == null ? 'Pressure not specified' : `${kpa.toFixed(2)} kPa (${(kpa / 6.894757293).toFixed(2)} psia)`;
    return { messages, query: { name: controls.name.input.value, context: controls.context.input.value,
      conditions: { o2_pct: o2, pressure_kpa: kpa, flow_speed_cm_s: flow, flow_direction: controls.direction.input.value || null,
        gravity_g: Number(controls.gravity.input.value), external_heat_flux_kw_m2: null }, materials: lines } };
  }
  function changed() {
    revision++;
    status.textContent = 'Inputs changed. Evaluate cabin to update results.';
    const { query, messages } = read();
    const active = presetButtons.find(([, preset]) => Math.abs(query.conditions.pressure_kpa - preset.pressure_kpa) < 1e-8 && query.conditions.o2_pct === preset.o2_pct);
    for (const [button] of presetButtons) button.setAttribute('aria-pressed', String(button === active?.[0]));
    if (active) {
      presetSource.replaceChildren(sourceLink(d, sources[active[1].source_key], active[1].source_locator));
    } else {
      presetSource.textContent = 'Custom atmosphere (user input). Pre-breathe duration not found in the sources reviewed for this pairing.';
    }
    onChange?.(query, { valid: !messages.length, stale: true });
  }
  function applyPreset(preset) {
    previousUnit = 'kpa';
    controls.unit.input.value = 'kpa'; controls.pressure.input.value = preset.pressure_kpa; controls.o2.input.value = preset.o2_pct;
    presetSource.replaceChildren(sourceLink(d, sources[preset.source_key], preset.source_locator));
    changed(); status.textContent = `Preset applied: ${preset.o2_pct}% oxygen and ${preset.pressure_kpa} kPa. Materials retained.`;
  }
  add.addEventListener('click', () => { const entry = addItem(); changed(); entry.material.input.focus(); });
  undo.addEventListener('click', () => {
    if (!removed) return;
    const { entry, index } = removed; items.splice(index, 0, entry); list.insertBefore(entry.group, list.children[index] || null);
    removed = null; undo.hidden = true; submit.disabled = false; changed(); entry.material.input.focus();
    empty.hidden = true;
  });
  form.addEventListener('input', changed);
  let previousUnit = controls.unit.input.value;
  form.addEventListener('change', event => {
    if (event.target === controls.unit.input) {
      const value = Number(controls.pressure.input.value);
      if (controls.pressure.input.value !== '' && Number.isFinite(value)) {
        const kpa = value * (previousUnit === 'psia' ? 6.894757293 : 1);
        controls.pressure.input.value = kpa / (controls.unit.input.value === 'psia' ? 6.894757293 : 1);
      }
      previousUnit = controls.unit.input.value;
    }
    if (event.target.tagName === 'SELECT') changed();
  });
  let revision = 0;
  form.addEventListener('submit', async event => {
    event.preventDefault(); errors.replaceChildren(); const { query, messages } = read();
    if (!items.length) return;
    if (messages.length) {
      errors.append(element(d, 'p', 'Correct the following fields:'));
      for (const { input, message } of messages) { const link = element(d, 'a', message); link.href = `#${input.id}`; errors.append(link, element(d, 'br')); }
      messages[0].input.focus(); return;
    }
    const current = ++revision;
    status.textContent = 'Updating for these conditions';
    try {
      const results = await evaluate(query, evidence);
      if (current !== revision) return;
      status.textContent = evaluate === labelCabin ? 'UI fixture preview — synthetic checks, not scientific results.' : 'Results updated for these conditions.';
      onEvaluate?.(results, query, { fixture: evaluate === labelCabin });
    } catch (error) { if (current === revision) status.textContent = `Evaluation unavailable: ${error.message}. Evaluate cabin to retry.`; }
  });
  // An edit invalidates pending async engine work, without moving focus.
  form.addEventListener('input', () => { revision++; });
  form.addEventListener('change', () => { revision++; });
  root.replaceChildren(form);
  const initial = presets.find(p => p.o2_pct === 34) || presets[0];
  if (initial) applyPreset(initial);
  for (const item of options.items || []) addItem(item);
  if (!items.length) status.textContent = 'Add a material to compare evidence';
  return { getQuery: () => read().query, addItem, destroy: () => { revision++; importer.destroy(); root.replaceChildren(); } };
}
