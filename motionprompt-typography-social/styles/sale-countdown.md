---
name: sale-countdown
title: Sale countdown
description: Loud promo energy: diagonal stripes, a punchy 3-2-1 countdown with colour cuts, the offer slamming in as huge text, a swinging price tag, confetti and a diagonal wipe. For sales, flash deals, launches and limited offers.
tags: ["promo","social"]
library: GSAP
sound: true
difficulty: 3
default_duration: 8
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Sale countdown

**One-liner:** bold diagonal stripes slide across the background the whole time; a fast 3, 2, 1 punches in (huge, with a tiny shake and a ring bursting behind each number, the background cutting colour on every number); then the offer slams in: a short headline, the deal in huge text, an urgency pill; a price tag swings in on a string and keeps swaying with the price on it (old price crossed out); the deal double-pulses, confetti bursts, and a diagonal colour wipe clears the screen.
**Best for:** sales, flash deals, product launches, limited-time offers, event ticket promos.
**Avoid when:** the offer, price or date is unknown (ask for them); do not invent a discount.

## Inputs to gather
- Headline, the deal ("50% OFF" or the new price), old price (optional), urgency line (end date), brand colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | Loud promo energy: bold diagonal stripes slide across the background the whole time | Repeating-linear stripes at -20 degrees on a layer whose `backgroundPosition` moves with `t` (periodic in `D`) |
| L2 | Open with a fast 3, 2, 1: each number punches in huge with a small shake and a ring bursting behind it; the background cuts to a new colour on every number | Three numbers on beats; scale 2.4 to 1, `MP.shake`; ring = scaling circle stroke fading; bg colour `tl.set` per number |
| L3 | Then the offer slams in: a short headline, the deal as huge text ("% OFF" or the new price), and a small pill with the urgency line | Elements slam with `power4.in` then a hard stop and shake |
| L4 | A price tag swings in on a string from the top, bounces, keeps gently swaying; the user's price on it, the old price crossed out if given | SVG tag hanging from a pivot point at the top; rotation = damped spring then a small sway `sin` |
| L5 | The deal gives a quick double pulse, then a confetti burst; a diagonal colour wipe clears the screen at the end | Scale pulse x2; confetti seeded physics; skewed wipe panel |
| L6 | Use the offer, price and date from the request; keep every line short and readable in a second | All strings from `CONTENT` |
| T1 | A heavy condensed font (Anton), all capitals, with a hard offset shadow on the deal | Anton 400 uppercase, `text-shadow: 8px 8px 0 dark` |
| T2 | Brand colours if given, else hot red, sunny yellow, near black, cream | Tokens below |
| S1 | A big drum hit with a short rising whoosh into each countdown number, a quick stripe whoosh on every colour cut, a heavy impact with a crash when the offer slams in, fast whooshes and thuds as the deal slides and drops in, a pop for the pill, a string twang and soft creaks as the price tag swings, a bright register-style "ka-ching" for the price, a heartbeat thump on each pulse, confetti pops with a trail of sparkles, a sweeping whoosh for the wipe | Cue table below |
| S2 | A high-energy promo beat at the animation tempo (about 150 bpm): a short build under the countdown (hats, pulsing bass, a clap roll), then four on the floor kicks, claps, off-beat bass and short chord stabs from the moment the offer lands; stops for the wipe; loops | `promo-energy` preset at 150 bpm with `dropAt` wipe |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 8` |
| O3 | GSAP HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #17121c;
--ink: #fff7e6;
--accent: #ff2e4d;
--yellow: #ffd400;
```
```json fonts
[{"family": "Anton", "id": "anton", "weights": [400], "role": "all text"}]
```

## Beat sheet
Tempo 150 bpm, so 1 bar = 1.6 s: the countdown takes the first bar.
```json beats
{"bpm": 150, "events": [
  {"id": "count", "repeat": {"n": 3, "fromBeat": 0, "everyBeat": 1}, "label": "3, 2, 1 on beats"},
  {"id": "offer", "at": 0.3, "label": "offer slams in"},
  {"id": "deal", "at": 0.36, "label": "deal drops in"},
  {"id": "pill", "at": 0.42, "label": "urgency pill pops"},
  {"id": "tag", "at": 0.48, "label": "price tag swings in"},
  {"id": "price", "at": 0.58, "label": "price lands (ka-ching)"},
  {"id": "pulse", "repeat": {"n": 2, "fromFrac": 0.68, "everyFrac": 0.05}, "label": "deal pulses"},
  {"id": "confetti", "at": 0.76, "label": "confetti burst"},
  {"id": "wipe", "at": 0.9, "label": "diagonal wipe"}
]}
```

## Build recipe
- **Stripes:** a full-frame div with `background: repeating-linear-gradient(-20deg, a 0 60px, b 60px 120px)`; animate `background-position` by a multiple of the pattern length per loop.
- **Count:** each number is a big `div`; at `count_k`: `tl.set(root, {backgroundColor})`, number from scale 2.4 with `expo.out`, then out; a ring (border-only circle) grows and fades; use `MP.shake(t - T.countK, {amp: 10, decay: 14})` on the stage.
- **Tag physics:** pendulum: `theta(t) = 32 * exp(-1.4 * age) * cos(7 * age) + 3 * sin(0.9 * age)` degrees around the string anchor; drawn as a rotated group; the price text on the tag; the old price with a diagonal strike.
- **Confetti:** 80 rects (seeded colours from the palette), position `p0 + v * age + g * age^2 / 2`, rotation `w * age`; fade over 1.4 s.
- **Pitfalls:** avoid full-screen white flashes on cuts (colour cuts only among palette colours); the wipe panel is a skewed rect with `transform: skewX`.

## Sound plan
How each effect of the brief is covered:
- **A big drum hit with a short rising whoosh into each countdown number:** `kick`/`impact` + short `riser` at `count*`.
- **A quick stripe whoosh on every colour cut:** `swish` at `count*`.
- **A heavy impact with a crash when the offer slams in, fast whooshes and thuds as the deal slides and drops in:** `impact` + `crash` at `offer`; `whoosh` + `thud` at `deal`.
- **A pop for the pill:** `pop` at `pill`.
- **A string twang and soft creaks as the price tag swings:** `pluck` (low) + `scratch` (creak) at `tag`.
- **A bright register-style "ka-ching" for the price:** `run` of `ding` (two high notes) + `coin` at `price`.
- **A heartbeat thump on each pulse:** `heartbeat` at `pulse*`.
- **Confetti pops with a trail of sparkles:** `cannon` + `sparkle` at `confetti`.
- **A sweeping whoosh for the wipe:** `whoosh` at `wipe`.
```json cues
[
  {"at": "count*-0.25", "kind": "riser", "dur": 0.25, "f0": 400, "f1": 3000, "vol": 0.35},
  {"at": "count*", "kind": "kick", "vol": 1.0},
  {"at": "count*", "kind": "swish", "dur": 0.2, "vol": 0.5},
  {"at": "offer", "kind": "impact", "dur": 1.0, "freq": 55, "vol": 1.0},
  {"at": "offer", "kind": "crash", "dur": 1.4, "vol": 0.55},
  {"at": "deal", "kind": "whoosh", "dir": "up", "dur": 0.3, "vol": 0.5},
  {"at": "deal+0.28", "kind": "thud", "freq": 70, "vol": 0.9},
  {"at": "pill", "kind": "pop", "freq": 700, "vol": 0.7},
  {"at": "tag", "kind": "pluck", "note": "E2", "dur": 0.8, "vol": 0.6},
  {"at": "tag+0.3", "kind": "scratch", "dur": 0.5, "freq": 900, "vol": 0.2},
  {"at": "price", "kind": "run", "inst": "ding", "from": "E6", "n": 2, "dt": 0.09, "vol": 0.8},
  {"at": "price", "kind": "coin", "vol": 0.6},
  {"at": "pulse*", "kind": "heartbeat", "vol": 0.7},
  {"at": "confetti", "kind": "cannon", "vol": 0.8},
  {"at": "confetti+0.1", "kind": "sparkle", "dur": 1.0, "vol": 0.4},
  {"at": "wipe", "kind": "whoosh", "dir": "up", "dur": 0.5, "vol": 0.7}
]
```
```json music
{"preset": "promo-energy", "bpm": 150, "gain": 1, "duck": 0.4, "layers": {
  "kick": {"dropAt": [["wipe", "end"]]}, "bass": {"dropAt": [["wipe", "end"]]}, "stabs": {"dropAt": [["wipe", "end"]]}
}}
```

## Layout by aspect ratio
- **9:16:** countdown numbers fill the centre; the deal takes the middle band; the tag hangs from the top right; pill near the bottom above the safe zone.
- **16:9:** numbers centred; deal left, tag hanging at the right.
- **1:1 / 4:5:** as 9:16 with slightly smaller type.

## Loop & ending
The diagonal wipe clears the screen to the plain stripes/first colour; the loop restarts on the first "3".

## Guardrails
- Keep every line short and easy to read in a second; use the offer, price and date from the request only.
- Colour cuts stay within the palette; no white-screen flashes.
- Do not invent discounts, prices or dates.

## QA
- Frame at each `count`: the number huge, ring visible, background a different palette colour than the previous number.
- Frame at `price + 0.5 s`: tag swaying with price readable, old price struck.
- Wipe frame shows a diagonal edge; last frame is clean.
- Audio: kicks on the count beats; the beat stops for the wipe.
