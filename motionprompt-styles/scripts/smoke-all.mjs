#!/usr/bin/env node
// Regression test: scaffold every style into a temp folder (fonts, vendor libs, timing, cues, synthesised audio) and analyse each mix.
//   node smoke-all.mjs [--out <dir>] [--ratio 9:16] [--lint] [--only slug,slug]
// Prints one line per style: scaffold ok/fail, audio peak/RMS/problems. Exit 1 if anything fails.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { SKILL_DIR, listStyles, parseStyle, styleFile } from "./lib/style-parse.mjs";

const a = process.argv.slice(2), val = (n, d) => { const i = a.indexOf(`--${n}`); return i >= 0 ? a[i + 1] : d; }, flag = (n) => a.includes(`--${n}`);
const out = path.resolve(val("out", path.join(os.tmpdir(), "motionprompt-smoke"))), ratio = val("ratio", "9:16");
const only = val("only") ? val("only").split(",") : listStyles();
fs.mkdirSync(out, { recursive: true });
let bad = 0;
console.log(`smoke: ${only.length} style(s) -> ${out}  (${ratio}, sound=music${flag("lint") ? ", lint" : ""})`);
for (const slug of only) {
  const t0 = Date.now(), dir = path.join(out, slug), st = parseStyle(styleFile(slug));
  fs.rmSync(dir, { recursive: true, force: true });
  const args = [path.join(SKILL_DIR, "scripts", "scaffold.mjs"), slug, "--out", dir, "--ratio", ratio, "--sound", "music", "--text", "Sample headline|Second line", "--key", "Sample headline"];
  if (!flag("lint")) args.push("--no-lint");
  const r = spawnSync(process.execPath, args, { encoding: "utf8", shell: false });
  let line = `${slug.padEnd(22)} D=${String(st.meta.default_duration).padStart(2)}s `;
  if (r.status !== 0) { bad++; console.log(`FAIL ${line} scaffold: ${(r.stderr || r.stdout).trim().split("\n").filter(Boolean).slice(-2).join(" | ").slice(0, 200)}`); continue; }
  const lintBad = flag("lint") && /(\d+) error/.test(r.stdout) && !/0 errors/.test(r.stdout);
  const wav = path.join(dir, "assets", "audio", "mix.wav");
  const ar = spawnSync(process.execPath, [path.join(SKILL_DIR, "scripts", "audio-report.mjs"), wav, "--expect", String(st.meta.default_duration)], { encoding: "utf8" });
  const m = /peak (-?[\d.]+) dBFS\s+rms (-?[\d.]+) dBFS/.exec(ar.stdout) || [];
  const probs = (ar.stdout.match(/PROBLEMS:[\s\S]*$/) || [""])[0].replace(/\s+/g, " ").slice(0, 160);
  const ok = ar.status === 0 && !lintBad;
  if (!ok) bad++;
  console.log(`${ok ? "ok  " : "FAIL"} ${line} peak ${String(m[1] ?? "?").padStart(6)} rms ${String(m[2] ?? "?").padStart(6)}  ${((Date.now() - t0) / 1000).toFixed(1)}s ${probs}${lintBad ? " LINT" : ""}`);
}
console.log(bad ? `\n${bad} problem(s)` : "\nall styles scaffold and mix cleanly");
process.exit(bad ? 1 : 0);
