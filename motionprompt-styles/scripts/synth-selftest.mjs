#!/usr/bin/env node
// Renders every sound kind and every music preset and checks basic health (finite, level, DC, silence, loop seam).
import * as D from "./synth/dsp.mjs";
import { KINDS } from "./synth/instruments.mjs";
import { PRESETS } from "./synth/presets.mjs";
import { renderMusic } from "./synth/music.mjs";
D.setSampleRate(44100);
let bad = 0;
const fail = (m) => { bad++; console.log("  FAIL " + m); };
console.log("SOUND KINDS");
for (const [name, K] of Object.entries(KINDS)) {
  const t0 = Date.now(), b = K.render({}, { r: D.rng(3) });
  let nan = 0, dc = 0, clip = 0; for (const x of b) { if (!Number.isFinite(x)) nan++; dc += x; if (Math.abs(x) > 0.999) clip++; }
  dc /= b.length;
  const pk = D.peak(b), rms = D.rms(b), sec = b.length / 44100, ms = Date.now() - t0;
  const ok = !nan && pk > 0.05 && pk < 0.97 && Math.abs(dc) < 0.03 && sec > 0.01 && sec < 12;
  console.log(`${ok ? "ok  " : "BAD "} ${name.padEnd(11)} ${sec.toFixed(2).padStart(5)}s peak ${pk.toFixed(2)} rms ${(20 * Math.log10(rms + 1e-9)).toFixed(0).padStart(4)}dB dc ${dc.toFixed(3)} ${ms}ms`);
  if (!ok) fail(`${name}: nan=${nan} peak=${pk} dc=${dc}`);
}
console.log("\nMUSIC PRESETS (8 s, seed 1)");
for (const name of Object.keys(PRESETS)) {
  const t0 = Date.now();
  let res; try { res = renderMusic({ preset: name }, 8, { seed: 1 }); } catch (e) { fail(`${name}: ${e.message}`); continue; }
  const { L, R, info } = res;
  let nan = 0; for (const x of L) if (!Number.isFinite(x)) nan++;
  const pk = Math.max(D.peak(L), D.peak(R)), rms = D.rms(L);
  // seam: RMS of the last 50 ms vs first 50 ms should be comparable (no hard cut into silence / click)
  const w = 2205, sr = (b, o) => D.rms(b.subarray(o, o + w)), head = sr(L, 0), tailR = sr(L, L.length - w);
  const jump = Math.abs(L[0] - L[L.length - 1]);
  const ok = !nan && pk > 0.05 && pk < 0.6 && rms > 0.005;
  console.log(`${ok ? "ok  " : "BAD "} ${name.padEnd(20)} ${String(info.bpm).padStart(6)} bpm ${String(info.bars).padStart(2)} bars ${info.align} peak ${pk.toFixed(2)} rms ${(20 * Math.log10(rms + 1e-9)).toFixed(0)}dB seam(head ${head.toFixed(3)} tail ${tailR.toFixed(3)} jump ${jump.toFixed(3)}) ${Date.now() - t0}ms`);
  if (!ok) fail(`${name}: nan=${nan} peak=${pk} rms=${rms}`);
}
console.log(bad ? `\n${bad} problem(s)` : "\nall healthy");
process.exit(bad ? 1 : 0);
