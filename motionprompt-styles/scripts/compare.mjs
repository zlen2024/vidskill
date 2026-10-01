#!/usr/bin/env node
// Compare your render with the original site's sample clip (tile.mp4) for the same style.
//   node compare.mjs <my.mp4> <slug> [--n 6] [--h 380]
// Top row = your frames, bottom row = the site's 4 s sample. Also prints mean colours of both so palette drift is visible.
// The sample lives in the LOCAL upstream copy: references/motionprompt/upstream/styles/<slug>/tile.mp4 (or $MOTIONPROMPT_UPSTREAM/styles/<slug>/tile.mp4).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { SKILL_DIR } from "./lib/style-parse.mjs";

const a = process.argv.slice(2), val = (n, d) => { const i = a.indexOf(`--${n}`); return i >= 0 ? a[i + 1] : d; };
const pos = a.filter((x, i) => !x.startsWith("--") && !a[i - 1]?.startsWith("--"));
const [mine, slug] = pos;
if (!mine || !slug) { console.error("usage: node compare.mjs <my.mp4> <slug> [--n 6] [--h 380]"); process.exit(1); }
const up = process.env.MOTIONPROMPT_UPSTREAM || path.resolve(SKILL_DIR, "..", "..", "..", "references", "motionprompt", "upstream");
const tile = path.join(up, "styles", slug, "tile.mp4");
if (!fs.existsSync(tile)) { console.error(`no sample clip at ${tile}`); process.exit(1); }
const n = parseInt(val("n", "6"), 10), H = parseInt(val("h", "380"), 10);
const dur = (f) => parseFloat(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout);
const dir = mine.replace(/\.[^.]+$/, "") + ".compare"; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
function grab(file, tag) {
  const d = dur(file), out = [];
  for (let i = 0; i < n; i++) {
    const t = d * (0.06 + (0.88 * i) / Math.max(1, n - 1)), f = path.join(dir, `${tag}${i}.png`);
    const r = spawnSync("ffmpeg", ["-y", "-v", "error", "-ss", String(t), "-i", file, "-frames:v", "1", "-vf", `scale=-2:${H}`, f]);
    if (r.status === 0) out.push(f);
  }
  return out;
}
const mean = (f) => { const r = spawnSync("ffmpeg", ["-v", "error", "-i", f, "-vf", "scale=1:1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]); return [...r.stdout.subarray(0, 3)]; };
const mf = grab(mine, "m"), uf = grab(tile, "u");
if (!mf.length || !uf.length) { console.error("could not extract frames"); process.exit(1); }
const row = (files, name) => { const out = path.join(dir, `${name}.png`); const r = spawnSync("ffmpeg", ["-y", "-v", "error", ...files.flatMap((f) => ["-i", f]), "-filter_complex", `${files.map((_, i) => `[${i}:v]`).join("")}hstack=inputs=${files.length}`, out]); return r.status === 0 ? out : null; };
const rm = row(mf, "row_mine"), ru = row(uf, "row_site");
const sheet = mine.replace(/\.[^.]+$/, "") + ".compare.png";
const width = (f) => parseInt(spawnSync("ffprobe", ["-v", "error", "-show_entries", "stream=width", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout, 10);
const W = Math.max(width(rm), width(ru));                                   // the two clips may have different aspect ratios: pad the narrower row
const r = spawnSync("ffmpeg", ["-y", "-v", "error", "-i", rm, "-i", ru, "-filter_complex", `[0:v]pad=${W}:ih:0:0:black[a];[1:v]pad=${W}:ih:0:0:black[b];[a][b]vstack=inputs=2`, sheet]);
if (r.status !== 0) { console.error("stack failed, rows saved in", dir, String(r.stderr).slice(0, 300)); process.exit(1); }
const avg = (fs_) => fs_.map(mean).reduce((s, c) => s.map((v, i) => v + c[i] / fs_.length), [0, 0, 0]).map(Math.round);
const A = avg(mf), B = avg(uf), dist = Math.round(Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]));
console.log(`compare sheet (top: yours, bottom: site sample) -> ${sheet}`);
console.log(`mean colour  yours rgb(${A}) vs site rgb(${B})  distance ${dist}/441  ${dist < 60 ? "(similar overall tone)" : "(different overall tone: check palette, background, exposure)"}`);
