---
name: qa-checklist
description: Every gate before delivering a MotionPrompt video: audit, check, frames at every beat, directive coverage, audio report, loop, safety, comparison with the original, final render verification
metadata:
  tags: qa, checklist, verify, gates
---

# QA checklist

Do not report "done" before every applicable box is true. Report failures faithfully.

## A. Before building

- [ ] Read `styles/<slug>.md` completely; inputs gathered; nothing invented.
- [ ] `node scripts/audit.mjs <slug>` passes (style file matches the original prompt).
- [ ] Scaffold ran cleanly (`timing.mjs`, `cues.mjs`, `mix.wav`, `BRIEF.md`).

## B. Composition

- [ ] `npm run check` reports **0 errors, 0 warnings** in Lint, Runtime, Layout, Motion; Contrast: all text checks pass. (Info-level `text_box_overflow` for text that slides in from off-frame is expected.)
- [ ] No `Math.random`, `Date.now`, `requestAnimationFrame`, `repeat: -1`, network at render time (`grep` the HTML/JS).
- [ ] Fonts vendored; no named fallback fonts in `font-family`.
- [ ] `<audio id="mix">` present when sound is on (an id-less audio renders silent).
- [ ] Every on-screen string comes from `content.mjs`; times from `timing.mjs`.

## C. Look at real frames

```bash
node scripts/frames.mjs renders/<slug>.draft.mp4 --beats timing.mjs --offset 0.7
```

Open the sheet (Read tool) and check, for each beat:

- [ ] The intended thing is visible and settled; nothing clipped or overlapping; text inside the safe area.
- [ ] Text readable at phone size (about 360 px wide).
- [ ] Colours match the tokens (or the user's brand colours).
- [ ] The style's own QA bullets (bottom of `styles/<slug>.md`) are true.
- [ ] `BRIEF.md`: every directive ID ticked because you **saw** it.

## D. Loop and ending

- [ ] Last frame vs frame 0 as the style specifies (empty scene, same pose, periodic motion). Extract them: `ffmpeg -sseof -0.05 -i out.mp4 -frames:v 1 last.png` and frame 0.
- [ ] No hard pop at the loop point; music tail folded (no click).

## E. Sound

- [ ] `node scripts/audio-report.mjs assets/audio/mix.wav --expect <D> --spec spec.png` says `audio OK`.
- [ ] Spectrogram shows the hits at the beats (kicks on phrases, pops on steps, drops where designed).
- [ ] No clipping; peak -8 to -1 dBFS; no silent gap in the middle.
- [ ] For voice styles: no synthesised speech; the user's audio is louder than everything else.
- [ ] Say in the report that the sound was verified objectively, not by ear.

## F. Safety and content

- [ ] No flashing above 3 per second; no large bright strobes.
- [ ] Style guardrails respected (see the *Guardrails* section: never flashing, no vocals, no real landmarks, never invent data...).
- [ ] Malaysian styles: `rules/malaysian-styles.md` (flag geometry, no Quranic text or people, no deities).
- [ ] No third-party logos or copyrighted music.

## G. Compare with the original

```bash
node scripts/prompt.mjs <slug> --ratio 9:16 --duration <D> --sound music     # the site's prompt with your settings
node scripts/compare.mjs renders/<slug>.draft.mp4 <slug>                     # frames next to the site's sample clip
```

- [ ] Every requirement in the original prompt is visible or audible in your video (walk the directive list).
- [ ] The palette and type look like the sample (mean-colour distance is informational: under about 60 is similar; different content changes it).
- [ ] Differences are intentional (different content, ratio) or fixed; if the **recipe** was wrong, fix `styles/<slug>.md` too and re-run `audit.mjs`.

## H. Final render

- [ ] `npm run render` (or `-q delivery`); one worker.
- [ ] `ffprobe`: h264 video, aac audio (if sound on), expected `WxH` and duration (within 0.1 s), size > 0.
- [ ] Extract 3 frames from the **final** file (start, middle, end) and look at them.
- [ ] Copy the MP4 to the requested location; give the path and settings.

## Report template (Malay or the user's language)

1. Where the file is, size, ratio, length, style.
2. What text, colours, assets were used; what you assumed.
3. What was verified (check, frames, audio report, comparison) and any limits (sound not heard; performance; missing assets).
4. One line offering changes.
