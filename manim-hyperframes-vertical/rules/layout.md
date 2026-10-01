# Layout, compositing and checking

## Portrait Manim kit (`channel/vert.py`)
- `manim -ql/-qm/-qh` set a landscape size; the kit swaps width/height and sets `frame_width = 8`, `frame_height = 14.22` BEFORE any mobject is created, plus `transparent` and `frame_rate` (env `VFPS`, default 30). Output folders are `854p30`, `1280p30`, `1920p30`.
- Stage coordinates (units): chapter pill at y = +5.5, stage y from +4.55 to -3.75, captions are drawn by the compositor around y = -4.7 (0.828 of the frame height). Platform UI covers about the top 1.5 and bottom 2.6 units, so nothing essential outside the stage.
- Text on cards: dark ink (`INK`) on near-opaque white cards over the colourful background; coloured glows do not read on light backdrops.
- Fit text with `scale_to_fit_width(<=6.4)`; check long lines (e.g. a 34 pt bold two-line statement overflowed a 7-unit card).

## Layers (compositor, `comp`)
1. Background mp4 loop (`vbuild_assets/bg/<palette>.mp4`, 12 s, periodic). Each scene starts at `cumulative_time % 12` so palettes continue without a jump (`-stream_loop -1 -ss`).
2. Manim webm (alpha) padded with `tpad=stop_mode=clone` if shorter than the voice.
3. FX overlays from `plan.json` (`{"k":"burst","t":0.4}` or `"f":0.8` as a fraction of the scene) plus a default `sweep` at the start (`"sweep": false` to disable). FX are HyperFrames alpha MOV, rendered once (`vbuild.py fx`).
4. Caption PNGs (PIL, rounded white pill) with 0.18 s fades, timed proportionally to sentence length across the voice. Sentences > 105 chars are split at `, : ;`.
5. White fade in/out (0.28 s) between scenes, voice `loudnorm`, optional music (`synth.mjs`) ducked by `sidechaincompress` keyed on the voice.

## HyperFrames templates
- `hf_bg`: pure function of time, periodic in the loop length (every sine uses whole cycles); gradient + blobs + bokeh + sparkles + one light sweep. Add a palette in `palettes.json`, then `vbuild.py bgs --force`.
- `hf_fx`: `fx.js` selects `burst | rain | sweep`; transparent canvas; render `--format mov` (ProRes 4444, 2-7 s render). New effect: add a branch in `index.html` and an entry in `FX_SPECS`.
- HyperFrames rules still apply (single paused GSAP timeline registered at `window.__timelines["main"]`, `hf-seek`-driven drawing via `MP.onSeek`, local fonts, `data-layout-allow-overflow` on full-bleed canvases).

## Checking without waiting for a render
- `vbuild.py peek <ep> Scene@N -q l`: Manim still of the scene frozen before its Nth `clear_out` (0-based) composited on the palette; the dark band marks the caption zone. Frozen later phases may show leftovers of earlier ones: that is a peek artifact, not a bug.
- `vsheet.py <ep> l Scene...`: contact sheet (frames at 10/30/50/70/92 % of each composed scene). Check: blank tails, text outside cards, overlaps with captions, stale elements.
- Use `placeholders` audio to run the whole chain (pace, manim, comp, final) before any voice exists.
