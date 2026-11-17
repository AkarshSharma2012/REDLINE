// Minimal DOM for workspace tests: only the primitives the workspace modules use.
// Events are dispatched by calling the same listeners a browser would call.
export class El {
  constructor(tag, doc) {
    this.tagName = String(tag).toUpperCase();
    this.ownerDocument = doc;
    this.children = [];
    this.attrs = {};
    this.listeners = {};
    this.text = '';
    this.hidden = false;
    this.parentElement = null;
    const props = {};
    this.style = { props, setProperty(k, v) { props[k] = String(v); }, removeProperty(k) { delete props[k]; }, getPropertyValue(k) { return props[k] ?? ''; } };
  }
  get id() { return this.attrs.id ?? ''; }
  set id(v) { this.attrs.id = String(v); }
  get className() { return this.attrs.class ?? ''; }
  set className(v) { this.attrs.class = String(v); }
  set textContent(v) { this.text = String(v ?? ''); this.children = []; }
  get textContent() { return [this.text, ...this.children.map(c => c.textContent)].filter(Boolean).join(' '); }
  append(...nodes) {
    for (const n of nodes) {
      const node = typeof n === 'string' ? Object.assign(new El('#text', this.ownerDocument), { text: n }) : n;
      node.parentElement = this; this.children.push(node);
    }
  }
  replaceChildren(...nodes) { this.text = ''; this.children = []; this.append(...nodes); }
  remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(c => c !== this); this.parentElement = null; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return Object.hasOwn(this.attrs, k) ? this.attrs[k] : null; }
  hasAttribute(k) { return Object.hasOwn(this.attrs, k); }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); }
  removeEventListener(type, fn) { this.listeners[type] = (this.listeners[type] ?? []).filter(f => f !== fn); }
  dispatch(type, extra = {}) {
    const event = { type, target: this, currentTarget: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...extra };
    for (const fn of this.listeners[type] ?? []) fn(event);
    if (typeof this[`on${type}`] === 'function') this[`on${type}`](event);
    return event;
  }
  click() { return this.dispatch('click'); }
  focus() { this.ownerDocument.activeElement = this; }
  contains(node) { for (let n = node; n; n = n.parentElement) if (n === this) return true; return false; }
  setPointerCapture() {}
  releasePointerCapture() {}
  all(pred = () => true) {
    const test = typeof pred === 'string' ? (n => n.tagName === pred.toUpperCase()) : pred;
    return this.children.flatMap(c => [...(test(c) ? [c] : []), ...c.all(test)]);
  }
}

export function makeDoc() {
  const doc = {
    activeElement: null,
    createElement: tag => new El(tag, doc),
    createTextNode: text => Object.assign(new El('#text', doc), { text }),
    getElementById(id) { return doc.body.all(n => n.id === id)[0] ?? null; },
  };
  doc.body = new El('body', doc);
  return doc;
}

// Build the subset of index.html the workspace binds to (IDs only, as in the page).
export const WORKSPACE_IDS = ['panel-model', 'workspace-toolbar', 'ws-view-evidence', 'ws-view-model',
  'ws-pane-controls', 'ws-pane-sources', 'ws-pane-visual', 'ws-pane-detail', 'ws-inspector',
  'ws-sources', 'ws-materials', 'ws-source-detail', 'rover-viewer-root', 'ws-viewer-status',
  'ws-load-model', 'ws-stage-empty', 'ws-info-records', 'ws-info-selected'];

export function workspaceDoc() {
  const doc = makeDoc();
  const main = doc.createElement('main'); main.id = 'app-main'; doc.body.append(main);
  for (const id of WORKSPACE_IDS) {
    const tag = /^(ws-pane|ws-inspector|panel-)/.test(id) ? 'section' : /^ws-(view|load)/.test(id) ? 'button' : 'div';
    const el = doc.createElement(tag); el.id = id; main.append(el);
  }
  doc.getElementById('rover-viewer-root').hidden = true;
  return doc;
}

export function memoryStorage(initial = {}) {
  const data = { ...initial };
  return { data, getItem: k => (Object.hasOwn(data, k) ? data[k] : null), setItem: (k, v) => { data[k] = String(v); }, removeItem: k => { delete data[k]; } };
}
