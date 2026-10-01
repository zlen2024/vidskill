---
name: isometric-diorama
title: Isometric diorama
description: A cute flat-shaded 3D world on a round grey disc: rounded-block objects that represent your topic pop in one by one while an isometric camera orbits, then pop out so it loops. For product, app and service explainers with a friendly Storyset feel.
tags: ["3d","product","explainer"]
library: Three.js
sound: true
difficulty: 4
default_duration: 10
ratios: {"9:16":"good","4:5":"great","1:1":"great","16:9":"great"}
---
# Isometric diorama

**One-liner:** a small toy-like 3D world floating on a light grey round disc over a white background, drawn like a flat vector illustration: objects made of rounded blocks and cylinders pop in with a springy bounce, bob gently, while an orthographic camera orbits and eases between shots.
**Best for:** a product or app showcase, "how it works", a service concept, an invoicing/finance/food/education topic.
**Avoid when:** you need real screenshots as the hero (use `app-showcase`) or lots of text.

## Inputs to gather
- The topic and 4 to 7 objects that represent it (for an invoicing app: laptop, folder of invoices, calculator, coin stacks, giant pencil, % tag). An app screenshot for the laptop screen, if any. Two brand colours max. A short line of text (optional).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A small 3D world on a light grey round disc floating on clean white, drawn like a flat vector illustration (Storyset) | Three.js scene: `CylinderGeometry` disc, white background, orthographic camera |
| L2 | Fill the disc with simple cute objects that represent the topic, from rounded blocks, cylinders and simple shapes | A small `make*()` function per object using `RoundedBoxGeometry`-like helper (box with bevel via `ExtrudeGeometry` or capsule geometry) |
| L3 | If screenshots are attached show them on the laptop screen; otherwise draw a simple app screen (sidebar, header bar, a few cards, small chart) | Canvas texture (`CanvasTexture`) drawn once on the laptop screen |
| L4 | Flat toon shading with two or three tones per colour, soft shadows under each object, no textures or gloss | `MeshToonMaterial` with a 3-step `gradientMap`; blob shadows (dark ellipses) under objects |
| L5 | Camera looks down at an isometric angle with no perspective, slowly orbits and eases between two or three shots (wide, closer on the key object, back out); never still | `OrthographicCamera` at `atan(1/sqrt2)` elevation; orbit angle and zoom are functions of `t` |
| L6 | Every object pops in one by one with a springy bounce then gently bobs or tilts; at the end everything pops out so it loops | Scale from `MP.spring` per object at `obj<k>`; bob = `sin`; pop-out reverses scale with `E.inBack` |
| T1 | Keep text to a minimum: a short bold rounded sans line above or below the disc, dark colour | Nunito 800 as DOM text in `#text` |
| T2 | Brand colours (two colours only plus white and greys), else teal and dark slate | Tokens `--accent --dark` |
| S1 | Bubbly pop with a small pitch rise per object (a different note each), wooden taps for stacking pieces, gentle whoosh per camera move, soft clicks as a screen fills in, friendly two-note chime on the key object, soft reversed pops at the end | Cue table below |
| S2 | Light cheerful bed in a major key about 100 bpm: soft marimba arpeggio, warm pad, gentle bass, quiet shaker; quieter than effects; loops | `corporate-calm` preset at 100 bpm: marimba arpeggio, pad, bass and a quiet shaker, no kick |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 10` |
| O3 | A Three.js scene in HTML rendered to MP4 | `hyperframes render` (three adapter) |

## Tokens
```css tokens
--bg: #ffffff;
--ink: #263238;
--accent: #1fb5a8;
--disc: #e6e9ec;
```
```json fonts
[{"family": "Nunito", "id": "nunito", "variable": true, "weightRange": "200 1000", "role": "short line of text"}]
```

## Beat sheet
```json beats
{"bpm": 0, "events": [
  {"id": "disc", "at": 0.0, "label": "disc pops in"},
  {"id": "obj", "repeat": {"n": 6, "fromFrac": 0.08, "everyFrac": 0.09}, "label": "objects pop in one by one"},
  {"id": "move1", "at": 0.3, "label": "camera eases toward the key object"},
  {"id": "screen", "at": 0.5, "label": "laptop screen fills in"},
  {"id": "key", "at": 0.6, "label": "key object chime"},
  {"id": "move2", "at": 0.72, "label": "camera eases back out"},
  {"id": "out", "at": 0.9, "label": "everything pops out"}
]}
```

## Build recipe
- **Setup:** load Three via the vendored import map; `renderer.setPixelRatio(1)`; `OrthographicCamera` frustum sized to the frame; render inside `MP.onSeek(t => { update(t); renderer.render(scene, camera) })` (hf-seek). Set `data-duration` (the scaffold does).
- **Look:** toon material with a small `DataTexture` gradient (3 tones); a flat white background; one directional light + ambient. Shadows: draw as flat dark ellipses under objects (cheaper and more illustrative than shadow maps).
- **Objects:** build from `CylinderGeometry`, `BoxGeometry` with `bevel`, `CapsuleGeometry`, `TorusGeometry`. Keep silhouettes readable and cute; each object has a `group` whose scale, `y` and rotation are pure functions of `t`.
- **Camera:** `azimuth = base + 0.35 * sin(...)` or a slow constant orbit; `zoom` eased between shots; `camera.lookAt` the disc centre or the key object.
- **Pitfalls:** no post-processing that needs previous frames; keep polygon counts small so software WebGL is fast; textures must be canvas/data (no fetch at seek time).

## Sound plan
How each effect of the brief is covered:
- **Soft bubbly pop with a tiny pitch rise as each object pops in, a different note for each:** `pop` at `obj*` with rising pitch (`rise`).
- **Light wooden taps as small pieces drop or stack:** `knock` under the object landings.
- **Gentle whoosh on each camera move:** `whoosh` at `move1`, `move2`.
- **Soft clicks as a screen fills in:** `ticks` at `screen`.
- **Friendly two-note chime on the key object:** `run` of `chime` at `key`.
- **Soft reversed pops as everything pops out at the end:** `pop` with `rev` at `out`.
```json cues
[
  {"at": "disc", "kind": "pop", "freq": 300, "vol": 0.7},
  {"at": "obj*", "kind": "pop", "freq": 520, "vol": 0.75, "rise": {"param": "freq", "from": 520, "by": 70}},
  {"at": "obj*", "kind": "knock", "freq": 420, "dur": 0.08, "vol": 0.35},
  {"at": "move1", "kind": "whoosh", "dir": "peak", "dur": 0.9, "vol": 0.4},
  {"at": "screen", "kind": "ticks", "n": 8, "span": 0.6, "tick": "click", "vol": 0.4},
  {"at": "key", "kind": "run", "inst": "chime", "from": "G5", "n": 2, "dt": 0.16, "len": 1.2, "vol": 0.6},
  {"at": "move2", "kind": "whoosh", "dir": "peak", "dur": 0.9, "vol": 0.4},
  {"at": "out", "kind": "repeat", "every": 0.1, "times": 6, "of": {"kind": "pop", "freq": 700, "rev": true, "vol": 0.55}}
]
```
```json music
{"preset": "corporate-calm", "bpm": 100, "key": "C", "gain": 1, "duck": 0.5, "layers": {
  "arp": {"voice": "marimba", "vol": 0.45},
  "chords": false,
  "drums": {"kick": "", "snap": "", "shaker": "-o-o-o-o-o-o-o-o", "lanes": {"shaker": 0.5}, "vol": 0.4}
}}
```

## Layout by aspect ratio
- The disc is always fully visible at the wide shot; set the orthographic frustum to the shorter side.
- **9:16:** disc in the middle, text line above it inside the top safe zone; the closer shot may crop the disc.
- **16:9:** text on the left or below; the disc centred.

## Loop & ending
Objects pop out one by one (reversed springs), leaving the empty disc, which matches the first frame.

## Guardrails
- Flat toon shading with two or three tones per colour, soft shadows, no textures and no gloss.
- The camera looks down at an isometric angle with no perspective (orthographic), and it is never fully still.
- Keep text to a minimum; use only two brand colours plus white and greys.

## QA
- Wide-shot frame shows every object once with a shadow; closer shot frames the key object without clipping.
- No object intersects the disc edge; laptop screen is readable.
- Frames at the loop point (`out + 1 s`) and frame 0 match (empty disc).
