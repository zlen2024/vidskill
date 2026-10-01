---
name: radial-infographic
title: Radial infographic
description: A rainbow cycle wheel that snaps together blade by blade around your logo or main idea, with numbered points, leader lines and a moody night-arena backdrop. For frameworks, cycles, 4 to 8 key points, business slides that come alive.
tags: ["explainer","brand","data"]
library: GSAP
sound: true
difficulty: 4
default_duration: 15
ratios: {"9:16":"great","4:5":"good","1:1":"good","16:9":"great"}
---
# Radial infographic

**One-liner:** an octagon "shutter" wheel of coloured blades, one per key point, snaps together around a dark hub; each point lights in turn with an elbow leader line, a typed heading and short text; a shine sweeps the finished wheel.
**Best for:** a framework, a process, a cycle, "our 6 pillars", a business slide that comes to life.
**Avoid when:** you have fewer than 4 or more than 8 points, or points that are long paragraphs. Ask the user for the points if they are missing.

## Inputs to gather
- 4 to 8 key points (heading, one question line, one or two short sentences each). Main idea or title for the hub, or a logo to place in it. Brand colours to blend around the wheel.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A bold business cycle-wheel infographic, like a polished slide that comes to life | Single SVG scene; wheel centred (upper part in tall frames) |
| L2 | 4 to 8 points around an octagon wheel of slanted colour blades like a camera shutter, one blade per point, each with a white line icon | Blades = polygons computed by angle (`n` sectors, slanted edges); icons from a small inline SVG set (lightbulb, chart, map pin, gear, target, people, shield, rocket) |
| L3 | Dark hub with a dashed outline holds the main idea in bold capitals, or the logo | Circle with `stroke-dasharray`; text fitted with `MP.fitLine` |
| L4 | Each point gets a numbered heading ("#1 INTRODUCTION"), an italic question line ("// WHAT IS THE PLAN ABOUT?") and one or two short sentences; thin white elbow leader lines join heading to blade; tall video: wheel on top, points in a grid below | Text blocks positioned by angle side (left/right of the wheel); leader = polyline path with one elbow; in 9:16 use a 2-column grid under the wheel |
| L5 | Hub pops in first, blades spin in one by one and snap into place, icons draw on; then each point in order: blade pushes out and glows, leader line draws, heading types, text follows | Hub spring, blades `rotation -140 to 0, scale 0.3 to 1` with `back.out`, icon strokes `strokeDashoffset`; per-point sequence at `point1..N` |
| L6 | Finish with the whole wheel complete, a quick ripple, a soft shine sweeping across; keep it floating; fold the blades away at the end | Ripple ring scaling out; shine = skewed gradient bar moving across the wheel (clip to wheel); gentle `sin` float; fold = reverse spin-out |
| L7 | Dark moody out-of-focus arena or city at night with soft bokeh, a floor that reflects the wheel, a vignette | Bokeh circles (seeded blurred discs), floor gradient with a flipped low-opacity copy of the wheel, vignette |
| L8 | Keep every text short; only the user's points; ask if missing | Truncate to short lines; refuse to invent points |
| T1 | Tall bold condensed capitals (Oswald) for headings and hub; clean sans (Inter) for small text | Oswald 600/700, Inter 400 |
| T2 | Brand colours blended around the wheel, else the rainbow set on dark navy with white text; number colour matches its blade | 8 wheel tokens + navy bg |
| S1 | Airy rise as the scene fades up, round hub thump, whoosh and crisp click per blade (rising a note), bell ping per point, zip per leader line, typing ticks, bright chord with bell sparkle when complete, falling whoosh with clicks on fold | Cue table below |
| S2 | Confident modern corporate bed about 120 bpm: pulsing synth bass, warm pads, light kick, claps, hats; blade clicks on the beat | `corporate-calm` preset at 120 bpm with a pulsing saw bass, kick, claps and hats; the blade clicks sit on the beat |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | SVG + GSAP rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #0b1020;
--ink: #ffffff;
--accent: #f57c1f;
--w1: #f57c1f;
--w2: #e53935;
--w3: #8e44c9;
--w4: #1f74d6;
--w5: #139e9b;
--w6: #2fa84f;
--w7: #8cc63f;
--w8: #f4bf1c;
```
```json fonts
[
  {"family": "Oswald", "id": "oswald", "weights": [600, 700], "role": "headings, hub"},
  {"family": "Inter", "id": "inter", "variable": true, "weightRange": "100 900", "role": "small text"}
]
```

## Beat sheet
```json beats
{"bpm": 0, "events": [
  {"id": "rise", "at": 0.0, "label": "scene fades up"},
  {"id": "hub", "at": 0.05, "label": "hub lands"},
  {"id": "blade", "repeat": {"n": 6, "fromFrac": 0.1, "everyFrac": 0.05}, "label": "blades snap in"},
  {"id": "point", "repeat": {"n": 6, "fromFrac": 0.42, "everyFrac": 0.08}, "label": "each point lights"},
  {"id": "complete", "at": 0.9, "label": "wheel complete, ripple and shine"},
  {"id": "fold", "at": 0.96, "label": "blades fold away"}
]}
```
Default is 6 points; with N points set the repeat counts to N and re-space (`everyFrac = 0.4 / N`).

## Build recipe
- **Geometry:** `angle_i = i * 360/N - 90`; each blade is a quadrilateral between radii `rIn` and `rOut` with a slant (shift the outer corners by 12 degrees) so the wheel reads like a shutter. Octagon outline = polygon of 8 points behind it.
- **Snap-in:** blade `transformOrigin` at the hub centre; from `rotation: -140, scale: 0.35, opacity: 0` to rest with `back.out(1.4)`; icon paths use `strokeDashoffset`.
- **Point sequence:** blade `scale 1.08` + glow filter (drop-shadow via SVG filter) for the active point only; leader path draws; heading typed via per-letter `opacity` stagger (no `<br>`).
- **Reflection floor:** duplicate the wheel `<use>` flipped vertically with opacity 0.18 and a fade gradient mask.
- **Bokeh:** 25 seeded circles with blur; slow drift by `sin`; keep them away from text.
- **Pitfalls:** text in SVG needs a loaded font (`MP.fontsReady`); keep leader lines from crossing text boxes; use `transform-box: fill-box` for SVG transforms.

## Sound plan
How each effect of the brief is covered:
- **Soft airy rise as the scene fades up:** `swell` at `rise`.
- **Round thump when the hub lands:** `thud` at `hub`.
- **Quick whoosh and a crisp satisfying click as each blade snaps in, rising a note each time:** `swish` + `click` at `blade*`, click pitch rising.
- **Soft bell ping as each point lights up:** `ping` at `point*`.
- **Light zip as each leader line draws:** short `chirp` at `point*`.
- **Tiny typing ticks for the headings:** `typing` at `point*`.
- **Bright wide chord with a sparkle of bells when the wheel is complete:** `run` of `chime` notes plus `sparkle` at `complete`.
- **Falling whoosh with small clicks as it folds away:** `whoosh` (down) + `ticks` at `fold`.
```json cues
[
  {"at": "rise", "kind": "swell", "dur": 1.2, "freq": 500, "vol": 0.5},
  {"at": "hub", "kind": "thud", "freq": 70, "dur": 0.4, "vol": 0.9},
  {"at": "blade*", "kind": "swish", "vol": 0.45},
  {"at": "blade*", "kind": "click", "freq": 1500, "vol": 0.8, "rise": {"param": "freq", "from": 1500, "by": 180}},
  {"at": "point*", "kind": "ping", "freq": 1320, "dur": 0.8, "vol": 0.55},
  {"at": "point*", "kind": "chirp", "f0": 700, "f1": 1800, "dur": 0.12, "vol": 0.35},
  {"at": "point*", "kind": "typing", "n": 9, "dt": 0.05, "vol": 0.3},
  {"at": "complete", "kind": "run", "inst": "chime", "from": "C5", "n": 4, "dt": 0.07, "scale": "major", "len": 1.2, "vol": 0.6},
  {"at": "complete", "kind": "sparkle", "dur": 0.8, "vol": 0.5},
  {"at": "fold", "kind": "whoosh", "dir": "down", "dur": 0.7, "vol": 0.6},
  {"at": "fold", "kind": "ticks", "n": 6, "span": 0.6, "tick": "click", "vol": 0.4}
]
```
```json music
{"preset": "corporate-calm", "bpm": 120, "gain": 1, "duck": 0.5, "layers": {
  "bass": {"voice": "bassSaw", "style": "pulse", "vol": 0.55},
  "drums": {"kick": "x---x---x---x---", "clap": "----x-------x---", "hat": "x-x-x-x-x-x-x-x-", "lanes": {"hat": 0.35, "clap": 0.7}, "vol": 0.6},
  "pad": {"voice": "pad", "vol": 0.4}
}}
```

## Layout by aspect ratio
- **16:9:** wheel left of centre, points on both sides with elbow leaders.
- **9:16 / 4:5:** wheel on top (about 55% of the height), points in a 2-column grid underneath; leader lines shorten to a tick from blade to its grid cell number.
- **1:1:** wheel centre-top, points in two columns beneath at smaller type.

## Loop & ending
Blades fold away toward the hub and the hub fades; the first frame is the empty arena, so the loop restarts on the scene fading up.

## Guardrails
- Keep every text short and easy to read; only use the points the user gave, and ask if they are missing.
- Blade colours follow the brand blend when brand colours are given, otherwise the rainbow set; heading numbers match their blade colour.
- Keep the backdrop moody but text contrast high; no strobing shine (one soft sweep).

## QA
- N blades equal N points; each heading number colour equals its blade.
- Frame at `point3 + 0.8 s`: blade 3 pushed out and glowing, leader line complete, heading typed, text visible, others dim.
- Frame at `complete + 0.5 s`: whole wheel, ripple, shine mid-sweep.
- In 9:16 the point grid is inside the safe area and readable at phone size.
