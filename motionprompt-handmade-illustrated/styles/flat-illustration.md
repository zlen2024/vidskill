---
name: flat-illustration
title: Flat illustration
description: A clean flat vector business scene on solid bright blue: a bold white title, flat illustrated people (presenter at a flip chart, laptop, celebration), charts that draw themselves and bouncy pops. For explainers, team and service intros, promos.
tags: ["explainer","brand","promo"]
library: GSAP
sound: true
difficulty: 3
default_duration: 10
ratios: {"9:16":"good","4:5":"great","1:1":"great","16:9":"great"}
---
# Flat illustration

**One-liner:** a corporate-explainer look: bright blue background with darker rounded corner bars, a big white title with a thin spaced subtitle, and one to three flat scenes of people doing things that match the topic, with charts drawing themselves and props popping up.
**Best for:** business explainers, "what we do", service or team intros, milestones, promos with a friendly professional tone.
**Avoid when:** you need photos, 3D or a data-heavy chart (use `data-story`).

## Inputs to gather
- Title (2 to 5 words) and subtitle. 1 to 3 scene ideas matching the topic (presenting, working at a laptop, chatting, celebrating). A number or two if a chart should show data.
- Brand colours (background, board, dark, marker).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | Clean flat vector look: solid bright blue background with a few darker rounded bars tucked into the corners | Solid `--bg`, 3 to 4 rounded rects in a darker blue at the corners |
| L2 | Big bold white capitals title at the top with a thin spaced-out subtitle | Oswald 700 title, Oswald 300 subtitle with wide letter spacing |
| L3 | One to three flat scenes of illustrated people doing things that match the topic; no outlines, simple shapes, small friendly faces, mixed skin tones and hairstyles, white shirts and dark clothes | SVG people built from circles, rounded rects and paths (`figure(skin, hair, shirt)` helper); no strokes |
| L4 | Props and charts are flat too: a flip chart with a pie chart and a wave chart, a checklist, a speech bubble with a lightbulb, white four-point sparkles | Reusable SVG prop functions |
| L5 | Bouncy pops: title words rise one by one, then props and people spring up from the floor; the pie sweeps round with one slice popping out, the wave rises, checkmarks tick on | `MP.splitText(title, "words")` rise; `back.out` springs; pie via `stroke-dasharray` arcs; wave path `strokeDashoffset`; checks stagger |
| L6 | People stay alive: pointing with a marker, nodding, gesturing arms, blinking eyes, twinkling sparkles | Small looping-free cycles built from `T` (finite repeats via `Math.floor`); blink = eye scaleY at set times |
| L7 | Change scenes with a flip-chart page flip or a quick slide; short text; end on a clean full composition with the title | Page flip = `rotationY 0 to -90` panel; final hold on title + last scene |
| T1 | Tall condensed sans (Oswald or Bebas Neue) capitals for the title, a light weight for the subtitle | Oswald 700 and 300 (Bebas Neue optional alternative) |
| T2 | Brand colours if given, else bright blue bg, white text/shirts, light blue board, navy dark clothes, pink marker and checks | Tokens below |
| S1 | Whoosh + light tap per title word, bubbly pop per person/prop, rising tone for the pie, marker squeak on pointing, papery flip, tick per checkmark, glassy chimes for sparkles, bell for the lightbulb | Cue table below |
| S2 | Light upbeat corporate bed about 130 bpm: plucky arpeggio, soft kick, claps, shaker, plucked bass, warm pad | `corporate-bright` at 130 bpm |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 10` |
| O3 | SVG + GSAP rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #1565d8;
--ink: #ffffff;
--board: #a6c9f2;
--dark: #0d2152;
--accent: #ff5c93;
```
```json fonts
[{"family": "Oswald", "id": "oswald", "weights": [300, 700], "role": "title and subtitle"},
 {"family": "Bebas Neue", "id": "bebas-neue", "weights": [400], "role": "optional alternate title"}]
```

## Beat sheet
```json beats
{"bpm": 0, "events": [
  {"id": "title", "at": 0.0, "label": "title words rise"},
  {"id": "scene1", "at": 0.15, "label": "scene 1 people and props spring up"},
  {"id": "pie", "at": 0.3, "label": "pie chart sweeps"},
  {"id": "point", "at": 0.42, "label": "presenter points with the marker"},
  {"id": "flip", "at": 0.55, "label": "flip-chart page change"},
  {"id": "check", "repeat": {"n": 3, "fromFrac": 0.62, "everyFrac": 0.05}, "label": "checkmarks tick on"},
  {"id": "idea", "at": 0.8, "label": "lightbulb idea"},
  {"id": "end", "at": 0.9, "label": "clean full composition"}
]}
```

## Build recipe
- **People:** one `person(opts)` function returns an SVG group (head, hair path, torso, arms as two rounded rects that rotate at the shoulder). Vary skin tones (`#f2c9a5 #c98f63 #8a5a3b #5a3a26`), hair styles (round, side part, bun, curly), shirt white or navy. No strokes.
- **Pop-ups:** everything starts `scale 0` from the floor line (`transformOrigin: 50% 100%`) and springs with `back.out(2)`; stagger 0.08 s.
- **Charts:** pie slices are separate `path`s built from arcs; the sweep animates a mask arc; one slice translates outward. Wave = a smooth path revealed by `strokeDashoffset`.
- **Life:** blinking = eyes `scaleY 0.1` for 0.12 s at seeded times; nodding = head `rotation +-3` on `sin`; keep everything a finite function of `t`.
- **Pitfalls:** the SVG `viewBox` must match the composition aspect ratio, build scenes on a 1000-unit grid and scale; do not use CSS transforms plus GSAP on the same node (`gsap_css_transform_conflict`).

## Sound plan
How each effect of the brief is covered:
- **Soft whoosh as the title slides in with a light tap for each word:** `whoosh` at `title`, `tick` per word.
- **Bubbly pop as each person and prop springs up:** `pop` at `scene1` (staggered).
- **Smooth rising tone as the pie chart draws:** `riser` (short, tonal) at `pie`.
- **Marker squeak when someone points:** `scratch` at `point`.
- **Papery flip for the page change:** `paper` at `flip`.
- **Bright tick for each checkmark:** `tick` at `check*`.
- **Glassy chimes for the sparkles:** `sparkle` on scene starts.
- **Gentle bell for the lightbulb idea:** `bell` at `idea`.
```json cues
[
  {"at": "title", "kind": "whoosh", "dir": "up", "dur": 0.45, "vol": 0.5},
  {"at": "title+0.15", "kind": "ticks", "n": 4, "span": 0.5, "vol": 0.5},
  {"at": "scene1", "kind": "repeat", "every": 0.11, "times": 5, "of": {"kind": "pop", "freq": 500, "vol": 0.7}},
  {"at": "pie", "kind": "riser", "dur": 0.8, "tone": 0.6, "f0": 300, "f1": 1600, "vol": 0.45},
  {"at": "point", "kind": "scratch", "dur": 0.25, "freq": 3200, "vol": 0.4},
  {"at": "flip", "kind": "paper", "dur": 0.3, "vol": 0.6},
  {"at": "check*", "kind": "tick", "freq": 3200, "vol": 0.8, "rise": {"param": "freq", "from": 3000, "by": 250}},
  {"at": "scene1+0.5", "kind": "sparkle", "dur": 0.6, "vol": 0.4},
  {"at": "idea", "kind": "bell", "freq": 1100, "dur": 1.4, "vol": 0.65}
]
```
```json music
{"preset": "corporate-bright", "bpm": 130, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **16:9 / 1:1 / 4:5:** title on top, scene below as described.
- **9:16:** title takes the top 22%; scene uses the middle 55%; keep the bottom safe band clear; scenes may stack (people above, chart below).

## Loop & ending
End on a clean, full composition: title, last scene, sparkles twinkling; a soft fade to the plain blue restarts the loop.

## Guardrails
- Flat style: no outlines, simple shapes, small friendly faces, a mix of skin tones and hairstyles.
- Keep every line of text short and readable in a second.
- Do not invent statistics for the charts: use user numbers or clearly generic shapes without labels.

## QA
- People have faces, distinct skin tones and hairstyles, and none of them use strokes.
- Frame at `pie + 0.6 s`: pie mid-sweep with one slice offset; frame at `check3 + 0.3 s`: three ticks visible.
- Title fits the frame width; end frame is uncluttered.
