# Content and process lessons (long explainers from papers)

- **Read the sources properly before scripting**: `pdftotext` (use plain mode for prose, `-layout` for tables), then read intro, method, results, limits. Duplicate downloads happen (compare file bytes). Say whose paper each claim comes from.
- **Separate three kinds of claims on screen and in narration**: measured (hardware numbers), simulated/projected (models, cost estimates), unknown (open problems). Never present a projection as a result. Recompute any derived number yourself and show the inputs (e.g. 8 x 250 x 4,900 x 2 fJ = 19.6 nJ).
- **Pin the language rule before writing narration** (this channel: Malay storytelling, common science terms stay in English; "bayangkan" as the hook word). Changing it later forces rewriting every scene text and re-synthesising audio.
- **Finalise narration before spending TTS quota**; rate-limited TTS tiers punish rewrites. Voice generation itself is outside this skill: produce `audio/<Scene>.wav` any way you like, and keep scene texts sentence-based so captions split cleanly.
- **Two cuts of one topic** (full + short): share the header/helpers and the visual language, write the short cut as its own few scenes (not a trimmed full) with bigger text and one idea per scene.
- **Order of work that avoided rework**: storyboard + narration -> kit/palettes -> placeholders -> scenes in batches with `peek` -> `pace` -> `manim -q l` -> `comp` -> contact sheets -> fixes -> real audio -> `-q m/h`.
- **Hand-off notes**: keep the project memory/HANDOFF current (which scenes have real audio, quality rendered, known issues) so another session can resume.
