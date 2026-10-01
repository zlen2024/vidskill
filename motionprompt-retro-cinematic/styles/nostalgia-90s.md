---
name: nostalgia-90s
title: Nostalgia 90s
description: A Malaysian 80s and 90s throwback like a home video on an old tape: a chunky wooden CRT TV switches on to colour bars, static and your title card, with a camcorder PLAY overlay and date stamp, tracking bands, retro props and a TV switch-off at the end. For nostalgia campaigns, throwbacks, photo memories and retro brands.
tags: ["retro","malaysia","photos"]
library: Canvas
sound: true
difficulty: 5
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Nostalgia 90s

**One-liner:** faded, grainy colours with soft scanlines and dark corners; a chunky wooden CRT TV with knobs, rabbit-ear antenna and a crochet doily on top sits in a living room with a painted wall and wooden cabinet; a thin white line opens into colour bars and a generic test card, then soft static and the message as a bright 90s title card with playful shapes; a camcorder overlay ("PLAY", a date stamp) and a tracking band roll on top; retro props (a cassette, an old bus ticket, coins) fit the topic; the TV squeezes into a line, then a dot, and off.
**Best for:** nostalgia campaigns, throwback greetings, old-photo memories, retro brands, anniversary stories.
**Avoid when:** you need modern clean visuals.

## Inputs to gather
- Title (short), language, optional old photos (to show on the TV), a date to stamp, props that fit the topic. Brand colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A Malaysian 80s and 90s throwback like a home video found on an old tape: faded grainy colours, soft scanlines, dark corners | Final grade: desaturate 25%, warm tint, `MP.drawGrain`, scanlines every 3 px, vignette |
| L2 | The hero is a chunky wooden CRT TV with knobs, rabbit-ear antenna and a crochet doily on top, in a living room with a painted wall and wooden cabinet | Canvas-drawn TV (rounded wood body, curved screen, knobs), antenna, doily shape; wall and cabinet |
| L3 | The TV switches on: a thin white line opens into colour bars with a simple test card (generic, no real channel logos); then soft static and the message appears on the screen | Screen animation: a horizontal line scaleY 0.01 to 1; SMPTE-like colour bars generic; static = seeded noise per stepped frame |
| L4 | The message as a bright 90s title card, letters popping one by one, with playful shapes (squiggles, triangles, dots); text in the user's language | Title on screen with pop-in letters; shapes drawn on the screen canvas |
| L5 | If old photos are attached, show them on the TV screen one after another like a slideshow on tape | Photos drawn to the screen canvas with a tape-dissolve (noise blend) between them |
| L6 | A camcorder overlay on top: "PLAY" in a corner and a date stamp; a soft tracking band rolls down once or twice | VT323 overlay text; band = translucent stripe with horizontal displacement |
| L7 | Retro props fitting the topic: a cassette tape with turning reels and a handwritten label, an old bus ticket or a few coins | Props drawn near the TV; reels rotate |
| L8 | End with the TV switching off: the picture squeezes into a line, then a dot that fades; keep every effect gentle, never strobing | Reverse of the switch-on then a fading dot |
| T1 | A rounded 90s display font (Righteous) for the title, a pixel VCR font (VT323) for the overlay and a marker hand for labels | Righteous 400, VT323 400, Permanent Marker 400 |
| T2 | Brand colours if given, else sunny yellow, hot pink, teal, deep purple, mint wall, warm wood brown | Tokens below |
| S1 | A VHS tape clunk and a little motor spin-up as the tape starts to play, a click as the power light comes on, a soft CRT power-on thump with a faint high whine that fades, a short quiet test tone while the colour bars show (never piercing), a burst of soft static hiss before the title card, small pops as the title letters appear, a wobbly tape warble and hiss each time a tracking band rolls down, a quiet cassette reel whirr under everything, and a falling tone with a soft pop as the TV switches off | Cue table below |
| S2 | A warm 90s pop or city-pop bed about 120 bpm: mellow electric piano jazz chords, bouncy bass, soft drums, shaker, a slightly wobbly warm tape feel and a whisper of tape hiss; loops | `city-pop` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | HTML animation with Canvas rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #2b1d5c;
--ink: #fff4d6;
--accent: #ffd23f;
--pink: #ff4fa3;
--teal: #1fb5b0;
--wall: #9cbfae;
--wood: #7a4a2c;
```
```json fonts
[
  {"family": "Righteous", "id": "righteous", "weights": [400], "role": "title card"},
  {"family": "VT323", "id": "vt323", "weights": [400], "role": "camcorder overlay"},
  {"family": "Permanent Marker", "id": "permanent-marker", "weights": [400], "role": "handwritten labels"}
]
```

## Beat sheet
```json beats
{"bpm": 120, "events": [
  {"id": "tape", "at": 0.0, "label": "tape starts, PLAY overlay"},
  {"id": "power", "at": 0.1, "label": "TV power on, white line opens"},
  {"id": "bars", "at": 0.16, "label": "colour bars and test card"},
  {"id": "static", "at": 0.34, "label": "soft static"},
  {"id": "letter", "repeat": {"n": 10, "fromFrac": 0.4, "everyFrac": 0.02}, "label": "title letters pop"},
  {"id": "band", "repeat": {"n": 2, "fromFrac": 0.55, "everyFrac": 0.25}, "label": "tracking band rolls"},
  {"id": "off", "at": 0.9, "label": "TV switches off"}
]}
```
Match `letter` to the title's character count.

## Build recipe
- **Scene on Canvas:** wall and cabinet as flat shapes with a subtle texture; TV body wood with a darker bevel, a curved screen (rounded rect with an inner vignette), knobs, antenna ears, doily as a scalloped white shape.
- **Screen layer:** draw the screen content to an offscreen canvas (bars, static, title, photos), then composite into the TV shape with a CRT curvature approximation (barrel distortion via slices or a radial gradient overlay), scanlines and a slight red/blue fringe.
- **Static:** noise per stepped frame (`MP.hash(frameIndex, seed)` per pixel, at low resolution then scaled) rather than per-pixel Math.random.
- **Camcorder overlay:** VT323 text with a soft glow, date stamp like `SEP 30 1994` or the user's date; a blinking red dot optional.
- **Tracking band:** a 40 px translucent lighter band moving down; rows within it shift horizontally by `noise1`.
- **Switch-off:** `scaleY` to 0.01 then `scaleX` to 0 leaving a dot that fades in 0.3 s.
- **Pitfalls:** no real channel logos; keep flicker low and gentle; the test tone is quiet and short; no strobing static (limit static area brightness).

## Sound plan
How each effect of the brief is covered:
- **A VHS tape clunk and a little motor spin-up as the tape starts to play:** `thud` + `whir` (rising) at `tape`.
- **A click as the power light comes on, a soft CRT power-on thump with a faint high whine that fades:** `click` + `thud` + `chirp` (high whine) at `power`.
- **A short quiet test tone while the colour bars show, never piercing:** a soft `blip`/`ding` at `bars`.
- **A burst of soft static hiss before the title card:** `hiss` at `static`.
- **Small pops as the title letters appear:** `pop` at `letter*`.
- **A wobbly tape warble and hiss each time a tracking band rolls down:** `tapewarble` + `hiss` at `band*`.
- **A quiet cassette reel whirr under everything:** a low `whir` bed.
- **A falling tone with a soft pop as the TV switches off:** falling `chirp` + `pop` at `off`.
```json cues
[
  {"at": "tape", "kind": "thud", "freq": 70, "dur": 0.25, "vol": 0.7},
  {"at": "tape+0.1", "kind": "whir", "f0": 40, "f1": 110, "dur": 0.7, "vol": 0.35},
  {"at": 0.0, "kind": "whir", "f0": 60, "f1": 62, "dur": "D", "vol": 0.12},
  {"at": "power", "kind": "click", "freq": 1200, "vol": 0.6},
  {"at": "power+0.05", "kind": "thud", "freq": 60, "dur": 0.3, "vol": 0.6},
  {"at": "power+0.1", "kind": "chirp", "f0": 9000, "f1": 8000, "dur": 0.6, "vol": 0.12},
  {"at": "bars", "kind": "ding", "freq": 1000, "dur": 1.2, "vol": 0.2},
  {"at": "static", "kind": "hiss", "dur": 0.7, "hp": 2500, "pulse": 1, "vol": 0.35},
  {"at": "letter*", "kind": "pop", "freq": 520, "vol": 0.6, "rise": {"param": "freq", "from": 520, "by": 30}},
  {"at": "band*", "kind": "tapewarble", "dur": 1.0, "vol": 0.5},
  {"at": "band*", "kind": "hiss", "dur": 1.0, "hp": 4500, "vol": 0.18},
  {"at": "off", "kind": "chirp", "f0": 1500, "f1": 200, "dur": 0.5, "vol": 0.5},
  {"at": "off+0.5", "kind": "pop", "freq": 150, "rise": 0.6, "dur": 0.1, "vol": 0.6}
]
```
```json music
{"preset": "city-pop", "bpm": 120, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **16:9:** TV at centre-right, cabinet and props left; camcorder overlay at the frame corners.
- **9:16 / 4:5:** TV centred at 55% of the width in the upper-middle; props below; overlay text inside `--safe-*`.
- **1:1:** TV centred.

## Loop & ending
The TV switches off to a dot; the room in the dark returns to frame 0 (TV off, overlay "PLAY" starting).

## Guardrails
- Keep it generic, with no real channel logos.
- Keep every effect gentle, never strobing; the short quiet test tone while the colour bars show is never piercing.
- Write the user's text in the language used (Malay or English).

## QA
- Frame at `power + 0.15 s`: thin white line; at `bars + 0.5 s`: colour bars and test card; at `letter10 + 0.5 s`: title card readable with shapes.
- Frame at `band1 + 0.3 s`: band across the picture with slight wobble.
- Frame at `off + 0.3 s`: picture squeezed to a line; last frame: dark screen.
