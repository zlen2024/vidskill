---
name: chat-story
title: Chat story
description: A phone chat that pops to life: springy message bubbles, typing dots, read ticks, an emoji reaction and a voice note with a waveform, scrolling as the conversation grows. For testimonials, dialogues, customer stories, FAQs and social promos told as a chat.
tags: ["social","promo","text"]
library: GSAP
sound: true
difficulty: 3
default_duration: 12
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Chat story

**One-liner:** the message becomes a short friendly conversation on a phone: sent messages pop in on the right in the accent colour, replies on the left in white; before each reply three typing dots bounce and the header says "typing..."; ticks turn colour once read; a heart reaction pops onto a bubble and a voice note plays with a tiny waveform; the chat scrolls as it grows.
**Best for:** testimonials, customer conversations, product Q&A, offers told as a DM thread, storytelling hooks.
**Avoid when:** long text or dense information; the chat must stay short and easy to read.

## Inputs to gather
- The conversation (if the request has one use it word for word), else write 5 to 7 short natural lines. Two participants (name/initials, status). Whether one message is a voice note and where a reaction goes. Brand colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | Turn the message into a short friendly phone chat; use the user's conversation word for word if given, else write a few short natural lines | `CONTENT.lines` as `[who, text]` pairs |
| L2 | Draw my own clean chat app, not a real brand: header with a round avatar (initials or small drawing), a name and status, a dotted wallpaper, a message bar at the bottom | Custom DOM UI, own colours and icons; nothing resembling a real app's logo or exact layout |
| L3 | Messages pop in one by one with a springy scale from the bubble tail: sent on the right in the accent colour, replies on the left in white | Bubble `transformOrigin` at the tail corner; `MP.spring` scale 0.6 to 1 (or `back.out(2)`) |
| L4 | Before each reply, three typing dots bounce in a small bubble and the header says "typing..."; sent messages show small ticks that turn colour once read; the words of a sent message appear in the message bar first, then fly into the chat | Dots bounce by phase-shifted `sin`; header text swapped by time; ticks colour change at read time; the composer text types then a clone moves to the chat |
| L5 | Lively details: an emoji or heart reaction pops onto a bubble, and one voice note bubble with a small waveform that plays | Reaction chip spring; voice note waveform bars with a moving playhead (bars heights from seeded values) |
| L6 | The conversation scrolls up smoothly as it grows; keep every bubble short and easy to read | `#chat` container `y` tween up by each new bubble's height |
| L7 | In wide and square frames show the phone floating on a soft background with a gentle bob; in tall frames the chat can fill the whole screen | Layout switch by ratio; bob `y = 6 * sin(t)` |
| L8 | At the end clear the chat so it loops back to the start | Bubbles fade/slide out, header returns to idle |
| T1 | A clean friendly sans (DM Sans), medium for messages and bold for the name | DM Sans 500/700 |
| T2 | Brand colours if given, else warm sand background, dark ink text, violet sent bubbles/buttons, coral avatar and reactions | Tokens below |
| S1 | Soft keyboard taps while a message types in the bar (one per letter, a lower tap for spaces), a quick whoosh when it sends, a pop as each bubble lands (brighter for sent on the right, lower and rounder for replies on the left), soft blips with the typing dots, a springy pop with a sparkle for a heart, small blips when a voice note starts and stops, two tiny clicks as the read ticks turn on; every tone original, never a copy of a real app's alert sounds | Cue table below |
| S2 | Light casual lo-fi bed about 80 bpm: soft electric piano chords, round bass, dusty laid-back drums, a little vinyl crackle; well under the effects; loops | `lofi` at 80 bpm |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 12` |
| O3 | GSAP HTML animation rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #f6eee6;
--ink: #1f1c2c;
--accent: #5b3df5;
--accent2: #ff7a59;
--bubble: #ffffff;
```
```json fonts
[{"family": "DM Sans", "id": "dm-sans", "variable": true, "weightRange": "100 1000", "role": "all text"}]
```

## Beat sheet
For six messages (three exchanges).
```json beats
{"bpm": 80, "events": [
  {"id": "typed", "repeat": {"n": 3, "fromFrac": 0.05, "everyFrac": 0.3}, "label": "sent message types in the bar"},
  {"id": "sent", "repeat": {"n": 3, "fromFrac": 0.12, "everyFrac": 0.3}, "label": "sent bubble lands"},
  {"id": "dots", "repeat": {"n": 3, "fromFrac": 0.17, "everyFrac": 0.3}, "label": "typing dots"},
  {"id": "reply", "repeat": {"n": 3, "fromFrac": 0.23, "everyFrac": 0.3}, "label": "reply bubble lands"},
  {"id": "read", "repeat": {"n": 3, "fromFrac": 0.2, "everyFrac": 0.3}, "label": "ticks turn read"},
  {"id": "heart", "at": 0.55, "label": "heart reaction"},
  {"id": "voice", "at": 0.66, "label": "voice note plays"},
  {"id": "clear", "at": 0.93, "label": "chat clears"}
]}
```

## Build recipe
- **UI:** header (avatar circle with initials, name, status text), a scrolling `#chat` column, a composer bar. Wallpaper: a subtle dot pattern via `radial-gradient` at 6% opacity.
- **Bubbles:** DOM divs with rounded corners and a tail (`::after` triangle or an SVG). Stagger heights measured once at build (`offsetHeight`) so the scroll offsets are known; set final positions statically and animate `y` from the scroll offset.
- **Typing dots:** 3 circles with `y = -4 * max(0, sin(t * 8 - i * 0.7))`; the header status swaps between "online" and "typing..." at the dots window.
- **Composer:** the sent message text types letter by letter into the composer, then the composer clears while the bubble appears (bubble start = `sent`).
- **Voice note:** 20 bars with seeded heights; played portion coloured by `(t - T.voice) / dur`.
- **Pitfalls:** no `<br>` in bubbles; keep each bubble to 2 lines; avoid real-app iconography and sounds.

## Sound plan
Every tone is original, never a copy of a real app's alert sounds. How each effect of the brief is covered:
- **Soft keyboard taps while a message types into the message bar, one per letter and a lower tap for spaces:** `typing` at `typed*`.
- **A quick whoosh when it sends:** `swish` at `sent*`.
- **A pop as each bubble lands, brighter for sent messages on the right, lower and rounder for replies on the left:** `pop` (high) at `sent*`, `pop` (low) at `reply*`.
- **Soft little blips with the typing dots:** `ticks` of `blip` at `dots*`.
- **A springy pop with a sparkle for a heart reaction:** `boing` + `sparkle` at `heart`.
- **Small blips when a voice note starts and stops playing:** `blip` at `voice` and `voice+2.2`.
- **Two tiny clicks as the read ticks turn on:** two `click` at `read*`.
```json cues
[
  {"at": "typed*", "kind": "typing", "n": 16, "dt": 0.05, "spaceEvery": 5, "vol": 0.35},
  {"at": "sent*", "kind": "swish", "dur": 0.15, "vol": 0.4},
  {"at": "sent*", "kind": "pop", "freq": 720, "vol": 0.7},
  {"at": "dots*", "kind": "ticks", "n": 4, "span": 0.5, "tick": "blip", "f0": 500, "f1": 620, "vol": 0.3},
  {"at": "reply*", "kind": "pop", "freq": 420, "vol": 0.7},
  {"at": "read*", "kind": "click", "freq": 1700, "vol": 0.4},
  {"at": "read*+0.08", "kind": "click", "freq": 2100, "vol": 0.4},
  {"at": "heart", "kind": "boing", "freq": 300, "dur": 0.4, "vol": 0.6},
  {"at": "heart", "kind": "sparkle", "dur": 0.6, "vol": 0.35},
  {"at": "voice", "kind": "blip", "freq": 880, "dur": 0.08, "vol": 0.4},
  {"at": "voice+2.2", "kind": "blip", "freq": 660, "dur": 0.08, "vol": 0.4},
  {"at": "clear", "kind": "swish", "dur": 0.3, "vol": 0.3}
]
```
```json music
{"preset": "lofi", "bpm": 80, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16:** the chat fills the screen (header pinned at the top inside the top safe margin, composer above the bottom safe zone).
- **16:9 / 1:1 / 4:5:** a floating phone (about 70% of the height) centred on a soft `--bg` with a gentle bob and a soft shadow.

## Loop & ending
The chat clears (bubbles slide out), the header returns to idle; frame 0 is the empty chat with the first message about to type.

## Guardrails
- Draw a clean chat app of your own, not a real brand's.
- Make every tone original, never a copy of a real app's alert sounds.
- Keep every bubble short and easy to read; use the user's conversation word for word when given.

## QA
- Frame at `reply2 + 0.5 s`: the chat scrolled so the newest bubble is fully visible; earlier bubbles partly off the top.
- Frame at `dots1 + 0.3 s`: header says "typing...", dots mid-bounce.
- The read ticks change colour after `read*`; the voice note bar fills left to right.
- No real-brand icons or wording; audio has no notification-like copy of common apps.
