# Pitfalls (each one cost real time; do not repeat)

## Rendering and formats
| Symptom | Cause | Do this instead |
|---------|-------|-----------------|
| One scene renders for an hour, partial files are 100s of MB, disk-bound | Manim `--transparent` default writes `.mov` (qtrle), uncompressed alpha (565 MB for one `play` at 480x854) | `--format webm` (VP9 + alpha, ~1 MB). `vbuild.py manim` already passes it. |
| Alpha is gone in the composite | ffmpeg's native VP9 decoder drops alpha | put `-c:v libvpx-vp9` BEFORE `-i clip.webm` |
| `ffprobe` shows `N/A` duration for webm | alpha webm has no stream duration | count packets: `-count_packets -show_entries stream=nb_read_packets,r_frame_rate` (`webm_seconds`) |
| `FileNotFoundError: [WinError 3]` deep inside `partial_movie_files` | Windows MAX_PATH (260): Manim hash file names + a long project path | keep the project root SHORT (e.g. `C:\vid`), not under a deep temp/scratch folder |
| A parallel render fails but succeeds when rerun alone | shared media/Tex caches under `-j` | rerun the failed scene; use `-j 2-3`, never more than cores/4 on 16 GB |

## Pacing
| Symptom | Cause | Do this instead |
|---------|-------|-----------------|
| A scene never finishes rendering, time grows without bound | `Scene.wait()` calls `self.play(Wait(...))`. A `play()` override that adds a "hold after each beat" recurses on its own waits | in `Timed.play`: `if any(isinstance(a, Wait) ...): return super().play(...)` |
| Holds are scaled twice (pace squared) | same routing: `wait()` scaled, then `play(Wait)` scaled again | same bypass |
| Everything crawls (3-4x slower), then long static stretches | one uniform stretch factor, all leftover time in `wait()`s | three classes: discrete animations (<=1.5x), `elastic` continuous processes, holds spread after each beat (`rules/pacing.md`) |
| Blank screen for seconds at the end | scene ends with `clear_out()` and the pacing engine tops up the remaining time after it | no final `clear_out()`; mid-scene clears use `nogap` (built into `clear_out`) |
| Scene is ~3x shorter than the narration | scenes were designed in "natural" time | budget one new visual beat per sentence of narration, or accept holds; test with `placeholders` + `pace` before polishing |

## Processes and memory
- Never run two `vbuild` chains at once: a half-killed old chain keeps rendering and both write the same files. Before launching, list python/manim processes; use ONE chain that writes a done-marker file.
- `Stop-Process` patterns must match `manim|vbuild|_measure` (the python child of the CLI shim has a different command line).
- 16 GB machines with WSL/Docker/Chrome open run out of memory at `-j 4`; the harness may reap background shells. Use `-j 2-3`, close heavy apps, and do not restart a reaped job automatically.
- Redirected python stdout is block-buffered: set `PYTHONUNBUFFERED=1` or the log looks frozen. Set `PYTHONUTF8=1` (Windows cp1252 crashes on `▶`/`✓`).
- Benchmark ONE full-length paced scene before launching the whole batch.

## Authoring
- `Rectangle(0.28, 0.2)` means `color=0.28`: always keywords `width=, height=`.
- `Text` with a glyph the font lacks (`▶`, `⟨⟩`) renders nothing and the pill goes blank. Stick to Latin + `→ ≈ × ² ₀ ·`; use `MathTex` for maths symbols.
- `Indicate(mob)` flashes its fill yellow and hides white text on coloured boxes: pass `color=<its own colour>`.
- `always_redraw` that rebuilds hundreds of Dots every frame is slow; precompute and recolour via an updater instead.
- Zero-length `Arrow` raises; translucent white cards show their shadow stack as grey: use opacity ~0.96.
- Anything beyond y = -3.75 collides with captions (3-line captions reach about -3.5): split long narration sentences (the compositor splits at `,` `:` `;` when > 105 chars) and keep the stage above.
- Bash heredocs and `python -c` with apostrophes, backslashes or `\n` inside strings mangle text under the harness shell (a `"\n"` became a literal newline and broke the file). Write files with the Write/Edit tools; for multi-line patches write a small `.py` file and run it.
- Duplicate `Text` fonts: the Segoe UI default exists on Windows only; on other OSes set `VB_FONT`/`VB_FONT_BOLD` for captions and change `FONT` in the kit.
