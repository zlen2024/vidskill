---
name: kawaii-pastel
title: Kawaii pastel
description: A cute chibi mascot girl waves hello among pastel stickers, hearts and sparkles while her message bounces in letter by letter in a rounded speech bubble. For friendly social posts, cute brands, greetings and promos.
tags: ["social","promo","cute"]
library: GSAP
sound: true
difficulty: 3
default_duration: 10
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"good"}
---
# Kawaii pastel

**One-liner:** a soft cartoon world in pastel: an original chibi girl mascot (big head, big sparkly eyes, rosy cheeks, small smile, hair with a bow) bounces in with squash and stretch, waves and blinks, surrounded by stickers, hearts and sparkles; her message pops out in a rounded speech bubble, letter by letter.
**Best for:** cute or wholesome brands, greetings, giveaways, kids and lifestyle posts, friendly announcements.
**Avoid when:** the brand is serious or corporate. Keep her wholesome and original (never a copy of a known character); if the user supplies their own mascot use it.

## Inputs to gather
- The message (short). The topic for stickers and props (cake, coffee, parcel...). A mascot description or image (optional). Brand colours (softened to pastels).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A cute soft cartoon world in chibi style; an original friendly girl mascot: big head, big sparkly eyes with white highlights, rosy blush cheeks, a small happy smile, simple hair with a bow; use the user's mascot instead if given | SVG `mascot()` built from circles/paths, no outlines except a soft dark plum edge; user image swaps the SVG |
| L2 | She bounces in with squash and stretch, waves, blinks, tilts her head, does little happy hops | `MP.spring` + `MP.squash` for landings; wave = arm `rotation` oscillation; blink = eyes `scaleY`; tilt = head `rotation` |
| L3 | A light background with soft pastel blobs, polka dots and small clouds that pop in at the start | Blobs (blurred circles) and dot grid; clouds pop with `back.out` |
| L4 | Stickers and props that fit the topic: flat cartoon shapes with a thick white outline and a soft drop shadow; some with tiny smiling faces | `sticker(svg)` wrapper: white stroke 14 px (paint-order stroke) + drop shadow; faces = two dots and a smile |
| L5 | Hearts, sparkles and stars pop in with a bouncy overshoot and float gently the whole time | Seeded positions; float by `sin`; twinkle by scale |
| L6 | The message sits in a rounded speech bubble next to her; the bubble pops in, then the letters bounce in one by one; a sparkle burst on the key moment | Bubble spring; `MP.splitText` letters with `back.out(3)` stagger; burst = 12 star sprites radiating |
| L7 | At the end everything bounces out and the scene clears | Reverse springs, stagger out |
| T1 | Big bubbly rounded font (Mochiy Pop One or Fredoka), letters in a few cheerful colours on the white bubble | Fredoka 700 (Mochiy Pop One optional); per-letter colour cycle |
| T2 | Brand colours softened to pastels, else creamy pink background, soft pink, lilac, mint, butter yellow, peach, dark plum outlines | Tokens below |
| S1 | Cute toy-like sounds timed to the motion: boing on landing, soft cartoon bounces per hop, wind chime twinkle on the wave, tiny tick on a blink, bubbly pops in different pitches per sticker, xylophone plinks rising a scale across the message, magical sparkle run for the burst, playful boops as everything bounces out | Cue table below |
| S2 | Sweet playful loop in a major key about 110 bpm: toy piano or music box melody, ukulele plucks, soft claps; quiet; loops | `kids-toy` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 10` |
| O3 | GSAP HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #fff0f4;
--ink: #4b2a3a;
--accent: #ff9cbf;
--lilac: #c3a8f5;
--mint: #a8e6cf;
--butter: #ffe07a;
--peach: #ffc4a8;
```
```json fonts
[
  {"family": "Fredoka", "id": "fredoka", "variable": true, "weightRange": "300 700", "axis": "wght", "role": "bubble text"},
  {"family": "Mochiy Pop One", "id": "mochiy-pop-one", "weights": [400], "role": "optional alternate bubble text"}
]
```

## Beat sheet
```json beats
{"bpm": 0, "events": [
  {"id": "bg", "at": 0.0, "label": "blobs, dots, clouds pop in"},
  {"id": "land", "at": 0.1, "label": "mascot lands (squash and stretch)"},
  {"id": "wave", "at": 0.22, "label": "waves hello"},
  {"id": "sticker", "repeat": {"n": 5, "fromFrac": 0.3, "everyFrac": 0.05}, "label": "stickers pop in"},
  {"id": "bubble", "at": 0.5, "label": "speech bubble pops"},
  {"id": "letter", "repeat": {"n": 12, "fromFrac": 0.55, "everyFrac": 0.02}, "label": "letters bounce in"},
  {"id": "burst", "at": 0.82, "label": "sparkle burst on the key moment"},
  {"id": "hop", "repeat": {"n": 2, "fromFrac": 0.62, "everyFrac": 0.12}, "label": "happy hops"},
  {"id": "out", "at": 0.92, "label": "everything bounces out"}
]}
```
Set the `letter` repeat `n` to the message length in characters (spaces excluded) and `everyFrac` so the message finishes by `burst`.

## Build recipe
- **Mascot:** head circle (large), hair shapes behind and above, bow, eyes as large ellipses with two white highlights, blush ellipses, mouth as a small arc; body tiny; arms as rounded rects. Layered as groups so wave/blink/tilt animate parts.
- **Squash and stretch:** `const v = MP.spring(t - T.land, {freq: 2.6, damping: 0.35}); const {sx, sy} = MP.squash(v, 0.35)`; apply via `gsap.set` inside `MP.onSeek` or precomputed keyframes with `tl.fromTo(..., {ease: "back.out"})`.
- **Stickers:** white outline via a wide white stroke behind the fill (`paint-order: stroke`), plus `filter: drop-shadow` on the group (limited count).
- **Bubble text:** wrap the message to 2 or 3 lines with `max-width`; per-letter colours cycle through `--accent --lilac --mint --butter`.
- **Pitfalls:** avoid `<br>`; do not animate blur; all bounces are springs of `t` (no `repeat: -1`); keep the mascot inside the frame during hops.

## Sound plan
Cute, bubbly, toy-like sounds timed to the motion. How each effect of the brief is covered:
- **Springy boing when the mascot lands and soft cartoon bounces for each hop:** `boing` at `land`; `boing` (soft) at `hop*`.
- **Little wind chime twinkle when she waves:** `sparkle` + `chime` at `wave`.
- **Tiny tick when she blinks:** `tick` at a couple of blink moments.
- **Bubbly pops in different pitches as each sticker and shape appears:** `pop` at `sticker*` with rising pitch.
- **Soft xylophone plinks for each letter that rise up a scale across the message:** `xylo` at `letter*` with rising note.
- **Magical sparkle run for the sparkle burst:** `run` of `glock` plus `sparkle` at `burst`.
- **Playful boops as everything bounces out:** `boop` repeats at `out`.
```json cues
[
  {"at": "bg", "kind": "pop", "freq": 600, "vol": 0.5},
  {"at": "land", "kind": "boing", "freq": 240, "dur": 0.55, "vol": 0.85},
  {"at": "wave", "kind": "sparkle", "dur": 0.7, "vol": 0.4},
  {"at": "wave", "kind": "chime", "freq": 1320, "dur": 1.2, "vol": 0.4},
  {"at": "hop*", "kind": "boing", "freq": 300, "dur": 0.35, "vol": 0.55},
  {"at": 0.34, "kind": "tick", "vol": 0.5},
  {"at": 0.6, "kind": "tick", "vol": 0.5},
  {"at": "sticker*", "kind": "pop", "freq": 500, "vol": 0.7, "rise": {"param": "freq", "from": 500, "by": 80}},
  {"at": "bubble", "kind": "pop", "freq": 420, "vol": 0.85},
  {"at": "letter*", "kind": "xylo", "note": "C6", "dur": 0.4, "vol": 0.55, "rise": {"param": "note", "from": 84, "by": 1}},
  {"at": "burst", "kind": "run", "inst": "glock", "from": "C6", "n": 8, "dt": 0.06, "len": 0.9, "vol": 0.55},
  {"at": "burst", "kind": "sparkle", "dur": 0.9, "vol": 0.5},
  {"at": "out", "kind": "repeat", "every": 0.12, "times": 6, "of": {"kind": "boop", "freq": 420, "vol": 0.55}}
]
```
The two `tick` cues at fractions 0.34 and 0.6 are the mascot's blinks: keep them in step with the blink times in the timeline.
```json music
{"preset": "kids-toy", "bpm": 110, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16 / 4:5:** mascot in the lower half, bubble above her; stickers frame the sides; stay inside `--safe-*`.
- **16:9:** mascot left third, bubble to the right.
- **1:1:** mascot lower left, bubble upper right.

## Loop & ending
Everything bounces out (stagger), leaving the pastel background; frame 0 is the same empty background before the blobs pop.

## Guardrails
- Keep her wholesome and original; use the user's own mascot if described or attached.
- Keep motion bouncy but not frantic; no strobing sparkles.
- Only colours from the softened pastel palette; dark plum only for outlines.

## QA
- Frame at `land + 0.15 s`: visibly squashed; at `land + 0.5 s`: settled with bow and highlights visible.
- Bubble text fully inside the bubble; letter colours cycle; sparkle burst radiates evenly at `burst`.
- Audio: xylophone notes climb across the message without clipping.
