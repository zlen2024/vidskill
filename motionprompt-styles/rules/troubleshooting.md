---
name: troubleshooting
description: Known failures and fixes for HyperFrames builds, fonts, audio, Three.js/WebGL, canvas, rendering speed and memory, npm vendoring and the scaffold on Windows
metadata:
  tags: troubleshooting, errors, lint, render, audio, fonts, windows
---

# Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `check` fails: `font_family_without_font_face: impact` | A named fallback font in `font-family` | Use only `"Family", sans-serif`; every named family needs `@font-face` |
| Text renders in a fallback font | Timeline/measurement ran before the font loaded | Build inside `MP.fontsReady([...]).then(...)`; check the `@font-face` path and weight |
| Render has **no sound** | `<audio>` without `id`, wrong `src`, `sound off`, or the file is missing | Add `id="mix"`, check `assets/audio/mix.wav` exists (`npm run sound`), `ffprobe` shows an aac stream |
| Blank / frozen render | Timeline registered before it was built, key mismatch, error in the module script | Register `window.__timelines["main"]` **last**; key equals `data-composition-id`; look at `check` Runtime errors |
| `Composition has zero duration` (Three.js) | Root `data-duration` missing | The scaffold sets it; keep it |
| Canvas/WebGL shows only frame 0 | Drawing on a timer or rAF | `MP.onSeek(t => draw(t))` |
| Two renders differ | Non-determinism (`Math.random`, clocks, state carried between frames) | Seeded RNG; recompute from `t` (`rules/seekable-canvas.md`) |
| `gsap_css_transform_conflict` | CSS `transform` plus a GSAP tween on the same property | Centre with flex/`inset`; use `fromTo` |
| `gsap_animates_clip_element` | Tweening `visibility`/`autoAlpha`/`display` on a `.clip` | Animate a child, use `opacity` |
| Text overflows only in Malay | Longer strings | Re-run `MP.fitLine`; wrap with `max-width`; shorten |
| `text_box_overflow` / `canvas_overflow` (info) | Text sliding in from off-frame | Expected; add `data-layout-allow-overflow` if it should be silent |
| Contrast failures | Text on busy background or brand colour too light | Solid plate/scrim; use the style's ink colour |
| Render very slow (under 1 fps) | Heavy canvas (particles, blurs), transmission materials, large photos | Lower counts, offscreen pre-render, opaque materials, downscale images, `--short 720` for drafts |
| Out of memory / Chrome crash | Too many workers on 2 GB free | `-w 1`; close other apps; one render at a time |
| WebGL context lost | Software GL under load | Fewer objects; smaller `--short`; render again |
| `npm install` fails in the vendor step | Offline, proxy or npm cache problem | Retry online; set `MOTIONPROMPT_VENDOR` to a writable folder |
| `font file not found: ...-latin-400-normal.woff2` | The weight/style is not in the package | Check `node scripts/fonts.mjs --check <slug>`; adjust weights/styles in the style's fonts block |
| Chinese characters show boxes | No CJK font | `local()` OS font or a subset `woff2` (`rules/fonts.md`) |
| `unknown sound kind "xyz"` | Typo in a cue | `node scripts/synth.mjs --list` |
| `cue at="..." does not match a beat id` | Beat id not in `timing.mjs` | Fix the id or add the beat |
| Music out of step with visuals | Tempo changed after sync | Beat-driven styles: keep `BPM` from `timing.mjs`; do not set a different bpm in `cues.mjs`; `npm run sound` |
| Audio clicks at the loop | Something starting at `t=0` mid-wave | Keep the default fades; do not remove the 40 ms end fade |
| Paths break on Windows | Short names (`C:\Users\NAME~1`) or `~` in LaTeX-era paths | Keep media under the project folder; use forward slashes in HTML |
| Windows shell: heredoc/python patches corrupt backslashes | Escape handling | Edit files with the editor tools; avoid Python heredocs containing `\` |
| `lint` passes but the render is wrong | Lint cannot see visual bugs | Look at frames (`frames.mjs`), every beat |
| Playback works in Studio but not in render | Studio uses live time; render seeks | Test with `hyperframes snapshot` or `frames.mjs` on a draft render |

## When stuck

1. Run `npm run check` and read the first error; fix it before anything else.
2. Render a 2 s draft of just the failing part (`data-duration` shorter) and look at the frames.
3. Compare with `examples/kinetic-type/`, which is a known-good build.
4. `npx hyperframes docs troubleshooting` has the framework's own list.
