---
name: retro-synthwave
title: Retro synthwave
description: An 80s outrun night scene: a neon grid scrolling toward you, a striped setting sun, wireframe mountains, twinkling stars and a chrome headline with CRT scanlines and a VHS colour bleed. For music, gaming, retro brands, events and title cards.
tags: ["retro","background"]
library: Canvas
sound: true
difficulty: 3
default_duration: 8
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Retro synthwave

**One-liner:** a glowing magenta grid floor scrolls steadily toward the viewer into a hazy horizon; a big sun (yellow to hot pink, with stripes sliding down its lower half) sits on the horizon between dark cyan wireframe mountains; stars twinkle; your headline sits above the sun as a chrome logo with scanlines and a red-cyan fringe; once per loop a faint tape-tracking band rolls down.
**Best for:** music releases, gaming, retro or nightlife brands, event titles, loops behind a logo.
**Avoid when:** the tone must be modern minimal or corporate.

## Inputs to gather
- Headline or brand name (short, capitals). Brand colours (replace magenta, cyan and the sun gradient).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | An 80s outrun night scene: a glowing neon grid floor scrolls steadily toward the viewer and fades into a hazy horizon | Canvas perspective grid: horizontal lines at `z` positions moving with `t`, vertical lines converging to a vanishing point; alpha fades toward the horizon |
| L2 | A big setting sun on the horizon, yellow at the top to hot pink at the bottom, with horizontal stripes through its lower half that slowly slide down | Circle with a vertical gradient; stripe bars (increasing thickness) masked out of the lower half, offset `y` by `t` (looping by modulo) |
| L3 | Dark wireframe mountains on both sides, low in the middle so the sun stays visible; a starfield twinkles above | Seeded ridge polylines (cyan strokes, dark fill); stars with twinkle `0.5 + 0.5 * sin(t * f + phase)` |
| L4 | The message or brand name above the sun as a big chrome headline: bright sky blue on top, a dark line through the middle, warm pink below, thin white edge, deep shadow and soft pink glow; it stays still and easy to read | Text drawn to a canvas with a vertical gradient fill (blue, dark band, pink), white stroke, shadow and glow layers |
| L5 | Subtle CRT scanlines and a slight VHS colour bleed (red and cyan fringe on the headline); once per loop a faint tape tracking band rolls down and makes the headline wobble for a moment | Scanline overlay every 3 px at 8% alpha; draw the headline three times with +-2 px red/cyan offsets; tracking band = a translucent band at `y(t)` with local horizontal displacement of the headline rows |
| L6 | Smooth, steady motion so it loops cleanly | Grid scroll period = one grid cell per beat; all animations periodic in `D` |
| T1 | Wide heavy futuristic capitals (Orbitron Black), leaning forward like an 80s logo | Orbitron 900, `skewX(-8deg)` |
| T2 | Brand colours if given, else deep purple night, hot magenta grid, electric cyan mountains, sun from yellow to pink | Tokens below |
| S1 | A deep soft road whoosh swelling each time a grid line sweeps under the camera; a bright detuned synth chord sting with glassy shimmer when the headline shows at the start; a tape tracking warble while the band rolls (pitch wobble, flutter, hiss, a tape chirp at start and end) | Cue table below |
| S2 | 80s outrun synthwave at 120 bpm, one beat per grid line: punchy kick, big gated snare, off-beat hats, pulsing octave bass arpeggio, lush detuned pads, small echoing lead arpeggio in a minor key | `synthwave` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 8` |
| O3 | An HTML canvas animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #12042b;
--ink: #ffffff;
--accent: #ff2bd6;
--cyan: #2de2ff;
--sun-top: #fff36b;
--sun-bottom: #ff4f8b;
```
```json fonts
[{"family": "Orbitron", "id": "orbitron", "variable": true, "weightRange": "400 900", "role": "chrome headline"}]
```

## Beat sheet
Tempo 120 bpm: one grid line passes per beat, so `D = 8 s` is 16 lines. The tracking band happens once.
```json beats
{"bpm": 120, "events": [
  {"id": "sting", "at": 0.0, "label": "headline appears, chord sting"},
  {"id": "line", "repeat": {"n": 16, "fromBeat": 0, "everyBeat": 1}, "label": "a grid line sweeps under the camera"},
  {"id": "band", "at": 0.55, "label": "tape tracking band rolls down"},
  {"id": "bandend", "at": 0.68, "label": "band leaves"}
]}
```
Set the `line` repeat count to `D * bpm / 60` for other lengths.

## Build recipe
- **Grid scroll:** line k is at depth `z = ((k - t * speed) mod N) / N`; project `y = horizon + (H - horizon) * z^2`; choose `speed` so one grid cell per beat passes (`speed = BPM / 60 cells per second`) which also makes the scroll loop exactly.
- **Sun (verified against the site sample):** radius `R = 0.30 W`, centre `sunY = HOR - 0.96 R` so the disc sits on the horizon; 3-stop gradient (top `--sun-top`, mid `#ffb14a`, bottom `--sun-bottom`). Stripes: `destination-out` bars on an offscreen sun canvas, pitch 32 px, start at 55% of the diameter, thickness `3 + k*22` px (bold near the bottom), sliding by `(t * 12) mod pitch` (8 s = 3 pitches, loops).
- **Mountains:** sample shows a few big jagged triangular peaks low in the middle, NOT dense fBm. Use `N = 12` points per side, alternate peak / valley (`peak ? 0.55..1.0 : 0.1..0.22` of height), height `20 + 190*smooth((edge-0.1)/0.75)`, dark fill + 3 px cyan edge. Raise heights if peaks look too small.
- **Chrome text:** fill with a 4-stop vertical gradient (sky blue to white, dark line, warm pink), stroke `#fff` 2 px, shadow blur 24 magenta; draw once to an offscreen canvas and reuse.
- **VHS bleed:** draw the offscreen headline three times: red at -3 px, cyan at +3 px with `lighter` composite, white centre. During the tracking band shift row slices by `noise1(row * 0.2 + t * 30) * 10` px.
- **Pitfalls:** no `Math.random`; keep the headline still; scanlines alpha low so it stays readable; keep the sun centred above the horizon in tall frames. **Headline sits ABOVE the sun** (block bottom = sun top - 3% H), never over it. Floor grid: thin lines (1.6 px), 80 horizontals at spacing 0.6, verticals every `W/10`, scanlines 20% alpha. Full-bleed canvas: add `data-layout-allow-overflow` so `hyperframes check` stays quiet.

## Sound plan
How each effect of the brief is covered:
- **A deep, soft road whoosh that swells each time a grid line sweeps under the camera:** a low `whoosh` at `line*` (soft, low vol).
- **A bright, detuned synth chord sting with a glassy shimmer when the chrome headline shows at the start:** `strings`-like `pad` chord plus `sparkle` at `sting`.
- **A tape tracking warble while the band rolls down (wobble in pitch, a flutter, a little hiss, a tape chirp as it starts and ends):** `tapewarble` + `hiss` across `band`, `chirp` at both ends.
```json cues
[
  {"at": "sting", "kind": "pad", "notes": ["A3", "C4", "E4", "A4"], "dur": 2.2, "attack": 0.02, "vol": 0.7, "verb": 0.4},
  {"at": "sting", "kind": "sparkle", "dur": 1.2, "lo": 3500, "hi": 9000, "vol": 0.4},
  {"at": "line*", "kind": "whoosh", "dir": "peak", "dur": 0.4, "f0": 120, "f1": 700, "vol": 0.28},
  {"at": "band", "kind": "chirp", "f0": 400, "f1": 1500, "dur": 0.15, "vol": 0.4},
  {"at": "band", "kind": "tapewarble", "dur": 1.0, "vol": 0.55},
  {"at": "band", "kind": "hiss", "dur": 1.0, "hp": 4500, "vol": 0.2},
  {"at": "bandend", "kind": "chirp", "f0": 1500, "f1": 400, "dur": 0.15, "vol": 0.4}
]
```
```json music
{"preset": "synthwave", "bpm": 120, "gain": 1, "duck": 0.4}
```

## Layout by aspect ratio
- **16:9:** sun centred on the horizon at 45% height, headline above it.
- **9:16 / 4:5:** horizon at 60% height, sun larger, headline in the upper third inside the safe area, grid fills the lower 40%.
- **1:1:** horizon at 55%.

## Loop & ending
Every animated value is periodic in `D` (grid scroll in whole cells per beat, stripes by modulo, stars by sine at whole-number cycles), so the last frame flows into the first.

## Guardrails
- Keep the motion smooth and steady so it loops cleanly; the headline stays still and easy to read.
- Keep the scanlines and colour fringe subtle: the tracking band is faint and happens once per loop.
- The sun stays visible: mountains are low in the middle.

## QA
- Frame at `line5` and `line6`: grid lines shifted by exactly one cell.
- Headline legible with fringe; frame at `band + 0.3 s` shows the wobble and band, and it is gone by `bandend + 0.2 s`.
- Loop check: frame 0 versus frame `D - 1/fps` differ by one small step (no jump).
- Audio: kick on each grid line; the warble occurs only during the band.
