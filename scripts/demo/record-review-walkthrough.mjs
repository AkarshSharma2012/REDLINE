// #323: records a genuine live walkthrough of the real REDLINE build (this checkout, served
// locally) and produces an MP4 with burned-in captions, a WebVTT sidecar, a transcript, the
// actual exported brief files shown on screen, and a capture log.
// Narration uses the free local Windows speech voice (System.Speech); pass --no-voice to skip.
// Requirements (not repo dependencies): PLAYWRIGHT=<path to playwright package>, local Chrome,
// FFMPEG=<ffmpeg with libx264, aac and libass>.
// Usage: node scripts/demo/record-review-walkthrough.mjs [outDir=docs/pitch/walkthrough]
// Every owned process (server, browser) is closed in `finally`.
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync, readdirSync, mkdtempSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = resolve('.');
const OUT = resolve(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'docs/pitch/walkthrough');
const VOICE = !process.argv.includes('--no-voice');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || 'playwright');
const W = 1280, H = 640; // captured 1280x640, upscaled to 1920x960 UI + 120 px caption band = 1920x1080
const WORK = mkdtempSync(join(tmpdir(), 'redline-walk-'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

// Beats: caption text interprets the screen; `say` is the narration (same meaning, spoken form).
export const BEATS = [
  { id: 'problem', caption: 'A lunar rover team must decide which cabin materials still need fire-test evidence. NASA records exist, but each was tested under its own conditions.',
    say: 'A lunar rover team must decide which cabin materials still need fire test evidence. NASA records exist, but each one was tested under its own conditions.' },
  { id: 'load', caption: 'Load the illustrative lunar rover BOM. Each line is matched to candidate NASA records. All 45 records are drafts and 0 are verified, and the app says so.',
    say: 'Load the illustrative lunar rover bill of materials. Each line is matched to candidate NASA records. All forty five records are drafts, none are verified, and the app says so.' },
  { id: 'matrix', caption: 'Window panel, record PSI25-B1: requested conditions beside what the source tested, with citation and page locator. Unknown stays unknown, never zero.',
    say: 'For the window panel, record P S I 25 B 1 sits beside the requested conditions, with its citation and page locator. Unknown values stay unknown, never zero.' },
  { id: 'baseline', caption: 'Set the microgravity reference (0 g) and pin it as the baseline.',
    say: 'Set the microgravity reference, zero g, and pin it as the baseline.' },
  { id: 'change', caption: 'Change one assumption: the lunar gravity scenario, 0.16 g.',
    say: 'Now change one assumption: the lunar gravity scenario, zero point one six g.' },
  { id: 'changes', caption: 'REDLINE lists exactly which records stopped matching and why. Fewer gaps would not mean lower fire risk.',
    say: 'REDLINE lists exactly which records stopped matching the request, and why. Fewer gaps would not mean lower fire risk.' },
  { id: 'questions', caption: 'Each gap becomes an ordered research question naming the field and the records to check.',
    say: 'Each gap becomes an ordered research question, naming the field and the records to check.' },
  { id: 'export', caption: 'Export the reviewer brief as Markdown and JSON: conditions, citations, review states, what changed, next questions.',
    say: 'Export the reviewer brief as Markdown and JSON, with conditions, citations, review states, what changed, and the next questions.' },
  { id: 'open', caption: 'This is the exported file itself, built from data rather than generated prose. It is not a safety assessment.',
    say: 'This is the exported file itself, built from data rather than generated prose. It says plainly that it is not a safety assessment.' },
  { id: 'reopen', caption: 'A reviewer reopens the downloaded JSON brief and sees the same reasoning.',
    say: 'A reviewer can reopen the downloaded JSON brief and see the same reasoning.' },
  { id: 'close', caption: 'Illustrative scenario, draft sources, no predictions. REDLINE organises evidence review; engineers and safety reviewers decide.',
    say: 'Illustrative scenario, draft sources, no predictions. REDLINE organises the evidence review. Engineers and safety reviewers make the decisions.' },
];

function speak(text, file) {
  const ps = `Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Rate = 1; $s.SetOutputToWaveFile('${file.replace(/'/g, "''")}'); $s.Speak([Console]::In.ReadToEnd()); $s.Dispose()`;
  execFileSync('powershell', ['-NoProfile', '-Command', ps], { input: text });
}
function probeSeconds(file) {
  try { execFileSync(FFMPEG, ['-hide_banner', '-i', file], { stdio: 'pipe' }); } catch (e) {
    const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(String(e.stderr));
    if (m) return (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3]);
  }
  throw new Error(`cannot probe ${file}`);
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.csv': 'text/csv', '.glb': 'model/gltf-binary', '.woff2': 'font/woff2' };
function serve() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = resolve(ROOT, '.' + (path.endsWith('/') ? path + 'index.html' : path));
    if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404); res.end(); return; }
    try { res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }); res.end(readFileSync(file)); }
    catch { res.writeHead(404); res.end(); }
  });
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r(server)));
}

// Recording annotation only (not product UI): a visible cursor dot and a thin focus outline.
const OVERLAY = `(() => {
  const add = () => {
    if (document.getElementById('rec-cursor')) return;
    const c = document.createElement('div'); c.id = 'rec-cursor'; c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:fixed;z-index:2147483647;width:18px;height:18px;margin:-9px 0 0 -9px;border:2px solid #fff;border-radius:50%;background:rgba(255,255,255,.25);pointer-events:none;left:-40px;top:-40px;transition:transform .12s';
    const o = document.createElement('div'); o.id = 'rec-outline'; o.setAttribute('aria-hidden', 'true');
    o.style.cssText = 'position:fixed;z-index:2147483646;border:2px solid #F0D545;border-radius:4px;pointer-events:none;display:none';
    document.documentElement.append(c, o);
    addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
    addEventListener('mousedown', () => { c.style.transform = 'scale(.7)'; }, true);
    addEventListener('mouseup', () => { c.style.transform = ''; }, true);
  };
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', add) : add();
})()`;

async function main() {
  // 1. Narration first, so every beat holds at least as long as its spoken line.
  const audio = {};
  for (const b of BEATS) {
    if (!VOICE) { audio[b.id] = { file: null, seconds: b.caption.split(/\s+/).length / 2.6 }; continue; }
    const f = join(WORK, `${b.id}.wav`); speak(b.say, f); audio[b.id] = { file: f, seconds: probeSeconds(f) };
  }
  const server = await serve();
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ channel: 'chrome' });
  const log = { started_utc: new Date().toISOString(), commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    dirty: execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).trim() !== '', url, beats: [], facts: {} };
  let t0 = 0, page, ctx;
  try {
    ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, acceptDownloads: true,
      recordVideo: { dir: WORK, size: { width: W, height: H } } });
    await ctx.addInitScript(OVERLAY);
    page = await ctx.newPage();
    const created = Date.now();
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    const p = page;
    const outline = (sel) => p.evaluate((s) => {
      const o = document.getElementById('rec-outline'); const e = s && document.querySelector(s);
      if (!o) return; if (!e) { o.style.display = 'none'; return; }
      const r = e.getBoundingClientRect(); Object.assign(o.style, { display: 'block', left: `${r.left - 4}px`, top: `${r.top - 4}px`, width: `${r.width + 8}px`, height: `${r.height + 8}px` });
    }, sel);
    const moveTo = async (sel) => {
      const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded(); const box = await el.boundingBox();
      await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 18 }); await sleep(250);
    };
    const click = async (sel) => { await moveTo(sel); await outline(sel); await sleep(350); await p.click(sel); };
    const scrollPane = (sel, block = 'start') => p.evaluate(([s, b]) => document.querySelector(s)?.scrollIntoView({ block: b, behavior: 'smooth' }), [sel, block]);
    let beatStart = 0;
    const beat = async (id, fn) => {
      const start = (Date.now() - t0) / 1000; beatStart = Date.now();
      await fn();
      const hold = audio[id].seconds * 1000 + 900 - (Date.now() - beatStart);
      if (hold > 0) await sleep(hold);
      log.beats.push({ id, start, end: (Date.now() - t0) / 1000 });
      await outline(null);
    };

    // Setup (trimmed from the final video): open the app, give the review pane room.
    await p.goto(url); await p.waitForSelector('#cockpit-load', { state: 'visible' });
    await p.click('#ws-settings summary'); await p.click('#ws-toggle-sources'); await p.keyboard.press('Escape');
    await p.mouse.move(W / 2, H / 2); await sleep(800);
    log.facts.rail = { rows: await p.textContent('#rail-rows'), verified: await p.textContent('#rail-verified') };
    t0 = Date.now(); log.trim_start = (t0 - created) / 1000;

    await beat('problem', async () => { await moveTo('#cockpit-load'); });
    await beat('load', async () => { await click('#cockpit-load'); await sleep(600); await outline('#cockpit-summary'); });
    log.facts.summary_loaded = await p.textContent('#cockpit-summary');
    await beat('matrix', async () => {
      await click('.cockpit-line[data-line-id="line-1"]');
      await scrollPane('.cockpit-source'); await sleep(700); await outline('.cockpit-matrix');
      await moveTo('.cockpit-matrix tr[data-key="gravity_g"]');
    });
    await beat('baseline', async () => {
      const g = '#cabin-form select[name="gravity"]';
      await moveTo(g); await outline(g); await p.selectOption(g, '0'); await sleep(900);
      await scrollPane('#review-cockpit'); await sleep(500); await click('#cockpit-pin');
    });
    await beat('change', async () => {
      const g = '#cabin-form select[name="gravity"]';
      await moveTo(g); await outline(g); await sleep(300); await p.selectOption(g, '0.16'); await sleep(600);
    });
    await beat('changes', async () => { await scrollPane('.cockpit-changes'); await sleep(700); await outline('.cockpit-changes'); await moveTo('.cockpit-field-changes li'); });
    log.facts.changes = await p.textContent('.cockpit-changes');
    await beat('questions', async () => { await scrollPane('.cockpit-questions', 'center'); await sleep(700); await outline('.cockpit-questions'); });
    const files = {};
    await beat('export', async () => {
      await scrollPane('#review-cockpit'); await sleep(500);
      for (const [sel, ext] of [['#cockpit-md', 'md'], ['#cockpit-json', 'json']]) {
        await moveTo(sel); await outline(sel);
        const [dl] = await Promise.all([p.waitForEvent('download'), p.click(sel)]);
        files[ext] = join(OUT, dl.suggestedFilename()); await dl.saveAs(files[ext]); await sleep(600);
      }
    });
    await beat('open', async () => {
      await click('#cockpit-open'); await sleep(1500);
      await p.evaluate(() => { const pre = document.querySelector('.cockpit-brief-text'); const i = pre.textContent.indexOf('## Changes from baseline');
        if (i > 0) pre.scrollTop = pre.scrollHeight * (i / pre.textContent.length) - 40; });
    });
    await p.click('#cockpit-brief-close');
    await beat('reopen', async () => {
      await moveTo('#cockpit-file'); await outline('#cockpit-file');
      await p.setInputFiles('#cockpit-file', files.json); await sleep(1200);
    });
    log.facts.reopened_title = await p.textContent('#cockpit-brief-title');
    await beat('close', async () => { await p.click('#cockpit-brief-close'); await scrollPane('#review-cockpit'); await p.mouse.move(W - 40, 40, { steps: 10 }); });
    log.facts.page_errors = errors;
    log.files = Object.fromEntries(Object.entries(files).map(([k, f]) => [k, f.slice(ROOT.length + 1).replace(/\\/g, '/')]));
    // Parse and inspect the downloaded bytes, not the page state.
    const brief = JSON.parse(readFileSync(files.json, 'utf8'));
    const md = readFileSync(files.md, 'utf8');
    log.facts.brief = { summary: brief.summary, has_baseline: brief.has_baseline, changes: brief.changes.length,
      md_has_boundary: md.includes('Not a safety assessment'), md_bytes: Buffer.byteLength(md), json_bytes: readFileSync(files.json).length };
  } finally {
    await page?.close().catch(() => {}); await ctx?.close().catch(() => {});
    await browser.close().catch(() => {}); server.close();
  }
  const webm = readdirSync(WORK).find((f) => f.endsWith('.webm'));
  return { log, webm: join(WORK, webm), audio };
}

const ts = (s) => { const ms = Math.max(0, Math.round(s * 1000)); const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor(ms / 60000) % 60).padStart(2, '0'); const sec = String(Math.floor(ms / 1000) % 60).padStart(2, '0');
  return `${h}:${m}:${sec}.${String(ms % 1000).padStart(3, '0')}`; };

const { log, webm, audio } = await main();
const end = log.beats.at(-1).end + 0.5;
const vtt = ['WEBVTT', '', ...log.beats.flatMap((b, i) => [String(i + 1), `${ts(b.start)} --> ${ts(b.end)}`, BEATS.find((x) => x.id === b.id).caption, ''])].join('\n');
const base = join(OUT, 'redline-evidence-review-walkthrough');
writeFileSync(`${base}.vtt`, vtt);
writeFileSync(`${base}-transcript.md`, ['# REDLINE evidence review walkthrough: transcript', '',
  `Recorded live from commit ${log.commit}${log.dirty ? ' (with uncommitted changes)' : ''} on ${log.started_utc}. Narration: local Windows speech voice.`, '',
  ...log.beats.map((b) => `- [${ts(b.start)}] ${BEATS.find((x) => x.id === b.id).say}`), ''].join('\n'));
// ASS captions in a band below the UI, never over controls.
const ass = ['[Script Info]', 'ScriptType: v4.00+', `PlayResX: 1920`, `PlayResY: 1080`, '', '[V4+ Styles]',
  'Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, Italic, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV',
  'Style: Cap,Segoe UI,40,&H00FFFFFF,&H00000000,&H00000000,0,0,1,0,0,2,80,80,22', '', '[Events]',
  'Format: Layer, Start, End, Style, Text',
  ...log.beats.map((b) => `Dialogue: 0,${ts(b.start).slice(1, -1)},${ts(b.end).slice(1, -1)},Cap,${BEATS.find((x) => x.id === b.id).caption}`)].join('\n');
const assFile = join(WORK, 'captions.ass'); writeFileSync(assFile, ass);
const inputs = ['-ss', String(log.trim_start), '-i', webm];
const mixParts = [];
log.beats.forEach((b, i) => { if (audio[b.id].file) { inputs.push('-i', audio[b.id].file); mixParts.push(`[${inputs.filter((x) => x === '-i').length - 1}:a]adelay=${Math.round(b.start * 1000)}:all=1[a${i}]`); } });
const subPath = assFile.replace(/\\/g, '/').replace(':', '\\:');
let filter = `[0:v]fps=30,scale=1920:960:flags=lanczos,pad=1920:1080:0:0:black,subtitles='${subPath}'[v]`;
const args = ['-y', ...inputs];
if (mixParts.length) filter += `;${mixParts.join(';')};${mixParts.map((_, i) => `[a${i}]`).join('')}amix=inputs=${mixParts.length}:normalize=0[a]`;
args.push('-filter_complex', filter, '-map', '[v]', ...(mixParts.length ? ['-map', '[a]', '-c:a', 'aac', '-b:a', '128k'] : []),
  '-t', String(end), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${base}.mp4`);
execFileSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'inherit'] });
log.output = { mp4: `${base}.mp4`.slice(ROOT.length + 1).replace(/\\/g, '/'), seconds: end };
writeFileSync(join(OUT, 'capture-log.json'), JSON.stringify(log, null, 2));
rmSync(WORK, { recursive: true, force: true });
console.log(JSON.stringify({ mp4: log.output.mp4, seconds: end.toFixed(1), beats: log.beats.length, errors: log.facts.page_errors }));
