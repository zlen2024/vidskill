// Tiny zero-dependency DSP toolkit for the MotionPrompt synth. Mono Float32Array buffers, seeded, deterministic.
export const S = { sr: 44100 };            // sample rate holder (set once by setSampleRate)
export const setSampleRate = (sr) => { S.sr = sr; };
export const TAU = Math.PI * 2;
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const db = (x) => Math.pow(10, x / 20);

// ---------- randomness (mulberry32) ----------
export function rng(seed = 1) {
  let a = seed >>> 0;
  const f = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.range = (lo, hi) => lo + (hi - lo) * f();
  f.pick = (arr) => arr[Math.floor(f() * arr.length) % arr.length];
  f.gauss = () => Math.sqrt(-2 * Math.log(f() + 1e-12)) * Math.cos(TAU * f());
  return f;
}
export const hashSeed = (...parts) => {
  let h = 2166136261;
  for (const c of parts.join("|")) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
};

// ---------- notes ----------
const NOTE = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
export function midiOf(n) {
  if (typeof n === "number") return n;
  const m = /^([A-G][#b]?)(-?\d)$/.exec(n);
  if (!m) throw new Error(`bad note "${n}" (use e.g. C4, F#3, Bb5)`);
  return NOTE[m[1]] + 12 * (parseInt(m[2], 10) + 1);
}
export const hz = (n) => (typeof n === "number" && n > 127 ? n : 440 * Math.pow(2, (midiOf(n) - 69) / 12));
export const fromMidi = (m) => 440 * Math.pow(2, (m - 69) / 12);

// ---------- buffers ----------
export const len = (sec) => Math.max(1, Math.round(sec * S.sr));
export function make(sec, fn) {
  const n = len(sec), out = new Float32Array(n);
  if (fn) for (let i = 0; i < n; i++) out[i] = fn(i / S.sr, i);
  return out;
}
export function add(dst, src, at = 0, gain = 1) {   // mix src into dst at second `at` (grows nothing; clips to dst)
  const o = Math.round(at * S.sr);
  for (let i = 0; i < src.length; i++) {
    const j = o + i;
    if (j >= 0 && j < dst.length) dst[j] += src[i] * gain;
  }
  return dst;
}
export const scale = (b, g) => { for (let i = 0; i < b.length; i++) b[i] *= g; return b; };
export const peak = (b) => { let p = 0; for (let i = 0; i < b.length; i++) p = Math.max(p, Math.abs(b[i])); return p; };
export const rms = (b) => { let s = 0; for (let i = 0; i < b.length; i++) s += b[i] * b[i]; return Math.sqrt(s / Math.max(1, b.length)); };
export function fade(b, inSec = 0.003, outSec = 0.01) {   // de-click edges in place
  const a = Math.min(b.length, len(inSec)), z = Math.min(b.length, len(outSec));
  for (let i = 0; i < a; i++) b[i] *= i / a;
  for (let i = 0; i < z; i++) b[b.length - 1 - i] *= i / z;
  return b;
}
export function times(a, b) { const n = Math.min(a.length, b.length), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = a[i] * b[i]; return o; }

// ---------- envelopes ----------
// pts: [[sec, level], ...] linear segments; `expo` makes segments exponential (levels must be > 0)
export function envelope(sec, pts, expo = false) {
  const n = len(sec), out = new Float32Array(n);
  let k = 0;
  for (let i = 0; i < n; i++) {
    const t = i / S.sr;
    while (k < pts.length - 2 && t >= pts[k + 1][0]) k++;
    const [t0, v0] = pts[k], [t1, v1] = pts[Math.min(k + 1, pts.length - 1)];
    const u = t1 > t0 ? clamp((t - t0) / (t1 - t0), 0, 1) : 1;
    out[i] = expo && v0 > 0 && v1 > 0 ? v0 * Math.pow(v1 / v0, u) : lerp(v0, v1, u);
  }
  return out;
}
export const adsr = (sec, a, d, s, r) => envelope(sec, [[0, 0], [a, 1], [a + d, s], [Math.max(a + d, sec - r), s], [sec, 0]]);
export const expDecay = (sec, tau, attack = 0.002) => make(sec, (t) => (t < attack ? t / attack : Math.exp(-(t - attack) / tau)));
export const hann = (sec) => make(sec, (t) => 0.5 - 0.5 * Math.cos((TAU * t) / sec));

// ---------- oscillators ----------
function blep(t, dt) {
  if (t < dt) { t /= dt; return t + t - t * t - 1; }
  if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; }
  return 0;
}
// freq: number or fn(t)->Hz. type: sine|saw|square|tri|pulse
export function osc(type, sec, freq, { phase = 0, pw = 0.5, fm = null } = {}) {
  const n = len(sec), out = new Float32Array(n);
  let ph = phase;
  const fn = typeof freq === "function";
  for (let i = 0; i < n; i++) {
    const t = i / S.sr;
    const f = (fn ? freq(t) : freq) * (fm ? 1 + fm(t) : 1);
    const dt = clamp(f / S.sr, 1e-6, 0.45);
    let v;
    switch (type) {
      case "sine": v = Math.sin(TAU * ph); break;
      case "saw": v = 2 * ph - 1 - blep(ph, dt); break;
      case "square": case "pulse": v = (ph < pw ? 1 : -1) + blep(ph, dt) - blep((ph + 1 - pw) % 1, dt); break;
      case "tri": v = 4 * Math.abs(ph - 0.5) - 1; break;
      default: throw new Error(`osc type ${type}`);
    }
    out[i] = v;
    ph += dt; if (ph >= 1) ph -= 1;
  }
  return out;
}
export function stack(type, sec, f, cents = [-9, 0, 9], opt = {}) {   // detuned unison
  const out = new Float32Array(len(sec));
  cents.forEach((c, k) => {
    const r = Math.pow(2, c / 1200);
    const o = osc(type, sec, typeof f === "function" ? (t) => f(t) * r : f * r, { phase: (k * 0.37) % 1, ...opt });
    for (let i = 0; i < out.length; i++) out[i] += o[i] / cents.length;
  });
  return out;
}

// ---------- noise ----------
export function noise(sec, r, color = "white") {
  const n = len(sec), out = new Float32Array(n);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, br = 0;
  for (let i = 0; i < n; i++) {
    const w = r() * 2 - 1;
    if (color === "white") out[i] = w;
    else if (color === "pink") {            // Paul Kellet
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
    } else { br = (br + 0.02 * w) / 1.02; out[i] = br * 3.5; }     // brown
  }
  return out;
}

// ---------- filters (RBJ biquads; f and q may be fn(t)) ----------
function coeffs(type, f, q, gDb = 0) {
  const w = (TAU * clamp(f, 10, S.sr * 0.45)) / S.sr, c = Math.cos(w), s = Math.sin(w), al = s / (2 * Math.max(q, 0.05));
  const A = Math.pow(10, gDb / 40);
  let b0, b1, b2, a0, a1, a2;
  switch (type) {
    case "lp": b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; break;
    case "hp": b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; break;
    case "bp": b0 = al; b1 = 0; b2 = -al; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; break;
    case "notch": b0 = 1; b1 = -2 * c; b2 = 1; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; break;
    case "peak": b0 = 1 + al * A; b1 = -2 * c; b2 = 1 - al * A; a0 = 1 + al / A; a1 = -2 * c; a2 = 1 - al / A; break;
    default: throw new Error(`filter ${type}`);
  }
  return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
}
export function filter(buf, type, f, q = 0.707, gDb = 0) {
  const n = buf.length, out = new Float32Array(n);
  const fF = typeof f === "function", qF = typeof q === "function";
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, c = coeffs(type, fF ? f(0) : f, qF ? q(0) : q, gDb);
  for (let i = 0; i < n; i++) {
    if ((fF || qF) && i % 16 === 0) c = coeffs(type, fF ? f(i / S.sr) : f, qF ? q(i / S.sr) : q, gDb);
    const x0 = buf[i];
    const y0 = c[0] * x0 + c[1] * x1 + c[2] * x2 - c[3] * y1 - c[4] * y2;
    out[i] = y0; x2 = x1; x1 = x0; y2 = y1; y1 = y0;
  }
  return out;
}
export const lp = (b, f, q) => filter(b, "lp", f, q);
export const hp = (b, f, q) => filter(b, "hp", f, q);
export const bp = (b, f, q) => filter(b, "bp", f, q);

// ---------- effects ----------
export function saturate(b, drive = 2) { const o = new Float32Array(b.length), k = Math.tanh(drive); for (let i = 0; i < b.length; i++) o[i] = Math.tanh(b[i] * drive) / k; return o; }
export function bitcrush(b, bits = 6, hold = 4) {
  const o = new Float32Array(b.length), lv = Math.pow(2, bits - 1);
  let h = 0;
  for (let i = 0; i < b.length; i++) { if (i % hold === 0) h = Math.round(b[i] * lv) / lv; o[i] = h; }
  return o;
}
export function echo(b, delay = 0.25, fb = 0.35, mix = 0.4, tone = 3500, tail = 1.5) {
  const n = b.length + len(tail), out = new Float32Array(n), d = len(delay);
  const wet = new Float32Array(n);
  let lpst = 0; const a = Math.exp(-TAU * tone / S.sr);
  for (let i = 0; i < n; i++) {
    const x = i < b.length ? b[i] : 0;
    const fbk = i >= d ? wet[i - d] : 0;
    lpst = (1 - a) * fbk + a * lpst;
    wet[i] = x + lpst * fb;
    out[i] = x + (i >= d ? wet[i - d] : 0) * mix;
  }
  return out;
}
// Freeverb: mono in -> [L, R]
export function reverb(b, { room = 0.82, damp = 0.35, wet = 1, tail = 1.6 } = {}) {
  const scaleSr = S.sr / 44100, n = b.length + len(tail);
  const combT = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], apT = [556, 441, 341, 225], spread = 23;
  const run = (off) => {
    const out = new Float32Array(n);
    const combs = combT.map((t) => ({ buf: new Float32Array(Math.round((t + off) * scaleSr)), i: 0, s: 0 }));
    const aps = apT.map((t) => ({ buf: new Float32Array(Math.round((t + off) * scaleSr)), i: 0 }));
    const d1 = damp, fb = room;
    for (let i = 0; i < n; i++) {
      const x = (i < b.length ? b[i] : 0) * 0.015;
      let y = 0;
      for (const c of combs) {
        const o = c.buf[c.i]; c.s = o * (1 - d1) + c.s * d1; c.buf[c.i] = x + c.s * fb; if (++c.i >= c.buf.length) c.i = 0; y += o;
      }
      for (const a of aps) { const o = a.buf[a.i]; const z = y; y = -y + o; a.buf[a.i] = z + o * 0.5; if (++a.i >= a.buf.length) a.i = 0; }
      out[i] = y * wet;
    }
    return out;
  };
  return [run(0), run(spread)];
}
export function reverse(b) { const o = new Float32Array(b.length); for (let i = 0; i < b.length; i++) o[i] = b[b.length - 1 - i]; return o; }
export function normalize(b, targetDb = -1) { const p = peak(b); if (p > 0) scale(b, db(targetDb) / p); return b; }
export function softClip(b, ceiling = 0.98) { for (let i = 0; i < b.length; i++) { const x = b[i] / ceiling; b[i] = ceiling * (Math.abs(x) < 0.8 ? x : Math.sign(x) * (0.8 + 0.2 * Math.tanh((Math.abs(x) - 0.8) / 0.2))); } return b; }
