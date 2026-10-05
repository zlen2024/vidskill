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
    "at": "wipein",
    "kind": "chirp",
    "f0": 200,
    "f1": 1600,
    "dur": 0.5,
    "wave": "square",
    "vol": 0.45
  },
  {
    "at": "name",
    "kind": "typing",
    "n": 8,
    "dt": 0.08,
    "f0": 900,
    "f1": 1200,
    "vol": 0.4
  },
  {
    "at": "stat*",
    "kind": "ticks",
    "n": 8,
    "span": 0.5,
    "tick": "blip",
    "f0": 500,
    "f1": 1100,
    "vol": 0.4
  },
  {
    "at": "start*",
    "kind": "blip",
    "freq": 880,
    "dur": 0.07,
    "vol": 0.5
  },
  {
    "at": "select",
    "kind": "run",
    "inst": "coin",
    "n": 1,
    "vol": 0.7
  },
  {
    "at": "select",
    "kind": "whoosh",
    "dir": "up",
    "dur": 0.5,
    "vol": 0.4
  },
  {
    "at": "jump*",
    "kind": "boing",
    "freq": 300,
    "dur": 0.3,
    "vol": 0.5
  },
  {
    "at": "jump*+0.77",
    "kind": "thud",
    "freq": 90,
    "dur": 0.1,
    "vol": 0.45
  },
  {
    "at": "block*",
    "kind": "thud",
    "freq": 120,
    "dur": 0.12,
    "vol": 0.7
  },
  {
    "at": "block*+0.1",
    "kind": "run",
    "inst": "lead",
    "from": "C5",
    "n": 3,
    "dt": 0.07,
    "scale": "major",
    "len": 0.2,
    "vol": 0.55
  },
  {
    "at": "coin*",
    "kind": "coin",
    "vol": 0.6
  },
  {
    "at": "coin*+0.1",
    "kind": "tick",
    "freq": 3000,
    "vol": 0.3
  },
  {
    "at": "star",
    "kind": "run",
    "inst": "lead",
    "from": "C5",
    "n": 8,
    "dt": 0.05,
    "scale": "major",
    "len": 0.15,
    "vol": 0.5
  },
  {
    "at": "star",
    "kind": "sparkle",
    "dur": 0.7,
    "vol": 0.4
  },
  {
    "at": "levelup",
    "kind": "run",
    "inst": "lead",
    "notes": [
      "C5",
      "E5",
      "G5",
      "C6",
      "G5",
      "C6"
    ],
    "dt": 0.09,
    "len": 0.25,
    "vol": 0.6
  },
  {
    "at": "cta",
    "kind": "ding",
    "freq": 1568,
    "dur": 0.4,
    "vol": 0.6
  },
  {
    "at": "cta+0.18",
    "kind": "ding",
    "freq": 1568,
    "dur": 0.5,
    "vol": 0.6
  },
  {
    "at": "wipeout",
    "kind": "chirp",
    "f0": 1600,
    "f1": 200,
    "dur": 0.5,
    "wave": "square",
    "vol": 0.45
  }
];
export default {
  duration: D, bpm: 120, seed: 576, sound: "music",
  music: {
  "preset": "chiptune",
  "bpm": 120,
  "gain": 1,
  "duck": 0.5,
  "layers": {
    "drums": {
      "dropSec": [
        [
          14.45,
          15
        ]
      ]
    },
    "melody": {
      "dropSec": [
        [
          13.2,
          13.75
        ],
        [
          14.45,
          15
        ]
      ]
    },
    "bass": {
      "dropSec": [
        [
          14.45,
          15
        ]
      ]
    },
    "arp": {
      "dropSec": [
        [
          13.2,
          13.75
        ],
        [
          14.45,
          15
        ]
      ]
    }
  },
  "align": "beat"
},
  cues: SPEC.flatMap(({ at, rise, ...c }) => resolveAll(at, T, D).map((t, i) => dyn({ ...c, ...(rise ? { [rise.param]: rise.from + i * rise.by } : {}), t }))),
};
