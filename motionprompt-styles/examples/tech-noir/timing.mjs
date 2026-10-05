// Beat sheet for "tech-noir" scaled to 15s. Edit here: the visuals (index.html) AND the sound cues (cues.mjs) both read this file.
export const D = 15;
export const BPM = 120;   // animation tempo when the style is beat-driven, else 0
export const T = {
  "start": 0,
  "end": 15,
  "s1": 0,
  "arc1": 0.75,
  "arc2": 1.275,
  "arc3": 1.8,
  "arc4": 2.325,
  "arc5": 2.85,
  "s2": 4.2,
  "pulse1": 5.1,
  "pulse2": 5.7,
  "pulse3": 6.3,
  "pulse4": 6.9,
  "pulse5": 7.5,
  "s3": 7.8,
  "cell1": 8.4,
  "cell2": 8.7,
  "cell3": 9,
  "cell4": 9.3,
  "cell5": 9.6,
  "cell6": 9.9,
  "form": 11.1,
  "glow": 12.6,
  "dust": 13.8
};
export const beat = (n, off = 0) => off + (n * 60) / (BPM || 120);
