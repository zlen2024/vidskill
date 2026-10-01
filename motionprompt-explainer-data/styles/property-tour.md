---
name: property-tour
title: Property tour
description: A 3D floor plan builds itself from above at a three-quarter angle: floor slab, walls rising room by room, windows and doors cutting in, furniture popping with a bounce, rooms lighting up in pastel colours with size tags, a slowly orbiting camera and a price card at the end. For property listings, show units and interior design.
tags: ["3d","product","explainer"]
library: Three.js
sound: true
difficulty: 5
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Property tour

**One-liner:** a clean architectural 3D plan on a warm off-white background: the floor slab appears, walls rise room by room (cut at about chest height so every room stays visible), glass fades into window gaps, doors swing open, furniture pops in with a springy bounce, rooms light up in soft pastel colours each with a tag ("Master bedroom 15 x 18 ft"), the camera orbits slowly and never stops, the project name and "3 bed · 2 bath" sit in a corner, and a price card slides in near the end before everything folds away.
**Best for:** property listings, show units, developers' launches, interior and renovation stories.
**Avoid when:** you have no layout or room sizes: ask for them or a floor plan image.

## Inputs to gather
- Layout: rooms with names and sizes, positions (or a floor plan image to follow), number of bedrooms and bathrooms, project name, price and one or two chips (Freehold, etc.). Brand accent colour.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A 3D floor plan of a home that builds itself, seen from above at a three-quarter angle; use the user's layout, rooms, sizes and price; follow an attached plan | Room rectangles from `CONTENT.rooms` (x, z, w, d in feet scaled to units); perspective camera at 45 degrees elevation |
| L2 | First the floor slab appears; then the walls rise room by room, cut at about chest height so every room stays visible; then the windows and doors cut in (glass fades into the window gaps, doors swing open) | Slab box scale-in; wall boxes `scaleY 0 to 1` staggered per room; walls built as segments around openings (no boolean ops); glass planes fade in; door leaves rotate open |
| L3 | Furniture pops into each room with a small springy bounce: sofa, coffee table and rug, dining table and chairs, kitchen counters and island, beds with pillows, wardrobes, bathroom fittings, a few plants | Furniture builder per room type from primitive boxes/cylinders; `MP.spring` scale |
| L4 | Rooms light up one by one in soft pastel colours, each with a clean tag showing its name and size | Floor plane colour tween; DOM tags projected from room centres |
| L5 | The camera orbits slowly and smoothly the whole time, never fully still | Azimuth `= a0 + 0.35 * t / D * 2*PI * 0.2`; slow elevation drift |
| L6 | The project name and a short line like "3 bed · 2 bath" sit in a corner; near the end a price card slides in with the price and one or two short chips (Freehold) | DOM corner text; card `y` |
| L7 | At the end everything folds away so it loops | Reverse: furniture down, walls scaleY 0, slab out |
| L8 | Clean architectural look: white walls with dark cut tops, light oak floors, pale stone tiles in kitchen and bathrooms, soft daylight and soft shadows on a warm off-white background | Materials: walls `#ffffff` with dark caps, oak floor texture (canvas planks), stone tiles (canvas), directional light + soft shadows (PCFSoft) |
| T1 | A clean modern sans (Manrope), bold for names and the price | Manrope 500/700/800 |
| T2 | Brand colours if given (one accent), else deep teal accent, dark slate text, warm off-white background | Tokens below |
| S1 | A deep soft thump as the floor slab lands, a soft rising swell per room as walls grow (a step higher each), a run of small glass chimes as windows fade in and gentle creaks as doors swing, a small springy pop per furniture piece with a soft thud for big pieces, a light switch click and warm glow per lit room, a soft swoosh with a bright two-note chime as the price card slides in, soft reversed pops and a falling whoosh at the fold | Cue table below |
| S2 | Modern confident real-estate bed about 120 bpm: warm electric piano chords, round bass, light kick, soft clap, crisp hats; the beat drops for the fold; loops | `lofi-house` preset with a major key and `dropAt` fold |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | A Three.js HTML scene rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #f3f1ec;
--ink: #1f2a30;
--accent: #0f7b6c;
--oak: #d8b98e;
--stone: #e6e2da;
```
```json fonts
[{"family": "Manrope", "id": "manrope", "variable": true, "weightRange": "200 800", "role": "all text"}]
```

## Beat sheet
```json beats
{"bpm": 120, "events": [
  {"id": "slab", "at": 0.0, "label": "floor slab lands"},
  {"id": "wall", "repeat": {"n": 4, "fromFrac": 0.06, "everyFrac": 0.06}, "label": "walls rise room by room"},
  {"id": "glass", "at": 0.32, "label": "windows fade in, doors swing"},
  {"id": "furn", "repeat": {"n": 8, "fromFrac": 0.4, "everyFrac": 0.03}, "label": "furniture pops in"},
  {"id": "light", "repeat": {"n": 4, "fromFrac": 0.62, "everyFrac": 0.05}, "label": "rooms light up with tags"},
  {"id": "card", "at": 0.84, "label": "price card slides in"},
  {"id": "fold", "at": 0.93, "label": "everything folds away"}
]}
```
Match the `wall` and `light` repeats to the number of rooms.

## Build recipe
- **Scene:** `PerspectiveCamera(35)`, target the plan centre; render in `hf-seek` with DPR 1. Lights: hemisphere + a directional light casting soft shadows; if software GL is slow, fake shadows with dark translucent planes under furniture.
- **Rooms:** each room is a group (floor plane, 4 wall boxes with openings). Build openings by splitting a wall into segments (left, lintel, right) rather than boolean ops.
- **Walls "rise":** `scale.y` from 0 to 1 with `transformOrigin` at the base (move geometry pivot to the bottom).
- **Tags:** compute room centre in world space, project each frame, set DOM `transform`; keep tags upright and inside the frame.
- **Furniture:** small reusable builders (`sofa`, `bed`, `table`, `counter`, `plant`); scale animation with `MP.spring` and a soft `thud` for big pieces (align cues with `furn*`).
- **Pitfalls:** avoid z-fighting between floor and slab (offset by 0.01); do not rely on boolean geometry; keep the polygon count low.

## Sound plan
How each effect of the brief is covered:
- **A deep, soft thump as the floor slab lands:** `thud` (low) at `slab`.
- **A soft rising swell for each room as its walls grow, a step higher each time:** `swell` at `wall*`, pitch rising (`rise`).
- **A quick run of small glass chimes as the windows fade in and short gentle creaks as the doors swing open:** `run` of `chime` + `scratch` (creak) at `glass`.
- **A small springy pop for each piece of furniture with a soft thud for the big pieces:** `pop` at `furn*`, `thud` on every third.
- **A light switch click and a warm glow for each room that lights up:** `click` + `swell` (warm) at `light*`.
- **A soft swoosh with a bright two-note chime as the price card slides in:** `swish` + `run` of two `chime` at `card`.
- **Soft reversed pops and a falling whoosh as everything folds away:** `pop` with `rev` + `whoosh` (down) at `fold`.
```json cues
[
  {"at": "slab", "kind": "thud", "freq": 55, "dur": 0.5, "vol": 0.9},
  {"at": "wall*", "kind": "swell", "dur": 0.9, "freq": 400, "vol": 0.4, "rise": {"param": "freq", "from": 400, "by": 90}},
  {"at": "glass", "kind": "run", "inst": "chime", "from": "E6", "n": 6, "dt": 0.06, "len": 0.7, "vol": 0.35},
  {"at": "glass+0.3", "kind": "scratch", "dur": 0.5, "freq": 700, "vol": 0.2},
  {"at": "furn*", "kind": "pop", "freq": 480, "vol": 0.6, "rise": {"param": "freq", "from": 480, "by": 25}},
  {"at": "furn1+0.03", "kind": "thud", "freq": 90, "dur": 0.15, "vol": 0.4},
  {"at": "furn4+0.03", "kind": "thud", "freq": 85, "dur": 0.15, "vol": 0.4},
  {"at": "furn7+0.03", "kind": "thud", "freq": 80, "dur": 0.15, "vol": 0.4},
  {"at": "light*", "kind": "click", "freq": 1500, "vol": 0.6},
  {"at": "light*+0.05", "kind": "swell", "dur": 0.9, "freq": 900, "vol": 0.3},
  {"at": "card", "kind": "swish", "dur": 0.3, "vol": 0.45},
  {"at": "card+0.15", "kind": "run", "inst": "chime", "from": "G5", "n": 2, "dt": 0.14, "len": 1.2, "vol": 0.5},
  {"at": "fold", "kind": "repeat", "every": 0.07, "times": 6, "of": {"kind": "pop", "freq": 640, "rev": true, "vol": 0.4}},
  {"at": "fold", "kind": "whoosh", "dir": "down", "dur": 0.9, "vol": 0.5}
]
```
```json music
{"preset": "lofi-house", "bpm": 120, "key": "C", "scale": "major", "gain": 1, "duck": 0.5, "layers": {
  "drums": {"dropAt": [["fold", "end"]]}, "bass": {"dropAt": [["fold", "end"]]}
}}
```

## Layout by aspect ratio
- **16:9:** plan centred, project name top-left, price card lower-right.
- **9:16 / 4:5:** camera pulled back so the plan fits the width; name and chips at the top inside the safe area; price card slides up from the bottom safe margin.
- **1:1:** plan centred; corner text at top-left.

## Loop & ending
Furniture drops away, walls lower, the slab leaves; the empty warm background is frame 0.

## Guardrails
- Use the layout, room names, sizes and price from the user's request only; follow an attached floor plan when there is one.
- The camera orbits slowly and smoothly the whole time and is never fully still.
- Walls are cut at about chest height so every room stays visible.

## QA
- Frame at `furn8 + 0.5 s`: every room has recognisable furniture; camera angle differs from the previous frame check.
- Tags are inside the frame and legible; sizes match the request.
- Frame at `card + 0.6 s`: price card legible; last frame empty.
