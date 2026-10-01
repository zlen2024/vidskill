---
name: chinese-new-year
title: Chinese heritage
description: A rich red-and-gold traditional Chinese heritage ad or festive card: red paper-cut patterns unfold, lanterns drop and sway, a plum blossom grows, gold coins bounce, your product or greeting rises with a gold shine and red seal badges stamp in. For Chinese New Year greetings and heritage-style product promos.
tags: ["product","festive","promo"]
library: GSAP
sound: true
difficulty: 5
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Chinese heritage

**One-liner:** like a vintage shop poster or a festive card: red paper-cut flowers, clouds and scrolls fan open in the corners as if folded paper is opening; a paper-cut medallion unfolds behind the hero; red round lanterns with gold tassels drop in and sway; a plum blossom branch grows and blooms; a few gold coins bounce into place; the product (or the greeting) is the hero, then two or three red seal badges stamp in with key points and the name lands in gold with a call to action.
**Best for:** Chinese New Year greetings, tea, herbal, drink, food or cosmetics products with a heritage look, festive promos.
**Avoid when:** the tone must be modern minimal. Keep claims gentle and honest.

## Inputs to gather
- Product (name, what it is, how it is used) or the greeting; 2 or 3 short seal points; 3 ingredient/feature props; call to action; Chinese characters if wanted (calligraphy). Language used. Brand colours (gold stays the accent).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A rich red and gold scene in a traditional Chinese heritage style, like a vintage shop poster or a festive card | Red `--bg` with cream/gold ornaments; poster-like framing border |
| L2 | Red paper-cut patterns (flowers, clouds, scrolls) fan open in the corners and get cut in like folded paper opening up; a paper-cut medallion unfolds behind the hero | Pattern SVGs built by mirroring one wedge N times (radial symmetry); "unfold" = wedges rotate from 0 to their angle (fan) with a stagger; medallion = a larger radial paper-cut |
| L3 | Round red lanterns with gold tassels drop in from the top and sway; a plum blossom branch grows and blooms; a few gold coins bounce into place | Lantern SVGs on strings (drop with `bounce`, pendulum sway); branch path grows by `strokeDashoffset` then blossoms scale; coins with `bounce.out` |
| L4 | For a product or brand: the product is the hero with packaging drawn in a vintage heritage style; it rises into the centre with a slow gold shine, then shows itself in use (pouring, opening, serving); key ingredients or features pop in around it as illustrated props with a paper-cut edge | Packaging as SVG (label, gold trims); shine sweep; in-use animation per product type; props with a white paper-cut outline |
| L5 | Two or three round red seal badges stamp in with key points in a few words each; keep claims gentle and honest | Round seals (double ring, cream text), stamp scale 1.8 to 1 |
| L6 | Then the product or brand name lands in gold with the call to action underneath and a thin gold rule between | Name (DM Serif Display gold), rule scaleX, CTA (Jost caps) |
| L7 | If the request is a greeting (like Chinese New Year), the greeting is the hero with a gold fu diamond on the medallion, and the seals carry short wishes | Diamond (rotated square) with a gold "fu" character (calligraphy) centred on the medallion |
| L8 | Soft gold sparkles and confetti drift, never flashing; at the end everything folds away and the lanterns lift out so it loops | Seeded gold specks drifting; reverse the folds; lanterns `y -300` |
| L9 | Write the text in the user's language; keep every word inside the frame and easy to read | Layout with safe margins |
| T1 | An elegant display serif (DM Serif Display) in gold for the name or greeting; a clean spaced-out sans (Jost) for the call to action and the seals | DM Serif Display 400; Jost 500 caps |
| T2 | If Chinese characters are included, draw them in a brush-calligraphy style (Ma Shan Zheng) | Ma Shan Zheng via `local()` or a subset file (see recipe) |
| T3 | Brand colours if given (gold as the accent), else deep red, paper red, gold, cream, blossom pink | Tokens below |
| S1 | Paper rustles and small scissor snips as the paper-cuts open, a swish and wooden knock as each lantern drops and soft rustles as it sways, a clear clink as the hero lands and little bells with each gold shine, sounds that match how the product is used (a cork pop, a slow thick pour, a porcelain spoon clink), a soft paper pop per prop, a gentle thud as each seal stamps, coin clinks, a warm gong with a small chime as the name lands | Cue table below |
| S2 | A festive pentatonic tune at about 120 bpm on a plucked guzheng-style sound with a low plucked bass, a big soft drum, woodblock and small hand cymbals, ending with a quick rising run back to the start; loops | `festive-pentatonic` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | GSAP HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #8e0c18;
--ink: #fff1d0;
--accent: #f2c14e;
--red: #d7262f;
--blossom: #ffd3de;
```
```json fonts
[
  {"family": "DM Serif Display", "id": "dm-serif-display", "weights": [400], "role": "name or greeting"},
  {"family": "Jost", "id": "jost", "variable": true, "weightRange": "100 900", "role": "call to action and seals"},
  {"family": "Ma Shan Zheng", "local": "Microsoft YaHei", "role": "brush characters (system fallback; vendor a subset for exact glyphs)"}
]
```

## Beat sheet
```json beats
{"bpm": 120, "events": [
  {"id": "cut", "repeat": {"n": 4, "fromFrac": 0.0, "everyFrac": 0.03}, "label": "paper-cut corners open"},
  {"id": "medallion", "at": 0.1, "label": "medallion unfolds"},
  {"id": "lantern", "repeat": {"n": 3, "fromFrac": 0.14, "everyFrac": 0.05}, "label": "lanterns drop"},
  {"id": "hero", "at": 0.32, "label": "hero lands, gold shine"},
  {"id": "use", "at": 0.42, "label": "product shown in use"},
  {"id": "prop", "repeat": {"n": 3, "fromFrac": 0.5, "everyFrac": 0.04}, "label": "props pop in"},
  {"id": "seal", "repeat": {"n": 3, "fromFrac": 0.64, "everyFrac": 0.06}, "label": "seal badges stamp"},
  {"id": "coin", "at": 0.6, "label": "coins bounce"},
  {"id": "name", "at": 0.82, "label": "name lands in gold, gong"},
  {"id": "fold", "at": 0.94, "label": "everything folds away"}
]}
```

## Build recipe
- **Paper-cut:** make one motif (a half-flower, a cloud) in a red path and mirror/rotate it to make the ornament; give it a slightly lighter drop shadow on a darker red to read as layered paper. The fan opening: children rotate from a shared pivot to their final angles with `back.out`.
- **Lanterns:** oval body with vertical ribs (arcs), gold caps and tassels; sway `rotation = 4 * sin(t * 1.6 + phase)`.
- **Product in use:** choose by type: drinks = cork pop then a slow pour into a cup; tea = a lid lifting and steam; cosmetics = a jar opening; food = a spoon serving. Keep it 2 s.
- **Characters:** for greeting characters (`fu` 福, `chun` 春, `xin nian kuai le`) use the brush font; if the machine lacks the font, embed a subset as `assets/fonts/brush-subset.woff2` (`pyftsubset` with the exact characters) and declare `@font-face` so lint and render agree.
- **Pitfalls:** never flash: sparkles are small and dim; keep the medallion behind the hero at 70% opacity; all text inside safe margins.

## Sound plan
How each effect of the brief is covered:
- **Paper rustles and small scissor snips as the paper-cuts open:** `paper` + a fast `ticks` (snips) at `cut*`.
- **A swish and a wooden knock as each lantern drops in, and soft rustles as it sways:** `swish` + `knock` at `lantern*`, soft `paper` after.
- **A clear clink as the hero lands and a run of little bells with each gold shine:** `chime`/`ding` at `hero`, `run` of `chime` after.
- **Sounds that match how the product is used (a cork pop, a slow thick pour, a porcelain spoon clink):** `pop` (cork), `pour`, `chime` (spoon) at `use`.
- **A soft paper pop for each prop:** `pop` + `paper` at `prop*`.
- **A gentle thud as each seal stamps down, coin clinks:** `stamp` at `seal*`, `coin` clinks at `coin`.
- **A warm gong with a small chime as the name lands:** `gong` + `chime` at `name`.
```json cues
[
  {"at": "cut*", "kind": "paper", "dur": 0.4, "vol": 0.45},
  {"at": "cut*+0.1", "kind": "ticks", "n": 3, "span": 0.18, "tick": "click", "f0": 2400, "f1": 3200, "vol": 0.35},
  {"at": "lantern*", "kind": "swish", "dur": 0.25, "vol": 0.4},
  {"at": "lantern*+0.25", "kind": "knock", "freq": 380, "dur": 0.12, "vol": 0.6},
  {"at": "lantern*+0.5", "kind": "paper", "dur": 0.4, "vol": 0.15},
  {"at": "hero", "kind": "ding", "freq": 2093, "dur": 1.2, "vol": 0.6},
  {"at": "hero+0.3", "kind": "run", "inst": "chime", "from": "G5", "n": 5, "dt": 0.09, "scale": "pentatonic", "len": 1.2, "vol": 0.45},
  {"at": "use", "kind": "pop", "freq": 200, "rise": 2.0, "dur": 0.14, "vol": 0.8},
  {"at": "use+0.4", "kind": "pour", "dur": 1.6, "vol": 0.45},
  {"at": "use+2.0", "kind": "chime", "freq": 2600, "dur": 0.5, "vol": 0.35},
  {"at": "prop*", "kind": "pop", "freq": 560, "vol": 0.6},
  {"at": "seal*", "kind": "stamp", "dur": 0.3, "vol": 0.75},
  {"at": "coin", "kind": "repeat", "every": 0.11, "times": 4, "of": {"kind": "coin", "vol": 0.4}},
  {"at": "name", "kind": "gong", "freq": 98, "dur": 2.8, "vol": 0.7},
  {"at": "name", "kind": "chime", "freq": 1568, "dur": 1.4, "vol": 0.5},
  {"at": "fold", "kind": "paper", "dur": 0.8, "vol": 0.4}
]
```
```json music
{"preset": "festive-pentatonic", "bpm": 120, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16 / 4:5:** medallion behind a centred hero in the middle band; lanterns hang from the top corners; seals in an arc under the hero; name and CTA in the lower third above the safe zone.
- **16:9:** hero centre, lanterns at both top corners, seals on the right, name below.
- **1:1:** as 4:5 with a smaller medallion.

## Loop & ending
Everything folds away and the lanterns lift out of frame; frame 0 is the empty red field before the first corner opens.

## Guardrails
- Soft gold sparkles and confetti drift, never flashing.
- Keep claims gentle and honest; only the key points the user gave.
- Write the user's text in the language used; keep every word inside the frame and easy to read.
- Use brush calligraphy only for Chinese characters the user provided.

## QA
- Frame at `medallion + 1 s`: medallion fully unfolded behind the hero area, corners cut.
- Frame at `seal3 + 0.5 s`: three seals legible; product still visible.
- Frame at `name + 0.8 s`: name in gold, rule and CTA readable.
- Any Chinese characters render (not tofu boxes): check a frame at the character reveal.
