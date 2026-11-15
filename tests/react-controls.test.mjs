import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

test('production React Aria controls retain workspace initialization, selection, disabled and lazy model behavior', async () => {
  const dom = new JSDOM(await readFile('index.html', 'utf8'), { url: 'https://example.org/REDLINE/' });
  const { window } = dom;
  const originals = new Map();
  for (const name of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLButtonElement', 'Element', 'Node', 'SVGElement', 'MutationObserver', 'Event', 'MouseEvent', 'KeyboardEvent', 'getComputedStyle']) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, value: typeof window[name] === 'function' && name === 'getComputedStyle' ? window[name].bind(window) : window[name] });
  }
  const { mountReactControls } = await import('../src/vendor/react-controls.js');
  const { mountWorkspace } = await import('../src/ui/workspace.js');
  let workspace, roots = [];
  try {
    const ids = [...document.querySelectorAll('#workspace-toolbar button')].map(b => b.id);
    roots = mountReactControls();
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
    assert.equal(document.getElementById('ws-narrow-controls').getAttribute('aria-label'), 'Narrow controls pane');
    let loads = 0;
    workspace = mountWorkspace({ document, window, storage: window.localStorage, motion: null,
      loadViewer: async () => { loads++; return { mountRoverViewer: async () => ({ update() {}, setVisible() {}, destroy() {} }) }; } });
    const click = id => document.getElementById(id).click();
    assert.equal(loads, 0);
    click('ws-widen-controls');
    assert.equal(workspace.getPrefs().controls, 300);
    click('ws-toggle-controls');
    assert.equal(workspace.getPrefs().controlsOpen, false);
    click('ws-density-compact');
    assert.equal(workspace.getPrefs().density, 'compact');
    const compact = document.getElementById('ws-density-compact');
    compact.dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal(compact.getAttribute('aria-pressed'), 'true', 'Aria internal renders preserve imperative pressed state');
    compact.disabled = true;
    click('ws-density-comfortable');
    compact.dispatchEvent(new window.MouseEvent('mouseout', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, 20));
    click('ws-density-compact');
    assert.equal(compact.disabled, true);
    assert.equal(workspace.getPrefs().density, 'comfortable', 'disabled native click is suppressed');
    compact.disabled = false;
    click('ws-density-compact');
    assert.equal(workspace.getPrefs().density, 'compact');
    click('ws-view-model');
    await workspace.viewerReady();
    assert.equal(loads, 1);
    assert.equal(document.getElementById('ws-view-model').getAttribute('aria-pressed'), 'true');
    click('ws-reset');
    assert.equal(workspace.getPrefs().view, 'evidence');
    assert.equal(document.getElementById('ws-view-model').getAttribute('aria-pressed'), 'false');
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
