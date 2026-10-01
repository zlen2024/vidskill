---
name: neon-sign
title: Neon sign
description: Neon tube lettering that stutters on letter by letter over a dark brick wall at night, with a buzzing neon icon, a white-hot core, coloured bloom and a light pool on the bricks. For bars, cafes, shop signs, retro greetings and short text hooks.
tags: ["text","retro"]
library: CSS
sound: true
difficulty: 3
default_duration: 8
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Neon sign

**One-liner:** the message is a glowing neon tube sign mounted, slightly crooked, on a dark red brick wall: it starts dark, flickers on letter by letter with a realistic stutter, an icon buzzes on after the words, everything glows with a white-hot core and a pool of light on the bricks, and near the end it fades off so the video loops.
**Best for:** a shop, bar or cafe name, an opening, a short slogan, a retro or nightlife greeting. One to three lines of text.
**Avoid when:** the text is long or the tone is corporate.

## Inputs to gather
- The words (1 to 3 short lines) and an icon that fits (heart, coffee cup, star, cocktail...). Brand colours (pink words, amber icon by default).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | The message is a glowing neon tube sign on a dark brick wall at night; the sign is tilted very slightly, as if hung by hand | Canvas brick wall (seeded rows of bricks) + sign group rotated about -1.5 degrees |
| L2 | It starts switched off (dark glass tubes visible); then tubes flicker on letter by letter with a realistic stutter: a few quick blinks, then a steady glow | Per-letter `on(t)` = a seeded on/off pattern of 3 to 5 blinks then steady; drawn as opacity of the lit layer over the dark glass layer |
| L3 | A small neon icon above the words (heart, cup, star) buzzes on just after the words | Icon as an SVG stroke path, same tube treatment, its own blink pattern |
| L4 | Once lit: white-hot core, soft coloured bloom, a warm pool of light spilling on the bricks; now and then one tube gives a brief flicker | Tube = 3 stacked strokes (wide coloured low alpha, mid, thin near-white core); light pool = radial gradient on the wall; occasional single-letter dip |
| L5 | Near the end the sign fades off so the video can loop | Global lit factor eases to 0 by the last 0.5 s |
| L6 | Keep the flicker gentle and brief, with no fast full-screen flashing | Flicker changes only the sign brightness (not the wall); no more than 3 blinks per second |
| T1 | A flowing script font that looks like bent glass tubing (Yellowtail) on one to three lines | Yellowtail 400, outlined text stroke to look like tubes |
| T2 | Brand colours if given, else hot pink words, warm amber icon, near-white core, dark red brick wall | Tokens below |
| S1 | Electric crackle and buzz on every blink (one stutter of sound per blink, a tiny tick when it drops out), a bright zap as the icon buzzes on, a low steady neon hum that swells as more is lit, a brief crackle when a tube flickers, a soft power-down hum at the fade | Cue table below |
| S2 | Quiet late-night lo-fi bed about 96 bpm: soft electric piano jazz chords, round bass, brushed drums, gentle kick, lazy swing; loops | `lofi` at 96 bpm |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 8` |
| O3 | HTML with CSS glow and a canvas brick wall rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #2a1512;
--ink: #fff4f8;
--accent: #ff4f9a;
--accent2: #ffb13b;
```
```json fonts
[{"family": "Yellowtail", "id": "yellowtail", "weights": [400], "role": "sign lettering"}]
```

## Beat sheet
```json beats
{"bpm": 96, "events": [
  {"id": "dark", "at": 0.0, "label": "sign dark"},
  {"id": "letter", "repeat": {"n": 8, "fromFrac": 0.1, "everyFrac": 0.055}, "label": "each letter stutters on"},
  {"id": "icon", "at": 0.6, "label": "icon buzzes on"},
  {"id": "flicker", "at": 0.78, "label": "one tube flickers briefly"},
  {"id": "fade", "at": 0.9, "label": "sign fades off"}
]}
```
Match the `letter` repeat count to the number of characters (skip spaces) and keep the last letter lit by `icon`.

## Build recipe
- **Layers:** wall canvas (static, drawn once but re-drawn per seek is fine), dark glass layer (the text with a dull grey-pink stroke), lit layer (the same text with neon strokes) whose per-letter alpha comes from the blink patterns, bloom layer (blurred copy at low alpha), light-pool gradient on the wall.
- **Per-letter pattern:** `onAt = T.letter{i}`; alpha(t) = 0 before; then a seeded sequence of durations `[0.05, 0.07, 0.04, 0.09]` alternating off/on; then 1. Compute from `t - onAt` and `MP.hash(i, seed)`; no state.
- **Glow without huge blur:** stroke text three times with widths 26, 12, 4 px (alpha 0.12, 0.35, 1) instead of `shadowBlur` on the whole canvas; for the pool use a radial gradient.
- **Sign tilt:** rotate the sign container with `rotation: -1.5`; the wall stays straight.
- **Pitfalls:** flashing safety: clamp the brightness delta; never toggle the whole frame; keep text large enough to read at phone size.

## Sound plan
How each effect of the brief is covered:
- **Electric crackle and buzz each time a tube blinks on, one stutter of sound for every blink, a tiny tick when it drops out:** `buzz` + `crackle` at `letter*`, `tick` for drop-outs.
- **A small bright zap as the icon buzzes on:** `zap` at `icon`.
- **A low steady neon hum that swells as more of the sign is lit:** `hum` (100 Hz, mains) starting at the first letter with rising volume.
- **A brief crackle when a tube flickers:** `crackle` at `flicker`.
- **A soft power-down hum as the sign fades off:** falling `whir` + `hum` fade at `fade`.
```json cues
[
  {"at": "letter*", "kind": "buzz", "freq": 120, "dur": 0.22, "vol": 0.55},
  {"at": "letter*", "kind": "crackle", "dur": 0.25, "density": 90, "vol": 0.5},
  {"at": "letter*+0.12", "kind": "tick", "freq": 1600, "vol": 0.3},
  {"at": "letter1", "kind": "hum", "freq": 100, "harm": 6, "dur": "until:fade", "vol": 0.3},
  {"at": "icon", "kind": "zap", "dur": 0.22, "vol": 0.6},
  {"at": "flicker", "kind": "crackle", "dur": 0.3, "density": 120, "vol": 0.55},
  {"at": "fade", "kind": "whir", "f0": 120, "f1": 40, "dur": 0.9, "vol": 0.3}
]
```
```json music
{"preset": "lofi", "bpm": 96, "gain": 1, "duck": 0.45}
```

## Layout by aspect ratio
- **9:16 / 4:5:** words on two or three lines, icon above; the sign fills 80% of the width; wall visible around it.
- **16:9:** words on one or two lines, sign centred with wall on all sides.
- **1:1:** centred, two lines.

## Loop & ending
The sign fades to dark glass; frame 0 is dark glass, so the loop restarts naturally.

## Guardrails
- Keep the flicker gentle and brief, with no fast full-screen flashing.
- The sign is tilted only very slightly, like it was hung by hand.
- Short text on one to three lines; the icon fits the message.

## QA
- Frame at `dark + 0.3 s`: sign is visibly off but the tubes are legible as dark glass.
- Frame at `letter4`: some letters on, later ones still dark; at `icon + 0.4 s`: icon lit.
- Frame at `flicker + 0.05 s` differs from the steady state in one tube only.
- Audio: one crackle burst per blink, hum swells, no clipping.
