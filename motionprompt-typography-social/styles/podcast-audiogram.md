---
name: podcast-audiogram
title: Podcast audiogram
description: A podcast or interview clip card: a round speaker portrait with a pulsing ring, live sound bars, big karaoke captions with a gliding word highlight, show and episode labels, and a progress bar with a time counter. Syncs to the user's audio clip when supplied. For podcast promos, quotes and interview snippets.
tags: ["social","text"]
library: GSAP
sound: true
difficulty: 4
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Podcast audiogram

**One-liner:** a clean, bold clip card: a round speaker photo (or a friendly drawn portrait or initials) with a ring that pulses with the voice, the show name, episode label and speaker name and role, a row of bars that moves with the voice (big when they talk, calm in pauses), big karaoke captions a few words at a time with the spoken word on a gliding coloured highlight, and a progress bar with a time counter at the bottom.
**Best for:** podcast promos, interview quotes, a talk snippet, a voice-note quote card.
**Avoid when:** there is no transcript or quote (ask for it). Never make up a voice or speech.

## Inputs to gather
- The transcript or quote (with word timings if the user has them), the user's audio clip (optional but preferred), speaker photo, name and role, show name, episode label. Brand colours (one strong accent).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | Make a podcast or interview clip card; the transcript or quote is the captions; if audio is attached, sync captions and waveform to it | `CONTENT.words = [{w, start, end}]` (from the user's timings or a transcription via `npx hyperframes transcribe`); audio placed as `<audio id>` with the user's file |
| L2 | A round speaker photo (attached, or a simple friendly portrait or initials avatar); a ring around it pulses gently with the voice | Circle-cropped `<img>` or SVG; ring `scale = 1 + 0.06 * level(t)` |
| L3 | Show the show name, an episode label, and the speaker's name and role if given | DOM labels near the portrait: show name (small caps), episode label chip, speaker name (extra bold) and role (medium) |
| L4 | A lively waveform or row of bars moves in time with the voice: big when they talk, calm in the pauses | `level(t)` derived from the audio (precompute an amplitude envelope with ffmpeg into `envelope.json`) or, without audio, a soft synthetic envelope from the caption timings |
| L5 | Big bold captions appear a few words at a time, karaoke style: the word being spoken sits on a coloured highlight that glides from word to word, spoken words stay solid, the next words are faint | Page = 3 to 5 words; per-word spans; highlight = a rect tweened to each word's box over its `[start, end]`; colours by state |
| L6 | A progress bar and a time counter at the bottom that fill as the clip plays | Bar `scaleX = t / D`; counter `mm:ss` |
| L7 | Stack everything in tall frames; in wide frames put the portrait on the left and captions on the right; clean, bold, uncluttered | Layout by ratio |
| T1 | A bold rounded grotesque (Bricolage Grotesque), extra bold for captions and names, medium for small labels | Bricolage Grotesque 800/500 |
| T2 | Brand colours if given, else warm off-white background, near-black text, one strong orange-red accent for the highlight, waveform and progress, soft peach behind the portrait | Tokens below |
| S1 | Never make up a voice or fake speech: a short soft intro sting, a very quiet "on air" room tone, a gentle click as each caption page changes, a soft tick when the progress bar reaches the end; when the user attaches audio, that audio is the main sound and everything else stays quietly under it | Cue table below; the user's clip is mixed by HyperFrames as a second `<audio>` |
| S2 | Warm podcast-intro bed about 80 bpm: soft electric piano chords, round bass, a small bell melody, a light beat with a rim click and shaker; dips a little while captions are on; well under the effects; loops | `podcast-intro` preset (lower gain if a voice clip is present) |
| S3 | All sound made in code (except the user's own audio clip) | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length (the clip length if audio is attached) | scaffold `--duration` = clip length |
| O3 | GSAP + canvas HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #f3eee4;
--ink: #16140f;
--accent: #ff4a1c;
--peach: #ffd6c2;
```
```json fonts
[{"family": "Bricolage Grotesque", "id": "bricolage-grotesque", "variable": true, "weightRange": "200 800", "axis": "wght", "role": "all text"}]
```

## Beat sheet
```json beats
{"bpm": 80, "events": [
  {"id": "intro", "at": 0.0, "label": "intro sting, card appears"},
  {"id": "page", "repeat": {"n": 4, "fromFrac": 0.1, "everyFrac": 0.2}, "label": "caption page changes"},
  {"id": "end", "at": 0.97, "label": "progress reaches the end"}
]}
```
When word timings exist, derive `page*` and word highlight times from them instead; the beats above are the fallback (even spacing).

## Build recipe
- **Timing data:** `CONTENT.words` drives everything: pages are consecutive groups of 3 to 5 words; each word span carries `data-start/data-end`. If the user gives no word timings and audio exists, transcribe (`npx hyperframes transcribe <audio>`); if there is no audio, spread words evenly over `D`.
- **Envelope:** `ffmpeg -i clip.mp3 -af "aresample=100,asetnsamples=n=1000" ...` or compute RMS per 40 ms in Node into `envelope.json`; the bar heights and the ring pulse are `smooth(envelope[floor(t / 0.04)])`.
- **Highlight glide:** compute each word's rect (after fonts load); tween `x, width` of the highlight between consecutive word rects at the boundary times; spoken words `opacity 1`, upcoming `0.3`.
- **Audio:** the user's clip is a separate `<audio id="voice" src=... data-start="0" data-duration=...>`; the synth mix (`mix.wav`) plays quietly under it (music `gain` low, no effects that mask speech); `data-volume` of the clip 1.0.
- **Pitfalls:** never synthesise speech; keep the bars a pure function of `t`; captions must stay inside the safe area; page changes never happen mid-word.

## Sound plan
Never make up a voice or fake speech: no voice is synthesised. The effects open with a short, soft intro sting and keep a very quiet "on air" room tone under everything. How each effect of the brief is covered:
- **A short, soft intro sting:** a soft `run` of two `chime` notes at `intro`.
- **A very quiet "on air" room tone under everything:** a low `hum`/`wind` bed at very low volume for the full length.
- **A gentle click as each caption page changes:** `click` at `page*`.
- **A soft tick when the progress bar reaches the end:** `tick` at `end`.
- **The user's own audio clip is the main sound:** captions, word highlights and waveform follow it; the music ducks under it.
```json cues
[
  {"at": "intro", "kind": "run", "inst": "chime", "from": "C5", "n": 2, "dt": 0.15, "scale": "major", "len": 1.2, "vol": 0.45},
  {"at": "intro", "kind": "hum", "freq": 60, "harm": 3, "dur": "D", "vol": 0.05},
  {"at": "page*", "kind": "click", "freq": 1500, "vol": 0.4},
  {"at": "end", "kind": "tick", "freq": 2400, "vol": 0.4}
]
```
```json music
{"preset": "podcast-intro", "bpm": 80, "gain": 0.7, "duck": 0.6}
```

## Layout by aspect ratio
- **9:16 / 4:5:** show name and episode at the top, portrait circle centred, bars under it, captions in the middle-lower band (large), progress bar above the bottom safe zone.
- **16:9:** portrait and bars on the left, show name above; captions on the right; progress across the bottom.
- **1:1:** portrait top-left, captions below, bars beside the portrait.

## Loop & ending
The progress bar completes, captions clear, the ring rests; the card returns to the intro state at frame 0.

## Guardrails
- Never make up a voice or fake speech: sound effects stay soft and under the user's audio.
- If the user attaches their own audio clip, it is the main sound and the captions, word highlights and waveform must follow it.
- Keep it clean, bold and uncluttered.

## QA
- Frame at a word midpoint: that word is highlighted and solid, previous words solid, next words faint.
- Bars peak at loud syllables and sit low in pauses (compare with the audio envelope).
- Progress bar and time counter agree with the clip length; captions never overflow the safe area.
