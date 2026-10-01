#!/usr/bin/env node
// MotionPrompt synth CLI. Cue sheet (.json | .mjs) -> WAV. Zero dependencies.
//   node synth.mjs --cues cues.json --out assets/audio/mix.wav [--duration 8] [--sound off|effects|music] [--stems] [--seed 1]
//   node synth.mjs --list            # every sound kind, composite cue, and music preset
//   node synth.mjs --demo <kind>     # render one kind to demo/<kind>.wav
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { synthesize, wavBytes } from "./synth/engine.mjs";
import { KINDS } from "./synth/instruments.mjs";
import { PRESETS } from "./synth/presets.mjs";
import * as D from "./synth/dsp.mjs";

const args = process.argv.slice(2), flag = (n) => args.includes(`--${n}`), val = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };

if (flag("list")) {
  const asJson = val("list", "") === "json";
  const kinds = Object.fromEntries(Object.entries(KINDS).map(([k, v]) => [k, { desc: v.desc, params: v.params }]));
  const presets = Object.fromEntries(Object.entries(PRESETS).map(([k, v]) => [k, { bpm: v.bpm, key: v.key, scale: v.scale, meter: v.meter || "4/4", layers: v.layers.map((l) => l.id) }]));
  if (asJson) { console.log(JSON.stringify({ kinds, presets, composites: ["ticks", "typing", "run", "repeat"] }, null, 1)); process.exit(0); }
  console.log(`SOUND KINDS (${Object.keys(kinds).length})`);
  for (const [k, v] of Object.entries(kinds)) console.log(`  ${k.padEnd(11)} ${v.desc}\n  ${"".padEnd(11)} ${JSON.stringify(v.params)}`);
  console.log("\nCOMPOSITE CUES\n  ticks   {t,n,span,curve:linear|decel|accel,f0,f1,final:{kind,...}}  counting number\n  typing  {t,n,dt,jitter,spaceEvery,bell}   keyboard / typewriter\n  run     {t,inst,from,n,dt,scale,dir,notes,len}   note run (harp, xylo, bells)\n  repeat  {t,every,times,decay,of:{kind,...}}   ratchets, pulses");
  console.log(`\nMUSIC PRESETS (${Object.keys(presets).length})`);
  for (const [k, v] of Object.entries(presets)) console.log(`  ${k.padEnd(20)} ${String(v.bpm).padStart(3)} bpm  ${v.key} ${v.scale}  ${v.meter}  [${v.layers.join(", ")}]`);
  process.exit(0);
}
if (flag("demo")) {
  const kind = val("demo"), K = KINDS[kind]; if (!K) { console.error(`unknown kind ${kind}`); process.exit(1); }
  D.setSampleRate(44100);
  const b = K.render({}, { r: D.rng(1) }), o = new Float32Array(b.length + 4410); o.set(b, 2205);
  fs.mkdirSync("demo", { recursive: true }); fs.writeFileSync(`demo/${kind}.wav`, wavBytes(o, o)); console.log(`demo/${kind}.wav  ${(b.length / 44100).toFixed(2)}s`); process.exit(0);
}

const cuesPath = val("cues"); if (!cuesPath) { console.error("usage: node synth.mjs --cues <file.json|.mjs> --out <file.wav> [--duration N] [--sound off|effects|music] [--stems] [--seed N]   (or --list)"); process.exit(1); }
let sheet;
if (cuesPath.endsWith(".mjs") || cuesPath.endsWith(".js")) { const mod = await import(pathToFileURL(path.resolve(cuesPath)).href); sheet = typeof mod.default === "function" ? await mod.default() : mod.default; }
else sheet = JSON.parse(fs.readFileSync(cuesPath, "utf8"));
if (val("duration")) sheet.duration = parseFloat(val("duration"));
if (val("seed")) sheet.seed = parseInt(val("seed"), 10);
const sound = val("sound", sheet.sound || "music");
const out = val("out", "mix.wav");
const t0 = Date.now();
const { L, R, info } = synthesize(sheet, { sound, sr: parseInt(val("sr", "44100"), 10) });
if (info.silent) { console.log(`sound=off: no audio written (omit the <audio> element).`); process.exit(0); }
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, wavBytes(L, R, info.sr));
if (flag("stems")) {
  const base = out.replace(/\.wav$/i, "");
  const fxOnly = synthesize({ ...sheet, music: null }, { sound: "effects", sr: info.sr }), muOnly = synthesize({ ...sheet, cues: [] }, { sound: "music", sr: info.sr });
  fs.writeFileSync(`${base}.fx.wav`, wavBytes(fxOnly.L, fxOnly.R, info.sr)); fs.writeFileSync(`${base}.music.wav`, wavBytes(muOnly.L, muOnly.R, info.sr));
}
const rmsDb = 20 * Math.log10(Math.max(D.rms(L), D.rms(R)) || 1e-9);
console.log(JSON.stringify({ out, ...info, rmsDb: +rmsDb.toFixed(1), ms: Date.now() - t0 }));
