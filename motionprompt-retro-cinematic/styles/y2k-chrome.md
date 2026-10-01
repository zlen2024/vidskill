---
name: y2k-chrome
title: Y2K chrome
description: A late-90s/early-2000s liquid chrome look on a pastel-to-silver gradient: a shiny 3D chrome blob that slowly morphs, a chrome extruded headline with a shine sweep, floating chrome stars and bubbles, holographic stickers (a flapping butterfly) and sparkle glints. For music, fashion, tech and nostalgic brands.
tags: ["3d","retro","brand"]
library: Three.js
sound: true
difficulty: 5
default_duration: 10
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Y2K chrome

**One-liner:** a soft lilac-to-silver gradient with a faint perspective grid at the bottom; the hero is a mirror-chrome 3D blob that slowly turns and morphs like liquid metal (bright highlights, a dark horizon band, soft rainbow holographic tints); the headline is chrome with a dark outline, bright rim and short 3D extrusion, and a shine sweeps across every few seconds; smaller chrome shapes (a chunky star, an orbiting ring, glossy bubbles) bob around; holographic stickers with a white die-cut border (a flapping butterfly, a star) and four-point sparkle glints complete it.
**Best for:** music and fashion drops, Y2K nostalgia, beauty and tech brands with a glossy retro look.
**Avoid when:** long headlines or a matte, minimal tone.

## Inputs to gather
- Short headline (a word or two). Optional product or logo to render in chrome next to the blob. Brand colours (pastels).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A late 90s/early 2000s liquid-chrome look on a soft pastel-to-silver gradient with a faint perspective grid fading in at the bottom | DOM/canvas background gradient + a grid drawn in perspective with low alpha |
| L2 | The hero is a shiny 3D chrome blob that slowly turns and morphs like liquid metal; mirror surface with bright highlights, a dark horizon band and soft rainbow holographic tints | `IcosahedronGeometry` (detail 6) with vertex displacement by 3D noise of `t`; `MeshStandardMaterial({metalness: 1, roughness: 0.05})` with an env map containing a dark horizon band and pastel gradient; a thin-film tint from a fresnel-based colour shift |
| L3 | The message is a big chrome headline across the lower part of the blob: silver-to-pastel mirror gradient, dark outline, bright rim, short 3D extrusion; a bright shine sweeps across the letters every few seconds | Text as `TextGeometry` extruded 12 units in chrome material (or a DOM/canvas gradient text with layered offsets); shine = a moving white gradient band masked to the text |
| L4 | If there is a product or logo, show it in the same chrome finish floating next to the blob | Extruded logo with the same material |
| L5 | Around it float smaller chrome shapes: a chunky star, a little ring orbiting behind the blob, glossy bubbles, all gently bobbing | Geometries with `y = a * sin(t * f + p)`; ring orbits by angle `w * t` |
| L6 | Holographic stickers with a white die-cut border (a butterfly that flaps its wings, a star) and four-point sparkle glints that twinkle on the chrome and the words | Sticker planes (canvas textures with rainbow gradient + white outline); butterfly wings scaleX oscillation; sparkles as camera-facing sprites twinkling |
| L7 | Smooth, dreamy motion with no hard cuts; keep the headline short so it reads at a glance | Only continuous motion; one shot |
| T1 | A wide heavy rounded font (Unbounded), all capitals, with the chrome treatment | Unbounded 800 uppercase |
| T2 | Brand colours if given, else lilac, baby pink, baby blue, deep navy outlines and silver | Tokens below |
| S1 | A soft liquid-chrome shimmer that swells as the blob morphs with gentle gloopy bloops, a glassy pop as each bubble reaches the top of its bob, a bright twinkle for every star glint, a soft papery flutter each time the butterfly's wings close, a bright metallic swoosh that crosses the title with every shine sweep | Cue table below |
| S2 | Bubbly Y2K pop bed about 96 bpm: glossy detuned synth chords, a bouncy pluck arpeggio with a light echo, round bass, a crisp lightly swung beat; under the effects; loops | `y2k-pop` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 10` |
| O3 | A Three.js HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #dcd6ff;
--ink: #2b2f5c;
--accent: #ff9ad8;
--sky: #8fd8ff;
--silver: #c3c8d4;
```
```json fonts
[{"family": "Unbounded", "id": "unbounded", "variable": true, "weightRange": "200 900", "role": "chrome headline"}]
```

## Beat sheet
```json beats
{"bpm": 96, "events": [
  {"id": "start", "at": 0.0, "label": "blob morphing, shapes bobbing"},
  {"id": "shine", "repeat": {"n": 2, "fromFrac": 0.3, "everyFrac": 0.4}, "label": "shine sweeps across the title"},
  {"id": "bubble", "repeat": {"n": 4, "fromFrac": 0.15, "everyFrac": 0.2}, "label": "a bubble reaches the top of its bob"},
  {"id": "flap", "repeat": {"n": 3, "fromFrac": 0.4, "everyFrac": 0.18}, "label": "butterfly wings close"},
  {"id": "glint", "repeat": {"n": 5, "fromFrac": 0.2, "everyFrac": 0.15}, "label": "sparkle glints"}
]}
```

## Build recipe
- **Blob:** displace vertices `p += n * 0.28 * noise3(p * 1.4 + t * 0.35)` computed in JS for each frame (about 40k vertices at detail 6 is heavy: use detail 5 or a vertex shader with the same noise) and recompute normals in the shader via finite differences; deterministic `t`.
- **Chrome look:** the reflection carries the effect. Build the environment from a canvas: a horizontal dark band at the horizon, a pale pink/blue gradient above, white soft boxes for highlights; convert with `PMREMGenerator`. Add a thin-film rainbow by modulating the colour with `sin(fresnel * 6 + t)` in `onBeforeCompile`, or approximate by tinting reflections.
- **Headline:** use `TextGeometry` from a bundled typeface JSON (Unbounded converted) or a canvas-textured extruded plane with 12 layered offsets. Shine: animate a `uniform` band position across the text UVs.
- **Stickers:** draw on a canvas (white thick outline via stroking the shape twice), rainbow gradient fill; butterfly = two mirrored wing shapes scaling `x` by `abs(cos(...))`.
- **Pitfalls:** heavy transmission and per-vertex JS noise slow software GL: lower vertex counts; render at DPR 1; no post-processing that uses previous frames; keep sparkles as small sprites, not lights.

## Sound plan
How each effect of the brief is covered:
- **A soft liquid-chrome shimmer that swells as the blob morphs with gentle gloopy bloops:** `swell` (with `sparkle`) at `start` and low `pop` bloops.
- **A glassy pop as each bubble reaches the top of its bob:** `pop` (glassy, high) at `bubble*`.
- **A bright little twinkle for every star glint:** `twinkle` at `glint*`.
- **A soft papery flutter each time the butterfly's wings close:** `paper` (short, soft) at `flap*`.
- **A bright metallic swoosh that crosses the title with every shine sweep:** `whoosh` (up) + `chime` at `shine*`.
```json cues
[
  {"at": "start", "kind": "swell", "dur": 2.4, "freq": 1800, "vol": 0.35},
  {"at": "start+0.5", "kind": "pop", "freq": 180, "rise": 1.8, "dur": 0.2, "vol": 0.4},
  {"at": "start+2.2", "kind": "pop", "freq": 200, "rise": 1.8, "dur": 0.2, "vol": 0.4},
  {"at": "bubble*", "kind": "pop", "freq": 1500, "rise": 1.3, "dur": 0.08, "vol": 0.45},
  {"at": "glint*", "kind": "twinkle", "dur": 0.4, "lo": 3500, "hi": 9000, "vol": 0.4},
  {"at": "flap*", "kind": "paper", "dur": 0.12, "vol": 0.25},
  {"at": "shine*", "kind": "whoosh", "dir": "up", "dur": 0.5, "f0": 800, "f1": 6000, "vol": 0.45},
  {"at": "shine*+0.2", "kind": "chime", "freq": 2093, "dur": 1.0, "vol": 0.35}
]
```
```json music
{"preset": "y2k-pop", "bpm": 96, "gain": 1, "duck": 0.45}
```

## Layout by aspect ratio
- **9:16:** blob in the upper 55%, headline across its lower part, floating shapes around; stickers near the lower corners above the safe zone.
- **16:9:** blob centre-left, headline across it, stickers at the sides.
- **1:1 / 4:5:** blob centred, headline on its lower half.

## Loop & ending
All motion is periodic in `D` (blob noise phase loops by using a circular time path: `noise3(p + (cos(2*PI*t/D), sin(2*PI*t/D)) * r)`), so the last frame flows into the first with no cut.

## Guardrails
- Keep the motion smooth and dreamy with no hard cuts.
- Keep the headline short so it reads at a glance.
- Chrome must show real reflections (horizon band, highlights): no flat grey.

## QA
- Frame at `start + 1 s` and `start + 4 s`: blob shape visibly different; reflections change as it turns.
- Frame at `shine + 0.15 s`: bright band across the letters, text still legible.
- Butterfly wings alternate open/closed; stickers have white borders.
- Frame `D` matches frame 0 (loop).
