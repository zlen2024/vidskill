# Example: kinetic-type (built, rendered, compared)

A complete build of `styles/kinetic-type.md` for 9:16, 8 s, sound on, text
"Make it move | Say it loud | Own the beat | Ship today | Start now", key line "Make it move".

Result: 1080x1920 H.264 + AAC, 8.0 s, draft render in about 23 s (one worker). `npm run check` clean
(27/27 contrast checks pass). `scripts/compare.mjs` against the site's sample: mean-colour distance 16/441.

## What is here

| File | Note |
|------|------|
| `index.html` | The finished composition (GSAP; words stacked one per line when that is 1.3x bigger; key line MAKE / IT / MOVE; hard-cut backgrounds; wipe) |
| `timing.mjs` | Beat sheet at 127.5 bpm (130 snapped to whole beats in 8 s): `phrase1..5`, `final`, `wipe` |
| `cues.mjs` | Cue sheet incl. per-letter tick generation from `content.mjs` |
| `content.mjs` | The user's words |
| `preview/frames.png` | Real frames (settled words, key line) |
| `preview/audio-spectrogram.jpg` | Kicks land on phrase times; riser then boom at `final`; drop-out under the wipe |

## Restore and run

```bash
node ../../scripts/scaffold.mjs kinetic-type --out . --assets-only    # vendored GSAP, Anton font, lib/mp.js, mix.wav
npm run check && npm run draft
```

## What the comparison taught (now in the style file)

1. The key line is **one short slogan stacked one word per line**, not every phrase.
2. On tall frames a multi-word phrase should stack word by word when that gives at least 1.3x bigger type.
