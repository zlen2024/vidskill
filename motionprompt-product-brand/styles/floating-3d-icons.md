---
name: floating-3d-icons
title: Floating 3D icons
description: Glossy, soft "Blender style" 3D icons and cards burst out of a floating monitor (or phone, laptop, product) and drift around it on a pink-to-purple gradient, while the headline rises word by word and a tagline sits in a frosted-glass pill. For social promos, cafes, apps, creators and service intros.
tags: ["3d","social","promo"]
library: Three.js
sound: true
difficulty: 5
default_duration: 12
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Floating 3D icons

**One-liner:** a bright soft 3D scene on a smooth pink, purple and blue gradient with a warm coral glow in one corner, tiny white stars and dots and a soft coloured floor shadow; a glossy 3D device (a desktop monitor by default) floats and bobs; chunky rounded icons and cards burst out of its screen one by one with a springy pop and star sparkles, then float around at different depths while the camera drifts; the headline rises word by word (key word in a pink-to-purple gradient) with a tagline in a frosted-glass pill.
**Best for:** creator and social-media services, cafes and shops (coffee cup, cake, map pin, star rating), app features, playful launches.
**Avoid when:** the tone is serious; you need real photos.

## Inputs to gather
- Headline (with the key word) and tagline (short). Topic for the icons (4 to 6 icons). Device type (monitor by default, phone, laptop, or the product). Brand colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A bright soft 3D scene on a smooth pink-to-purple-to-blue gradient with a warm coral glow in one corner, tiny white stars and dots and a soft coloured shadow on the floor | Gradient background (canvas/DOM behind a transparent WebGL canvas); coral radial glow; star sprites; floor = a blurred coloured ellipse |
| L2 | In the middle a glossy 3D device floats and gently bobs: a desktop monitor by default, or a phone, laptop or my product; tilted so it clearly looks 3D | Device from rounded boxes (bevelled `ExtrudeGeometry`); screen plane with a glowing gradient; bob `y = 0.08 * sin(t)`, tilt `rotY = -0.35` |
| L3 | Chunky rounded 3D icons and cards burst out of its screen one by one, each with a springy pop and a few little sparkle stars, then float around it at different depths and angles; pick icons that match the topic | Icon builders (cup, cake, pin, star, photo card, heart in a bubble, play, chart, music note) from primitives; launch path from the screen centre to an orbit slot with `MP.spring` scale; sparkle sprites at spawn |
| L4 | Soft "Blender style" 3D: rounded bevels, glossy clearcoat, gentle gradients, a soft rim light, no hard edges; one of them frosted glass, a little see-through | `MeshPhysicalMaterial` (clearcoat 1, roughness 0.25) with pastel colours; frosted one uses `transmission 0.8, roughness 0.4` (or a translucent fallback) |
| L5 | While they float, the camera drifts slowly around the scene so the depth shows | Camera azimuth `= 0.35 * sin(2*PI*t/D)`; icons keep bobbing |
| L6 | My headline rises in word by word in a big bold rounded font, the key word in a pink-to-purple gradient, then a short tagline appears in a frosted-glass pill; keep the headline clear of the icons | DOM headline layered above the canvas; pill with `backdrop-filter: blur()`; icons' orbit avoids the text zone |
| L7 | At the end the icons swirl back into the screen and the device floats away so it loops | Reverse the launch paths with a spiral; device `y` up and fade |
| L8 | Keep every line of text short and readable in a second | Headline max 4 words, tagline max 6 |
| T1 | A bold rounded sans (Nunito Black) for the headline and a lighter weight for the tagline | Nunito 900 and 500 |
| T2 | Brand colours if given, else lavender background, deep purple text, hot pink, violet, soft coral and sky blue glow | Tokens below |
| S1 | A warm rising swell as the device floats in and a soft round "boop" as it settles, a bubbly pop as each icon bursts out, a quick sparkle chime as each one lands, light ticks as the headline words appear, a glassy whoosh as the icons swirl back into the screen, a soft falling blip as the device floats away | Cue table below |
| S2 | An upbeat modern pop bed about 120 bpm: soft four on the floor kick, claps on 2 and 4, off-beat hi-hats, bouncy bass, plucky synth arpeggio over a bright major chord loop; under the effects; loops | `pop-modern` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 12` |
| O3 | A Three.js scene with HTML text on top rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #ecc8ff;
--ink: #2b1055;
--accent: #ff3fb4;
--violet: #7b5cff;
--coral: #ff8f7a;
--sky: #8fb6ff;
```
```json fonts
[{"family": "Nunito", "id": "nunito", "variable": true, "weightRange": "200 1000", "role": "headline and tagline"}]
```

## Beat sheet
```json beats
{"bpm": 120, "events": [
  {"id": "device", "at": 0.0, "label": "device floats in, boop"},
  {"id": "icon", "repeat": {"n": 5, "fromFrac": 0.12, "everyFrac": 0.08}, "label": "an icon bursts out"},
  {"id": "word", "repeat": {"n": 4, "fromFrac": 0.5, "everyFrac": 0.06}, "label": "headline words rise"},
  {"id": "pill", "at": 0.78, "label": "tagline pill appears"},
  {"id": "swirl", "at": 0.88, "label": "icons swirl back into the screen"},
  {"id": "away", "at": 0.94, "label": "device floats away"}
]}
```

## Build recipe
- **Materials:** pastel `MeshPhysicalMaterial` with clearcoat; a generated studio environment for reflections; rim light = a coloured directional light from behind; no post-processing.
- **Icons:** build from `RoundedBox`-like bevelled boxes, capsules, spheres and tori: coffee cup = cylinder + torus handle + saucer; cake = stacked cylinders with a cherry; map pin = cone + sphere; star = extruded 5-point star with a bevel; photo card = thin bevelled box with a picture canvas texture; heart = extruded heart shape; play button = rounded triangle on a disc.
- **Orbits:** each icon has `(radius, height, angle0, speed)`; position = `centre + (r cos(a0 + w t), h + 0.1 sin(...), r sin(a0 + w t))`; keep a keep-out zone in front of the headline in screen space (push icons behind the text or to the sides).
- **Launch:** from the screen centre `p0` to `p1` on the orbit with `E.outBack`; scale from 0 with `MP.spring`; spawn 6 sparkle stars (sprites) that fade in 0.5 s.
- **Frosted glass:** `transmission` is slow in software GL: if the check flags performance, use an opaque semi-transparent material with a lighter colour instead.
- **Pitfalls:** DPR 1; keep the polygon count under about 150k; text in DOM (crisp) above the canvas.

## Sound plan
How each effect of the brief is covered:
- **A warm rising swell as the device floats in and a soft round "boop" as it settles:** `swell` + `boop` at `device`.
- **A bubbly pop as each icon bursts out:** `pop` at `icon*`, rising pitch.
- **A quick sparkle chime as each one lands:** `sparkle` + `chime` shortly after each `icon*`.
- **Light ticks as the headline words appear:** `tick` at `word*`.
- **A glassy whoosh as the icons swirl back into the screen:** `whoosh` (peak) + `sparkle` at `swirl`.
- **A soft falling blip as the device floats away:** a falling `chirp` at `away`.
```json cues
[
  {"at": "device", "kind": "swell", "dur": 1.4, "freq": 600, "vol": 0.45},
  {"at": "device+1.0", "kind": "boop", "freq": 300, "dur": 0.2, "vol": 0.6},
  {"at": "icon*", "kind": "pop", "freq": 520, "vol": 0.75, "rise": {"param": "freq", "from": 520, "by": 60}},
  {"at": "icon*+0.35", "kind": "sparkle", "dur": 0.5, "vol": 0.3},
  {"at": "icon*+0.35", "kind": "chime", "freq": 1568, "dur": 0.8, "vol": 0.3},
  {"at": "word*", "kind": "tick", "freq": 2600, "vol": 0.5},
  {"at": "pill", "kind": "pop", "freq": 700, "vol": 0.5},
  {"at": "swirl", "kind": "whoosh", "dir": "peak", "dur": 0.9, "f0": 500, "f1": 5000, "vol": 0.5},
  {"at": "swirl", "kind": "sparkle", "dur": 0.8, "vol": 0.35},
  {"at": "away", "kind": "chirp", "f0": 1000, "f1": 300, "dur": 0.4, "vol": 0.45}
]
```
```json music
{"preset": "pop-modern", "bpm": 120, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16 / 4:5:** device centred in the middle band, headline in the upper third above it, tagline pill below the device above the safe zone; icons orbit in the sides and depth.
- **16:9:** headline left, device centre-right, icons around it.
- **1:1:** headline top, device below centre.

## Loop & ending
Icons swirl into the screen, the device floats up and away; the gradient with stars is frame 0.

## Guardrails
- Soft "Blender style" 3D: rounded bevels, glossy clearcoat, gentle gradients, no hard edges.
- Keep the headline clear of the icons and every line of text short and readable in a second.
- Keep the mood bright and soft: no harsh shadows.

## QA
- Frame at `icon3 + 0.5 s`: three icons in flight or orbit, sparkles at the newest one, headline not covered.
- Frame at `pill + 0.5 s`: headline and pill legible; one icon frosted and see-through.
- Camera azimuth visibly different between `device + 1 s` and `swirl - 1 s`.
