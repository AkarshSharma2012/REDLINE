import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

test('production React Aria controls retain workspace initialization, selection, disabled and lazy model behavior', async () => {
  const dom = new JSDOM(await readFile('index.html', 'utf8'), { url: 'https://example.org/REDLINE/' });
  const { window } = dom;
  const originals = new Map();
  for (const name of ['window', 'document', 'navigator', 'CSS', 'HTMLElement', 'HTMLButtonElement', 'Element', 'Node', 'SVGElement', 'MutationObserver', 'Event', 'MouseEvent', 'KeyboardEvent', 'getComputedStyle']) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, value: typeof window[name] === 'function' && name === 'getComputedStyle' ? window[name].bind(window) : window[name] });
  }
  const { mountReactControls } = await import('../src/vendor/react-controls.js');
  const { mountWorkspace } = await import('../src/ui/workspace.js');
  let workspace, roots = [];
  try {
    const ids = [...document.querySelectorAll('#workspace-toolbar button')].map(b => b.id);
    document.getElementById('ws-view-evidence').disabled = true;
    roots = mountReactControls();
    assert.deepEqual(ids, ['ws-view-model', 'ws-view-evidence'], 'stage view switch (#337)');
    assert.equal(roots.length, ids.length);
    assert.equal(mountReactControls().length, 0);
    for (const id of ids) {
      const b = document.getElementById(id);
      assert.equal(b.tagName, 'BUTTON');
      assert.equal(document.querySelectorAll(`#${id}`).length, 1);
      assert.equal(b.querySelector('svg').getAttribute('aria-hidden'), 'true');
      assert.ok(b.textContent.trim());
      assert.equal(b.querySelector('button'), null);
      assert.equal(b.parentElement.style.display, 'contents');
    }
    let loads = 0;
    workspace = mountWorkspace({ document, window, storage: window.localStorage, motion: null,
      loadViewer: async () => { loads++; return { mountRoverViewer: async () => ({ update() {}, setVisible() {}, destroy() {} }) }; } });
    const click = id => document.getElementById(id).click();
    assert.equal(loads, 0);
    click('ws-view-model');
    await workspace.viewerReady();
    assert.equal(loads, 1);
    const model = document.getElementById('ws-view-model');
    assert.equal(model.getAttribute('aria-pressed'), 'true');
    model.dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal(model.getAttribute('aria-pressed'), 'true', 'Aria internal renders preserve imperative pressed state');
    click('ws-view-evidence');
    assert.equal(workspace.getPrefs().view, 'model', 'initial disabled retained: native click is suppressed');
    document.getElementById('ws-view-evidence').disabled = false;
    click('ws-view-evidence');
    assert.equal(workspace.getPrefs().view, 'evidence', 'imperative enable works');
    assert.equal(model.getAttribute('aria-pressed'), 'false');
  } finally {
    workspace?.destroy();
    for (const root of roots) root.unmount();
    dom.window.close();
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
});

test('workspace child-combinator button selectors also match through display:contents React hosts', async () => {
  const css = await readFile('src/styles/workspace.css', 'utf8');
  for (const sel of ['.ws-seg > .react-control-host > button', '.ws-seg > .react-control-host + .react-control-host > button',
]) assert.ok(css.includes(sel), sel);
});
