---
name: claymation
title: Claymation
description: A squishy handmade 3D clay world shot as choppy stop motion at 12 fps: matte lumpy clay pieces squish up, a round blob buddy crouches, hops and reacts, and the headline sits on a clay sign. For friendly brands, kids content, food and craft topics.
tags: ["3d","handmade","cute"]
library: Three.js
sound: true
difficulty: 5
default_duration: 12
ratios: {"9:16":"good","4:5":"great","1:1":"great","16:9":"great"}
---
# Claymation

**One-liner:** a small scene made of modelling clay (matte, rounded, a little lumpy, with faint fingerprints) lit softly from one side; pieces squish up from the ground or drop in with a jelly wobble, a cute blob character crouches, stretches, squashes and hops; everything moves at 12 fps with a tiny hand-nudge every frame; the headline is rolled clay letters on a clay sign.
**Best for:** friendly and handmade brands, kids, cafes and bakeries, craft, playful announcements.
**Avoid when:** you need a corporate, sleek or realistic look.

## Inputs to gather
- The headline (short) and the topic for the scene props (a bakery: oven, cupcakes, rolling pin). Character idea (default: round blob with dot eyes, rosy cheeks, small smile). Brand colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A soft 3D world that looks handmade from modelling clay, like stop motion: rounded, a little lumpy, matte, faint fingerprints | Three.js meshes from `SphereGeometry`/`CapsuleGeometry` with vertex noise displacement (seeded); `MeshStandardMaterial` roughness 0.9; a small bump/normal noise canvas texture for fingerprints |
| L2 | A small scene that fits the topic on a clay ground: chunky friendly objects; a cute clay character (round blob, dot eyes, rosy cheeks, small smile) who reacts | `make*()` per prop; `blob()` character |
| L3 | Warm, soft light from one side with gentle soft shadows under everything | One warm directional light + hemisphere fill; shadows on with soft PCF radius or blob shadows |
| L4 | Squash and stretch: pieces squish up out of the ground or drop in and land with a jelly wobble; the character crouches before a hop, stretches in the air, squashes on landing | `MP.spring` + `MP.squash` mapped to object scale (preserve volume) |
| L5 | Real stop-motion feel: step the motion at about 12 fps and nudge every piece a tiny bit each frame | Evaluate the animation at `MP.stepTime(t, 12)`; add `MP.nudge(t, {fps: 12})` to positions/rotations per piece; render frames at the normal fps (the same pose repeats for 2 to 3 frames) |
| L6 | The headline is on a clay sign or in clay letters that look rolled and pressed into place; at the end the character hops away and everything squishes back into the ground so it loops | Letters as extruded rounded text (`TextGeometry` or pre-baked rounded-rect letters) with noise; final hop out and sink |
| T1 | Rounded chunky bold font (Baloo 2) so the headline looks like soft clay letters | Baloo 2 800 (used for texture/geometry or DOM overlay) |
| T2 | Brand colours if given, else warm cream sky, soft green ground, orange clay, raspberry lettering, sunny yellow, cream sign | Tokens below |
| S1 | Soft, squishy, handmade sounds landing on the stop-motion frames: round clay bloop as each piece pops up, falling whistle and padded thud with a wet squelch on landing, a small squelch on the crouch, springy boing per hop, circling whoosh for a spin, gloopy squishes as everything sinks back; the character has a wordless cute voice (squeaks, a curious "hm?" blip, a "wheee") | Cue table below; times snapped to the 12 fps grid |
| S2 | Playful stop-motion bed about 96 bpm: bright xylophone tune, pizzicato plucked bass and chords, soft wooden tick on the off-beats; light; loops | `stop-motion` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 12` |
| O3 | A Three.js scene in HTML rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #f8e4cc;
--ink: #4a2a2a;
--ground: #93cf7f;
--accent: #ff9457;
--letter: #e24e5c;
--yellow: #ffc84a;
--sign: #fff2dd;
```
```json fonts
[{"family": "Baloo 2", "id": "baloo-2", "weights": [600, 800], "role": "clay headline"}]
```

## Beat sheet
```json beats
{"bpm": 96, "events": [
  {"id": "ground", "at": 0.0, "label": "clay ground squishes up"},
  {"id": "piece", "repeat": {"n": 5, "fromFrac": 0.08, "everyFrac": 0.07}, "label": "props squish up or drop in"},
  {"id": "char", "at": 0.4, "label": "blob character appears"},
  {"id": "hop", "repeat": {"n": 3, "fromFrac": 0.46, "everyFrac": 0.1}, "label": "hops"},
  {"id": "spin", "at": 0.7, "label": "spin"},
  {"id": "sign", "at": 0.74, "label": "sign and clay letters press into place"},
  {"id": "away", "at": 0.9, "label": "character hops away, everything sinks"}
]}
```

## Build recipe
- **Stepped animation:** write every animated property as `f(tq)` where `tq = MP.stepTime(t, 12)`. In `MP.onSeek(t => { const tq = MP.stepTime(t, 12); update(tq); render(); })`. Rendering at 30 fps then gives held poses, which is the stop-motion look.
- **Hand nudge:** per piece add `MP.nudge(tq, {fps: 12, amp: 0.008, seed: pieceId})` to position and a tiny rotation; seeds fixed.
- **Clay surface:** displace sphere vertices by seeded low-frequency noise (0.02 of radius) once at build; roughness 0.9, no specular. Fingerprints: a canvas texture with faint concentric arcs used as a bump map.
- **Character:** body sphere squashed by the spring; eyes tiny black spheres, cheeks pink discs; crouch = scaleY 0.75 before each hop; hop arc parabola; land squash 1.2 x 0.8.
- **Lettering:** bake each letter as a rounded extrusion (or draw with 3D rounded boxes for short words); animate `y` and scale as if pressed into the sign (scale 1.2 to 1 with a small wobble).
- **Pitfalls:** shadows in software WebGL can be slow: prefer blob shadows; keep geometry low poly; no `Math.random` (use seeded noise).

## Sound plan
Soft, squishy and handmade, landing on the stop-motion frames. How each effect of the brief is covered:
- **A round clay "bloop" as each piece pops up out of the ground:** `pop` (low, round) at `ground` and `piece*`.
- **A soft falling whistle and a padded thud with a wet squelch when something drops in and lands:** `chirp` (falling) + `thud` at drop-in pieces.
- **A small squelch as the character crouches:** `drip`/`pop` (low) before each `hop*`.
- **A springy boing for every hop:** `boing` at `hop*`.
- **A circling whoosh for a spin:** `whoosh` at `spin`.
- **Gloopy squishes as everything sinks back into the ground:** a run of low `pop` with `rev` at `away`.
- **The character's cute wordless voice, happy squeaks, a curious "hm?" blip and a "wheee" as it hops away:** `chirp` squeaks at `char`, a `blip` "hm?" and a rising `chirp` "wheee" at `away`.
```json cues
[
  {"at": "ground", "kind": "pop", "freq": 200, "rise": 1.5, "dur": 0.16, "vol": 0.8},
  {"at": "piece*", "kind": "pop", "freq": 260, "rise": 1.4, "dur": 0.15, "vol": 0.75},
  {"at": "piece*", "kind": "thud", "freq": 90, "dur": 0.16, "vol": 0.6},
  {"at": "piece*-0.15", "kind": "chirp", "f0": 1200, "f1": 500, "dur": 0.15, "vol": 0.3},
  {"at": "char", "kind": "chirp", "f0": 900, "f1": 1500, "dur": 0.12, "vol": 0.5},
  {"at": "hop*-0.12", "kind": "drip", "freq": 400, "dur": 0.1, "vol": 0.4},
  {"at": "hop*", "kind": "boing", "freq": 260, "dur": 0.45, "vol": 0.75},
  {"at": "hop*+0.4", "kind": "thud", "freq": 100, "dur": 0.15, "vol": 0.5},
  {"at": "spin", "kind": "whoosh", "dir": "peak", "dur": 0.6, "vol": 0.5},
  {"at": "sign", "kind": "stamp", "dur": 0.3, "vol": 0.6},
  {"at": "away-0.5", "kind": "blip", "freq": 500, "dur": 0.12, "wave": "sine", "vol": 0.4},
  {"at": "away", "kind": "chirp", "f0": 500, "f1": 1600, "dur": 0.5, "vol": 0.55},
  {"at": "away+0.6", "kind": "repeat", "every": 0.12, "times": 5, "of": {"kind": "pop", "freq": 240, "rise": 0.6, "dur": 0.14, "rev": true, "vol": 0.6}}
]
```
Snap every cue time to the 12 fps grid (`Math.round(t * 12) / 12`) in `cues.mjs` so sounds land on the visible poses.
```json music
{"preset": "stop-motion", "bpm": 96, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **16:9 / 1:1:** scene centred; sign behind or above the props.
- **9:16 / 4:5:** stack: sign on top, scene below; camera slightly higher; keep the character inside the safe area when hopping.

## Loop & ending
The character hops out of frame and props squish back into the ground; frame 0 is the flat clay ground before the first piece.

## Guardrails
- Handmade and matte: no gloss, no smooth CG shine; faint fingerprints only.
- Step the motion at about 12 frames per second with a tiny random nudge on every frame.
- Keep the character friendly, with a cute voice that has no words: happy squeaks, a curious "hm?" blip and a "wheee" as it hops away; no scary shapes.

## QA
- Consecutive rendered frames pairs are identical in groups of about 2 to 3 (held poses) while the scene changes each stepped frame.
- Squash and stretch visible at each landing; the lettering reads as pressed clay.
- Frame at the end equals the ground-only opening.
