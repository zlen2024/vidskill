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
    "at": "hit",
    "kind": "impact",
    "dur": 1.4,
    "freq": 55,
    "vol": 0.8,
    "verb": 0.4
  },
  {
    "at": "spin1",
    "kind": "whoosh",
    "dir": "peak",
    "dur": 1.6,
    "f0": 250,
    "f1": 3500,
    "vol": 0.55
  },
  {
    "at": "glint*",
    "kind": "sparkle",
    "dur": 0.6,
    "lo": 4000,
    "hi": 9500,
    "vol": 0.4
  },
  {
    "at": "settle",
    "kind": "impact",
    "dur": 0.8,
    "freq": 90,
    "vol": 0.55
  },
  {
    "at": "settle",
    "kind": "bell",
    "freq": 660,
    "dur": 2,
    "vol": 0.5
  },
  {
    "at": "float",
    "kind": "swell",
    "dur": 1.6,
    "freq": 2400,
    "vol": 0.25
  },
  {
    "at": "spin2",
    "kind": "whoosh",
    "dir": "peak",
    "dur": 1.6,
    "f0": 250,
    "f1": 3500,
    "vol": 0.55
  },
  {
    "at": "riser",
    "kind": "riser",
    "dur": 0.6,
    "tone": 0.3,
    "vol": 0.4
  }
];
export default {
  duration: D, bpm: 80, seed: 2586, sound: "music",
  music: {
  "preset": "epic-intro",
  "bpm": 80,
  "gain": 1,
  "duck": 0.5,
  "align": "beat"
},
  cues: SPEC.flatMap(({ at, rise, ...c }) => resolveAll(at, T, D).map((t, i) => dyn({ ...c, ...(rise ? { [rise.param]: rise.from + i * rise.by } : {}), t }))),
};
