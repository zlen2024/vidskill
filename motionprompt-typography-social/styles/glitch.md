---
name: glitch
title: Glitch
description: Digital glitch type on a near-black screen like a corrupted video signal: one word at a time with hard jump cuts, a constant red-cyan channel split, short RGB-slice breakups, a terminal caption with a running timecode and a blinking cursor. For tech hooks, teasers, gaming and edgy announcements.
tags: ["text","social"]
library: Canvas
sound: true
difficulty: 3
default_duration: 8
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Glitch

**One-liner:** a very dark frame, the message shown one word at a time with hard jump cuts and then as a full line; a small red and cyan channel split is always on; at each cut and in one bigger burst mid-line the frame breaks (slices shift sideways, the colour split jumps wide, noise blocks appear) for well under half a second, then snaps back to calm; tiny mono captions like a terminal and an ending standby moment.
**Best for:** tech and gaming hooks, teasers, launches with an edge, cyber or hacker themes.
**Avoid when:** a warm, friendly or elegant tone is needed.

## Inputs to gather
- The message (2 to 6 words, shown word by word). Channel tag text (default "CH 01"), status line text (default "SIGNAL LOCKED"). One bright accent colour.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | Digital glitch type on a near-black screen, like a corrupted video signal | Canvas 2D on `--bg` |
| L2 | The message appears one word at a time with hard jump cuts, then the whole line together, and holds | Word schedule from `T.word1..N`, then `T.line` |
| L3 | The text always has a small red and cyan channel split; at each cut and in one bigger burst in the middle the frame breaks up: horizontal slices shift sideways, the split jumps wide, small noise blocks appear; each burst lasts well under half a second then snaps back to calm | Draw the word 3 times (red -3 px, cyan +3 px, white); a burst function with `dur 0.18 s`: rows sliced into 8 to 16 bands shifted by seeded amounts, split up to 22 px, 6 to 12 noise rects in `--accent` |
| L4 | Small monospace captions like a terminal: a channel tag and running timecode at the top, a typed status line with a blinking block cursor at the bottom | DOM mono text; timecode = `t` formatted (`00:00:03:12`); typed by character count; cursor blink = `floor(t * 2) % 2` |
| L5 | End on a short, almost empty standby moment so the video loops cleanly | Last 0.5 s: dim frame, only the cursor |
| L6 | Keep the background dark at all times; no bright full-screen flashes | Noise blocks small; never fill the frame with bright colour |
| T1 | A heavy monospace font in capitals for the message (JetBrains Mono ExtraBold) and the same font in a light weight for captions | JetBrains Mono 800 and 300 |
| T2 | One bright brand colour as the only accent; else near black, off-white text, acid green accent/cursor/noise | Tokens below |
| S1 | A short digital glitch burst on every visual burst (crunchy bit-crushed tones and static that stutter in step with the picture, only as long as the burst), a crisp hard click on each jump cut, a bigger burst mid-line with a quick pitch dive, a low thud and a stutter in the beat, soft terminal typing ticks, a small blip each time the cursor blinks on; every glitch short and never painful | Cue table below |
| S2 | Cold, tight minimal techno at 120 bpm in a minor key: short punchy kick, crisp hats, dry rim click, rolling filtered bass, a few echoing blips, low drone; the beat drops out for the standby moment and returns at the loop start | `minimal-techno` preset with `dropAt` standby |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 8` |
| O3 | An HTML canvas animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #0b0c0f;
--ink: #eef2f0;
--accent: #c6ff00;
--red: #ff2a3d;
--cyan: #19e3ff;
```
```json fonts
[{"family": "JetBrains Mono", "id": "jetbrains-mono", "weights": [300, 800], "role": "message and captions"}]
```

## Beat sheet
For four words. One burst per cut plus one bigger burst mid-line.
```json beats
{"bpm": 120, "events": [
  {"id": "word", "repeat": {"n": 4, "fromFrac": 0.05, "everyFrac": 0.12}, "label": "each word on a jump cut"},
  {"id": "line", "at": 0.55, "label": "full line together"},
  {"id": "burst", "at": 0.7, "label": "bigger mid-line burst"},
  {"id": "type", "at": 0.1, "label": "status line starts typing"},
  {"id": "standby", "at": 0.9, "label": "standby moment"}
]}
```

## Build recipe
- **Glitch burst as a pure function:** `burst(t, t0, dur, seed)` returns `{k: 0..1, slices, noise}` where `k = 1 - (t - t0) / dur` (0 outside). Slices: split the frame into `n` horizontal bands (n from `hash`), each shifted `dx = (hash(i, seed) - 0.5) * 2 * 40 * k`. Colour split = `3 + 19 * k` px.
- **Rendering:** draw the word to an offscreen canvas once per word; per frame copy band by band to the screen with the offsets; overlay the red/cyan copies using `globalCompositeOperation: "lighter"`.
- **Noise blocks:** `MP.rng(seed)` per burst; at most 12 small rects in `--accent` at low alpha.
- **Jump cuts:** each word's canvas is visible only in `[T.word_i, T.word_{i+1})`; no fades.
- **Pitfalls:** never full-frame bright flashes: cap noise area under 6% of the frame; the caption timecode must be deterministic (`t`), not the clock; keep the message size to about 80% of the frame width via `MP.fitLine`.

## Sound plan
Keep every glitch short and never painful. How each effect of the brief is covered:
- **A short digital glitch burst on every visual burst, only as long as the burst:** `glitch` (0.18 to 0.3 s) at `word*` and `burst`.
- **A crisp hard click on each jump cut:** `click` at `word*`.
- **A bigger burst mid-line with a quick pitch dive:** a longer `glitch` plus a falling `chirp` at `burst`.
- **A low thud and a stutter in the beat:** `thud` at `burst` (the music stutters via `dropAt`).
- **Soft terminal typing ticks as the status line types out:** `typing` at `type`.
- **A small blip each time the cursor blinks on:** `blip` at each blink (about every second).
```json cues
[
  {"at": "word*", "kind": "glitch", "dur": 0.2, "vol": 0.55},
  {"at": "word*", "kind": "click", "freq": 2000, "vol": 0.7},
  {"at": "line", "kind": "glitch", "dur": 0.2, "vol": 0.5},
  {"at": "burst", "kind": "glitch", "dur": 0.3, "vol": 0.7},
  {"at": "burst", "kind": "chirp", "f0": 3000, "f1": 300, "dur": 0.25, "vol": 0.4},
  {"at": "burst", "kind": "thud", "freq": 60, "dur": 0.35, "vol": 0.8},
  {"at": "type", "kind": "typing", "n": 14, "dt": 0.06, "vol": 0.3},
  {"at": 0.62, "kind": "blip", "freq": 1400, "dur": 0.04, "vol": 0.3},
  {"at": 0.75, "kind": "blip", "freq": 1400, "dur": 0.04, "vol": 0.3},
  {"at": 0.88, "kind": "blip", "freq": 1400, "dur": 0.04, "vol": 0.3}
]
```
```json music
{"preset": "minimal-techno", "bpm": 120, "gain": 1, "duck": 0.4, "layers": {
  "drums": {"dropAt": [["burst", "burst+0.25"], ["standby", "end"]]},
  "bass": {"dropAt": [["burst", "burst+0.25"], ["standby", "end"]]}
}}
```
The beat stutters out for a quarter second at the burst and drops out for the standby moment (`dropAt` takes beat ids with optional offsets).

## Layout by aspect ratio
- **9:16:** message in the centre (one word per cut), caption block at the top and bottom inside `--safe-*`.
- **16:9:** message centred at 70% width; captions top-left and bottom-left.
- **1:1 / 4:5:** as 9:16.

## Loop & ending
Standby moment (dim frame, cursor only) then the first word cuts in; the music drops out for standby and returns on the loop start.

## Guardrails
- Keep the background dark at all times with no bright full-screen flashes.
- Each burst lasts well under half a second, then everything snaps back to calm.
- Keep every glitch sound short and never painful.
- Only one bright accent colour.

## QA
- Frame during a burst shows displaced slices and a wide red/cyan split; the frame 0.3 s later is calm.
- The whole line is fully readable during the hold.
- Timecode advances with `t`; the cursor blinks on a 0.5 s rhythm.
- `audio-report`: glitch bursts are short (under 0.35 s each) and peak below -1 dBFS.
