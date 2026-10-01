---
name: slide-deck
title: Slide deck
description: A presentation template shown as a mockup: about ten slides spread on a tilted light-grey table, the camera gliding from slide to slide as each one comes alive (title words rise, numbers count up, charts draw). For company intros, pitches, reports and brand decks.
tags: ["brand","explainer","product"]
library: GSAP
sound: true
difficulty: 4
default_duration: 15
ratios: {"9:16":"ok","4:5":"good","1:1":"good","16:9":"great"}
---
# Slide deck

**One-liner:** white 16:9 slides drop onto a light-grey table in 3D perspective; the camera flies slide to slide, banking gently, and each main slide comes alive as the camera lands; finally it pulls back to the full table and the slides lift away.
**Best for:** a company introduction, a pitch summary, quarterly numbers, a portfolio, a deck teaser.
**Avoid when:** the content is one message (use `kinetic-type`) or must be readable as a real deck (this is a teaser, not the deck).

## Inputs to gather
- 4 to 6 main slides of content: title, one or two key-fact slides, a chart or timeline (numbers given by the user), a team or contact slide. Logo, photos, screenshots if any. Accent colour.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A clean template mockup: about ten white 16:9 slides in a neat grid on a light grey table, tilted in 3D perspective, soft shadows | `#table` with `perspective`, a `.board` rotated `rotateX(55deg) rotateZ(-8deg)`; 10 `.slide` divs 16:9 in a 5x2 or 4x3 grid |
| L2 | Turn the message into four to six main slides (title, key facts, chart or timeline, team/contact); fill the rest with simple matching slides so the table looks full | Main slides get real content, filler slides use generic blocks (contents, features, map, thank you) |
| L3 | Every slide shares one design: white space, small logo top left, small ring and cross motif top right, rounded photo areas, bold accent blocks, one key word of each title in the accent colour | One slide component template (CSS classes); title key word wrapped in a span |
| L4 | Start wide: slides drop onto the table one after another; then fly the camera slide to slide, banking gently, stopping long enough to read | Drop = `y` from above with `bounce`; camera = tween the `.board` transform (rotate/translate/scale) so the target slide fills the frame with a slight `rotateZ` bank |
| L5 | On landing the slide comes alive: title words rise, numbers count up, chart line draws, timeline dots pop, speech bubbles pop; end pulling back to the full table, then lift the slides away | Per-slide mini timeline started at `slide<k>` time; chart line `strokeDashoffset`; counters via proxy tween; lift = `y -300, opacity 0` stagger |
| L6 | Use the user's logo, photos, screenshots if attached; otherwise draw simple flat pictures that feel like photos (a room, a building, people at a table) | `<img>` inside rounded frames; fallback = SVG flat scenes |
| L7 | Every line of text short and readable in a second | Titles max 5 words, body max 12 |
| T1 | Clean geometric sans (Poppins): semibold titles with the key word in bold accent, light grey body | Poppins 300/500/600/700 |
| T2 | Brand colours if given, else white slides on light grey table, dark grey text, warm orange accent, soft peach photo tints | Tokens below |
| S1 | Paper tap per slide landing, smooth whoosh per camera glide, gentle bell on the title slide, rounded pops for bubbles/dots/icons, rising swish for line/chart drawing, quick ticks for counting numbers, airy lift at the end | Cue table below |
| S2 | Clean modern corporate bed about 120 bpm: soft electric piano, plucky arpeggio, warm pad, light kick, finger snaps, round bass; calm, quiet, loops | `corporate-bright` preset with `snap` |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length (15 s typical) | scaffold `--duration 15` |
| O3 | HTML slides with CSS 3D transforms and GSAP for the camera, rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #e7e6ea;
--slide: #ffffff;
--ink: #2b2b33;
--accent: #e8591a;
--tint: #f4c3ab;
```
```json fonts
[{"family": "Poppins", "id": "poppins", "weights": [300, 500, 600, 700], "role": "all text"}]
```

## Beat sheet
```json beats
{"bpm": 0, "events": [
  {"id": "drop", "repeat": {"n": 10, "fromFrac": 0.0, "everyFrac": 0.02}, "label": "slides drop onto the table"},
  {"id": "glide", "repeat": {"n": 5, "fromFrac": 0.24, "everyFrac": 0.14}, "label": "camera glides to each main slide"},
  {"id": "slide", "repeat": {"n": 5, "fromFrac": 0.28, "everyFrac": 0.14}, "label": "slide comes alive"},
  {"id": "pullback", "at": 0.94, "label": "camera pulls back"},
  {"id": "lift", "at": 0.97, "label": "slides lift away"}
]}
```

## Build recipe
- **3D table:** `#scene { perspective: 1400px }`, `.board { transform-style: preserve-3d }`. Slides are flat `div`s with `box-shadow`. Animate the board's `x, y, z, rotationX, rotationZ` (GSAP 3D props); never animate `filter: blur` per slide.
- **Camera targets:** compute each main slide's centre in board space once; the camera tween sets board `x/y` to `-slideCentre`, `scale` so the slide fills 82% of the frame width, `rotationZ` -3 to +3 alternating for the gentle bank.
- **Alive moments:** title words split with `MP.splitText(el, "words")`, `yPercent 110 to 0` with a mask parent (`overflow: hidden`); counters with a proxy tween; timeline dots `scale` pop.
- **Photos:** an attached photo is drawn with `object-fit: cover` in a rounded frame; with none, draw SVG scenes and tint with `--tint`.
- **Pitfalls:** 3D-transformed children of `overflow: hidden` parents can flatten: put `overflow: hidden` only on inner text masks; keep slides at integer pixel sizes to avoid shimmer; do not stack more than 12 shadowed elements (render speed).

## Sound plan
How each effect of the brief is covered:
- **Soft paper tap as each slide lands on the table:** `paper` + `thud` (soft) at `drop*`.
- **Smooth whoosh that follows every camera glide:** `whoosh` at `glide*`.
- **Gentle bell as the title slide arrives:** `bell` at the first `slide`.
- **Small rounded pops for bubbles, dots and icons:** `pop` at the alive moments (`slide*`).
- **Light rising swish as a line or chart draws:** `swish` at `slide*`.
- **Quick ticks while a number counts up:** `ticks` (decel) at a key-fact `slide`.
- **Airy lift as the slides float away at the end:** `swell` at `lift`.
```json cues
[
  {"at": "drop*", "kind": "paper", "dur": 0.2, "vol": 0.5},
  {"at": "drop*", "kind": "thud", "freq": 110, "dur": 0.12, "vol": 0.45},
  {"at": "glide*", "kind": "whoosh", "dir": "peak", "dur": 0.7, "vol": 0.5},
  {"at": "slide1", "kind": "bell", "freq": 880, "dur": 1.6, "vol": 0.6},
  {"at": "slide*", "kind": "pop", "freq": 640, "vol": 0.6},
  {"at": "slide*", "kind": "swish", "vol": 0.35},
  {"at": "slide2", "kind": "ticks", "n": 14, "span": 0.9, "curve": "decel", "vol": 0.4, "final": {"kind": "ding", "vol": 0.6}},
  {"at": "pullback", "kind": "whoosh", "dir": "down", "dur": 0.9, "vol": 0.5},
  {"at": "lift", "kind": "swell", "dur": 1.2, "freq": 900, "vol": 0.55}
]
```
```json music
{"preset": "corporate-bright", "bpm": 120, "gain": 1, "duck": 0.5, "layers": {
  "drums": {"kick": "x---x---x---x---", "snap": "----x-------x---", "clap": "", "shaker": "", "lanes": {"snap": 0.8}, "vol": 0.55}
}}
```

## Layout by aspect ratio
- **16:9:** natural fit; the target slide fills 80% of the width.
- **9:16 / 4:5:** the slide is 16:9 so it fills the width and leaves empty bands: rotate the whole table 90 degrees clockwise in tall frames so the camera path runs vertically, or keep landscape slides and add a caption band. Keep slide text at least 28 px equivalent at phone size.
- **1:1:** fill 85% of the width; bank less (max 2 degrees).

## Loop & ending
Pull back to the full table (a still moment), lift slides away, empty grey table = first frame before the first drop.

## Guardrails
- Keep every line of text short and readable in a second; one key word per title in the accent.
- Use the user's logo and photos when attached; otherwise flat generic pictures, never fake real people or claims.
- Banking is gentle (a few degrees), no whip pans or blur that hurts readability.

## QA
- Each stop: the slide is upright enough to read, fills the frame, and its content has finished animating before the next glide starts.
- Pull-back frame: all slides visible with shadows, none overlapping.
- 10 slides drop with visible stagger; chart line reaches its end value; counters end on the user's numbers.
