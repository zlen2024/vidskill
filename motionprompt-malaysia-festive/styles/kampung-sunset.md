---
name: kampung-sunset
title: Kampung sunset
description: A warm painterly Malaysian village at golden hour sinking into a firefly dusk: a wooden house on stilts, coconut palms, rippling paddy, birds flying home, a child on a bicycle, and your title rising into the sky. For nostalgic greetings, Raya and homecoming messages, background loops.
tags: ["malaysia","background","handmade"]
library: GSAP
sound: true
difficulty: 4
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
hidden: true
---
# Kampung sunset

**One-liner:** a storybook flat illustration with soft gradients and paper grain: a traditional Malay wooden house on stilts (pitched zinc or attap roof, stairs, glowing windows), coconut palms, golden paddy fields with a raised path; palms sway, paddy ripples, clouds drift, birds fly home; a child cycles along the path, chickens peck, a cat sits on the stairs; the sun sets, the sky goes gold to purple, lights glow brighter and fireflies appear; the title rises into the sky and the video fades back to golden light.
**Best for:** nostalgic or homecoming messages (balik kampung), Raya greetings, a warm brand mood, a calm loop.
**Avoid when:** the mood must be urban or high energy.

## Inputs to gather
- Title (short) and language (Malay or English). Occasion or mood. Brand colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A warm painterly flat illustration of a Malaysian village at golden hour: soft shapes, gentle gradients, a light paper grain like a storybook picture | SVG shapes with gradients; grain overlay (`MP.drawGrain`, low alpha) |
| L2 | Build a scene for the message: a traditional Malay wooden house on stilts with a pitched zinc or attap roof, wooden stairs, open windows glowing warm inside, coconut palms, golden paddy fields with a raised path | Layered SVG: sky, sun, far hills, paddy bands, path, house group, palms |
| L3 | Everything moves softly: palms sway, paddy ripples in waves of wind, clouds drift, birds fly home across the sky | Palm frond rotation by `sin`; paddy rows offset by a travelling sine; clouds `x` drift; birds as flapping `V` paths along a curve |
| L4 | Small heartwarming details: a child cycling along the path, chickens pecking, a cat on the stairs | Child + bicycle group along a path with wheel rotation; chicken head pecks by a timed pulse; cat tail flick |
| L5 | Over the video the sun sets slowly into dusk: sky from gold to purple, house lights glow brighter, fireflies appear | Sky gradient stops interpolated by `MP.mix` on a progress value; window glow alpha up; fireflies seeded with sine blinking |
| L6 | The message in the sky as a warm friendly title, letters rising in one by one; text in the user's language | `MP.splitText` letters with a soft `y` rise and glow |
| L7 | End by fading gently back to golden light so the video can loop | Progress returns to 0 in the last 12% |
| T1 | A rounded friendly bold font (Baloo 2) in warm cream with a soft glow so it reads on the sky | Baloo 2 800, text shadow glow |
| T2 | Brand colours if given, else golden orange, sunset coral, paddy gold, palm green, lavender sky, dusk purple | Tokens below |
| S1 | Warm evening nature ambience timed to the motion: cicadas through golden hour easing off as crickets begin at dusk, palm leaves rustling, a dove cooing, soft chirps from the birds flying home, a soft chain whirr as the child cycles (louder as they pass) with a friendly bicycle bell ring, gentle clucks as the chickens peck, soft twinkles as fireflies glow, light plucks as the title letters rise | Cue table below |
| S2 | Nostalgic heartfelt bed, slow and gentle in 3/4: fingerpicked acoustic guitar, a simple soft piano tune, a warm pad; quiet; loops | `waltz-nostalgic` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | GSAP HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #f7a23b;
--ink: #fff2d8;
--accent: #f08a6a;
--paddy: #e3a638;
--palm: #3f6a3c;
--sky2: #7d6aa8;
--dusk: #4a2f6b;
```
```json fonts
[{"family": "Baloo 2", "id": "baloo-2", "weights": [600, 800], "role": "title"}]
```

## Beat sheet
```json beats
{"bpm": 0, "events": [
  {"id": "golden", "at": 0.0, "label": "golden hour scene"},
  {"id": "birds", "at": 0.12, "label": "birds fly home"},
  {"id": "child", "at": 0.22, "label": "child cycles along the path"},
  {"id": "bell", "at": 0.36, "label": "bicycle bell"},
  {"id": "peck", "repeat": {"n": 3, "fromFrac": 0.3, "everyFrac": 0.05}, "label": "chickens peck"},
  {"id": "dusk", "at": 0.48, "label": "sun sets, sky turns purple, lights glow"},
  {"id": "firefly", "at": 0.6, "label": "fireflies appear"},
  {"id": "letter", "repeat": {"n": 10, "fromFrac": 0.66, "everyFrac": 0.02}, "label": "title letters rise"},
  {"id": "return", "at": 0.9, "label": "fade back to golden light"}
]}
```
Match the `letter` repeat to the title's character count.

## Build recipe
- **Time of day:** one `dusk` progress `p(t)` (0 golden, 1 dusk, back to 0) drives the sky gradient stops, sun height, window glow and firefly alpha; compute all colours as `MP.mix(goldStop, duskStop, p)`.
- **House:** raised on stilts (6 posts), rectangular body, high pitched roof (zinc or attap texture lines), open windows with warm rectangles, a wooden staircase; keep proportions traditional (tall stilts, steep roof).
- **Paddy:** 6 to 8 horizontal bands of short vertical strokes; ripple = phase-shifted sine on the tips; a raised path (a lighter band) with the child on it.
- **Fireflies:** 25 seeded points near the paddy; `alpha = max(0, sin(t * f + phase))^3 * p`; small soft glows.
- **Pitfalls:** avoid flat colour banding: apply the grain; keep the title legible on the sky (use a soft glow and place it in the upper third); everything is a smooth function of `t`.

## Sound plan
How each effect of the brief is covered (a warm evening ambience timed to the motion):
- **Cicadas buzzing through golden hour, easing off as crickets start chirping at dusk:** `insects` bed at `golden` fading, `crickets` bed from `dusk`.
- **Palm leaves rustling as the breeze sways them:** `wind` (soft) beds.
- **A dove cooing in the distance:** a soft low `flute` two-note coo.
- **Soft chirps from the birds flying home as they cross the sky:** `chirp` at `birds`.
- **A soft chain whirr as the child cycles, louder as they pass, with a friendly ring of the bicycle bell:** `whir` swell at `child`, `ding` (bell) at `bell`.
- **Gentle clucks as the chickens peck:** `pop` (low) at `peck*`.
- **Soft twinkles as the fireflies glow and light plucks as the title letters rise:** `sparkle` at `firefly`; `pluck` at `letter*`.
```json cues
[
  {"at": "golden", "kind": "insects", "dur": "until:dusk", "freq": 5200, "vol": 0.28},
  {"at": "golden", "kind": "wind", "dur": "D", "vol": 0.28},
  {"at": "birds", "kind": "repeat", "every": 0.35, "times": 4, "of": {"kind": "chirp", "f0": 2600, "f1": 3800, "dur": 0.08, "vol": 0.25}},
  {"at": 0.18, "kind": "flute", "note": "D4", "dur": 0.6, "vol": 0.22},
  {"at": 0.2, "kind": "flute", "note": "D4", "dur": 0.8, "vol": 0.22},
  {"at": "child", "kind": "whir", "f0": 40, "f1": 120, "dur": 2.6, "vol": 0.2},
  {"at": "bell", "kind": "ding", "freq": 2600, "dur": 0.7, "vol": 0.4},
  {"at": "peck*", "kind": "pop", "freq": 180, "rise": 1.3, "dur": 0.1, "vol": 0.4},
  {"at": "dusk", "kind": "crickets", "dur": "rest", "vol": 0.3},
  {"at": "firefly", "kind": "sparkle", "dur": 1.2, "lo": 2500, "hi": 6000, "vol": 0.3},
  {"at": "letter*", "kind": "pluck", "note": "G4", "dur": 0.6, "vol": 0.4, "rise": {"param": "note", "from": 67, "by": 1}}
]
```
```json music
{"preset": "waltz-nostalgic", "bpm": 84, "gain": 1, "duck": 0.4}
```

## Layout by aspect ratio
- **9:16:** sky and title in the top 45%; house left-centre on the middle band, paddy and path across the lower third above the safe zone.
- **16:9:** house right of centre, palms at both sides, title upper left.
- **1:1 / 4:5:** title upper third; house centre.

## Loop & ending
Dusk fades back to golden light (`p` returns to 0), title fades; frame 0 is the golden scene without the title.

## Guardrails
- Keep the illustration warm and painterly with soft shapes; no harsh outlines.
- Write the text in the language the user used.
- Keep every motion gentle; fireflies glow softly and never flash.

## QA
- Frame at `golden + 1 s` vs `dusk + 3 s`: clear change from gold to purple, windows glowing more.
- Frame at `firefly + 1 s`: fireflies visible against the paddy.
- Frame at `letter10 + 0.5 s`: full title readable in the sky.
- Child and bicycle wheels rotate; the last frame matches the first.
