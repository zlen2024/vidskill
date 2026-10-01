---
name: particle-field
title: Particle field
description: Thousands of tiny glowing dots drifting along smooth invisible currents like smoke or wind, leaving soft fading trails that add up to a gentle glow, with a clean text line in the lower third. For calm backgrounds, meditation or wellness, tech ambience and text-over-motion loops.
tags: ["background"]
library: Canvas
sound: true
difficulty: 3
default_duration: 10
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Particle field

**One-liner:** a few thousand small glowing dots follow a smooth noise flow field (a slight upward drift like warm air rising); each leaves a soft fading trail and overlaps add up to gentle light; the flow changes slowly, so the scene feels calm and endless; your text is still and clean in the lower third with a soft glow, one line at a time.
**Best for:** backgrounds for text, wellness and meditation, tech and music ambience, loops that should feel endless.
**Avoid when:** you need objects, storytelling or structured information.

## Inputs to gather
- Optional lines of text (1 to 3, short). Brand colours (darkest for background, brighter for particles). If there is no text keep it as a pure background.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A few thousand tiny glowing dots drift along smooth, invisible currents like smoke or wind, with a slight upward drift like warm air rising | Flow field `v(x, y, t) = (cos(a), sin(a) - 0.25)` with `a = 2*PI * fbm2(x * s, y * s + t * k)`; particles' positions computed analytically (see recipe) |
| L2 | Each dot leaves a soft fading trail, and where dots overlap they add up to a gentle glow | Draw each trail as a short polyline of the last N points (evaluated from `t - i * dt`) with additive blending (`lighter`) and alpha fading along the trail |
| L3 | The currents change slowly, so the whole thing feels calm and endless, with no obvious start or end | Low field frequencies; time enters the noise slowly; seamless loop (circular time path); particle count constant |
| L4 | My message as still clean text in the lower third with a soft glow; several lines fade in and out one at a time; no text means a clean background | DOM text in the lower third; opacity in/out; glow via `text-shadow` |
| T1 | A clean sans serif, medium weight, generous spacing | Manrope 500, `letter-spacing: 0.06em` |
| T2 | Brand colours if given (darkest for the background, brighter for the particles), else deep night blue, coral, amber, cool blue particles, warm white text | Tokens below |
| S1 | Soft wind and air that rise and fall with the currents, faint granular sparkles across the field like tiny glints, a warm glow swell when the text appears | Cue table below |
| S2 | A meditative ambient drone bed about 60 bpm: a low steady drone, slow soft chords, a few gentle bells with a long echo; quiet; loops | `ambient-dreamy` preset at 60 bpm |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 10` |
| O3 | An HTML canvas animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #0a0d1a;
--ink: #f6f3ea;
--accent: #ff5a4e;
--amber: #ffb35c;
--cool: #4fb3ff;
```
```json fonts
[{"family": "Manrope", "id": "manrope", "variable": true, "weightRange": "200 800", "role": "text"}]
```

## Beat sheet
```json beats
{"bpm": 60, "events": [
  {"id": "start", "at": 0.0, "label": "field already drifting"},
  {"id": "line", "repeat": {"n": 2, "fromFrac": 0.15, "everyFrac": 0.4}, "label": "a text line fades in"},
  {"id": "out", "repeat": {"n": 2, "fromFrac": 0.4, "everyFrac": 0.4}, "label": "the line fades out"}
]}
```

## Build recipe
- **Stateless particles:** particle `i` has a seeded home `(x0, y0)` and phase. Position at time `t` is obtained by integrating the field from an earlier time in a fixed number of steps: `p = home; for k in 0..K: p += v(p, tK) * dt`, where `tK = t - (K - k) * dt` and `K = 40`, `dt = 0.06`. It costs K field evaluations per particle: with 2500 particles and K = 40 that is 100k evaluations per frame: keep the field cheap (2 octaves) and reuse the same points as the trail polyline (the same integration gives the whole trail).
- **Wrapping:** wrap positions with modulo of the frame so density stays constant; fade particles near their wrap.
- **Colour:** each particle picks one of three colours (seeded), alpha 0.35 head to 0 tail, `globalCompositeOperation = "lighter"`; a faint full-frame radial gradient for the ambient glow.
- **Seamless loop:** replace `t` in the field by `(cos(2*PI*t/D), sin(2*PI*t/D)) * r` (a circle in 2D noise time) so `t = D` equals `t = 0`.
- **Pitfalls:** limit particle count for render speed (2000 to 3500); use `lineWidth` 1 to 1.5; text stays in DOM above the canvas.

## Sound plan
How each effect of the brief is covered:
- **Soft wind and air that rise and fall with the currents:** `wind` bed for the full length, slowly modulated.
- **Faint granular sparkles scattered across the field like tiny glints of light:** sparse `sparkle` clusters throughout.
- **A warm glow swell when the text appears:** `swell` at `line*`.
```json cues
[
  {"at": "start", "kind": "wind", "dur": "D", "vol": 0.35},
  {"at": 0.15, "kind": "sparkle", "dur": 1.2, "lo": 3500, "hi": 9000, "vol": 0.18},
  {"at": 0.5, "kind": "sparkle", "dur": 1.2, "lo": 3500, "hi": 9000, "vol": 0.18},
  {"at": 0.8, "kind": "sparkle", "dur": 1.2, "lo": 3500, "hi": 9000, "vol": 0.18},
  {"at": "line*", "kind": "swell", "dur": 1.6, "freq": 700, "vol": 0.4}
]
```
```json music
{"preset": "ambient-dreamy", "bpm": 60, "gain": 1, "duck": 0.35}
```

## Layout by aspect ratio
- All ratios: text in the lower third inside `--safe-*` (in 9:16 keep it above the bottom UI zone); the field fills the full frame; scale the noise domain by the aspect so currents look uniform.

## Loop & ending
The field is periodic in `D` (circular time path), so the end flows into the start with no visible seam; text lines fade out before the end.

## Guardrails
- The currents change slowly, so the whole thing feels calm and endless, with no obvious start or end.
- If the request has no text, keep it as a clean background with no captions.
- Text is still, clean and readable with only a soft glow.

## QA
- Frame at `t = 0` and `t = D - 1/fps`: particle layout almost identical (loop check).
- Frame mid-line: text readable over the field (contrast passes).
- Trails are soft, no hard lines; overlapping regions glow without clipping to white.
