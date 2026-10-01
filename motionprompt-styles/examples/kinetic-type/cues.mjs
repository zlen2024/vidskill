// Sound cue sheet: "at" is a beat id from timing.mjs (optionally "id+0.05") or a fraction of the duration. Regenerate: npm run sound
import { D, T } from "./timing.mjs";
const resolveAt = function resolveAt(at, T, D) {
  if (typeof at === "number") return +(at * D).toFixed(3);
  const m = /^([\w-]+)\s*([+-]\s*\d*\.?\d+)?$/.exec(String(at));
  if (!m || !(m[1] in T)) throw new Error(`cue at="${at}" does not match a beat id (known: ${Object.keys(T).join(", ")})`);
  return +(T[m[1]] + (m[2] ? parseFloat(m[2].replace(/\s/g, "")) : 0)).toFixed(3);
};
const resolveAll = function resolveAll(at, T, D) {
  if (typeof at === "string" && at.endsWith("*")) {
    const pre = at.slice(0, -1), ids = Object.keys(T).filter((k) => k.startsWith(pre) && /^\d+$/.test(k.slice(pre.length)));
    if (!ids.length) throw new Error(`cue at="${at}" matches no beat ids`);
    return ids.map((k) => T[k]).sort((a, b) => a - b);
  }
  return [resolveAt(at, T, D)];
};
import { CONTENT } from "./content.mjs";
// per-letter ticks for the spin (kind 1) and drop (kind 2) entrances; mirrors the stagger maths in index.html
const slot = T.phrase2 - T.phrase1, letterTicks = [];
CONTENT.lines.forEach((txt, i) => {
  const kind = i % 3; if (kind === 0) return;
  const n = [...txt.replace(/\s/g, "")].length, stag = Math.min(0.06, (slot - 0.45) / Math.max(1, n)) * (kind === 2 ? 0.85 : 1);
  for (let j = 0; j < n; j++) letterTicks.push({ t: +(T["phrase" + (i + 1)] + j * stag + (kind === 2 ? 0.12 : 0.05)).toFixed(3), kind: "tick", freq: 1800 + 80 * j, vol: 0.4 });
});
const SPEC = [
  {
    "at": "phrase*",
    "kind": "kick",
    "vol": 0.95
  },
  {
    "at": "phrase*",
    "kind": "rim",
    "freq": 2400,
    "dur": 0.04,
    "vol": 0.6
  },
  {
    "at": "phrase*",
    "kind": "snare",
    "dur": 0.1,
    "vol": 0.35
  },
  {
    "at": "final-1.0",
    "kind": "riser",
    "dur": 1,
    "tone": 0.25,
    "vol": 0.55
  },
  {
    "at": "final",
    "kind": "impact",
    "dur": 1.1,
    "vol": 0.95,
    "verb": 0.3
  },
  {
    "at": "final",
    "kind": "repeat",
    "everyBeat": 0.5,
    "times": 5,
    "of": {
      "kind": "swish",
      "vol": 0.45
    }
  },
  {
    "at": "wipe",
    "kind": "whoosh",
    "dir": "up",
    "dur": 0.6,
    "vol": 0.85
  }
];
export default {
  duration: D, bpm: 127.5, seed: 6166, sound: "music",
  music: {
  "preset": "minimal-techno",
  "gain": 1,
  "duck": 0.35,
  "layers": {
    "blips": false,
    "drone": false,
    "drums": {
      "rim": "",
      "hat": "--x---x---x---x-",
      "dropSec": [
        [
          6.7,
          8
        ]
      ]
    },
    "bass": {
      "voice": "bassPluck",
      "style": "offbeat",
      "oct": 2,
      "vol": 0.6,
      "dropSec": [
        [
          6.7,
          8
        ]
      ]
    }
  },
  "bpm": 127.5,
  "align": "beat"
},
  cues: [...SPEC.flatMap(({ at, ...c }) => resolveAll(at, T, D).map((t) => ({ ...c, t }))), ...letterTicks],
};
