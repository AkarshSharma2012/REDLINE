# HANDOFF: issue #316, 30-second public demo clip

## Done
- `docs/demo/redline-demo-30s.mp4`: real headless-Edge capture of `index.html` from main d22afe5 (file://, no server). It runs exactly 30.000 s, 1280x810, 30 fps CFR (900 frames), H.264, with burned-in open captions in a bar below the UI plus a soft English mov_text track.
- `docs/demo/redline-demo-30s.vtt`: WebVTT captions (6 cues, 0–30 s).
- `docs/demo/capture-log.json`: the UI's own text during capture (45 rows, 0 verified, PSI25-B1 "draft record, not used for any label", "No verified evidence rows loaded").
- `tools/demo-video/capture.mjs`: reproducible capture (`node tools/demo-video/capture.mjs docs/demo`). It drives the UI with real CDP mouse events and kills Edge in `finally`. Checked: 0 headless Edge processes were left after each run.
- Flow: load lunar rover demo, pick acrylic on the 3D model canvas, open the PSI25-B1 NASA source (0 g ISS film) next to the 0.16 g request, show draft status and unavailable cabin result, then select it again with the viewer's HTML item list.

## Testing
- `ffprobe`: duration=30.000000, 900 video frames, subtitle stream present; full decode passes with no errors. I checked frames visually at 2/6/9/11.5/16/22/28.5 s.
- `tests/demo-video.test.mjs`: 3 pass. Full `node --test`: 1240 pass, 1 fail in `tests/react-controls.test.mjs`. That suite fails on its own; this branch changes no app code.

## Public link
- GitHub Pages serves `main` publicly. After the PR merges, the clip is at https://akarshsharma2012.github.io/REDLINE/docs/demo/redline-demo-30s.mp4. The repo is private, so there is no unauthenticated link before the merge. Agents may not push to main.

STATUS: DONE
