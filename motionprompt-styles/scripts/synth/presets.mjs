// Music presets. Patterns are per-bar step strings (16 steps for 4/4, 12 for 3/4 and 12/8): x hit, X accent, o ghost, - rest.
// Override anything from a cue sheet: {"preset":"lofi","bpm":90,"key":"D","layers":{"vinyl":false,"chords":{"voice":"piano"}}}
const dr = (id, o) => ({ id, type: "drums", vol: 0.7, ...o });
const bass = (id, o) => ({ id, type: "bass", vol: 0.8, oct: 2, ...o });
const chords = (id, o) => ({ id, type: "chords", vol: 0.55, oct: 4, ...o });
const arp = (id, o) => ({ id, type: "arp", vol: 0.45, oct: 5, ...o });
const mel = (id, o) => ({ id, type: "melody", vol: 0.5, oct: 5, ...o });
const perc = (id, lanes, o = {}) => ({ id, type: "perc", vol: 0.7, lanes, ...o });
const bed = (id, kind, params, vol = 0.25) => ({ id, type: "bed", kind, params, vol });

export const PRESETS = {
  "corporate-bright": { bpm: 120, key: "C", scale: "major", prog: [1, 5, 6, 4], layers: [
    dr("drums", { kick: "x---x---x---x---", clap: "----x-------x---", shaker: "xoxoxoxoxoxoxoxo", lanes: { shaker: 0.5 } }),
    bass("bass", { voice: "bassPluck", style: "pulse" }),
    chords("chords", { voice: "ep", rhythm: "stab:x--x--x---x-----", verb: 0.15 }),
    arp("arp", { voice: "marimba", rate: "8th", pattern: "up", verb: 0.2 }),
    chords("pad", { voice: "pad", oct: 3, vol: 0.3, verb: 0.3 }),
  ] },
  "corporate-calm": { bpm: 100, key: "G", scale: "major", prog: [1, 5, 6, 4], layers: [
    dr("drums", { kick: "x-------x-------", snap: "----x-------x---", shaker: "-o-o-o-o-o-o-o-o", lanes: { shaker: 0.4 }, vol: 0.55 }),
    bass("bass", { voice: "bassPluck", style: "root", vol: 0.7 }),
    chords("chords", { voice: "ep", rhythm: "half", verb: 0.2 }),
    arp("arp", { voice: "pluck", rate: "8th", pattern: "updown", vol: 0.35, verb: 0.25 }),
    chords("pad", { voice: "strings", oct: 3, vol: 0.3, verb: 0.35 }),
  ] },
  lofi: { bpm: 84, key: "F", scale: "major", prog: [2, 5, 1, 6], swing: 0.2, human: 0.012, layers: [
    dr("drums", { kick: "x-----x---x-----", rim: "----x-------x---", hat: "x-x-x-x-x-x-x-x-", lanes: { hat: 0.35, rim: 0.7 }, vol: 0.6 }),
    bass("bass", { voice: "sub", style: "root", vol: 0.75, noteLen: 3 }),
    chords("chords", { voice: "ep", rhythm: "half", size: 4, verb: 0.25 }),
    mel("melody", { voice: "ep", sparse: 0.45, oct: 5, vol: 0.3, verb: 0.3, lo: 0, hi: 8 }),
    bed("vinyl", "crackle", { density: 14, lo: 1500, hi: 6000 }, 0.22),
  ] },
  "jazz-slow": { bpm: 100, key: "F", scale: "major", prog: [2, 5, 1, 6], swing: 0.3, human: 0.014, layers: [
    dr("drums", { openhat: "x---x-xx-x---x-x", shaker: "o-o-o-o-o-o-o-o-", kick: "x-------o-------", lanes: { openhat: 0.28, shaker: 0.3, kick: 0.5 }, vol: 0.55 }),
    bass("bass", { voice: "bassPluck", style: "walk", vol: 0.85 }),
    chords("chords", { voice: "ep", rhythm: "stab:x-----x---x-----", size: 4, verb: 0.2 }),
  ] },
  synthwave: { bpm: 120, key: "A", scale: "minor", prog: [1, 6, 3, 7], layers: [
    dr("drums", { kick: "x---x---x---x---", snare: "----x-------x---", hat: "--x---x---x---x-", openhat: "--o---o---o---o-", lanes: { hat: 0.45, openhat: 0.5, snare: 1 }, vol: 0.75 }),
    bass("bass", { voice: "bassSaw", style: "octave", vol: 0.7 }),
    chords("pad", { voice: "pad", oct: 3, vol: 0.42, verb: 0.35 }),
    arp("lead", { voice: "lead", rate: "16th", pattern: "wide", vol: 0.3, verb: 0.45, len: 0.8, rest: 0.15 }),
  ] },
  "minimal-techno": { bpm: 120, key: "A", scale: "minor", prog: [1, 1, 6, 7], layers: [
    dr("drums", { kick: "x---x---x---x---", hat: "--x---x---x---x-", rim: "----x-------x---", lanes: { hat: 0.5, rim: 0.6 }, vol: 0.7 }),
    bass("bass", { voice: "bassPulse", style: "sixteenth", vol: 0.5, oct: 1 }),
    arp("blips", { voice: "pulse", rate: "8th", pattern: "random", vol: 0.22, rest: 0.55, verb: 0.55 }),
    { id: "drone", type: "drone", oct: 1, vol: 0.35 },
  ] },
  "dark-ambient": { bpm: 120, key: "A", scale: "minor", prog: [1, 1, 6, 5], layers: [
    bass("pulse", { voice: "sub", style: "root", vol: 0.85, oct: 1, noteLen: 2 }),
    dr("clicks", { rim: "----o-----o-----", hat: "-------o--------", lanes: { rim: 0.5, hat: 0.4 }, vol: 0.4 }),
    chords("pad", { voice: "pad", oct: 3, vol: 0.3, cutoff: 900, verb: 0.5 }),
    { id: "drone", type: "drone", oct: 1, vol: 0.3 },
  ] },
  "ambient-dreamy": { bpm: 60, key: "D", scale: "major", prog: [1, 4, 6, 5], chordBars: 2, verb: 1.4, layers: [
    chords("pad", { voice: "strings", oct: 3, vol: 0.6, verb: 0.5 }),
    { id: "drone", type: "drone", oct: 1, vol: 0.4 },
    arp("glass", { voice: "bell", rate: "quarter", pattern: "random", rest: 0.6, vol: 0.28, verb: 0.9 }),
  ] },
  chiptune: { bpm: 120, key: "C", scale: "major", prog: [1, 6, 4, 5], layers: [
    dr("drums", { kick: "x---x---x---x---", snare: "----x-------x---", hat: "x-x-x-x-x-x-x-x-", lanes: { hat: 0.4 }, vol: 0.6 }),
    bass("bass", { voice: "bassPulse", style: "pulse", vol: 0.7 }),
    mel("melody", { voice: "pulse", sparse: 0.1, vol: 0.4, lo: 0, hi: 11, hold: 0.85 }),
    arp("arp", { voice: "square", rate: "16th", pattern: "up", vol: 0.16, rest: 0.35 }),
  ] },
  "cinematic-orch": { bpm: 114, key: "A", scale: "minor", prog: [1, 1, 6, 7], layers: [
    perc("timpani", [{ pat: "x---x---x-x-x---", voice: "timpani", note: "A2", dur: 0.7 }], { vol: 0.8, verb: 0.4 }),
    bass("lowstrings", { voice: "bassSaw", style: "pulse", oct: 2, vol: 0.32 }),
    chords("brass", { voice: "brass", rhythm: "stab:x-------x-------", oct: 3, vol: 0.55, verb: 0.4 }),
    chords("strings", { voice: "strings", oct: 3, vol: 0.4, verb: 0.5 }),
    dr("finale", { cymbal: "x---------------", bars: [-1, 999], vol: 0.6 }),
  ] },
  "cinematic-travel": { bpm: 80, key: "G", scale: "major", prog: [1, 5, 6, 4], layers: [
    arp("piano", { voice: "piano", rate: "8th", pattern: "updown", oct: 4, vol: 0.5, verb: 0.35 }),
    chords("strings", { voice: "strings", oct: 3, vol: 0.45, verb: 0.45 }),
    bass("cello", { voice: "strings", style: "whole", oct: 2, vol: 0.5 }),
    dr("drums", { kick: "x-------x-------", shaker: "-o-o-o-o-o-o-o-o", lanes: { shaker: 0.35, kick: 0.6 }, vol: 0.5 }),
  ] },
  "promo-energy": { bpm: 150, key: "E", scale: "minor", prog: [1, 1, 6, 7], layers: [
    dr("build", { hat: "xxxxxxxxxxxxxxxx", clap: "x-x-x-x-xxxxxxxx", bars: [0, 1], vol: 0.7, lanes: { hat: 0.5 } }),
    bass("buildbass", { voice: "sub", style: "pulse", bars: [0, 1], vol: 0.6 }),
    dr("kick", { kick: "x---x---x---x---", clap: "----x-------x---", hat: "--x---x---x---x-", bars: [1, 999], vol: 0.85, lanes: { hat: 0.55 } }),
    bass("bass", { voice: "bassSaw", style: "offbeat", bars: [1, 999], vol: 0.75 }),
    chords("stabs", { voice: "organ", rhythm: "stab:x--x----x--x----", stabLen: 1, oct: 3, bars: [1, 999], vol: 0.45, verb: 0.2 }),
  ] },
  "pop-modern": { bpm: 120, key: "C", scale: "major", prog: [1, 5, 6, 4], layers: [
    dr("drums", { kick: "x---x---x---x---", clap: "----x-------x---", openhat: "--o---o---o---o-", hat: "xoxoxoxoxoxoxoxo", lanes: { hat: 0.3, openhat: 0.45 }, vol: 0.75 }),
    bass("bass", { voice: "bassPluck", style: "pulse", vol: 0.8 }),
    arp("arp", { voice: "pluck", rate: "8th", pattern: "wide", vol: 0.5, verb: 0.3 }),
    chords("pad", { voice: "pad", oct: 3, vol: 0.4, verb: 0.3 }),
  ] },
  waltz: { bpm: 90, key: "C", scale: "major", prog: [1, 4, 5, 1], meter: "3/4", layers: [
    bass("oom", { voice: "bassPluck", pattern: "x-----------", noteLen: 3, vol: 0.85 }),
    chords("pah", { voice: "piano", rhythm: "stab:----x---x---", stabLen: 3, oct: 4, vol: 0.55, verb: 0.3 }),
    mel("melody", { voice: "piano", sparse: 0.2, vol: 0.5, verb: 0.3, lo: 0, hi: 9 }),
    bed("vinyl", "crackle", { density: 10, lo: 1200, hi: 5000 }, 0.18),
  ] },
  "waltz-romantic": { bpm: 90, key: "D", scale: "major", prog: [1, 6, 4, 5], meter: "3/4", verb: 1.2, layers: [
    arp("harp", { voice: "harp", rate: "8th", pattern: "updown", oct: 4, vol: 0.55, verb: 0.4 }),
    chords("strings", { voice: "strings", oct: 3, vol: 0.45, verb: 0.5 }),
    bass("low", { voice: "sub", pattern: "x-----------", noteLen: 6, vol: 0.6 }),
  ] },
  march: { bpm: 120, key: "C", scale: "major", prog: [1, 2, 3, 4], layers: [
    dr("drums", { snare: "x-xxx-x-x-xxx-x-", kick: "x-------x-------", lanes: { snare: 0.7 }, vol: 0.75 }),
    chords("brass", { voice: "brass", rhythm: "beat", oct: 3, vol: 0.5, verb: 0.3 }),
    bass("tuba", { voice: "tuba", style: "oompah", oct: 2, vol: 0.8 }),
  ] },
  cartoon: { bpm: 100, key: "C", scale: "major", prog: [1, 4, 5, 1], layers: [
    bass("tuba", { voice: "tuba", style: "oompah", oct: 2, vol: 0.85 }),
    dr("drums", { kick: "x-------x-------", snare: "----x-------x---", woodblock: "x-x-x-x-x-x-x-x-", lanes: { woodblock: 0.4 }, vol: 0.6 }),
    chords("organ", { voice: "organ", rhythm: "stab:--x---x---x---x-", stabLen: 2, oct: 4, vol: 0.4 }),
    chords("horns", { voice: "brass", rhythm: "stab:x-----------x---", stabLen: 2, oct: 4, vol: 0.5, verb: 0.2 }),
  ] },
  "kids-toy": { bpm: 110, key: "C", scale: "major", prog: [1, 5, 6, 4], layers: [
    mel("melody", { voice: "glock", sparse: 0.1, vol: 0.55, verb: 0.35, lo: 0, hi: 10 }),
    chords("strum", { voice: "strum", rhythm: "half", oct: 3, vol: 0.5 }),
    dr("claps", { clap: "----x-------x---", lanes: { clap: 0.5 }, vol: 0.5 }),
    bass("bass", { voice: "bassPluck", style: "root", vol: 0.7 }),
  ] },
  "ukulele-folk": { bpm: 90, key: "C", scale: "major", prog: [1, 5, 6, 4], layers: [
    chords("strum", { voice: "strum", rhythm: "stab:x---x-x-x---x-x-", stabLen: 3, oct: 3, vol: 0.55 }),
    bass("bass", { voice: "bassPluck", style: "root", vol: 0.7 }),
    dr("drums", { kick: "x-------x-------", clap: "----x-------x---", shaker: "-o-o-o-o-o-o-o-o", lanes: { shaker: 0.35, clap: 0.6, kick: 0.6 }, vol: 0.6 }),
    mel("melody", { voice: "glock", sparse: 0.55, vol: 0.28, verb: 0.3 }),
  ] },
  "stop-motion": { bpm: 96, key: "C", scale: "major", prog: [1, 4, 5, 1], layers: [
    mel("melody", { voice: "xylo", sparse: 0.15, vol: 0.55, lo: 0, hi: 10, hold: 0.7 }),
    bass("bass", { voice: "bassPluck", style: "oompah", vol: 0.7 }),
    chords("pizz", { voice: "pluck", rhythm: "beat", oct: 3, vol: 0.4 }),
    dr("ticks", { woodblock: "--x---x---x---x-", clap: "----x-------x---", lanes: { woodblock: 0.5, clap: 0.35 }, vol: 0.5 }),
  ] },
  "pentatonic-heritage": { bpm: 72, key: "C", scale: "pentatonic", prog: [1, 1, 4, 1], layers: [
    { id: "drone", type: "drone", oct: 2, vol: 0.4 },
    { id: "flute", type: "melody", voice: "flute", oct: 5, vol: 0.5, verb: 0.4, phrases: [
      [[0, 4, 4], [4, 2, 2], [6, 3, 2], [8, 2, 4], [12, 0, 4]],
      [[0, 1, 4], [4, 2, 4], [8, 4, 6], [14, 3, 2]],
      [[0, 3, 4], [4, 2, 2], [6, 1, 2], [8, 0, 8]],
      [[0, 2, 4], [4, 3, 4], [8, 2, 4], [12, 0, 4]]] },
    { id: "pluck", type: "melody", voice: "gambus", oct: 4, vol: 0.4, verb: 0.3, sparse: 0.25, lo: 0, hi: 8 },
    perc("gendang", [{ pat: "x-------x---x---", voice: "drum", note: "D2", dur: 0.22 }, { pat: "----x-------x-x-", voice: "drum", note: "A3", dur: 0.12, vol: 0.6 }], { vol: 0.6 }),
  ] },
  "east-asian-zither": { bpm: 80, key: "D", scale: "pentatonic", prog: [1, 4, 2, 1], verb: 1.2, layers: [
    arp("zither", { voice: "zither", rate: "8th", pattern: "updown", oct: 4, rest: 0.25, vol: 0.55, verb: 0.45 }),
    mel("flute", { voice: "flute", sparse: 0.35, oct: 5, vol: 0.4, verb: 0.5, lo: 0, hi: 7 }),
    { id: "drone", type: "drone", oct: 1, vol: 0.3 },
  ] },
  "festive-pentatonic": { bpm: 120, key: "D", scale: "pentatonic", prog: [1, 1, 4, 5], layers: [
    arp("zither", { voice: "zither", rate: "8th", pattern: "wide", oct: 4, vol: 0.55, verb: 0.3 }),
    bass("bass", { voice: "bassPluck", style: "root", oct: 2, vol: 0.7 }),
    perc("drums", [{ pat: "x-------x---x---", voice: "timpani", note: "D2", dur: 0.4 }, { pat: "--x---x---x---x-", voice: "woodblock", note: "C4", dur: 0.08, vol: 0.5 }], { vol: 0.65 }),
    dr("cymbals", { cymbal: "x-------x-------", lanes: { cymbal: 0.25 }, vol: 0.5 }),
  ] },
  "kompang-raya": { bpm: 80, key: "G", scale: "major", prog: [1, 4, 5, 1], layers: [
    perc("kompang", [{ pat: "x---x-x-x---x-x-", voice: "drum", note: "G3", dur: 0.16 }, { pat: "--o---o---o---o-", voice: "drum", note: "D4", dur: 0.08, vol: 0.5 }], { vol: 0.7 }),
    mel("melody", { voice: "gambus", oct: 4, vol: 0.5, verb: 0.3, sparse: 0.15 }),
    chords("accordion", { voice: "accordion", rhythm: "half", oct: 3, vol: 0.4, verb: 0.3 }),
    bass("bass", { voice: "bassPluck", style: "root", vol: 0.7 }),
  ] },
  joget: { bpm: 100, key: "D", scale: "major", prog: [1, 4, 5, 1], meter: "12/8", layers: [
    bass("bass", { voice: "bassPluck", pattern: "x--x--x--x--", noteLen: 2, vol: 0.7 }),
    perc("frame", [{ pat: "x--x-xx--x-x", voice: "drum", note: "E3", dur: 0.14 }, { pat: "--x--x--x--x", voice: "drum", note: "B3", dur: 0.08, vol: 0.45 }], { vol: 0.6 }),
    dr("shaker", { shaker: "x-xx-xx-xx-x", lanes: { shaker: 0.4 }, vol: 0.5 }),
    mel("gambus", { voice: "gambus", oct: 4, vol: 0.55, verb: 0.3, sparse: 0.1 }),
  ] },
  "indian-drone": { bpm: 80, key: "D", scale: "pentatonic", prog: [1, 1, 1, 1], verb: 1.1, layers: [
    { id: "tanpura", type: "melody", voice: "pluck", oct: 2, vol: 0.5, verb: 0.4, phrases: [[[0, 3, 6], [4, 5, 6], [8, 5, 6], [12, 0, 6]]] },
    perc("tabla", [{ pat: "x---x---x-x-----", voice: "drum", note: "D2", dur: 0.3 }, { pat: "x-xx-x-x-xx-x-x-", voice: "drum", note: "D4", dur: 0.1, vol: 0.55 }], { vol: 0.6 }),
    mel("bansuri", { voice: "flute", oct: 5, vol: 0.5, sparse: 0.25, verb: 0.5, lo: 0, hi: 7 }),
  ] },
  "city-pop": { bpm: 120, key: "F", scale: "major", prog: [2, 5, 1, 6], swing: 0.08, layers: [
    dr("drums", { kick: "x-----x---x-----", snare: "----x-------x---", hat: "x-x-x-x-x-x-x-x-", shaker: "-o-o-o-o-o-o-o-o", lanes: { hat: 0.35, shaker: 0.3 }, vol: 0.6 }),
    bass("bass", { voice: "bassPluck", style: "pulse", vol: 0.85 }),
    chords("chords", { voice: "ep", rhythm: "stab:x--x--x---x--x--", size: 4, verb: 0.25 }),
    mel("melody", { voice: "ep", sparse: 0.3, vol: 0.3, verb: 0.3 }),
  ] },
  "podcast-intro": { bpm: 80, key: "C", scale: "major", prog: [1, 6, 4, 5], layers: [
    chords("chords", { voice: "ep", rhythm: "stab:x-----x---x-----", size: 4, verb: 0.2 }),
    bass("bass", { voice: "bassPluck", style: "root", vol: 0.75 }),
    mel("bells", { voice: "bell", sparse: 0.5, vol: 0.28, verb: 0.5 }),
    dr("drums", { rim: "----x-------x---", shaker: "-o-o-o-o-o-o-o-o", kick: "x-------x-------", lanes: { rim: 0.55, shaker: 0.3, kick: 0.55 }, vol: 0.55 }),
  ] },
  "luxury-minimal": { bpm: 80, key: "D", scale: "major", prog: [1, 5, 6, 4], chordBars: 2, verb: 1.3, layers: [
    chords("pad", { voice: "strings", oct: 3, vol: 0.5, verb: 0.5 }),
    mel("piano", { voice: "piano", sparse: 0.55, oct: 5, vol: 0.4, verb: 0.6 }),
    bass("pulse", { voice: "sub", style: "whole", oct: 2, vol: 0.5 }),
    dr("shaker", { shaker: "--x---x---x---x-", lanes: { shaker: 0.3 }, vol: 0.4 }),
  ] },
  "epic-intro": { bpm: 80, key: "D", scale: "minor", prog: [1, 6, 3, 7], layers: [
    perc("hit", [{ pat: "x---------------", voice: "timpani", note: "D2", dur: 0.9 }], { bars: [0, 1], vol: 0.9, verb: 0.5 }),
    chords("brass", { voice: "brass", rhythm: "whole", oct: 3, vol: 0.5, verb: 0.4 }),
    bass("pulse", { voice: "bassSaw", style: "pulse", oct: 2, vol: 0.28 }),
    dr("end", { cymbal: "x---------------", bars: [-1, 999], vol: 0.6 }),
  ] },
  "y2k-pop": { bpm: 96, key: "C", scale: "major", prog: [1, 5, 6, 4], swing: 0.14, layers: [
    chords("chords", { voice: "pad", oct: 4, vol: 0.45, verb: 0.35 }),
    arp("arp", { voice: "pluck", rate: "8th", pattern: "wide", vol: 0.5, verb: 0.4 }),
    bass("bass", { voice: "bassPluck", style: "pulse", vol: 0.75 }),
    dr("drums", { kick: "x-----x---x-----", snare: "----x-------x---", hat: "x-x-x-x-x-x-x-x-", lanes: { hat: 0.35 }, vol: 0.6 }),
  ] },
  "lofi-house": { bpm: 120, key: "A", scale: "minor", prog: [1, 4, 5, 1], layers: [
    dr("drums", { kick: "x---x---x---x---", snap: "----x-------x---", hat: "--x---x---x---x-", lanes: { hat: 0.5, snap: 0.8 }, vol: 0.7 }),
    chords("chords", { voice: "ep", rhythm: "stab:x--x--x---x-----", size: 4, verb: 0.2 }),
    bass("bass", { voice: "bassPluck", style: "pulse", vol: 0.8 }),
  ] },
  "guitar-morning": { bpm: 80, key: "G", scale: "major", prog: [1, 6, 4, 5], layers: [
    arp("guitar", { voice: "guitar", rate: "8th", pattern: "updown", oct: 3, vol: 0.55, verb: 0.25 }),
    mel("radio", { voice: "ep", sparse: 0.4, vol: 0.32, verb: 0.3 }),
    dr("brushes", { shaker: "x-x-x-x-x-x-x-x-", kick: "x-------x-------", lanes: { shaker: 0.3, kick: 0.4 }, vol: 0.45 }),
  ] },
  "waltz-nostalgic": { bpm: 84, key: "G", scale: "major", prog: [1, 6, 4, 5], meter: "3/4", verb: 1.1, layers: [
    arp("guitar", { voice: "guitar", rate: "8th", pattern: "updown", oct: 3, vol: 0.55, verb: 0.3 }),
    mel("piano", { voice: "piano", sparse: 0.35, vol: 0.4, verb: 0.4 }),
    chords("pad", { voice: "strings", oct: 3, vol: 0.3, verb: 0.4 }),
  ] },
};
