---
name: merdeka
title: Merdeka
description: A proud Malaysian National Day and Malaysia Day celebration at night: the Jalur Gemilang waves over Kuala Lumpur fireworks, flag-colour stripes sweep as transitions, confetti bursts, and a bold title slams in letter by letter. For Hari Merdeka, Hari Malaysia and patriotic brand greetings.
tags: ["malaysia","festive","text"]
library: GSAP
sound: true
difficulty: 4
default_duration: 12
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
hidden: true
---
# Merdeka

**One-liner:** a night sky over a KL skyline silhouette (Petronas Twin Towers and KL Tower as simple dark shapes) with soft fireworks in flag colours; the Jalur Gemilang waves with real cloth ripples; red, white, blue and yellow stripes sweep across as opening and closing transitions; confetti bursts when the title lands and the title slams in letter by letter.
**Best for:** 31 August (Hari Merdeka) and 16 September (Hari Malaysia) greetings, national-pride brand posts.
**Avoid when:** the message is not about Malaysia's national celebrations. Draw the flag accurately (see recipe) and never alter its colours. See `rules/malaysian-styles.md`.

## Inputs to gather
- The title (short, e.g. "Selamat Hari Merdeka") and a small line. Language used. Brand colours (only for text/accents: the flag keeps its true colours).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A proud National Day (Hari Merdeka) or Malaysia Day celebration at night, with fireworks over a Kuala Lumpur skyline silhouette (Petronas Twin Towers and KL Tower as simple dark shapes) | Night gradient; skyline silhouette paths; fireworks particles |
| L2 | The Jalur Gemilang waves with a soft cloth ripple, light on the folds and shadow in the dips; drawn accurately: 14 horizontal stripes red and white starting with red at the top; a dark blue canton in the top left covers the upper 8 stripes and half the width; inside it a yellow crescent opening to the right and a yellow 14-pointed star beside it | Flag drawn as a grid of columns; each column offset by `sin(x * k - t * w)` and shaded by the derivative; exact geometry in the recipe |
| L3 | Open and close with bold red, white, blue and yellow stripes sweeping across the screen as transitions | Four coloured bars translating across at the start and the end |
| L4 | Fireworks bloom gently in flag colours and confetti in flag colours bursts in when the title lands; keep any glow soft, never flashing or strobing | Particle bursts (seeded), small alpha glows; confetti as rotating rects |
| L5 | The message is a big bold title that slams in letter by letter, with a small line under it between short flag-stripe bars; short easy-to-read text | Letters `scale 1.6 to 1`, `y -80 to 0`, `expo.out`, stagger; small line between two stripe bars |
| L6 | Write the text in the user's language (Malay or English) | `CONTENT.lang` |
| T1 | A tall bold condensed font (Bebas Neue) for the title; a clean bold sans (Montserrat) with wide letter spacing for the small line | Bebas Neue 400, Montserrat 700 tracking 0.3em |
| T2 | Brand colours if given (the flag always keeps its true colours), else flag red, white, royal blue, yellow and a night-sky navy | Tokens below |
| S1 | A bold whoosh for each stripe sweeping across, a snap and rush as the flag unfurls and a soft cloth flutter with every ripple, a punchy thump as each title letter slams down with a big drum hit on the last, two confetti cannon pops with a paper flutter, soft distant fireworks (rising hiss, gentle thump, light crackle) timed to each burst | Cue table below |
| S2 | A proud uplifting march about 120 bpm: crisp snare march rhythm, soft bass drum, brass-style chords climbing a step each bar, low brass bass, a snare roll leading back to the start; original, not any real anthem or song; loops | `march` preset (original) |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 12` |
| O3 | GSAP HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #0a0f45;
--ink: #ffffff;
--red: #cc0001;
--blue: #010066;
--accent: #ffcc00;
```
```json fonts
[
  {"family": "Bebas Neue", "id": "bebas-neue", "weights": [400], "role": "title"},
  {"family": "Montserrat", "id": "montserrat", "variable": true, "weightRange": "100 900", "role": "small line"}
]
```

## Beat sheet
```json beats
{"bpm": 120, "events": [
  {"id": "stripes", "at": 0.0, "label": "opening stripe transition"},
  {"id": "flag", "at": 0.1, "label": "flag unfurls"},
  {"id": "burst", "repeat": {"n": 4, "fromFrac": 0.2, "everyFrac": 0.16}, "label": "fireworks bursts"},
  {"id": "letter", "repeat": {"n": 10, "fromFrac": 0.5, "everyFrac": 0.02}, "label": "title letters slam"},
  {"id": "confetti", "at": 0.72, "label": "confetti cannons"},
  {"id": "line", "at": 0.78, "label": "small line appears"},
  {"id": "close", "at": 0.92, "label": "closing stripe transition"}
]}
```
Set the `letter` repeat to the title's character count (spaces skipped).

## Build recipe
- **Flag geometry (accurate):** flag ratio 1:2. 14 equal stripes, red at the top, alternating red/white (stripe 1 red ... stripe 14 white). The dark blue canton starts at the top-left and covers the upper 8 stripes in height and 1/2 of the flag width. In the canton: a yellow crescent opening toward the right and a yellow 14-pointed star to its right; centre the pair vertically in the canton, crescent outer radius about 0.42 of the canton height. Colours from the tokens; never tint them with brand colours.
- **Cloth wave:** render the flag as N vertical slices (about 90) drawn on a canvas; slice `i` is offset `dy = A * sin(i * 0.18 - t * 4) * (i / N)` (attached at the left), lit by the slope `cos(...)` (light on folds, shadow in dips: multiply with `rgba(0,0,0,0.25 * slope)`). Pole on the left; flag never crosses the title.
- **Skyline:** Petronas Twin Towers = two tall rounded-top towers with a sky bridge line and a spire, KL Tower = thin shaft with a bulb; simple dark shapes, no detail.
- **Stripes transition:** four full-height bars (red, white, blue, yellow) translating across with a 0.06 s stagger; solid fills only.
- **Pitfalls:** fireworks and confetti must stay soft (no full-frame flashes); the confetti uses seeded rotation and physics from `t - t0`.

## Sound plan
How each effect of the brief is covered:
- **A bold whoosh for each colour stripe as it sweeps across the screen:** `whoosh` (four, staggered) at `stripes` and `close`.
- **A snap and rush as the flag unfurls and a soft cloth flutter with every ripple:** `cloth` + `swish` at `flag`.
- **A punchy thump as each title letter slams down with a big drum hit on the last one:** `thud` at `letter*`, `drum`/`impact` on the final letter.
- **Two confetti cannon pops with a paper flutter:** two `cannon` + `paper` at `confetti`.
- **Soft distant fireworks (a rising hiss, a gentle thump and a light crackle) timed to each burst:** `firework` at `burst*` (quiet).
```json cues
[
  {"at": "stripes", "kind": "repeat", "every": 0.06, "times": 4, "of": {"kind": "whoosh", "dir": "up", "dur": 0.5, "f0": 200, "f1": 3000, "vol": 0.45}},
  {"at": "flag", "kind": "swish", "dur": 0.3, "vol": 0.6},
  {"at": "flag", "kind": "cloth", "dur": 1.0, "vol": 0.4},
  {"at": "burst*", "kind": "firework", "vol": 0.4},
  {"at": "letter*", "kind": "thud", "freq": 90, "dur": 0.2, "vol": 0.75},
  {"at": "letter10", "kind": "drum", "freq": 80, "dur": 0.4, "vol": 0.9},
  {"at": "confetti", "kind": "cannon", "vol": 0.8, "pan": -0.4},
  {"at": "confetti+0.12", "kind": "cannon", "vol": 0.8, "pan": 0.4},
  {"at": "confetti+0.2", "kind": "paper", "dur": 0.6, "vol": 0.4},
  {"at": "line", "kind": "pop", "freq": 700, "vol": 0.4},
  {"at": "close", "kind": "repeat", "every": 0.06, "times": 4, "of": {"kind": "whoosh", "dir": "up", "dur": 0.5, "f0": 200, "f1": 3000, "vol": 0.45}}
]
```
```json music
{"preset": "march", "bpm": 120, "key": "C", "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16:** skyline along the bottom third above the safe zone, flag in the upper third waving, title in the middle band, small line below.
- **16:9:** skyline across the bottom, flag top-left waving, title right of centre.
- **1:1 / 4:5:** flag top, title middle.

## Loop & ending
The closing stripe transition wipes to the night sky; frame 0 is the opening stripe transition, so the loop reads as a repeat.

## Guardrails
- Draw the flag accurately and always keep it in its true colours (14 stripes, canton over the upper 8 stripes and half the width, crescent and 14-pointed star).
- Keep any glow soft, never flashing or strobing.
- Make the music original, not any real anthem or song.
- Keep the text short and easy to read.

## QA
- Stripe count is exactly 14 and starts with red; canton covers 8 stripes; the star has 14 points.
- Frame at `letter5 + 0.3 s`: half the title landed; frame at `confetti + 0.6 s`: confetti in flag colours over the title without hiding it.
- Fireworks are dim and small; no frame-to-frame brightness jumps larger than 15%.
- Audio: march percussion present; the melody is not a recognisable existing tune.
