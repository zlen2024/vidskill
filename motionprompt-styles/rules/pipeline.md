---
name: pipeline
description: End-to-end procedure from a style request to a delivered MP4 (scaffold, build, checks, draft, compare, final), with the project layout and commands
metadata:
  tags: pipeline, workflow, scaffold, render, hyperframes
---

# Pipeline: style request to MP4

## 0. Prerequisites (this machine)

Node 22+ (24 here), FFmpeg, Chrome, `npx hyperframes` (v0.8.96 pinned by the scaffold), network the first time (npm cache at `~/.cache/motionprompt-vendor`). RAM is tight (about 2 GB free): render with `-w 1`, one render at a time.

## Shortcut: `scripts/make.mjs`

`node <skill>/scripts/make.mjs <slug> --out <dir> [scaffold options] [--repeat id=auto] [--final]` runs steps 2 to 5 in one go when the style has a finished build in `examples/<slug>/`. For other styles it scaffolds and stops; build `index.html` (step 3), then `make.mjs --project <dir> [--final]` regenerates the sound and runs check, render, ffprobe and the frame sheet. You still look at the sheet and report as in step 6.

## 1. Understand and choose

1. Read the user's request. Identify: the **message** (exact words), **style**, **ratio**, **length**, **sound**, **assets** (photos, logo, screenshots, audio), **brand colours**, **language**.
2. Style: named by the user, or chosen with `rules/style-picker.md`. Read `styles/<slug>.md` in full.
3. Missing inputs: use *Inputs to gather* in the style file. Ask one short question only for what blocks the work (never invent numbers, prices, dates or claims). Reasonable defaults: ratio 9:16, sound `music`, the style's default length.

## 2. Scaffold

```bash
node .claude/skills/motionprompt-styles/scripts/scaffold.mjs <slug> --out <dir> --ratio 9:16 --duration <s> \
     --text "Line one|Line two" [--key "Slogan"] [--lang ms|en] [--sound off|effects|music] [--brand "bg=#..,accent=#.."] [--short 1080]
```

Produces `<dir>/`:

| File | Purpose |
|------|---------|
| `index.html` | The composition (starts as a placeholder card: replace the marked BUILD region) |
| `timing.mjs` | `D`, `BPM`, `T` (beat id to seconds, scaled to the length, tempo snapped to whole beats). **Single source of truth** for visuals and sound |
| `content.mjs` | The user's `lines`, `key`, `lang`, `brand`. Every on-screen string comes from here |
| `cues.mjs` | Sound cue sheet resolved against `T` (edit to add cues; wildcard `phrase*`, `rise`, dynamic `"D"`, `"rest"`, `"until:id"`) |
| `assets/audio/mix.wav` | Synthesised effects + music (`npm run sound` regenerates) |
| `assets/vendor`, `assets/fonts`, `lib/mp.js` | Local GSAP/Three/fonts and the `MP` helper kit |
| `BRIEF.md` | Directive checklist (one line per bullet of the original prompt) |
| `package.json` | Scripts: `check`, `preview`, `draft`, `render`, `sound` |

Restore vendored assets and audio in an existing project (does not touch your HTML): `scaffold.mjs <slug> --out <dir> --assets-only`.

## 3. Build

- Follow the style's **Directive map** row by row and its **Build recipe**. Keep the recipe's structure but write your own code.
- Lay out the static end state first (DOM/canvas layers), then animate to and from it.
- Read `rules/seekable-canvas.md` before writing any canvas, WebGL or Three.js code.
- If the real content differs from the defaults (more phrases, more rooms, more stops), **edit `timing.mjs`** (repeat counts and spacing) and regenerate sound.
- Tick each ID in `BRIEF.md` only when you have seen it in a rendered frame.

## 4. Verify (see `rules/qa-checklist.md`)

```bash
npm run check                                   # lint + runtime + layout + motion + contrast: must be clean
npm run draft                                   # -q draft -w 1  (about 25 s for 8 s at 1080x1920 with light content)
node <skill>/scripts/frames.mjs renders/<slug>.draft.mp4 --beats timing.mjs --offset 0.7   # look at the sheet
node <skill>/scripts/audio-report.mjs assets/audio/mix.wav --expect <D> --spec /tmp/spec.png
node <skill>/scripts/compare.mjs renders/<slug>.draft.mp4 <slug>                           # vs the site's sample
```

Iterate: fix, re-run `check`, re-render only what changed. Use the draft for layout and timing, the final for polish.

## 5. Final render and delivery

```bash
npm run render                     # -w 1, default quality (looks); add -q delivery for the highest quality
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,duration -of csv=p=0 renders/<slug>.mp4
```

Confirm: H.264 video and AAC audio (when sound is on), the expected size and duration, a non-empty file. Copy the MP4 where the user wants it and give the path. State the settings used and the honest limits.

## 6. Handing back

Reply in the user's language. Include: the file, ratio and length, style, what text and colours were used, what you assumed, anything you could not verify (sound was checked with levels and a spectrogram, not by ear), and one line offering changes (slower, bigger text, different colours, another ratio).

## Notes

- Preview in Studio for the user: `npx hyperframes preview --background` (then `--status`, and `--stop` when done).
- Ratios other than 9:16, 1:1, 16:9 (for example 4:5): the scaffold sets `data-width/height`; render without `--resolution`.
- `hyperframes` skills own the composition contract; if they conflict with this file, follow them and note the difference in the style file.
