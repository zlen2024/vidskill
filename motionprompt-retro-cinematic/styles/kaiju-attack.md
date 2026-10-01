---
name: kaiju-attack
title: Kaiju attack
description: A 1950s low-budget monster movie shot on old film: a giant rubber-suit monster rises over a model city at night and burns your headline into the sky with a beam. For fun launches, announcements and punchy promos with a retro joke.
tags: ["promo","retro","text"]
library: Canvas
sound: true
difficulty: 5
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"good","16:9":"great"}
---
# Kaiju attack

**One-liner:** old black-and-white film, a miniature night city, and a monster so big that your message is what it roars: the headline is burned into the sky by its beam, then a "NOW SHOWING" ribbon brings the extra line.
**Best for:** a playful launch, a "coming soon", an event, a big claim delivered as a movie trailer gag. Headline of 1 to 4 words plus one short extra line.
**Avoid when:** the tone must be serious or corporate, or the brand is a real film/monster IP. The monster is original: never copy a famous one. Below 10 s it gets crowded; use 12 to 15 s.

## Inputs to gather
- Headline (1 to 4 short words, poster style) and one extra line for the ribbon ("NOW SHOWING" line). Warning text for the newsreel strip (default: derived from the headline, e.g. "SOMETHING HUGE IS COMING").
- Brand colours (accent replaces the burning amber), language (Malay or English).
- No real landmarks and no logos of real films.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | Old-film look: black and white with a faded teal and sepia tint, heavy grain, flicker, scratches, dust specks, dark vignette, slight gate weave | One full-frame film layer drawn per stepped frame (24 fps): `MP.drawGrain`, brightness flicker `1 + 0.05 * noise`, 0 to 2 seeded vertical scratches, a few dust specks, `MP.vignette`; scene wrapper offset by `MP.noise1` (about 2 px) for the gate weave; grade with a teal/sepia multiply layer |
| L2 | The joke: the message is so big it attacks the city; charming, low-budget model look | Everything is cut-out miniature: flat cardboard buildings, visible strings, toy props. Keep it funny, never gory |
| L3 | Miniature model city at night: hazy back row, dark front row with lit windows, big pale moon, sweeping searchlights, no real landmarks | Canvas skyline from a seeded generator (two rows, random heights, window grid lit by rng), moon disc with soft glow, 2 searchlight cones rotating with `sin(t)`; never draw Petronas/Eiffel style landmarks |
| L4 | Open with an iris and a newsreel "BULLETIN" strip typing a short warning; then the ground shakes, buildings rock, dust falls from rooftops | Iris = circular `clip-path` on the scene growing from a dot; strip in Special Elite, typed letter by letter; `MP.shake` on the scene wrapper, each building rocks by `noise1` at its own phase, dust = seeded particles falling from roof edges |
| L5 | A giant original monster rises slowly behind the buildings: rubber-suit chunky body, horned and frilled head, cone spikes down the back, big glowing eyes, tiny arms; eyes open, then a roar with a hard camera shake | Vector silhouette (Path2D) rising with `E.inOutCubic`; head, frill, horns, spike triangles, stubby arms; eyes are two glowing ellipses that open (scaleY); roar = jaw rotate + `MP.shake` with decay |
| L6 | Back spikes light up one by one; a glowing beam burns the headline into the sky in huge poster letters; letters glow white hot under the beam, cool to the accent colour, smoulder with rising embers | Spikes lit at `spike1..7`; beam is a gradient stroke from the mouth to a head that sweeps along the headline; a mask reveals letters up to the beam x; per-letter colour from white to `--accent` by time since reveal; embers = seeded particles rising |
| L7 | Low-budget gags: a toy plane on a visible string blown away by the roar; little toy tanks roll in and fire tiny shots | Plane on a drawn string, blown off with an eased curve at the roar; two tanks sliding on the front row, muzzle flash dots |
| L8 | The monster stomps, one model building crumbles into rubble, then a vintage "NOW SHOWING" ribbon pops in with the extra line; close with an iris onto the headline | Stomp = shake + building split into 8 to 12 rects falling with gravity from `t`; ribbon springs in (`MP.spring`); final iris closes to a circle centred on the headline |
| L9 | Every line of text short, readable in a second | Headline 1 to 4 words, strip 5 to 7 words, ribbon 3 to 6 words |
| T1 | Tall bold condensed poster font, slanted a little, deep 3D extrusion, for the headline; typewriter font for the bulletin | Anton with `skewX(-6deg)`, extrusion = 10 to 14 stacked offset copies in darker tones; Special Elite for the strip |
| T2 | Brand colours if given, else night teal black, old-film cream, burning amber, atomic cyan | Tokens `--bg --ink --accent --beam`; the amber headline and eyes take `--accent`, cyan beam and spikes take `--beam` |
| S1 | Projector whir, typewriter clicks, ground rumble, rubber foot thuds, eerie shimmer, roar with screech, crystal pings per spike, power charge, beam buzz with crackles, toy cannon pops, crumbling chunks, ribbon pop, reel running out | Cue table below |
| S2 | Dramatic B-movie orchestra about 114 bpm minor: low strings, timpani, brass "dun dun DUNNN" at the monster, brass swell under the beam, big brass chord to end | `cinematic-orch` preset + three `brass` stabs at `monster` + swell cues |
| S3 | All sound made in code | `scripts/synth.mjs`, `<audio id="mix">` |
| O1 | Size from the settings | scaffold `--ratio --short` |
| O2 | About the chosen length (works best 12 to 15 s) | scaffold `--duration 15` |
| O3 | Canvas + GSAP composition rendered frame by frame to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #0e1517;
--ink: #efe3c2;
--accent: #ffb03a;
--beam: #7df3ff;
```
```json fonts
[
  {"family": "Anton", "id": "anton", "weights": [400], "role": "headline"},
  {"family": "Special Elite", "id": "special-elite", "weights": [400], "role": "bulletin strip"}
]
```

## Beat sheet
Fractions of D (works from 10 s). Spikes and toy gags are repeats.
```json beats
{"bpm": 0, "events": [
  {"id": "iris", "at": 0.0, "label": "iris opens on the city"},
  {"id": "bulletin", "at": 0.04, "label": "BULLETIN strip types"},
  {"id": "quake", "at": 0.15, "label": "ground shakes, dust falls"},
  {"id": "rise", "at": 0.2, "label": "monster starts rising"},
  {"id": "monster", "at": 0.36, "label": "monster fully up: brass stabs"},
  {"id": "eyes", "at": 0.4, "label": "eyes open"},
  {"id": "roar", "at": 0.45, "label": "roar, hard shake, plane blown away"},
  {"id": "spike", "repeat": {"n": 7, "fromFrac": 0.5, "everyFrac": 0.02}, "label": "spikes light one by one"},
  {"id": "charge", "at": 0.63, "label": "power charge"},
  {"id": "beam", "at": 0.68, "label": "beam fires, headline burns in"},
  {"id": "tank", "repeat": {"n": 3, "fromFrac": 0.7, "everyFrac": 0.04}, "label": "toy tank shots"},
  {"id": "stomp", "at": 0.82, "label": "stomp, building crumbles"},
  {"id": "ribbon", "at": 0.88, "label": "NOW SHOWING ribbon"},
  {"id": "irisclose", "at": 0.95, "label": "iris closes on the headline"}
]}
```

## Build recipe
- **Layers (back to front):** sky + moon, back skyline, monster, front skyline, gags (plane, tanks), beam + headline, film layer (grain, scratches, vignette), iris mask, strip and ribbon (DOM). Draw the scene on one Canvas 2D via `MP.onSeek(t => draw(t))`; DOM text stays in `#text`.
- **Deterministic everything:** skyline, windows, dust and embers come from `MP.rng(seed)` created once; per-frame randomness uses `MP.hash(frameIndex, seed)`. Never keep particle state between frames: compute positions from `t - birthTime` (`y = y0 + v * age + g * age^2 / 2`).
- **Monster:** build one `Path2D` for body, head, frill, horns; draw spikes as an array so each spike lights at `T["spike" + i]`. Eyes glow = radial gradient with `MP.spring` opening. Keep it chunky and toy-like, not scary.
- **Headline burn:** render the headline to an offscreen canvas once (Anton, extruded); each frame copy columns up to the beam x; tint the newest 0.4 s columns white-hot and lerp to `--accent` (`MP.mix`). Embers rise from lit columns.
- **Film look:** apply grain last, then vignette; add a slight sepia/teal grade by drawing a `multiply` layer. Flicker is one global alpha per stepped frame.
- **Pitfalls:** do not use `Math.random` (the film layer must repeat exactly); a `clip-path` iris must animate an inner mask element, not a `.clip`; measure the headline with `MP.fitLine` so it fits the width; keep string line for the toy plane 2 px so it stays visible.

## Sound plan
How each effect of the brief is covered (times scale with D):
- **Soft projector whir the whole time:** a low `whir` bed for the full length.
- **Typewriter clicks for the bulletin:** `typing` at `bulletin`.
- **Deep ground rumble:** `rumble` at `quake`.
- **Heavy rubber foot thuds:** `thud`/`footstep` while the monster rises and at `stomp`.
- **Eerie shimmer as the eyes open:** `swell` + a high `chime` at `eyes`.
- **Growling monster roar with a screech on top:** low `buzz` + falling `whir` + a `chirp` screech at `roar`.
- **Crystal pings as each spike lights up:** `ping` at `spike*`, pitch rising per spike (`rise`).
- **Rising power charge:** `riser` into `beam`.
- **Electric beam buzz with crackles as the letters burn:** `buzz` and `crackle` across the burn.
- **Tiny toy cannon pops:** `cannon` at `tank*`.
- **Model building crumbling into little chunks:** `crackle` + `thud` at `stomp`.
- **Pop for the ribbon** and **the film reel running out at the end:** `pop` at `ribbon`; a decelerating `ticks` run with a falling `whir` at the end.
```json cues
[
  {"at": 0.0, "kind": "whir", "f0": 55, "f1": 58, "dur": "D", "vol": 0.16},
  {"at": "bulletin", "kind": "typing", "n": 22, "dt": 0.06, "spaceEvery": 6, "vol": 0.5, "bell": true},
  {"at": "quake", "kind": "rumble", "dur": 1.6, "freq": 48, "vol": 0.85},
  {"at": "rise+0.3", "kind": "thud", "freq": 62, "vol": 0.8},
  {"at": "rise+1.4", "kind": "thud", "freq": 58, "vol": 0.8},
  {"at": "monster", "kind": "brass", "note": "A2", "dur": 0.3, "vol": 0.8},
  {"at": "monster+0.4", "kind": "brass", "note": "A2", "dur": 0.3, "vol": 0.8},
  {"at": "monster+0.8", "kind": "brass", "note": "A2", "dur": 1.4, "vol": 0.95, "verb": 0.3},
  {"at": "eyes", "kind": "swell", "dur": 1.2, "freq": 1600, "vol": 0.5},
  {"at": "eyes", "kind": "chime", "freq": 1320, "dur": 1.4, "vol": 0.4},
  {"at": "roar", "kind": "buzz", "freq": 75, "dur": 1.3, "vol": 0.85},
  {"at": "roar", "kind": "whir", "f0": 110, "f1": 55, "dur": 1.3, "vol": 0.6},
  {"at": "roar+0.2", "kind": "chirp", "f0": 1500, "f1": 3400, "dur": 0.5, "vol": 0.4},
  {"at": "spike*", "kind": "ping", "freq": 1200, "dur": 0.9, "vol": 0.55, "rise": {"param": "freq", "from": 1200, "by": 140}},
  {"at": "charge", "kind": "riser", "dur": 1.2, "tone": 0.35, "vol": 0.6},
  {"at": "beam", "kind": "buzz", "freq": 140, "dur": 2.4, "vol": 0.5},
  {"at": "beam", "kind": "crackle", "dur": 2.4, "density": 70, "vol": 0.55},
  {"at": "tank*", "kind": "cannon", "vol": 0.6},
  {"at": "stomp", "kind": "thud", "freq": 55, "vol": 0.95},
  {"at": "stomp+0.1", "kind": "crackle", "dur": 0.9, "density": 90, "lo": 200, "hi": 2600, "vol": 0.7},
  {"at": "ribbon", "kind": "pop", "freq": 640, "vol": 0.8},
  {"at": "irisclose", "kind": "ticks", "n": 10, "span": 0.9, "curve": "decel", "tick": "click", "vol": 0.5},
  {"at": "irisclose", "kind": "whir", "f0": 90, "f1": 25, "dur": 1.0, "vol": 0.4}
]
```
```json music
{"preset": "cinematic-orch", "bpm": 114, "gain": 1, "duck": 0.5, "layers": {
  "brass": {"rhythm": "stab:x-------x-------", "vol": 0.5},
  "finale": {"bars": [-1, 999]}
}}
```

## Layout by aspect ratio
- **16:9:** city spans the frame, monster centre-right, headline across the upper third. Best framing.
- **9:16 / 4:5:** crop the skyline to the lower 45% of the frame, monster taller (head reaches the upper third), headline wraps to 2 lines in the sky above the monster, ribbon at the lower third. Keep the strip inside `--safe-*`.
- **1:1:** monster centred, headline in two lines.

## Loop & ending
The iris closes onto the headline, then the film reel winds down; the first frame is the iris opening on the city, so a restart reads as the next reel.

## Guardrails
- Original monster: not a copy of any famous movie monster, no real landmarks, no real film branding.
- Fun and charming, like a low-budget model film: no gore, no real destruction footage look.
- Keep every line of text short and readable in a second.
- Keep flicker and flashes gentle: film flicker is a few percent of brightness, never a strobe; the beam glow is soft.

## QA
- Frame at `roar + 0.3 s`: monster fully visible, eyes lit, camera shake visible as an offset, plane already leaving.
- Frame at `beam + 60% of the burn`: headline half revealed, newest letters white-hot, older ones amber, embers above.
- Frame at `ribbon + 0.6 s`: ribbon readable, headline still visible.
- Skyline has no recognisable real landmark; text stays inside the safe area; final frame is the iris closed on the headline.
- `audio-report`: the brass "dun dun DUNNN" is three separate low bursts, the beam section is the loudest sustained part, no clipping.
