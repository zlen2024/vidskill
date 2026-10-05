---
name: pixel-art
title: Pixel art
description: Your offer as a retro pixel game level: a PLAYER 1 character-select card with stat bars, a side-scrolling world where the hero bumps question blocks that pop out your features, collects proof-point coins, grabs a star and hits LEVEL UP with your call to action. For product, service, bakery, app and self-introduction promos.
tags: ["retro","promo","product"]
library: Canvas
sound: true
difficulty: 5
default_duration: 15
ratios: {"9:16":"good","4:5":"great","1:1":"great","16:9":"great"}
---
# Pixel art

**One-liner:** everything is drawn at a very low resolution and scaled up with crisp square pixels; a circle wipe opens on a "PLAYER 1" card (pixel hero, name, role, three stat bars filling one segment at a time, a blinking "PRESS START"), the card slides away into a bright side-scrolling world themed on the business, the hero runs and jumps, question blocks pop out three features as item icons that fly into inventory slots, coins are proof points that count up in the top bar, and a star triggers "LEVEL UP!" then the call to action; a closing circle wipe shuts on the hero so it loops.
**Best for:** a small business, a bakery or cafe, an app or service, a freelancer's self-introduction, a launch with a playful tone.
**Avoid when:** the tone must be serious, or the offer has no clear features/proof/CTA to fit the game beats.

## Inputs to gather
- Name/brand, role or business type, three stats that fit (TASTE, SPEED, LOVE for a bakery), three features/products, a proof-point figure ("1,200+ HAPPY CUSTOMERS"), the call to action ("ORDER NOW") and the handle or contact exactly as written. Brand colours (small retro palette).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | Turn the product, service or self-introduction into a retro pixel game level; draw at a very low resolution and scale up so every pixel stays sharp and square; no blur, no smooth gradients | Render to a low-res offscreen canvas (`W/6 x H/6`) with integer coordinates, then `drawImage` scaled with `imageSmoothingEnabled = false`; only flat palette colours |
| L2 | Open on a "PLAYER 1" character-select card: a cute pixel hero portrait for me or my brand, my name in big chunky pixel letters, my role or business type underneath, and three stat bars that fill one segment at a time; a small "PRESS START" blinks, then the card slides away into the level | Hero sprite drawn from a 16x16 array; name in Press Start 2P; bars in 10 segments; blink `floor(t * 3) % 2`; slide by integer pixel steps |
| L3 | The level is my offer: a bright side-scrolling world themed on my business with slower layers behind for depth (a layered cake ground with a cream and sprinkles top, frosting hills, meringue clouds, lollipops, cupcakes, a candy cane and a little bakery shop for a bakery); original, not a copy of any real game; the hero runs and jumps through it | Parallax layers scrolling at different speeds (function of `t`); hero run cycle 4 frames at 8 fps, jump parabola |
| L4 | Each ? block (for example a gift box, with biscuit blocks beside it) the hero bumps pops out one of my features, services or products as a small pixel item icon with a short chunky label in a game-style box (three items); each item then flies into an inventory slot in the top bar | Block bump (block moves up 2 px steps), item rises, label box appears, then the item moves to a slot along a stepped path |
| L5 | Collectibles are my proof points (coins, or something that fits: donuts, cookies): each one the hero collects adds to a small counter in the top bar (for example "1,200+ HAPPY CUSTOMERS"); keep the top bar tidy and easy to read | Coins as 8x8 sprites with a spin cycle; counter increments to the user's figure |
| L6 | The finale is my call to action: the hero grabs a star, flashes with a power-up and sparkles, and a pixel dialog box pops in with "LEVEL UP!", then changes to my call to action (for example "ORDER NOW") with my handle or contact underneath | Star sprite; hero palette flash (2 stepped frames); dialog box with a 2 px border; text swap |
| L7 | Open with a classic circle wipe that opens on the card, and close with one that shuts on the hero, so the video loops | Circle mask radius stepped in pixels (in low-res space) |
| L8 | Keep every word short and big enough to read on a phone; on small or narrow frames use fewer or shorter words rather than tiny text | Minimum on-screen glyph height 5 low-res pixels; shorten copy for narrow frames |
| T1 | A pixel font (Press Start 2P), all capitals, with my handle kept as I write it | Press Start 2P 400 uppercase; handle text untouched |
| T2 | Brand colours if given, else a small retro palette: sky blue, deep navy outlines and dialog boxes, coin yellow, warm orange, grass green, cyan labels, icing pink, mint, cream | Tokens below |
| S1 | 8-bit chip sounds timed to the action: a sweep for each circle wipe, soft ticks as my name types in, rising ticks as each stat bar fills, a blip each time PRESS START blinks and a short select jingle when it is pressed, a whoosh as the card slides away, a springy boing on every jump and a soft thud on landing, a solid bump on each block with a bright reveal jingle for each item (one step higher each time), a bright blip for each collectible with quick counter ticks, a twinkly power-up, a short level-up fanfare, and a "ding ding" as the call to action appears | Cue table below |
| S2 | An original cheerful chiptune loop about 120 bpm in a major key: pulse-wave lead melody, triangle bass and simple noise drums; steps back under the fanfare and rests for the circle wipe; must not copy or sound like any real game theme | `chiptune` preset with `dropAt` at the wipes |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | An HTML canvas animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #41a6f6;
--ink: #fff4e0;
--navy: #1a1c2c;
--accent: #ffcd75;
--orange: #ef7d57;
--grass: #38b764;
--cyan: #73eff7;
--pink: #f58fb6;
--mint: #3fb8a8;
```
```json fonts
[{"family": "Press Start 2P", "id": "press-start-2p", "weights": [400], "role": "all text"}]
```

## Beat sheet
```json beats
{"bpm": 120, "events": [
  {"id": "wipein", "at": 0.0, "label": "circle wipe opens on the card"},
  {"id": "name", "at": 0.06, "label": "name types in"},
  {"id": "stat", "repeat": {"n": 3, "fromFrac": 0.12, "everyFrac": 0.05}, "label": "stat bars fill"},
  {"id": "start", "repeat": {"n": 3, "fromFrac": 0.28, "everyFrac": 0.03}, "label": "PRESS START blinks"},
  {"id": "select", "at": 0.36, "label": "start pressed, card slides away"},
  {"id": "jump", "repeat": {"n": 3, "fromFrac": 0.42, "everyFrac": 0.12}, "label": "hero jumps to a block"},
  {"id": "block", "repeat": {"n": 3, "fromFrac": 0.45, "everyFrac": 0.12}, "label": "block bump, item pops"},
  {"id": "coin", "repeat": {"n": 4, "fromFrac": 0.78, "everyFrac": 0.02}, "label": "coins collected"},
  {"id": "star", "at": 0.85, "label": "hero grabs the star, power-up"},
  {"id": "levelup", "at": 0.88, "label": "LEVEL UP dialog"},
  {"id": "cta", "at": 0.917, "label": "call to action"},
  {"id": "wipeout", "at": 0.963, "label": "circle wipe shuts on the hero"}
]}
```

Timing note: the call to action gets about 0.7 s before the closing wipe at 15 s (`cta` 0.917, `wipeout` 0.963); the earlier 0.94 / 0.97 left under half a second, too short to read.

## Build recipe
- **Finished build:** `examples/pixel-art/` (9:16, 15 s, fictional demo brand). `scripts/make.mjs pixel-art ...` reuses it. It reads `CONTENT.game` (`name`, `role`, `stats`, `features`, `proof`, `cta`, `handle`) and falls back to `--text "Name|Role|Feature 1|Feature 2|Feature 3"` and `--key "CTA"`; put real stats, proof figure and handle in `content.mjs` `game`, then `make.mjs --project <dir>`.
- **Pixel pipeline:** `LOW = { w: Math.round(W / s), h: Math.round(H / s) }` with `s` = 5 or 6 (choose so the low-res height is about 180 to 320); draw everything with `fillRect` on integer coordinates; scale to the output with `imageSmoothingEnabled = false`. No anti-aliased text: Press Start 2P at sizes that are multiples of 8 low-res px.
- **Sprites:** define hero, blocks, items, coins as small string-array bitmaps mapped to palette letters; a helper `spr(rows, palette, x, y)` draws them. Animate by swapping frames (`floor(t * fps) % n`).
- **Parallax:** three background layers (clouds, hills, ground) whose x offset = `-(speed * t) mod tileWidth`; speeds 0.2, 0.5, 1.0.
- **Hero path:** a scripted path: run along the ground, jump arcs (parabola with integer quantisation) under each block; camera scrolls with the hero.
- **Counters and bars:** stat bars are 10 segment rects filled by `floor(progress * 10)`; the proof counter counts to the user's figure with integer steps.
- **Original art only:** design your own hero and world; do not reproduce known game characters, sprites or level layouts.
- **Pitfalls:** no fractional coordinates; no `ctx.scale` on smoothed images; keep type readable (minimum 8 px glyphs at low res); seeded jitter only.

## Sound plan
How each effect of the brief is covered (8-bit chip sounds timed to the action):
- **A sweep for each circle wipe:** `chirp` (square sweep) at `wipein` and `wipeout`.
- **Soft ticks as my name types in, rising ticks as each stat bar fills:** `typing` at `name`; `ticks` (rising) at `stat*`.
- **A blip each time PRESS START blinks, and a short select jingle when it is pressed:** `blip` at `start*`; `run` of `coin` at `select`.
- **A whoosh as the card slides away:** `whoosh` at `select`.
- **A springy boing on every jump and a soft thud on landing:** `boing` at `jump*`, `thud` at `block*+0.32` (the hero lands 0.32 s after bumping the block).
- **A solid bump on each block with a bright little reveal jingle for each item, one step higher each time:** `thud` + `run` of `lead` notes at `block*` with rising pitch.
- **A bright blip for each collectible with quick counter ticks:** `coin` at `coin*` + `tick`.
- **A twinkly power-up, a short level-up fanfare and a "ding ding" as the call to action appears:** `run` (up) + `sparkle` at `star`, a `run` of `square` notes at `levelup`, `ding` twice at `cta`.
```json cues
[
  {"at": "wipein", "kind": "chirp", "f0": 200, "f1": 1600, "dur": 0.5, "wave": "square", "vol": 0.45},
  {"at": "name", "kind": "typing", "n": 8, "dt": 0.08, "f0": 900, "f1": 1200, "vol": 0.4},
  {"at": "stat*", "kind": "ticks", "n": 8, "span": 0.5, "tick": "blip", "f0": 500, "f1": 1100, "vol": 0.4},
  {"at": "start*", "kind": "blip", "freq": 880, "dur": 0.07, "vol": 0.5},
  {"at": "select", "kind": "run", "inst": "coin", "n": 1, "vol": 0.7},
  {"at": "select", "kind": "whoosh", "dir": "up", "dur": 0.5, "vol": 0.4},
  {"at": "jump*", "kind": "boing", "freq": 300, "dur": 0.3, "vol": 0.5},
  {"at": "block*+0.32", "kind": "thud", "freq": 90, "dur": 0.1, "vol": 0.45},
  {"at": "block*", "kind": "thud", "freq": 120, "dur": 0.12, "vol": 0.7},
  {"at": "block*+0.1", "kind": "run", "inst": "lead", "from": "C5", "n": 3, "dt": 0.07, "scale": "major", "len": 0.2, "vol": 0.55},
  {"at": "coin*", "kind": "coin", "vol": 0.6},
  {"at": "coin*+0.1", "kind": "tick", "freq": 3000, "vol": 0.3},
  {"at": "star", "kind": "run", "inst": "lead", "from": "C5", "n": 8, "dt": 0.05, "scale": "major", "len": 0.15, "vol": 0.5},
  {"at": "star", "kind": "sparkle", "dur": 0.7, "vol": 0.4},
  {"at": "levelup", "kind": "run", "inst": "lead", "notes": ["C5", "E5", "G5", "C6", "G5", "C6"], "dt": 0.09, "len": 0.25, "vol": 0.6},
  {"at": "cta", "kind": "ding", "freq": 1568, "dur": 0.4, "vol": 0.6},
  {"at": "cta+0.18", "kind": "ding", "freq": 1568, "dur": 0.5, "vol": 0.6},
  {"at": "wipeout", "kind": "chirp", "f0": 1600, "f1": 200, "dur": 0.5, "wave": "square", "vol": 0.45}
]
```
```json music
{"preset": "chiptune", "bpm": 120, "gain": 1, "duck": 0.5, "layers": {
  "drums": {"dropAt": [["wipeout", "end"]]}, "melody": {"dropAt": [["levelup", "cta"], ["wipeout", "end"]]}, "bass": {"dropAt": [["wipeout", "end"]]}, "arp": {"dropAt": [["levelup", "cta"], ["wipeout", "end"]]}
}}
```

## Layout by aspect ratio
- **16:9:** low-res 320 x 180: the top bar (inventory + counter) across the top, the world below.
- **9:16 / 4:5:** low-res about 180 x 320 (or 216 x 270): the top bar is two rows (inventory row, counter row); use fewer or shorter words; the dialog box spans 80% of the width; keep the bar inside the top safe margin.
- **1:1:** low-res 240 x 240.

## Loop & ending
The closing circle wipe shuts on the hero, black; the opening wipe (frame 0) reopens on the card, so it loops.

## Guardrails
- Draw at a very low resolution and scale up so every pixel stays sharp and square: no blur and no smooth gradients.
- Keep it original, not a copy of any real game; the music must not copy or sound like any real game theme.
- Keep every word short and big enough to read on a phone: on small or narrow frames use fewer or shorter words rather than tiny text.

## QA
- Zoom on a frame: hard pixel edges, no anti-aliasing, no sub-pixel shifts between adjacent frames.
- Frame at `block2 + 0.4 s`: item icon and its label box visible, inventory slot 1 filled.
- Frame at `levelup + 0.3 s`: dialog readable; at `cta + 0.3 s`: CTA and handle exactly as the user wrote them.
- Audio: no melody that resembles a famous game theme; fanfare short.
