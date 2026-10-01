---
name: data-story
title: Data story
description: Numbers become an animated infographic: two or three cards, each with one big counting number, a short label and one chart (bars grow, a line draws, a donut fills), a title and thin progress bars. For KPIs, results, reports and any message built on the user's own numbers.
tags: ["data","explainer"]
library: GSAP
sound: true
difficulty: 3
default_duration: 12
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Data story

**One-liner:** the user's numbers, one card at a time: a big number counts up, a short label sits under it, and the right chart lands (bars for amounts, a line for change over time, a donut for a share, or just the number). A short title on top and a row of thin progress bars at the bottom, one per card.
**Best for:** results, KPIs, survey findings, sales or growth numbers, an annual summary.
**Avoid when:** there are no numbers (ask the user for them: never invent data) or you need decoration and 3D.

## Inputs to gather
- 2 or 3 statistics: value, unit, label, and the data behind a chart if any (bar values, a time series, a share). A short title. Brand colours (one per chart).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | Turn the numbers in the request into an animated infographic; pick the right chart for each: bars to compare, line for change over time, donut for a share, or just a big number | Chart chosen per stat type in `CONTENT`; each chart is an SVG builder |
| L2 | Two or three cards one after another, each with one big counting number, a short label under it, and one chart | Cards `.card` swapped by time; number via a proxy tween |
| L3 | Bars grow up from the baseline one after another, lines draw left to right, donuts fill around like a clock; small labels fade in once each chart has landed | Bars `scaleY` from the bottom stagger; line path `strokeDashoffset`; donut arc `strokeDashoffset` |
| L4 | A short title on top and a row of thin progress bars at the bottom, one per card, that fill as the video plays | Title DOM; progress bars width tweens spanning each card's window |
| L5 | Flat and tidy: clean grid, lots of empty space, thin grey guide lines; no 3D or shadows; only the user's numbers, never invent data; ask if there are none | Thin `#d9d6cf` grid lines; no shadows or gradients |
| T1 | Clean sans (Inter), bold for the big numbers with even-width digits so they do not wobble while counting, regular for labels | Inter with `font-variant-numeric: tabular-nums` |
| T2 | Brand colours if given, one per chart; else off-white background, near-black text, grey labels, blue, green and coral for the charts | Tokens below |
| S1 | Quick soft ticks while each number counts (fast then slowing, one tick per step) ending on a clear ding when it lands; a soft pop per bar (rising a note each bar); a smooth rising pen sweep while a line draws; a gentle swell as a donut fills; a light swoosh as each card slides in and out | Cue table below |
| S2 | Clean upbeat corporate bed about 130 bpm in a bright major key: plucked arpeggios, soft pulsing bass, quiet kick, gentle shaker; loops | `corporate-bright` at 130 bpm |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 12` |
| O3 | SVG + GSAP rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #f7f5f0;
--ink: #16181d;
--muted: #8a8f99;
--accent: #3b5bff;
--green: #16a37a;
--coral: #ff6a3d;
```
```json fonts
[{"family": "Inter", "id": "inter", "variable": true, "weightRange": "100 900", "role": "all text"}]
```

## Beat sheet
For three cards (each about a third of the length after a short intro).
```json beats
{"bpm": 130, "events": [
  {"id": "card", "repeat": {"n": 3, "fromFrac": 0.04, "everyFrac": 0.31}, "label": "card slides in"},
  {"id": "count", "repeat": {"n": 3, "fromFrac": 0.08, "everyFrac": 0.31}, "label": "number counts up"},
  {"id": "land", "repeat": {"n": 3, "fromFrac": 0.2, "everyFrac": 0.31}, "label": "number lands with a ding"},
  {"id": "chart", "repeat": {"n": 3, "fromFrac": 0.16, "everyFrac": 0.31}, "label": "chart grows / draws / fills"},
  {"id": "leave", "repeat": {"n": 3, "fromFrac": 0.32, "everyFrac": 0.31}, "label": "card slides out"}
]}
```

## Build recipe
- **Counting:** a proxy `{v: 0}` tweened to the value with `ease: "power2.out"`; the display rounds to integers (or fixed decimals) and uses tabular digits. Tick times are derived from the same easing: tick when `Math.floor(v)` changes (compute tick times offline from the easing curve so sound cues match).
- **Charts:** bars = rects with `transformOrigin: bottom` and `scaleY 0 to 1`, stagger 0.08; line = polyline path with `strokeDashoffset`; donut = circle with `strokeDasharray = circumference` and a fill offset; label fade after the chart lands.
- **Card switch:** outgoing `x -120%` with `power3.in`, incoming from `+120%`; the progress bar for the current card fills linearly over its window.
- **Data rules:** every number shown comes from `CONTENT`; if the user has no numbers, stop and ask. Round sensibly but never change a value; label units.
- **Pitfalls:** no shadows/3D; digits must be tabular; keep the chart axes minimal (thin baseline only).

## Sound plan
How each effect of the brief is covered:
- **Soft quick ticks while each big number counts up, fast at first and slowing as the count settles, one tick per step, ending on a clear satisfying ding when the number lands:** `ticks` (decel) at `count*` with a `ding` as its `final`.
- **A soft pop as each bar grows, rising a note each bar:** `pop` at `chart*` with rising pitch (`rise`).
- **A smooth rising pen sweep while a line draws from left to right:** `chirp`/`riser` sweep at `chart*`.
- **A gentle swell that opens up as a donut fills:** `swell` at `chart*`.
- **A light swoosh as each card slides in and out:** `swish` at `card*` and `leave*`.
```json cues
[
  {"at": "card*", "kind": "swish", "vol": 0.4},
  {"at": "count*", "kind": "ticks", "n": 22, "span": 1.2, "curve": "decel", "f0": 1800, "f1": 3200, "vol": 0.4, "final": {"kind": "ding", "freq": 1568, "vol": 0.75}},
  {"at": "chart*", "kind": "pop", "freq": 480, "vol": 0.6, "rise": {"param": "freq", "from": 480, "by": 60}},
  {"at": "chart*+0.2", "kind": "chirp", "f0": 500, "f1": 1600, "dur": 0.7, "vol": 0.3},
  {"at": "chart*+0.3", "kind": "swell", "dur": 1.0, "freq": 900, "vol": 0.3},
  {"at": "leave*", "kind": "swish", "vol": 0.35}
]
```
```json music
{"preset": "corporate-bright", "bpm": 130, "key": "C", "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16 / 4:5:** number very large in the upper third, label under it, chart in the middle band; progress bars in the bottom safe area; title at the top.
- **16:9:** number and label left, chart right.
- **1:1:** number above, chart below.

## Loop & ending
After the last card leaves, the progress row completes and fades; frame 0 is the title with empty progress bars.

## Guardrails
- Flat and tidy: a clean grid, lots of empty space, thin grey guide lines, and no 3D or shadows.
- Only use the numbers the user gave; never invent data. If the request has no numbers, ask for them.
- Use even-width digits so the numbers do not wobble while counting.

## QA
- Each final number matches the user's value exactly; units and labels present.
- Frame at `chart + 1 s`: chart complete, labels visible; frame mid-count shows a partial number.
- Progress bars: first card's bar is full when card 2 starts.
- `audio-report`: a distinct ding at each `land`, tick trains decelerate.
