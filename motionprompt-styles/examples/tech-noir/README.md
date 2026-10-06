# Example: tech-noir (built, rendered)

`styles/tech-noir.md` built for 16:9, 15 s, sound on, as a promo for a **placeholder AI lab** ("Halden AI Labs", key line "Models built to think.").
Canvas 2D with one perspective camera (`proj`) that never stops; three scenes: a dotted globe with arcs from the lab, three GPU racks joined by a cable with light pulses, a circuit board whose chip cells flicker while code words drift up; then a serif headline formed from about 2,600 particles that glows and dissolves into dust.

Result: 1920x1080 H.264 + AAC, 15.0 s, draft render in about 35 s (one worker). `npm run check` clean; `audio-report` OK.

## Use it

```bash
node ../../scripts/make.mjs tech-noir --out videos/promo --ratio 16:9 --text "company · tagline" --key "Your key line."
```

`--text` is the small mono line (or lines) under the headline, `--key` the particle headline. The scene labels and code words live in `content.mjs` `film` (`globe`, `devices`, `chip`, `code`); edit them there, then `make.mjs --project videos/promo --final`.

## Notes
- A fine seeded film grain (`MP.drawGrain`, alpha 0.07) is needed: without it the near-black vignette shows banding rings after H.264. It makes files larger (about 18 MB final).
- Arc lift scales with arc length, and targets sit on the visible face, so arcs do not loop off the globe's edge.
- Checked at 16:9 and 9:16. Tall frames: bigger labels (30 px), labels flip side instead of running off the frame, the middle rack label is lifted, the headline stacks in two lines.
- `--text` may hold several lines (`"tagline|price|link"`): they appear one by one under the headline, the last in amber. For a promo, shorten the scenes in `timing.mjs` so these lines hold about 3 s before the dust.
- `film.globe` takes an optional fourth label (lower-left arc target).
