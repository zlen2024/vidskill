// Sound cue sheet: "at" is a beat id from timing.mjs (optionally "id+0.05") or a fraction of the duration. Regenerate: npm run sound
import { D, T } from "./timing.mjs";
const resolveAt = function resolveAt(at, T, D) {
  if (typeof at === "number") return +(at * D).toFixed(3);
  const m = /^([\w-]+)\s*([+-]\s*\d*\.?\d+)?$/.exec(String(at));
  if (!m || !(m[1] in T)) throw new Error(`cue at="${at}" does not match a beat id (known: ${Object.keys(T).join(", ")})`);
  return +(T[m[1]] + (m[2] ? parseFloat(m[2].replace(/\s/g, "")) : 0)).toFixed(3);
};
const resolveAll = function resolveAll(at, T, D) {
  const wm = typeof at === "string" ? /^([\w-]+)\*\s*([+-]\s*\d*\.?\d+)?$/.exec(at.trim()) : null;   // "phrase*" or "phrase*+0.1"
  if (wm) {
    const pre = wm[1], off = wm[2] ? parseFloat(wm[2].replace(/\s/g, "")) : 0;
    const ids = Object.keys(T).filter((k) => k.startsWith(pre) && /^\d+$/.test(k.slice(pre.length)));
    if (!ids.length) throw new Error(`cue at="${at}" matches no beat ids`);
    return ids.map((k) => +(T[k] + off).toFixed(3)).sort((a, b) => a - b);
  }
  return [resolveAt(at, T, D)];
};
// dynamic values: "D" = whole duration, "rest" = from this cue to the end, "until:<beat id>" = up to that beat (for beds that must span the video)
const dyn = (c) => { for (const k of Object.keys(c)) { const v = c[k]; if (v === "D") c[k] = D; else if (v === "rest") c[k] = Math.max(0.1, D - c.t); else if (typeof v === "string" && v.startsWith("until:")) c[k] = Math.max(0.1, T[v.slice(6)] - c.t); } return c; };
const SPEC = [
  {
    "at": "s1",
    "kind": "rumble",
    "dur": 3,
    "freq": 45,
    "vol": 0.4
  },
  {
    "at": "arc*",
    "kind": "blip",
    "freq": 1200,
    "dur": 0.06,
    "vol": 0.5
  },
  {
    "at": "arc*+0.5",
    "kind": "ping",
    "freq": 900,
    "dur": 1,
    "vol": 0.5
  },
  {
    "at": "s2",
    "kind": "whir",
    "f0": 120,
    "f1": 180,
    "dur": 1.2,
    "vol": 0.3
  },
  {
    "at": "s2+0.4",
    "kind": "typing",
    "n": 8,
    "dt": 0.08,
    "vol": 0.3
  },
  {
    "at": "pulse*",
    "kind": "tick",
    "freq": 1800,
    "vol": 0.45
  },
  {
    "at": "s3",
    "kind": "hum",
    "freq": 100,
    "harm": 4,
    "dur": 3.4,
    "vol": 0.18
  },
  {
    "at": "cell*",
    "kind": "click",
    "freq": 2200,
    "vol": 0.5
  },
  {
    "at": "s3+0.8",
    "kind": "blip",
    "freq": 700,
    "dur": 0.08,
    "vol": 0.3
  },
  {
    "at": "form",
    "kind": "riser",
    "dur": 1.6,
    "tone": 0.15,
    "f0": 1500,
    "f1": 7000,
    "vol": 0.4
  },
  {
    "at": "form",
    "kind": "sparkle",
    "dur": 1.5,
    "lo": 4000,
    "hi": 9000,
    "vol": 0.3
  },
  {
    "at": "glow",
    "kind": "run",
    "inst": "bell",
    "from": "A3",
    "n": 3,
    "dt": 0.12,
    "notes": [
      "A3",
      "E4",
      "A4"
    ],
    "len": 2.4,
    "vol": 0.5
  },
  {
    "at": "dust",
    "kind": "hiss",
    "dur": 1.4,
    "hp": 6500,
    "pulse": 1,
    "vol": 0.25
  }
];
export default {
  duration: D, bpm: 120, seed: 945, sound: "music",
  music: {
  "preset": "dark-ambient",
  "bpm": 120,
  "gain": 1,
  "duck": 0.4,
  "align": "beat"
},
  cues: SPEC.flatMap(({ at, rise, ...c }) => resolveAll(at, T, D).map((t, i) => dyn({ ...c, ...(rise ? { [rise.param]: rise.from + i * rise.by } : {}), t }))),
};
