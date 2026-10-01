---
name: vintage-archive
title: Vintage archive
description: An old documentary reel found in a family archive: aged paper, heavy film grain, sepia photos with deckled borders dropping onto the page, typewriter captions, an ink timeline where each year lands as a red ink stamp, warm light leaks and a final film burn-out. For brand histories, anniversaries, family stories and "since" campaigns.
tags: ["photos","retro","brand"]
library: GSAP
sound: true
difficulty: 5
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Vintage archive

**One-liner:** the story told in date order on aged cream paper with stains, fibres and worn edges under heavy film grain, gentle flicker, dust specks, a faint scratch and a dark vignette; sepia or black-and-white photos with white or deckled borders drop onto the page, tilted and fixed by black corners or tape, then drift with a Ken Burns zoom and stack like an album; captions type out like a typewriter; a large title with "Since" and the first year sits near the top; an ink timeline draws along the bottom and each year lands as a round red ink stamp; warm light leaks wash between chapters; at the end the film burns out to warm orange and returns to the start.
**Best for:** a company's history, an anniversary, a family or founder story, heritage brands, "since 19xx" messages.
**Avoid when:** you have no dates or story order; the tone must be modern.

## Inputs to gather
- Title, first year, 3 to 5 dated events (year + short caption), photos in order (or a subject for drawn period scenes). Language. Brand colours (muted, aged).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | Make it feel like an old documentary reel found in a family archive; tell my story in the order of my dates | Chapters sorted by year from `CONTENT.events` |
| L2 | Aged paper background: warm cream with soft stains, fibres and darker worn edges; over everything heavy film grain, a gentle flicker in brightness, the odd dust speck, a faint vertical scratch and a soft dark vignette | Paper canvas generated once (fBm stains, fibre strokes); film layer per stepped frame (24 fps): grain, flicker, specks, scratch, vignette (all seeded) |
| L3 | Old photos in sepia or black and white with a white or deckled border, tilted slightly, fixed to the page with black photo corners or a strip of tape; each drops gently onto the page then drifts with a Ken Burns zoom; new photos land on top of earlier ones like a small stack in an album | Photo card: border, corners, shadow; drop `y` with a tiny settle; inner image scale drift; stack z-order increases |
| L4 | If old photos are attached use them in the frames and tone them to match; if none are attached draw simple period scenes that suit the subject (an old street, a steam train, a portrait) | CSS/canvas sepia grade (`grayscale` + `sepia` multiply) on `<img>`; fallback SVG scenes |
| L5 | Type short captions from my message letter by letter, like a typewriter, with a blinking caret; one short line or two | Letter reveal at 14 to 18 cps; caret blink 0.5 s |
| L6 | My title large near the top, with a small line above like "Since" and my first year, and a thin printed rule underneath | Title Playfair Display; small typewriter line; rule |
| L7 | Along the bottom an ink timeline draws across the frame; at each of my years it stops and the year lands as a round red ink stamp | SVG line `strokeDashoffset` with pauses at year ticks; stamp = red circle ring with the year, scale 1.3 to 1 + rotation |
| L8 | Between chapters a soft warm light leak washes in from the side; at the end the film briefly burns out to warm orange light and fades back to the start; keep every flash brief and gentle, never strobing | Leak = warm gradient panel sliding in/out (opacity <= 0.5); final burn = orange overlay ramping to 0.9 then fade over 0.8 s (single event) |
| L9 | Keep everything calm, warm and nostalgic | Slow eases, muted colours |
| T1 | A classic high-contrast serif (Playfair Display) for the title and a typewriter font (Special Elite) for captions, labels and years | Playfair Display 700; Special Elite 400 |
| T2 | Brand colours if given, kept muted and aged; else aged paper, sepia ink, oxblood stamp red, faded brass | Tokens below |
| S1 | A soft film projector whirr with steady sprocket clicks under everything, a typewriter clack for each typed letter (a duller knock for spaces) with a carriage bell and return at the end of each caption, a soft rush and pat as each photo drops onto the page, a dip-pen scratch as the timeline draws, a rubber-stamp thunk as each year lands, a warm swell of air for each light leak, a gentle whoosh as the film burns out | Cue table below |
| S2 | An old-time nostalgic waltz on a warm piano about 90 bpm, played through a soft gramophone tone with a light vinyl crackle; quieter than the effects; loops | `waltz` preset (3/4) with a vinyl bed |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | GSAP HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #ecdfc4;
--ink: #3a2718;
--accent: #8e2b22;
--brass: #a8864f;
```
```json fonts
[
  {"family": "Playfair Display", "id": "playfair-display", "weights": [700], "role": "title"},
  {"family": "Special Elite", "id": "special-elite", "weights": [400], "role": "captions, labels, years"}
]
```

## Beat sheet
For three chapters.
```json beats
{"bpm": 90, "events": [
  {"id": "title", "at": 0.0, "label": "title, Since year, rule"},
  {"id": "photo", "repeat": {"n": 3, "fromFrac": 0.1, "everyFrac": 0.25}, "label": "photo drops on the page"},
  {"id": "caption", "repeat": {"n": 3, "fromFrac": 0.16, "everyFrac": 0.25}, "label": "caption types"},
  {"id": "timeline", "repeat": {"n": 3, "fromFrac": 0.2, "everyFrac": 0.25}, "label": "timeline draws to the next year"},
  {"id": "stamp", "repeat": {"n": 3, "fromFrac": 0.3, "everyFrac": 0.25}, "label": "year stamp lands"},
  {"id": "leak", "repeat": {"n": 2, "fromFrac": 0.34, "everyFrac": 0.25}, "label": "light leak between chapters"},
  {"id": "burn", "at": 0.92, "label": "film burns out to warm orange"}
]}
```

## Build recipe
- **Paper:** draw once to an offscreen canvas: base cream, 8 to 12 soft brown stain blobs (radial gradients), 200 fibre strokes (1 px, low alpha), edge darkening via a vignette on the paper itself.
- **Film layer (redraw per 24 fps step):** grain via `MP.drawGrain` (alpha 0.12), flicker `1 + 0.03 * (hash(k) - 0.5)` as an overall brightness overlay, dust specks: 3 to 6 seeded specks per frame, one faint vertical scratch line at a seeded x for 20% of frames.
- **Photos:** each card: white or deckled border (irregular polygon edge from seeded jitter), photo inside (sepia grade), corners as black triangles, a soft shadow; drop from `y - 200` with `power2.out` and a tiny rotation settle; inner drift `scale 1 to 1.08`.
- **Timeline:** thin ink line along the bottom with year ticks; the drawn part advances between years and pauses on each; the year stamp = a circle ring + year text, red with a slight blur edge, `scale 1.3 to 1`.
- **Burn-out:** one overlay ramp only; no repeated flashing.
- **Pitfalls:** never let flicker exceed 3 to 4% brightness; ensure captions stay readable over the photo stack; keep two to three photos visible at a time.

## Sound plan
How each effect of the brief is covered:
- **A soft film projector whirr with steady sprocket clicks under everything:** a low `whir` bed + a quiet `repeat` of `click`.
- **A typewriter clack for each typed letter (a duller knock for spaces) with a carriage bell and return at the end of each caption:** `typing` (with `bell`) at `caption*`.
- **A soft rush and a pat as each photo drops onto the page:** `paper` + `thud` (soft) at `photo*`.
- **A dip-pen scratch as the timeline draws:** `scratch` at `timeline*`.
- **A rubber-stamp thunk as each year lands:** `stamp` at `stamp*`.
- **A warm swell of air for each light leak:** `swell` at `leak*`.
- **A gentle whoosh as the film burns out:** `whoosh` at `burn`.
```json cues
[
  {"at": 0.0, "kind": "whir", "f0": 50, "f1": 52, "dur": "D", "vol": 0.13},
  {"at": 0.0, "kind": "repeat", "every": 0.083, "times": "fill", "of": {"kind": "click", "freq": 900, "vol": 0.08}},
  {"at": "photo*", "kind": "paper", "dur": 0.35, "vol": 0.4},
  {"at": "photo*+0.3", "kind": "thud", "freq": 120, "dur": 0.1, "vol": 0.4},
  {"at": "caption*", "kind": "typing", "n": 22, "dt": 0.07, "spaceEvery": 5, "bell": true, "vol": 0.45},
  {"at": "timeline*", "kind": "scratch", "dur": 1.2, "freq": 2000, "jitter": 0.4, "vol": 0.3},
  {"at": "stamp*", "kind": "stamp", "dur": 0.3, "vol": 0.8},
  {"at": "leak*", "kind": "swell", "dur": 1.6, "freq": 600, "vol": 0.3},
  {"at": "burn", "kind": "whoosh", "dir": "up", "dur": 1.0, "f0": 200, "f1": 3000, "vol": 0.45}
]
```
The sprocket clicks repeat for the whole film (`"times": "fill"`).
```json music
{"preset": "waltz", "bpm": 90, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16 / 4:5:** title in the top 15%, photo stack in the middle (photos about 70% of the width), caption under the stack, timeline in the bottom safe area.
- **16:9:** photo stack on the right two thirds, title and caption on the left, timeline along the bottom.
- **1:1:** title top, stack centre, caption and timeline below.

## Loop & ending
The film burns out to warm orange and fades back to the aged paper with the title (frame 0).

## Guardrails
- Keep every flash brief and gentle, never strobing: one leak per chapter and a single burn-out.
- Tell the story in the order of the user's dates; use their photos when attached (toned to match), otherwise simple drawn period scenes.
- Keep everything calm, warm and nostalgic.

## QA
- Frame at `photo2 + 1 s`: two photos stacked, tilted with corners; caption typed partly with a caret.
- Frame at `stamp1 + 0.4 s`: red year stamp on the timeline; frame at `burn + 0.3 s`: warm orange wash, then clear at the end.
- Grain and vignette visible but text readable; brightness flicker under 4%.
