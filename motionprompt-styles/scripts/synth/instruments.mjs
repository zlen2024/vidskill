// Sound palette: every kind renders one mono buffer from (params, {r: seeded rng}).
// All kinds are normalised to peak `p.peak` (default 0.85) so the cue's `vol` is the loudness knob.
import * as D from "./dsp.mjs";
const { S, TAU, make, osc, stack, noise, lp, hp, bp, filter, expDecay, envelope, adsr, saturate, bitcrush, echo, hz, len, clamp, lerp, add, scale, peak, fade, times } = D;

export const KINDS = {};
const def = (name, desc, params, render) => { KINDS[name] = { desc, params, render }; };
const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];

// additive helper: list of [ratio, amp, tau]
function partials(dur, f, list) {
  const o = new Float32Array(len(dur));
  for (const [ra, a, tau] of list) {
    const w = (TAU * f * ra) / S.sr;
    if (f * ra > S.sr * 0.45) continue;
    for (let i = 0; i < o.length; i++) { const t = i / S.sr; o[i] += a * Math.sin(w * i) * Math.exp(-t / tau) * (t < 0.002 ? t / 0.002 : 1); }
  }
  return o;
}
// Karplus-Strong plucked string
function ks(f, dur, r, { damp = 0.5, bright = 0.5 } = {}) {
  const N = Math.max(2, Math.round(S.sr / f)), line = new Float32Array(N);
  let prev = 0; const a = 1 - bright * 0.92;
  for (let i = 0; i < N; i++) { prev = a * prev + (1 - a) * (r() * 2 - 1); line[i] = prev; }
  let e = 0; for (let i = 0; i < N; i++) e += line[i] * line[i]; const g = 1 / Math.sqrt(e / N + 1e-9);
  for (let i = 0; i < N; i++) line[i] *= g;
  const out = new Float32Array(len(dur)), loss = 1 - (0.0025 + damp * 0.02); let k = 0;
  for (let i = 0; i < out.length; i++) { const c = line[k], nx = line[(k + 1) % N]; out[i] = c; line[k] = 0.5 * (c + nx) * loss; k = (k + 1) % N; }
  return out;
}
const decayShape = (dur, tau) => expDecay(dur, tau);

// ================= percussion =================
def("kick", "Punchy kick drum (pitch-dropping sine + click).", { freq: 52, start: 150, dur: 0.38, click: 0.25, drive: 1.6 }, (p, { r }) => {
  const f = (t) => p.freq + (p.start - p.freq) * Math.exp(-t * 26);
  const body = times(osc("sine", p.dur, f), expDecay(p.dur, p.dur * 0.32, 0.001));
  const click = times(hp(noise(p.dur, r), 1500), expDecay(p.dur, 0.004, 0.0002));
  for (let i = 0; i < body.length; i++) body[i] += click[i] * p.click;
  return saturate(body, p.drive);
});
def("snare", "Snare: body tone + bright noise.", { tone: 190, dur: 0.24, noise: 0.85 }, (p, { r }) => {
  const t1 = times(osc("sine", p.dur, (t) => p.tone * (1 + 0.5 * Math.exp(-t * 40))), expDecay(p.dur, 0.05));
  const n = times(hp(bp(noise(p.dur, r), 3800, 0.6), 1200), expDecay(p.dur, p.dur * 0.32));
  for (let i = 0; i < t1.length; i++) t1[i] = t1[i] * 0.7 + n[i] * p.noise;
  return t1;
});
def("hat", "Closed or open hi-hat.", { open: 0, dur: 0.06 }, (p, { r }) => {
  const dur = p.open ? Math.max(p.dur, 0.28) : p.dur;
  return times(hp(noise(dur, r), 7500), expDecay(dur, p.open ? 0.09 : 0.012, 0.0005));
});
def("clap", "Hand clap (three fast noise bursts + tail).", { dur: 0.22 }, (p, { r }) => {
  const n = bp(noise(p.dur, r), 1500, 0.9), env = make(p.dur, (t) => {
    let e = 0; for (const o of [0, 0.011, 0.023]) if (t >= o) e += Math.exp(-(t - o) / 0.004) * 0.6;
    return e + (t > 0.03 ? Math.exp(-(t - 0.03) / 0.05) * 0.5 : 0);
  });
  return times(n, env);
});
def("rim", "Rim click / side stick.", { freq: 1700, dur: 0.06 }, (p) =>
  times(add(osc("square", p.dur, p.freq), osc("sine", p.dur, p.freq * 0.5), 0, 0.6), expDecay(p.dur, 0.012, 0.0004)));
def("shaker", "Shaker / maracas swish.", { dur: 0.09 }, (p, { r }) =>
  times(hp(noise(p.dur, r), 5000), envelope(p.dur, [[0, 0], [p.dur * 0.35, 1], [p.dur, 0]])));
def("tick", "Tiny bright tick (typing, counters, ratchet).", { freq: 2600, dur: 0.03 }, (p, { r }) =>
  times(add(osc("sine", p.dur, p.freq), noise(p.dur, r), 0, 0.25), expDecay(p.dur, 0.006, 0.0003)));
def("click", "Very short click (switch, UI).", { freq: 1400, dur: 0.012 }, (p, { r }) =>
  times(add(osc("sine", p.dur, p.freq), hp(noise(p.dur, r), 3000), 0, 0.5), expDecay(p.dur, 0.003, 0.0002)));
def("thud", "Soft low thud (footstep, drop, landing).", { freq: 70, dur: 0.3 }, (p, { r }) => {
  const b = times(osc("sine", p.dur, (t) => p.freq * (1 + 0.6 * Math.exp(-t * 30))), expDecay(p.dur, 0.08));
  return add(b, times(lp(noise(p.dur, r), 400), expDecay(p.dur, 0.03)), 0, 0.5);
});
def("knock", "Wooden knock / woodblock.", { freq: 340, dur: 0.16 }, (p, { r }) =>
  add(partials(p.dur, p.freq, [[1, 1, 0.05], [2.4, 0.5, 0.03], [4.1, 0.2, 0.015]]), times(bp(noise(p.dur, r), 1500, 1), expDecay(p.dur, 0.004)), 0, 0.15));
def("stamp", "Rubber-stamp / seal thunk.", { dur: 0.3 }, (p, { r }) => {
  const b = KINDS.thud.render({ ...KINDS.thud.defaults(), freq: 95, dur: p.dur }, { r });
  return add(b, KINDS.click.render({ ...KINDS.click.defaults(), freq: 900 }, { r }), 0, 0.7);
});
def("impact", "Big cinematic hit / boom.", { dur: 1.6, freq: 50 }, (p, { r }) => {
  const sub = times(osc("sine", p.dur, (t) => p.freq * (1 + 1.2 * Math.exp(-t * 9))), expDecay(p.dur, p.dur * 0.3));
  const air = times(lp(noise(p.dur, r), (t) => 200 + 5000 * Math.exp(-t * 7)), expDecay(p.dur, 0.35));
  return add(sub, air, 0, 0.7);
});
def("crash", "Crash cymbal.", { dur: 1.7 }, (p, { r }) => {
  const n = times(hp(noise(p.dur, r), 3500), expDecay(p.dur, p.dur * 0.3));
  const m = [1, 1.47, 1.83, 2.13, 2.66, 3.4].reduce((a, ra) => add(a, times(hp(osc("square", p.dur, 310 * ra), 2500), expDecay(p.dur, 0.5)), 0, 0.06), new Float32Array(len(p.dur)));
  return add(n, m, 0, 1);
});
def("shutter", "Camera shutter (double click + mirror slap).", { dur: 0.26 }, (p, { r }) => {
  const o = new Float32Array(len(p.dur));
  add(o, KINDS.click.render({ ...KINDS.click.defaults(), freq: 2200, dur: 0.014 }, { r }), 0, 1);
  add(o, KINDS.thud.render({ ...KINDS.thud.defaults(), freq: 150, dur: 0.08 }, { r }), 0.004, 0.6);
  add(o, KINDS.click.render({ ...KINDS.click.defaults(), freq: 1300, dur: 0.014 }, { r }), 0.075, 0.8);
  return o;
});
def("heartbeat", "Lub-dub heartbeat.", { dur: 0.6 }, (p, { r }) => {
  const o = new Float32Array(len(p.dur));
  add(o, KINDS.thud.render({ ...KINDS.thud.defaults(), freq: 60, dur: 0.22 }, { r }), 0, 1);
  add(o, KINDS.thud.render({ ...KINDS.thud.defaults(), freq: 55, dur: 0.22 }, { r }), 0.2, 0.75);
  return o;
});

def("drum", "Tuned membrane drum (gendang / kompang / tabla / frame drum). Pitch by `freq`, `slap` adds skin snap, `bend` = pitch fall.", { freq: 150, dur: 0.25, slap: 0.3, bend: 0.25 }, (p, { r }) => {
  const body = times(osc("sine", p.dur, (t) => p.freq * (1 + p.bend * Math.exp(-t * 22))), expDecay(p.dur, p.dur * 0.35, 0.001));
  const skin = times(bp(noise(p.dur, r), Math.min(4200, p.freq * 9), 1.1), expDecay(p.dur, 0.012, 0.0004));
  return add(body, skin, 0, p.slap);
});

// ================= tonal one-shots =================
def("pop", "Bubbly pop with a pitch rise (UI, icons, badges). Change `freq` per event for a scale.", { freq: 520, rise: 1.8, dur: 0.11 }, (p) => {
  const f = (t) => p.freq * (1 + (p.rise - 1) * Math.min(1, t / 0.045));
  return D.softClip(times(osc("sine", p.dur, f), expDecay(p.dur, p.dur * 0.32, 0.002)), 0.95);
});
def("boing", "Cartoon spring boing.", { freq: 220, dur: 0.55 }, (p) => {
  const f = (t) => p.freq * (1 + 0.8 * Math.exp(-t * 5) * (1 + 0.6 * Math.sin(TAU * 14 * t)));
  const a = osc("sine", p.dur, f), b = osc("sine", p.dur, (t) => 2 * f(t));
  return times(add(a, b, 0, 0.3), expDecay(p.dur, 0.22));
});
def("blip", "Short synth blip (UI, HUD, terminal).", { freq: 880, dur: 0.07, wave: "square" }, (p) =>
  times(lp(osc(p.wave, p.dur, p.freq), 6000), adsr(p.dur, 0.002, 0.02, 0.6, 0.02)));
def("boop", "Round low boop.", { freq: 330, dur: 0.13 }, (p) =>
  times(osc("sine", p.dur, (t) => p.freq * (1.25 - 0.25 * Math.min(1, t / 0.05))), expDecay(p.dur, 0.06, 0.003)));
def("zap", "Electric zap.", { dur: 0.28 }, (p, { r }) => {
  const z = osc("saw", p.dur, (t) => 150 + 3000 * Math.exp(-t * 11));
  return hp(times(add(z, noise(p.dur, r), 0, 0.3), expDecay(p.dur, 0.09)), 200);
});
def("chirp", "Sine sweep chirp.", { f0: 600, f1: 2400, dur: 0.12, wave: "sine" }, (p) =>
  times(osc(p.wave, p.dur, (t) => p.f0 * Math.pow(p.f1 / p.f0, t / p.dur)), adsr(p.dur, 0.004, 0.03, 0.7, 0.03)));
def("glitch", "Short bit-crushed stutter burst.", { dur: 0.3 }, (p, { r }) => {
  const o = new Float32Array(len(p.dur)); let t = 0;
  while (t < p.dur - 0.02) {
    const seg = r.range(0.02, 0.07), tone = r() < 0.6;
    const b = tone ? osc("square", seg, r.range(200, 3200)) : noise(seg, r);
    add(o, bitcrush(fade(b, 0.001, 0.002), 4 + Math.floor(r() * 3), 2 + Math.floor(r() * 6)), t, 0.9);
    t += seg * (r() < 0.3 ? 1.4 : 1);
  }
  return o;
});
def("coin", "Two-note 8-bit coin / collect.", { dur: 0.36 }, (p) => {
  const o = new Float32Array(len(p.dur));
  add(o, times(osc("square", 0.07, 1319), adsr(0.07, 0.002, 0.02, 0.7, 0.02)), 0);
  add(o, times(osc("square", p.dur - 0.06, 1976), expDecay(p.dur - 0.06, 0.09)), 0.06);
  return lp(o, 7000);
});
def("ding", "Clear bell ding (success, big number lands).", { freq: 1568, dur: 0.9 }, (p) => partials(p.dur, p.freq, [[1, 1, 0.35], [2.01, 0.35, 0.15], [3.02, 0.12, 0.08]]));
def("chime", "Glassy chime.", { freq: 880, dur: 1.4 }, (p) => partials(p.dur, p.freq, [[1, 1, 0.5], [2.32, 0.5, 0.3], [4.25, 0.3, 0.2], [6.63, 0.15, 0.12]]));
def("bell", "Deeper resonant bell / gong-ish.", { freq: 440, dur: 2.4 }, (p) =>
  partials(p.dur, p.freq, [[0.5, 0.6, 1.4], [1, 1, 1.0], [1.19, 0.5, 0.8], [2, 0.6, 0.6], [2.51, 0.4, 0.4], [3.01, 0.3, 0.3], [4.2, 0.2, 0.2], [5.4, 0.12, 0.12]]));
def("gong", "Soft gong accent.", { freq: 110, dur: 2.8 }, (p, { r }) =>
  add(partials(p.dur, p.freq, [[1, 1, 1.6], [1.51, 0.6, 1.2], [2.07, 0.5, 0.9], [2.83, 0.3, 0.7], [3.42, 0.2, 0.5]]), times(lp(noise(p.dur, r), 1200), expDecay(p.dur, 0.25)), 0, 0.25));
def("ping", "Sonar ping with a dark echo.", { freq: 1000, dur: 0.9 }, (p) =>
  echo(times(osc("sine", p.dur, p.freq), expDecay(p.dur, 0.25)), 0.19, 0.45, 0.5, 1800, 0.6).subarray(0, len(p.dur + 0.5)));
def("sparkle", "Cluster of tiny high glints.", { dur: 0.7, n: 10, lo: 3000, hi: 8000 }, (p, { r }) => {
  const o = new Float32Array(len(p.dur));
  for (let k = 0; k < p.n; k++) {
    const d = r.range(0.05, 0.16), t0 = r.range(0, p.dur * 0.75);
    add(o, times(osc("sine", d, r.range(p.lo, p.hi)), expDecay(d, d * 0.3, 0.001)), t0, r.range(0.3, 1));
  }
  return o;
});
def("twinkle", "One to three soft twinkles.", { dur: 0.3, n: 3, lo: 2500, hi: 6000 }, (p, ctx) => KINDS.sparkle.render(p, ctx));

// ================= melodic =================
def("marimba", "Wooden marimba / soft mallet note.", { note: "C5", dur: 0.55 }, (p) => {
  const f = hz(p.note);
  return partials(p.dur, f, [[1, 1, p.dur * 0.35], [4, 0.28, 0.07], [9.2, 0.08, 0.025]]);
});
def("xylo", "Bright xylophone note.", { note: "C6", dur: 0.4 }, (p) => partials(p.dur, hz(p.note), [[1, 1, 0.16], [3, 0.4, 0.06], [6, 0.15, 0.03]]));
def("glock", "Glockenspiel / music-box note.", { note: "C6", dur: 0.9 }, (p) => partials(p.dur, hz(p.note), [[1, 1, 0.4], [2.76, 0.35, 0.16], [5.4, 0.15, 0.08]]));
def("pluck", "Plucked string (guitar / ukulele / harp-ish). `bright` 0-1, `damp` 0-1.", { note: "A3", dur: 0.9, damp: 0.5, bright: 0.55 }, (p, { r }) => ks(hz(p.note), p.dur, r, p));
def("harp", "Long bright harp pluck.", { note: "C5", dur: 1.6 }, (p, { r }) => ks(hz(p.note), p.dur, r, { damp: 0.15, bright: 0.85 }));
def("ep", "Electric-piano (FM, Rhodes-like).", { note: "E4", dur: 1.1 }, (p) => {
  const f = hz(p.note);
  const idx = (t) => 0.3 + 2.2 * Math.exp(-t * 7);
  const mod = (t) => idx(t) * Math.sin(TAU * f * t);
  const o = new Float32Array(len(p.dur)); let ph = 0;
  for (let i = 0; i < o.length; i++) { const t = i / S.sr; o[i] = Math.sin(ph + mod(t)); ph += (TAU * f) / S.sr; }
  const tine = times(osc("sine", p.dur, f * 14), expDecay(p.dur, 0.02));
  return times(add(o, tine, 0, 0.05), expDecay(p.dur, p.dur * 0.45, 0.003));
});
def("piano", "Simple felt-ish piano note.", { note: "C4", dur: 1.4 }, (p, { r }) => {
  const f = hz(p.note), tau = Math.max(0.3, 1.6 - f / 600);
  const b = partials(p.dur, f, [[1, 1, tau], [2.001, 0.5, tau * 0.7], [3.003, 0.3, tau * 0.5], [4.006, 0.18, tau * 0.35], [5.01, 0.1, tau * 0.25]]);
  return add(b, times(lp(noise(p.dur, r), 1200), expDecay(p.dur, 0.012)), 0, 0.12);
});
def("flute", "Breathy flute / bansuri / bamboo flute.", { note: "A4", dur: 1.0, vibrato: 5.5 }, (p, { r }) => {
  const f = hz(p.note), vib = (t) => 1 + 0.004 * Math.min(1, t / 0.25) * Math.sin(TAU * p.vibrato * t);
  const tone = add(osc("sine", p.dur, (t) => f * vib(t)), osc("sine", p.dur, (t) => 2 * f * vib(t)), 0, 0.14);
  const breath = bp(noise(p.dur, r), f * 1.4, 1.2);
  return lp(times(add(tone, breath, 0, 0.09), adsr(p.dur, 0.09, 0.06, 0.85, Math.min(0.2, p.dur * 0.3))), 5200);
});
def("brass", "Brassy swell / stab.", { note: "A3", dur: 0.8 }, (p) => {
  const f = hz(p.note), s = stack("saw", p.dur, f, [-7, 7]);
  return times(lp(s, (t) => f * (1.5 + 4 * Math.min(1, t / 0.14)), 1.1), adsr(p.dur, 0.05, 0.12, 0.8, Math.min(0.25, p.dur * 0.4)));
});
def("pad", "Warm detuned pad. `notes` array makes a chord.", { note: "A3", notes: null, dur: 2, attack: 0.4, release: 0.5, cutoff: 1800 }, (p) => {
  const ns = p.notes || [p.note], o = new Float32Array(len(p.dur));
  for (const n of ns) add(o, stack("saw", p.dur, hz(n), [-12, -5, 0, 5, 12]), 0, 1 / ns.length);
  return times(lp(o, p.cutoff, 0.6), adsr(p.dur, Math.min(p.attack, p.dur * 0.45), 0.1, 0.9, Math.min(p.release, p.dur * 0.45)));
});
def("strings", "String ensemble pad (slower attack, vibrato).", { note: "A3", notes: null, dur: 2.5 }, (p) =>
  KINDS.pad.render({ ...KINDS.pad.defaults(), note: p.note, notes: p.notes, dur: p.dur, attack: 0.7, release: 0.7, cutoff: 2600 }, {}));
def("bass", "Bass note: wave = sub | saw | pluck | pulse.", { note: "A1", dur: 0.4, wave: "sub" }, (p, { r }) => {
  const f = hz(p.note);
  if (p.wave === "pluck") return lp(ks(f, p.dur, r, { damp: 0.6, bright: 0.25 }), 700);
  if (p.wave === "saw") return times(lp(osc("saw", p.dur, f), (t) => f * (7 - 5 * Math.min(1, t / 0.12)), 1.2), adsr(p.dur, 0.004, 0.1, 0.7, 0.05));
  if (p.wave === "pulse") return times(lp(osc("pulse", p.dur, f, { pw: 0.3 }), f * 5), adsr(p.dur, 0.004, 0.08, 0.7, 0.04));
  return times(add(osc("sine", p.dur, f), osc("sine", p.dur, f * 2), 0, 0.25), adsr(p.dur, 0.006, 0.08, 0.85, Math.min(0.06, p.dur * 0.3)));
});
def("lead", "Lead synth note (wave = saw|square|pulse|tri).", { note: "A4", dur: 0.3, wave: "saw", vibrato: 0, cutoff: 5000 }, (p) => {
  const f = hz(p.note);
  const o = osc(p.wave, p.dur, p.vibrato ? (t) => f * (1 + 0.006 * Math.sin(TAU * p.vibrato * t)) : f);
  return times(lp(o, p.cutoff), adsr(p.dur, 0.006, 0.06, 0.65, Math.min(0.08, p.dur * 0.4)));
});
def("drone", "Sustained low drone (tanpura / ambient / dark).", { note: "A1", dur: 4 }, (p) => {
  const f = hz(p.note);
  const o = add(osc("sine", p.dur, f), lp(stack("saw", p.dur, f, [-6, 0, 6]), f * 3), 0, 0.5);
  const lfo = make(p.dur, (t) => 0.85 + 0.15 * Math.sin(TAU * 0.23 * t));
  return times(times(o, lfo), adsr(p.dur, Math.min(1, p.dur * 0.3), 0.1, 1, Math.min(1, p.dur * 0.3)));
});
def("strum", "Chord strum (plucked). `notes` array, `spread` seconds between strings.", { notes: ["A3", "C4", "E4"], dur: 1.2, spread: 0.018 }, (p, { r }) => {
  const o = new Float32Array(len(p.dur));
  p.notes.forEach((n, i) => add(o, ks(hz(n), p.dur - i * p.spread, r, { damp: 0.55, bright: 0.5 }), i * p.spread, 1 / Math.sqrt(p.notes.length)));
  return o;
});

// ================= noise / texture =================
def("whoosh", "Filtered-noise sweep. dir = up | down | peak.", { dur: 0.6, dir: "peak", f0: 300, f1: 4200, q: 1.3 }, (p, { r }) => {
  const g = (u) => p.dir === "up" ? u : p.dir === "down" ? 1 - u : 1 - Math.abs(2 * u - 1);
  const fc = (t) => p.f0 * Math.pow(p.f1 / p.f0, g(t / p.dur));
  const body = bp(noise(p.dur, r, "pink"), fc, p.q);
  const env = make(p.dur, (t) => { const u = t / p.dur; return Math.pow(Math.sin(Math.PI * Math.pow(u, p.dir === "down" ? 0.7 : 1.3)), 1.5); });
  return times(body, env);
});
def("swish", "Short high whoosh (paper, page, quick move).", { dur: 0.18, f0: 1500, f1: 5000 }, (p, ctx) => KINDS.whoosh.render({ ...KINDS.whoosh.defaults(), ...p, dir: "up", q: 1.6 }, ctx));
def("riser", "Rising swell / reverse-cymbal build. `tone` adds a rising sine.", { dur: 1.6, f0: 200, f1: 6000, tone: 0.0 }, (p, { r }) => {
  const fc = (t) => p.f0 * Math.pow(p.f1 / p.f0, t / p.dur);
  const n = bp(noise(p.dur, r, "pink"), fc, 0.9);
  const env = make(p.dur, (t) => Math.pow(t / p.dur, 2.2) * (t > p.dur - 0.01 ? (p.dur - t) / 0.01 : 1));
  const o = times(n, env);
  if (p.tone) add(o, times(osc("sine", p.dur, (t) => 120 + fc(t) * 0.5), env), 0, p.tone);
  return o;
});
def("swell", "Soft rise-and-fall swell (air, glow, bloom).", { dur: 1.5, freq: 900, q: 0.8 }, (p, { r }) =>
  times(bp(noise(p.dur, r, "pink"), p.freq, p.q), make(p.dur, (t) => Math.pow(Math.sin(Math.PI * t / p.dur), 2))));
def("rumble", "Deep rumble.", { dur: 1, freq: 55 }, (p, { r }) => {
  const n = lp(noise(p.dur, r, "brown"), p.freq * 2.5), s = osc("sine", p.dur, p.freq);
  return times(add(n, s, 0, 0.4), envelope(p.dur, [[0, 0], [p.dur * 0.15, 1], [p.dur * 0.7, 0.8], [p.dur, 0]]));
});
def("hiss", "White-noise hiss / static burst.", { dur: 0.5, hp: 3000, pulse: 0 }, (p, { r }) => {
  const n = hp(noise(p.dur, r), p.hp), gate = p.pulse ? make(p.dur, () => 1) : null;
  if (gate) { let g = 1, next = 0; for (let i = 0; i < gate.length; i++) { if (i >= next) { g = r() < 0.5 ? 1 : 0.15; next = i + len(r.range(0.01, 0.05)); } gate[i] = g; } }
  return times(gate ? times(n, gate) : n, adsr(p.dur, 0.01, 0.05, 0.85, Math.min(0.08, p.dur * 0.3)));
});
def("crackle", "Sparse crackle (fire, vinyl, sparks, embers). density = events/sec.", { dur: 1, density: 40, lo: 800, hi: 6000 }, (p, { r }) => {
  const o = new Float32Array(len(p.dur)); let t = r.range(0, 1 / p.density);
  while (t < p.dur) {
    const d = r.range(0.002, 0.014), b = bp(noise(d, r), r.range(p.lo, p.hi), 1.5);
    add(o, times(b, expDecay(d, d * 0.3, 0.0003)), t, r.range(0.2, 1));
    t += -Math.log(1 - r() * 0.999) / p.density;
  }
  return o;
});
def("sizzle", "Sizzling grill / frying.", { dur: 1.5 }, (p, { r }) => {
  const c = KINDS.crackle.render({ ...KINDS.crackle.defaults(), dur: p.dur, density: 280, lo: 2500, hi: 9000 }, { r });
  return add(c, times(hp(noise(p.dur, r), 6500), adsr(p.dur, 0.1, 0.1, 0.5, 0.2)), 0, 0.35);
});
def("hum", "Mains / neon / machine hum (50 Hz mains -> 100 Hz).", { freq: 100, dur: 1, harm: 6 }, (p) => {
  const o = new Float32Array(len(p.dur));
  for (let k = 1; k <= p.harm; k++) add(o, osc("sine", p.dur, p.freq * k), 0, 1 / k);
  return lp(times(o, adsr(p.dur, 0.08, 0.05, 1, Math.min(0.15, p.dur * 0.3))), 1500);
});
def("buzz", "Electric buzz / flicker.", { freq: 110, dur: 0.3 }, (p, { r }) => {
  const s = stack("square", p.dur, p.freq, [-15, 0, 12]), am = make(p.dur, () => 1);
  let g = 1, next = 0; for (let i = 0; i < am.length; i++) { if (i >= next) { g = 0.5 + 0.5 * r(); next = i + len(r.range(0.004, 0.02)); } am[i] = g; }
  return hp(times(times(s, am), adsr(p.dur, 0.004, 0.03, 0.8, 0.04)), 90);
});
def("whir", "Motor / fan / servo whir (f0 -> f1).", { f0: 90, f1: 190, dur: 0.5 }, (p, { r }) => {
  const f = (t) => p.f0 * Math.pow(p.f1 / p.f0, t / p.dur);
  return lp(times(add(osc("saw", p.dur, f), noise(p.dur, r), 0, 0.15), adsr(p.dur, 0.05, 0.05, 0.9, 0.1)), 2800);
});
def("scratch", "Pen / chalk / marker / brush scratch (rough-envelope noise).", { dur: 0.4, freq: 2600, jitter: 0.6 }, (p, { r }) => {
  const rough = lp(noise(p.dur, r), 90), env = make(p.dur, (t, i) => clamp(0.55 + p.jitter * rough[i] * 6, 0, 1.4));
  return times(times(bp(noise(p.dur, r), p.freq, 0.9), env), adsr(p.dur, 0.03, 0.05, 0.9, 0.06));
});
def("paper", "Paper rustle / page.", { dur: 0.35 }, (p, { r }) => {
  const o = new Float32Array(len(p.dur));
  for (let k = 0; k < 6; k++) { const d = r.range(0.02, 0.08); add(o, times(hp(noise(d, r), 1400), expDecay(d, d * 0.35, 0.002)), r.range(0, p.dur - d), r.range(0.4, 1)); }
  return o;
});
def("cloth", "Cloth swish + flap.", { dur: 0.7 }, (p, { r }) => {
  const w = KINDS.whoosh.render({ ...KINDS.whoosh.defaults(), dur: p.dur, f0: 150, f1: 1400, dir: "peak", q: 0.9 }, { r });
  return add(w, times(lp(noise(0.12, r), 900), expDecay(0.12, 0.04)), p.dur * 0.6, 0.9);
});
def("pour", "Liquid pour (gurgling noise).", { dur: 1.2 }, (p, { r }) => {
  const g = lp(noise(p.dur, r), 22), o = bp(noise(p.dur, r, "pink"), (t, i) => 2200 + 1400 * (g[Math.min(g.length - 1, Math.round(t * S.sr))] || 0) * 6, 1.8);
  return times(o, adsr(p.dur, 0.08, 0.1, 0.85, 0.15));
});
def("drip", "Water drip.", { freq: 900, dur: 0.16 }, (p) =>
  times(osc("sine", p.dur, (t) => p.freq * (1 + 1.6 * Math.min(1, t / 0.05))), expDecay(p.dur, 0.035, 0.002)));
def("wind", "Airy wind / breath.", { dur: 2 }, (p, { r }) => {
  const lfo = make(p.dur, (t) => 600 + 500 * Math.sin(TAU * 0.35 * t) + 250 * Math.sin(TAU * 0.11 * t + 1));
  return times(bp(noise(p.dur, r, "pink"), (t) => lfo[Math.min(lfo.length - 1, Math.round(t * S.sr))], 0.7), adsr(p.dur, p.dur * 0.35, 0.1, 0.9, p.dur * 0.4));
});
def("insects", "Tree insects / cicadas shimmer.", { dur: 2, freq: 5200 }, (p, { r }) => {
  const o = new Float32Array(len(p.dur));
  for (const c of [1, 1.031, 0.968]) {
    const am = make(p.dur, (t) => 0.5 + 0.5 * Math.sin(TAU * (38 + 6 * c) * t) * (0.7 + 0.3 * Math.sin(TAU * 0.4 * t)));
    add(o, times(osc("sine", p.dur, p.freq * c), am), 0, 0.5);
  }
  return times(o, adsr(p.dur, p.dur * 0.3, 0.1, 0.9, p.dur * 0.3));
});
def("crickets", "Night crickets chirping.", { dur: 2, freq: 3900 }, (p, { r }) => {
  const gate = make(p.dur, (t) => { const u = (t * 2.1) % 1; return u < 0.5 ? (0.5 + 0.5 * Math.sin(TAU * 4 * u * 3)) : 0; });
  return times(add(osc("sine", p.dur, p.freq), osc("sine", p.dur, p.freq * 1.5), 0, 0.2), times(gate, adsr(p.dur, 0.2, 0.1, 0.9, 0.3)));
});
def("crowd", "Crowd murmur (market, cafe).", { dur: 2 }, (p, { r }) => {
  const layer = (f, q) => times(bp(noise(p.dur, r, "pink"), f, q), make(p.dur, () => 1)), o = new Float32Array(len(p.dur));
  for (const [f, q] of [[420, 1.2], [900, 1.5], [1700, 1.6]]) {
    const b = layer(f, q), slow = lp(noise(p.dur, r), 2.2);
    for (let i = 0; i < o.length; i++) o[i] += b[i] * (0.6 + 2.5 * slow[i]);
  }
  return times(o, adsr(p.dur, p.dur * 0.2, 0.1, 0.9, p.dur * 0.2));
});
def("footstep", "Soft footstep.", { dur: 0.2, freq: 95 }, (p, { r }) => add(KINDS.thud.render({ ...KINDS.thud.defaults(), freq: p.freq, dur: p.dur }, { r }), times(lp(noise(p.dur, r), 2000), expDecay(p.dur, 0.02)), 0, 0.3));
def("tapewarble", "Tape / VHS pitch warble + hiss.", { dur: 0.8 }, (p, { r }) => {
  const t1 = osc("sine", p.dur, (t) => 520 * (1 + 0.06 * Math.sin(TAU * 6 * t) + 0.03 * Math.sin(TAU * 17 * t)));
  return times(add(lp(t1, 2500), hp(noise(p.dur, r), 4000), 0, 0.25), adsr(p.dur, 0.03, 0.05, 0.8, 0.12));
});
def("firework", "Distant firework: whistle, thump, crackle.", { dur: 1.7 }, (p, { r }) => {
  const o = new Float32Array(len(p.dur));
  add(o, times(lp(osc("sine", 0.5, (t) => 900 + 1500 * (t / 0.5) + 30 * Math.sin(TAU * 18 * t)), 4000), envelope(0.5, [[0, 0], [0.25, 0.4], [0.5, 0]])), 0, 0.5);
  add(o, KINDS.thud.render({ ...KINDS.thud.defaults(), freq: 55, dur: 0.4 }, { r }), 0.5, 1);
  add(o, KINDS.crackle.render({ ...KINDS.crackle.defaults(), dur: 0.9, density: 70, lo: 3000, hi: 9000 }, { r }), 0.55, 0.5);
  return o;
});
def("cannon", "Toy cannon / confetti pop.", { dur: 0.4 }, (p, { r }) => {
  const o = KINDS.thud.render({ ...KINDS.thud.defaults(), freq: 120, dur: 0.3 }, { r });
  return add(o, times(hp(noise(p.dur, r), 2500), expDecay(p.dur, 0.05)), 0, 0.7);
});

// ---------- registry helpers ----------
for (const [name, k] of Object.entries(KINDS)) {
  k.defaults = () => ({ ...k.params });
  const raw = k.render;
  k.render = (p, ctx) => {
    const merged = { ...k.params, ...p };
    const buf = raw(merged, ctx);
    const pk = peak(buf);
    if (!(pk > 0)) return buf;
    scale(buf, (merged.peak ?? 0.85) / pk);
    return fade(buf, 0.002, Math.min(0.02, buf.length / S.sr / 4));
  };
  k.name = name;
}
