---
name: app-showcase
title: App showcase
description: A floating 3D phone (or laptop) with app screens sliding like real navigation, UI cards popping out toward the camera and a tap ripple, with a calm premium SaaS-launch feel. For app launches, feature demos and software promos.
tags: ["product","3d"]
library: GSAP
sound: true
difficulty: 4
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# App showcase

**One-liner:** a modern phone floats, tilts and bobs in a soft lilac space; the app's screens slide from one to the next as if navigated, small UI cards pop out toward the camera with real depth, a fingertip taps a button with a ripple, and the headline stays clean beside or above the device.
**Best for:** an app or SaaS launch, a feature teaser, a product tour.
**Avoid when:** there is no product UI to show or you need a fast, loud tone.

## Inputs to gather
- Headline (with the key word to gradient) and 2 to 4 app screenshots in order (or the app's purpose so a believable screen can be drawn). Whether it is mobile (phone), web/desktop (laptop) or both. Brand colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A modern phone floats in 3D, gently tilting and bobbing with a soft shadow below; a laptop (or both) for a web or desktop app | CSS 3D device (`preserve-3d`), body = rounded rect with a bezel, `rotationX/Y` follow `sin(t)`; shadow = blurred ellipse |
| L2 | Use the attached screenshots as the screens in order; otherwise draw a clean believable screen with a header, a chart, a few list rows and a clear button | `<img>` in the screen, or SVG/HTML mock screen |
| L3 | Screens slide from one to the next like real navigation | Screens stacked; outgoing `xPercent -100`, incoming from `+100` inside an `overflow: hidden` screen |
| L4 | Small UI cards pop out of the screen toward the camera with real depth, float, then sink back (notification, chart card, profile card) | Cards as separate 3D layers with `translateZ` tweened 0 to 120 px, gentle float, back to 0 |
| L5 | A fingertip or cursor taps a button with a soft ripple, then the next screen slides in | Cursor/finger SVG moves to the button, press scale, ripple ring; navigation triggers 0.25 s later |
| L6 | Headline as still, readable text: above the device in tall frames, beside it in wide ones | DOM headline in `#text`; key word gradient via `background-clip: text` |
| L7 | Calm and premium like a SaaS launch; loop smoothly back to the first screen | Slow eases only; final navigation returns to screen 1 |
| T1 | Clean modern sans (Plus Jakarta Sans or Inter), extra bold headline, key word in a soft colour gradient | Plus Jakarta Sans 800 |
| T2 | Brand colours if given, else soft lilac backdrop with indigo and peach glows, deep ink text, indigo buttons/charts, peach highlights | Tokens below |
| S1 | Crisp soft click with a tiny water drop per tap and ripple, airy whoosh per screen slide, soft pop with a rising tone per card out and a softer falling one as it sinks, two-note chime for notification, bright ding for success; timed to the screen | Cue table below |
| S2 | Light optimistic tech launch beat about 110 bpm, soft four on the floor pulse, warm pad chords, small plucked synth tune; quiet; loops | `pop-modern` at 110, softened |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | GSAP + CSS 3D rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #f3f1ff;
--ink: #151632;
--accent: #5b5bf6;
--accent2: #ff8a65;
```
```json fonts
[
  {"family": "Plus Jakarta Sans", "id": "plus-jakarta-sans", "variable": true, "weightRange": "200 800", "role": "headline and UI"},
  {"family": "Inter", "id": "inter", "variable": true, "weightRange": "100 900", "role": "alternate for UI text"}
]
```

## Beat sheet
```json beats
{"bpm": 110, "events": [
  {"id": "intro", "at": 0.0, "label": "device floats in"},
  {"id": "tap", "repeat": {"n": 2, "fromFrac": 0.26, "everyFrac": 0.3}, "label": "fingertip taps a button"},
  {"id": "nav", "repeat": {"n": 2, "fromFrac": 0.29, "everyFrac": 0.3}, "label": "next screen slides in"},
  {"id": "card", "repeat": {"n": 3, "fromFrac": 0.4, "everyFrac": 0.07}, "label": "UI cards pop out"},
  {"id": "sink", "at": 0.66, "label": "cards sink back"},
  {"id": "note", "at": 0.5, "label": "notification chime"},
  {"id": "success", "at": 0.8, "label": "success message ding"},
  {"id": "loop", "at": 0.92, "label": "return to the first screen"}
]}
```

## Build recipe
- **Device:** `#device` with `transform-style: preserve-3d; perspective` on the parent; idle motion `rotationY = 10 * sin(t * 0.8)`, `rotationX = 4 * sin(t * 0.6)`, `y = 8 * sin(t * 1.1)`. All are direct functions of `t` inside an `MP.onSeek` or a proxy timeline; not `repeat: -1`.
- **Screens:** put each screen in an absolutely positioned layer inside a clipped screen; slide with `x`. Screenshots keep their aspect via `object-fit: cover`.
- **Cards depth:** separate elements with `translateZ`; add a soft `box-shadow` that grows with `z`. Keep cards inside the frame at maximum depth.
- **Tap ripple:** a circle at the tap point scaling 0 to 1.6 while fading; cursor eased in along a curved path.
- **Pitfalls:** 3D children of `overflow: hidden` flatten: apply the clip only to the inner screen, not to the device root; keep text as crisp DOM (not rasterised); headlines never overlap the device.

## Sound plan
Every sound is timed to its moment on screen. How each effect of the brief is covered:
- **Crisp soft click with a tiny water drop for each tap and ripple:** `click` + `drip` at `tap*`.
- **Smooth airy whoosh for each screen slide:** `whoosh` at `nav*`.
- **Soft pop with a small rising tone as each card comes out, a softer falling one as it sinks back:** `pop` at `card*`, reversed `pop` at `sink`.
- **Gentle two-note chime for a notification:** `run` of two `chime` notes at `note`.
- **Bright ding for a success message:** `ding` at `success`.
```json cues
[
  {"at": "intro", "kind": "swell", "dur": 1.2, "freq": 700, "vol": 0.4},
  {"at": "tap*", "kind": "click", "freq": 1600, "vol": 0.7},
  {"at": "tap*", "kind": "drip", "freq": 1100, "vol": 0.5},
  {"at": "nav*", "kind": "whoosh", "dir": "peak", "dur": 0.55, "vol": 0.45},
  {"at": "card*", "kind": "pop", "freq": 600, "rise": 1.7, "vol": 0.7},
  {"at": "note", "kind": "run", "inst": "chime", "from": "E5", "n": 2, "dt": 0.16, "len": 1.2, "vol": 0.55},
  {"at": "sink", "kind": "pop", "freq": 700, "rise": 0.6, "vol": 0.45},
  {"at": "success", "kind": "ding", "freq": 1760, "dur": 1.0, "vol": 0.7}
]
```
```json music
{"preset": "pop-modern", "bpm": 110, "gain": 1, "duck": 0.5, "layers": {
  "drums": {"kick": "x---x---x---x---", "clap": "", "openhat": "", "hat": "--x---x---x---x-", "lanes": {"hat": 0.3}, "vol": 0.5},
  "arp": {"voice": "pluck", "vol": 0.35}
}}
```

## Layout by aspect ratio
- **9:16 / 4:5:** headline above the device (top safe area), device centre-lower, cards pop inside the frame.
- **16:9:** headline on the left third, device right of centre (laptop centred if used).
- **1:1:** headline above, device below at 60% height.

## Loop & ending
The last navigation brings screen 1 back; the device settles to the same pose as frame 0, headline unchanged.

## Guardrails
- Keep it calm and premium: no fast shakes or hard cuts.
- Use the user's screenshots in the order given; do not invent product features or figures on drawn screens.
- Keep the headline still and readable; the key word only gets the gradient.

## QA
- Frame at `card2 + 0.5 s`: two cards visibly forward of the screen with shadow, device tilted slightly.
- Frame at `tap1 + 0.2 s`: ripple at the button, cursor over it.
- Headline contrast passes `npm run check`; no card clipped at the frame edge.
