---
name: comic-pop-art
title: Comic pop art
description: A comic book page in pop-art style: bold black outlines, flat colours and Ben-Day halftone dots; three or four panels slam in with camera shakes, speech and thought bubbles, a big POW burst and a diagonal colour wipe. For promos, product reveals, hooks and playful announcements.
tags: ["promo","retro","text"]
library: GSAP
sound: true
difficulty: 4
default_duration: 10
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Comic pop art

**One-liner:** off-white paper, thick black outlines, flat comic colours and halftone dots; the message becomes a tiny story in 3 or 4 slanted panels that slide in fast and slam into place with a shake: a speech bubble opens, a thought bubble asks the question, the product is revealed with action lines, and the key line smashes in inside a huge burst before a diagonal colour wipe clears the page.
**Best for:** product reveals, promos, hooks with a problem and answer, playful launches.
**Avoid when:** the tone is calm or serious.

## Inputs to gather
- Opening line, the question/problem line, the answer/key line, and the subject or product to draw (simple cartoon). Sound-word choice ("POW!", "WOW!"). Brand colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A comic page in pop-art style: bold black outlines, flat colours, Ben-Day halftone dots on off-white paper | SVG with `stroke #16161b` 6 px; halftone via a repeating dot `pattern` (or canvas dots) with size by a gradient mask |
| L2 | Turn the message into three or four comic panels with slanted gutters; each slides in fast and slams into place with a quick camera shake | Panels as clipped polygons (`clip-path: polygon`); slide `x` with `power4.in`, then `MP.shake` decaying |
| L3 | Tell it like a tiny story: a speech bubble for the opening line, a cloud-shaped thought bubble for the question or problem, then the answer | Bubble SVGs (tails); thought bubble = scalloped cloud with small circles trail |
| L4 | Draw the product or subject in simple cartoon style with thick outlines and dot shading; a big reveal: it pops open or jumps into view with radiating action lines | `subject()` SVG; reveal spring; action lines as radial rects rotating in |
| L5 | Jagged burst shapes with sound words like "POW!" or "WOW!"; end with the key line in a huge burst smashing over the page with a hard shake | Star-burst polygon (spiky) with heavy outline; text rotated; scale from 3 to 1 with hard shake |
| L6 | Keep things alive while they hold: bubbles pop in, small shapes wobble in steps like hand-drawn frames; clear the page with a bold diagonal colour wipe at the end | Stepped wobble via `MP.nudge(t, {fps: 8})`; final wipe = skewed rect sweeping |
| L7 | Keep every line of text short and readable in a second | Max 4 words per bubble |
| T1 | Bold hand-lettered comic font (Bangers) all caps with thick black outlines and a hard offset shadow on the big words | Bangers 400, `-webkit-text-stroke`, offset shadow layers |
| T2 | Brand colours if given, else comic red, sunny yellow, sky cyan, ink black, off-white paper | Tokens below |
| S1 | Fast cartoon whoosh as each panel slides in and a heavy slam with a rattly shake when it lands, a buzzy megaphone blare, a pop per bubble, bubbly blips for the thought dots, a slide whistle for the "?!", a wooden rattle as the box wobbles, a cork pop as the lid flies off with a sparkly rise, a big "POW" punch with a crash cymbal, an even bigger smash for the final burst, a bouncy "bwop" on each pulse, a halftone whoosh for the wipe | Cue table below |
| S2 | Playful cartoon bed about 100 bpm with the panel slams on the beat: bouncy tuba-style bass, light kick, snare, woodblock, soft organ chord, short horn stabs; ends on a little "ta-da" before the wipe; loops | `cartoon` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 10` |
| O3 | GSAP + SVG HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #fbf1dc;
--ink: #16161b;
--accent: #e8262b;
--yellow: #ffd21f;
--cyan: #27b1e6;
```
```json fonts
[{"family": "Bangers", "id": "bangers", "weights": [400], "role": "all lettering"}]
```

## Beat sheet
Panel slams land on the beat (100 bpm, one panel per 2 beats).
```json beats
{"bpm": 100, "events": [
  {"id": "panel", "repeat": {"n": 3, "fromBeat": 0, "everyBeat": 4}, "label": "panel slams in"},
  {"id": "bubble", "repeat": {"n": 3, "fromBeat": 1, "everyBeat": 4}, "label": "bubble pops"},
  {"id": "wobble", "at": 0.55, "label": "product box wobbles"},
  {"id": "reveal", "at": 0.62, "label": "lid flies off, product jumps out"},
  {"id": "pow", "at": 0.7, "label": "POW burst"},
  {"id": "final", "at": 0.8, "label": "key line in a huge burst"},
  {"id": "pulse", "repeat": {"n": 2, "fromFrac": 0.84, "everyFrac": 0.04}, "label": "burst pulses"},
  {"id": "tada", "at": 0.9, "label": "ta-da"},
  {"id": "wipe", "at": 0.93, "label": "diagonal colour wipe"}
]}
```

## Build recipe
- **Halftone:** use an SVG `<pattern>` of circles with radius modulated by a linear gradient (via a mask that uses a repeating-radial or a rotated dot grid at 45 degrees, spacing 14 px); apply to shadows and skin areas of the subject.
- **Panels:** three quadrilaterals with slanted gutters (white 10 px); each panel's content is a group clipped to its polygon. Slam: from `x = +-W`, `power4.in` 0.18 s, then the shake `MP.shake(t - T.panelK, {amp: 14, decay: 12})` applied to the page group.
- **Bubbles:** `path` for the speech bubble with a tail toward the character; thought cloud from 8 overlapping circles + 3 trail dots; text via `MP.fitLine`.
- **Stepped life:** wobbling shapes use `MP.nudge(t, {fps: 8, amp: 2.5})`; do not tween continuously.
- **Burst:** 14 to 18 spikes with alternating radii; thick outline; text over it slightly rotated (-6 degrees).
- **Pitfalls:** flat colours only (no gradients besides the halftone mask); shake affects the page group, not each element; keep flashes out (the wipe is a solid colour sweep).

## Sound plan
How each effect of the brief is covered:
- **A fast cartoon whoosh as each panel slides in and a heavy slam with a rattly shake when it lands:** `whoosh` + `impact` (short) + `crackle` (rattle) at `panel*`.
- **A buzzy megaphone blare:** `buzz` (high, short) at the opening `bubble1`.
- **A pop for each bubble:** `pop` at `bubble*`.
- **Bubbly blips for the thought dots:** `ticks` of `pop`/`blip` at `bubble2`.
- **A slide whistle for the "?!":** `chirp` rising at `bubble2+0.5`.
- **A wooden rattle as the box wobbles:** `repeat` of `knock` at `wobble`.
- **A cork pop as the lid flies off with a sparkly rise:** `pop` (low) + `sparkle` at `reveal`.
- **A big "POW" punch with a crash cymbal, an even bigger smash for the final burst:** `impact` + `crash` at `pow` and `final`.
- **A bouncy "bwop" on each pulse:** `boop` at `pulse*`.
- **A halftone whoosh for the wipe:** `whoosh` at `wipe`.
```json cues
[
  {"at": "panel*-0.15", "kind": "whoosh", "dir": "up", "dur": 0.2, "vol": 0.55},
  {"at": "panel*", "kind": "impact", "dur": 0.5, "freq": 70, "vol": 0.7},
  {"at": "panel*", "kind": "crackle", "dur": 0.3, "density": 80, "vol": 0.35},
  {"at": "bubble1", "kind": "buzz", "freq": 240, "dur": 0.5, "vol": 0.4},
  {"at": "bubble*", "kind": "pop", "freq": 560, "vol": 0.75},
  {"at": "bubble2+0.15", "kind": "ticks", "n": 3, "span": 0.3, "tick": "blip", "f0": 700, "f1": 1000, "vol": 0.4},
  {"at": "bubble2+0.6", "kind": "chirp", "f0": 400, "f1": 1800, "dur": 0.45, "vol": 0.5},
  {"at": "wobble", "kind": "repeat", "every": 0.07, "times": 6, "of": {"kind": "knock", "freq": 500, "dur": 0.06, "vol": 0.4}},
  {"at": "reveal", "kind": "pop", "freq": 240, "rise": 2.2, "dur": 0.15, "vol": 0.9},
  {"at": "reveal", "kind": "sparkle", "dur": 0.9, "vol": 0.4},
  {"at": "pow", "kind": "impact", "dur": 0.9, "freq": 60, "vol": 0.95},
  {"at": "pow", "kind": "crash", "dur": 1.2, "vol": 0.5},
  {"at": "final", "kind": "impact", "dur": 1.1, "freq": 50, "vol": 1.0},
  {"at": "final", "kind": "crash", "dur": 1.6, "vol": 0.6},
  {"at": "pulse*", "kind": "boop", "freq": 300, "vol": 0.6},
  {"at": "wipe", "kind": "whoosh", "dir": "up", "dur": 0.5, "vol": 0.6}
]
```
```json music
{"preset": "cartoon", "bpm": 100, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16:** panels stacked vertically (3 rows) with slanted gutters; bubbles near panel corners; final burst centred.
- **16:9:** panels arranged in a slanted grid (2 top, 1 wide bottom).
- **1:1 / 4:5:** 2 by 2 grid or 3 stacked panels.

## Loop & ending
The diagonal colour wipe covers the page then reveals the plain off-white paper (frame 0) before panel 1 slams in.

## Guardrails
- Keep every line of text short and readable in a second.
- Flat colours and bold outlines; no gradients or soft shadows besides the halftone dots.
- Shakes are brief and belong to the page; no strobing flashes.

## QA
- Frame at `panel1 + 0.25 s`: panel settled with visible outlines and halftone.
- Frame at `final + 0.3 s`: key line readable inside the burst, shake offset visible.
- Frame at `wipe + 0.25 s`: diagonal band crossing the page.
- Audio: slams sit on beats 1 of each bar (grid check in the spectrogram).
