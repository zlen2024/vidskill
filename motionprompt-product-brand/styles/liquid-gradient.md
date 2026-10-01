---
name: liquid-gradient
title: Liquid gradient
description: Soft colour blobs that drift, stretch and melt into each other under fine film grain, while a clean headline fades in from a blur, holds, and blurs away into the next line. For keynote-style statements, launches, quotes and backgrounds with a headline.
tags: ["background","text"]
library: WebGL
sound: true
difficulty: 3
default_duration: 10
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Liquid gradient

**One-liner:** a full-screen mesh-gradient made of slowly moving blobs (deep indigo base with violet, pink, apricot and sky blue), fine grain and darkened corners; one big clean headline at a time fades in from a soft blur, holds, and blurs out before the next line.
**Best for:** a product-launch statement, a calm brand message, a quote, an ambient loop under text. Two or three short lines total.
**Avoid when:** you need lots of information or strong contrast between objects.

## Inputs to gather
- Two or three short lines (sentence case). Brand colours (darkest for the base, others for blobs, a light one for text).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A full screen of soft colour blobs that slowly drift, stretch and melt into each other, like a mesh gradient | Fragment shader: 4 to 5 metaball-like colour fields whose centres move by smooth noise of `u_time`, blended by inverse-distance weights |
| L2 | Calm and continuous movement: no sharp edges and nothing that pulls focus from the words | Low frequencies (about 0.05 to 0.15 Hz); no hard shapes; blur is built into the field |
| L3 | Fine film grain over everything and a gentle darkening at the corners, so it feels rich, not flat | Grain in the shader (hash noise per stepped frame), or an overlay canvas; vignette in the shader |
| L4 | One big clean headline in the centre: fades in from a soft blur, holds for a few seconds, blurs away and gives way to the next line; two or three short lines in total | DOM lines stacked centred; each: `filter: blur(24px) to 0`, `opacity 0 to 1`, hold, then reverse |
| L5 | Plenty of space around the text so it stays readable | Max width 70%, generous padding; contrast check against the local background |
| T1 | Clean modern sans (Inter Tight), semibold, tight letter spacing, sentence case | Inter Tight 600 with `letter-spacing: -0.02em` |
| T2 | Brand colours if given (darkest for base, the others for blobs, a light one for the text), else deep indigo base, violet, pink, apricot, sky blue and warm white text | Tokens below |
| S1 | Slow soft swells of air and faint high shimmers as colours drift, a soft reverse swell rising into each headline and blooming into a gentle bell chord as the words come clear, a quiet breath out as each line blurs away | Cue table below |
| S2 | Dreamy ambient bed, calm like a keynote: slow evolving pads, a soft low sub note, sparse glassy notes with gentle echo; quiet; loops | `ambient-dreamy` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 10` |
| O3 | WebGL shader HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #120d33;
--ink: #fff8f0;
--accent: #6c4bff;
--pink: #ff5fa2;
--apricot: #ff9a62;
--sky: #3fc8ff;
```
```json fonts
[{"family": "Inter Tight", "id": "inter-tight", "variable": true, "weightRange": "100 900", "role": "headline"}]
```

## Beat sheet
```json beats
{"bpm": 0, "events": [
  {"id": "start", "at": 0.0, "label": "gradient already moving"},
  {"id": "line", "repeat": {"n": 3, "fromFrac": 0.08, "everyFrac": 0.3}, "label": "each headline fades in from blur"},
  {"id": "hold", "repeat": {"n": 3, "fromFrac": 0.16, "everyFrac": 0.3}, "label": "headline fully clear"},
  {"id": "out", "repeat": {"n": 3, "fromFrac": 0.32, "everyFrac": 0.3}, "label": "headline blurs away"}
]}
```

## Build recipe
- **Shader:** one full-frame quad; uniforms `u_time`, `u_res`, colours. For each of 5 centres `c_i(t) = base_i + amp * (sin(t*f_i + p_i), cos(t*g_i + q_i))`; colour = sum(color_i * w_i) / sum(w_i) with `w_i = 1 / (0.05 + dist^2)`; add a large-scale domain warp for the melting look. Render inside `hf-seek`: set `u_time` from the seek time and call `gl.drawArrays` once.
- **Determinism:** no `performance.now`; grain seeds from the stepped frame index; `preserveDrawingBuffer` true if you read pixels; set `renderer/canvas` size to the composition size and DPR 1.
- **Headline:** keep it in DOM above the canvas (crisp text); animate `filter: blur()` and `opacity` with GSAP. Only one headline visible at a time.
- **Fallback:** if WebGL is unavailable in the check (`no gpu`), a Canvas 2D version using blurred radial gradients is acceptable.
- **Pitfalls:** avoid banding (add dithering noise before output); do not exceed 6 colour fields (speed); keep text out of the extreme corners (vignette).

## Sound plan
How each effect of the brief is covered:
- **Slow soft swells of air and faint high shimmers as the colours drift:** `swell` at `start` and a sparse `sparkle` bed.
- **A soft reverse swell that rises into each headline and blooms into a gentle bell chord as the words come clear:** `riser` (reverse-cymbal style) into `line*`, then `run` of `bell`/`chime` notes at `hold*`.
- **A quiet breath out as each line blurs away:** `wind` (short, soft) at `out*`.
```json cues
[
  {"at": "start", "kind": "swell", "dur": 2.4, "freq": 600, "vol": 0.4},
  {"at": "start+2", "kind": "sparkle", "dur": 1.2, "lo": 4500, "hi": 9000, "vol": 0.18},
  {"at": "line*-0.9", "kind": "riser", "dur": 0.9, "f0": 300, "f1": 4500, "tone": 0.2, "vol": 0.4},
  {"at": "hold*", "kind": "run", "inst": "bell", "from": "D4", "n": 3, "dt": 0.09, "scale": "major", "len": 2.4, "vol": 0.45},
  {"at": "out*", "kind": "wind", "dur": 0.9, "vol": 0.3}
]
```
```json music
{"preset": "ambient-dreamy", "bpm": 60, "gain": 1, "duck": 0.35}
```

## Layout by aspect ratio
- All ratios: headline centred; in 9:16 keep it in the middle band between the safe margins and wrap to 3 lines; in 16:9 one or two lines.
- The shader adapts to the aspect (scale the noise domain by `u_res.x / u_res.y`).

## Loop & ending
The last headline blurs away leaving the gradient alone; since the field is periodic in `t`, choose blob frequencies as multiples of `1/D` so the field at `D` equals the field at 0 (seamless loop).

## Guardrails
- Calm, continuous movement: no sharp edges and nothing that pulls focus from the words.
- Add a fine film grain over everything and a gentle darkening at the corners, so it feels rich, not flat: grain and vignette are always on.
- Two or three short lines in total, with plenty of space around the text.

## QA
- Frame at each `hold`: one headline, sharp, readable (`npm run check` contrast passes).
- Frame at `out + 0.3 s`: headline mostly blurred; the next has not started.
- Frame 0 and frame `D` look the same (periodic field).
- No visible banding in a dark area; grain visible at 100% zoom.
