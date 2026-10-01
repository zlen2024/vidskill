---
name: manim-hyperframes-vertical
description: |
  Trigger when the user wants a LONG-FORM or VERTICAL (9:16) explainer that mixes Manim maths/diagram scenes with richer visuals: colourful animated backgrounds, sparkle/confetti FX, burned-in captions, voice-over and music, in one composited video (e.g. "buat video vertical panjang 10-30 minit", "combine manim dan hyperframes", "TikTok/Reels explainer with Manim", a full + short cut of the same topic).
  Provides a tested pipeline: transparent Manim scenes (portrait kit `Timed`, elastic pacing from the narration length) + HyperFrames looping backgrounds and alpha FX + ffmpeg compositor (captions, fades, ducked music) + layout peeks and contact sheets. Also records the pitfalls that cost hours (webm alpha, Scene.wait recursion, Windows long paths, memory, glyphs).
  Use together with manimce-best-practices (Manim API) and /hyperframes (background/FX compositions). NOT for short style clips (use motionprompt-styles), NOT for plain landscape Manim episodes (use the channel's tools/render.py flow), NOT a TTS tool (voice WAVs come from anywhere).
---

# Manim + HyperFrames, vertical long-form

Pipeline in one picture (per scene, all stitched by `scripts/vbuild.py`):

```
HyperFrames background loop (mp4, 12 s, periodic)  ┐
Manim scene, TRANSPARENT webm (portrait kit)        ├─ ffmpeg overlay ─ + HyperFrames alpha FX (mov) ─ + caption PNGs ─ + voice ─ fade ─> scene.mp4
                                                    ┘                                                                              │
all scenes concat + synthesised music/sfx, ducked by the voice (sidechain) ────────────────────────────────────────────────────────┴─> final.mp4
```

Read first: `rules/pitfalls.md` (do not repeat these), then `rules/pacing.md` and `rules/layout.md` before writing scenes; `rules/content-and-process.md` for scripting from papers.

## Quick start

```bash
SK=.claude/skills/manim-hyperframes-vertical
python $SK/scripts/vbuild.py init                 # copies channel/vert.py + vbuild_assets/{hf_bg,hf_fx} (project root = cwd or $VB_ROOT)
python $SK/scripts/vbuild.py new 07_topic         # episode skeleton from examples/mini
cd videos/07_topic && python narration.py && python build_scenes.py && cd ../..
python $SK/scripts/vbuild.py bgs && python $SK/scripts/vbuild.py fx         # once per project (palettes.json / FX_SPECS)
# voice: any TTS -> videos/07_topic/audio/<Scene>.wav   (no TTS yet? `vbuild.py placeholders 07_topic` makes silent stand-ins)
python $SK/scripts/vbuild.py pace 07_topic        # needs audio; writes pace.json
python $SK/scripts/vbuild.py peek 07_topic S01_Hook@0 -q l                  # layout stills (see rules/layout.md)
python $SK/scripts/vbuild.py manim 07_topic -q l -j 2                      # transparent webm per scene
python $SK/scripts/vbuild.py comp  07_topic -q l                           # composite + captions + voice
python $SK/scripts/vsheet.py 07_topic l S01_Hook S02_Idea                  # contact sheet: LOOK at it before going to -q h
python $SK/scripts/vbuild.py final 07_topic -q l                           # concat + music  -> videos/07_topic/out/07_topic_l.mp4
```

Final quality: repeat `manim`/`comp`/`final` with `-q m` (720x1280) or `-q h` (1080x1920). Draft with `-q l` first, always.

## Episode layout

```
videos/<ep>/narration.py      -> narration.json {"lead_in":0.4,"scenes":{Scene: text}}   (plus plan.json: pal, chapter, fx per scene)
videos/<ep>/parts/p*.py       -> build_scenes.py concatenates into scenes.py (Manim wants every Scene class in the loaded file)
videos/<ep>/audio/<Scene>.wav voice per scene (any TTS)
videos/<ep>/pace.json         generated; out/ media/ generated
```

Several episodes (e.g. a full and a short cut) can share one `parts/p0_header.py`; the short episode's `build_scenes.py` prepends the full episode's header.

## Scene authoring contract (kit = `channel/vert.py`)

- `class S03_X(Timed)`; helpers `card, pill, TB, T, M, glow_dot, chip_icon, energy_curve, langevin, pixel_icon/pixel_grid` (see the file). Palette tokens `INK, PINK, ORANGE, YELLOW, MINT, CYAN, BLUE, VIOLET`.
- Continuous processes: `self.play(..., rate_func=linear, elastic=True)`. Discrete reveals: plain `self.play`. Holds: `self.wait(x)`. Phase change: `self.clear_out()`; **never as the last statement**.
- Time-dependent mobjects: `ValueTracker` + updater, seeded numpy RNG only. Never wall-clock, never unseeded randomness.
- Keep everything inside the stage (y from +4.55 to -3.75) and the safe zones; captions are composited below.

## Files

- `scripts/vbuild.py` (all commands), `scripts/_measure.py` (dry-run duration probe), `scripts/vsheet.py` (contact sheets), `scripts/kit/vert.py` (portrait Manim kit, copied to `channel/vert.py`).
- `templates/hf_bg` (looping gradient/bokeh/sparkle background, `palettes.json`), `templates/hf_fx` (transparent `burst`, `rain`, `sweep`, rendered with `--format mov`).
- `examples/mini` (two working scenes + narration/plan). `rules/` as listed above.
- Music uses `motionprompt-styles/scripts/synth.mjs` when that skill is installed (otherwise the final has no music).

## Honest limits

Draft-quality (`-q l`) was verified end to end; full-length `-q h` renders take hours, so budget for them. Sound and caption timing are estimates (captions are split proportionally to sentence length, not forced-aligned).
