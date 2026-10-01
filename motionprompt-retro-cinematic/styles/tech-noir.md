---
name: tech-noir
title: Tech noir
description: A dark cinematic tech film: a dotted globe with glowing arcs, thin isometric line-art devices joined by a cable, a flickering circuit chip, and a headline formed from glowing particles. For product, infrastructure, AI and security stories with an Apple/Linear keynote feel.
tags: ["3d","explainer","product"]
library: Canvas
sound: true
difficulty: 5
default_duration: 15
ratios: {"9:16":"good","4:5":"good","1:1":"good","16:9":"great"}
---
# Tech noir

**One-liner:** very dark warm-brown space, thin grey line-art of diagrams that glow amber only where active, a camera that never stops (slow rotate, tilt, drift, zoom), soft crossfades between three or four scenes, and a serif headline assembled from particles that later dissolves into dust.
**Best for:** infrastructure, cloud, security, AI, offline-first, network products; a premium announcement.
**Avoid when:** you need a bright or playful tone, or lots of copy (labels are tiny by design).

## Inputs to gather
- 3 or 4 short scenes derived from the topic (for example: "connect anywhere" globe, "your devices" cable diagram, "runs offline" chip) and the closing key line (short). Tiny lowercase labels for things. One accent colour.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A dark cinematic tech film, like Apple or Linear product films; very dark warm brown, almost black, soft vignette | Canvas 2D full frame, `--bg`, `MP.vignette` |
| L2 | Three or four short scenes of glowing line-art: a dotted globe with arcs from a pulsing "you" dot; devices in thin isometric lines joined by a cable with lights running; a circuit board with a chip whose cells flicker, small code words drifting up and fading | Scene functions `globe(t)`, `devices(t)`, `circuit(t)`; each draws with the shared projection |
| L3 | Everything is thin grey line work on barely-there fills; only active parts glow, in one warm amber | Draw grey `--line` strokes at 1 to 1.5 px; active parts use amber strokes plus a `shadowBlur` glow |
| L4 | Tiny lowercase mono labels beside things with a short leader line ("laptop", "offline"); a middle dot between label parts, never a dash | `label(text, x, y)` helper; the `.` character is U+00B7 (middle dot) |
| L5 | The camera never stops: slowly rotates, tilts, drifts, zooms; calm and smooth, never fast | One global camera transform (rotY, tilt, zoom, drift) as slow functions of `t` applied to all 3D points |
| L6 | Soft crossfades between scenes with a gentle push in | Scene alpha windows overlap by 0.8 s; camera zoom eases +6% per scene |
| L7 | End on the key line as a large serif headline made of glowing particles: they fly in to form the words, hold, then dissolve into drifting dust as the video loops | Sample the headline from an offscreen canvas into points (seeded); particles interpolate from scattered starts to targets; dissolve by adding drift |
| T1 | Light elegant serif (Instrument Serif) for the particle headline; small monospace (JetBrains Mono) for labels and code words | Serif at 400, mono 400/500 |
| T2 | Brand colours if given (one accent on a very dark background), else warm black, muted grey lines, amber and soft amber glow | Tokens below |
| S1 | Low dark drone per scene fading with the crossfades, data blip per arc leaving and a soft sonar ping with dark echo as it lands, fan whirr and servo whine for devices, tiny key ticks as text types, soft tick per light pulse on the cable, digital clicks as chip cells light over a low hum, soft blips for code words, a swell of tiny grains as particles form the headline, a warm chord as it glows, drifting grains as it dissolves | Cue table below |
| S2 | Minimal dark ambient pulse about 120 bpm like a keynote: round sub bass pulse every beat, sparse soft clicks, faint dark pad; low; loops | `dark-ambient` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | A 3D-looking scene in HTML (Canvas projection or Three.js lines) rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #120c09;
--ink: #efe6dc;
--line: #6b635c;
--accent: #ff8a3d;
--accent2: #ffb070;
```
```json fonts
[
  {"family": "Instrument Serif", "id": "instrument-serif", "weights": [400], "role": "particle headline"},
  {"family": "JetBrains Mono", "id": "jetbrains-mono", "weights": [400, 500], "role": "labels and code words"}
]
```

## Beat sheet
```json beats
{"bpm": 120, "events": [
  {"id": "s1", "at": 0.0, "label": "scene 1: globe"},
  {"id": "arc", "repeat": {"n": 5, "fromFrac": 0.05, "everyFrac": 0.035}, "label": "arcs leave the you dot"},
  {"id": "s2", "at": 0.28, "label": "scene 2: devices and cable"},
  {"id": "pulse", "repeat": {"n": 5, "fromFrac": 0.34, "everyFrac": 0.04}, "label": "light pulses run along the cable"},
  {"id": "s3", "at": 0.52, "label": "scene 3: circuit chip"},
  {"id": "cell", "repeat": {"n": 6, "fromFrac": 0.56, "everyFrac": 0.02}, "label": "chip cells flicker on"},
  {"id": "form", "at": 0.74, "label": "particles fly in to form the headline"},
  {"id": "glow", "at": 0.84, "label": "headline glows, warm chord"},
  {"id": "dust", "at": 0.92, "label": "dissolves into drifting dust"}
]}
```

## Build recipe
- **Projection:** define points in 3D (x, y, z), apply the global camera matrix (rotateY, rotateX, translate, perspective divide) in a helper `proj(p, t)`; all scene geometry goes through it, so the camera drift is free.
- **Globe:** Fibonacci-sphere dots (seeded/deterministic); dot alpha by depth (`z`), front hemisphere brighter. Arcs = great-circle interpolation lifted radially, drawn with a travelling glow head (`dashOffset` by `t`).
- **Devices:** isometric boxes via 3 rhombi each; the cable is a polyline; pulses are points travelling a fixed path with `u = ((t - t0) / d) % 1`.
- **Circuit:** orthogonal traces (seeded), chip square with a 4x4 grid; cells flicker by `MP.hash(cellIndex + floor(t * 6))` thresholds; code words (`"0x7f"`, `"sync"`) drift up and fade from seeded starts.
- **Particle headline:** draw the headline to an offscreen canvas, read alpha, pick about 2500 points with a fixed stride; each particle has a seeded start offset; position = `lerp(start, target, E.outCubic(seg))`; add micro jitter by `noise2`. Dissolve: velocity from noise + upward drift, alpha to 0.
- **Pitfalls:** `shadowBlur` is costly: glow by drawing the same stroke twice (wide low alpha, thin bright) for most elements; no `Math.random`; keep labels at 22 px equivalent minimum for phones.

## Sound plan
How each effect of the brief is covered:
- **Low dark drone under each scene that fades with the crossfades:** a `drone` bed per scene (the music `drone` layer plus `rumble`).
- **Short data blip as each arc leaves the glowing dot and a soft sonar ping with a dark echo as it lands:** `blip` at `arc*`, `ping` shortly after.
- **Quiet fan whirr and a soft servo whine for the devices:** `whir` at `s2`.
- **Tiny key ticks as text types in:** `typing` under labels.
- **Soft tick for each light pulse on the cable:** `tick` at `pulse*`.
- **Tiny digital clicks as chip cells light up over a low building hum:** `click` at `cell*` and `hum` under scene 3.
- **Soft blips for drifting code words:** `blip` (low) sprinkled in scene 3.
- **A rising swell of tiny grains as particles form the headline, a warm chord as it glows, then drifting grains as it dissolves:** `riser` (with `sparkle`) at `form`, `run` of `pad`-like `bell` notes at `glow`, `sparkle`/`hiss` at `dust`.
```json cues
[
  {"at": "s1", "kind": "rumble", "dur": 3.0, "freq": 45, "vol": 0.4},
  {"at": "arc*", "kind": "blip", "freq": 1200, "dur": 0.06, "vol": 0.5},
  {"at": "arc*+0.5", "kind": "ping", "freq": 900, "dur": 1.0, "vol": 0.5},
  {"at": "s2", "kind": "whir", "f0": 120, "f1": 180, "dur": 1.2, "vol": 0.3},
  {"at": "s2+0.4", "kind": "typing", "n": 8, "dt": 0.08, "vol": 0.3},
  {"at": "pulse*", "kind": "tick", "freq": 1800, "vol": 0.45},
  {"at": "s3", "kind": "hum", "freq": 100, "harm": 4, "dur": 3.4, "vol": 0.18},
  {"at": "cell*", "kind": "click", "freq": 2200, "vol": 0.5},
  {"at": "s3+0.8", "kind": "blip", "freq": 700, "dur": 0.08, "vol": 0.3},
  {"at": "form", "kind": "riser", "dur": 1.6, "tone": 0.15, "f0": 1500, "f1": 7000, "vol": 0.4},
  {"at": "form", "kind": "sparkle", "dur": 1.5, "lo": 4000, "hi": 9000, "vol": 0.3},
  {"at": "glow", "kind": "run", "inst": "bell", "from": "A3", "n": 3, "dt": 0.12, "notes": ["A3", "E4", "A4"], "len": 2.4, "vol": 0.5},
  {"at": "dust", "kind": "hiss", "dur": 1.4, "hp": 6500, "pulse": 1, "vol": 0.25}
]
```
```json music
{"preset": "dark-ambient", "bpm": 120, "gain": 1, "duck": 0.4}
```

## Layout by aspect ratio
- **16:9:** diagrams centred, labels beside; headline in the middle third.
- **9:16 / 4:5:** scale diagrams to the width; headline in two lines in the lower middle; labels stay inside `--safe-*`.
- **1:1:** diagrams centred at 80% of the width.

## Loop & ending
The dust drifts away leaving the dark vignette; frame 0 is that same dark frame with the first dots fading up.

## Guardrails
- Use a middle dot between parts of a label, never a dash.
- The camera never stops: it slowly rotates, tilts, drifts and zooms, always calm and smooth, never fast; crossfades are soft.
- Only one warm amber accent: everything inactive stays grey line work on barely-there fills.
- No bright flashes; glow is a soft bloom.

## QA
- Frame in each scene: camera transform clearly different from the previous scene (rotation/zoom drift visible).
- Labels use `·` not `-`; text sizes readable at phone size.
- Frame at `form + 1.2 s`: headline partly formed from particles; at `glow + 0.5 s`: fully formed and readable; at `dust + 1 s`: mostly dust.
- Audio: drone continuous under scenes, no clipping, sparse ticks audible.
