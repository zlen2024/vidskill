---
name: borneo-rainforest
title: Borneo rainforest
description: A calm cinematic walk into a lush Borneo rainforest at dawn: layered dipterocarp trees, drifting mist and light rays, a gliding rhinoceros hornbill, a rafflesia opening on the forest floor, fireflies and dew, with your title fading up letter by letter. For eco-tourism, travel, nature brands and calm openers.
tags: ["travel","background","malaysia"]
library: GSAP
sound: true
difficulty: 5
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Borneo rainforest

**One-liner:** deep layers of tall pale-trunked dipterocarp trees with wide buttress roots, hanging vines, a thick canopy and giant ferns framing the corners; soft morning mist drifts between layers and warm light rays fall through the canopy; the layers sway at different speeds for depth; a rhinoceros hornbill glides across, a rafflesia opens on the forest floor, dew sparkles or fireflies glow; the title fades up letter by letter; it starts and ends in thick mist so it loops.
**Best for:** Borneo and Sabah/Sarawak tourism, eco-lodges, nature and conservation brands, a calm cinematic opener.
**Avoid when:** you need a busy or high-energy piece. Nothing flashes or jumps.

## Inputs to gather
- Title, an optional small line above it, language (Malay or English). Which living details to include (hornbill, rafflesia, fireflies). Brand colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A calm cinematic walk into a lush Borneo rainforest in the early morning, built in deep layers: tall dipterocarp trees with pale straight trunks and wide buttress roots, hanging vines, a thick canopy at the top, giant ferns and big tropical leaves framing the corners | 6 to 8 SVG layers back to front with decreasing haze; trunks as tapered rects with buttress paths at the base; canopy blobs; ferns as repeated frond paths |
| L2 | Soft morning mist drifts slowly between the layers and warm light rays fall through the canopy; the layers sway a little at different speeds so the forest feels deep | Mist = blurred translucent bands moving in `x`; rays = angled gradient polygons with slow opacity `sin`; parallax sway per layer |
| L3 | Living details that fit the topic: a rhinoceros hornbill (black wings, white tail with a black band, a big yellow bill with an orange casque that curls up) gliding across with a few slow wingbeats, a rafflesia (five thick red petals with cream spots) opening on the forest floor, dew sparkles or fireflies glowing in the light | `hornbill()` SVG with flapping wings (scaleY/rotate by `sin`), glide path; `rafflesia()` petals scale/rotate open; dew sparkles seeded |
| L4 | Keep the motion slow and smooth; nothing flashes or jumps | Only slow eases (`sine.inOut`); no cuts |
| L5 | The message as an elegant title that fades up letter by letter, with an optional small line above in spaced capitals; short and readable over the forest | `MP.splitText` with opacity stagger; a soft dark gradient behind the title |
| L6 | Start and end in thick mist so the video can loop | Mist opacity 1 at 0 and D, thinning in the middle |
| L7 | Write the text in the user's language (Malay or English) | `CONTENT.lang` |
| T1 | An elegant serif (Cormorant Garamond) for the title and a clean sans (Montserrat) in spaced capitals for the small line | Cormorant Garamond 600; Montserrat 500 caps |
| T2 | Brand colours if given, else deep forest green, fern green, misty sage, warm cream, soft gold, rafflesia red | Tokens below |
| S1 | A calm rainforest ambience timed to the motion: soft insects shimmering high in the trees, gentle water drips and far-off bird whistles throughout (muffled while the mist is thick), a slow airy swell as the mist thins at the start and rolls back in at the end, a soft organic swell with faint creaks as the rafflesia opens and a gentler one as it closes, a heavy whoosh on each hornbill wingbeat, air sliding past as it glides and a distant honking call, faint dewdrop tones as the title letters fade up | Cue table below |
| S2 | A cinematic, mysterious but calm bed: slow breathing low drone, soft wooden knocks, a simple airy flute tune; quiet; loops | `ambient-dreamy` with a flute melody and wood knocks |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | GSAP HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #0f2d21;
--ink: #f6f1dc;
--accent: #e8c46a;
--fern: #276d44;
--sage: #b9cfa6;
--rafflesia: #a8281a;
```
```json fonts
[
  {"family": "Cormorant Garamond", "id": "cormorant-garamond", "weights": [600], "role": "title"},
  {"family": "Montserrat", "id": "montserrat", "variable": true, "weightRange": "100 900", "role": "small line"}
]
```

## Beat sheet
```json beats
{"bpm": 0, "events": [
  {"id": "mist", "at": 0.0, "label": "thick mist, then thinning"},
  {"id": "thin", "at": 0.1, "label": "mist thins, rays appear"},
  {"id": "hornbill", "at": 0.25, "label": "hornbill enters"},
  {"id": "wing", "repeat": {"n": 4, "fromFrac": 0.28, "everyFrac": 0.05}, "label": "wingbeats"},
  {"id": "raff", "at": 0.5, "label": "rafflesia opens"},
  {"id": "letter", "repeat": {"n": 10, "fromFrac": 0.62, "everyFrac": 0.02}, "label": "title letters fade up"},
  {"id": "close", "at": 0.86, "label": "rafflesia closes, mist rolls back in"}
]}
```
Match `letter` to the title's character count.

## Build recipe
- **Layers and parallax:** each layer group moves `x = A_l * sin(t * w_l + p_l)` with amplitude growing toward the foreground; haze: add a `--bg`-tinted overlay of opacity `0.55 * (1 - depth)` per layer to fake atmospheric perspective.
- **Trees:** trunks tapered rectangles (slightly off-vertical), pale bark with vertical streaks, buttress roots as flared paths; vines as drooping curves with small leaves.
- **Hornbill (accurate look):** black body and wings, white tail with a black band, a large yellow bill topped by an orange casque that curves upward; wings flap slowly with `rotation = 25 * sin(t * 3)` and a glide phase; it crosses the frame on a gentle arc.
- **Rafflesia:** five thick red petals with cream spots around a central disc; petals `scale 0.2 to 1` and rotate open with stagger; close reverses gently.
- **Light rays:** 3 to 5 polygons from the top with a gradient alpha; opacity by `sin`; keep them soft and subtle.
- **Pitfalls:** no abrupt changes; blur only on a few large mist bands; keep title contrast with a soft gradient behind it.

## Sound plan
A calm rainforest ambience timed to the motion. How each effect of the brief is covered:
- **Soft insects shimmering high in the trees, gentle water drips and far-off bird whistles all the way through, a little muffled while the mist is thick:** `insects` + `drip` + soft `chirp` beds, filtered lower at the start and end.
- **A slow airy swell as the mist thins at the start and rolls back in at the end:** `swell` at `thin` and `close`.
- **A soft organic swell with faint creaks as the rafflesia opens, and a gentler one as it closes:** `swell` + `scratch` (creak) at `raff`; a quieter pair at `close`.
- **A heavy whoosh on each of the hornbill's wingbeats, air sliding past as it glides and a distant honking call:** `whoosh` at `wing*`, `wind` at `hornbill`, a low `brass` honk.
- **Faint dewdrop tones as the title letters fade up:** `drip` (soft, high) at `letter*`.
```json cues
[
  {"at": "mist", "kind": "insects", "dur": "D", "freq": 5200, "vol": 0.22},
  {"at": "mist", "kind": "drip", "freq": 900, "vol": 0.25},
  {"at": 0.18, "kind": "drip", "freq": 1100, "vol": 0.25},
  {"at": 0.4, "kind": "drip", "freq": 800, "vol": 0.25},
  {"at": 0.7, "kind": "drip", "freq": 1000, "vol": 0.25},
  {"at": 0.22, "kind": "chirp", "f0": 2200, "f1": 3200, "dur": 0.4, "vol": 0.12},
  {"at": 0.55, "kind": "chirp", "f0": 2600, "f1": 2000, "dur": 0.5, "vol": 0.12},
  {"at": "thin", "kind": "swell", "dur": 2.4, "freq": 700, "vol": 0.4},
  {"at": "hornbill", "kind": "wind", "dur": 3.0, "vol": 0.25},
  {"at": "wing*", "kind": "whoosh", "dir": "peak", "dur": 0.5, "f0": 100, "f1": 600, "vol": 0.55},
  {"at": "hornbill+2.4", "kind": "brass", "note": "D3", "dur": 0.5, "vol": 0.22},
  {"at": "raff", "kind": "swell", "dur": 2.0, "freq": 300, "vol": 0.4},
  {"at": "raff+0.3", "kind": "scratch", "dur": 1.2, "freq": 500, "jitter": 0.7, "vol": 0.15},
  {"at": "letter*", "kind": "drip", "freq": 1300, "vol": 0.18},
  {"at": "close", "kind": "swell", "dur": 2.4, "freq": 600, "vol": 0.35}
]
```
```json music
{"preset": "ambient-dreamy", "bpm": 60, "gain": 1, "duck": 0.35, "layers": {
  "glass": false,
  "flute": {"type": "melody", "voice": "flute", "oct": 5, "vol": 0.4, "sparse": 0.5, "verb": 0.5, "lo": 0, "hi": 7},
  "knocks": {"type": "perc", "vol": 0.4, "lanes": [{"pat": "x-------------x-", "voice": "woodblock", "note": "C4", "dur": 0.08, "vol": 0.5}]}
}}
```

## Layout by aspect ratio
- **9:16:** tall trunks emphasised; canopy at the top, ferns framing the lower corners; title in the middle band with the small line above; rafflesia on the lower third above the safe zone.
- **16:9:** wide layered forest; hornbill crosses at the upper third; title lower-centre.
- **1:1 / 4:5:** as 9:16 with shorter trunks.

## Loop & ending
Mist rolls back in thick and the title fades; the opening frame is the same thick mist.

## Guardrails
- Keep the motion slow and smooth: nothing flashes or jumps.
- Show the hornbill and rafflesia accurately (bill with an upward-curling casque; five thick red petals with cream spots).
- Keep the title short and easy to read over the forest; write it in the language used.

## QA
- Frame at `hornbill + 1 s`: hornbill visible with yellow bill and casque, white tail with a black band.
- Frame at `raff + 2 s`: rafflesia fully open with cream spots; frame at 0 and at `D` are both thick mist.
- Title legible; mist and rays look soft with no banding.
