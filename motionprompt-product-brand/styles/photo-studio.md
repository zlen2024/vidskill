---
name: photo-studio
title: Photo studio
description: Through a camera viewfinder: focus hunts and locks, the shutter fires, each shot prints as a white-bordered photo onto a black-and-yellow set, then the finale shows your headline, services and a pulsing "Book a shoot" button. For photographers, studios, event and portrait services.
tags: ["photos","promo","brand"]
library: Canvas
sound: true
difficulty: 5
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Photo studio

**One-liner:** we look through a camera: crisp white corner brackets, faint thirds, a mode badge and settings on top, a battery icon, an exposure meter and a readout strip (shutter, aperture, ISO, a shots counter ticking down); three quick shots (portrait, product, event): the live view drifts like handheld and starts out of focus, the focus box hunts, locks and turns yellow, the picture snaps sharp, the shutter blinks with a black curtain and a brief white flash, and the frame shrinks into a white-bordered print with a label ("01 PORTRAIT") that lands on a black set with yellow tape; the finale is the set with fanned prints, the headline with the key word on a yellow block, services with small yellow icons, a pulsing "Book a shoot" button and the contact line.
**Best for:** photographers, studios, wedding and event services, portrait and product photography promos.
**Avoid when:** there are no photo services to promote.

## Inputs to gather
- Headline (key word for the yellow block), 4 services (e.g. Weddings, Portraits, Products, Events), button text, contact or booking line, optional packages/prices (short). 3 to 6 best photos (else stand-in scenes). Brand colours (one accent).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | We look through a camera viewfinder: crisp overlay with white corner brackets, faint rule-of-thirds lines, a mode badge and settings at the top, a battery icon, an exposure meter and a readout strip at the bottom (shutter speed, aperture, ISO and a shots counter that ticks down) | Canvas overlay layer drawn per frame; JetBrains Mono readouts from `t` (counter decrements at each shot) |
| L2 | Take three quick shots of different kinds (a portrait, a product, an event); for each, the live view drifts like a handheld camera and starts out of focus; the centre focus box hunts, then locks and turns yellow, and the picture snaps sharp | Scene canvas with a blur amount `b(t)` (drawn via a cheap multi-tap blur or a pre-blurred copy cross-faded); focus box position oscillation then lock; handheld drift by `noise1` |
| L3 | On each shot the shutter blinks shut with a fast black curtain and a white flash; the captured frame shrinks into a white-bordered print with a small label (like "01 PORTRAIT") and lands on a black set held by a strip of yellow tape; between shots the camera pans quickly to the next scene | Curtain = two black bars closing/opening in 0.12 s; flash = a single brief white overlay (alpha 0.7, 2 frames); print flies to its set position with rotation; tape strip; pan = fast eased translate |
| L4 | If photos are attached use them as the scenes and the prints (3 to 6 of the best); otherwise draw simple stand-in scenes that still look like real photos | `<img>` drawn to the scene canvas; fallback = gradient + silhouettes scenes |
| L5 | End on the set: prints fanned out, my headline with the key word on a yellow block, my services as a short list with small yellow icons, a bold yellow "Book a shoot" button that pulses, and my contact or booking line; use my packages or prices if given, kept short | Final layout; button pulse (scale 1 to 1.05 by `sin`, at most 2 Hz) |
| L6 | Keep every line of text short and easy to read in a second | Short strings only |
| T1 | A bold condensed font (Anton) in capitals for the headline, a clean condensed font (Oswald) for the services and button, a mono font (JetBrains Mono) for the viewfinder readouts and labels | Anton 400; Oswald 500/700; JetBrains Mono 400/500 |
| T2 | Brand colours if given, else near black, bold yellow, white for small text and warm grey for the contact line | Tokens below |
| S1 | A soft whirr as the camera wakes, fast autofocus motor ticks while the focus hunts, the classic double beep when it locks, a crisp mechanical shutter with a mirror slap, a thin flash recharge whine, a quick swish for each pan, a whoosh and a paper tap as each print lands, a thud as the yellow block lands, soft ticks for the services, a pop for the button and a heavier shutter close at the end | Cue table below |
| S2 | A cool confident lo-fi house bed about 120 bpm: warm electric piano chords, soft four on the floor kick, finger snaps, light hats, round bass; under the effects; loops | `lofi-house` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | HTML animation with Canvas and GSAP rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #0d0d0d;
--ink: #ffffff;
--accent: #ffd400;
--muted: #9a948a;
```
```json fonts
[
  {"family": "Anton", "id": "anton", "weights": [400], "role": "headline"},
  {"family": "Oswald", "id": "oswald", "weights": [500, 700], "role": "services and button"},
  {"family": "JetBrains Mono", "id": "jetbrains-mono", "weights": [400, 500], "role": "viewfinder readouts"}
]
```

## Beat sheet
```json beats
{"bpm": 120, "events": [
  {"id": "wake", "at": 0.0, "label": "camera wakes, overlay in"},
  {"id": "hunt", "repeat": {"n": 3, "fromFrac": 0.05, "everyFrac": 0.22}, "label": "focus hunts"},
  {"id": "lock", "repeat": {"n": 3, "fromFrac": 0.11, "everyFrac": 0.22}, "label": "focus locks, double beep"},
  {"id": "shutter", "repeat": {"n": 3, "fromFrac": 0.14, "everyFrac": 0.22}, "label": "shutter fires, flash"},
  {"id": "print", "repeat": {"n": 3, "fromFrac": 0.17, "everyFrac": 0.22}, "label": "print lands on the set"},
  {"id": "pan", "repeat": {"n": 2, "fromFrac": 0.2, "everyFrac": 0.22}, "label": "quick pan to the next scene"},
  {"id": "block", "at": 0.74, "label": "yellow headline block lands"},
  {"id": "service", "repeat": {"n": 4, "fromFrac": 0.78, "everyFrac": 0.03}, "label": "services appear"},
  {"id": "button", "at": 0.9, "label": "Book a shoot button pops"},
  {"id": "close", "at": 0.97, "label": "heavier shutter close"}
]}
```

## Build recipe
- **Viewfinder:** draw brackets, thirds (alpha 0.25), a focus box (a square with corner ticks) and the strips each frame; readouts as text (`1/250  F2.8  ISO 400  [12]`), the shots counter decrements at each `shutter*`.
- **Focus:** blur amount `b(t) = 1 - E.outCubic(seg(t, T.huntK, T.lockK - T.huntK))` scaled to a max of 14 px; the hunt oscillates the focus box `x/y` by `sin` with decay; lock = box colour to `--accent`, a short scale pulse. Implement blur by drawing the scene to a small offscreen canvas (downscale 1/8) and upscaling for the blurred version, crossfaded to the sharp one by `1 - b`.
- **Flash safety:** the white flash is a single 2-frame overlay at alpha 0.6 at most; max 3 flashes per second in the whole video.
- **Prints:** each print is a white-bordered card with a small caption; the flight path uses `E.outCubic` with a tiny bounce; tape strip at the top; final fan layout with rotations -12, -3, 8 degrees.
- **Pitfalls:** never fetch photos at render time (copy them into `assets/photos/`); keep the yellow block text high contrast (black on yellow); readouts inside the safe area.

## Sound plan
How each effect of the brief is covered:
- **A soft whirr as the camera wakes:** `whir` at `wake`.
- **Fast autofocus motor ticks while the focus hunts, and the classic double beep when it locks:** `ticks` at `hunt*`; two `blip` at `lock*`.
- **A crisp mechanical shutter with a mirror slap, and a thin flash recharge whine:** `shutter` at `shutter*`; a short high `chirp` after.
- **A quick swish for each pan:** `swish` at `pan*`.
- **A whoosh and a paper tap as each print lands, and a thud as the yellow block lands:** `whoosh` + `paper` at `print*`; `thud` at `block`.
- **Soft ticks for the services, a pop for the button and a heavier shutter close at the end:** `tick` at `service*`, `pop` at `button`, `shutter` (low) + `thud` at `close`.
```json cues
[
  {"at": "wake", "kind": "whir", "f0": 80, "f1": 200, "dur": 0.6, "vol": 0.3},
  {"at": "hunt*", "kind": "ticks", "n": 8, "span": 0.5, "tick": "tick", "f0": 1400, "f1": 900, "vol": 0.4},
  {"at": "lock*", "kind": "blip", "freq": 1800, "dur": 0.06, "vol": 0.5},
  {"at": "lock*+0.12", "kind": "blip", "freq": 1800, "dur": 0.06, "vol": 0.5},
  {"at": "shutter*", "kind": "shutter", "vol": 0.9},
  {"at": "shutter*+0.2", "kind": "chirp", "f0": 3000, "f1": 6500, "dur": 0.5, "vol": 0.12},
  {"at": "pan*", "kind": "swish", "dur": 0.2, "vol": 0.5},
  {"at": "print*", "kind": "whoosh", "dir": "down", "dur": 0.35, "vol": 0.4},
  {"at": "print*+0.3", "kind": "paper", "dur": 0.15, "vol": 0.5},
  {"at": "block", "kind": "thud", "freq": 85, "dur": 0.25, "vol": 0.8},
  {"at": "service*", "kind": "tick", "freq": 2200, "vol": 0.5},
  {"at": "button", "kind": "pop", "freq": 640, "vol": 0.7},
  {"at": "close", "kind": "shutter", "vol": 1.0},
  {"at": "close+0.05", "kind": "thud", "freq": 60, "dur": 0.3, "vol": 0.7}
]
```
```json music
{"preset": "lofi-house", "bpm": 120, "key": "A", "scale": "minor", "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16 / 4:5:** viewfinder margins inside the safe area; the set at the end: prints fanned in the upper half, headline block below, services list and button in the lower third.
- **16:9:** prints fanned on the right, text on the left.
- **1:1:** prints top-right, text below.

## Loop & ending
The heavier shutter closes on black and the first frame is the camera waking, so it loops.

## Guardrails
- Keep every line of text short and easy to read in a second.
- Flashes are brief single events (at most three per second): no strobing.
- Use the user's photos (3 to 6 of the best) when attached; stand-in scenes must still look like real photos.

## QA
- Frame at `hunt1 + 0.3 s`: blurred image, focus box mid-search; at `lock1 + 0.2 s`: sharp image with a yellow box.
- Frame at `print3 + 0.5 s`: three prints on the set with labels and tape.
- Final frame: headline block, four services with icons, button, contact line all inside the safe area.
