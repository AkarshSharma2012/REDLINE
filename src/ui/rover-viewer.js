// Lazy, on-demand Three.js viewer for the illustrative rover cabin with an HTML fallback.
// Interface (issue #277): mountRoverViewer(root, { onSelectMaterial }) ->
//   { update({ materialIds, selectedMaterialId, conditions }), setVisible(boolean), destroy() }.
// No browser globals at module level; the library is imported only inside mount.
import {
  ROVER_PARTS, normalizeViewerState, VIEW_DEFAULT, stepView, viewToPosition, keyToAction,
  readPrefs, writePrefs, capPixelRatio, isClick, pointerToNdc, createRenderScheduler,
} from './rover-model.js';
import { buildRoverScene } from './rover-scene.js';

export const VIEWER_CAPTION = 'Illustrative cabin model - not a fire simulation';
const CLEAR_COLOR = 0x16191e;
const ORBIT_DEG_PER_PX = 0.4;
let mountCount = 0;

const INERT = Object.freeze({ update() {}, setVisible() {}, destroy() {} });
const defaultLoadThree = () => import('../vendor/three/three.module.min.js');

function selectionText(state) {
  const { id, state: kind } = state.selection;
  if (kind === 'modeled') {
    const part = ROVER_PARTS.find(item => item.materialId === id);
    return `Selected: ${part.part} (${id}).`;
  }
  if (kind === 'not-in-request') return `Selected material ${id} is not in the current request; no part is highlighted.`;
  if (kind === 'not-modeled') return `Selected material ${id} has no part in this illustrative model; no part is highlighted.`;
  return 'No material selected. Choose a cabin part to select its material.';
}

export async function mountRoverViewer(root, { onSelectMaterial = () => {}, loadThree = defaultLoadThree } = {}) {
  const doc = root?.ownerDocument;
  if (!doc || typeof root.append !== 'function') return INERT;
  const win = doc.defaultView ?? null;
  const uid = `rover-viewer-${++mountCount}`;
  const cleanups = [];
  const glCleanups = []; // WebGL-only listeners/observers, released on fallback or destroy
  const listen = (target, type, fn, bucket = cleanups) => {
    target.addEventListener(type, fn);
    bucket.push(() => target.removeEventListener(type, fn));
  };
  const el = (tag, className, text) => {
    const node = doc.createElement(tag);
    if (className) node.setAttribute('class', className);
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const svg = (tag, attrs) => {
    const node = doc.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    return node;
  };

  // Module-relative stylesheet, added once, so the shell need not change global CSS.
  const head = doc.head;
  if (head && ![...head.children].some(node => node.getAttribute?.('data-rover-viewer-css') !== null)) {
    const link = el('link');
    link.rel = 'stylesheet';
    link.href = new URL('../styles/rover-viewer.css', import.meta.url).href;
    link.setAttribute('data-rover-viewer-css', '');
    head.append(link);
  }

  let state = normalizeViewerState();
  let selectedId = null;
  let prefs = { layer: 'cutaway', wireframe: false };
  let storage = null;
  try { storage = win?.localStorage ?? null; } catch { storage = null; }
  prefs = readPrefs(storage);
  let destroyed = false;
  let three = null; // { renderer, rover, camera, scheduler, ... } while WebGL is live

  // Skeleton: caption, stage (canvas or schematic), controls, material list, status.
  const shell = el('div', 'rover-viewer');
  shell.setAttribute('data-layer', prefs.layer);
  const caption = el('p', 'rover-viewer__caption', VIEWER_CAPTION);
  caption.id = `${uid}-caption`;
  const stage = el('div', 'rover-viewer__stage');
  const tools = el('div', 'rover-viewer__tools');
  tools.hidden = true;
  const listHeading = el('h3', 'rover-viewer__heading', 'Cabin materials');
  listHeading.id = `${uid}-materials`;
  const list = el('ul', 'rover-viewer__materials');
  list.setAttribute('aria-labelledby', listHeading.id);
  const extras = el('p', 'rover-viewer__extras');
  const selection = el('p', 'rover-viewer__selection');
  selection.setAttribute('aria-live', 'polite');
  const scenario = el('p', 'rover-viewer__scenario');
  const status = el('p', 'rover-viewer__status', 'Loading 3D view…');
  status.setAttribute('role', 'status');
  shell.append(caption, stage, tools, listHeading, list, extras, selection, scenario, status);
  root.append(shell);

  const buttons = new Map();
  const schematicZones = [];
  ROVER_PARTS.forEach((part, index) => {
    const item = el('li', 'rover-viewer__material');
    const button = el('button', 'rover-viewer__pick');
    button.type = 'button';
    button.setAttribute('data-material-id', part.materialId);
    button.setAttribute('aria-pressed', 'false');
    const number = el('span', 'rover-viewer__num', String(index + 1));
    number.setAttribute('aria-hidden', 'true');
    const name = el('span', 'rover-viewer__part', part.part);
    const id = el('span', 'rover-viewer__id', part.materialId);
    const note = el('span', 'rover-viewer__note');
    button.append(number, name, id, note);
    listen(button, 'click', () => select(part.materialId));
    item.append(button);
    list.append(item);
    buttons.set(part.materialId, { button, note });
  });

  function select(id) {
    if (destroyed || id === selectedId) return;
    if (!state.parts.some(part => part.materialId === id && part.inRequest)) return;
    selectedId = id;
    state = { ...state, selectedMaterialId: id, selection: { id, state: 'modeled' }, highlightId: id };
    render();
    try { onSelectMaterial(id); } catch { /* selection callback errors stay in the shell */ }
  }

  function render() {
    for (const part of state.parts) {
      const { button, note } = buttons.get(part.materialId);
      button.disabled = !part.inRequest;
      button.setAttribute('aria-pressed', String(part.materialId === state.highlightId));
      note.textContent = part.inRequest ? '' : 'not in current request';
    }
    extras.textContent = state.extraIds.length
      ? `Requested materials without a modeled part: ${state.extraIds.join(', ')}.` : '';
    selection.textContent = selectionText(state);
    scenario.textContent = state.conditions.length
      ? `Requested scenario (user input, not measured): ${state.conditions.map(row => row.text).join(' · ')}`
      : 'Requested scenario: not provided.';
    for (const node of schematicZones) {
      const id = node.getAttribute('data-material-id');
      node.setAttribute('class', `rover-viewer__zone${id === state.highlightId ? ' is-selected' : ''}${state.parts.find(p => p.materialId === id)?.inRequest ? '' : ' is-absent'}`);
    }
    if (three?.rover && three.scheduler) {
      three.rover.applyState({ highlightId: state.highlightId, inRequest: new Set(state.materialIds) });
      three.scheduler.invalidate();
    }
  }

  // HTML schematic side view used whenever WebGL is unavailable.
  function showSchematic(reason) {
    const figure = el('figure', 'rover-viewer__schematic');
    figure.setAttribute('data-rover-schematic', '');
    const drawing = svg('svg', { viewBox: '0 0 320 150', 'aria-hidden': 'true', focusable: 'false' });
    drawing.append(
      svg('rect', { x: 20, y: 22, width: 280, height: 92, rx: 6, class: 'rover-viewer__hull' }),
      ...[70, 160, 250].map(cx => svg('circle', { cx, cy: 122, r: 16, class: 'rover-viewer__wheel' })),
    );
    const zones = { pmma: [268, 34, 24, 40], nomex: [200, 62, 40, 40], p213: [80, 34, 140, 12], cotton: [60, 56, 40, 44] };
    ROVER_PARTS.forEach((part, index) => {
      const [x, y, width, height] = zones[part.materialId];
      const zone = svg('rect', { x, y, width, height, rx: 3, 'data-material-id': part.materialId, class: 'rover-viewer__zone' });
      const label = svg('text', { x: x + width / 2, y: y + height / 2 + 4, 'text-anchor': 'middle', class: 'rover-viewer__zone-num' });
      label.textContent = String(index + 1);
      schematicZones.push(zone);
      drawing.append(zone, label);
    });
    const note = el('figcaption', 'rover-viewer__schematic-note', 'Schematic side view, not to scale. Numbers match the material list.');
    figure.append(drawing, note);
    stage.replaceChildren(figure);
    tools.hidden = true;
    status.textContent = `3D view unavailable (${reason}). The schematic and material list below remain usable.`;
    render();
  }

  // --- WebGL path -----------------------------------------------------------
  let THREE = null;
  try { THREE = await loadThree(); } catch { THREE = null; }
  if (!THREE?.WebGLRenderer) showSchematic('the 3D library could not load');
  else if (!win?.requestAnimationFrame) showSchematic('this browser cannot draw 3D here');
  else {
    try { startWebGL(THREE); } catch { teardownWebGL(); showSchematic('WebGL is not available in this browser'); }
  }
  render();

  function startWebGL(T) {
    const canvas = el('canvas', 'rover-viewer__canvas');
    canvas.setAttribute('tabindex', '0');
    canvas.setAttribute('role', 'application');
    canvas.setAttribute('aria-roledescription', '3D cabin view');
    canvas.setAttribute('aria-label', 'Illustrative rover cabin, 3D cutaway view');
    const help = el('p', 'rover-viewer__help', 'With the view focused: arrow keys orbit, + and - zoom, Home resets. Drag to orbit; click a part to select it.');
    help.id = `${uid}-help`;
    canvas.setAttribute('aria-describedby', `${caption.id} ${help.id}`);
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
    three = { renderer, canvas };
    renderer.setClearColor(CLEAR_COLOR, 1);
    renderer.setPixelRatio(capPixelRatio(win.devicePixelRatio));
    const rover = buildRoverScene(T);
    three.rover = rover;
    const camera = new T.PerspectiveCamera(40, 1, 0.1, 100);
    const raycaster = new T.Raycaster();
    const projected = new T.Vector3();
    let view = { ...VIEW_DEFAULT };
    let size = { width: 0, height: 0 };

    const callouts = el('div', 'rover-viewer__callouts');
    callouts.setAttribute('aria-hidden', 'true');
    const badges = new Map(ROVER_PARTS.map((part, index) => {
      const badge = el('span', 'rover-viewer__badge', String(index + 1));
      callouts.append(badge);
      return [part.materialId, badge];
    }));

    const draw = () => {
      if (!size.width || !size.height) return;
      const vfov = camera.fov * Math.PI / 180;
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
      const fit = rover.radius / Math.sin(Math.min(vfov, hfov) / 2);
      const p = viewToPosition(view);
      const scale = fit * 0.92 / VIEW_DEFAULT.distance;
      camera.position.set(rover.center.x + p.x * scale, rover.center.y + p.y * scale, rover.center.z + p.z * scale);
      camera.lookAt(rover.center);
      camera.updateMatrixWorld();
      renderer.render(rover.scene, camera);
      for (const [id, badge] of badges) {
        projected.copy(rover.anchors.get(id)).project(camera);
        const visible = projected.z < 1 && state.materialIds.includes(id);
        badge.hidden = !visible;
        badge.style.transform = `translate(${((projected.x + 1) / 2) * size.width}px, ${((1 - projected.y) / 2) * size.height}px)`;
      }
    };
    const scheduler = createRenderScheduler({
      request: fn => win.requestAnimationFrame(fn), cancel: id => win.cancelAnimationFrame(id), render: draw,
    });
    Object.assign(three, { camera, scheduler });

    const setView = next => { view = next; scheduler.invalidate(); };
    const button = (label, text, onClick, pressed) => {
      const node = el('button', 'rover-viewer__tool', text);
      node.type = 'button';
      if (label !== text) node.setAttribute('aria-label', label);
      if (pressed !== undefined) node.setAttribute('aria-pressed', String(pressed));
      listen(node, 'click', () => onClick(node), glCleanups);
      return node;
    };
    const group = (label, ...nodes) => {
      const wrap = el('div', 'rover-viewer__group');
      wrap.setAttribute('role', 'group');
      wrap.setAttribute('aria-label', label);
      wrap.append(el('span', 'rover-viewer__group-label', label), ...nodes);
      return wrap;
    };
    const savePrefs = () => { writePrefs(storage, prefs); shell.setAttribute('data-layer', prefs.layer); };
    tools.replaceChildren(
      group('Orbit', ...[['left', 'Left'], ['right', 'Right'], ['up', 'Up'], ['down', 'Down']]
        .map(([action, text]) => button(`Orbit ${action}`, text, () => setView(stepView(view, action))))),
      group('Zoom', button('Zoom in', 'Zoom in', () => setView(stepView(view, 'in'))),
        button('Zoom out', 'Zoom out', () => setView(stepView(view, 'out'))),
        button('Reset view', 'Reset view', () => setView(stepView(view, 'reset')))),
      group('Layers',
        button('Show outer shell', 'Outer shell', node => {
          prefs = { ...prefs, layer: prefs.layer === 'shell' ? 'cutaway' : 'shell' };
          node.setAttribute('aria-pressed', String(prefs.layer === 'shell'));
          rover.setLayer(prefs.layer); savePrefs(); scheduler.invalidate();
        }, prefs.layer === 'shell'),
        button('Wireframe', 'Wireframe', node => {
          prefs = { ...prefs, wireframe: !prefs.wireframe };
          node.setAttribute('aria-pressed', String(prefs.wireframe));
          rover.setWireframe(prefs.wireframe); savePrefs(); scheduler.invalidate();
        }, prefs.wireframe)),
    );
    rover.setLayer(prefs.layer);
    rover.setWireframe(prefs.wireframe);

    // Keys act only while the canvas has focus; Tab is never captured.
    listen(canvas, 'keydown', event => {
      const action = event.altKey || event.ctrlKey || event.metaKey ? null : keyToAction(event.key);
      if (!action) return;
      event.preventDefault();
      setView(stepView(view, action));
    }, glCleanups);

    // Pointer: drag orbits, a short press selects. Capture is always released.
    let drag = null;
    const endDrag = () => {
      if (drag && canvas.hasPointerCapture?.(drag.id)) canvas.releasePointerCapture(drag.id);
      drag = null;
    };
    glCleanups.push(endDrag);
    listen(canvas, 'pointerdown', event => {
      if (event.button !== 0 || drag) return;
      drag = { id: event.pointerId, start: { x: event.clientX, y: event.clientY }, last: { x: event.clientX, y: event.clientY }, moved: false };
      canvas.setPointerCapture?.(event.pointerId);
    }, glCleanups);
    listen(canvas, 'pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const point = { x: event.clientX, y: event.clientY };
      if (!drag.moved && isClick(drag.start, point)) return;
      drag.moved = true;
      setView(stepView({ ...view, azimuth: view.azimuth - (point.x - drag.last.x) * ORBIT_DEG_PER_PX,
        elevation: view.elevation + (point.y - drag.last.y) * ORBIT_DEG_PER_PX }, 'none'));
      drag.last = point;
    }, glCleanups);
    listen(canvas, 'pointerup', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const wasClick = !drag.moved;
      endDrag();
      if (!wasClick) return;
      const ndc = pointerToNdc(event.clientX, event.clientY, canvas.getBoundingClientRect());
      if (!ndc) return;
      raycaster.setFromCamera(ndc, camera);
      const targets = [...rover.pickables, ...rover.occluders].filter(mesh => mesh.visible);
      const hit = raycaster.intersectObjects(targets, false)[0];
      const id = hit?.object.userData.materialId;
      if (id) select(id);
    }, glCleanups);
    listen(canvas, 'pointercancel', endDrag, glCleanups);
    listen(canvas, 'lostpointercapture', () => { drag = null; }, glCleanups);
    listen(canvas, 'webglcontextlost', () => {
      teardownWebGL();
      showSchematic('the graphics context was lost');
    }, glCleanups);

    // Fit width and height; skip 0x0 (hidden) and redraw when visible again.
    const Observer = win.ResizeObserver;
    const resize = (width, height) => {
      if (!(width > 0) || !(height > 0)) { size = { width: 0, height: 0 }; return; }
      size = { width, height };
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      scheduler.invalidate();
    };
    if (Observer) {
      const observer = new Observer(entries => {
        const box = entries[entries.length - 1].contentRect;
        resize(Math.round(box.width), Math.round(box.height));
      });
      observer.observe(stage);
      glCleanups.push(() => observer.disconnect());
    } else {
      resize(stage.clientWidth, stage.clientHeight);
    }

    stage.replaceChildren(canvas, callouts);
    tools.hidden = false;
    tools.append(help);
    status.textContent = '3D view ready. Use the buttons, keys or drag to orbit; select a part or a list item.';
  }

  function teardownWebGL() {
    if (!three) return;
    const { renderer, rover, scheduler, canvas } = three;
    three = null;
    scheduler?.destroy();
    while (glCleanups.length) glCleanups.pop()();
    rover?.dispose();
    renderer.dispose();
    renderer.forceContextLoss?.();
    canvas.remove?.();
  }

  return {
    update(next = {}) {
      if (destroyed) return;
      state = normalizeViewerState(next);
      selectedId = state.highlightId;
      render();
    },
    setVisible(visible) {
      if (destroyed) return;
      shell.hidden = !visible;
      three?.scheduler.setActive(Boolean(visible));
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      teardownWebGL();
      while (cleanups.length) cleanups.pop()();
      root.replaceChildren();
    },
  };
}
