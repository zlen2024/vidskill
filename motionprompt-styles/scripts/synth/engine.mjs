// Cue sheet -> stereo mix. Effects are placed at exact times, music is bar-aligned + loopable and ducks under effects.
import * as D from "./dsp.mjs";
import { KINDS } from "./instruments.mjs";
import { renderMusic, SCALES } from "./music.mjs";
const { S, len, add, rng, hashSeed, peak, scale, reverb, softClip, db, clamp } = D;

// ---------- composite cues -> plain cues ----------
export function expandCue(c, r, bpm = 120, total = Infinity) {
  const { t = 0, kind } = c;
  if (kind === "ticks") {                     // counting number: n ticks over `span` seconds, optional accel/decel, rising pitch, final ding
    const n = c.n ?? 12, span = c.span ?? 1, out = [];
    for (let i = 0; i < n; i++) {
      const u = n === 1 ? 0 : i / (n - 1), w = c.curve === "decel" ? 1 - Math.pow(1 - u, 2) : c.curve === "accel" ? u * u : u;
      out.push({ t: t + w * span, kind: c.tick || "tick", freq: (c.f0 ?? 1800) * Math.pow((c.f1 ?? 3000) / (c.f0 ?? 1800), u), vol: (c.vol ?? 0.6) * (0.7 + 0.3 * u) });
    }
    if (c.final) out.push({ t: t + span + (c.finalGap ?? 0.05), ...c.final });
    return out;
  }
  if (kind === "typing") {                    // keyboard / typewriter taps, lower knock for spaces
    const n = c.n ?? 14, dt = c.dt ?? 0.075, jit = c.jitter ?? 0.03, out = [];
    let tt = t;
    for (let i = 0; i < n; i++) {
      const space = c.spaceEvery && i % c.spaceEvery === c.spaceEvery - 1;
      out.push(space ? { t: tt, kind: "knock", freq: 200, dur: 0.09, vol: (c.vol ?? 0.6) * 0.8 } : { t: tt, kind: c.tick || "tick", freq: r.range(c.f0 ?? 1900, c.f1 ?? 2700), vol: (c.vol ?? 0.6) * r.range(0.75, 1) });
      tt += dt + (r() - 0.5) * 2 * jit;
    }
    if (c.bell) out.push({ t: tt + 0.05, kind: "ding", freq: 2400, dur: 0.6, vol: 0.5 });
    return out;
  }
  if (kind === "run") {                       // a run of notes (harp glissando, xylophone scale, rising bells)
    const inst = c.inst || "marimba", n = c.n ?? 6, dt = c.dt ?? 0.09, sc = SCALES[c.scale || "major"], out = [];
    const start = D.midiOf(c.from ?? "C5");
    for (let i = 0; i < n; i++) {
      const k = c.dir === "down" ? n - 1 - i : i;                       // "down" plays the same scale steps high -> low
      const note = c.notes ? c.notes[i % c.notes.length] : start + sc[k % sc.length] + 12 * Math.floor(k / sc.length);
      out.push({ t: t + i * dt, kind: inst, note, dur: c.len ?? 0.6, vol: (c.vol ?? 0.7) * (0.8 + 0.2 * (i / n)) });
    }
    return out;
  }
  if (kind === "repeat") {                    // same sound N times (ratchets, heartbeat pulses, footsteps)
    const { every = 0.25, everyBeat, times: timesIn = 4, of, ...rest } = c, out = [], step = everyBeat ? (everyBeat * 60) / bpm : every;   // everyBeat follows the sheet tempo
    const times = timesIn === "fill" ? Math.max(1, Math.floor((total - t) / step)) : timesIn;                                         // "fill" repeats until the end of the sheet
    for (let i = 0; i < times; i++) out.push({ ...(of || rest), t: t + i * step, vol: (c.vol ?? 0.8) * Math.pow(c.decay ?? 1, i), ...(c.step ? { [c.step.param]: (c.step.from ?? 0) + i * (c.step.by ?? 0) } : {}) });
    return out;
  }
  return [c];
}

// simple resample (pitch shift in semitones; changes length)
function pitchShift(buf, semis) {
  const ratio = Math.pow(2, semis / 12), n = Math.floor(buf.length / ratio), o = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = i * ratio, k = Math.floor(x), f = x - k; o[i] = buf[k] * (1 - f) + (buf[k + 1] || 0) * f; }
  return o;
}

export function renderEffects(cues, duration, seed, tail = 2.2, bpm = 120) {
  const N = len(duration + tail), L = new Float32Array(N), R = new Float32Array(N), send = new Float32Array(N);
  const used = new Set(); let idx = 0;
  const meta = { cues: 0 };
  for (const raw of cues) {
    const r = rng(hashSeed(seed, "fx", idx++, raw.kind));
    for (const c of expandCue(raw, r, bpm, duration)) {
      const K = KINDS[c.kind];
      if (!K) throw new Error(`unknown sound kind "${c.kind}" (t=${c.t}). Run: node scripts/synth.mjs --list`);
      const { t = 0, kind, vol, db: vdb, pan = 0, verb, rev, pitch, echo: ec, lp: lpf, hp: hpf, ...params } = c;
      if (t < 0 || t > duration + 0.001) { console.warn(`  warn: cue ${kind} at t=${t} is outside 0..${duration}s, skipped`); continue; }
      let buf = K.render(params, { r: rng(hashSeed(seed, "buf", meta.cues, kind)) });
      if (rev) buf = D.reverse(buf);
      if (pitch) buf = pitchShift(buf, pitch);
      if (lpf) buf = D.lp(buf, lpf); if (hpf) buf = D.hp(buf, hpf);
      if (ec) buf = D.echo(buf, ec.delay ?? 0.2, ec.fb ?? 0.35, ec.mix ?? 0.4, ec.tone ?? 3000, ec.tail ?? 1);
      const g = (vdb !== undefined ? db(vdb) : vol ?? 0.8), a = Math.cos(((pan + 1) * Math.PI) / 4), b = Math.sin(((pan + 1) * Math.PI) / 4);
      add(L, buf, t, g * a); add(R, buf, t, g * b);
      add(send, buf, t, g * (verb ?? 0.14));
      used.add(c.kind); meta.cues++;
    }
  }
  const [rl, rr] = reverb(send, { room: 0.78, damp: 0.45, wet: 1, tail: 0.1 });
  for (let i = 0; i < N; i++) { L[i] += rl[i] * 0.6; R[i] += rr[i] * 0.6; }
  return { L, R, N, kinds: [...used], count: meta.cues };
}

function envelopeFollow(L, R, attack = 0.008, release = 0.28) {
  const n = L.length, env = new Float32Array(n), a = Math.exp(-1 / (attack * S.sr)), r = Math.exp(-1 / (release * S.sr));
  let e = 0;
  for (let i = 0; i < n; i++) { const x = Math.max(Math.abs(L[i]), Math.abs(R[i])), c = x > e ? a : r; e = c * e + (1 - c) * x; env[i] = e; }
  return env;
}

// sheet: { duration, seed, sound: off|effects|music, cues: [], music: {...}, master: {peakDb} }
export function synthesize(sheet, { sr = 44100, sound } = {}) {
  D.setSampleRate(sr);
  const duration = sheet.duration, seed = sheet.seed ?? 1, mode = sound || sheet.sound || "music";
  if (!(duration > 0)) throw new Error("cue sheet needs a positive `duration` (seconds)");
  const N = len(duration), L = new Float32Array(N), R = new Float32Array(N), info = { duration, mode, sr };
  if (mode === "off") return { L, R, info: { ...info, silent: true } };
  const fx = renderEffects(sheet.cues || [], duration, seed, 2.2, sheet.bpm || sheet.music?.bpm || 120);
  info.effects = { cues: fx.count, kinds: fx.kinds };
  let music = null;
  if (mode === "music" && sheet.music) {
    music = renderMusic(sheet.music, duration, { seed });
    info.music = music.info;
    const duck = sheet.music.duck ?? 0.45;
    const env = envelopeFollow(fx.L.subarray(0, N), fx.R.subarray(0, N));
    const smooth = new Float32Array(N); let s = 0; const k = Math.exp(-1 / (0.04 * S.sr));
    for (let i = 0; i < N; i++) { s = k * s + (1 - k) * Math.min(1, env[i] * 2.4); smooth[i] = s; }
    for (let i = 0; i < N; i++) { const g = 1 - duck * smooth[i]; L[i] += music.L[i] * g; R[i] += music.R[i] * g; }
  }
  for (let i = 0; i < N; i++) { L[i] += fx.L[i]; R[i] += fx.R[i]; }
  // effect tails that ring past the end are folded onto the start only for looping sheets
  if (sheet.loopFx) for (let i = 0; i < fx.N - N && i < N; i++) { L[i] += fx.L[N + i]; R[i] += fx.R[N + i]; }
  // ease the last 40 ms so the file never ends on a click
  const z = len(0.04); for (let i = 0; i < z; i++) { const g = i / z; L[N - 1 - i] *= g; R[N - 1 - i] *= g; }
  softClip(L, 0.98); softClip(R, 0.98);
  const target = db(sheet.master?.peakDb ?? -1.2), pk = Math.max(peak(L), peak(R)) || 1;
  if (pk > target || sheet.master?.normalize) { scale(L, target / pk); scale(R, target / pk); }
  info.peakDb = +(20 * Math.log10(Math.max(peak(L), peak(R)) || 1e-9)).toFixed(2);
  return { L, R, info };
}

export function wavBytes(L, R, sr = S.sr) {
  const n = L.length, data = Buffer.alloc(n * 4), hdr = Buffer.alloc(44);
  for (let i = 0; i < n; i++) { data.writeInt16LE(Math.round(clamp(L[i], -1, 1) * 32767), i * 4); data.writeInt16LE(Math.round(clamp(R[i], -1, 1) * 32767), i * 4 + 2); }
  hdr.write("RIFF", 0); hdr.writeUInt32LE(36 + data.length, 4); hdr.write("WAVEfmt ", 8); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
  hdr.writeUInt32LE(sr, 24); hdr.writeUInt32LE(sr * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34); hdr.write("data", 36); hdr.writeUInt32LE(data.length, 40);
  return Buffer.concat([hdr, data]);
}
