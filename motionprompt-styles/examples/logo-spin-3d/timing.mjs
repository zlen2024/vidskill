// Beat sheet for "logo-spin-3d" scaled to 6s. Edit here: the visuals (index.html) AND the sound cues (cues.mjs) both read this file.
export const D = 6;
export const BPM = 80;   // animation tempo when the style is beat-driven, else 0
export const T = {
  "start": 0,
  "end": 6,
  "hit": 0,
  "spin1": 0.3,
  "settle": 2.52,
  "float": 2.76,
  "glint1": 0.72,
  "glint2": 1.26,
  "glint3": 1.8,
  "spin2": 4.2,
  "riser": 5.4
};
export const beat = (n, off = 0) => off + (n * 60) / (BPM || 120);
