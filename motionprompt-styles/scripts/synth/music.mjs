// Loopable background-music renderer: preset (or custom layers) -> stereo buffers, bar-aligned to the video length.
import * as D from "./dsp.mjs";
import { KINDS } from "./instruments.mjs";
import { PRESETS } from "./presets.mjs";
const { S, len, add, hz, rng, hashSeed, scale, peak, reverb } = D;

export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], mixolydian: [0, 2, 4, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11], phrygian: [0, 1, 3, 5, 7, 8, 10], harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  pentatonic: [0, 2, 4, 7, 9], minorPentatonic: [0, 3, 5, 7, 10], hijaz: [0, 1, 4, 5, 7, 8, 10],
};
const PC = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const METERS = { "4/4": { beats: 4, spb: 4 }, "3/4": { beats: 3, spb: 4 }, "12/8": { beats: 4, spb: 3 }, "6/8": { beats: 2, spb: 3 }, "2/4": { beats: 2, spb: 4 } };

// named voices -> {kind, ...params}
const VOICES = {
  kick: () => ({ kind: "kick" }), snare: () => ({ kind: "snare" }), hat: () => ({ kind: "hat" }), openhat: () => ({ kind: "hat", open: 1 }),
  clap: () => ({ kind: "clap" }), rim: () => ({ kind: "rim" }), shaker: () => ({ kind: "shaker" }), snap: () => ({ kind: "rim", freq: 2400, dur: 0.04 }),
  woodblock: () => ({ kind: "knock", freq: 620, dur: 0.1 }), cymbal: () => ({ kind: "crash", dur: 0.5 }),
  timpani: (n, d) => ({ kind: "thud", freq: hz(n), dur: Math.min(d + 0.2, 0.9) }),
  drum: (n, d) => ({ kind: "drum", freq: hz(n), dur: Math.min(Math.max(d, 0.12), 0.5) }),
  sub: (n, d) => ({ kind: "bass", note: n, dur: d, wave: "sub" }), bass: (n, d) => ({ kind: "bass", note: n, dur: d, wave: "sub" }),
  bassSaw: (n, d) => ({ kind: "bass", note: n, dur: d, wave: "saw" }), bassPluck: (n, d) => ({ kind: "bass", note: n, dur: d, wave: "pluck" }),
  bassPulse: (n, d) => ({ kind: "bass", note: n, dur: d, wave: "pulse" }),
  tuba: (n, d) => ({ kind: "bass", note: n, dur: Math.min(d, 0.3), wave: "saw" }),
  pad: (n, d, x) => ({ kind: "pad", note: n, notes: x.notes, dur: d }), strings: (n, d, x) => ({ kind: "strings", note: n, notes: x.notes, dur: d }),
  organ: (n, d, x) => ({ kind: "pad", note: n, notes: x.notes, dur: d, attack: 0.03, release: 0.06, cutoff: 2400 }),
  accordion: (n, d, x) => ({ kind: "pad", note: n, notes: x.notes, dur: d, attack: 0.05, release: 0.1, cutoff: 3200 }),
  ep: (n, d) => ({ kind: "ep", note: n, dur: Math.min(Math.max(d, 0.3), 2.2) }), piano: (n, d) => ({ kind: "piano", note: n, dur: Math.min(Math.max(d, 0.4), 2.5) }),
  pluck: (n, d) => ({ kind: "pluck", note: n, dur: Math.min(Math.max(d, 0.25), 1.6) }),
  guitar: (n, d) => ({ kind: "pluck", note: n, dur: Math.min(Math.max(d, 0.4), 1.6), bright: 0.5, damp: 0.5 }),
  gambus: (n, d) => ({ kind: "pluck", note: n, dur: Math.min(Math.max(d, 0.3), 1.2), bright: 0.75, damp: 0.35 }),
  zither: (n, d) => ({ kind: "harp", note: n, dur: Math.min(Math.max(d, 0.6), 1.8) }), harp: (n, d) => ({ kind: "harp", note: n, dur: Math.min(Math.max(d, 0.8), 2) }),
  strum: (n, d, x) => ({ kind: "strum", notes: x.notes, dur: Math.min(Math.max(d, 0.6), 1.4) }),
  marimba: (n, d) => ({ kind: "marimba", note: n, dur: Math.min(Math.max(d, 0.3), 0.9) }), xylo: (n, d) => ({ kind: "xylo", note: n, dur: 0.4 }),
  glock: (n, d) => ({ kind: "glock", note: n, dur: 0.9 }), lead: (n, d) => ({ kind: "lead", note: n, dur: d, wave: "saw" }),
  square: (n, d) => ({ kind: "lead", note: n, dur: d, wave: "square", cutoff: 7000 }), pulse: (n, d) => ({ kind: "lead", note: n, dur: d, wave: "pulse", cutoff: 7000 }),
  flute: (n, d) => ({ kind: "flute", note: n, dur: Math.max(d, 0.25) }), brass: (n, d) => ({ kind: "brass", note: n, dur: Math.max(d, 0.2) }),
  bell: (n) => ({ kind: "chime", freq: hz(n), dur: 1.6 }), drone: (n, d) => ({ kind: "drone", note: n, dur: d }),
  pop: (n) => ({ kind: "pop", freq: hz(n), dur: 0.12 }),
};

const midiOf = D.midiOf;
function scaleMidi(key, sc, idx, oct) {                       // idx: 0-based scale degree (may be negative / > length)
  const s = SCALES[sc] || SCALES.major, n = s.length;
  const o = Math.floor(idx / n), pc = s[((idx % n) + n) % n];
  return 12 * (oct + 1) + PC[key] + pc + 12 * o;
}
const noteName = (m) => m;                                     // KINDS accept midi numbers via hz(); keep numbers

function chordDegrees(ch, size = 3) {                          // ch: number | {deg, seventh, sus}
  const c = typeof ch === "number" ? { deg: ch } : ch;
  const d = c.deg - 1, base = [d, d + 2, d + 4];
  if (c.seventh || size >= 4) base.push(d + 6);
  if (c.sus) base[1] = d + 3;
  return base;
}
function pattern(str, steps) {
  const a = new Array(steps).fill(0);
  if (!str) return a;
  const s = str.replace(/\s|\|/g, "");
  for (let i = 0; i < steps; i++) { const c = s[i % s.length]; if (s.length <= steps || i < s.length) a[i] = c === "X" ? 1.25 : c === "x" ? 1 : c === "o" ? 0.5 : 0; }
  return a;
}
function maskBars(layer, nBars) {                              // which bars a layer plays in
  const on = new Array(nBars).fill(true);
  const norm = (v) => (v < 0 ? nBars + v : v);
  if (layer.bars && layer.bars !== "all") for (let b = 0; b < nBars; b++) on[b] = b >= norm(layer.bars[0]) && b < norm(layer.bars[1]);
  for (const [f, t] of layer.drop || []) for (let b = 0; b < nBars; b++) if (b >= norm(f) && b < norm(t)) on[b] = false;
  return on;
}

// ---- melody generator (seeded motif, 2-bar phrase, cadence on the 4th bar) ----
const RHYTHMS16 = [[[0, 4], [4, 4], [8, 4], [12, 4]], [[0, 6], [6, 2], [8, 4], [12, 4]], [[0, 4], [4, 2], [6, 2], [8, 8]], [[0, 2], [2, 2], [4, 4], [8, 2], [10, 2], [12, 4]], [[0, 8], [8, 4], [12, 4]]];
const RHYTHMS12 = [[[0, 6], [6, 3], [9, 3]], [[0, 3], [3, 3], [6, 6]], [[0, 12]], [[0, 3], [3, 3], [6, 3], [9, 3]]];
function genMelody(r, m, nBars, steps, chords) {
  const rh = steps === 12 ? RHYTHMS12 : RHYTHMS16, out = [];
  const lo = m.lo ?? 0, hi = m.hi ?? 9;
  let prev = pickNear(r, chordDegrees(chords[0]), 4, lo, hi);
  const bars = [];
  for (let b = 0; b < nBars; b++) {
    if (b % 4 === 2) { bars.push(bars[b - 2]); continue; }        // repeat the first bar of the phrase
    const tpl = rh[Math.floor(r() * rh.length)], cd = chordDegrees(chords[b % chords.length]);
    const notes = tpl.map(([st, ln], k) => {
      let deg;
      if (b % 4 === 3 && k === tpl.length - 1) deg = cd[0] + 7 * Math.floor((prev - cd[0]) / 7 + 0.5);            // cadence on the chord root
      else if (k === 0 || st % 4 === 0) deg = pickNear(r, cd, prev, lo, hi);                                     // strong beats: chord tones
      else deg = Math.max(lo, Math.min(hi, prev + Math.floor(r() * 3) - 1 || 1));                                // weak beats: step
      prev = deg; return [st, deg, ln];
    });
    bars.push(notes);
  }
  bars.forEach((notes, b) => { if (m.sparse && r() < m.sparse && b % 4 !== 3) return; notes.forEach(([st, deg, ln]) => out.push({ bar: b, step: st, deg, len: ln })); });
  return out;
}
function pickNear(r, chordDeg, prev, lo, hi) {
  const cands = [];
  for (const d of chordDeg) for (let o = -2; o <= 2; o++) { const v = d + 7 * o; if (v >= lo && v <= hi) cands.push(v); }
  cands.sort((a, b) => Math.abs(a - prev) - Math.abs(b - prev));
  return cands[Math.floor(r() * Math.min(3, cands.length))] ?? prev;
}

export function resolveMusic(spec) {
  const base = spec.preset ? structuredClone(PRESETS[spec.preset] || (() => { throw new Error(`unknown music preset "${spec.preset}"`); })()) : {};
  const { layers: ov, ...rest } = spec;
  const m = { ...base, ...rest };
  if (Array.isArray(ov)) m.layers = ov.map((l) => ({ ...l }));                                   // full custom layer list
  else {                                                                                          // object = per-id overrides on the preset (false removes a layer)
    m.layers = (base.layers || []).map((l) => ({ ...l })).filter((l) => !(ov && ov[l.id] === false));
    if (ov) {
      for (const l of m.layers) if (ov[l.id] && typeof ov[l.id] === "object") Object.assign(l, ov[l.id]);
      for (const [id, v] of Object.entries(ov)) if (v && typeof v === "object" && !m.layers.some((l) => l.id === id) && v.type) m.layers.push({ id, ...v });
    }
  }
  return m;
}

// duration in seconds; returns { L, R, info }
export function renderMusic(spec, duration, { seed = 1 } = {}) {
  const m = resolveMusic(spec);
  const meter = METERS[m.meter || "4/4"], steps = meter.beats * meter.spb;
  let bpm = m.bpm || 120, align = "bar";
  const barDur0 = (meter.beats * 60) / bpm;
  let nBars = Math.max(1, Math.round(duration / barDur0));
  const barFit = (meter.beats * 60 * nBars) / duration;
  const useBars = m.align === "bar" || (m.align !== "beat" && Math.abs(barFit - bpm) / bpm <= (m.tempoTolerance ?? 0.06));
  if (useBars) bpm = barFit;                                                             // whole bars: the loop is musically exact
  else {                                                                                 // keep the tempo, but land on a whole beat (align:"beat" = tempo already synced to the visuals)
    align = "beat";
    bpm = (Math.max(1, Math.round((duration * bpm) / 60)) * 60) / duration;
    nBars = Math.max(1, Math.ceil(duration / ((meter.beats * 60) / bpm) - 1e-6));
  }
  const barDur = (meter.beats * 60) / bpm, stepDur = barDur / steps;
  const tail = 2.4, N = len(duration + tail);
  const L = new Float32Array(N), R = new Float32Array(N), send = new Float32Array(N);
  const key = m.key || "C", sc = m.scale || "major", prog = m.prog || [1, 5, 6, 4];
  const chords = Array.from({ length: nBars }, (_, b) => prog[Math.floor(b / (m.chordBars || 1)) % prog.length]);
  const cache = new Map();
  const r0 = rng(hashSeed(seed, "music", m.preset || "custom"));

  let cur = null;                                                        // layer being scheduled (for dropSec)
  const put = (voice, note, dur, at, gain, pan = 0, verb = 0, extra = {}) => {
    if (at >= duration || gain <= 0) return;
    if (cur?.dropSec?.some(([a, b]) => at >= a && at < b)) return;       // layer drops out in these [start,end) seconds (e.g. beat drops for a wipe)
    const v = VOICES[voice] ? VOICES[voice](note, dur, extra) : (() => { throw new Error(`unknown voice "${voice}"`); })();
    const k = JSON.stringify([voice, note, Math.round(dur * 1000), extra.notes || 0, v]);
    let buf = cache.get(k);
    if (!buf) {
      const { kind, ...p } = v;
      buf = KINDS[kind].render(p, { r: rng(hashSeed(seed, k)) }); cache.set(k, buf);
    }
    const g = gain * (m.gain ?? 1), a = Math.cos(((pan + 1) * Math.PI) / 4), b = Math.sin(((pan + 1) * Math.PI) / 4);
    add(L, buf, at, g * a); add(R, buf, at, g * b);
    if (verb) add(send, buf, at, g * verb);
  };
  const stepTime = (bar, step, swing = 0, layerSwing = 0) => {
    const sw = (layerSwing || m.swing || 0) * (meter.spb === 4 && step % 2 === 1 ? stepDur : 0);
    return Math.max(0, bar * barDur + step * stepDur + sw + (r0() - 0.5) * (m.human ?? 0.004));
  };

  for (const layer of m.layers) {
    cur = layer;
    const on = maskBars(layer, nBars), vol = layer.vol ?? 0.8, pan = layer.pan ?? 0, verb = layer.verb ?? 0;
    const octv = layer.oct ?? 3;
    if (layer.type === "drums") {
      const lanes = { kick: "kick", snare: "snare", hat: "hat", openhat: "openhat", clap: "clap", rim: "rim", shaker: "shaker", snap: "snap", woodblock: "woodblock", cymbal: "cymbal" };
      for (let b = 0; b < nBars; b++) {
        if (!on[b]) continue;
        for (const [lane, voice] of Object.entries(lanes)) {
          if (!layer[lane]) continue;
          const pat = pattern(layer[lane], steps), lv = layer.lanes?.[lane] ?? 1;
          pat.forEach((a, st) => { if (a) put(voice, "C2", 0.2, stepTime(b, st, layer.swing), vol * a * lv * (0.92 + r0() * 0.16), pan + (lane === "hat" || lane === "shaker" ? 0.25 : 0), verb, {}); });
        }
      }
    } else if (layer.type === "perc") {                                  // tuned drums: lanes = {name:{pat,note,voice}}
      for (let b = 0; b < nBars; b++) {
        if (!on[b]) continue;
        for (const ln of layer.lanes) pattern(ln.pat, steps).forEach((a, st) => { if (a) put(ln.voice || "drum", ln.note || "D3", ln.dur || 0.2, stepTime(b, st, layer.swing), vol * a * (ln.vol ?? 1), ln.pan ?? pan, verb); });
      }
    } else if (layer.type === "bass") {
      const voice = layer.voice || "sub";
      for (let b = 0; b < nBars; b++) {
        if (!on[b]) continue;
        const cd = chordDegrees(chords[b]), rootM = scaleMidi(key, sc, cd[0], octv), fifthM = scaleMidi(key, sc, cd[2], octv), thirdM = scaleMidi(key, sc, cd[1], octv);
        const ev = [], style = layer.style || "root";
        if (layer.pattern) pattern(layer.pattern, steps).forEach((a, st) => a && ev.push([st, rootM, layer.noteLen ?? 2, a]));
        else if (style === "root") for (let k = 0; k < meter.beats; k++) ev.push([k * meter.spb, rootM, meter.spb - 1, 1]);
        else if (style === "octave") for (let st = 0; st < steps; st += meter.spb / 2) ev.push([st, (st / (meter.spb / 2)) % 2 ? rootM + 12 : rootM, meter.spb / 2 - 0.5, 1]);
        else if (style === "offbeat") for (let k = 0; k < meter.beats; k++) ev.push([k * meter.spb + meter.spb / 2, rootM, meter.spb / 2 - 0.5, 1]);
        else if (style === "pulse") for (let st = 0; st < steps; st += meter.spb / 2) ev.push([st, rootM, meter.spb / 2 - 0.6, st % meter.spb ? 0.75 : 1]);
        else if (style === "sixteenth") for (let st = 0; st < steps; st++) ev.push([st, rootM, 0.8, st % 4 ? 0.55 : 1]);
        else if (style === "walk") { const seq = [rootM, thirdM, fifthM, scaleMidi(key, sc, cd[0] - 1 + (b % 2 ? 7 : 0), octv)]; for (let k = 0; k < meter.beats; k++) ev.push([k * meter.spb, seq[k % 4], meter.spb - 0.5, 1]); }
        else if (style === "oompah") for (let k = 0; k < meter.beats; k++) ev.push([k * meter.spb, k % 2 ? fifthM : rootM, meter.spb - 1, 1]);
        else if (style === "whole") ev.push([0, rootM, steps - 1, 1]);
        for (const [st, mi, ln, a] of ev) put(voice, mi, Math.max(0.08, ln * stepDur), stepTime(b, st, layer.swing), vol * a, pan, verb);
      }
    } else if (layer.type === "chords") {
      const voice = layer.voice || "pad", rhythm = layer.rhythm || "whole", size = layer.size || 3;
      for (let b = 0; b < nBars; b++) {
        if (!on[b]) continue;
        const notes = chordDegrees(chords[b], size).map((d, i) => scaleMidi(key, sc, d + (layer.open && i === 1 ? 7 : 0), octv));
        const hits = rhythm === "whole" ? [[0, steps]] : rhythm === "half" ? [[0, steps / 2], [steps / 2, steps / 2]] : rhythm === "beat" ? Array.from({ length: meter.beats }, (_, k) => [k * meter.spb, meter.spb])
          : rhythm.startsWith("stab:") ? pattern(rhythm.slice(5), steps).map((a, st) => a && [st, layer.stabLen ?? 2]).filter(Boolean) : [[0, steps]];
        for (const [st, ln] of hits) {
          const dur = Math.max(0.15, ln * stepDur * (layer.hold ?? 0.97));
          if (voice === "ep" || voice === "piano" || voice === "pluck" || voice === "guitar" || voice === "harp" || voice === "gambus") {
            notes.forEach((n, i) => put(voice, n, dur, stepTime(b, st, layer.swing) + i * (layer.roll ?? 0.012), vol / Math.sqrt(notes.length) * 1.4, pan, verb));
          } else put(voice, notes[0], dur, stepTime(b, st), vol, pan, verb, { notes });
        }
      }
    } else if (layer.type === "arp") {
      const voice = layer.voice || "pluck", rate = layer.rate || "8th", stp = rate === "16th" ? 1 : rate === "8th" ? meter.spb / 2 : meter.spb, size = layer.size || 3;
      for (let b = 0; b < nBars; b++) {
        if (!on[b]) continue;
        const cd = chordDegrees(chords[b], size), tones = [...cd, ...cd.map((d) => d + 7)].map((d) => scaleMidi(key, sc, d, octv));
        const n = Math.round(steps / stp);
        for (let i = 0; i < n; i++) {
          const mode = layer.pattern || "up"; let idx;
          if (mode === "up") idx = i % cd.length; else if (mode === "down") idx = (cd.length - 1 - (i % cd.length)); else if (mode === "updown") { const c = cd.length * 2 - 2, k = i % c; idx = k < cd.length ? k : c - k; }
          else if (mode === "wide") idx = [0, 2, 1, 3, 2, 4, 1, 5][i % 8] % tones.length; else idx = Math.floor(r0() * cd.length);
          if (layer.rest && r0() < layer.rest) continue;
          put(voice, tones[idx % tones.length], (layer.len ?? 0.9) * stp * stepDur, stepTime(b, i * stp, layer.swing), vol * (i % 2 ? 0.75 : 1), pan + (i % 2 ? 0.15 : -0.15), verb);
        }
      }
    } else if (layer.type === "melody") {
      const voice = layer.voice || "marimba", r = rng(hashSeed(seed, "melody", layer.id || "m", m.preset || "c"));
      const events = layer.phrases
        ? Array.from({ length: nBars }, (_, b) => (layer.phrases[b % layer.phrases.length] || []).map(([st, deg, ln]) => ({ bar: b, step: st, deg, len: ln }))).flat()
        : genMelody(r, layer, nBars, steps, chords);
      for (const e of events) {
        if (!on[e.bar]) continue;
        const mi = scaleMidi(key, sc, e.deg, octv);
        put(voice, mi, Math.max(0.1, e.len * stepDur * (layer.hold ?? 0.95)), stepTime(e.bar, e.step, layer.swing), vol, pan, verb);
      }
    } else if (layer.type === "drone") {
      const note = layer.note || scaleMidi(key, sc, 0, octv);
      let start = -1;
      for (let b = 0; b <= nBars; b++) {
        const active = b < nBars && on[b];
        if (active && start < 0) start = b;
        if (!active && start >= 0) { put("drone", note, (b - start) * barDur + 0.6, start * barDur, vol, pan, verb); start = -1; }
      }
    } else if (layer.type === "bed") {                                   // one long texture (vinyl crackle, hiss, wind, crickets)
      const { kind, ...p } = layer.kind ? { kind: layer.kind, ...layer.params } : layer;
      const buf = KINDS[layer.kind].render({ ...(layer.params || {}), dur: duration + 0.5 }, { r: rng(hashSeed(seed, "bed", layer.id || kind)) });
      const g = vol * (m.gain ?? 1); add(L, buf, 0, g); add(R, buf, 0, g);
    } else throw new Error(`unknown layer type "${layer.type}"`);
  }

  if (m.verb !== 0) {                                                    // shared reverb bus
    const [rl, rr] = reverb(send, { room: m.room ?? 0.8, damp: 0.4, wet: 1, tail: 0.1 });
    for (let i = 0; i < N; i++) { L[i] += rl[i] * (m.verb ?? 1); R[i] += rr[i] * (m.verb ?? 1); }
  }
  // fold the ring-out tail onto the head so the loop is seamless, then trim
  const D = len(duration), out = [new Float32Array(D), new Float32Array(D)];
  [L, R].forEach((src, c) => { out[c].set(src.subarray(0, D)); for (let i = 0; i < N - D; i++) if (i < D) out[c][i] += src[D + i]; });
  const pk = Math.max(peak(out[0]), peak(out[1])) || 1, target = m.level ?? 0.32;
  scale(out[0], target / pk); scale(out[1], target / pk);
  return { L: out[0], R: out[1], info: { bpm: +bpm.toFixed(2), align, bars: nBars, meter: m.meter || "4/4", key, scale: sc, preset: m.preset || "custom" } };
}
