---
name: seekable-canvas
description: How to build deterministic, seekable visuals in HyperFrames: hf-seek redraw for Canvas/WebGL/Three, stateless particles, seeded randomness, stepped time, periodic loops, and the render-speed budget
metadata:
  tags: determinism, canvas, webgl, three, seek, gsap, particles, loop
---

# Seekable visuals

HyperFrames renders frame by frame by **seeking**: it sets the time, then captures. So every frame must be a pure function of time `t` (seconds). Verified on this machine: 1080x1920, Canvas 2D + Three.js + GSAP text rendered correctly at every frame, GPU capture on.

## The rules

| Do | Never |
|----|-------|
| Derive state from `t` (closed forms, integration from `t0`) | Keep state between frames (`x += v`) |
| `MP.rng(seed)` / `MP.hash(i, seed)` for randomness | `Math.random()` |
| `MP.onSeek(t => draw(t))` for Canvas/WebGL/Three | `requestAnimationFrame`, `setInterval`, `setAnimationLoop` as the source of motion |
| GSAP `gsap.timeline({paused: true})` registered last | `repeat: -1`, `tl.play()` |
| Local assets (`assets/vendor`, `assets/fonts`) | `fetch()` or CDN at render time |
| Finite loops: `Math.floor(D / cycle)` | `Date.now()`, `performance.now()` |
| `opacity` / a child wrapper to hide things | Tween `display`, `visibility` or `autoAlpha` on a `.clip` |

## Canvas 2D

```js
const { ctx } = MP.canvas($("#scene"), W, H);
MP.onSeek((t) => { ctx.clearRect(0, 0, W, H); draw(ctx, t); });   // hf-seek fires on every render frame (verified, also without three.js)
```

`MP.onSeek(fn, {tl, duration})` also adds a proxy tween so Studio scrubbing redraws. Draw everything each frame; do not rely on the previous frame's pixels.

## Stateless particles and trails

Integrate from a fixed earlier time inside the frame instead of storing positions:

```js
function pos(i, t) {                       // home point + flow, K steps of dt ending at t
  let x = home[i].x, y = home[i].y;
  for (let k = 0; k < K; k++) { const tk = t - (K - k) * dt; const a = angle(x, y, tk); x += Math.cos(a) * s * dt; y += Math.sin(a) * s * dt; }
  return [x, y];
}
```

For ballistic things use `p = p0 + v * age + g * age^2 / 2` with `age = t - birth` (confetti, embers, fireworks). Seeded `p0`, `v`, `birth` are created once at build.

## Randomness and noise

- `MP.rng(seed)` (mulberry32) for build-time layout; `MP.hash(i, seed)` for per-frame values (`MP.hash(MP.frameIndex(t, 24), seed)` = grain, flicker, glitch offsets).
- `MP.noise1/2`, `MP.fbm1/2` for smooth motion (wind, wobble, camera drift).

## Stepped time (stop motion, film, chunky feel)

`const tq = MP.stepTime(t, 12)` quantises time to 12 fps; use `tq` for all animated values and `MP.nudge(tq, {fps: 12})` for hand jitter. Render at 30 fps: poses hold 2 to 3 frames. Film grain and flicker use 24 fps steps.

## GSAP details

- Build inside `MP.fontsReady([...]).then(() => { ...; window.__timelines["main"] = tl; })`.
- Do not put a CSS `transform` on an element you also tween with GSAP `x/y/scale` (lint `gsap_css_transform_conflict`): centre with flex/`inset`, or use `fromTo`.
- `.fromTo` sets the initial state inside the tween: safer than CSS initial transforms.
- Springs: `MP.spring(t - t0, {freq, damping})` in `onSeek`, or GSAP `back.out(1.7)`.

## Three.js

```js
import * as THREE from "three";                       // importmap: ./assets/vendor/three.module.js (vendor three.core.js too)
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
MP.onSeek((t) => { update(t); renderer.render(scene, camera); });
```

- Set the root `data-duration` (the scaffold does): the three adapter cannot infer it.
- Load models/textures before the first seek; for heavy setup register `window.__hf.buildReady["name"] = promise`.
- Generate environments/textures from canvases, not from network files.
- Keep polygon counts modest; avoid post-processing that reads previous frames; software WebGL is slow.
- Camera moves are functions of `t`.

## WebGL shaders

One full-frame quad; uniform `u_time` set from the seek time; `preserveDrawingBuffer: true` if you read pixels; DPR 1. Add dithering to avoid banding; make noise periodic in the loop length for seamless loops.

## Loops

Choose motion that is periodic in `D`: sine with whole cycles per `D` (`sin(2*PI*k*t/D)`), scroll by whole cells per beat, a circular path through noise space `(cos(2*PI*t/D), sin(2*PI*t/D)) * r`. Then frame `D` equals frame 0. Every style file says what its loop point is.

## Text and fonts

Wait for `MP.fontsReady(specs)` before measuring text; measure with `MP.fitLine` (canvas metrics, no reflow). Never use `<br>` in body text; split lines yourself.

## Render-time budget

| Content | Draft render (1080x1920, 8 s, -w 1) |
|---------|-------------------------------------|
| GSAP text/SVG | about 23 s |
| Canvas + Three cube + text | about 20 s for 3 s of video (about 4.5 fps) |

Heavy canvases (thousands of particles with trails, many blurs, transmission materials) can drop to 1 to 2 fps: lower counts, pre-render static layers to an offscreen canvas once, and check a draft early.

## Checks that catch mistakes

`npm run check` (lint + runtime + layout + contrast). Compare two seeks of the same time: identical pixels. If a still differs between renders, something is non-deterministic.
