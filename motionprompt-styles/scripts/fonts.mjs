#!/usr/bin/env node
// Vendor Google fonts (via @fontsource) into a project and emit @font-face CSS.
//   node fonts.mjs --spec fonts.json --project <dir>     # spec = [{family,id,weights,styles,subsets,variable}]
//   node fonts.mjs --check <slug|all>                    # verify every font of a style exists on npm (needs network)
import fs from "node:fs";
import path from "node:path";
import { ensure, pkgDir, copy } from "./vendor.mjs";
import { parseStyle, listStyles, styleFile } from "./lib/style-parse.mjs";

const pkgName = (f) => (f.variable ? `@fontsource-variable/${f.id}` : `@fontsource/${f.id}`);
function files(f) {
  const out = [];
  for (const style of f.styles || ["normal"]) for (const subset of f.subsets || ["latin"]) {
    if (f.variable) out.push({ style, weight: f.weightRange || "100 900", file: `${f.id}-${subset}-${f.axis || "wght"}-${style}.woff2` });
    else for (const w of f.weights || [400]) out.push({ style, weight: String(w), file: `${f.id}-${subset}-${w}-${style}.woff2` });
  }
  return out;
}
export function vendorFonts(spec, projectDir, rel = "assets/fonts") {
  ensure([...new Set(spec.filter((f) => !f.local).map(pkgName))]);
  let css = "";
  for (const f of spec) {
    if (f.local) { css += `@font-face { font-family: "${f.family}"; src: local("${f.local}"); }\n`; continue; }   // OS font with no file to ship (e.g. CJK): local() satisfies lint
    const dir = path.join(pkgDir(pkgName(f)), "files");
    for (const it of files(f)) {
      const src = path.join(dir, it.file);
      if (!fs.existsSync(src)) {
        const avail = fs.existsSync(dir) ? fs.readdirSync(dir).filter((x) => x.endsWith(".woff2")).slice(0, 12).join(", ") : "(package missing)";
        throw new Error(`font file not found: ${pkgName(f)}/files/${it.file}\n  available (first 12): ${avail}`);
      }
      copy(src, path.join(projectDir, rel, it.file));
      css += `@font-face { font-family: "${f.family}"; font-style: ${it.style}; font-weight: ${it.weight}; font-display: block; src: url("${rel}/${it.file}") format("woff2"); }\n`;
    }
  }
  return css;
}
// values for MP.fontsReady([...]) so the timeline is built only after every face is loaded
export const loadSpecs = (spec) => spec.filter((f) => !f.local).flatMap((f) => (f.variable ? [`400 40px "${f.family}"`, `700 40px "${f.family}"`] : (f.weights || [400]).map((w) => `${f.styles?.[0] === "italic" ? "italic " : ""}${w} 40px "${f.family}"`)));

if (process.argv[1]?.endsWith("fonts.mjs")) {
  const a = process.argv.slice(2), val = (n) => { const i = a.indexOf(`--${n}`); return i >= 0 ? a[i + 1] : null; };
  if (val("spec")) {
    const proj = val("project") || ".", spec = JSON.parse(fs.readFileSync(val("spec"), "utf8"));
    const css = vendorFonts(spec, proj); fs.writeFileSync(path.join(proj, "assets/fonts/fonts.css"), css);
    console.log(css); console.log("load specs:", JSON.stringify(loadSpecs(spec)));
  } else if (val("check")) {
    const slugs = val("check") === "all" ? listStyles() : [val("check")];
    let bad = 0;
    for (const s of slugs) {
      const st = parseStyle(styleFile(s)); const spec = (st.blocks.fonts || []).filter((f) => !f.local);
      try {
        ensure([...new Set(spec.map(pkgName))]);
        for (const f of spec) for (const it of files(f)) if (!fs.existsSync(path.join(pkgDir(pkgName(f)), "files", it.file))) throw new Error(`${pkgName(f)}: missing ${it.file}`);
        console.log(`ok   ${s}  (${spec.map((f) => f.family).join(", ")})`);
      } catch (e) { bad++; console.log(`FAIL ${s}: ${e.message.split("\n")[0]}`); }
    }
    process.exit(bad ? 1 : 0);
  } else console.log("usage: fonts.mjs --spec fonts.json --project <dir> | --check <slug|all>");
}
