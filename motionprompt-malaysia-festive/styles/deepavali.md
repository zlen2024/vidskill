---
name: deepavali
title: Deepavali
description: A warm festival-of-lights greeting on a deep purple night: a colourful kolam draws itself (dots, white lines from the centre outward, then rings filling with colour), clay diyas light one by one, marigold garlands sway, gold sparkles twinkle and the greeting rises with a slow gold shine. For Deepavali greetings (no deities, no people).
tags: ["festive","malaysia","text"]
library: GSAP
sound: true
difficulty: 4
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
hidden: true
---
# Deepavali

**One-liner:** a deep purple night; in the middle a symmetric kolam (rangoli): the dots appear first, the white lines draw themselves from the centre outward, then each ring fills with colour; a row of painted clay diyas lights one by one with soft flickering flames, a golden glow and a few drifting embers; orange and yellow marigold garlands swing in from the top and sway; gold sparkles twinkle; the greeting rises with a slow gold shine.
**Best for:** Deepavali greetings, festive brand wishes, community and family messages.
**Avoid when:** the message needs deities or people; keep it cultural and festive. See `rules/malaysian-styles.md`. Hidden on the site but fully supported.

## Inputs to gather
- The greeting ("Happy Deepavali" / "Selamat Deepavali" or the user's text) and an optional short line. Language used. Brand colours (gold accent).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A warm festival-of-lights greeting on a deep purple night background | `--bg` gradient to a slightly lighter centre |
| L2 | A colourful kolam (rangoli) in the middle: symmetric petals, dots and curves; the dots appear first, then the white lines draw themselves from the centre outward, then each ring fills with colour | Dot grid (diamond lattice) fading in by radius; line art as concentric rings of petals (paths generated from polar functions, mirrored 8- or 12-fold); `strokeDashoffset` from the centre; ring fills as coloured petals scale in ring by ring |
| L3 | A row of clay diyas (oil lamps) with painted bands lights up one by one; flames are soft and warm and flicker gently, with a golden glow and a few embers drifting up; no flashing | Diya SVG (clay bowl, painted bands, wick); flame teardrop with `noise1` flicker (small amplitude); ember particles rising |
| L4 | Marigold garlands in orange and yellow swing in from the top and sway a little | Garland = a chain of overlapping circles/petal clusters along a sagging curve; swing-in then `sin` sway |
| L5 | Gentle gold sparkles twinkle around the kolam and the title | Seeded four-point sparkles with soft twinkle |
| L6 | My greeting as the title, rising in with a slow gold shine; text in the user's language; a small line under it if given | Title rise + gradient sweep; small line fades |
| L7 | Keep it festive and cultural; no deities or religious figures | Only lamps, kolam, garlands, sparkles, text |
| L8 | At the end the colours fade, the lines undraw, the lamps go out and the garlands lift away so it loops | Reverse in order: fills fade, strokes undraw, flames dim, garlands `y` up |
| T1 | An elegant display serif (Rozha One) in gold for the title; a clean rounded sans (Poppins) for the small line | Rozha One 400 gold; Poppins 400 |
| T2 | Brand colours if given (gold as accent), else deep purple, magenta, orange, yellow, turquoise, gold | Tokens below |
| S1 | A soft rustle as the marigold garlands swing in and sway, tiny chalky taps as the kolam dots appear, a soft sandy stroke as each ring of lines draws, a gentle powdery bloom with a small bell as each ring fills with colour, a warm whoosh and a soft chime as each diya lights (the notes rise lamp by lamp), little twinkles on the sparkles, a bright bell as the title appears | Cue table below |
| S2 | A warm gentle Indian-inspired bed about 80 bpm: a tanpura-style drone, a soft tabla pattern (one 16-beat cycle per loop), a bansuri-style flute melody that slides between notes; celebratory but calm; loops | `indian-drone` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | GSAP HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #2a0a35;
--ink: #fff2d6;
--accent: #f5c04a;
--magenta: #d6246e;
--orange: #f28c28;
--yellow: #f9c80e;
--turquoise: #1fb5ac;
```
```json fonts
[
  {"family": "Rozha One", "id": "rozha-one", "weights": [400], "role": "title"},
  {"family": "Poppins", "id": "poppins", "weights": [400, 500], "role": "small line"}
]
```

## Beat sheet
```json beats
{"bpm": 80, "events": [
  {"id": "garland", "at": 0.0, "label": "garlands swing in"},
  {"id": "dots", "at": 0.06, "label": "kolam dots appear"},
  {"id": "ring", "repeat": {"n": 4, "fromFrac": 0.14, "everyFrac": 0.08}, "label": "each ring of lines draws"},
  {"id": "fill", "repeat": {"n": 4, "fromFrac": 0.2, "everyFrac": 0.08}, "label": "each ring fills with colour"},
  {"id": "diya", "repeat": {"n": 5, "fromFrac": 0.5, "everyFrac": 0.05}, "label": "diyas light one by one"},
  {"id": "title", "at": 0.74, "label": "title rises, bell"},
  {"id": "shine", "at": 0.82, "label": "slow gold shine"},
  {"id": "out", "at": 0.92, "label": "colours fade, lamps go out, garlands lift"}
]}
```

## Build recipe
- **Kolam geometry:** rings `r_k` at fixed radii; petals from the polar curve `r(theta) = r_k * (1 + 0.18 * cos(n * theta))` with `n` = 8 or 12; connect dots with small loops (`stroke-linecap: round`). Draw the line art once and reveal with `strokeDashoffset` staggered by radius. Fills: the same shapes filled with palette colours below the white lines, scale in from the centre per ring.
- **Flames:** each diya flame scale `1 + 0.05 * noise1(t * 6 + i)` and slight `x` sway; glow = radial gradient with low alpha (steady, not flashing); embers = seeded particles with slow upward drift.
- **Garlands:** draw as a chain of overlapping flower discs (orange, yellow, deep orange) along a catenary; tiny leaves between; swing with a damped pendulum then `sin` sway.
- **Pitfalls:** no deity images, no human figures; keep flame flicker amplitude small (no more than 5% brightness change); glow is soft.

## Sound plan
How each effect of the brief is covered:
- **A soft rustle as the marigold garlands swing in and sway:** `paper` (soft) at `garland`.
- **Tiny chalky taps as the kolam dots appear:** `ticks` (chalky, high) at `dots`.
- **A soft sandy stroke as each ring of lines draws:** `scratch` (soft, sandy) at `ring*`.
- **A gentle powdery bloom with a small bell as each ring fills with colour:** `swell` + `chime` at `fill*`.
- **A warm whoosh and a soft chime as each diya lights, the notes rising lamp by lamp:** `whoosh` + `chime` at `diya*` with rising pitch (`rise`).
- **Little twinkles on the sparkles:** `sparkle`/`twinkle` sprinkled across.
- **A bright bell as the title appears:** `bell` at `title`.
```json cues
[
  {"at": "garland", "kind": "paper", "dur": 0.7, "vol": 0.3},
  {"at": "dots", "kind": "ticks", "n": 18, "span": 1.4, "tick": "click", "f0": 2600, "f1": 3400, "vol": 0.3},
  {"at": "ring*", "kind": "scratch", "dur": 1.0, "freq": 1500, "jitter": 0.3, "vol": 0.3},
  {"at": "fill*", "kind": "swell", "dur": 1.1, "freq": 600, "vol": 0.3},
  {"at": "fill*+0.4", "kind": "chime", "freq": 1568, "dur": 1.0, "vol": 0.3},
  {"at": "diya*", "kind": "whoosh", "dir": "up", "dur": 0.4, "vol": 0.3},
  {"at": "diya*", "kind": "chime", "freq": 660, "dur": 1.4, "vol": 0.5, "rise": {"param": "freq", "from": 660, "by": 110}},
  {"at": 0.62, "kind": "twinkle", "dur": 0.4, "vol": 0.3},
  {"at": 0.8, "kind": "twinkle", "dur": 0.4, "vol": 0.3},
  {"at": "title", "kind": "bell", "freq": 523, "dur": 2.4, "vol": 0.6},
  {"at": "shine", "kind": "sparkle", "dur": 1.2, "vol": 0.3}
]
```
```json music
{"preset": "indian-drone", "bpm": 80, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16 / 4:5:** kolam centred in the middle third; title above it (or below if the kolam is large); diyas in a row across the lower third above the safe zone; garlands at the top corners.
- **16:9:** kolam centre-left, title to the right; diyas along the bottom; garlands at both top corners.
- **1:1:** kolam centred, title above, diyas below.

## Loop & ending
Colours fade, lines undraw, flames dim, garlands lift out; the deep purple night alone is frame 0.

## Guardrails
- Keep it festive and cultural: no deities or religious figures.
- The flames are soft and warm and flicker gently; no flashing.
- Write the user's text in the language they used; the small line only if they gave one.

## QA
- Frame at `ring2 + 0.6 s`: lines drawn to ring 2 only, dots visible beyond; frame at `fill4 + 1 s`: all rings filled.
- Frame at `diya5 + 0.5 s`: all five lamps lit, glow soft, embers rising.
- Title legible with the gold shine mid-sweep; nothing resembling a deity or a person.
