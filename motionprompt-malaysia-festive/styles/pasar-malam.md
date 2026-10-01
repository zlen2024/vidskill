---
name: pasar-malam
title: Pasar malam
description: A lively Malaysian night market at dusk: striped canopy stalls down a long aisle, bulbs switching on from front to back, bokeh lights, grill smoke and steam, hand-painted price cards popping over satay, apam balik and drinks, and a red cloth banner with your message. For street food, market stalls, food promos and festivals.
tags: ["food","malaysia","promo"]
library: GSAP
sound: true
difficulty: 5
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
hidden: true
---
# Pasar malam

**One-liner:** a warm flat illustration of a pasar malam: rows of stalls with striped canopies leading into the distance, shopper silhouettes, a sky turning from orange-purple dusk to a starry night with a crescent moon while strings of warm bulbs flicker on one by one from front to back; bokeh floats, smoke and steam curl from the grills; a stall counter in front shows the food; hand-painted price cards pop with a spring; a red cloth banner drops in with the message and swings gently.
**Best for:** street-food and stall promos, bazaar and festival announcements, menu highlights, a Ramadan bazaar mood.
**Avoid when:** you need a clean minimal look or an indoor restaurant.

## Inputs to gather
- The message for the banner, the food and drinks with prices (else classic favourites: satay with glowing embers, apam balik on a round griddle, drinks in plastic bags with straws). Language (Malay or English). Brand colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A lively Malaysian night market as a clean warm flat illustration: rows of stalls with striped canopies down a long aisle into the distance, small shopper silhouettes browsing | One-point perspective SVG: canopies as trapezoids scaling toward the vanishing point, stripes in red/blue/yellow/green with white |
| L2 | The sky turns from an orange-and-purple dusk to a starry night with a crescent moon; as it gets dark, strings of warm bulbs and bare bulbs under the canopies flicker on one by one from front to end | Sky gradient interpolation; bulbs sorted by depth, `on(t)` with a short flicker then steady |
| L3 | Soft bokeh lights float in the air; smoke and steam curl up from the grills | Seeded blurred circles drifting; smoke/steam wavy paths |
| L4 | In front a stall counter shows the requested food and drinks (or classic favourites): satay on a grill with glowing embers, apam balik on a round griddle, drinks in plastic bags with straws | SVG counter and item functions; ember dots pulsing |
| L5 | Hand-painted price cards pop up above each item with a springy bounce ("RM5", "3 for RM10"); use the user's menu and prices; keep each card short | Marker-font cards, `MP.spring` scale, slight rotation |
| L6 | My message on a red cloth banner that drops in and hangs from the string of lights, swinging gently | Banner cloth with two hangers; drop `y` + pendulum sway |
| L7 | Write the text in the user's language (Malay or English) | `CONTENT.lang` |
| L8 | Keep it lively but tidy: a few moving things at a time, nothing cluttered | Limit simultaneous animations to about three; hold the rest still |
| L9 | At the end the cards and banner go, the lights switch off and the sky returns to dusk so it loops | Reverse the states in the same order |
| T1 | A chunky friendly display font (Lilita One) for the banner and a marker font (Permanent Marker) for the price cards | Lilita One 400; Permanent Marker 400 |
| T2 | Brand colours if given, else night blue, dusk orange, banner red, warm bulb yellow, canopy stripes in red, blue, yellow and green with white | Tokens below |
| S1 | A busy night-market feel: the murmur of a crowd throughout (fuller as it gets dark), a steady sizzle from the satay grill with ember crackles, a click as each bulb switches on from near to far (softer when they switch off), a springy pop per price card, a cloth flap as the banner drops and snaps straight, a quick flutter as it rolls away | Cue table below |
| S2 | Lively but light street-market bed in a bouncy 12/8 joget feel: plucked gambus-style melody, soft bass, frame drums, shaker; cheerful and quiet; loops | `joget` preset (12/8) |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | GSAP HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #141a3c;
--ink: #fff6e0;
--accent: #d8392f;
--dusk: #f39a62;
--bulb: #ffcf6e;
--stripe-blue: #2a56b8;
--stripe-green: #2e9d5b;
```
```json fonts
[
  {"family": "Lilita One", "id": "lilita-one", "weights": [400], "role": "banner"},
  {"family": "Permanent Marker", "id": "permanent-marker", "weights": [400], "role": "price cards"}
]
```

## Beat sheet
```json beats
{"bpm": 100, "events": [
  {"id": "dusk", "at": 0.0, "label": "dusk aisle"},
  {"id": "bulb", "repeat": {"n": 6, "fromFrac": 0.1, "everyFrac": 0.05}, "label": "bulbs switch on, near to far"},
  {"id": "night", "at": 0.4, "label": "starry night"},
  {"id": "card", "repeat": {"n": 3, "fromFrac": 0.44, "everyFrac": 0.07}, "label": "price cards pop"},
  {"id": "banner", "at": 0.66, "label": "banner drops in"},
  {"id": "swing", "at": 0.72, "label": "banner swings gently"},
  {"id": "roll", "at": 0.9, "label": "cards and banner go, lights off"}
]}
```

## Build recipe
- **Perspective aisle:** vanishing point at the horizon centre; stall depth `z_k` from 1 (front) to 0.1; canopy width and height scale with `1 / (1 + 3 z)`; shoppers as tiny dark figures placed by seeded positions.
- **Bulbs:** each bulb has `onAt = T.bulb_k` (sorted by depth); brightness = `on * (0.85 + 0.15 * noise1(t * 20 + k))` with a 0.15 s flicker at start; glow = radial gradient.
- **Grill:** satay sticks in a row with orange embers `alpha = 0.6 + 0.4 * sin(...)`; smoke as translucent paths drifting up with `noise`.
- **Cards:** marker text rotated +-4 degrees on a cream rounded rect with a tape strip; pop with `back.out(2.4)`.
- **Banner:** a cloth rectangle with a wavy bottom edge; hangs by two strings from the bulb string; after landing sway `rotation = 3 * sin(t * 1.4)`.
- **Pitfalls:** keep the far end of the aisle hazy (lower contrast) so text stays readable; keep motion count low; no `Math.random`.

## Sound plan
How each effect of the brief is covered (a busy night-market feel timed to the motion):
- **The murmur of a crowd all the way through, growing a little fuller as it gets dark:** `crowd` bed at `dusk`, second layer at `night`.
- **A steady sizzle from the satay grill with small ember crackles as sparks fly up:** `sizzle` bed + `crackle`.
- **A little click as each bulb switches on, one by one from near to far, and softer clicks as they switch off:** `click` at `bulb*` (pitch falling per bulb), quieter `click` at `roll`.
- **A springy pop as each price card bounces up:** `pop` at `card*`.
- **A cloth flap as the banner drops and snaps straight, and a quick flutter as it rolls away:** `cloth` at `banner`; `paper` (flutter) at `roll`.
```json cues
[
  {"at": "dusk", "kind": "crowd", "dur": "D", "vol": 0.22},
  {"at": "night", "kind": "crowd", "dur": "rest", "vol": 0.22},
  {"at": "dusk", "kind": "sizzle", "dur": "D", "vol": 0.24},
    {"at": "night", "kind": "crackle", "dur": "rest", "density": 25, "lo": 1200, "hi": 5000, "vol": 0.25},
  {"at": "bulb*", "kind": "click", "freq": 2600, "vol": 0.6, "rise": {"param": "freq", "from": 2600, "by": -200}},
  {"at": "card*", "kind": "pop", "freq": 520, "vol": 0.75},
  {"at": "banner", "kind": "cloth", "dur": 0.8, "vol": 0.6},
  {"at": "banner+0.4", "kind": "thud", "freq": 120, "dur": 0.15, "vol": 0.35},
  {"at": "roll", "kind": "paper", "dur": 0.5, "vol": 0.4},
  {"at": "roll", "kind": "repeat", "every": 0.08, "times": 5, "of": {"kind": "click", "freq": 1400, "vol": 0.25}}
]
```
```json music
{"preset": "joget", "bpm": 100, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16 / 4:5:** aisle vanishing point at 45% height; stall counter and cards in the lower third above the safe zone; banner hangs in the upper third.
- **16:9:** aisle centred, counter lower centre, banner across the top centre.
- **1:1:** as 4:5.

## Loop & ending
Cards and banner leave, bulbs switch off from far to near, the sky returns to dusk (frame 0).

## Guardrails
- Keep it lively but tidy: a few moving things at a time, nothing cluttered.
- If the user gives no menu, show the classic pasar malam favourites (satay on a grill with embers, apam balik on a round griddle, drinks in plastic bags with straws).
- Write the user's text in the language they used; use only their items and prices; keep each card short.

## QA
- Frame at `bulb6 + 0.5 s`: all bulbs on, aisle glowing, sky dark.
- Frame at `card3 + 0.5 s`: three price cards legible above the correct items.
- Banner text fully readable while swinging; frame 0 and the last frame are both dusk with lights off.
