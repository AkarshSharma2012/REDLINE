import { createElement, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Button } from 'react-aria-components';
import { PanelLeft, PanelRight, Minus, Plus, Rows3, List, Box, RotateCcw, SlidersHorizontal } from 'lucide-react';

const icons = {
  'ws-toggle-controls': PanelLeft, 'ws-toggle-sources': PanelRight,
  'ws-narrow-controls': Minus, 'ws-narrow-sources': Minus,
  'ws-widen-controls': Plus, 'ws-widen-sources': Plus,
  'ws-density-comfortable': Rows3, 'ws-density-compact': List,
  'ws-view-evidence': List, 'ws-view-model': Box, 'ws-reset': RotateCcw,
  'ws-jump-controls': SlidersHorizontal, 'ws-jump-sources': PanelRight, 'ws-jump-visual': List,
};

function WorkspaceButton({ attributes, text, Icon }) {
  // These attributes belong to the imperative workspace. Never pass snapshots of
  // disabled/aria-pressed as React props: Aria's hover/press renders must not
  // restore stale values after the workspace changes them. Native disabled
  // remains the browser's click/keyboard gate. Set once before handlers attach.
  const initialize = useCallback(node => {
    if (!node) return;
    for (const [name, value] of attributes) node.setAttribute(name, value);
  }, [attributes]);
  return createElement(Button, {
    ref: initialize, type: 'button',
    className: attributes.find(([name]) => name === 'class')?.[1] ?? '',
  }, createElement(Icon, {
    size: 14, 'aria-hidden': true, focusable: false,
    style: { verticalAlign: 'middle', marginInlineEnd: '0.35em', pointerEvents: 'none' },
  }), text);
}

/** Synchronous, idempotent enhancement; call before main/workspace handlers. */
export function mountReactControls(doc = globalThis.document) {
  const roots = [];
  if (!doc?.querySelectorAll) return roots;
  for (const old of doc.querySelectorAll('#workspace-toolbar button')) {
    const Icon = icons[old.id];
    if (!Icon || old.closest('.react-control-host')) continue;
    const attributes = [...old.attributes].map(a => [a.name, a.value]);
    const host = doc.createElement('span');
    host.className = 'react-control-host';
    host.style.display = 'contents';
    old.replaceWith(host);
    const root = createRoot(host);
    flushSync(() => root.render(createElement(WorkspaceButton, { attributes, text: old.textContent, Icon })));
    roots.push(root);
  }
  return roots;
}
