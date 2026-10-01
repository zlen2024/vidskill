#!/usr/bin/env node
// Objective audio QA for a WAV/MP4: level, clipping, silence gaps, per-second loudness, optional spectrogram PNG.
//   node audio-report.mjs mix.wav [--spec spec.png] [--expect 8]
import fs from "node:fs";
import { spawnSync } from "node:child_process";
const [file] = process.argv.slice(2).filter((a) => !a.startsWith("--")), arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : null; };
if (!file) { console.error("usage: node audio-report.mjs <file.wav|file.mp4> [--spec out.png] [--expect seconds]"); process.exit(1); }
// decode to mono 16-bit @ 44.1k with ffmpeg so any container works
const dec = spawnSync("ffmpeg", ["-v", "error", "-i", file, "-vn", "-ac", "1", "-ar", "44100", "-f", "s16le", "-"], { maxBuffer: 1 << 30 });
if (dec.status !== 0 || !dec.stdout.length) { console.error("FAIL: no decodable audio stream in " + file + "\n" + dec.stderr); process.exit(1); }
const n = dec.stdout.length / 2, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = dec.stdout.readInt16LE(i * 2) / 32768;
const sr = 44100, dur = n / sr, dB = (v) => (20 * Math.log10(v + 1e-9)).toFixed(1);
let pk = 0, sum = 0, clip = 0; for (const v of x) { const a = Math.abs(v); if (a > pk) pk = a; sum += v * v; if (a >= 0.999) clip++; }
const rms = Math.sqrt(sum / n), problems = [];
const secs = []; for (let s = 0; s < Math.ceil(dur); s++) { let e = 0, c = 0; for (let i = s * sr; i < Math.min(n, (s + 1) * sr); i++) { e += x[i] * x[i]; c++; } secs.push(Math.sqrt(e / Math.max(1, c))); }
// silence gaps > 0.6 s below -60 dB. Gaps touching the start or end are reported as notes (a hush before a loop restarts is normal); gaps in the middle are problems.
const w = Math.round(0.05 * sr); let run = 0, gaps = [], edge = [];
const flush = (endT) => { const len = run * 0.05, start = endT - len; if (len > 0.6) (start < 0.05 || endT > dur - 0.06 ? edge : gaps).push([+start.toFixed(2), +len.toFixed(2)]); run = 0; };
for (let i = 0; i + w <= n; i += w) { let e = 0; for (let k = i; k < i + w; k++) e += x[k] * x[k]; if (Math.sqrt(e / w) < 0.001) run++; else flush(i / sr); }
flush(dur);
const head = Math.sqrt(x.slice(0, 441).reduce((a, v) => a + v * v, 0) / 441), tail = Math.sqrt(x.slice(-441).reduce((a, v) => a + v * v, 0) / 441);
const dcv = x.reduce((a, v) => a + v, 0) / n;
if (pk >= 0.999 || clip > 3) problems.push(`clipping: ${clip} samples at full scale`);
if (pk < 0.1) problems.push(`very quiet (peak ${dB(pk)} dBFS)`);
if (rms < 0.01) problems.push(`very low loudness (RMS ${dB(rms)} dBFS)`);
if (Math.abs(dcv) > 0.02) problems.push(`DC offset ${dcv.toFixed(3)}`);
if (arg("expect") && Math.abs(dur - parseFloat(arg("expect"))) > 0.1) problems.push(`duration ${dur.toFixed(2)}s, expected ${arg("expect")}s`);
if (gaps.length) problems.push(`silent gaps in the middle (start,len s): ${JSON.stringify(gaps)}`);
console.log(`file ${file}\nduration ${dur.toFixed(2)}s  peak ${dB(pk)} dBFS  rms ${dB(rms)} dBFS  crest ${(20 * Math.log10(pk / (rms + 1e-9))).toFixed(1)} dB  clip ${clip}`);
console.log(`ends: start ${dB(head)} dBFS, last 10 ms ${dB(tail)} dBFS`);
console.log("per-second RMS dBFS: " + secs.map((v) => dB(v)).join(" "));
if (arg("spec")) { const r = spawnSync("ffmpeg", ["-y", "-v", "error", "-i", file, "-lavfi", "showspectrumpic=s=1400x520:legend=1:scale=log:color=intensity", arg("spec")]); console.log(r.status === 0 ? `spectrogram -> ${arg("spec")}` : "spectrogram failed: " + r.stderr); }
if (edge.length) console.log(`note: silence touching the start/end (start,len s): ${JSON.stringify(edge)} (fine when intended, e.g. music dropped for a wipe)`);
console.log(problems.length ? "PROBLEMS:\n  - " + problems.join("\n  - ") : "audio OK");
process.exit(problems.length ? 2 : 0);
