# p5 Recorder

Frame-exact recording for p5.js sketches (global mode). A floating **● Record / ■ Stop** button saves:

- **PNG frames** (zipped) — always
- **H.264 MP4** — made in the browser right away (`-web.mp4`)
- **High-quality MP4 + ProRes 422 HQ `.mov`** — made by a terminal helper using your local ffmpeg

Recording is frame-exact: a slow or high-res sketch still plays back at the set fps, with no dropped frames.

## Files to copy

| File | Copy to | Purpose |
| --- | --- | --- |
| `p5.recorder.js` | project root (next to `index.html`) | the button + recording logic |
| `render-recordings.mjs` | anywhere (project root is fine) | turns the downloaded zips into MP4 + ProRes |

## Add to `index.html`

Load in this order — **after p5, before your sketch**:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.1/p5.js"></script>
<script src="https://cdn.jsdelivr.net/npm/p5.capture@1.6.1/dist/p5.capture.umd.min.js"></script>
<script src="p5.recorder.js"></script>
<script src="sketch.js"></script>
```

No changes to the sketch are needed. Don't call `pixelDensity()` inside `draw()` — set it once in `setup()`.

## Use

1. Start the helper once in a terminal (needs Node + ffmpeg):
   ```bash
   node render-recordings.mjs
   ```
2. Open the sketch, click **● Record**, then **■ Stop**. Allow multiple downloads if the browser asks.
3. In `~/Downloads` you get:

| File | From |
| --- | --- |
| `recording-<date>-<time>-part001.zip` … | browser |
| `recording-<date>-<time>-web.mp4` | browser |
| `recording-<date>-<time>.recording.json` | browser (tells the helper the recording is complete) |
| `recording-<date>-<time>.mp4` | helper |
| `recording-<date>-<time>-prores.mov` | helper |

Helper options: `--once` (render what's ready, then exit) · `--codecs h264` or `--codecs prores` · `--dir <folder>` · `--keep-frames`.

## Settings

Tuneable constants are at the top of `p5.recorder.js` (fps, duration, export density, bitrate, button look) and of `render-recordings.mjs` (CRF, ProRes profile, watched folder).

Per-sketch overrides, from `setup()`:

```js
Recorder.configure({ durationSeconds: 8, exportPixelDensity: 2, framerate: 30 });
```

## Notes

- Animations driven by `frameCount` restart from frame 1 when recording starts, so takes are repeatable.
- The browser MP4 needs WebCodecs (Chrome, Edge, Safari 16.4+, recent Firefox); otherwise it's skipped and the helper still makes both videos.
- ProRes is only made by the helper — browsers can't encode it.
