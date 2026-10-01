#!/usr/bin/env node
// Create a ready-to-build HyperFrames project for one MotionPrompt style.
//   node scaffold.mjs <slug> --out <dir> [--ratio 9:16|4:5|1:1|16:9] [--duration 8] [--short 1080]
//        [--text "Line one|Line two"] [--lang en|ms] [--sound off|effects|music] [--brand "bg=#10131f,accent=#ff5a4e"] [--no-lint] [--assets-only]
// Produces: index.html (placeholder build), timing.mjs (beat sheet in seconds, shared by visuals AND sound), content.mjs, cues.mjs,
//           assets/{vendor,fonts,audio}, lib/mp.js, BRIEF.md (directive checklist), package.json/hyperframes.json/meta.json.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { SKILL_DIR, parseStyle, styleFile, tokenMap, resolveBeats, resolveAt, resolveAll, fitBpm } from "./lib/style-parse.mjs";
import { videoSize } from "./prompt.mjs";
import { vendorFonts, loadSpecs } from "./fonts.mjs";
import { vendorGsap, vendorThree, ensure, pkgDir, copy } from "./vendor.mjs";

const a = process.argv.slice(2), val = (n, d) => { const i = a.indexOf(`--${n}`); return i >= 0 ? a[i + 1] : d; }, flag = (n) => a.includes(`--${n}`);
const slug = a.find((x, i) => !x.startsWith("--") && !["--out", "--ratio", "--duration", "--short", "--text", "--lang", "--sound", "--brand", "--key"].includes(a[i - 1]));
if (!slug || !val("out")) { console.error("usage: node scaffold.mjs <slug> --out <dir> [--ratio 9:16] [--duration 8] [--short 1080] [--text 'A|B'] [--key 'Slogan'] [--lang en|ms] [--sound off|effects|music] [--brand 'bg=#..,accent=#..'] [--no-lint]"); process.exit(1); }

const st = parseStyle(styleFile(slug)), out = path.resolve(val("out"));
const ratio = val("ratio", "9:16"), D = parseFloat(val("duration", st.meta.default_duration ?? 8)), short = parseInt(val("short", "1080"), 10);
const sound = val("sound", "music"), lang = val("lang", "en");
const { W, H } = videoSize({ ratio, quality: short });
const U = +(short / 1080).toFixed(4);
const SAFE = { "9:16": [220, 300, 64], "4:5": [90, 120, 64], "1:1": [72, 72, 72], "16:9": [64, 72, 96] }[ratio];
if (!SAFE) { console.error(`unsupported ratio ${ratio}`); process.exit(1); }
if (!(D > 0)) { console.error("--duration must be > 0"); process.exit(1); }
if (fs.existsSync(path.join(out, "index.html")) && !flag("force") && !flag("assets-only")) { console.error(`${out}/index.html exists. Use --force to overwrite.`); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
console.log(`scaffold ${slug}  ${W}x${H}  ${D}s  sound=${sound}  -> ${out}`);

// ---- tokens (+ brand overrides) ----
let tokens = tokenMap(st.blocks.tokens || "");
const brand = {};
for (const kv of (val("brand", "") || "").split(",").filter(Boolean)) { const [k, v] = kv.split("="); if (!/^#[0-9a-f]{3,8}$/i.test(v || "")) { console.error(`bad --brand entry "${kv}" (use name=#hex)`); process.exit(1); } brand[`--${k.trim()}`] = v.trim(); }
for (const [k, v] of Object.entries(brand)) tokens[k] = v;
const tokenCss = Object.entries(tokens).map(([k, v]) => `      ${k}: ${v};`).join("\n");

// ---- vendor libs, fonts ----
vendorGsap(out);
const lib = String(st.meta.library || "GSAP");
let headExtra = "";
if (/three/i.test(lib)) { vendorThree(out); headExtra = `  <script type="importmap">{"imports":{"three":"./assets/vendor/three.module.js"}}</script>`; }
for (const v of st.meta.vendor || []) {            // extra libs: [{"pkg":"d3-geo","version":"3.1.1","files":["dist/d3-geo.min.js"]}]
  ensure([`${v.pkg}@${v.version}`]);
  for (const f of v.files) {
    const src = path.join(pkgDir(v.pkg), f), base = path.basename(f);
    if (base.endsWith(".json")) {          // data files are wrapped as a script: no fetch() is allowed at render time
      const name = base.replace(/[.]json$/, "");
      fs.mkdirSync(path.join(out, "assets", "vendor"), { recursive: true });
      fs.writeFileSync(path.join(out, "assets", "vendor", `${name}.js`), `window.__vendorData = window.__vendorData || {}; window.__vendorData[${JSON.stringify(name)}] = ${fs.readFileSync(src, "utf8")};\n`);
    } else copy(src, path.join(out, "assets", "vendor", base));
  }
}
const fonts = st.blocks.fonts || [];
const fontCss = fonts.length ? vendorFonts(fonts, out).split("\n").filter(Boolean).map((l) => "    " + l).join("\n") : "";

// ---- --assets-only: restore vendored libs, fonts, kit and audio for an existing project (index.html/timing/cues are left untouched) ----
if (flag("assets-only")) {
  fs.mkdirSync(path.join(out, "lib"), { recursive: true });
  copy(path.join(SKILL_DIR, "templates", "base", "lib", "mp.js"), path.join(out, "lib", "mp.js"));
  if (fs.existsSync(path.join(out, "cues.mjs"))) {
    const r = execFileSync(process.execPath, [path.join(SKILL_DIR, "scripts", "synth.mjs"), "--cues", path.join(out, "cues.mjs"), "--out", path.join(out, "assets", "audio", "mix.wav"), "--sound", sound], { encoding: "utf8" });
    console.log("  " + r.trim().split("\n").pop().slice(0, 160));
  }
  console.log("assets restored (vendor, fonts, lib/mp.js, audio)"); process.exit(0);
}

// ---- timing, content ----
const beats = st.blocks.beats || { events: [] };
const bpm = fitBpm(beats.bpm || 0, D);                 // tempo snapped to whole beats: visuals + music share it exactly
const T = resolveBeats(beats, D, bpm);
fs.writeFileSync(path.join(out, "timing.mjs"),
`// Beat sheet for "${slug}" scaled to ${D}s. Edit here: the visuals (index.html) AND the sound cues (cues.mjs) both read this file.
export const D = ${D};
export const BPM = ${bpm};   // animation tempo when the style is beat-driven, else 0
export const T = ${JSON.stringify(T, null, 2)};
export const beat = (n, off = 0) => off + (n * 60) / (BPM || 120);
`);
const lines = (val("text", "") || "").split("|").map((s) => s.trim()).filter(Boolean);
fs.writeFileSync(path.join(out, "content.mjs"),
`// The user's words and brand. Keep every on-screen string here; never invent numbers or claims that are not in the request.
export const CONTENT = ${JSON.stringify({ lang, lines, key: val("key", "") || "", brand: Object.fromEntries(Object.entries(brand).map(([k, v]) => [k.slice(2), v])) }, null, 2)};
`);
fs.mkdirSync(path.join(out, "lib"), { recursive: true });
copy(path.join(SKILL_DIR, "templates", "base", "lib", "mp.js"), path.join(out, "lib", "mp.js"));

// ---- sound ----
let audioTag = "";
if (sound !== "off" && (st.blocks.cues || st.blocks.music)) {
  const music = { ...(st.blocks.music || {}) };
  if (bpm && music.syncBpm !== false) { music.bpm = bpm; music.align = "beat"; }   // music follows the animation tempo, no re-fitting
  const dropSec = (o) => { if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) { if (k === "dropAt") { o.dropSec = v.map(([x, y]) => [typeof x === "number" ? x : resolveAt(x, T, D), typeof y === "number" ? y : resolveAt(y, T, D)]); delete o.dropAt; } else dropSec(v); } };
  dropSec(music);
  fs.writeFileSync(path.join(out, "cues.mjs"),
`// Sound cue sheet: "at" is a beat id from timing.mjs (optionally "id+0.05") or a fraction of the duration. Regenerate: npm run sound
import { D, T } from "./timing.mjs";
const resolveAt = ${resolveAt.toString()};
const resolveAll = ${resolveAll.toString()};
// dynamic values: "D" = whole duration, "rest" = from this cue to the end, "until:<beat id>" = up to that beat (for beds that must span the video)
const dyn = (c) => { for (const k of Object.keys(c)) { const v = c[k]; if (v === "D") c[k] = D; else if (v === "rest") c[k] = Math.max(0.1, D - c.t); else if (typeof v === "string" && v.startsWith("until:")) c[k] = Math.max(0.1, T[v.slice(6)] - c.t); } return c; };
const SPEC = ${JSON.stringify(st.blocks.cues || [], null, 2)};
export default {
  duration: D, bpm: ${bpm || 120}, seed: ${[...slug].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 9973}, sound: ${JSON.stringify(sound)},
  music: ${JSON.stringify(music, null, 2)},
  cues: SPEC.flatMap(({ at, rise, ...c }) => resolveAll(at, T, D).map((t, i) => dyn({ ...c, ...(rise ? { [rise.param]: rise.from + i * rise.by } : {}), t }))),
};
`);
  console.log("  synth ...");
  const r = execFileSync(process.execPath, [path.join(SKILL_DIR, "scripts", "synth.mjs"), "--cues", path.join(out, "cues.mjs"), "--out", path.join(out, "assets", "audio", "mix.wav"), "--sound", sound], { encoding: "utf8" });
  console.log("  " + r.trim().split("\n").pop());
  audioTag = `    <audio id="mix" src="assets/audio/mix.wav" data-start="0" data-duration="${D}" data-track-index="9" data-volume="1"></audio>`;
}

// ---- html + project files ----
const tpl = fs.readFileSync(path.join(SKILL_DIR, "templates", "base", "index.html"), "utf8");
const html = tpl
  .replaceAll("{{LANG}}", lang).replaceAll("{{W}}", W).replaceAll("{{H}}", H).replaceAll("{{U}}", U).replaceAll("{{DURATION}}", D)
  .replaceAll("{{TITLE}}", st.meta.title || slug).replaceAll("{{SLUG}}", slug)
  .replaceAll("{{SAFE_T}}", SAFE[0]).replaceAll("{{SAFE_B}}", SAFE[1]).replaceAll("{{SAFE_X}}", SAFE[2])
  .replace("{{TOKENS}}", tokenCss).replace("{{FONT_FACE}}", fontCss).replace("{{HEAD_EXTRA}}", headExtra)
  .replace("{{AUDIO}}", audioTag).replace("{{FONT_SPECS}}", JSON.stringify(loadSpecs(fonts)));
fs.writeFileSync(path.join(out, "index.html"), html);
const CLI = "hyperframes@0.8.96";
fs.writeFileSync(path.join(out, "package.json"), JSON.stringify({ name: path.basename(out), private: true, type: "module", scripts: {
  check: `npx --yes ${CLI} check`, preview: `npx --yes ${CLI} preview`, render: `npx --yes ${CLI} render -w 1 -o renders/${slug}.mp4`,
  draft: `npx --yes ${CLI} render -q draft -w 1 -o renders/${slug}.draft.mp4`, sound: `node ${JSON.stringify(path.join(SKILL_DIR, "scripts", "synth.mjs")).slice(1, -1)} --cues cues.mjs --out assets/audio/mix.wav` } }, null, 2));
fs.writeFileSync(path.join(out, "hyperframes.json"), JSON.stringify({ $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", registry: "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry", paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));
fs.writeFileSync(path.join(out, "meta.json"), JSON.stringify({ id: `${slug}-${Date.now().toString(36)}`, name: `${st.meta.title || slug} (${ratio}, ${D}s)` }, null, 2));
const rows = [...st.body.matchAll(/^\|\s*([LTSO]\d+)\s*\|\s*(.+?)\s*\|/gm)].map((m) => `- [ ] **${m[1]}** ${m[2]}`);
fs.writeFileSync(path.join(out, "BRIEF.md"),
`# ${st.meta.title || slug}: ${ratio} ${W}x${H}, ${D}s, sound=${sound}, lang=${lang}
Style file: ${path.relative(out, styleFile(slug)).replaceAll("\\", "/")}  ·  original prompt: \`node ${path.relative(out, path.join(SKILL_DIR, "scripts", "prompt.mjs")).replaceAll("\\", "/")} ${slug} --ratio ${ratio} --duration ${D} --sound ${sound}\`
Words: ${lines.length ? lines.map((l) => `"${l}"`).join(" / ") : "(none given: ask the user, or use the style's placeholder policy)"}
Brand: ${Object.keys(brand).length ? JSON.stringify(brand) : "style defaults"}

## Directive checklist (tick each after it is visible in a rendered frame)
${rows.join("\n") || "- (no directive map found in the style file)"}

## Gates
- [ ] \`npm run check\` passes  - [ ] draft render  - [ ] frames inspected  - [ ] audio-report OK  - [ ] loop/ending verified
`);

console.log(`  T = ${JSON.stringify(T)}`);
if (!flag("no-lint")) { try { const r = execFileSync("npx", ["--yes", CLI, "lint"], { cwd: out, encoding: "utf8", shell: process.platform === "win32" }); console.log(r.replace(/\x1b\[[0-9;]*m/g, "").trim().split("\n").slice(-3).join("\n")); } catch (e) { console.log("lint reported problems:\n" + String(e.stdout || e.message).replace(/\x1b\[[0-9;]*m/g, "")); } }
console.log(`\nnext: build in ${path.join(out, "index.html")} following styles/${slug}.md, then  npm run check && npm run draft`);
