---
name: infographic
title: Infographic
description: A flat explainer poster bigger than the screen: the camera glides from a title card to numbered steps, a people-stat and a before/after, then pulls back to the whole poster with a Save-this-post button. For tips, how-tos, stats and shareable explainers.
tags: ["explainer","data","social"]
library: GSAP
sound: true
difficulty: 3
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"good"}
---
# Infographic

**One-liner:** one big flat poster; the camera glides across it section by section (title, numbered steps, a "did you know" people stat, before and after), parts pop in with a springy bounce, then it pulls back to show the whole poster and a Save button.
**Best for:** how-to steps, tips, a stat with context, an old-way versus new-way comparison, anything people save and share.
**Avoid when:** you have no facts to show (never invent numbers) or you need photos or 3D.

## Inputs to gather
- Title and a short label pill. 3 to 5 steps (each: 2 to 4 word label + one line of detail). One fact as "N of 10" (or a percentage that maps to 10 person icons). One before/after pair with a short line and a big value each. Logo and button text ("Save this post").
- Sections that do not fit the topic are left out. Use only numbers the user gave.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A modern infographic poster bigger than the screen; the camera glides across it one section at a time | One tall/wide `#poster` inside `#scene`; a camera = `x/y/scale` tweens on `#poster` (transform-origin 0 0) between section rects computed from the DOM |
| L2 | Sections: bold title card, numbered steps, one "did you know" fact, before and after; drop what does not fit | Section list built from `CONTENT`; positions laid out in a flex/grid so the camera targets are real element rects |
| L3 | Title card: solid colour block, small label pill, headline, simple flat illustration of the topic | Block in `--accent`, pill, headline, inline SVG built from circles/rounded rects |
| L4 | Steps with number badge, flat rounded icon on a soft tile, short label + one line; dotted arrows that draw dot by dot | Icons as small SVG groups; arrows = SVG path with `stroke-dasharray: 0 12` and round caps, dots appear via `strokeDashoffset` or per-dot circles staggered |
| L5 | A fact as a big number with small person icons, "7 of 10" lighting up in colour one by one | 10 person icons (circle + rounded body), first N recoloured by stagger; number counts up |
| L6 | Compare before/after in two cards: red cross for old, tick for new, short line and big value | Two rounded cards; cross and tick draw with `strokeDashoffset`; values pop |
| L7 | Parts pop with a soft springy bounce as the camera arrives; end pulling back to the whole poster, then slide in the logo and a "Save this post" button | `MP.spring` scale per part at section arrival; final camera scale-to-fit; logo + button slide up |
| L8 | Flat shapes only: rounded corners, thin dotted guide lines, lots of white space, no 3D, no photos; short text; only the user's facts | No shadows or gradients; 8 px dotted guides; every string from `CONTENT` |
| T1 | Bold friendly rounded sans (Plus Jakarta Sans), extra bold for titles and numbers, regular for notes | Variable font weights 400 and 800 |
| T2 | Brand colours if given, else white poster on soft blue-grey page, navy text, blue main, amber badges, red only for the cross | Tokens below; red is reserved for the cross |
| S1 | Bubbly pops per tile/icon/badge (a little higher each step), felt-pen dab per dot, two-note tick per check, warm bell on the big number, marimba per person icon, low "nope" for the cross, airy whoosh per glide, long swell on pull-back | Cue table below |
| S2 | Light happy corporate bed about 120 bpm, marimba arps, plucked bass, gentle kick, claps, shaker; quiet; loops | `corporate-bright` preset |
| S3 | All sound made in code | `scripts/synth.mjs`, `<audio id="mix">` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length (12 to 15 s) | scaffold `--duration 15` |
| O3 | SVG + GSAP with a camera moving over one large poster, rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #e7edf7;
--poster: #ffffff;
--ink: #14213d;
--accent: #2563eb;
--accent2: #ffb627;
--bad: #ef5350;
```
```json fonts
[{"family": "Plus Jakarta Sans", "id": "plus-jakarta-sans", "variable": true, "weightRange": "200 800", "role": "all text"}]
```

## Beat sheet
```json beats
{"bpm": 0, "events": [
  {"id": "title", "at": 0.0, "label": "title card pops"},
  {"id": "glide1", "at": 0.12, "label": "camera to steps"},
  {"id": "step", "repeat": {"n": 3, "fromFrac": 0.16, "everyFrac": 0.1}, "label": "each step lands, arrow draws"},
  {"id": "glide2", "at": 0.47, "label": "camera to the fact"},
  {"id": "fact", "at": 0.52, "label": "big number lands"},
  {"id": "person", "repeat": {"n": 7, "fromFrac": 0.56, "everyFrac": 0.012}, "label": "person icons light up"},
  {"id": "glide3", "at": 0.68, "label": "camera to before/after"},
  {"id": "cross", "at": 0.72, "label": "old way cross"},
  {"id": "tick", "at": 0.78, "label": "new way tick"},
  {"id": "pullback", "at": 0.84, "label": "camera pulls back to the whole poster"},
  {"id": "logo", "at": 0.92, "label": "logo and Save button slide in"}
]}
```

## Build recipe
- **Poster and camera:** lay the poster out once (CSS grid, sections in a column for 9:16 and 4:5, a row-snake for 16:9). Read each section's `getBoundingClientRect()` after fonts load and compute `{x, y, scale}` that centres it with margin. One `tl.to("#poster", {x, y, scale, duration: 0.9, ease: "power2.inOut"}, T.glideN)` per move.
- **Pop-ins:** each part starts at `scale 0, opacity 0`; use `tl.fromTo(part, {scale: 0}, {scale: 1, duration: 0.5, ease: "back.out(1.8)"}, T.stepN + i * 0.06)`. Keep all times relative to `T`.
- **Dotted arrows:** an SVG `path` with `stroke-dasharray: 1 14`, `stroke-linecap: round`; animate `strokeDashoffset` from the path length to 0; one dab sound per dot by reading the dot count.
- **Person icons:** ten identical SVG icons in a grid; `fill` from grey to `--accent` in order; the number counts with `gsap.to(obj, {v: N, onUpdate})` and text rounded to integers.
- **Pitfalls:** no 3D transforms, no blur; a transformed `#poster` must be `position: absolute` with a real size; do not `repeat: -1`; keep `will-change` off; never draw shadows.

## Sound plan
How each effect of the brief is covered:
- **Soft bubbly pop for each tile, icon and badge as it lands, a little higher for each step:** `pop` at `title` and `step*`, pitch rising per step (`rise`).
- **Tiny felt pen dab for every dot of the dotted arrows:** a fast `ticks` run of `pop` (very short) under each arrow.
- **Bright two-note tick for each check mark:** `run` of two `marimba` notes at `tick`.
- **Warm bell when the big number lands:** `bell` at `fact`.
- **Rising marimba note as each person icon fills in:** `marimba` at `person*`, rising (`rise`).
- **Friendly low "nope" for the cross:** a falling `boop` at `cross`.
- **Light airy whoosh for each camera glide:** `swish` at `glide1`, `glide2`, `glide3`.
- **Long soft swell as the camera pulls back to show the whole poster:** `swell` at `pullback`.
```json cues
[
  {"at": "title", "kind": "pop", "freq": 480, "vol": 0.8},
  {"at": "glide1", "kind": "swish", "vol": 0.5},
  {"at": "step*", "kind": "pop", "freq": 560, "vol": 0.8, "rise": {"param": "freq", "from": 560, "by": 90}},
  {"at": "step*", "kind": "ticks", "n": 8, "span": 0.45, "tick": "pop", "f0": 900, "f1": 1300, "vol": 0.35},
  {"at": "glide2", "kind": "swish", "vol": 0.5},
  {"at": "fact", "kind": "bell", "freq": 660, "dur": 1.6, "vol": 0.75},
  {"at": "person*", "kind": "marimba", "note": "C5", "dur": 0.4, "vol": 0.6, "rise": {"param": "note", "from": 72, "by": 2}},
  {"at": "glide3", "kind": "swish", "vol": 0.5},
  {"at": "cross", "kind": "boop", "freq": 200, "dur": 0.3, "vol": 0.7},
  {"at": "tick", "kind": "run", "inst": "marimba", "from": "E5", "n": 2, "dt": 0.1, "vol": 0.7},
  {"at": "pullback", "kind": "swell", "dur": 1.6, "freq": 700, "vol": 0.6},
  {"at": "logo", "kind": "pop", "freq": 700, "vol": 0.8}
]
```
```json music
{"preset": "corporate-bright", "bpm": 120, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16 / 4:5:** poster is a single tall column, one section per screen; camera moves are mostly vertical.
- **1:1:** two sections visible at once is fine; scale each target to about 80% of the frame.
- **16:9:** snake the sections (title, steps in a row, fact and compare side by side); camera moves mostly horizontal.
- Keep the badge, button and text inside `--safe-*` at every camera stop.

## Loop & ending
Pull back to the full poster, slide in the logo and the button, hold about a second, then fade the poster to `--bg` so the first frame (title card popping in) restarts cleanly.

## Guardrails
- Flat shapes only: rounded corners, thin dotted guide lines, plenty of white space, no 3D and no photos.
- Keep every line of text short; only use facts the user gave and never invent numbers.
- Red is used only for the cross; leave out any section that does not fit the topic.

## QA
- Each camera stop frames its whole section with margin; nothing is clipped at the poster edge.
- Person icons: exactly N of 10 lit; the number matches the user's fact.
- The pull-back frame shows all sections readable as shapes; logo and button inside the safe area.
- `audio-report`: pops rise across the steps, no clipping, swell audible at the pull-back.
