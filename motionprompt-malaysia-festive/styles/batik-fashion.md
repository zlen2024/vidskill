---
name: batik-fashion
title: Batik fashion
description: A colourful batik fashion showcase: brand scene, each look inside a patterned arch, a fabric close-up, and an offer, linked by five different full-frame batik transitions (hibiscus bloom, canting wax line, cloth sweep, kaleidoscope mandala, dye drops). For baju kurung, modest fashion and Malaysian apparel promos.
tags: ["malaysia","product","promo"]
library: GSAP
sound: true
difficulty: 5
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"good"}
---
# Batik fashion

**One-liner:** a few short scenes (brand on a rich batik background, each product or look on its own, a fabric or detail close-up, then the offer and call to action), each look shown full length inside a softly patterned arch with a slow push-in; every scene change is a bold, premium full-frame batik transition, each one different, ending back at the first scene so it loops.
**Best for:** baju kurung, kebaya, modest fashion, batik brands, a Raya collection, an online boutique.
**Avoid when:** there is no clothing to show or the tone should be minimal.

## Inputs to gather
- Brand name, 2 to 3 products/looks (photos, or ask to draw modest flat illustrations), a fabric detail, the offer and price, contact/handle. Language (Malay or English). Brand colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A colourful batik fashion showcase: brand name on a batik background, then each product or look, then a fabric close-up, then the offer and call to action; hold each scene long enough to read | Scene list built from `CONTENT`; each scene 2 to 3 s |
| L2 | Show each look with the attached photos: the model stands full length inside a softly patterned arch with a slow push-in and a thin gold or cream outline; without photos draw elegant modest flat fashion illustrations (graceful faceless figures) in the same arch | Arch clip-path (`ellipse` top) with a batik-pattern backdrop; slow `scale 1.0 to 1.06`; fallback SVG figure builder (no faces) |
| L3 | Each scene change is a bold full-frame batik transition and each is different: giant bunga raya blooming from the centre then peeling away; a canting racing across drawing a wavy wax line while dye floods behind; a length of batik cloth sweeping diagonally with soft folds; a kaleidoscope batik mandala closing like an iris, spinning and opening; dye drops falling and bleeding outward | Five transition builders (see recipe) |
| L4 | Transitions last about one second with strong easing, layered motion and slight overshoot; clean and premium, never messy, never flashing harshly | `duration 0.9 to 1.1`, `back.out(1.2)` or `power3.inOut`; solid colour layers only |
| L5 | Batik details throughout: cream wax outlines, bunga raya, leaves, awan larat spirals, isen dots, fine crackle lines; labels slide up, the price lands with a small bounce; the last transition returns to the first scene | Shared batik pattern generator; label `y` slide; price spring; loop |
| L6 | Write the text in the user's language (Malay or English) | `CONTENT.lang` |
| T1 | Elegant display serif (Playfair Display, italic) for names and headlines; clean sans (Jost) in spaced capitals for small labels | Playfair Display 700 italic; Jost 500 with letter spacing |
| T2 | Brand colours if given, else deep indigo, wax cream, magenta, turmeric, emerald, royal blue, coral | Tokens below |
| S1 | Each transition has its own signature sound: a rising swell and a soft bell chord with a flutter per petal for the flower; a quick wax zip, liquid dye rush and small drips for the canting; a big cloth whoosh with a fabric flap; a spinning shimmer, a low whomp and falling sparkles for the kaleidoscope; wet drop sounds for dye drops; soft chimes as labels appear and a rebana hit when the price lands | Cue table below |
| S2 | An elegant upbeat modern Malay fashion-show groove: a light rebana rhythm, a plucked gambus-like melody, soft bass, warm pad; no vocals; loops | `kompang-raya` preset (light rebana hits, plucked gambus melody, soft bass, warm pad) at a moderate tempo; no vocals |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | GSAP + canvas HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #1c1a4a;
--ink: #fbefd6;
--accent: #f2a51c;
--magenta: #d4246e;
--emerald: #0f8a64;
--blue: #2a4db3;
--coral: #ff6b58;
```
```json fonts
[
  {"family": "Playfair Display", "id": "playfair-display", "weights": [700], "styles": ["normal", "italic"], "role": "names and headlines"},
  {"family": "Jost", "id": "jost", "variable": true, "weightRange": "100 900", "role": "labels"}
]
```

## Beat sheet
Five scenes with four transitions in between plus the return.
```json beats
{"bpm": 0, "events": [
  {"id": "scene", "repeat": {"n": 5, "fromFrac": 0.0, "everyFrac": 0.2}, "label": "scene starts"},
  {"id": "trans", "repeat": {"n": 5, "fromFrac": 0.16, "everyFrac": 0.2}, "label": "batik transition (bloom, canting, cloth, mandala, drops)"},
  {"id": "label", "repeat": {"n": 5, "fromFrac": 0.05, "everyFrac": 0.2}, "label": "labels slide up"},
  {"id": "price", "at": 0.86, "label": "price lands"}
]}
```

## Build recipe
- **Batik generator:** a function `batik(ctx, seed, w, h, palette)` drawing motifs (bunga raya as 5 petal shapes, leaves, awan larat spiral, isen dots, crackle lines) on a canvas; draw once per palette and reuse as textures.
- **Transitions (each 0.9 to 1.1 s):**
  1. *Bloom:* a large flower scales from 0 to 2.4 covering the frame, then petals rotate/scale away revealing the next scene.
  2. *Canting wax:* a nib dot sweeps left to right drawing a wavy wax stroke (`strokeDashoffset`); dye colour fills behind it with a clip that follows the nib; then the dye recedes.
  3. *Cloth sweep:* a diagonal cloth panel (batik texture with a fold gradient) translates across.
  4. *Kaleidoscope:* six mirrored wedges of the batik texture rotating while an iris (circle clip) closes then opens on the next scene.
  5. *Dye drops:* 4 to 6 circles grow from random seeded points with a soft edge until they cover the frame, then dissolve.
- **Arch:** `clip-path: path()` or a `border-radius: 50% 50% 0 0` container; add a thin cream/gold stroke via an SVG overlay.
- **Pitfalls:** transitions must cover the frame fully at their midpoint so scene swaps are hidden; no harsh flash (use solid fills, not white frames); keep the price legible (contrast against batik: place it on a solid `--accent` plate).

## Sound plan
How each effect of the brief is covered (each transition has its own signature sound):
- **A rising swell and a soft bell chord as the flower blooms, with a flutter for each petal:** `riser` + `chime` + a quick `ticks` of `pop` at the bloom `trans`.
- **A quick wax zip and a liquid dye rush with small drips for the canting:** `whoosh` (up, short) + `pour` + `drip`.
- **A big cloth whoosh with a fabric flap:** `cloth` at the cloth transition.
- **A spinning shimmer, a soft low whomp and falling sparkles for the kaleidoscope:** `sparkle` + `impact` (soft) + falling `run`.
- **Wet drop sounds as the dye lands and spreads:** `drip`/`pop` repeats.
- **Soft chimes as labels appear and a rebana hit when the price lands:** `chime` at `label*`, `drum` (kompang-like) at `price`.
```json cues
[
  {"at": "trans1", "kind": "riser", "dur": 0.9, "tone": 0.2, "vol": 0.45},
  {"at": "trans1+0.7", "kind": "chime", "freq": 784, "dur": 1.6, "vol": 0.5},
  {"at": "trans1+0.7", "kind": "ticks", "n": 5, "span": 0.35, "tick": "pop", "vol": 0.3},
  {"at": "trans2", "kind": "whoosh", "dir": "up", "dur": 0.4, "vol": 0.5},
  {"at": "trans2", "kind": "pour", "dur": 0.8, "vol": 0.35},
  {"at": "trans2+0.6", "kind": "drip", "freq": 950, "vol": 0.4},
  {"at": "trans3", "kind": "cloth", "dur": 0.9, "vol": 0.6},
  {"at": "trans4", "kind": "sparkle", "dur": 0.9, "vol": 0.4},
  {"at": "trans4+0.5", "kind": "impact", "dur": 0.7, "freq": 80, "vol": 0.55},
  {"at": "trans4+0.6", "kind": "run", "inst": "chime", "from": "E6", "n": 5, "dt": 0.1, "dir": "down", "len": 1.0, "vol": 0.4},
  {"at": "trans5", "kind": "repeat", "every": 0.1, "times": 5, "of": {"kind": "drip", "freq": 800, "vol": 0.4}},
  {"at": "label*", "kind": "chime", "freq": 1320, "dur": 0.9, "vol": 0.35},
  {"at": "price", "kind": "drum", "freq": 150, "dur": 0.3, "vol": 0.85}
]
```
```json music
{"preset": "kompang-raya", "bpm": 100, "key": "D", "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16 / 4:5:** the arch fills 70% of the height with the look centred; labels lower left above the safe zone; price plate lower right.
- **16:9:** arch centred at 85% height on one side, text on the other (split layout).
- **1:1:** arch centred, labels overlapping the lower corners.

## Loop & ending
The final transition returns to the first scene (brand name on batik), which equals frame 0.

## Guardrails
- Keep transitions clean and premium, never messy, and never flash harshly.
- No vocals in the music.
- Modest, respectful fashion illustrations (faceless figures) when no photos are attached.
- Write the user's text in the language they used.

## QA
- Frame at each `trans + 0.5 s` (midpoint): the frame is fully covered by the transition motif (no scene peeking through).
- Frame at `price + 0.4 s`: price legible on its plate; labels readable.
- Each of the five transitions is visibly different; the last returns to scene 1.
