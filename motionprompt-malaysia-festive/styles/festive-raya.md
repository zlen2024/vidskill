---
name: festive-raya
title: Festive Raya
description: A warm Hari Raya greeting at night: gold Islamic geometric patterns draw line by line, ketupat and lanterns sway, pelita flicker along the bottom, distant fireworks glint, and the greeting rises in gold under a crescent moon. For Raya wishes and festive brand greetings (no people, no Quranic text).
tags: ["festive","malaysia","text"]
library: GSAP
sound: true
difficulty: 4
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
hidden: true
---
# Festive Raya

**One-liner:** a deep green night sky turning gold at the horizon with a thin crescent moon; gold eight-point-star patterns draw themselves behind the words and turn slowly; hanging ketupat and lanterns sway; pelita flicker below in front of a palm-and-mosque skyline; small fireworks burst in the distance; the greeting rises in gold with a shine.
**Best for:** Selamat Hari Raya greetings, festive brand wishes, family and community messages.
**Avoid when:** the message needs people, religious text or a non-festive tone. See `rules/malaysian-styles.md`. Hidden on the site but fully supported.

## Inputs to gather
- The greeting ("Selamat Hari Raya" or user text) and a short friendly line. Language used by the user. Brand colours (gold accent stays).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A warm festive greeting at night: deep green sky turning golden near the horizon, a thin crescent moon at the top | Gradient background; crescent = two circles (mask) with a soft glow |
| L2 | Gold Islamic geometric patterns (eight-point stars and star-and-cross tiling) draw line by line behind the words, then turn very slowly | Generate the tiling as SVG paths (rotating squares forming 8-point stars); `strokeDashoffset` staggered by distance from the centre; slow `rotation` |
| L3 | Hanging ketupat and glowing lanterns sway from the top; a row of pelita (bamboo oil lamps) flickers along the bottom in front of a dark skyline of palms and a distant mosque | Ketupat = diamond weave SVG; lanterns; pelita flames = small teardrop paths with flicker from `MP.noise1`; skyline silhouette path |
| L4 | Small fireworks burst quietly in the distance; little gold glints twinkle around the words | Fireworks: seeded radial particle bursts computed from `t - burstTime`; glints = star sprites twinkling |
| L5 | The greeting rises in with its letters closing together, in gold, then a soft shine sweeps across; a short friendly line fades in below | `letterSpacing` animates from wide to normal + `y` rise; shine = gradient bar clipped to text; second line `opacity` |
| L6 | Write the text in the user's language; keep it readable and clear of lamps and decorations | Text zone kept free by layout; decorations offset from it |
| L7 | Keep it respectful: no Quranic text and no people; at the end the words and patterns fade while the lamps keep glowing | Only glyph-free geometry; fade text and patterns, keep pelita |
| T1 | Elegant classical display capitals (Cinzel) for the greeting; friendly rounded sans (Quicksand) for the short line | Cinzel 600/700, Quicksand 500 |
| T2 | Brand colours if given, else deep emerald night, emerald, gold, light gold, cream | Tokens below |
| S1 | Soft crackles from the pelita flames throughout, a light leafy rustle as the ketupat swing, an airy shimmer with a rising chime for each ring and star as the pattern draws, a warm bloom as the greeting rises, bright bells following the shine, faint distant fireworks (whistle, soft thump, crackle) timed to each burst | Cue table below |
| S2 | Gentle joyful Raya feel about 80 bpm: kompang-style hand drums, warm plucked melody in a major key, soft accordion chords, round bass; calm; loops | `kompang-raya` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | GSAP HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #06261f;
--ink: #fbf1dc;
--accent: #e3b75a;
--accent2: #f5dc9a;
--emerald: #1f7a5a;
```
```json fonts
[
  {"family": "Cinzel", "id": "cinzel", "weights": [600, 700], "role": "greeting"},
  {"family": "Quicksand", "id": "quicksand", "variable": true, "weightRange": "300 700", "role": "short line"}
]
```

## Beat sheet
```json beats
{"bpm": 80, "events": [
  {"id": "sky", "at": 0.0, "label": "night sky, moon, skyline"},
  {"id": "ring", "repeat": {"n": 5, "fromFrac": 0.1, "everyFrac": 0.06}, "label": "pattern rings draw"},
  {"id": "sway", "at": 0.2, "label": "ketupat and lanterns swing in"},
  {"id": "burst", "repeat": {"n": 3, "fromFrac": 0.3, "everyFrac": 0.22}, "label": "distant fireworks"},
  {"id": "greeting", "at": 0.52, "label": "greeting rises in gold"},
  {"id": "shine", "at": 0.68, "label": "shine sweeps across the words"},
  {"id": "line", "at": 0.74, "label": "short line fades in"},
  {"id": "fade", "at": 0.92, "label": "words and patterns fade, lamps keep glowing"}
]}
```

## Build recipe
- **Pattern:** an eight-point star tile is two squares rotated 45 degrees; tile them on a grid with the inter-star crosses. Build once as an array of paths; draw order sorted by distance from the centre so it grows outward.
- **Flames:** each pelita flame is a teardrop path scaled by `1 + 0.06 * noise1(t * 9 + i)`; add a soft radial glow under it; light spill on the ground.
- **Fireworks:** particle positions `p = center + dir * v * age`, gravity `g * age^2`, alpha `1 - age/life`; seeded directions; keep them small and dim (distant).
- **Skyline:** draw palms and a mosque silhouette as simple paths at the bottom; nothing detailed or sacred: dome, minaret, crescent finial only.
- **Pitfalls:** never render Arabic verses or calligraphy; keep pattern strokes thin and gold; make sure the greeting sits above the lamps and below the moon.

## Sound plan
How each effect of the brief is covered:
- **Soft crackles from the pelita flames all the way through:** a `crackle` bed for the full length.
- **A light leafy rustle as the ketupat swing:** `paper` (soft) at `sway`.
- **An airy shimmer with a rising chime for each ring and star as the gold pattern draws:** `sparkle` + `chime` at `ring*` (rising pitch).
- **A warm bloom as the greeting rises in:** `swell` at `greeting`.
- **A run of bright bells that follows the shine across the words:** `run` of `chime` at `shine`.
- **Faint distant fireworks (a thin whistle, a soft thump and a sparkly crackle) timed to each burst:** `firework` at `burst*`, quiet.
```json cues
[
  {"at": "sky", "kind": "crackle", "dur": "D", "density": 18, "lo": 900, "hi": 4500, "vol": 0.22},
  {"at": "sway", "kind": "paper", "dur": 0.5, "vol": 0.3},
  {"at": "ring*", "kind": "chime", "freq": 880, "dur": 1.4, "vol": 0.4, "rise": {"param": "freq", "from": 880, "by": 110}},
  {"at": "ring*", "kind": "sparkle", "dur": 0.6, "vol": 0.25},
  {"at": "burst*", "kind": "firework", "vol": 0.35},
  {"at": "greeting", "kind": "swell", "dur": 1.4, "freq": 700, "vol": 0.5},
  {"at": "shine", "kind": "run", "inst": "chime", "from": "G5", "n": 6, "dt": 0.1, "scale": "major", "len": 1.4, "vol": 0.5},
  {"at": "line", "kind": "pop", "freq": 600, "vol": 0.4}
]
```
```json music
{"preset": "kompang-raya", "bpm": 80, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16:** moon at the top, patterns behind the greeting in the middle, lamps in the upper corners, skyline and pelita at the bottom above the safe zone.
- **16:9:** greeting centre, lanterns at both top corners, skyline across the bottom.
- **1:1 / 4:5:** greeting slightly above centre.

## Loop & ending
Words and patterns fade; pelita keep glowing under the night sky, which is frame 0 without the words.

## Guardrails
- Keep it respectful: no Quranic text and no people.
- Write the user's text in the language used; keep the words readable and clear of the lamps and decorations.
- Fireworks are small, distant and soft; keep any glow gentle and never flashing.

## QA
- Frame at `ring3 + 0.5 s`: pattern partially drawn from the centre outward.
- Frame at `greeting + 1.5 s`: greeting gold, fully legible, lamps below it, nothing overlapping.
- Frame at the end: text gone, lamps still flicker, moon visible.
- No Arabic script anywhere in the output.
