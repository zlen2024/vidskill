---
name: kinetic-type
title: Kinetic typography
description: Big bold words that punch in on the beat, spin or drop letter by letter, hard-cut between palette colours, then stack into one key line and wipe away. For hooks, quotes, slogans, announcements and caption-style social videos.
tags: ["text","social"]
library: GSAP
sound: true
difficulty: 2
default_duration: 8
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"good"}
---
# Kinetic typography

**One-liner:** the message, broken into 1 to 3 word phrases, punches onto the screen on a steady ~130 bpm beat over hard-cut colour backgrounds, then the key line stacks in the centre and a colour wipe clears the frame.
**Best for:** a slogan, a hook, an announcement, a quote, a list of 3 to 8 short claims. Text is the whole show.
**Avoid when:** the user needs images, products, diagrams or long sentences. Use `slide-deck`, `infographic` or `product-turntable` instead.

## Inputs to gather
- The message. Split it into 3 to 8 phrases of 1 to 3 words each (keep the user's own words, never add claims). Prefer **single words** when the message allows: they fill the frame best.
- The **key line**: ONE short slogan of 2 to 4 words that ends the video (default: the message condensed, e.g. the brand line or the last phrase). Never stack every phrase.
- Language (Malay or English: write in the language the user used).
- Brand colours (`bg`, `ink`, `accent`, `accent2`), else the defaults below.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | Phrases of 1 to 3 words, each punching in on a steady beat (~130 bpm), starting big and slightly rotated, then snapping into place | `T.phrase1..N` from `timing.mjs`, one slot = `slotBeats` beats (1 to 3, see recipe). Entrance A: `scale 2.6, rotation -12` to `scale 1, rotation -3`, 0.35 s, `expo.out` |
| L2 | Vary the entrances | Cycle three: A punch; B letters spin in one by one (`MP.splitText`, `scale 0, rotation 25`, stagger 0.06, `back.out(2.5)`); C letters drop from above (`yPercent -160`, alternating rotation, stagger 0.05). Add D slide from a side if N > 5 |
| L3 | Some beats hard-cut the background to another palette colour; text stays readable | `tl.set("#root", {backgroundColor})` and word colour at each phrase start; cycle `[bg/ink, accent/bg, accent2/bg]`; never animate the background between colours |
| L4 | End on the key line stacked in the centre, hold about 1 s, then a quick colour wipe | At `T.final` the key line enters **one word per line**, huge, colours cycling ink / accent / accent2, alternating sides, stagger half a beat; hold about 1 s; wipe panel `scaleY 0 to 1` then `1 to 0` from the opposite origin at `T.wipe` |
| T1 | Heavy condensed font, all capitals, filling most of the frame | Anton, `text-transform: uppercase`. Size from `MP.fitLine`; in tall frames stack a multi-word phrase one word per line when that makes the type at least 1.3x bigger (see layout) |
| T2 | Brand colours if given, else the default palette | `--bg --ink --accent --accent2` tokens (scaffold `--brand` overrides them) |
| S1 | Kick + snap on every phrase, letter ticks, a hit on each colour cut, riser into the final line landing on a boom, whoosh for the wipe | Cue sheet below plus per-letter ticks generated from the phrase list |
| S2 | Tight electronic beat at the animation tempo, kick every beat, closed hats, simple bass; phrases land on kicks; beat drops out for the wipe; loops | `minimal-techno` preset, `bpm` synced to `timing.mjs`, `dropAt` wipe to end |
| S3 | All sound made with code, mixed into the MP4 | `scripts/synth.mjs` writes `assets/audio/mix.wav`; `<audio id="mix">` |
| O1 | Size from the settings | `--ratio` and `--short` in scaffold |
| O2 | About the chosen length | `--duration` in scaffold (default 8) |
| O3 | HTML animation rendered frame by frame to MP4 | HyperFrames `render` |

## Tokens
```css tokens
--bg: #10131f;
--ink: #f6f3ea;
--accent: #ff5a4e;
--accent2: #ffd23f;
```
```json fonts
[{"family": "Anton", "id": "anton", "weights": [400], "role": "headline"}]
```

## Beat sheet
Tempo `bpm` is snapped to a whole number of beats in D (8 s gives 127.5). Default is 5 phrases at 2 beats each; **edit `timing.mjs` when the real phrase count differs** (see the recipe formula).
```json beats
{"bpm": 130, "events": [
  {"id": "phrase", "repeat": {"n": 5, "everyBeat": 2, "fromBeat": 0}, "label": "each phrase punches in"},
  {"id": "final", "end": 3.2, "label": "key line stacks in (0.5 s), riser + boom land here"},
  {"id": "wipe", "end": 1.3, "label": "colour wipe up then away, beat drops out"}
]}
```
At D = 8: phrases 0, 0.94, 1.88, 2.82, 3.76 s; final 4.8 s; wipe 6.7 s; clean frame from about 7.4 s.

## Build recipe
- **Layers:** `#root` background = the cut colour; `#text` holds one absolutely centred `.word` per phrase plus the `.final` stack; a full-frame `.wipe` panel in `#fx` (`background: var(--accent)`, `transform: scaleY(0)`).
- **Slots:** `beat = 60 / BPM`; `slotBeats = MP.clamp(Math.round((T.final - 0.2) / N / beat), 1, 3)`; `T.phraseK = (K - 1) * slotBeats * beat`. With few phrases use 3-beat slots so the timeline still fills `T.final`. More than about 8 phrases: merge them.
- **Fit:** measure after `MP.fontsReady`. For each phrase compute `line = Math.min(MP.fitLine(phrase, '"Anton"', 400, W * 0.86), H * 0.34)` and, when it has k > 1 words, `stack = Math.min(MP.fitLine(longestWord, '"Anton"', 400, W * 0.86), (H * 0.8) / (k * 0.9))`; use the stacked layout when `stack >= 1.3 * line`, otherwise one line. **Key line:** always stacked, one word per line, `size = Math.min(fitLine(longestWord, W * 0.84), (H * 0.72) / (k * 0.92))`. The punch-in overshoot (`scale 2.6`) may leave the frame; the settled state must not.
- **Hard cuts** are `tl.set`, placed on the phrase time. Hide the previous word with `opacity: 0` (a `tl.set`, not `autoAlpha`, and never on a `.clip`).
- **Letter animations:** split with `MP.splitText(el)`, then `tl.fromTo(letters, from, to, time)`. Stagger runs inside the slot so the word is settled before the next kick.
- **Wipe:** two tweens on one panel: `scaleY 0 to 1` with `transformOrigin: "50% 100%"`, then set origin `"50% 0%"` and `scaleY 1 to 0`. After the wipe only `--bg` remains (empty frame = loop point).
- **Pitfalls:** do not tween `background-color` between palette colours (soft blends break the hard-cut look); do not use `repeat: -1`; `.word` elements need `display:block` and `white-space: nowrap` so scaling applies.

## Sound plan
Cues resolve against `timing.mjs`; `phrase*` fires once per phrase. How each effect of the brief is covered:
- **Punchy kick with a short snap on every phrase:** `kick` + `rim` at `phrase*`.
- **Quick ticks as letters spin or drop in, one per letter:** `tick` cues generated in `cues.mjs` from the phrase list (see `examples/kinetic-type/cues.mjs`): times `phrase + j * stagger`, pitch rising with the letter index.
- **Sharp hit on each colour cut:** a short `snare` at `phrase*` (the background cut lands with the kick).
- **Rising whoosh into the final stacked line landing on a deep boom:** `riser` one second before `final`, `impact` at `final`, plus a `swish` per stacked word.
- **Sweeping whoosh for the colour wipe:** `whoosh` (dir up) at `wipe`.
```json cues
[
  {"at": "phrase*", "kind": "kick", "vol": 0.95},
  {"at": "phrase*", "kind": "rim", "freq": 2400, "dur": 0.04, "vol": 0.6},
  {"at": "phrase*", "kind": "snare", "dur": 0.1, "vol": 0.35},
  {"at": "final-1.0", "kind": "riser", "dur": 1.0, "tone": 0.25, "vol": 0.55},
  {"at": "final", "kind": "impact", "dur": 1.1, "vol": 0.95, "verb": 0.3},
  {"at": "final", "kind": "repeat", "everyBeat": 0.5, "times": 5, "of": {"kind": "swish", "vol": 0.45}},
  {"at": "wipe", "kind": "whoosh", "dir": "up", "dur": 0.6, "vol": 0.85}
]
```
```json music
{"preset": "minimal-techno", "gain": 1, "duck": 0.35, "layers": {
  "blips": false, "drone": false,
  "drums": {"rim": "", "hat": "--x---x---x---x-", "dropAt": [["wipe", "end"]]},
  "bass": {"voice": "bassPluck", "style": "offbeat", "oct": 2, "vol": 0.6, "dropAt": [["wipe", "end"]]}
}}
```

## Layout by aspect ratio
- **9:16 / 4:5:** words fill the width. A 3-word phrase stacked word by word reaches 300 to 500 px type, a single line only about 150 px: prefer the stack. The height cap keeps a 10-letter word from overflowing.
- **1:1:** same rules, height cap 0.34 of the frame.
- **16:9:** height is the limit, so multi-word phrases stay on one line (cap 0.34 of H). The key line stacks at most 4 words; with more, put two words per row.
- Keep the words out of the platform UI zones (`--safe-*`) except during the punch overshoot.

## Loop & ending
Last phase is the wipe returning to the plain `--bg` colour with no text; the first frame is also plain `--bg`. The music drops out for the wipe and returns on beat 1.

## Guardrails
- Phrases stay 1 to 3 words; the key line is one short slogan, never a stack of all phrases; never invent words or claims.
- Every background/text pair stays readable (contrast passes `npm run check`).
- Keep the text easy to read: the entrances take about 0.35 to 0.5 s and settle before the next kick.
- Colour cuts are hard cuts; no strobing (no more than 3 full-frame changes per second: at 2-beat slots that is fine, at 1-beat slots use fewer cuts).

## QA
- Frames at `phrase_k + 0.7 s` each show one settled word, fully inside the frame and centred.
- Frame at `T.final + 1.0`: the key line is one word per line, huge (type at least 40% of the frame width per character row), none clipped, alternating colours.
- Frame at the last second: plain `--bg`, no text.
- `audio-report`: peak below -1 dBFS, no silent gap over 0.6 s, the drop-out under the wipe is audible in the spectrogram (drums and bass stop, whoosh continues).
