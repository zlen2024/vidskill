---
name: logo-spin-3d
title: 3D logo spin
description: A shiny 3D logo badge that spins one full eased turn, pauses to float and tilt, then spins again, with your brand name still underneath; an intro or outro sting with polished metallic-plastic lighting. For channel intros, outros, brand stings and app launches.
tags: ["3d","brand"]
library: Three.js
sound: true
difficulty: 3
default_duration: 6
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# 3D logo spin

**One-liner:** a polished, slightly metallic 3D badge in the centre (your logo extruded with real depth, or a rounded square with the brand's first letter pressed into it) under a bright front key light, a coloured rim light behind and a soft fill; it does one eased full turn, floats and tilts, then spins again; the brand name stays still below.
**Best for:** video intros and outros (about 5 to 8 s), a brand sting, an app or channel opener.
**Avoid when:** the logo has fine text or photographic detail that cannot extrude well, or you need a longer explanation.

## Inputs to gather
- Logo (SVG or PNG with transparency) or the brand name/first letter. Brand name text. Main brand colour and background colour.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A shiny 3D logo in the centre: an attached logo becomes a 3D badge with real depth; otherwise a rounded square badge with softly bevelled edges and the brand's first letter pressed into its face | `ExtrudeGeometry` from the logo SVG via `SVGLoader` (parsed at build from inline SVG text), bevel enabled; fallback rounded-rect shape + letter shape cut/embossed |
| L2 | Polished, slightly metallic plastic with a bright front key light, a coloured rim light from behind and a soft fill | `MeshPhysicalMaterial` (metalness 0.6, roughness 0.28, clearcoat 0.6) + generated environment (a small gradient `PMREM` from a canvas); DirectionalLight key, coloured backlight, hemisphere fill |
| L3 | One full turn with a smooth ease in and out, pauses to float and gently tilt, then spins again | Rotation Y = `2*PI * E.inOutCubic(seg)` in two spins separated by a float phase with `sin` tilts |
| L4 | The brand name or message sits still under the logo and stays easy to read | DOM text under the canvas |
| T1 | A bold, clean sans (capitals, wide letter spacing) | Montserrat 700, `letter-spacing: 0.3em` |
| T2 | Brand colours if given (logo in the main colour over a soft radial glow of a darker background colour), else a warm gold logo, a cool blue rim light and a deep indigo background | Tokens below |
| S1 | A smooth whoosh on every spin swelling and fading with the eased speed and pulsing as the broad faces sweep round, soft metallic sparkles when the light catches the logo, a gentle rounded hit with a warm metallic ring as it settles, a quiet shimmering tone while it floats | Cue table below |
| S2 | A short epic brand-intro bed about 80 bpm, one bar per spin: a subtle cinematic hit at the start, warm brass-like pads that swell, a soft low string pulse, a gentle riser back into the start; loops | `epic-intro` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length, so it works as an intro or outro (5 to 8 s) | scaffold `--duration 6` |
| O3 | A Three.js scene in HTML rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #120e2b;
--ink: #ffffff;
--accent: #ffb547;
--rim: #6bd5ff;
```
```json fonts
[{"family": "Montserrat", "id": "montserrat", "variable": true, "weightRange": "100 900", "role": "brand name"}]
```

## Beat sheet
```json beats
{"bpm": 80, "events": [
  {"id": "hit", "at": 0.0, "label": "cinematic hit, logo appears"},
  {"id": "spin1", "at": 0.05, "label": "first full turn (one bar)"},
  {"id": "settle", "at": 0.42, "label": "settles with a metallic ring"},
  {"id": "float", "at": 0.46, "label": "floats and tilts"},
  {"id": "glint", "repeat": {"n": 3, "fromFrac": 0.12, "everyFrac": 0.09}, "label": "light catches the logo"},
  {"id": "spin2", "at": 0.7, "label": "second turn"},
  {"id": "riser", "at": 0.9, "label": "riser back to the start"}
]}
```

## Build recipe
- **Geometry:** for a logo SVG, parse paths with `SVGLoader`, `shapes = SVGLoader.createShapes(path)`, `new ExtrudeGeometry(shapes, {depth: 24, bevelEnabled: true, bevelThickness: 4, bevelSize: 3, bevelSegments: 5})`, center and scale to fit; flip Y (SVG is y-down). Fallback badge: rounded-rectangle `Shape`, extrude with bevel, letter as a smaller extruded shape on the front face.
- **Look:** metallic materials need an environment: generate a small studio canvas (soft boxes as white rectangles on gradient) and use `PMREMGenerator.fromEquirectangular`; render inside `hf-seek` with `renderer.setPixelRatio(1)`.
- **Motion:** `rotationY(t) = 2*Math.PI * (E.inOutCubic(seg(t, T.spin1, spinDur, E.linear)) + E.inOutCubic(seg(t, T.spin2, spinDur, E.linear)))`; float: `y = 0.06 * sin(...)`, tilt `rotationX = 0.12 * sin(...)`.
- **Glow:** a soft radial background gradient in DOM (darker brand colour) behind the canvas; no post-processing.
- **Verified build (examples/logo-spin-3d):** rounded-square extrude 3.2 x 3.2 x 0.5 (bevel 0.12), letter "A" as an extruded polygon with a hole, `BADGE = 0.5` scale so it is ~55% of a 9:16 frame width with FOV 30 at z 9.5 (at scale 1 it overflows and covers the name). Backface is blank at 180 deg: add a mirrored letter on the back if the spin is slow. The site sample uses a stronger radial glow behind the badge (`#3a2a7a` centre, about 60% opacity) and a slightly larger badge: raise the glow, keep BADGE 0.5 to 0.6. Full-bleed canvas needs `data-layout-allow-overflow`; `check` may warn 2.9:1 contrast on the name when the gold face passes behind it, keep the name below the badge (top 68%).
- **Pitfalls:** avoid z-fighting of the letter face (offset by 0.5); keep the SVG path count low; textures inline; do not fetch the logo at render time (embed it).

## Sound plan
How each effect of the brief is covered:
- **A smooth whoosh on every spin that swells and fades with the eased speed and pulses softly as the broad faces sweep round:** `whoosh` (peak) at `spin1` and `spin2`, with a soft `hum` tremble.
- **Soft metallic sparkles when the light catches the logo:** `sparkle` at `glint*`.
- **A gentle rounded hit with a warm metallic ring as it settles:** `impact` (soft) + `bell` at `settle`.
- **A quiet shimmering tone while it floats:** `swell` / `hum` at `float`.
```json cues
[
  {"at": "hit", "kind": "impact", "dur": 1.4, "freq": 55, "vol": 0.8, "verb": 0.4},
  {"at": "spin1", "kind": "whoosh", "dir": "peak", "dur": 1.6, "f0": 250, "f1": 3500, "vol": 0.55},
  {"at": "glint*", "kind": "sparkle", "dur": 0.6, "lo": 4000, "hi": 9500, "vol": 0.4},
  {"at": "settle", "kind": "impact", "dur": 0.8, "freq": 90, "vol": 0.55},
  {"at": "settle", "kind": "bell", "freq": 660, "dur": 2.0, "vol": 0.5},
  {"at": "float", "kind": "swell", "dur": 1.6, "freq": 2400, "vol": 0.25},
  {"at": "spin2", "kind": "whoosh", "dir": "peak", "dur": 1.6, "f0": 250, "f1": 3500, "vol": 0.55},
  {"at": "riser", "kind": "riser", "dur": 0.6, "tone": 0.3, "vol": 0.4}
]
```
```json music
{"preset": "epic-intro", "bpm": 80, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- Logo centred slightly above the middle; brand name below it. In 9:16 keep the badge about 55% of the width and the name inside the safe zone; in 16:9 the badge about 40% of the height.

## Loop & ending
The riser leads back to the start; the badge returns to face-forward with the same float pose as frame 0.

## Guardrails
- The brand text stays still under the logo so it stays readable; do not spin the text.
- Keep the polished look believable: metallic plastic, not mirror chrome; no motion blur smears.
- Never fetch the logo over the network at render time: embed it.

## QA
- Frame at `spin1 + 40%`: logo edge-on at some angle with visible extrusion and bevel highlight.
- Frame at `float + 0.5 s`: face-forward, gently tilted, rim light visible.
- Brand text sharp and legible; badge not clipped at any rotation.
- Audio: two spin whooshes, one settle hit, no clipping.
