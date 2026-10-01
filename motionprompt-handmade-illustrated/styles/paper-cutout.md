---
name: paper-cutout
title: Paper cut-out
description: A handmade scene of layered cut paper animated as stop motion at 12 fps: chunky hills, sun, clouds and props slide, pop and flip into place with a tiny hand-nudge wobble, and the headline drops in on a taped paper label. For friendly brands, kids, craft, events and simple scene stories.
tags: ["handmade","background"]
library: SVG
sound: true
difficulty: 3
default_duration: 10
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Paper cut-out

**One-liner:** a craft-table animation: every piece is flat cut paper with visible paper grain and a soft shadow, stacked in layers; hills, a sun, clouds, leaves, a house or props slide, pop and flip into place one after another with a little bounce; motion is stepped at about 12 fps with a tiny random nudge per piece per frame, like moved by hand; the headline is on a paper label that drops in, flips over and is stuck down with tape.
**Best for:** friendly and handmade brands, kids and family, eco and nature topics, events, simple story scenes.
**Avoid when:** you need a sleek or realistic look.

## Inputs to gather
- The headline (short) and the scene topic (a garden, a bakery, a school, a trip): 5 to 8 paper pieces that suggest it. Brand colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A handmade scene built from layers of cut paper, like a craft-table animation; every piece has visible paper grain and a soft shadow so the layers feel stacked | SVG groups per layer; `feTurbulence` grain texture (rendered once as a pattern image) multiplied on each shape; drop shadow per piece (`filter: drop-shadow` on the group, limited count) |
| L2 | A simple scene fitting the topic from flat paper shapes (hills, a sun, clouds, leaves, a house or a few props); chunky and friendly | Shape library; each shape has a slightly irregular hand-cut outline (seeded jitter on path points) |
| L3 | Pieces slide, pop and flip into place one after another with a little bounce when they land | Per-piece entrance: slide (x), pop (scale), flip (`scaleX -1 to 1`) with `back.out(1.6)` |
| L4 | Feel like stop motion: move things at about 12 frames per second and give each piece a tiny random wobble on every frame, as if nudged by hand | Animate on `MP.stepTime(t, 12)`; add `MP.nudge(t, {fps: 12, amp: 1.2, seed: pieceId})` |
| L5 | Put the headline on a paper label that drops in, flips over and gets stuck down with a strip of tape; at the end pieces slide back out and the scene clears | Label drop + flip; tape = a semi-transparent strip rotated across the top corners; reverse slides for exit |
| T1 | A rounded friendly bold font (Fredoka), dark on a light paper label | Fredoka 600/700 in `--ink` on the label |
| T2 | Brand colours if given, else warm cream background, sunny orange, coral, three greens, dark brown text | Tokens below |
| S1 | A soft paper rustle as each piece slides in or out, a light pat as it lands, a quick card flick when a leaf or the label flips, a small paper pop, a crinkle as stems grow, a tape rip and a thumb press when the label is taped down, soft paper flaps for any bird; sounds land on the same 12 fps steps as the motion | Cue table below; times snapped to the 12 fps grid |
| S2 | A whimsical handmade bed in a major key about 96 bpm: gently strummed ukulele, a simple glockenspiel tune, soft plucked bass, quiet hand claps; quieter than the effects; loops | `stop-motion` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 10` |
| O3 | HTML animation with SVG and JavaScript rendered to MP4 frame by frame so the timing is exact | `hyperframes render` |

## Tokens
```css tokens
--bg: #f7e4c6;
--ink: #3a2b24;
--accent: #f6a534;
--coral: #ec6b4f;
--green1: #c3d88f;
--green2: #86b86b;
--green3: #3f8f63;
```
```json fonts
[{"family": "Fredoka", "id": "fredoka", "variable": true, "weightRange": "300 700", "axis": "wght", "role": "label text"}]
```

## Beat sheet
```json beats
{"bpm": 96, "events": [
  {"id": "piece", "repeat": {"n": 7, "fromFrac": 0.04, "everyFrac": 0.07}, "label": "paper pieces slide/pop/flip in"},
  {"id": "stem", "at": 0.3, "label": "stems grow"},
  {"id": "bird", "at": 0.5, "label": "bird flaps across"},
  {"id": "label", "at": 0.6, "label": "label drops in and flips"},
  {"id": "tape", "at": 0.7, "label": "tape rip and thumb press"},
  {"id": "out", "repeat": {"n": 4, "fromFrac": 0.86, "everyFrac": 0.03}, "label": "pieces slide back out"}
]}
```

## Build recipe
- **Stepped time everywhere:** `const tq = MP.stepTime(t, 12)`; every animated value is `f(tq)`; the nudge uses the same `tq`. Render at 30 fps: each pose holds 2 to 3 frames (correct stop-motion feel). Do not tween with GSAP on continuous time; instead compute `progress = E.outBack(clamp((tq - start) / dur))` inside `MP.onSeek`, or use GSAP with `ease: "steps(N)"` and `duration` multiples of 1/12.
- **Paper look:** build a grain pattern once (`feTurbulence` baseFrequency 0.8, low alpha), apply as a `mask`/overlay on each shape; a thin lighter edge highlight on the top edge; soft shadow offset (2 px, 3 px) darker than the layer below.
- **Piece entrances:** cycle `slide-left`, `pop`, `flip`, `drop`; landing bounce = overshoot then settle over 3 stepped frames.
- **Label and tape:** the label falls with a small rotation, flips (`scaleY` -1 to 1 with the text swapped at the midpoint), tape strips at both top corners appear with a slight rotation.
- **Pitfalls:** avoid heavy filters on many nodes (bake the grain as a pattern); keep shapes chunky; seeds fixed.

## Sound plan
Sounds land on the same 12 fps steps as the motion, so it feels like stop motion. How each effect of the brief is covered:
- **A soft paper rustle as each piece slides in or out:** `paper` at `piece*` and `out*`.
- **A light pat as it lands:** `thud` (very soft) at `piece*+0.25`.
- **A quick card flick when a leaf or the label flips over:** `swish` (very short) + `click` at flips.
- **A small paper pop:** `pop` (dry, low) at `piece*`.
- **A crinkle as stems grow:** `crackle` (soft) at `stem`.
- **A tape rip and a thumb press when the label is taped down:** `scratch` (rip, fast) + `thud` at `tape`.
- **Soft paper flaps for any bird:** `repeat` of `paper` at `bird`.
```json cues
[
  {"at": "piece*", "kind": "paper", "dur": 0.3, "vol": 0.45},
  {"at": "piece*+0.25", "kind": "thud", "freq": 130, "dur": 0.1, "vol": 0.45},
  {"at": "piece*", "kind": "pop", "freq": 300, "rise": 1.3, "dur": 0.07, "vol": 0.35},
  {"at": "stem", "kind": "crackle", "dur": 0.8, "density": 70, "lo": 1200, "hi": 5000, "vol": 0.25},
  {"at": "bird", "kind": "repeat", "every": 0.14, "times": 5, "of": {"kind": "paper", "dur": 0.1, "vol": 0.3}},
  {"at": "label", "kind": "swish", "dur": 0.1, "f0": 2500, "f1": 5000, "vol": 0.4},
  {"at": "label+0.3", "kind": "click", "freq": 1800, "vol": 0.5},
  {"at": "tape", "kind": "scratch", "dur": 0.25, "freq": 2600, "jitter": 0.8, "vol": 0.45},
  {"at": "tape+0.3", "kind": "thud", "freq": 100, "dur": 0.12, "vol": 0.5},
  {"at": "out*", "kind": "paper", "dur": 0.3, "vol": 0.4}
]
```
Snap every cue time to the 12 fps grid in `cues.mjs`: `t = Math.round(t * 12) / 12`.
```json music
{"preset": "stop-motion", "bpm": 96, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16 / 4:5:** hills in the lower 40%, sun and clouds above, the label in the upper-middle; keep pieces inside `--safe-*`.
- **16:9:** hills across the bottom third, props spread horizontally, label centre-left.
- **1:1:** hills bottom third, label centred above them.

## Loop & ending
Pieces slide back out (reverse order), leaving the plain paper background (frame 0).

## Guardrails
- Every piece has visible paper grain and a soft shadow so the layers feel stacked.
- Move at about 12 frames per second with a tiny random wobble on every frame, as if nudged by hand.
- Keep shapes chunky and friendly; sounds land on the same 12 fps steps as the motion.

## QA
- Consecutive frames in groups of about 2 to 3 are identical (held poses); wobble visible between steps.
- Frame at `label + 0.5 s`: label flipped with the text readable; `tape + 0.3 s`: tape strips visible.
- Last frame is plain paper.
