---
name: sound-design
description: The zero-dependency Node synthesiser: CLI, cue sheet schema, all sound kinds, composite cues, dynamic values, music presets and overrides, mixing, an effect-vocabulary cookbook, and audio QA
metadata:
  tags: sound, synth, cues, music, mix, audio
---

# Sound design (all sound is made in code)

`scripts/synth.mjs` renders a cue sheet to a stereo 16-bit 44.1 kHz WAV: effects placed at exact times, plus a bar-aligned loopable music bed that ducks under the effects. Deterministic (seeded). No samples, nothing copyrighted.

```bash
node scripts/synth.mjs --list                                   # every kind, composite and preset with parameters
node scripts/synth.mjs --demo pop                               # render one kind to demo/pop.wav
node scripts/synth.mjs --cues cues.mjs --out assets/audio/mix.wav [--sound off|effects|music] [--stems] [--duration 8] [--seed N]
node scripts/audio-report.mjs assets/audio/mix.wav --expect 8 --spec spec.png   # levels, clipping, gaps, spectrogram
node scripts/synth-selftest.mjs                                 # health check of all kinds and presets
```

In a scaffolded project use `npm run sound` after editing `timing.mjs` or `cues.mjs`. The project's `<audio id="mix" ...>` (with an `id`!) plays the file.

## Cue sheet

```js
{ duration: 8, bpm: 127.5, seed: 7, sound: "music",
  music: { preset: "minimal-techno", bpm: 127.5, align: "beat", gain: 1, duck: 0.35, layers: { blips: false, drums: { dropAt: [["wipe","end"]] } } },
  cues: [ { t: 0.94, kind: "kick", vol: 0.95 }, { t: 4.8, kind: "impact", dur: 1.1, verb: 0.3 } ] }
```

Cue fields: `t` seconds, `kind`, `vol` (0 to 1; or `db`), `pan` (-1 to 1), `verb` (reverb send, default 0.14), `rev: true` (reverse), `pitch` (semitones), `lp`/`hp` (Hz), `echo: {delay, fb, mix, tone}`, plus the kind's own parameters (`freq`, `note`, `dur`, ...).

In style files the time is `"at"`: a beat id (`"final"`, `"final+0.3"`, `"letter*"` for every `letter1..N`, `"phrase*+0.1"`), a fraction of the length (`0.34`), or omitted `t`. `"rise": {"param": "freq", "from": 1200, "by": 140}` raises a parameter per wildcard index (ascending pings, scales). **Dynamic values** in any field: `"D"` (whole length), `"rest"` (from the cue to the end), `"until:<beat id>"`; and `"times": "fill"` on `repeat`.

### Composite cues

| kind | fields | use |
|------|--------|-----|
| `ticks` | `n, span, curve: linear/decel/accel, f0, f1, tick, final: {kind...}` | counting numbers, ratchets, dotted lines |
| `typing` | `n, dt, jitter, spaceEvery, f0, f1, bell` | keyboard, typewriter |
| `run` | `inst, from, n, dt, scale, dir, notes, len` | harp/xylophone/chime runs, jingles |
| `repeat` | `every` or `everyBeat`, `times` (or `"fill"`), `decay, of: {kind...}` | pulses, heartbeats, footsteps, confetti pops |

## Sound kinds (70)

Percussion: `kick snare hat clap rim shaker tick click thud knock stamp impact crash shutter heartbeat drum`.
Tonal one-shots: `pop boing blip boop zap chirp glitch coin ding chime bell gong ping sparkle twinkle`.
Melodic: `marimba xylo glock pluck harp ep piano flute brass pad strings bass lead drone strum`.
Texture: `whoosh swish riser swell rumble hiss crackle sizzle hum buzz whir scratch paper cloth pour drip wind insects crickets crowd footstep tapewarble firework cannon`.

Run `--list` for parameters and defaults. Useful: `pop{freq,rise,dur}`, `whoosh{dir: up|down|peak,f0,f1,dur}`, `riser{dur,f0,f1,tone}` (reverse-cymbal build), `scratch{dur,freq,jitter}` (pen/chalk/marker/brush), `pour{dur}`, `hum{freq: 100 = 50 Hz mains}`, `pad/strings{notes:[...],dur}`, `bass{note,wave: sub|saw|pluck|pulse}`.

## Effect vocabulary (sentence to cue)

| The prompt says | Use |
|-----------------|-----|
| pop, bubble, plop | `pop` (freq 300 to 900, rise 1.3 to 2) |
| whoosh, swish, glide, sweep | `whoosh` / `swish` (dir up for entrances, down for exits, peak for passes) |
| thud, thump, landing, slam | `thud` (freq 55 to 120), `impact` for big ones, `stamp` for seals |
| click, tick, key tap, counter | `click` / `tick` (freq 1500 to 3200), `typing`, `ticks` |
| chime, bell, ding, glassy | `chime` (880 to 2600), `bell`, `ding`, `sparkle` for clusters |
| sparkle, twinkle, glitter | `sparkle` (lo 3000 to 9000), `twinkle` |
| swell, bloom, rise, riser | `swell` (soft), `riser` (tension build into a hit) |
| crackle, sizzle, fire, embers | `crackle` (density 20 to 300), `sizzle` |
| hum, buzz, neon | `hum` (100 Hz), `buzz` |
| motor, fan, servo, projector | `whir` (f0 to f1) |
| wind, air, breath | `wind`, `swell` |
| water, pour, drip | `pour`, `drip`, `pop` |
| paper, cloth, page | `paper`, `cloth` |
| chalk, marker, pen, brush | `scratch` (jitter 0.3 to 0.7) |
| cartoon boing, hop | `boing` |
| camera shutter | `shutter` |
| coin, collect | `coin` |
| stamp | `stamp` |
| drums (kompang, tabla, gendang) | `drum{freq}` or the `perc` music layer |
| voice-like squeaks (no words) | `chirp` short; never synthesise speech |

## Music

Presets (`--list` shows them): `corporate-bright corporate-calm lofi jazz-slow synthwave minimal-techno dark-ambient ambient-dreamy chiptune cinematic-orch cinematic-travel promo-energy pop-modern waltz waltz-romantic march cartoon kids-toy ukulele-folk stop-motion pentatonic-heritage east-asian-zither festive-pentatonic kompang-raya joget indian-drone city-pop podcast-intro luxury-minimal epic-intro y2k-pop lofi-house guitar-morning waltz-nostalgic`.

Override anything: `{"preset": "lofi", "bpm": 90, "key": "D", "scale": "minor", "gain": 0.8, "duck": 0.5, "layers": {"vinyl": false, "chords": {"voice": "piano"}, "extra": {"type": "melody", "voice": "flute", ...}}}`. Layer types: `drums perc bass chords arp melody drone bed`. Patterns are per-bar step strings (`x` hit, `X` accent, `o` ghost, `-` rest; 16 steps for 4/4, 12 for 3/4 and 12/8). `dropAt: [["wipe","end"]]` mutes a layer between beat ids (or seconds); `bars: [a,b]` limits to bars.

Tempo: if `align` is not set, tempo is stretched to whole **bars** when within 6% of the requested bpm, otherwise it keeps the tempo and lands on a whole **beat**. Beat-driven styles set `align: "beat"` and the same BPM as the visuals.

Loop: the music tail (reverb and ring-out) is folded onto the head, so `mix.wav` loops with no click. The final 40 ms is eased to zero.

## Mixing

Effects peak near -1 dBFS after a soft limiter; music sits at about -10 dBFS peak and **ducks** by `duck` (0.3 to 0.6) under effects. "Quieter than the effects" in the prompts is met by these defaults; lower `music.gain` further for voice styles (podcast). Reverb is a shared bus (`verb` per cue).

## Audio QA (what can and cannot be verified)

`audio-report.mjs` checks duration, peak, RMS, clipping, silence gaps in the middle, edge silence (informational), per-second loudness and writes a spectrogram. **A spectrogram read** confirms events sit at the right times (ticks as dots, whooshes as plumes, risers as curves). It does **not** tell how good it sounds: say so honestly and invite the user to listen.

Targets: peak between -8 and -1 dBFS, RMS between -26 and -16 dBFS, no clipping, no silent gap over 0.6 s except intentional drops, effects audible over music by 6 to 12 dB.

## Extending

Add a kind in `scripts/synth/instruments.mjs` with `def(name, description, defaults, render)` (mono buffer from `(params, {r})`); use `D.osc/noise/lp/hp/bp/expDecay/...` from `dsp.mjs`; run `synth-selftest.mjs`. Add a music preset in `presets.mjs`.
