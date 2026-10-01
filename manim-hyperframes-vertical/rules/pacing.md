# Pacing: making visuals last as long as the voice

Voice length decides scene length: `target = lead_in + wav_seconds + 0.7 s tail`. Slow storyteller TTS runs about 0.08 s per character (measure your voice: sum of wav seconds / characters of its text), so a 500-character scene needs ~40 s.

## The three time classes (implemented in `Timed`, solved by `vbuild.py pace`)
| Class | How you write it | Stretch |
|-------|------------------|---------|
| discrete animation | `self.play(FadeIn(...), run_time=1)` | `a` = min(target/natural, 1.5) |
| explicit hold | `self.wait(1.0)` | `w` up to 1.6 |
| continuous process | `self.play(tr.animate.set_value(..), run_time=3, rate_func=linear, elastic=True)` | `e` up to 4.5: soaks up most of the stretch (simulations, histograms, counters, jitter, sweeps) |
| the remainder | automatic | held after each discrete beat (`hold g/s` in the pace log), then a final top-up in `tear_down` |

`pace.json` entry: `{"a","w","e","g","T"}`. The probe (`_measure.py`) runs the scene with `dry_run`, in ~2 s, counting natural `ANIM`, `WAIT`, `ELASTIC` seconds.

## Design rules
1. Natural duration should be roughly one third of the narration. Below that, holds dominate and the screen feels static; plan one visual beat per sentence.
2. Put the most important long process in an `elastic` play and drive it by a tracker so it fills the explanation (a Langevin ball over 5 natural seconds becomes 20 s of lively motion).
3. Reveal order follows the narration order; sync is by proportion only (no word timing), so avoid hard "now the voice says X" cuts.
4. Phase changes: `self.clear_out()` between phases (it uses `nogap`), nothing at the end.
5. Ambient life during holds comes from updaters (jitter, breathing) and the background loop; a hold on a fully static frame longer than ~6 s looks dead.
6. Re-run `pace` whenever audio changes; re-render Manim after every pace change.

## Recalibrate placeholders
`vbuild.py placeholders` uses 0.0794 s/char; change the constant (or give real WAVs) once the voice is known.
