// Issue #316: records the real REDLINE UI (index.html over file://, no server) in
// headless Edge via the DevTools protocol, then builds a 30.000 s MP4 with ffmpeg.
// The browser is always killed in `finally`; nothing keeps running after exit.
// Usage: node tools/demo-video/capture.mjs <outDir>
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const OUT = resolve(process.argv[2] || 'docs/demo');
const FRAMES = mkdtempSync(join(tmpdir(), 'redline-frames-'));
const PROFILE = mkdtempSync(join(tmpdir(), 'redline-edge-'));
const W = 1280, H = 720, TOTAL = 30;
const sleep = ms => new Promise(r => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

// Caption cues (seconds). Wording follows AGENTS.md science rules.
export const CUES = [
  [0, 4, 'REDLINE: NASA PSI combustion records. 45 records loaded, all draft, 0 human verified.'],
  [4, 8, 'Load the lunar rover demo: an illustrative cabin, requested at 0.16 g (lunar).'],
  [8, 13, 'Select the acrylic (PMMA) panel on the model. The model is navigation, not a fire simulation.'],
  [13, 20, 'NASA source PSI25-B1 (BASS-II, PSI-25): 0.1 mm PMMA thin film; ignited in ISS microgravity (0 g) testing.'],
  [20, 25, 'Requested panel is at lunar gravity; no lunar data. Record is draft, so the cabin result stays unavailable.'],
  [25, 30, 'Same selection via the HTML item list fallback. Source: NASA PSI Data Repository, psi.nasa.gov.'],
];

const edge = spawn(EDGE, [
  '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${PROFILE}`,
  '--allow-file-access-from-files', '--enable-unsafe-swiftshader', '--use-angle=swiftshader',
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', `--window-size=${W},${H}`, 'about:blank',
], { stdio: 'ignore' });

let ws, id = 0; const pending = new Map(); const frames = [];
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const msg = { id: ++id, method, params }; if (sessionId) msg.sessionId = sessionId;
  pending.set(msg.id, { res, rej }); ws.send(JSON.stringify(msg));
});

try {
  const portFile = join(PROFILE, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100);
  let port, path; // the file can be briefly locked while Edge writes it
  for (let i = 0; i < 50 && !path; i++) { try { [port, path] = readFileSync(portFile, 'utf8').split('\n'); } catch { await sleep(100); } }
  ws = new WebSocket(`ws://127.0.0.1:${port}${path}`);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let S;
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
    if (m.method === 'Page.screencastFrame') {
      frames.push({ t: m.params.metadata.timestamp, recv: Date.now() / 1000, data: m.params.data });
      send('Page.screencastFrameAck', { sessionId: m.params.sessionId }, S).catch(() => {});
    }
  };
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  ({ sessionId: S } = await send('Target.attachToTarget', { targetId, flatten: true }));
  const cdp = (m, p) => send(m, p, S);
  await cdp('Page.enable'); await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  const js = async expr => {
    const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(`${expr.slice(0, 80)}: ${r.exceptionDetails.exception?.description}`);
    return r.result.value;
  };
  const waitFor = async (expr, ms = 8000) => { for (let t = 0; t < ms; t += 100) { if (await js(expr)) return; await sleep(100); } throw new Error(`timeout: ${expr}`); };
  const clickXY = async (x, y) => {
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased'])
      await cdp('Input.dispatchMouseEvent', { type, x, y, button: type === 'mouseMoved' ? 'none' : 'left', clickCount: 1, pointerType: 'mouse' });
  };
  const clickSel = async expr => {
    const box = await js(`(()=>{const e=${expr}; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    if (!box) throw new Error(`not found: ${expr}`);
    await clickXY(box.x, box.y);
  };

  await cdp('Page.navigate', { url: pathToFileURL(resolve('index.html')).href });
  await waitFor(`document.querySelector('#rover-demo') && !document.querySelector('#rover-demo').disabled`, 15000);
  await sleep(800);
  await cdp('Page.startScreencast', { format: 'jpeg', quality: 85, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  const t0 = Date.now(); const at = async s => { const d = t0 + s * 1000 - Date.now(); if (d > 0) await sleep(d); };
  const log = [];
  const facts = { rows: await js(`document.querySelector('#rail-rows').textContent`), verified: await js(`document.querySelector('#rail-verified').textContent`) };

  // 4 s: load lunar rover demo
  await at(4); await clickSel(`document.querySelector('#rover-demo')`); log.push('rover-demo' + '@' + ((Date.now() - t0) / 1000).toFixed(1));
  // 8 s: open model, select acrylic on the model itself (canvas pick, SVG schematic if no WebGL)
  await at(7); await clickSel(`document.querySelector('#ws-view-model') || document.querySelector('#ws-load-model')`);
  const loadModel = await js(`!!(document.querySelector('#ws-load-model') && document.querySelector('#ws-load-model').offsetParent)`);
  if (loadModel) await clickSel(`document.querySelector('#ws-load-model')`);
  await waitFor(`!!document.querySelector('#rover-viewer-root canvas, [data-rover-schematic]')`, 10000);
  await at(9.5);
  const hasCanvas = await js(`!!document.querySelector('#rover-viewer-root canvas') && getComputedStyle(document.querySelector('#rover-viewer-root canvas')).display!=='none'`);
  let picked = false;
  if (hasCanvas) {
    // Scan the canvas for the point whose pick selects pmma (real pointer clicks).
    const box = await js(`(()=>{const c=document.querySelector('#rover-viewer-root canvas'); c.scrollIntoView({block:'center'}); const r=c.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height};})()`);
    const sel = `document.querySelector('#ws-info-selected').textContent`;
    outer: for (let gy = 0.3; gy <= 0.7; gy += 0.1) for (let gx = 0.15; gx <= 0.9; gx += 0.08) {
      await clickXY(box.x + box.w * gx, box.y + box.h * gy); await sleep(60);
      if (/pmma|window|acrylic/i.test(await js(sel))) { picked = true; break outer; }
    }
  }
  if (!picked) {
    await clickSel(`document.querySelector('[data-rover-schematic] [data-material-id="pmma"]')`);
    picked = /pmma|window|acrylic/i.test(await js(`document.querySelector('#ws-info-selected').textContent`));
    log.push('schematic-pick' + '@' + ((Date.now() - t0) / 1000).toFixed(1));
  } else log.push('canvas-pick' + '@' + ((Date.now() - t0) / 1000).toFixed(1));
  // 13 s: open PSI25-B1 NASA source record
  await at(13);
  await clickSel(`[...document.querySelectorAll('.ws-card')].find(b=>/PSI25-B1\\b/.test(b.textContent))`); log.push('PSI25-B1' + '@' + ((Date.now() - t0) / 1000).toFixed(1));
  await sleep(500);
  await js(`(()=>{const d=document.querySelector('#ws-source-detail'); d && d.scrollIntoView({block:'start'}); })()`);
  // 20 s: show draft status and unavailable cabin result
  await at(20);
  await js(`(()=>{const d=document.querySelector('#ws-results-disclosure'); if(d){d.open=true; const t=document.querySelector('#results-table')||d; t.scrollIntoView({block:'end'}); for(let a=t.parentElement;a;a=a.parentElement){ if(a.scrollHeight>a.clientHeight+4 && getComputedStyle(a).overflowY!=='visible') a.scrollTop=a.scrollHeight; }} const e=document.querySelector('#evidence-panel'); e && e.scrollIntoView({block:'start'});})()`);
  // 25 s: repeat selection via HTML item list fallback
  await at(25);
  await clickSel(`document.querySelector('.rover-viewer__materials [data-material-id="pmma"], #ws-materials [data-material-id="pmma"], .ws-material')`); log.push('html-list' + '@' + ((Date.now() - t0) / 1000).toFixed(1));
  await sleep(2000);
  await js(`(()=>{const b=document.querySelector('.rover-viewer__materials [data-material-id="pmma"]'); b && b.scrollIntoView({block:'start'});})()`);
  const detailText = await js(`(document.querySelector('#ws-source-detail')?.innerText||'') + '\\n---\\n' + (document.querySelector('#results-table')?.innerText||'')`);
  await at(TOTAL + 0.3);
  await cdp('Page.stopScreencast');
  await sleep(300);
  writeFileSync(join(OUT, 'capture-log.json'), JSON.stringify({ facts, steps: log, picked, hasCanvas, frames: frames.length, lagSeconds: frames.map(f => +(f.recv - f.t).toFixed(2)), detailText }, null, 2));

  // Write frames + concat list keyed to real screencast timestamps, trimmed to exactly 30 s.
  // Frame times are wall-clock receipt times relative to t0; frames before t0 collapse to 0.
  const start = t0 / 1000; let list = '';
  const rel = frames.map(f => Math.max(0, f.t - start));
  frames.forEach((f, i) => {
    if (rel[i + 1] === 0) return;
    const file = join(FRAMES, `f${String(i).padStart(5, '0')}.jpg`).replace(/\\/g, '/');
    writeFileSync(file, Buffer.from(f.data, 'base64'));
    const next = i + 1 < frames.length ? rel[i + 1] : TOTAL + 1;
    list += `file '${file}'\nduration ${Math.max(0.001, next - rel[i]).toFixed(3)}\n`;
    if (i + 1 === frames.length) list += `file '${file}'\n`;
  });
  writeFileSync(join(FRAMES, 'list.txt'), list);
  const ts = s => `00:00:${String(Math.floor(s)).padStart(2, '0')},${String(Math.round((s % 1) * 1000)).padStart(3, '0')}`;
  const srt = CUES.map(([a, b, t], i) => `${i + 1}\n${ts(a)} --> ${ts(b)}\n${t}\n`).join('\n');
  const vtt = 'WEBVTT\n\n' + CUES.map(([a, b, t]) => `${ts(a).replace(',', '.')} --> ${ts(b).replace(',', '.')}\n${t}\n`).join('\n');
  writeFileSync(join(OUT, 'redline-demo-30s.vtt'), vtt);
  writeFileSync(join(FRAMES, 'cap.srt'), srt);
  // UI on top, open captions in a black bar below (captions never cover the UI).
  const vf = `tpad=stop_mode=clone:stop_duration=2,fps=30,scale=${W}:${H},pad=${W}:${H + 90}:0:0:black,subtitles=cap.srt:original_size=${W}x${H + 90}:force_style='Alignment=2,MarginV=6,FontName=Arial,FontSize=9,PrimaryColour=&H00FFFFFF,BorderStyle=1,Outline=0,Shadow=0'`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'list.txt',
    '-i', 'cap.srt', '-vf', vf, '-t', String(TOTAL), '-fps_mode', 'cfr', '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-preset', 'medium',
    '-c:s', 'mov_text', '-metadata:s:s:0', 'language=eng', '-map', '0:v', '-map', '1:s', '-movflags', '+faststart',
    join(OUT, 'redline-demo-30s.mp4')], { cwd: FRAMES, stdio: 'inherit' });
  for (const s of [2, 11, 17, 23, 28]) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(s), '-i', join(OUT, 'redline-demo-30s.mp4'), '-frames:v', '1', join(FRAMES, `check-${s}.png`)]);
  console.log(JSON.stringify({ out: OUT, frames: frames.length, steps: log, picked, hasCanvas, checks: FRAMES }));
} finally {
  try { ws?.close(); } catch {}
  edge.kill();
  try { execFileSync('taskkill', ['/PID', String(edge.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
  await sleep(500);
  try { rmSync(PROFILE, { recursive: true, force: true }); } catch {}
}
