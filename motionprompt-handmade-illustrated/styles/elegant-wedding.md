---
name: elegant-wedding
title: Elegant wedding
description: A digital wedding invitation on ivory paper: watercolour roses, peonies and eucalyptus bloom from the corners, a gold arch draws itself, the names write on in gold foil script, then date, time and venue fade up. Slow and graceful, 3/4 romantic music. For weddings, engagements and formal invitations.
tags: ["festive","text","handmade"]
library: GSAP
sound: true
difficulty: 4
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"good"}
---
# Elegant wedding

**One-liner:** soft ivory paper with a blush glow; watercolour flowers bloom slowly from the corners (petals open in layers, stems grow before leaves); a delicate gold arch draws around the centre; the couple's names write on in gold foil script with a glowing pen tip; details fade up under a thin gold divider; fine gold glitter floats upward throughout.
**Best for:** wedding and engagement invitations, Walimatul Urus and akad cards, anniversaries, formal event invitations.
**Avoid when:** the tone should be fast, funny or modern.

## Inputs to gather
- Names (two), a small heading (e.g. "Walimatul Urus"), date, time, venue (each one short line). Language used. Brand or wedding colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A digital wedding invitation on soft ivory paper with a gentle blush glow | Paper texture (seeded noise canvas) + a blush radial gradient |
| L2 | Watercolour flowers (roses, peonies, eucalyptus leaves) bloom and grow slowly from the corners: petals open in layers, stems grow before the leaves unfold | SVG flower functions with layered petal paths (soft edges via slight offsets and low-opacity strokes); per-flower timeline: stem `strokeDashoffset`, leaves scale, petals layer scale/rotate in order |
| L3 | A delicate gold arch draws itself around the centre like a printed card frame | Arch path with `strokeDashoffset`, a small star at the top appears last |
| L4 | The names write on in gold foil script one after the other with a small glowing pen tip leading the stroke; a soft shine sweeps across the gold now and then | Names as SVG text converted to stroke reveal (mask of a thick stroke drawn along the baseline) or letter-by-letter clip; pen tip = glowing dot on the reveal front; shine bar clipped to the text |
| L5 | Then the date, time and venue fade up gently one line at a time under a thin gold divider; a short heading (e.g. Walimatul Urus) small above the names | Lines `opacity` + `y 8 to 0` stagger; divider line scaleX |
| L6 | Fine gold glitter floats upward the whole time; everything moves slowly and gracefully, never fast or bouncy | Seeded particles `y = y0 - v * (t + phase)`; only slow easing (`sine.inOut`) |
| L7 | Write the user's text in their language; keep every word inside the arch and easy to read; keep flowers clear of the words | Layout keeps the arch interior free; flowers only in corners |
| L8 | At the end the words and flowers fade softly back to plain paper | Fade everything to the paper |
| T1 | Flowing script (Great Vibes) for the names; elegant serif (Cormorant Garamond) for the heading and details; small spaced capitals for the heading | Great Vibes 400; Cormorant Garamond 500/600 |
| T2 | Brand colours if given, else ivory, blush, dusty rose, sage, gold, warm brown text | Tokens below |
| S1 | A slow soft swell as each flower blooms (tiny bell notes for buds), a delicate harp run with a fine shimmer as the arch draws (rising to the top and falling again), a small chime as the star appears, a gentle pen scratch with sparkles as each name writes, soft glitter twinkles, a quiet falling sigh as everything fades to paper | Cue table below |
| S2 | Slow romantic bed in 3/4 time about 90 bpm: flowing harp or piano arpeggios over a warm strings pad and a soft low bass, major key; gentle; loops | `waltz-romantic` preset (3/4) |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | GSAP HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #fbf6ef;
--ink: #5b4a42;
--accent: #c9a04e;
--blush: #e9b7b3;
--rose: #c9707c;
--sage: #9db3a3;
```
```json fonts
[
  {"family": "Great Vibes", "id": "great-vibes", "weights": [400], "role": "names"},
  {"family": "Cormorant Garamond", "id": "cormorant-garamond", "weights": [500, 600], "role": "heading and details"}
]
```

## Beat sheet
```json beats
{"bpm": 90, "events": [
  {"id": "paper", "at": 0.0, "label": "paper and glitter start"},
  {"id": "bloom", "repeat": {"n": 4, "fromFrac": 0.04, "everyFrac": 0.05}, "label": "each corner flower blooms"},
  {"id": "arch", "at": 0.24, "label": "gold arch draws itself"},
  {"id": "star", "at": 0.4, "label": "star appears at the top"},
  {"id": "heading", "at": 0.42, "label": "small heading fades in"},
  {"id": "name", "repeat": {"n": 2, "fromFrac": 0.46, "everyFrac": 0.14}, "label": "each name writes on"},
  {"id": "shine", "at": 0.76, "label": "shine sweeps the gold"},
  {"id": "detail", "repeat": {"n": 3, "fromFrac": 0.68, "everyFrac": 0.05}, "label": "date, time, venue fade up"},
  {"id": "fade", "at": 0.92, "label": "fade back to paper"}
]}
```

## Build recipe
- **Watercolour look:** stack 3 to 5 petal shapes per flower with `mix-blend-mode: multiply`, each with a different low opacity and slight offset; add a paler inner wash. Edges softened with a tiny `feGaussianBlur` (limit to the flower group, not the whole scene).
- **Growth order:** stem path first (`strokeDashoffset`), then leaves (`scale 0 to 1` from their attach point), then petals from the outermost to the innermost.
- **Names:** for script fonts, a reliable reveal is a `clip-path: inset(0 100% 0 0)` animating to `inset(0 0 0 0)` over the name's writing time with a glowing dot at the leading edge; keep the reveal ease `sine.inOut`.
- **Glitter:** 60 gold dots with seeded phase; `y(t)`, twinkle by `sin`; alpha 0.3 to 0.8.
- **Pitfalls:** never use bounce or overshoot eases; keep letters inside the arch (`MP.fitLine` to 70% of the arch width); avoid tall names wrapping badly (put each name on its own line).

## Sound plan
How each effect of the brief is covered:
- **A slow, soft swell as each flower blooms, with tiny bell notes for the buds:** `swell` (slow) + a `glock`/`chime` note at `bloom*`.
- **A delicate harp run with a fine shimmer as the gold arch draws itself, rising to the top of the arch and falling again:** `run` up then down of `harp` across `arch`, plus `sparkle`.
- **A small chime as the star appears:** `chime` at `star`.
- **A gentle pen-on-paper scratch with little sparkles from the pen tip as each name writes on:** `scratch` (soft) + `sparkle` at `name*`.
- **Soft glitter twinkles:** a sparse `sparkle` bed.
- **A quiet falling sigh as everything fades back to paper:** `wind` (soft) / falling `chime` at `fade`.
```json cues
[
  {"at": "bloom*", "kind": "swell", "dur": 1.6, "freq": 500, "vol": 0.35},
  {"at": "bloom*+0.5", "kind": "glock", "note": "E6", "dur": 0.9, "vol": 0.4},
  {"at": "arch", "kind": "run", "inst": "harp", "from": "C4", "n": 8, "dt": 0.14, "scale": "major", "len": 1.8, "vol": 0.5},
  {"at": "arch+1.2", "kind": "run", "inst": "harp", "from": "C5", "n": 6, "dt": 0.14, "scale": "major", "dir": "down", "len": 1.8, "vol": 0.45},
  {"at": "arch", "kind": "sparkle", "dur": 1.6, "vol": 0.25},
  {"at": "star", "kind": "chime", "freq": 1568, "dur": 1.6, "vol": 0.5},
  {"at": "name*", "kind": "scratch", "dur": 1.6, "freq": 2200, "jitter": 0.3, "vol": 0.25},
  {"at": "name*", "kind": "sparkle", "dur": 1.6, "vol": 0.3},
  {"at": "shine", "kind": "run", "inst": "chime", "from": "G5", "n": 5, "dt": 0.08, "len": 1.4, "vol": 0.4},
  {"at": "detail*", "kind": "pop", "freq": 500, "vol": 0.25},
  {"at": "fade", "kind": "wind", "dur": 1.8, "vol": 0.3}
]
```
```json music
{"preset": "waltz-romantic", "bpm": 90, "gain": 1, "duck": 0.4}
```

## Layout by aspect ratio
- **9:16 / 4:5:** arch fills most of the width; heading above the names, names stacked one under the other, details below the divider; flowers in the four corners kept clear of the arch interior and the safe zones.
- **16:9:** arch centred at 60% of the height; flowers at left and right corners; names on one line.
- **1:1:** arch centred; names stacked.

## Loop & ending
Words, arch and flowers fade back to the plain ivory paper (frame 0).

## Guardrails
- Everything moves slowly and gracefully, never fast or bouncy.
- Keep every word inside the arch and easy to read, and keep the flowers clear of the words.
- Write the user's text in the language they used.

## QA
- Frame at `bloom4 + 1 s`: four corner flowers at different growth stages, none touching the arch interior.
- Frame at `name2 + 1 s`: both names written, foil gold with a shine mid-sweep.
- Frame at `detail3 + 1 s`: date, time and venue legible under the divider.
- Audio: harp arch run rises then falls; no sound louder than the music bed by more than about 10 dB.
