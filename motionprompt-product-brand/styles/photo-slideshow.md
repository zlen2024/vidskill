---
name: photo-slideshow
title: Photo slideshow
description: The user's photos with slow Ken Burns zooms, bold serif captions rising out of masks with a counter, and varied editorial transitions (wipe, zoom-through, split panels, colour sweep), with a progress bar. For travel, property, event and portfolio slideshows.
tags: ["photos","travel","social"]
library: GSAP
sound: true
difficulty: 3
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Photo slideshow

**One-liner:** each attached photo fills the frame and drifts with a slow Ken Burns move (a different direction each), photos change through varied editorial transitions, and a short bold caption from the message rises word by word out of a mask in the lower left with a counter ("01 / 04") and a thin accent line; a segmented progress bar at the top fills as it plays.
**Best for:** a travel recap, property or venue tour, event highlights, a portfolio, a product lookbook.
**Avoid when:** the user has no photos and does not want placeholders.

## Inputs to gather
- The photos in order (3 to 6). If none: ask; if they say none exist, use tasteful placeholder scenes. One short caption per photo taken from the message. Brand colours (accent).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | Use the attached photos in the given order; ask for them if none; if the user has none use tasteful placeholder scenes for the subject | Photos copied into `assets/photos/`; placeholder = generated gradient scenes (SVG) |
| L2 | Each photo fills the frame and moves slowly with a Ken Burns effect: a gentle zoom in or out with a slight pan, a different direction each; crop so the main subject stays in view in any frame shape | `<img>` with `object-fit: cover`, `scale 1.0 to 1.12` and `x/y` drifts per photo alternating; choose `object-position` to keep the subject (ask or detect faces/centre) |
| L3 | Change photos with smooth varied transitions: a clean wipe, a zoom-through, panels that rise one after another, a colour panel sweeping across | Four transition builders using `clip-path`/panels; cycle through them |
| L4 | A short bold caption in the lower left per photo from the message; words rise out of a mask one by one with a counter (01 / 04) and a thin accent line above; clear the caption before the next photo | Word split with masks (`overflow: hidden` wrappers), `yPercent 110 to 0`; counter and line; exit just before the transition |
| L5 | A soft dark gradient behind the captions for readability, and a light film grain | Bottom gradient overlay; grain overlay via `MP.drawGrain` on a canvas |
| L6 | A thin progress bar at the top with one segment per photo that fills as the slideshow plays | Segments width tweens per photo window |
| L7 | Calm and editorial like a travel magazine; loop smoothly back to the first photo at the end | Slow eases; the last transition leads to photo 1 |
| T1 | An elegant bold serif (Playfair Display) for captions and a small spaced-capitals sans for the counter | Playfair Display 700; counter in the same family or a sans in caps |
| T2 | Brand colours if given, else warm white text, gold accent, deep ink for the colour sweep | Tokens below |
| S1 | A soft swish across the frame for the wipe, a deep rushing whoosh for the zoom-through, three soft rising whooshes (left, middle, right) for the split panels, a brushy paper sweep for the colour panel, a soft click as each caption word rises | Cue table below |
| S2 | Warm calm cinematic travel bed about 80 bpm, one bar per photo: soft piano arpeggio, warm string pad with a low cello note, light percussion; quiet; loops | `cinematic-travel` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length; share the time evenly between photos | scaffold `--duration 15`; per-photo time = `D / N` |
| O3 | GSAP HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #10141c;
--ink: #fbf7ef;
--accent: #f2c14e;
--sweep: #10141c;
```
```json fonts
[{"family": "Playfair Display", "id": "playfair-display", "weights": [700], "role": "captions and counter"}]
```

## Beat sheet
For four photos (per-photo slot = `D / 4`); recompute for N photos.
```json beats
{"bpm": 80, "events": [
  {"id": "photo", "repeat": {"n": 4, "fromFrac": 0.0, "everyFrac": 0.25}, "label": "photo starts"},
  {"id": "caption", "repeat": {"n": 4, "fromFrac": 0.05, "everyFrac": 0.25}, "label": "caption words rise"},
  {"id": "trans", "repeat": {"n": 3, "fromFrac": 0.23, "everyFrac": 0.25}, "label": "transition to the next photo"}
]}
```
The transition type cycles: wipe, zoom-through, split panels, colour sweep; put the cue that matches each in `cues.mjs`.

## Build recipe
- **Ken Burns:** `tl.fromTo(img, {scale: 1.0, x: a, y: b}, {scale: 1.12, x: c, y: d, duration: slotDur + overlap, ease: "none"}, T.photoK)` with alternating directions (in, out, left, right). Overscan the image by 12% so edges never show.
- **Transitions:** wipe = incoming photo revealed by an animating `clip-path: inset()`; zoom-through = outgoing scale to 2.2 + fade, incoming from 0.9; split panels = 3 vertical strips of the incoming photo (three `overflow: hidden` divs with the image offset) rising in stagger; colour sweep = a `--sweep` panel crossing the frame between the two photos.
- **Captions:** wrap each word in an `overflow: hidden` span with an inner span translated 110%; add the counter (`01 / 04`) and a 2 px accent line above; put a gradient behind the caption area; exit by lowering opacity 0.3 s before the transition.
- **Pitfalls:** large photos slow rendering: downscale to the composition size first (`sharp`/ffmpeg) and keep JPEG; keep `img` sizes explicit; never crop faces (choose `object-position`).

## Sound plan
How each effect of the brief is covered (gentle and matched to each transition):
- **A soft swish that crosses the frame for the wipe:** `swish` at `trans1`.
- **A deep, rushing whoosh for the zoom through:** `whoosh` (peak, low to mid) at `trans2`.
- **Three soft rising whooshes (left, middle, right) for the split panels:** three `whoosh` up with pans -0.6, 0, 0.6 at `trans3`.
- **A brushy paper sweep for the colour panel:** `paper` + `swish` at the colour sweep transition.
- **A soft click as each caption word rises into view:** `click` at `caption*`.
```json cues
[
  {"at": "trans1", "kind": "swish", "dur": 0.4, "vol": 0.5},
  {"at": "trans2", "kind": "whoosh", "dir": "peak", "dur": 0.9, "f0": 150, "f1": 2500, "vol": 0.6},
  {"at": "trans3", "kind": "whoosh", "dir": "up", "dur": 0.5, "pan": -0.6, "vol": 0.4},
  {"at": "trans3+0.12", "kind": "whoosh", "dir": "up", "dur": 0.5, "pan": 0.0, "vol": 0.4},
  {"at": "trans3+0.24", "kind": "whoosh", "dir": "up", "dur": 0.5, "pan": 0.6, "vol": 0.4},
  {"at": "caption*", "kind": "ticks", "n": 4, "span": 0.5, "tick": "click", "vol": 0.35}
]
```
```json music
{"preset": "cinematic-travel", "bpm": 80, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- All ratios: full-bleed photos; caption block at the lower left inside `--safe-*` (in 9:16 raise it above the bottom UI zone); progress bar at the top inside the top safe margin.
- Portrait photos in 16:9 frames: use `object-position` and a slightly larger scale; never letterbox.

## Loop & ending
The last transition returns to photo 1 (the first frame), so the video loops calmly.

## Guardrails
- Use the photos in the order given; if none are attached ask for them before starting, and if the user has none use tasteful placeholder scenes that suit the subject.
- Crop so the main subject stays in view in any frame shape.
- Keep it calm and editorial: no jitter, no fast cuts; keep captions readable over the photo with the gradient.

## QA
- Frame at each `photo + 60%`: photo scale visibly larger than at the start; subject inside the frame.
- Frame at `trans2 + 0.2 s`: zoom-through mid-way; at `trans3 + 0.25 s`: three strips at different heights.
- Caption fully readable with the counter; progress segments fill in order.
- Photos are not stretched and no black edges appear during the pans.
