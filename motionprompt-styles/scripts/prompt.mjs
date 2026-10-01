#!/usr/bin/env node
// Port of the MotionPrompt site logic: print a style's ORIGINAL prompt with size/length/sound filled in, or just compute the video size.
//   node prompt.mjs <slug> [--ratio 9:16] [--quality 1080] [--duration 8] [--sound off|effects|music]
//   node prompt.mjs --size --ratio 4:5 --quality 1080      -> 1080x1350
// Original prompts live outside the skill (upstream has no license): set MOTIONPROMPT_PROMPTS or keep references/motionprompt/prompts.
import fs from "node:fs";
import path from "node:path";
import { SKILL_DIR } from "./lib/style-parse.mjs";

export const FORMATS = { "9:16": "vertical 9:16", "4:5": "portrait 4:5", "1:1": "square 1:1", "16:9": "widescreen 16:9" };
export function videoSize({ ratio = "9:16", quality = 1080 } = {}) {
  const [w, h] = ratio.split(":").map(Number), short = quality, long = Math.round((short * Math.max(w, h)) / Math.min(w, h) / 2) * 2;
  const [W, H] = w >= h ? [long, short] : [short, long];
  return { W, H, text: `${W} x ${H} pixels (${FORMATS[ratio] ?? ratio})` };
}
export const hasSound = (t) => /^Sound\n- Effects:/m.test(t);
export function fillPrompt(t, { ratio = "9:16", quality = 1080, duration = 8, sound = "off" } = {}) {
  t = t.replaceAll("\r\n", "\n");   // saved prompt files may have CRLF endings; the site logic assumes LF
  if (hasSound(t)) t = sound === "off" ? t.replace(/^Sound\n(?:- .*\n?)+\n*/m, "") : sound === "effects" ? t.replace(/^- Music:.*\n/m, "") : t;
  return t.replace("{size}", videoSize({ ratio, quality }).text).replace("{duration}", `${duration} seconds`);
}
export function promptsDir() {
  const cands = [process.env.MOTIONPROMPT_PROMPTS, path.resolve(SKILL_DIR, "..", "..", "..", "references", "motionprompt", "prompts"), path.resolve(process.cwd(), "references", "motionprompt", "prompts")].filter(Boolean);
  return cands.find((d) => fs.existsSync(d));
}
if (process.argv[1]?.endsWith("prompt.mjs")) {
  const a = process.argv.slice(2), val = (n, d) => { const i = a.indexOf(`--${n}`); return i >= 0 ? a[i + 1] : d; };
  const opt = { ratio: val("ratio", "9:16"), quality: +val("quality", 1080), duration: +val("duration", 8), sound: val("sound", "off") };
  if (a.includes("--size")) { const s = videoSize(opt); console.log(`${s.W}x${s.H}`); process.exit(0); }
  const flagVals = new Set(["--ratio", "--quality", "--duration", "--sound"]);
  const slug = a.find((x, i) => !x.startsWith("--") && !flagVals.has(a[i - 1]));
  const dir = promptsDir();
  if (!dir) { console.error("original prompts not found. Set MOTIONPROMPT_PROMPTS=<dir with <slug>.txt>"); process.exit(1); }
  const f = path.join(dir, `${slug}.txt`);
  if (!fs.existsSync(f)) { console.error(`no prompt for "${slug}" in ${dir}`); process.exit(1); }
  process.stdout.write(fillPrompt(fs.readFileSync(f, "utf8").trim() + "\n", opt));
}
