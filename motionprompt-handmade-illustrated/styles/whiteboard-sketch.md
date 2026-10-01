---
name: whiteboard-sketch
title: Whiteboard sketch
description: Marker doodles and handwriting draw themselves on a warm whiteboard, explainer style: a headline, a few steps each with a small doodle and label, curved marker arrows, underlines, a circled key word and a highlighter swipe, then a soft erase. For how-tos, processes, ideas and quick explainers.
tags: ["explainer","handmade"]
library: GSAP
sound: true
difficulty: 3
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Whiteboard sketch

**One-liner:** a clean, slightly warm white board; an invisible marker sketches everything stroke by stroke with a slight hand-drawn wobble; the headline is written at the top, then a few steps appear, each with a small doodle (lightbulb, checklist, chart, person, speech bubble) and a short handwritten label, joined by curved marker arrows with underlines, a quick circle around the key word and a yellow highlighter swipe behind the headline and one important word; the finished board holds, then wipes clean.
**Best for:** how-to explainers, processes, ideas, tips, a friendly overview of a service.
**Avoid when:** you need polished corporate visuals or dense data.

## Inputs to gather
- Headline, 3 to 5 steps (2 to 4 words each) with a doodle idea for each, the key word to circle, one highlighted word. Brand colours (marker blue, highlighter).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A clean, slightly warm white board like a friendly explainer video | `--bg` board with a faint vignette and a subtle marker-tray line |
| L2 | Everything is drawn by hand, stroke by stroke, as if by an invisible marker; lines have a slight wobble so they feel hand drawn, never perfect | All shapes as SVG paths with seeded wobble (`MP.noise1` offsets along the path); reveal by `strokeDashoffset`; text as paths (converted glyph outlines) or written by a mask sweep |
| L3 | Turn the topic into a few simple steps; each gets a small doodle and a short handwritten label | Doodle path library (bulb, checklist, chart, person, speech bubble) |
| L4 | Join steps with curved marker arrows; add marker touches: an underline, a quick circle around the key word, a highlighter swipe behind the headline and one important word | Arrow curves with arrowheads; underline path; ellipse around a word; highlighter = wide translucent yellow stroke with `mix-blend-mode: multiply` |
| L5 | Start by writing the headline at the top, then draw steps one after another; hold the finished board, then erase with a soft wipe | Sequence by `T`; final wipe = a soft-edged mask sweeping across |
| T1 | A casual handwriting font (Caveat), bold enough to read | Caveat 700, bold enough to read at phone size |
| T2 | Brand colours if given, else warm white board, dark marker ink, blue marker for arrows and ticks, yellow highlighter | Tokens below |
| S1 | A soft felt-marker stroke for every line (starting and stopping with the line, a light squeak on some longer lines), quick scribbles while words write on, a broad soft swipe per highlighter band, a gentle bell "ding" when the key idea appears (a lightbulb lighting up), a bright tick per checkmark, an eraser rubbing across the board as it wipes clean | Cue table below |
| S2 | Friendly explainer bed about 90 bpm in a happy major key: strummed ukulele, soft plucked bass, light claps, shaker; no whistling; well under the effects; loops | `ukulele-folk` at 90 bpm |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | SVG line drawing + GSAP rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #fbf8f1;
--ink: #23262f;
--accent: #2f6fe4;
--highlight: #ffd84a;
```
```json fonts
[{"family": "Caveat", "id": "caveat", "weights": [700], "role": "all handwriting"}]
```

## Beat sheet
```json beats
{"bpm": 90, "events": [
  {"id": "headline", "at": 0.0, "label": "headline writes on"},
  {"id": "hl", "at": 0.14, "label": "highlighter swipe behind the headline"},
  {"id": "step", "repeat": {"n": 4, "fromFrac": 0.2, "everyFrac": 0.16}, "label": "each step: doodle, label"},
  {"id": "arrow", "repeat": {"n": 3, "fromFrac": 0.3, "everyFrac": 0.16}, "label": "arrow to the next step"},
  {"id": "idea", "at": 0.58, "label": "lightbulb key idea"},
  {"id": "check", "repeat": {"n": 2, "fromFrac": 0.7, "everyFrac": 0.05}, "label": "checkmarks"},
  {"id": "circle", "at": 0.8, "label": "circle the key word"},
  {"id": "erase", "at": 0.92, "label": "soft erase"}
]}
```

## Build recipe
- **Hand-drawn look:** every path passes through `wobble(points)`: offset each point by `MP.noise1(i * 0.7 + seed) * 1.6` px and vary width `3 + noise * 0.6`; use round caps and joins.
- **Writing text:** convert text to outline strokes for a true pen effect (skip: the practical route is a left-to-right `clip-path` reveal with a small marker dot leading, per word; keep the reveal speed constant so the sound can follow).
- **Doodles:** each doodle is 3 to 6 paths; reveal in order with `strokeDashoffset` and stagger; the lightbulb fills yellow at `idea` (a small glow).
- **Highlighter:** a translucent rounded rect drawn by scaleX from the left behind the word.
- **Eraser:** a soft-edged mask (gradient) moving across the board, revealing `--bg`; alternatively a wide rounded rect in `--bg` sweeping with a blurred edge.
- **Pitfalls:** avoid perfect straight lines; keep the drawing speed readable (a step takes 1 to 2 s); keep the stroke widths consistent per marker colour.

## Sound plan
How each effect of the brief is covered:
- **A soft felt marker stroke for every line, starting and stopping with the line, with a light squeak on some of the longer lines:** `scratch` (soft) per stroke at `headline`, `step*`, `arrow*`; a tiny `chirp` squeak on some.
- **Quick little scribbles while words write on:** `scratch` bursts at `headline`.
- **A broad soft swipe for each highlighter band:** `swish` at `hl`.
- **A gentle bell "ding" when the key idea appears, like a lightbulb lighting up:** `ding`/`bell` at `idea`.
- **A bright little tick for each checkmark:** `tick` at `check*`.
- **An eraser rubbing across the board as it wipes clean at the end:** `paper` + `scratch` (low) at `erase`.
```json cues
[
  {"at": "headline", "kind": "scratch", "dur": 1.4, "freq": 2200, "jitter": 0.5, "vol": 0.35},
  {"at": "hl", "kind": "swish", "dur": 0.4, "vol": 0.35},
  {"at": "step*", "kind": "scratch", "dur": 1.2, "freq": 2000, "jitter": 0.6, "vol": 0.35},
  {"at": "step*+0.9", "kind": "chirp", "f0": 2400, "f1": 3000, "dur": 0.08, "vol": 0.15},
  {"at": "arrow*", "kind": "scratch", "dur": 0.5, "freq": 2400, "vol": 0.3},
  {"at": "idea", "kind": "bell", "freq": 1320, "dur": 1.6, "vol": 0.6},
  {"at": "check*", "kind": "tick", "freq": 3200, "vol": 0.7},
  {"at": "circle", "kind": "scratch", "dur": 0.6, "freq": 2100, "vol": 0.35},
  {"at": "erase", "kind": "paper", "dur": 1.0, "vol": 0.45},
  {"at": "erase", "kind": "scratch", "dur": 1.0, "freq": 900, "jitter": 0.3, "vol": 0.25}
]
```
```json music
{"preset": "ukulele-folk", "bpm": 90, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16 / 4:5:** headline top, steps stacked vertically with arrows curving down the left/right side; keep everything inside `--safe-*`.
- **16:9:** steps in a row or a gentle S-curve with arrows between them.
- **1:1:** 2 by 2 grid of steps with curved arrows.

## Loop & ending
The eraser wipes the board back to `--bg`; frame 0 is the blank board.

## Guardrails
- Lines wobble slightly so they feel hand drawn, never perfect.
- The music is a friendly explainer bed about 90 bpm in a happy major key (a strummed ukulele, a soft plucked bass, light claps, a shaker) with no whistling.
- Keep the handwriting bold enough to read; short labels only.

## QA
- Frame at `step2 + 0.8 s`: doodle 2 mostly drawn with the marker position at the stroke end.
- Frame at `circle + 0.6 s`: key word circled, highlighter behind the headline.
- Frame at `erase + 0.5 s`: half the board wiped with a soft edge; last frame blank.
