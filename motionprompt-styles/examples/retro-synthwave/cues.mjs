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
    "at": "sting",
    "kind": "pad",
    "notes": [
      "A3",
      "C4",
      "E4",
      "A4"
    ],
    "dur": 2.2,
    "attack": 0.02,
    "vol": 0.7,
    "verb": 0.4
  },
  {
    "at": "sting",
    "kind": "sparkle",
    "dur": 1.2,
    "lo": 3500,
    "hi": 9000,
    "vol": 0.4
  },
  {
    "at": "line*",
    "kind": "whoosh",
    "dir": "peak",
    "dur": 0.4,
    "f0": 120,
    "f1": 700,
    "vol": 0.28
  },
  {
    "at": "band",
    "kind": "chirp",
    "f0": 400,
    "f1": 1500,
    "dur": 0.15,
    "vol": 0.4
  },
  {
    "at": "band",
    "kind": "tapewarble",
    "dur": 1,
    "vol": 0.55
  },
  {
    "at": "band",
    "kind": "hiss",
    "dur": 1,
    "hp": 4500,
    "vol": 0.2
  },
  {
    "at": "bandend",
    "kind": "chirp",
    "f0": 1500,
    "f1": 400,
    "dur": 0.15,
    "vol": 0.4
  }
];
export default {
  duration: D, bpm: 120, seed: 4940, sound: "music",
  music: {
  "preset": "synthwave",
  "bpm": 120,
  "gain": 1,
  "duck": 0.4,
  "align": "beat"
},
  cues: SPEC.flatMap(({ at, rise, ...c }) => resolveAll(at, T, D).map((t, i) => dyn({ ...c, ...(rise ? { [rise.param]: rise.from + i * rise.by } : {}), t }))),
};
