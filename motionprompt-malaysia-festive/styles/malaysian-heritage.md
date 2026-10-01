---
name: malaysian-heritage
title: Malaysian heritage
description: A warm festive Malaysian scene in traditional motifs: wau bulan kites over a kampung sky, batik bunga raya drawing itself like wax then blooming in dye colours, and your title unrolling on a gold songket panel. For Hari Raya, Merdeka, Malaysia Day, local brands and greetings.
tags: ["malaysia","festive","text"]
library: GSAP
sound: true
difficulty: 4
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
---
# Malaysian heritage

**One-liner:** a calm, graceful vector scene: a warm kampung sky, one or two wau bulan kites rising and swaying, batik flowers drawn as cream wax lines that then soak with dye colours and bloom, and the headline on a songket panel framed by rising gold pucuk rebung.
**Best for:** greetings and brand messages for Hari Raya, Merdeka, Malaysia Day, Gawai/Kaamatan-neutral local occasions, a Malaysian brand.
**Avoid when:** the occasion needs strictly religious content (this style is cultural, not devotional), or a modern minimal tone. See `rules/malaysian-styles.md` for cultural accuracy.

## Inputs to gather
- Headline and an optional short second line in the other language (Malay or English). The occasion (chooses the motifs). Brand colours (songket gold stays the accent).

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | A warm festive scene in traditional motifs, chosen to suit the occasion; respectful; everything drawn as clean vector shapes | SVG only; motif set chosen per occasion (see recipe) |
| L2 | Open on a warm sky over a kampung and paddy fields: a rumah kampung on stilts, coconut palms, a soft low sun; small batik clouds draw themselves in | Layered SVG: sky gradient, sun, paddy bands, house on stilts, palms; batik clouds via `strokeDashoffset` |
| L3 | One or two wau bulan (Kelantan crescent-moon kite: wide wings, crescent tail, a bow on top with tassels, layered paper with floral cut-work) rise from below and fly, swaying, strings trailing to the ground | `wau()` SVG group; path motion by `sin`; string = quadratic curve from kite to a ground anchor |
| L4 | Batik motifs draw like wax from a canting as cream lines (bunga raya, leaves, awan larat spirals, clouds); rich dye colours soak in behind the lines; each flower opens as it blooms; a second, smaller flower blooms just after | Stroke draw (`strokeDashoffset`) in `--wax`; dye = fills clipped to the line art fading in with `scale/opacity`; bloom = petal `scale` stagger; second flower delayed 0.4 s |
| L5 | The headline sits on a songket panel that unrolls from the middle, framed by gold pucuk rebung triangles that rise one by one; a soft gold glint sweeps across | Panel `scaleX 0 to 1` from centre with patterned SVG fill; triangle row staggered `y`; glint = angled gradient bar moving across |
| L6 | Text in the user's language (Malay or English); an optional short second line repeats it in the other language | Two text lines; both from `CONTENT` |
| L7 | Calm and graceful; at the end the panel folds away, batik fades, kites drift back down so the video returns to the opening sky and loops | Reverse the panel, fade batik, kites eased down; last frame = first frame's sky |
| T1 | Elegant classic display font (Cinzel) in gold for the headline; friendly sans (Nunito) in spaced capitals for small text | Cinzel 600/700, Nunito 700 with `letter-spacing` |
| T2 | Brand colours if given (songket gold stays the accent), else deep maroon, royal blue, emerald, turmeric, bunga raya red, songket gold on a warm sky | Tokens below |
| S1 | Airy wind swelling as the kites rise with a light buzzing hum (the bow), soft brushy strokes as batik draws, gentle chime shimmer as colour soaks, bright gold chime sweep as the songket opens, soft gong when the headline lands, cloth swish as it folds, calm falling chimes at the end | Cue table below |
| S2 | Calm warm traditional feel: pentatonic melody on bamboo flute and a plucked string, slow gendang rhythm, low drone, dignified, no vocals or chanting, loops | `pentatonic-heritage` preset |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length | scaffold `--duration 15` |
| O3 | HTML animation with GSAP rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #f8d894;
--ink: #6e1129;
--accent: #d9a53a;
--blue: #1f3f8f;
--green: #0f6b4a;
--yellow: #f2b431;
--red: #c42a3e;
--wax: #fbefd6;
```
```json fonts
[
  {"family": "Cinzel", "id": "cinzel", "weights": [600, 700], "role": "headline"},
  {"family": "Nunito", "id": "nunito", "variable": true, "weightRange": "200 1000", "role": "small text"}
]
```

## Beat sheet
```json beats
{"bpm": 0, "events": [
  {"id": "sky", "at": 0.0, "label": "sky and kampung appear"},
  {"id": "clouds", "at": 0.05, "label": "batik clouds draw in"},
  {"id": "kites", "at": 0.12, "label": "wau bulan rise"},
  {"id": "wax", "repeat": {"n": 3, "fromFrac": 0.26, "everyFrac": 0.05}, "label": "batik lines draw like wax"},
  {"id": "soak", "at": 0.44, "label": "dye colour soaks in"},
  {"id": "bloom", "at": 0.5, "label": "flowers bloom, the second flower follows"},
  {"id": "panel", "at": 0.62, "label": "songket panel unrolls, rebung rise"},
  {"id": "gold", "at": 0.66, "label": "gold chime sweep"},
  {"id": "headline", "at": 0.7, "label": "headline lands, gong"},
  {"id": "glint", "at": 0.8, "label": "gold glint sweeps"},
  {"id": "fold", "at": 0.9, "label": "panel folds, batik fades"},
  {"id": "settle", "at": 0.94, "label": "kites drift down, calm chimes"}
]}
```

## Build recipe
- **Occasion motifs:** Hari Raya: ketupat, pelita, crescent, songket. Merdeka / Malaysia Day: hibiscus (bunga raya), stripes of the flag as a pattern only (never redraw the flag loosely), kites. Brand: bunga raya + wau. Keep it cultural and celebratory.
- **Wau bulan:** wide symmetric wings, a crescent-shaped tail below, a bow (busur) on top with two tassels, layered paper panels with floral cut-work (small repeated petal cutouts). Sway `rotation = 6 * sin(t * 1.6)`; string is a curved line to the ground.
- **Batik on canvas-free SVG:** author flowers as one `path` per outline (petals, veins) plus filled shapes underneath; the wax draw uses `strokeDasharray = pathLength`; the dye fill sits below the line art with `mix-blend-mode: multiply`. Awan larat = spiral path with `MP.noise1` wobble computed once.
- **Songket panel:** a rectangle with a repeated diamond/pucuk rebung pattern in gold on maroon; unroll by scaling from the centre; the rebung triangles row above and below rise in stagger.
- **Pitfalls:** do not tween `filter` on many paths; keep the headline out of the busy areas (panel is opaque); all easing calm (`sine.inOut`, `power2.out`), no bounce.

## Sound plan
How each effect of the brief is covered:
- **Soft airy wind that swells as the kites rise, with a light buzzing hum:** `wind` + a soft `hum` at `kites`.
- **Soft brushy strokes as the batik lines draw:** `scratch` (soft) at `wax*`.
- **Gentle chime shimmer as the colour soaks in:** `sparkle` + `chime` at `soak`.
- **Bright gold chime sweep as the songket opens:** `run` of `chime` notes at `gold`.
- **Soft gong accent when the headline lands:** `gong` at `headline`.
- **Cloth swish as it folds away:** `cloth` at `fold`.
- **A few calm falling chimes as the scene settles back:** `run` down of `chime` at `settle`.
```json cues
[
  {"at": "kites", "kind": "wind", "dur": 3.0, "vol": 0.45},
  {"at": "kites", "kind": "hum", "freq": 180, "harm": 4, "dur": 3.0, "vol": 0.18},
  {"at": "wax*", "kind": "scratch", "dur": 0.7, "freq": 1800, "jitter": 0.3, "vol": 0.35},
  {"at": "soak", "kind": "sparkle", "dur": 0.9, "lo": 2500, "hi": 6000, "vol": 0.45},
  {"at": "soak", "kind": "chime", "freq": 784, "dur": 1.6, "vol": 0.5},
  {"at": "gold", "kind": "run", "inst": "chime", "from": "G5", "n": 7, "dt": 0.09, "scale": "pentatonic", "len": 1.3, "vol": 0.6},
  {"at": "headline", "kind": "gong", "freq": 110, "dur": 2.8, "vol": 0.7},
  {"at": "fold", "kind": "cloth", "dur": 0.8, "vol": 0.5},
  {"at": "settle", "kind": "run", "inst": "chime", "from": "G5", "n": 4, "dt": 0.35, "scale": "pentatonic", "dir": "down", "len": 1.6, "vol": 0.45}
]
```
```json music
{"preset": "pentatonic-heritage", "bpm": 72, "gain": 1, "duck": 0.5}
```

## Layout by aspect ratio
- **9:16:** sky and kites in the upper 45%, songket panel in the middle band, batik flowers framing the corners and lower third; the kampung row sits at the bottom above the safe zone.
- **16:9:** kampung along the bottom, kites left and right, panel centred, batik at the corners.
- **1:1 / 4:5:** panel slightly below centre; kites above.

## Loop & ending
Panel folds, batik fades, kites float back down to the opening pose; the frame returns to the kampung sky, which is also frame 0.

## Guardrails
- Keep it respectful and draw every element as clean vector shapes; draw the wau bulan with its true parts (wings, crescent tail, bow with tassels, floral cut-work).
- Keep the motion calm and graceful; no chanting or vocals in the music.
- Write the user's text in the language they used; a second line may repeat it in the other language.
- Songket gold stays the accent even with brand colours.

## QA
- Frame at `kites + 2 s`: kites clearly show wings, tail, bow and tassels; strings reach the ground.
- Frame at `bloom + 1 s`: flowers open with dye colour inside the wax lines, second smaller flower blooming.
- Frame at `headline + 1 s`: panel unrolled, rebung all up, headline gold and legible.
- Last frame matches frame 0; audio has no voice-like sound.
