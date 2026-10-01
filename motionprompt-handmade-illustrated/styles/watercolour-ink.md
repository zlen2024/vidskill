---
name: watercolour-ink
title: Watercolour ink
description: Calm artistic watercolour on cold-press paper: washes bloom and bleed with wet edges and dry darker rims, an ink brush branch paints itself stroke by stroke, the headline is painted letter by letter and a red seal stamps down. For art, tea, wellness, cultural and brand statements with a hand-painted feel.
tags: ["handmade","text","brand"]
library: WebGL
sound: true
difficulty: 5
default_duration: 12
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Watercolour ink

**One-liner:** textured paper is always visible; soft coloured washes bloom outward with feathered wet edges that dry into darker rims and mix where they meet; an ink brush painting (a flowering branch or bamboo) paints itself stroke by stroke with dry-brush ends while a few petals or leaves drift down; the headline appears as if brushed letter by letter with a short line under it; a small red seal stamps beside it; at the end everything fades back to clean paper.
**Best for:** tea, art, wellness, boutique or cultural brands, quiet statements, an East-Asian inspired look.
**Avoid when:** you need fast energy or hard graphic shapes.

## Inputs to gather
- Headline and a short line. A subject for the ink painting (plum branch, bamboo, orchid, pine). Brand colours (paper stays warm).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | Calm and artistic, like a painting coming to life on textured cold-press paper; show the paper grain the whole time | Paper texture generated once (seeded fBm noise) and multiplied over everything |
| L2 | Soft watercolour washes bloom and bleed outward with wet feathered edges that dry into darker rims; pigment settles into the paper grain; colours mix where washes meet | WebGL fragment shader (or Canvas 2D fallback): a growing field `r(t)` with noise-warped edge, edge-darkening term from the gradient of the field, grain modulation, colour mixing by multiplicative blend |
| L3 | A simple ink brush painting paints itself stroke by stroke (a flowering branch or bamboo) with dry-brush streaks at the ends; a few petals or leaves drift down | Strokes as polylines with variable width and a dry-brush alpha noise at the tail; reveal by arc length; petals as small rotated ellipses following `t` |
| L4 | The headline appears as if painted with a brush, letter by letter, with a short line under it; a small red seal stamp presses down beside it | Letter reveal with a brush-shaped mask; seal = red rounded square with a simple glyph or initial, pressed by scale 1.15 to 1 |
| L5 | Plenty of empty paper and slow gentle timing; at the end everything fades back to clean paper | Long holds; final fade |
| T1 | A brushy hand-painted script (Kaushan Script) for the headline and an elegant italic serif (Cormorant Garamond) for the small line | Kaushan Script 400, Cormorant Garamond italic 500 |
| T2 | Brand colours if given, else warm paper, indigo ink, muted indigo, dusty rose, ochre, seal red | Tokens below |
| S1 | A wet brush touch and a soft water bloom with tiny bubbles as each wash spreads, a soft bristle drag for each brush stroke (loudest where the brush moves fastest), tiny ink dabs, a quick wet brush flick per letter, a delicate chime and faint flutter as each petal falls, a soft wooden press when the seal stamps, a gentle rinse of water as everything fades to paper | Cue table below |
| S2 | Calm slow bed inspired by East Asian music about 80 bpm: soft zither plucks on a pentatonic scale, a breathy flute melody, a quiet low drone; loops | `east-asian-zither` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 12` |
| O3 | HTML animation with Canvas/WebGL rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #f3ede0;
--ink: #26314d;
--accent: #b4382c;
--indigo: #6377ad;
--rose: #c67b86;
--ochre: #cda45e;
```
```json fonts
[
  {"family": "Kaushan Script", "id": "kaushan-script", "weights": [400], "role": "brushed headline"},
  {"family": "Cormorant Garamond", "id": "cormorant-garamond", "weights": [500], "styles": ["italic"], "role": "small line"}
]
```

## Beat sheet
```json beats
{"bpm": 80, "events": [
  {"id": "wash", "repeat": {"n": 3, "fromFrac": 0.03, "everyFrac": 0.09}, "label": "each wash blooms"},
  {"id": "stroke", "repeat": {"n": 5, "fromFrac": 0.3, "everyFrac": 0.07}, "label": "ink brush strokes"},
  {"id": "petal", "repeat": {"n": 4, "fromFrac": 0.5, "everyFrac": 0.05}, "label": "petals fall"},
  {"id": "letter", "repeat": {"n": 8, "fromFrac": 0.58, "everyFrac": 0.03}, "label": "headline letters painted"},
  {"id": "seal", "at": 0.85, "label": "seal stamps"},
  {"id": "rinse", "at": 0.92, "label": "fade back to paper"}
]}
```
Match the `letter` repeat to the headline length.

## Build recipe
- **Wash shader:** for each wash `i`: `d = length(uv - c_i) + 0.08 * fbm(uv * 6 + i)`; coverage `a = smoothstep(r, r - 0.02, d)`; wet edge = `smoothstep(r - 0.05, r, d) * a` darkens the rim; pigment granulation = `mix(1, paperNoise, 0.35)`; final colour = paper multiplied by `mix(white, wash, a * strength)`. `r(t) = r0 + growth * E.outCubic(seg(t, T.washI, 2.4))`. Uniforms only; render in `hf-seek`.
- **Ink strokes:** define each stroke as a Catmull-Rom path with a width profile (thick to thin); draw incrementally up to `u(t)`; near the end lower the alpha with a noise mask for the dry-brush streaks.
- **Headline:** render letters to an offscreen canvas and reveal each letter with a brush-shaped alpha wipe (left to right) so letters look painted.
- **Seal:** red rounded square with an inner simple character or initial cut out; a slight rotation and a soft edge; multiply blend.
- **Pitfalls:** keep all randomness seeded; WebGL fallback to a Canvas 2D version using blurred radial gradients is acceptable; never let the text sit on a dark wash (contrast).

## Sound plan
How each effect of the brief is covered:
- **A wet brush touch and a soft water bloom with tiny bubbles as each wash spreads:** `swell` + a few `pop`/`drip` at `wash*`.
- **A soft bristle drag for each brush stroke, loudest where the brush moves fastest:** `scratch` at `stroke*`.
- **Tiny ink dabs:** `pop` (very short, low) at stroke ends.
- **A quick wet brush flick for each letter:** `swish` (short) at `letter*`.
- **A delicate chime and a faint flutter as each petal falls:** `chime` (high, quiet) + `paper` at `petal*`.
- **A soft wooden press when the red seal stamps down:** `stamp`/`knock` at `seal`.
- **A gentle rinse of water as everything fades back to paper:** `pour` (soft) at `rinse`.
```json cues
[
  {"at": "wash*", "kind": "swell", "dur": 1.8, "freq": 500, "vol": 0.35},
  {"at": "wash*+0.2", "kind": "drip", "freq": 800, "vol": 0.25},
  {"at": "wash*+0.5", "kind": "drip", "freq": 1000, "vol": 0.2},
  {"at": "stroke*", "kind": "scratch", "dur": 0.7, "freq": 1600, "jitter": 0.5, "vol": 0.4},
  {"at": "stroke*+0.65", "kind": "pop", "freq": 200, "dur": 0.06, "vol": 0.3},
  {"at": "letter*", "kind": "swish", "dur": 0.12, "f0": 1500, "f1": 4500, "vol": 0.3},
  {"at": "petal*", "kind": "chime", "freq": 2093, "dur": 1.2, "vol": 0.25},
  {"at": "petal*", "kind": "paper", "dur": 0.25, "vol": 0.15},
  {"at": "seal", "kind": "stamp", "dur": 0.3, "vol": 0.7},
  {"at": "rinse", "kind": "pour", "dur": 1.8, "vol": 0.3}
]
```
```json music
{"preset": "east-asian-zither", "bpm": 80, "gain": 1, "duck": 0.4}
```

## Layout by aspect ratio
- **9:16 / 4:5:** painting occupies the upper 60% (branch entering from the left or top), headline and line in the lower third above the safe zone, seal to the right of the headline.
- **16:9:** branch on the right, headline left of centre.
- **1:1:** painting top-right, headline lower-left.

## Loop & ending
Washes, painting, text and seal fade into clean paper (frame 0).

## Guardrails
- Keep plenty of empty paper and slow, gentle timing.
- Show the paper grain the whole time; pigment settles into the grain.
- Text stays readable: never place the headline over a dark wash.

## QA
- Frame at `wash2 + 1.5 s`: wet feathered edge visible with a darker rim; two washes mixing where they meet.
- Frame at `stroke5 + 0.5 s`: branch complete with dry-brush tips; petals drifting.
- Frame at `seal + 0.4 s`: seal pressed, headline legible; last frame is clean paper.
