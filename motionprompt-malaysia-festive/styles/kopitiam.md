---
name: kopitiam
title: Kopitiam
description: A sunny Malaysian kopitiam morning as a cosy flat illustration: a marble table with kopi cup, kaya toast and half-boiled eggs, teh tarik pulled high between mugs, a slow ceiling fan, and a chalkboard menu that writes itself. For cafes, kopitiam, breakfast promos and menus.
tags: ["food","malaysia","retro"]
library: GSAP
sound: true
difficulty: 4
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
hidden: true
---
# Kopitiam

**One-liner:** a round white marble table in front of a cream wall with green-and-cream retro tiles, morning light through a louvred window with dust specks in the beams and a slowly turning ceiling fan; classic kopitiam breakfast drops in, a hand pulls glossy teh tarik in a long arc, and a chalkboard menu writes itself letter by letter before a duster wipes it clean.
**Best for:** kopitiam and cafe promos, a breakfast set, a menu, a Malaysian morning mood. Hidden on the site but fully supported.
**Avoid when:** you need a modern or minimal look.

## Inputs to gather
- Headline for the chalkboard, menu items with prices (or use a short line from the message). Foods and drinks named in the request (else classic kopitiam breakfast). Language (Malay or English).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A warm Malaysian kopitiam morning as a clean cosy flat illustration: a round white marble table in front of a cream wall with retro green and cream tiles | Layered SVG: wall, tile grid (green/cream), marble table ellipse with veining |
| L2 | Morning sun through a louvred window: soft beams cross the room, tiny dust specks float in them; an old ceiling fan turns slowly overhead | Window slats; beam polygons with low alpha; seeded specks drifting by `sin`; fan blades rotate by `t` (finite) |
| L3 | On the table: the requested food and drink, or classic kopitiam breakfast (thick white cup and saucer with a green rim, kaya toast with butter, half-boiled eggs); each item drops gently into place; hot drinks steam | SVG item functions; drop with a small settle; steam paths |
| L4 | A hand pulls teh tarik: a glossy milky tea stream arcs from a high mug into a low one, stretching long and short a few times, a frothy top builds | Stream as a thick stroked curve between two mug positions with height oscillating by a spring; froth circles grow |
| L5 | A chalkboard menu writes itself in chalk, letter by letter, with a little chalk stick moving along; the chalk headline is the user's message, with menu items and prices below (or a short line if none) | Board rect; text reveal with a moving chalk stick (a rectangle at the reveal front); chalk texture via noise mask |
| L6 | Write the text in the user's language (Malay or English) | `CONTENT.lang` |
| L7 | At the end a duster wipes the board and the table clears so it loops | Duster rect sweeping with a smear mask; items lift/fade |
| T1 | A sketchy chalk font (Cabin Sketch) for the headline and a hand-written font (Caveat) for the menu, both with a dusty chalk texture | Cabin Sketch 700, Caveat 700; chalk texture as a noise mask/alpha |
| T2 | Brand colours if given, else cream, kopitiam green, chalkboard, chalk white, chalk yellow, milky tea brown | Tokens below |
| S1 | A soft clink of cups, saucers and plates as each item lands on the marble (lighter when cleared); a liquid pour for the teh tarik that gets louder and brighter as the mug is pulled high and softer as it comes down, with a frothy splash, small bubbles and a few drips; gritty chalk scratches with a squeak now and then; a soft felt rub as the duster wipes; the gentle whirr of the slow ceiling fan underneath | Cue table below |
| S2 | Relaxed kopitiam morning bed about 80 bpm: soft fingerpicked nylon guitar, gentle old-radio electric piano tune, light brushes; warm and unhurried; loops | `guitar-morning` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | GSAP HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #f4e8c8;
--ink: #f7f3e8;
--accent: #3f8f6b;
--board: #263229;
--chalk: #f5d677;
--tea: #b77a47;
```
```json fonts
[
  {"family": "Cabin Sketch", "id": "cabin-sketch", "weights": [700], "role": "chalk headline"},
  {"family": "Caveat", "id": "caveat", "weights": [700], "role": "chalk menu"}
]
```

## Beat sheet
```json beats
{"bpm": 80, "events": [
  {"id": "room", "at": 0.0, "label": "light beams, fan, wall"},
  {"id": "item", "repeat": {"n": 3, "fromFrac": 0.08, "everyFrac": 0.07}, "label": "cup, toast, eggs land"},
  {"id": "pull", "at": 0.32, "label": "teh tarik pull begins"},
  {"id": "foam", "at": 0.52, "label": "froth builds, drips"},
  {"id": "board", "at": 0.58, "label": "chalkboard writes itself"},
  {"id": "squeak", "at": 0.7, "label": "a chalk squeak"},
  {"id": "wipe", "at": 0.9, "label": "duster wipes the board, table clears"}
]}
```

## Build recipe
- **Marble and tiles:** seeded veins on the ellipse; tile grid with alternating green/cream, a darker grout line.
- **Light:** 2 to 3 translucent polygons (`opacity 0.18`) from the window; dust specks (40) as tiny circles with slow `sin` drift; strictly deterministic.
- **Teh tarik stream:** top mug at `(x1, yHigh(t))`, low mug at `(x2, yLow)`; stream = cubic Bezier with control points sagging; thickness 10 px with a glossy highlight (lighter stroke on top); amplitude `yHigh(t) = base - 140 * spring-pulses`.
- **Chalk writing:** render the headline and menu to an offscreen canvas; reveal using a left-to-right mask per line at controlled speed; chalk texture = multiply with a noise canvas; the stick follows the reveal front.
- **Pitfalls:** keep the fan rotation finite and low speed (about 0.2 rev/s) to avoid strobing; no `<br>` in menu text (each line is its own element).

## Sound plan
How each effect of the brief is covered (a warm, real kopitiam feel timed to the motion):
- **A soft clink of cups, saucers and plates as each item lands on the marble, and a lighter clink as each is cleared:** `chime`/`knock` (glassy) at `item*` and `wipe`.
- **A liquid pouring stream for the teh tarik that gets louder and brighter as the mug is pulled high and softer as it comes down:** `pour` at `pull` (repeat as it stretches).
- **A frothy splash and small bubbles as the foam builds, then a few drips:** `pop` + `drip` at `foam`.
- **Gritty chalk scratches as each line writes, with a small squeak now and then:** `scratch` at `board`, `chirp` (tiny squeak) at `squeak`.
- **A soft felt rub as the duster wipes the board:** `paper`/`scratch` (low) at `wipe`.
- **The gentle whirr of the slow ceiling fan underneath:** a low `whir` bed for the full length.
```json cues
[
  {"at": "room", "kind": "whir", "f0": 60, "f1": 62, "dur": "D", "vol": 0.14},
  {"at": "item*", "kind": "knock", "freq": 1400, "dur": 0.08, "vol": 0.55},
  {"at": "item*+0.02", "kind": "chime", "freq": 2400, "dur": 0.5, "vol": 0.3},
  {"at": "pull", "kind": "pour", "dur": 2.4, "vol": 0.45},
  {"at": "pull+1.2", "kind": "pour", "dur": 1.4, "vol": 0.55},
  {"at": "foam", "kind": "pop", "freq": 700, "vol": 0.4},
  {"at": "foam+0.3", "kind": "drip", "freq": 950, "vol": 0.4},
  {"at": "foam+0.7", "kind": "drip", "freq": 850, "vol": 0.35},
  {"at": "board", "kind": "scratch", "dur": 3.5, "freq": 2200, "jitter": 0.7, "vol": 0.4},
  {"at": "squeak", "kind": "chirp", "f0": 2600, "f1": 3400, "dur": 0.1, "vol": 0.25},
  {"at": "wipe", "kind": "paper", "dur": 0.6, "vol": 0.5},
  {"at": "wipe+0.2", "kind": "knock", "freq": 1300, "dur": 0.08, "vol": 0.35}
]
```
```json music
{"preset": "guitar-morning", "bpm": 80, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16 / 4:5:** table in the lower half, chalkboard on the wall above it (upper half); teh tarik at the right of the table; keep the board inside the safe area.
- **16:9:** table left-centre, chalkboard on the right wall; window at the top left.
- **1:1:** table centre-bottom, board above.

## Loop & ending
The duster wipes the board and the table items clear; the scene returns to the empty morning room (frame 0).

## Guardrails
- If the user names no food or drink, show the classic kopitiam breakfast (kopi cup, kaya toast with butter, half-boiled eggs).
- Write the user's text in the language used (Malay or English); keep it as the chalk headline with menu items and prices from the request underneath, or a short line from the message when none are given.
- Keep it a clean, cosy flat illustration; the fan turns slowly and never strobes.

## QA
- Frame at `pull + 1 s`: stream arcs between a high and a low mug, froth starting.
- Frame at `board + 60%`: half the chalk text written with the stick at the front.
- Text legible against the board; final frame: empty table and clean board.
