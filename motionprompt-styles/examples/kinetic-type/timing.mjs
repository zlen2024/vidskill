// Beat sheet for "kinetic-type" scaled to 8s. Edit here: the visuals (index.html) AND the sound cues (cues.mjs) both read this file.
export const D = 8;
export const BPM = 127.5;   // animation tempo when the style is beat-driven, else 0
export const T = {
  "start": 0,
  "end": 8,
  "phrase1": 0,
  "phrase2": 0.941,
  "phrase3": 1.882,
  "phrase4": 2.824,
  "phrase5": 3.765,
  "final": 4.8,
  "wipe": 6.7
};
export const beat = (n, off = 0) => off + (n * 60) / (BPM || 120);
