#!/usr/bin/env node
// Fidelity + structure audit: compares styles/<slug>.md with the ORIGINAL website prompt and validates every machine block.
//   node audit.mjs                 all styles           node audit.mjs kinetic-type   one style
//   node audit.mjs --skeleton <slug>   print the numbered directive list of the original prompt (to write the Directive map)
//   node audit.mjs --summary       one line per style
// Exit code 1 when any style fails. Original prompts: MOTIONPROMPT_PROMPTS or references/motionprompt/prompts.
import fs from "node:fs";
import path from "node:path";
import { SKILL_DIR, parseStyle, listStyles, styleFile, tokenMap, resolveBeats, resolveAll, fitBpm } from "./lib/style-parse.mjs";
import { parsePrompt, coverage, clauses } from "./lib/prompt-parse.mjs";
import { promptsDir } from "./prompt.mjs";
import { KINDS } from "./synth/instruments.mjs";
import { PRESETS } from "./synth/presets.mjs";
import { resolveMusic, renderMusic } from "./synth/music.mjs";
import * as D from "./synth/dsp.mjs";

const args = process.argv.slice(2), flag = (n) => args.includes(`--${n}`);
const skelSlug = flag("skeleton") ? args[args.indexOf("--skeleton") + 1] : null;
const only = args.filter((a) => !a.startsWith("--") && a !== skelSlug);
const dir = promptsDir();
if (!dir) { console.error("original prompts not found (set MOTIONPROMPT_PROMPTS)"); process.exit(1); }

if (flag("skeleton")) {
  const slug = args[args.indexOf("--skeleton") + 1], p = parsePrompt(path.join(dir, `${slug}.txt`));
  const show = (pre, arr) => arr.forEach((b, i) => console.log(`${pre}${i + 1}  ${b}`));
  console.log(`# ${slug}: directives of the original prompt (rewrite each in your own words in the Directive map)\n`);
  show("L", p.look); console.log(); show("T", p.type); console.log();
  console.log(`S1  Effects: ${p.effects}\nS2  Music: ${p.music}\nS3  make every sound with code\n`); show("O", p.out);
  console.log(`\nhex: ${p.hex.join(" ")}\nfonts: ${p.fonts.join(" | ")}\nbpm: ${p.bpms.join(",") || "-"}  meters: ${p.meters.join(",") || "-"}`);
  console.log(`\nnegatives to cover in Guardrails:\n${p.negatives.map((n) => "  - " + n).join("\n")}`);
  process.exit(0);
}

const catalog = (() => { const f = path.join(dir, "..", "styles.json"); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : []; })();
const SECTIONS = ["Inputs to gather", "Directive map", "Tokens", "Beat sheet", "Build recipe", "Sound plan", "Layout by aspect ratio", "Loop & ending", "Guardrails", "QA"];
const REQUIRED_META = ["name", "title", "description", "tags", "library", "sound", "difficulty", "default_duration", "ratios"];
const CUE_KEYS = new Set(["at", "rise", "kind", "vol", "db", "pan", "verb", "rev", "pitch", "echo", "lp", "hp", "peak", "every", "everyBeat", "times", "of", "decay", "step", "n", "span", "curve", "f0", "f1", "tick", "final", "finalGap", "dt", "jitter", "spaceEvery", "bell", "inst", "from", "scale", "dir", "notes", "len"]);
const sectionText = (body, name) => { const m = new RegExp(`^## ${name.replace(/[&]/g, "\\&")}\\s*$([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m").exec(body); return m ? m[1] : ""; };

const slugs = only.length ? only : listStyles();
const results = [];
for (const slug of slugs) {
  const fails = [], warns = [], notes = [];
  const F = (m) => fails.push(m), W = (m) => warns.push(m);
  let st, pr;
  try { st = parseStyle(styleFile(slug)); } catch (e) { results.push({ slug, fails: [e.message], warns, notes }); continue; }
  const pf = path.join(dir, `${slug}.txt`);
  if (!fs.existsSync(pf)) { results.push({ slug, fails: [`no original prompt ${pf}`], warns, notes }); continue; }
  pr = parsePrompt(pf);
  const m = st.meta, b = st.blocks, body = st.body;

  // ---- frontmatter ----
  for (const k of REQUIRED_META) if (m[k] === undefined) F(`frontmatter missing "${k}"`);
  if (m.name !== slug) F(`frontmatter name "${m.name}" != file name "${slug}"`);
  const cat = catalog.find((c) => c.slug === slug);
  if (cat) {
    if (String(m.library) !== String(cat.library)) F(`library "${m.library}" != site "${cat.library}"`);
    if (JSON.stringify([...(m.tags || [])].sort()) !== JSON.stringify([...(cat.tags || [])].sort())) F(`tags ${JSON.stringify(m.tags)} != site ${JSON.stringify(cat.tags)}`);
  } else W("slug not found in styles.json");
  for (const s of SECTIONS) if (!new RegExp(`^## ${s.replace(/[&]/g, "\\&")}\\s*$`, "m").test(body)) F(`missing section "## ${s}"`);

  // ---- directive map: every original bullet has a row ----
  const rows = [...body.matchAll(/^\|\s*([LTSO]\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/gm)].map((r) => ({ id: r[1], req: r[2], how: r[3] }));
  const have = new Set(rows.map((r) => r.id));
  for (const id of pr.ids) if (!have.has(id)) F(`Directive map lacks ${id}`);
  for (const id of have) if (!pr.ids.includes(id)) W(`Directive map has ${id} which the original prompt does not`);
  for (const r of rows) if (r.how.length < 12) W(`${r.id}: "how to build" is too thin`);

  // ---- colours, fonts, tempo ----
  const tokens = tokenMap(b.tokens || ""), tokenHex = new Set(Object.values(tokens).map((v) => v.toLowerCase()));
  const allHex = new Set([...(st.text.match(/#[0-9a-fA-F]{6}\b/g) || []).map((x) => x.toLowerCase())]);
  for (const h of pr.hex) if (!tokenHex.has(h)) (allHex.has(h) ? W : F)(`colour ${h} from the prompt is ${allHex.has(h) ? "only mentioned in prose, not in the tokens block" : "missing"}`);
  for (const [k, v] of Object.entries(tokens)) if (/^#[0-9a-f]{3,8}$/i.test(v) === false && /^#/.test(v)) F(`token ${k}: bad colour ${v}`);
  for (const k of ["--bg", "--ink"]) if (!tokens[k]) W(`tokens block has no ${k} (brand override maps bg/ink/accent/accent2)`);
  const fams = (b.fonts || []).map((f) => f.family.toLowerCase());
  for (const f of pr.fonts) { if (!fams.some((x) => x === f.toLowerCase() || f.toLowerCase().includes(x) || x.includes(f.toLowerCase()))) F(`font "${f}" from the prompt is not in the fonts block`); }
  for (const f of b.fonts || []) { if (!f.family || !(f.id || f.local)) F(`fonts entry needs family + (id | local): ${JSON.stringify(f)}`); }
  const mus = b.music ? resolveMusic(b.music) : null, bpmSheet = b.beats?.bpm;
  if (pr.bpms.length) {
    const have2 = new Set([mus?.bpm, bpmSheet, b.music?.bpm].filter(Boolean));
    if (![...have2].some((x) => pr.bpms.some((p) => Math.abs(p - x) <= 2))) F(`prompt bpm ${pr.bpms.join("/")} not reflected (music ${mus?.bpm ?? "-"}, beats ${bpmSheet ?? "-"})`);
  } else notes.push("prompt gives no bpm");
  for (const mt of pr.meters) if ((mus?.meter || "4/4") !== mt) F(`prompt meter ${mt} but music meter is ${mus?.meter || "4/4"}`);

  // ---- negative constraints must reach Guardrails ----
  const guard = sectionText(body, "Guardrails");
  for (const n of pr.negatives) { const c = coverage(n, guard + "\n" + sectionText(body, "Build recipe")); if (c.ratio < 0.55) F(`guardrail not covered: "${n.slice(0, 110)}" (missing: ${c.missing.slice(0, 5).join(", ")})`); }

  // ---- sound coverage: each effects clause is addressed in the Sound plan ----
  const soundText = sectionText(body, "Sound plan");
  const cl = clauses(pr.effects); let hit = 0; const miss = [];
  for (const c of cl) { const cv = coverage(c, soundText); if (cv.ratio >= 0.34) hit++; else miss.push(c.slice(0, 70)); }
  if (cl.length && hit / cl.length < 0.75) F(`Sound plan covers ${hit}/${cl.length} effect clauses; unaddressed: ${miss.slice(0, 4).join(" | ")}`);
  else if (miss.length) W(`Sound plan does not clearly mention: ${miss.slice(0, 3).join(" | ")}`);

  // ---- machine blocks ----
  const Dsec = m.default_duration || 8;
  let T = { start: 0, end: Dsec };
  if (!b.beats) F("missing ```json beats block"); else { try { T = resolveBeats(b.beats, Dsec, fitBpm(b.beats.bpm || 0, Dsec)); } catch (e) { F(`beats: ${e.message}`); } }
  if (!b.cues) F("missing ```json cues block"); else for (const c of b.cues) {
    if (!c.kind) { F(`cue without kind: ${JSON.stringify(c)}`); continue; }
    const comp = ["ticks", "typing", "run", "repeat"].includes(c.kind), inner = c.of?.kind;
    if (!comp && !KINDS[c.kind]) F(`cue kind "${c.kind}" is not a synth kind`);
    if (inner && !KINDS[inner]) F(`repeat.of kind "${inner}" is not a synth kind`);
    if (c.kind === "run" && c.inst && !KINDS[c.inst]) F(`run inst "${c.inst}" is not a synth kind`);
    if (c.final?.kind && !KINDS[c.final.kind]) F(`ticks.final kind "${c.final.kind}" is not a synth kind`);
    try { resolveAll(c.at, T, Dsec); } catch (e) { F(`cue at: ${e.message}`); }
    const KP = KINDS[c.kind]?.params || {};
    for (const key of Object.keys(c)) if (!CUE_KEYS.has(key) && !(key in KP) && !comp) W(`cue ${c.kind}: unknown param "${key}"`);
  }
  if (!b.music) F("missing ```json music block"); else {
    try { const r = renderMusic({ ...b.music, layers: b.music.layers }, Math.min(Dsec, 6), { seed: 1 }); if (!(D.peak(r.L) > 0.01)) F("music renders silent"); }
    catch (e) { F(`music: ${e.message}`); }
    if (b.music.preset && !PRESETS[b.music.preset]) F(`unknown music preset ${b.music.preset}`);
    if (b.music.layers && !Array.isArray(b.music.layers) && b.music.preset) for (const id of Object.keys(b.music.layers)) if (!PRESETS[b.music.preset].layers.some((l) => l.id === id) && !b.music.layers[id]?.type) F(`music layer override "${id}" is not a layer of preset ${b.music.preset}`);
  }
  if (!b.tokens) F("missing ```css tokens block");
  if (!b.fonts) F("missing ```json fonts block");
  const qa = sectionText(body, "QA"); if (qa.trim().split("\n").filter((l) => l.startsWith("- ")).length < 3) W("QA section has fewer than 3 checks");
  results.push({ slug, fails, warns, notes, ids: pr.ids.length, rows: rows.length, lines: st.text.split("\n").length });
}

let bad = 0, warnN = 0;
for (const r of results) {
  bad += r.fails.length ? 1 : 0; warnN += r.warns.length;
  if (flag("summary")) { console.log(`${r.fails.length ? "FAIL" : "ok  "} ${r.slug.padEnd(22)} directives ${String(r.rows ?? "-").padStart(2)}/${String(r.ids ?? "-").padEnd(2)}  fails ${r.fails.length} warns ${r.warns.length}  ${r.lines ?? ""} lines`); continue; }
  console.log(`${r.fails.length ? "FAIL" : r.warns.length ? "warn" : "ok  "} ${r.slug}`);
  for (const f of r.fails) console.log(`   x ${f}`);
  for (const w of r.warns) console.log(`   ! ${w}`);
  for (const n of r.notes) console.log(`   . ${n}`);
}
console.log(`\n${results.length} style(s): ${results.length - bad} pass, ${bad} fail, ${warnN} warning(s)`);
process.exit(bad ? 1 : 0);
