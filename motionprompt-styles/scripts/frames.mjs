#!/usr/bin/env node
// Look at real frames: extract frames from a rendered video and build a labelled contact sheet.
//   node frames.mjs video.mp4 --at 0.5,1.5,3          frames at those seconds
//   node frames.mjs video.mp4 --beats timing.mjs      one frame per beat id, taken 0.6 s after the beat (or --offset N)
//   node frames.mjs video.mp4 --every 1               one frame per second
// Output: <video>.frames/ (PNGs) and <video>.sheet.png. Prints the sheet path (open it with the Read tool).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const a = process.argv.slice(2), file = a.find((x) => !x.startsWith("--") && !a[a.indexOf(x) - 1]?.startsWith("--"));
const val = (n, d) => { const i = a.indexOf(`--${n}`); return i >= 0 ? a[i + 1] : d; };
if (!file) { console.error("usage: node frames.mjs <video> [--at 1,2,3 | --beats timing.mjs [--offset 0.6] | --every 1] [--cols 4] [--w 360]"); process.exit(1); }
const dur = parseFloat(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" }).stdout);
let stamps = [];   // [seconds, label]
if (val("at")) stamps = val("at").split(",").map((s) => [parseFloat(s), s + "s"]);
else if (val("beats")) {
  const { T } = await import(pathToFileURL(path.resolve(val("beats"))).href), off = parseFloat(val("offset", "0.6"));
  stamps = Object.entries(T).filter(([k]) => k !== "start" && k !== "end").map(([k, t]) => [Math.min(dur - 0.05, t + off), `${k} +${off}`]).sort((x, y) => x[0] - y[0]);
} else { const step = parseFloat(val("every", "1")); for (let t = step / 2; t < dur; t += step) stamps.push([t, t.toFixed(1) + "s"]); }
const MAX = parseInt(val("max", "24"), 10);
if (stamps.length > MAX) { const k = Math.ceil(stamps.length / MAX); stamps = stamps.filter((_, i) => i % k === 0); }   // thin out long beat lists (repeat ids)
const dir = file.replace(/\.[^.]+$/, "") + ".frames"; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const w = parseInt(val("w", "360"), 10), cols = parseInt(val("cols", "4"), 10);
const files = stamps.map(([t, label], i) => {
  const f = path.join(dir, `f${String(i).padStart(2, "0")}.png`);
  const vf = `scale=${w}:-1,drawtext=text='${label.replace(/[':]/g, "")}':x=8:y=8:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=4`;
  let r = spawnSync("ffmpeg", ["-y", "-v", "error", "-ss", String(t), "-i", file, "-frames:v", "1", "-vf", vf, f], { encoding: "utf8" });
  if (r.status !== 0) r = spawnSync("ffmpeg", ["-y", "-v", "error", "-ss", String(t), "-i", file, "-frames:v", "1", "-vf", `scale=${w}:-1`, f], { encoding: "utf8" });   // drawtext may lack a font on some builds
  return r.status === 0 ? f : null;
}).filter(Boolean);
if (!files.length) { console.error("no frames extracted"); process.exit(1); }
const rows = Math.ceil(files.length / cols), sheet = file.replace(/\.[^.]+$/, "") + ".sheet.png";
const inputs = files.flatMap((f) => ["-i", f]);
// simple grid with hstack per row then vstack
let filter = "", rowsOut = [];
for (let r = 0; r < rows; r++) {
  const idx = files.map((_, i) => i).filter((i) => Math.floor(i / cols) === r), n = idx.length;
  const pad = cols - n, ins = idx.map((i) => `[${i}:v]`).join("") + (pad ? Array.from({ length: pad }, () => `[${files.length}:v]`).join("") : "");
  filter += `${ins}hstack=inputs=${cols}[r${r}];`; rowsOut.push(`[r${r}]`);
}
const extra = files.length % cols ? ["-f", "lavfi", "-i", `color=c=black:s=${w}x${Math.round(w * 1.7778)}`] : [];   // black filler for the last row
filter += rows > 1 ? `${rowsOut.join("")}vstack=inputs=${rows}` : `${rowsOut[0]}null`;   // a single row needs no vstack
const r = spawnSync("ffmpeg", ["-y", "-v", "error", ...inputs, ...extra, "-filter_complex", filter, "-frames:v", "1", sheet], { encoding: "utf8" });
if (r.status !== 0) { console.error("sheet failed:", r.stderr.slice(0, 400)); process.exit(1); }
console.log(`${files.length} frame(s) -> ${dir}\nsheet -> ${sheet}`);
