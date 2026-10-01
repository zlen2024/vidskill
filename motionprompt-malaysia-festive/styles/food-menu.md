---
name: food-menu
title: Food menu
description: A top-down flat lay: ingredients drop onto a plate with a bounce, steam curls up, hand-lettered labels with curved arrows appear and a menu card slides in with the dish name and a stamped price badge. For restaurants, cafes, food stalls and recipes.
tags: ["food","promo"]
library: GSAP
sound: true
difficulty: 3
default_duration: 12
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"good"}
---
# Food menu

**One-liner:** looking straight down at a warm wood or linen table, a plate sits in the middle; ingredients drop on one by one, steam curls, handwritten labels draw curved arrows to each ingredient, a menu card slides in with the dish name, a short description and a round price badge that gets stamped on.
**Best for:** a dish launch, a menu item, a daily special, a recipe teaser.
**Avoid when:** you need real food photography as the hero (attach a photo and match its colours instead) or a multi-dish catalogue.

## Inputs to gather
- Dish name, 3 to 6 ingredients, short description, price. A food photo (optional: match ingredients, colours and plating). Brand colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | Looking straight down at a table like a social-media food photo; clean flat illustration with soft shadows | Top-down SVG scene; soft blurred shadows under objects |
| L2 | Warm wood or linen table; a plate or bowl in the middle for the dish; match the photo if one is attached | Table = wood plank pattern or linen weave (seeded); plate circle with rim highlights |
| L3 | Ingredients drop onto the plate one by one with a little bounce until the dish is complete; a few small props around (herbs, a lime, chillies) | Ingredient SVG functions; drop = scale from 1.4 and `y` from above with `bounce` ease; props placed once |
| L4 | Soft steam curls up from anything hot | 3 to 4 wavy paths, `strokeDashoffset` + opacity, offset per puff |
| L5 | Hand-lettered labels around the plate, each with a small curved arrow that draws itself toward its ingredient | Caveat labels; arrow path with `strokeDashoffset` and an arrowhead |
| L6 | A menu card slides in with the dish name, a short description and the price; the price is stamped on as a round badge | Card `x` slide; badge scale from 2.2 with a hard ease and a tiny shake |
| L7 | At the end the labels fade, the card slides away and the food lifts off so it loops | Reverse: labels opacity, card out, ingredients lift `y` + scale down |
| T1 | Casual handwriting (Caveat) for labels, elegant serif (DM Serif Display) for the dish name, rounded bold sans (Nunito) for small details | Caveat 700, DM Serif Display 400, Nunito 700 |
| T2 | Brand colours if given, else warm wood, cream card, dark brown text, tomato red, leaf green | Tokens below |
| S1 | Ingredient sounds: muffled thud rice, wet splat sauce, round plops eggs, crisp taps sliced vegetables, pebble ticks nuts; steam hiss swelling and fading; squeaky marker strokes per label/arrow; paper swish for the card; firm stamp thunk; light rising swish as food lifts | Cue table below |
| S2 | Cheerful cooking-show bed about 87 bpm: bright ukulele strums, round bass, soft kick, claps, shaker, small glockenspiel tune; quiet; loops | `ukulele-folk` at 87 bpm |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 12` |
| O3 | GSAP HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #c48a58;
--card: #fff7ea;
--ink: #3b2418;
--accent: #d8452b;
--leaf: #3f8a3c;
```
```json fonts
[
  {"family": "Caveat", "id": "caveat", "weights": [700], "role": "labels"},
  {"family": "DM Serif Display", "id": "dm-serif-display", "weights": [400], "role": "dish name"},
  {"family": "Nunito", "id": "nunito", "variable": true, "weightRange": "200 1000", "role": "details"}
]
```

## Beat sheet
```json beats
{"bpm": 87, "events": [
  {"id": "plate", "at": 0.0, "label": "plate settles on the table"},
  {"id": "ing", "repeat": {"n": 5, "fromFrac": 0.08, "everyFrac": 0.08}, "label": "ingredients drop"},
  {"id": "steam", "at": 0.5, "label": "steam starts curling"},
  {"id": "label", "repeat": {"n": 4, "fromFrac": 0.52, "everyFrac": 0.05}, "label": "labels and arrows draw"},
  {"id": "card", "at": 0.75, "label": "menu card slides in"},
  {"id": "stamp", "at": 0.83, "label": "price badge stamped"},
  {"id": "lift", "at": 0.92, "label": "card out, food lifts off"}
]}
```

## Build recipe
- **Ingredients:** each is a small SVG group; matching the dish (rice = many small grains as a mound of rice-coloured circles, sauce = a blob, egg = white ellipse + yolk circle, sliced vegetables = discs, nuts = brown ovals). Give each ingredient its own `landSound` key so sound cues can match.
- **Drop and bounce:** `tl.fromTo(g, {y: -160, scale: 1.4, opacity: 0}, {y: 0, scale: 1, opacity: 1, duration: 0.45, ease: "bounce.out"}, T["ing" + i])`; shadow scales inversely.
- **Steam:** looping-free: each puff is a path with `strokeDashoffset` 1 to 0 then opacity fade; offset by 0.35 s; total puffs computed from D.
- **Labels/arrows:** measure ingredient positions, place labels on the outside of the plate along the radius, arrow start at the label edge to the ingredient.
- **Stamp:** badge `scale 2.4 to 1` in 0.12 s with `power4.in`, then a 0.08 s squash; add a ring flash.
- **Pitfalls:** no photos required; if a photo is attached, colour-pick 4 dominant colours into the ingredients; keep the card text inside the card.

## Sound plan
Appetising little sounds timed to the motion; each ingredient lands with its own soft sound. How each effect of the brief is covered:
- **Muffled thud for rice, wet splat for sauce, round plops for eggs, crisp taps for sliced vegetables, pebble ticks for nuts:** `thud` (soft), `hiss`-based splat via `thud` + `crackle`, `pop`, `tick`, `knock` at `ing*`, chosen per ingredient.
- **Soft steam hiss that swells and fades with each puff:** `hiss`/`swell` at `steam`.
- **Squeaky marker strokes as each label and arrow draws:** `scratch` at `label*`.
- **Paper swish as the menu card slides in and out:** `paper` at `card` and `lift`.
- **Firm stamp thunk as the price badge lands:** `stamp` at `stamp`.
- **Light rising swish as the food lifts away:** `swish` at `lift`.
```json cues
[
  {"at": "plate", "kind": "thud", "freq": 90, "vol": 0.5},
  {"at": "ing1", "kind": "thud", "freq": 75, "dur": 0.25, "vol": 0.7},
  {"at": "ing2", "kind": "thud", "freq": 110, "dur": 0.2, "vol": 0.55},
  {"at": "ing3", "kind": "pop", "freq": 320, "rise": 1.3, "vol": 0.7},
  {"at": "ing4", "kind": "tick", "freq": 2200, "vol": 0.8},
  {"at": "ing5", "kind": "repeat", "every": 0.06, "times": 4, "of": {"kind": "knock", "freq": 900, "dur": 0.05, "vol": 0.4}},
  {"at": "steam", "kind": "hiss", "dur": 1.6, "hp": 3500, "vol": 0.25},
  {"at": "steam", "kind": "swell", "dur": 1.6, "freq": 4000, "vol": 0.25},
  {"at": "label*", "kind": "scratch", "dur": 0.5, "freq": 2800, "vol": 0.4},
  {"at": "card", "kind": "paper", "dur": 0.35, "vol": 0.6},
  {"at": "stamp", "kind": "stamp", "dur": 0.3, "vol": 0.9},
  {"at": "lift", "kind": "paper", "dur": 0.35, "vol": 0.5},
  {"at": "lift", "kind": "swish", "dur": 0.4, "f0": 800, "f1": 4500, "vol": 0.45}
]
```
```json music
{"preset": "ukulele-folk", "bpm": 87, "gain": 1, "duck": 0.5, "layers": {"melody": {"voice": "glock", "sparse": 0.4, "vol": 0.3}}}
```

## Layout by aspect ratio
- **9:16 / 4:5:** plate centre-upper, card slides in from the bottom into the lower third, labels arranged around the plate; keep the badge inside the safe area.
- **16:9:** plate left of centre, card slides in from the right.
- **1:1:** plate centre, card overlapping the lower right.

## Loop & ending
Labels fade, the card slides out, the food lifts off; the empty table equals frame 0.

## Guardrails
- Draw everything as clean flat illustration with soft shadows, viewed straight from above.
- If a food photo is attached, match its ingredients, colours and plating rather than inventing a different dish.
- Use only the dish name, description and price the user gave.

## QA
- Frame at `ing5 + 0.6 s`: dish complete and readable from above; steam visible.
- Frame at `stamp + 0.5 s`: badge round and legible; price correct.
- Arrows point at their ingredients and never cover the price or the dish name.
