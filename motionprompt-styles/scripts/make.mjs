#!/usr/bin/env node
// One command from a style request to an MP4: scaffold -> build (from a finished example when one exists) -> check -> render -> verify.
//   node make.mjs <slug> --out <dir> [scaffold options: --ratio --duration --short --text --key --lang --sound --brand --repeat]
//        [--final] [--no-check] [--strict] [--no-sheet] [--allow-placeholder] [--no-example]
//   node make.mjs --project <dir> [--final] ...      re-run sound + check + render + verify on a project you built by hand
// Draft render by default (fast, for review); --final renders full quality. Prints the MP4 path, its streams and a frame sheet.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { SKILL_DIR } from "./lib/style-parse.mjs";

const CLI = "hyperframes@0.8.96";
const a = process.argv.slice(2), val = (n, d) => { const i = a.indexOf(`--${n}`); return i >= 0 ? a[i + 1] : d; }, flag = (n) => a.includes(`--${n}`);
const VALUED = ["--out", "--ratio", "--duration", "--short", "--text", "--lang", "--sound", "--brand", "--key", "--repeat", "--project"];
const slugArg = a.find((x, i) => !x.startsWith("--") && !VALUED.includes(a[i - 1]));
const rel = (p) => { const r = path.relative(process.cwd(), p) || "."; return r.startsWith("..") ? p : r; };
const die = (m) => { console.error(`\nmake: ${m}`); process.exit(1); };
const step = (m) => console.log(`\n== ${m}`);
const run = (cmd, args, opt = {}) => spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32", ...opt });
const node = (script, args, opt) => run(process.execPath, [path.join(SKILL_DIR, "scripts", script), ...args], opt);

if (!slugArg && !val("project")) {
  console.error(`usage: node make.mjs <slug> --out <dir> [--ratio 9:16] [--duration 8] [--text 'A|B'] [--key 'Slogan'] [--sound music] [--brand 'bg=#..'] [--repeat phrase=auto] [--final]
       node make.mjs --project <dir> [--final]
styles with a ready-made build: ${examples().join(", ") || "(none)"}`);
  process.exit(1);
}
function examples() {
  const d = path.join(SKILL_DIR, "examples");
  return fs.existsSync(d) ? fs.readdirSync(d).filter((s) => fs.existsSync(path.join(d, s, "index.html"))) : [];
}

const out = path.resolve(val("project") || val("out") || die("--out <dir> is required"));
let slug = slugArg;

if (!val("project")) {
  // ---- 1. scaffold (fresh timing, content, cues, vendored assets, audio) ----
  step(`scaffold ${slug}`);
  const pass = a.filter((x, i) => !["--final", "--no-check", "--strict", "--no-sheet", "--allow-placeholder", "--no-example"].includes(x) && x !== slug);
  if (node("scaffold.mjs", [slug, ...pass, "--force", "--no-lint"]).status !== 0) die("scaffold failed");

  // ---- 2. build: graft the finished example composition onto the scaffolded page (keeps this run's size, fonts, tokens, audio) ----
  const ex = path.join(SKILL_DIR, "examples", slug, "index.html");
  if (fs.existsSync(ex) && !flag("no-example")) {
    step(`build from examples/${slug}`);
    fs.writeFileSync(path.join(out, "index.html"), graft(fs.readFileSync(path.join(out, "index.html"), "utf8"), fs.readFileSync(ex, "utf8"), slug));
    console.log("  index.html built from the example (text, colours and timing come from content.mjs / timing.mjs)");
  } else if (!flag("allow-placeholder")) {
    console.log(`
make: "${slug}" has no ready-made build, so index.html is still the placeholder card.
  Build it by following the style file (path in ${path.join(out, "BRIEF.md")}), then finish with:
    node ${rel(path.join(SKILL_DIR, "scripts", "make.mjs"))} --project ${rel(out)}${flag("final") ? " --final" : ""}
  (or pass --allow-placeholder to render the placeholder anyway). Ready-made builds: ${examples().join(", ")}`);
    process.exit(0);
  }
} else {
  // ---- --project: refresh the sound from cues.mjs, the visuals stay as built ----
  if (!fs.existsSync(path.join(out, "index.html"))) die(`${out}/index.html not found`);
  slug = slug || (/renders\/([\w-]+)\.mp4/.exec(fs.readFileSync(path.join(out, "package.json"), "utf8")) || [])[1] || path.basename(out);
  if (fs.existsSync(path.join(out, "cues.mjs"))) {
    step("sound");
    const sound = val("sound") || (/sound:\s*"(\w+)"/.exec(fs.readFileSync(path.join(out, "cues.mjs"), "utf8")) || [])[1] || "music";
    if (node("synth.mjs", ["--cues", "cues.mjs", "--out", "assets/audio/mix.wav", "--sound", sound], { cwd: out }).status !== 0) die("synth failed");
  }
}

// ---- 3. check (lint + runtime + layout + contrast) ----
if (!flag("no-check")) {
  step("check");
  const r = run("npx", ["--yes", CLI, "check"], { cwd: out });
  if (r.status !== 0) { if (flag("strict")) die("check failed (--strict)"); console.log("  check reported problems (continuing; use --strict to stop here)"); }
}

// ---- 4. render ----
const final = flag("final"), mp4 = path.join(out, "renders", `${slug}${final ? "" : ".draft"}.mp4`);
step(`render ${final ? "final" : "draft"} -> ${rel(mp4)}`);
fs.mkdirSync(path.dirname(mp4), { recursive: true });
const t0 = Date.now();
if (run("npx", ["--yes", CLI, "render", ...(final ? [] : ["-q", "draft"]), "-w", "1", "-o", path.relative(out, mp4)], { cwd: out }).status !== 0 || !fs.existsSync(mp4)) die("render failed");
console.log(`  rendered in ${((Date.now() - t0) / 1000).toFixed(1)} s`);

// ---- 5. verify: streams, duration, frame sheet ----
step("verify");
const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height:format=duration", "-of", "json", mp4], { encoding: "utf8" });
let info = null;
try { info = JSON.parse(probe.stdout); } catch { console.log("  ffprobe not available: skipped stream check"); }
const problems = [];
if (info) {
  const v = info.streams.find((s) => s.codec_type === "video"), au = info.streams.find((s) => s.codec_type === "audio"), dur = +info.format.duration;
  const want = +(/data-duration="([\d.]+)"/.exec(fs.readFileSync(path.join(out, "index.html"), "utf8")) || [])[1];
  console.log(`  video ${v?.codec_name} ${v?.width}x${v?.height}  audio ${au ? au.codec_name : "none"}  ${dur.toFixed(2)} s  ${(fs.statSync(mp4).size / 1e6).toFixed(2)} MB`);
  if (!v) problems.push("no video stream");
  if (want && Math.abs(dur - want) > 0.25) problems.push(`duration ${dur.toFixed(2)} s, expected ${want} s`);
  if (!au && fs.existsSync(path.join(out, "assets", "audio", "mix.wav")) && /<audio[^>]*id=/.test(fs.readFileSync(path.join(out, "index.html"), "utf8"))) problems.push("no audio stream although the page has <audio id=...>");
}
if (!flag("no-sheet") && fs.existsSync(path.join(out, "timing.mjs"))) node("frames.mjs", [mp4, "--beats", path.join(out, "timing.mjs")], { cwd: out });
if (problems.length) die(problems.join("; "));
console.log(`\ndone: ${mp4}${final ? "" : "\n(draft quality: look at the frame sheet, then re-run with --final for delivery)"}`);

// Put the example's style CSS and composition script into the freshly scaffolded page.
// The scaffolded page already carries this run's size, --u, safe areas, tokens (+ brand), fonts, import map and <audio>.
function graft(page, example, slug) {
  const css = new RegExp(String.raw`\/\* ---- ${slug} ---- \*\/[\s\S]*?(?=\n\s*<\/style>)`).exec(example);
  const script = /<script type="module">[\s\S]*?<\/script>/.exec(example);
  if (!script) die(`examples/${slug}/index.html has no <script type="module">`);
  const W = /data-width="(\d+)"/.exec(page)[1], H = /data-height="(\d+)"/.exec(page)[1];
  const code = script[0].replace(/const W = \d+, H = \d+;/g, `const W = ${W}, H = ${H};`);
  if (css) page = page.replace(/\n(\s*)<\/style>/, `\n    ${css[0]}\n$1</style>`);
  return page.replace(/<script type="module">[\s\S]*?<\/script>/, () => code);
}
