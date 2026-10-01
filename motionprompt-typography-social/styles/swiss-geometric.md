---
name: swiss-geometric
title: Swiss geometric
description: A bold Swiss-style poster in motion: flat geometric shapes on a strict visible grid slide, turn in quarter turns and snap into cells with crisp easing, while a numbered service list lights up one row at a time with a matching shape marker, then a key fact and a solid call-to-action button. For studios, agencies, consultants and service brands.
tags: ["brand","promo","text"]
library: GSAP
sound: true
difficulty: 3
default_duration: 12
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Swiss geometric

**One-liner:** an off-white poster with a visible hairline grid; only three or four flat colours (near black, signal red, cobalt); circles, squares, half and quarter circles and thick lines glide along the grid one direction at a time, turn in quarter turns and lock exactly into cells; the brand name opens big, then 3 to 5 numbered services slide up one by one and light up in the accent while the shapes rearrange into a bold marker for each item; it closes on one key fact or price and a solid accent button with the contact.
**Best for:** design and motion studios, agencies, consultants, service menus, a brand introduction.
**Avoid when:** you want playful bounce or gradients; this style is exact and restrained.

## Inputs to gather
- Business name, role line ("Design & Motion"), 3 to 5 services, one key fact or price, call to action and contact (website or handle). Brand colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | Present my business and list my services as a bold Swiss-style poster in motion: bold flat shapes (circles, squares, half circles, quarter circles, thick lines) on a strict visible grid with thin hairlines; only three or four flat colours, no gradients or shadows | A grid of `cols x rows` cells (e.g. 6 x 8) drawn as hairlines; shapes are SVG primitives sized in cells |
| L2 | Every move is precise: shapes slide along the grid one direction at a time, turn in quarter turns and snap exactly into their cells with crisp ease in and ease out; no wobble, no bounce | Moves only along one axis at a time; rotations in 90 degree steps; easing `power3.inOut`/`expo.inOut`; positions are integer cells |
| L3 | Open with my brand line: the business name big, with a small role line under it while the shapes compose around it | Name in large type in the text area; shapes fly to their cells |
| L4 | Then a numbered list of my services (3 to 5) in large tight type with thin rules between rows; rows slide up into view one by one; light up one row at a time in the accent colour, and each time rearrange the shapes into a bold marker for that item (a circle, a grid of squares, a quarter circle) | Rows in a mask (`overflow: hidden`), `yPercent 100 to 0`; active row colour swap; shape presets `markerK` as target cell layouts |
| L5 | Close with one key fact or price and my call to action as a solid accent button with my contact next to it | Button rect in `--accent` with text; contact text |
| L6 | Keep the text in its own area of the grid, left aligned, with a thick rule above; each line slides up from behind a clean edge; end by clearing everything back to the empty page so it loops | Text column aligned to grid columns; rule; clear = shapes leave along the grid |
| L7 | Keep every line short and easy to read at a glance | Max 3 words per line where possible |
| T1 | A clean heavy grotesk (Archivo or Inter) with tight letter and line spacing, and small spaced capitals for the role line, numbers and contact | Archivo 800 (Inter alternate), caps small text with tracking |
| T2 | Brand colours if given, else warm off-white, near black, signal red, cobalt blue | Tokens below |
| S1 | Crisp, precise and dry: a small snap as each shape pops on or away, a sharp tick as each line and list row slides in, a soft slide that swells and settles with each move along the grid, quick ratchet clicks through every quarter turn, a clean mechanical thunk as each shape locks into its cell, a subtle bright ping when a row lights up, a clean two-note confirm tone when the button is pressed | Cue table below |
| S2 | A minimal, precise electronic bed for a design-studio mood, about 120 bpm, each service and the call to action starting on a bar line: clean kick, clicky hats, rim click on 2 and 4, simple bass line, a small pluck on each bar; drops out for the build-out; loops | `minimal-techno` preset with `dropAt` build-out |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 12` |
| O3 | GSAP HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #efe9dc;
--ink: #141414;
--accent: #e23b2e;
--blue: #1f45c7;
```
```json fonts
[
  {"family": "Archivo", "id": "archivo", "variable": true, "weightRange": "100 900", "role": "all text"},
  {"family": "Inter", "id": "inter", "variable": true, "weightRange": "100 900", "role": "alternate text"}
]
```

## Beat sheet
Bars at 120 bpm are 2 s; each service starts on a bar line.
```json beats
{"bpm": 120, "events": [
  {"id": "name", "at": 0.0, "label": "brand name, shapes compose"},
  {"id": "service", "repeat": {"n": 4, "fromBeat": 4, "everyBeat": 4}, "label": "each service row lights on a bar line"},
  {"id": "turn", "repeat": {"n": 8, "fromBeat": 2, "everyBeat": 2}, "label": "shapes turn a quarter and lock"},
  {"id": "fact", "at": 0.7, "label": "key fact or price"},
  {"id": "cta", "at": 0.8, "label": "call to action button"},
  {"id": "press", "at": 0.86, "label": "button pressed"},
  {"id": "clear", "at": 0.93, "label": "build-out to the empty page"}
]}
```

## Build recipe
- **Grid:** define `cell = W / cols`; every shape has `{col, row, w, h, rot}` in integer cells; a move animates only one of `col`/`row` at a time; snap = the final easing step lands exactly on an integer (use `power4.out` to avoid overshoot).
- **Markers:** each service has a target layout (a `markerK` map of shape ids to cells), e.g. marker 1: one large circle; marker 2: a 3 x 3 grid of squares; marker 3: a quarter circle; interpolate shape positions between layouts along the grid.
- **Type:** rows are `display:flex` with a number (small caps) and the service name in large tight type; thin rules `1px`; active row colour tween `--ink` to `--accent` (a hard cut is also fine).
- **Restraint:** exactly three or four colours from the tokens; no opacity fades on shapes except at the very end.
- **Pitfalls:** no `back` or `elastic` eases; no drop shadows; make sure rotation pivots on the cell centre; do not blur.

## Sound plan
Crisp, precise and dry. How each effect of the brief is covered:
- **A small snap as each shape pops on or away:** `rim`/`click` at shape entrances and exits.
- **A sharp tick as each line and each list row slides in:** `tick` at `service*`.
- **A soft slide that swells and settles with each move along the grid:** `swish` (soft) at `turn*`.
- **Quick ratchet clicks through every quarter turn:** `ticks` (three fast clicks) at `turn*`.
- **A clean mechanical thunk as each shape locks into its cell:** `thud` (dry, short) at `turn*+0.25`.
- **A subtle bright ping when a row lights up:** `ping` at `service*`.
- **A clean two-note confirm tone when the call to action button is pressed:** `run` of two `blip` at `press`.
```json cues
[
  {"at": "name", "kind": "rim", "freq": 2200, "vol": 0.5},
  {"at": "service*", "kind": "tick", "freq": 2800, "vol": 0.5},
  {"at": "service*", "kind": "ping", "freq": 1600, "dur": 0.5, "vol": 0.3},
  {"at": "turn*", "kind": "swish", "dur": 0.3, "vol": 0.25},
  {"at": "turn*", "kind": "ticks", "n": 3, "span": 0.12, "tick": "click", "vol": 0.35},
  {"at": "turn*+0.25", "kind": "thud", "freq": 110, "dur": 0.08, "vol": 0.55},
  {"at": "fact", "kind": "rim", "freq": 1800, "vol": 0.5},
  {"at": "cta", "kind": "tick", "freq": 2400, "vol": 0.5},
  {"at": "press", "kind": "run", "inst": "lead", "notes": ["E5", "B5"], "n": 2, "dt": 0.09, "len": 0.15, "vol": 0.5},
  {"at": "clear", "kind": "repeat", "every": 0.06, "times": 5, "of": {"kind": "click", "freq": 1500, "vol": 0.3}}
]
```
```json music
{"preset": "minimal-techno", "bpm": 120, "gain": 1, "duck": 0.4, "layers": {
  "blips": false, "drone": false,
  "drums": {"hat": "x-x-x-x-x-x-x-x-", "rim": "----x-------x---", "lanes": {"hat": 0.4}, "dropAt": [["clear", "end"]]},
  "bass": {"style": "root", "vol": 0.5, "dropAt": [["clear", "end"]]}
}}
```

## Layout by aspect ratio
- **9:16 / 4:5:** a 4 x 8 grid; shapes occupy the top third while the text column occupies the lower two thirds, left aligned; the button at the bottom above the safe zone.
- **16:9:** a 8 x 4.5 grid; text area on the left three columns, shapes on the right.
- **1:1:** a 6 x 6 grid; shapes top, text below.

## Loop & ending
Everything leaves along the grid to the empty off-white page (frame 0).

## Guardrails
- Only three or four flat colours; no gradients or shadows.
- Every move is precise: no wobble, no bounce; ease in and ease out only.
- Keep every line short and easy to read at a glance.

## QA
- Any frame: all shapes sit exactly on grid cells (check edges align with hairlines) once a move is complete.
- Frame at `service2 + 0.8 s`: row 2 in the accent with a matching marker; other rows dark.
- Frame at `press + 0.3 s`: the button fully visible with contact text; last frame is the empty page.
