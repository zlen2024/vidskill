// Beat sheet for "pixel-art" scaled to 15s. Edit here: the visuals (index.html) AND the sound cues (cues.mjs) both read this file.
export const D = 15;
export const BPM = 120;   // animation tempo when the style is beat-driven, else 0
export const T = {
  "start": 0,
  "end": 15,
  "wipein": 0,
  "name": 0.9,
  "stat1": 1.8,
  "stat2": 2.55,
  "stat3": 3.3,
  "start1": 4.2,
  "start2": 4.65,
  "start3": 5.1,
  "select": 5.4,
  "jump1": 6.3,
  "jump2": 8.1,
  "jump3": 9.9,
  "block1": 6.75,
  "block2": 8.55,
  "block3": 10.35,
  "coin1": 11.7,
  "coin2": 12,
  "coin3": 12.3,
  "coin4": 12.6,
  "star": 12.75,
  "levelup": 13.2,
  "cta": 13.75,
  "wipeout": 14.45
};
export const beat = (n, off = 0) => off + (n * 60) / (BPM || 120);
