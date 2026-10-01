---
name: product-turntable
title: Product turntable
description: A premium 3D product shot: your product turns slowly on a studio pedestal with soft warm light, a glint sweeping across, callouts drawing out from dots, and a name-and-price card sliding up. For bottles, cosmetics, gadgets, packaging and luxury-style ads.
tags: ["product","3d","promo"]
library: Three.js
sound: true
difficulty: 5
default_duration: 12
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Product turntable

**One-liner:** a warm sand backdrop, an ivory pedestal with a turntable top, and the product from the request standing on it, turning slowly and easing slower while its front faces the camera; soft studio light with gentle reflections, a soft floor shadow, a bright glint sweeping across once or twice; key features pop out as callouts (dot, thin leader line, short label), then a clean card with the name and price slides up.
**Best for:** bottles, perfumes, skincare, coffee, gadgets, packaged goods, a luxury-style ad.
**Avoid when:** the product cannot be approximated as a simple 3D shape and no photo is available to match its shape, colour and label.

## Inputs to gather
- Product type and shape (bottle, box, jar, can, phone), colours and label text, product photos if any (match shape/colour/label). 3 to 4 feature callouts (short). Name and price. Brand colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A premium 3D product shot: the product stands on a round pedestal with a turntable top; if photos are attached match the product's shape, colour and label | Three.js: pedestal = two cylinders; product = lathe geometry (`LatheGeometry`) or a rounded box; label = canvas texture (from the photo or generated) |
| L2 | The turntable turns slowly and smoothly and slows down a little while the front of the product faces the camera | `rotY(t) = w * t - k * sin(...)` shaping angular speed dips at the front |
| L3 | Soft studio lighting: warm key, gentle reflections, soft glow on the backdrop and soft floor shadow; a bright glint sweeps across once or twice | `MeshPhysicalMaterial` + generated env map (soft boxes); shadow = blurred ellipse texture; glint = a moving bright strip in the env or a gradient overlay masked to the product |
| L4 | Key features pop out as small callouts one after another: a dot on the product, a thin leader line drawing outwards, a short label | Anchor points on the product projected to screen each frame; DOM label + SVG line drawn with `strokeDashoffset` |
| L5 | A clean card with the product name and price slides up; at the end the callouts fold away and the card fades out | Card `y 100% to 0`; fold = leader lines reverse then opacity |
| L6 | Clean, minimal and calm like a luxury ad; the product stays in the middle and everything stays readable | Generous space; only 3 to 4 callouts |
| T1 | Elegant serif (Cormorant Garamond) for the product name; clean small-caps sans with wide letter spacing (Inter Tight) for callouts | Cormorant Garamond 600; Inter Tight 500 caps |
| T2 | Brand colours if given, else warm sand backdrop, ivory pedestal, espresso text, gold details and an amber product colour | Tokens below |
| S1 | A very soft mechanical hum from the turntable rising and falling a little with its speed; a bright glassy shimmer with tiny glass sparkles each glint; a soft click per callout dot, a thin airy whoosh as its line draws and a soft pop for its label; a felt-like swoosh with a gentle two-note chime as the card slides up; quiet reversed swishes as callouts fold away | Cue table below |
| S2 | Minimal airy luxury bed about 80 bpm: warm soft pads, a few gentle piano notes with a light echo, a soft round pulse, a very quiet shaker; loops with the turn | `luxury-minimal` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 12` |
| O3 | A Three.js scene in HTML rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #ece4da;
--ink: #2b2420;
--accent: #c9a36b;
--pedestal: #f4efe8;
--product: #e0892f;
```
```json fonts
[
  {"family": "Cormorant Garamond", "id": "cormorant-garamond", "weights": [500, 600], "role": "product name"},
  {"family": "Inter Tight", "id": "inter-tight", "variable": true, "weightRange": "100 900", "role": "callouts"}
]
```

## Beat sheet
```json beats
{"bpm": 80, "events": [
  {"id": "start", "at": 0.0, "label": "turntable turning"},
  {"id": "glint", "repeat": {"n": 2, "fromFrac": 0.25, "everyFrac": 0.4}, "label": "light glint sweeps across"},
  {"id": "callout", "repeat": {"n": 3, "fromFrac": 0.32, "everyFrac": 0.1}, "label": "callouts: dot, line, label"},
  {"id": "card", "at": 0.7, "label": "name and price card slides up"},
  {"id": "fold", "at": 0.9, "label": "callouts fold away, card fades"}
]}
```

## Build recipe
- **Product shape:** describe the silhouette as a profile array and use `LatheGeometry` (bottle: body, shoulder, neck, cap); label = a `CanvasTexture` wrapped on a cylinder segment (`CylinderGeometry` with `thetaLength`); transparent glass: `MeshPhysicalMaterial({transmission: 0.9, thickness: 1, roughness: 0.05})`, otherwise opaque `roughness 0.35`.
- **Environment:** create a canvas with 3 soft rectangles (key, fill, rim) on a warm gradient and use `PMREMGenerator.fromEquirectangular` for reflections; render inside `hf-seek`, DPR 1.
- **Turn:** `angle(t) = base + 0.9 * t - 0.35 * Math.sin(0.9 * t + phase)` gives a slowdown once per turn; face-front moment aligns with `callout1`.
- **Callouts:** choose model-space anchors, project with `vec.project(camera)` each frame; the line draws from the dot outward to a fixed label position at the side of the frame.
- **Pitfalls:** transmission materials are slow in software GL: use a simpler opaque glass look if the render time is high; keep the backdrop a flat gradient (no fog); labels must not cross the product.

## Sound plan
How each effect of the brief is covered:
- **A very soft mechanical hum from the turntable that rises and falls a little with its speed:** `hum` (low) under the whole video.
- **A bright glassy shimmer with tiny glass sparkles each time the light glint sweeps across:** `sparkle` + `chime` at `glint*`.
- **A soft click as each callout dot appears, a thin airy whoosh as its line draws and a soft pop for its label:** `click` + `swish` + `pop` at `callout*`.
- **A felt-like swoosh with a gentle two-note chime as the card slides up:** `swish` (soft) + `run` of two `chime` notes at `card`.
- **Quiet reversed swishes as the callouts fold away and the card fades:** `swish` with `rev` at `fold`.
```json cues
[
  {"at": "start", "kind": "hum", "freq": 70, "harm": 3, "dur": "D", "vol": 0.14},
  {"at": "glint*", "kind": "sparkle", "dur": 0.8, "lo": 4500, "hi": 10000, "vol": 0.4},
  {"at": "glint*", "kind": "chime", "freq": 1760, "dur": 1.2, "vol": 0.35},
  {"at": "callout*", "kind": "click", "freq": 1800, "vol": 0.5},
  {"at": "callout*+0.1", "kind": "swish", "dur": 0.3, "vol": 0.3},
  {"at": "callout*+0.4", "kind": "pop", "freq": 640, "vol": 0.45},
  {"at": "card", "kind": "swish", "dur": 0.4, "f0": 800, "f1": 2500, "vol": 0.4},
  {"at": "card+0.2", "kind": "run", "inst": "chime", "from": "G5", "n": 2, "dt": 0.18, "len": 1.4, "vol": 0.45},
  {"at": "fold", "kind": "swish", "dur": 0.4, "rev": true, "vol": 0.3},
  {"at": "fold+0.25", "kind": "swish", "dur": 0.4, "rev": true, "vol": 0.3}
]
```
```json music
{"preset": "luxury-minimal", "bpm": 80, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16 / 4:5:** product centred in the upper 60%; callouts alternate left/right with short leaders; card slides up in the lower third above the safe zone.
- **16:9:** product centred; callouts left and right; card lower centre.
- **1:1:** product centred; card lower.

## Loop & ending
Callouts fold away and the card fades while the turntable keeps turning; the product returns to the front-facing angle at frame 0 (make `angle(D) - angle(0)` a multiple of 2*PI).

## Guardrails
- Clean, minimal and calm like a luxury ad: the product stays in the middle and everything is easy to read.
- Match the product's shape, colour and label when photos are attached.
- Do not invent features or prices: callouts and price come from the user.

## QA
- Frame at `callout1 + 0.6 s`: dot, line and label complete, label not crossing the product.
- Frame at `card + 0.8 s`: card legible with name and price; product still centred.
- Reflections visible but not blown out; last frame's angle equals frame 0's.
