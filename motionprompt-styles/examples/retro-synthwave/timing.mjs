// Beat sheet for "retro-synthwave" scaled to 8s. Edit here: the visuals (index.html) AND the sound cues (cues.mjs) both read this file.
export const D = 8;
export const BPM = 120;   // animation tempo when the style is beat-driven, else 0
export const T = {
  "start": 0,
  "end": 8,
  "sting": 0,
  "line1": 0,
  "line2": 0.5,
  "line3": 1,
  "line4": 1.5,
  "line5": 2,
  "line6": 2.5,
  "line7": 3,
  "line8": 3.5,
  "line9": 4,
  "line10": 4.5,
  "line11": 5,
  "line12": 5.5,
  "line13": 6,
  "line14": 6.5,
  "line15": 7,
  "line16": 7.5,
  "band": 4.4,
  "bandend": 5.44
};
export const beat = (n, off = 0) => off + (n * 60) / (BPM || 120);
