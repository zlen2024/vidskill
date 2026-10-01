---
name: editorial-portfolio
title: Editorial portfolio
description: A luxury magazine about you on a dark desk: your name as a giant serif cover masthead with your portrait overlapping it, then project spreads and a contact back page with a handwritten signature, turned page by page with real page curls. For designers, photographers, architects and creative freelancers.
tags: ["brand","photos","text"]
library: GSAP
sound: true
difficulty: 5
default_duration: 20
ratios: {"9:16":"great","4:5":"great","1:1":"good","16:9":"great"}
---
# Editorial portfolio

**One-liner:** a luxury fashion-and-design magazine about the user, shot on a dark desk; it opens on the cover (a huge high-contrast serif masthead of their name, their portrait in front with the head overlapping the bottom of the letters, a big circle of accent colour behind, small cover lines, an issue number and a tiny barcode), then pages turn one by one with a real page curl and soft shadow: one spread per project (big serif number, project name in italic, a short line, two columns with a drop cap, a pull quote, small-caps credits, a large image), and finally a back page: "Let's work together." with email, website, socials, skills and a signature that writes itself.
**Best for:** designers, photographers, architects, illustrators, freelancers, creative studios.
**Avoid when:** you have no portrait or project images and do not want stand-ins.

## Inputs to gather
- Name, role line ("Designer. Maker. Storyteller."), portrait, 2 to 4 projects (name, one line, client, role, year, image), email, website, socials, skills line. Accent colour.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A luxury fashion and design magazine about me, shot on a dark desk; it opens on the cover and then the pages turn one by one like a real magazine | Desk = dark surface with a subtle wood/leather texture; the magazine as a stack of page elements in a 3D scene (CSS 3D) |
| L2 | The cover: my name as a huge high-contrast serif masthead, my portrait in front of it with my head overlapping the bottom of the letters, a big circle of the accent colour behind me, a few small cover lines ("Designer. Maker. Storyteller."), an issue number and a small barcode | Layers: masthead text, accent circle, portrait cutout (PNG with alpha, or `mask`), overlap via z-order and a lower part of the masthead placed above the portrait's head zone; cover lines and barcode (generated stripes) |
| L3 | Then turn to one spread per project: a big serif number ("01"), the project name in serif italic, a short line about it, two columns of text with a drop cap, a pull quote and small-caps credits (client, role, year), with a large image of the work; show two or three projects | Spread template (grid); text from `CONTENT.projects`; drop cap by `::first-letter` |
| L4 | End on a back page: "Let's work together." in big serif type, then my email, website and socials in neat rows, a line of my skills and a hand-drawn signature that writes itself | Back page template; signature path from a script-like SVG path drawn by `strokeDashoffset` |
| L5 | Pages turn with a real page curl and a soft shadow on the page below; on each new page the words rise into place, the image wipes in and fine rules draw across | Page turn = a clipped, rotating page with a moving fold line and a gradient shadow (implementation in the recipe); page content reveals staggered by `T` |
| L6 | Calm and elegant: generous white space, thin rules, a light paper grain and one spot colour used sparingly; hold each page long enough to read the title | Slow eases; each page holds at least 2.5 s |
| L7 | Use my portrait and project images if attached (a portrait photo and two to four images of my work); otherwise draw tasteful stand-ins in a flat editorial illustration style | `<img>` from `assets/`; fallback = SVG flat compositions |
| L8 | Fit the shape of the video: a single tall page for vertical videos, open two-page spreads for wide videos, and a page lying at an angle on the desk for square videos | Layout switch by ratio; square = the page rotated about 6 degrees on the desk |
| T1 | A high-contrast serif (Playfair Display) for the masthead, numbers, titles and quotes, and a clean sans (Manrope) in small spaced capitals for labels and body text | Playfair Display 400/700/italic; Manrope 500/700 with tracking |
| T2 | Brand colours if given, else paper, ink, warm stone cover backdrop, dark desk and one accent (deep red) | Tokens below |
| S1 | A soft camera shutter as the cover appears, a papery page turn with a gentle thump as each page lands, light type clicks as titles and lines set, a soft swish as each image slides in, a warm little chime on the back page, a fountain-pen scratch as the signature writes, a camera flash pop at the very end | Cue table below |
| S2 | A stylish slow jazz bed about 100 bpm: soft electric piano chords, walking upright bass, brushed snare, a light ride cymbal, kept low; loops | `jazz-slow` preset at 100 bpm |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length (20 s for cover + 2 projects + back page) | scaffold `--duration 20` |
| O3 | GSAP with CSS 3D page turns rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #2b2622;
--paper: #f4efe6;
--ink: #151515;
--stone: #d9ccba;
--accent: #c8341f;
```
```json fonts
[
  {"family": "Playfair Display", "id": "playfair-display", "weights": [400, 700], "styles": ["normal", "italic"], "role": "masthead, numbers, titles, quotes"},
  {"family": "Manrope", "id": "manrope", "variable": true, "weightRange": "200 800", "role": "labels and body"}
]
```

## Beat sheet
For a cover, two projects and the back page (5 pages).
```json beats
{"bpm": 100, "events": [
  {"id": "cover", "at": 0.0, "label": "cover appears, shutter"},
  {"id": "turn", "repeat": {"n": 3, "fromFrac": 0.22, "everyFrac": 0.25}, "label": "page turn"},
  {"id": "page", "repeat": {"n": 3, "fromFrac": 0.28, "everyFrac": 0.25}, "label": "new page content sets"},
  {"id": "sign", "at": 0.86, "label": "signature writes"},
  {"id": "flash", "at": 0.98, "label": "camera flash pop"}
]}
```

## Build recipe
- **Page turn (CSS 3D):** each page is a `div` with `transform-origin: left center` (right page) and `transform-style: preserve-3d`; a turn animates `rotationY` from 0 to -180 with `perspective` on the container; add a fold shadow (a linear gradient overlay whose position and opacity follow `rotationY`) on the page underneath and on the turning page's front and back faces (`backface-visibility` on two child faces). For a page curl feel add a slight `skewY` and a gradient highlight moving with the fold.
- **Cover overlap:** masthead in two stacked copies: the top copy clipped to the part above the head line, the bottom copy behind the portrait; the portrait needs an alpha cutout (ask for a PNG cutout or generate a soft-edged mask from an ellipse around the head; otherwise draw a stand-in portrait illustration).
- **Reveals:** on each new page: words `yPercent 105 to 0` inside masks (stagger 0.04), the image wipes in with `clip-path: inset(0 100% 0 0)` to `inset(0)`, hairlines scale in from the left.
- **Signature:** a script-like SVG path (hand-drawn look), `strokeDashoffset` over 1.6 s with a round cap.
- **Paper grain:** a light grain overlay canvas per stepped frame at low alpha.
- **Pitfalls:** 3D flattening with `overflow: hidden` on ancestors of turning pages; keep fonts loaded before measuring; each page must be readable when held (2.5 s or more); do not use real magazine brand names or logos.

## Sound plan
How each effect of the brief is covered:
- **A soft camera shutter as the cover appears:** `shutter` (soft) at `cover`.
- **A papery page turn with a gentle thump as each page lands:** `paper` + `thud` (soft) at `turn*`.
- **Light type clicks as titles and lines set:** `ticks` of `click` at `page*`.
- **A soft swish as each image slides in:** `swish` at `page*+0.3`.
- **A warm little chime on the back page:** `chime` at the last `page`.
- **A fountain-pen scratch as the signature writes:** `scratch` at `sign`.
- **A camera flash pop at the very end:** `pop` (bright) + `sparkle` at `flash`.
```json cues
[
  {"at": "cover", "kind": "shutter", "vol": 0.6},
  {"at": "turn*", "kind": "paper", "dur": 0.5, "vol": 0.55},
  {"at": "turn*+0.45", "kind": "thud", "freq": 110, "dur": 0.14, "vol": 0.4},
  {"at": "page*", "kind": "ticks", "n": 6, "span": 0.5, "tick": "click", "f0": 1300, "f1": 1700, "vol": 0.3},
  {"at": "page*+0.3", "kind": "swish", "dur": 0.25, "vol": 0.3},
  {"at": "page3", "kind": "chime", "freq": 1568, "dur": 1.4, "vol": 0.4},
  {"at": "sign", "kind": "scratch", "dur": 1.6, "freq": 2600, "jitter": 0.4, "vol": 0.3},
  {"at": "flash", "kind": "pop", "freq": 1200, "rise": 1.4, "dur": 0.08, "vol": 0.7},
  {"at": "flash", "kind": "sparkle", "dur": 0.5, "vol": 0.3}
]
```
```json music
{"preset": "jazz-slow", "bpm": 100, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16 / 4:5:** a single tall page fills the frame; the cover masthead across the top third; project pages stack image above text.
- **16:9:** open two-page spreads (image left, text right, or the reverse) turning like a book.
- **1:1:** a single page lying at an angle on the desk with the dark desk visible around it.

## Loop & ending
After the flash the last page settles and the frame returns to the closed cover on the dark desk (frame 0).

## Guardrails
- Calm and elegant: generous white space, thin rules and only one spot colour used sparingly.
- Hold each page long enough to read the title.
- Use the user's portrait and project images when attached; otherwise tasteful flat editorial stand-ins.
- No real magazine names or logos.

## QA
- Frame at `cover + 1 s`: masthead readable, portrait overlapping the letters, accent circle behind.
- Frame at `turn1 + 0.5 s`: mid-curl with a soft shadow on the page below; at `page1 + 1.5 s`: spread fully set.
- Frame at `sign + 1.6 s`: signature complete on the back page with contact rows readable.
