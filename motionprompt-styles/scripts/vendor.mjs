// Local npm cache for libraries vendored into projects (GSAP, Three.js, @fontsource fonts). Needs network the first time only.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const CACHE = process.env.MOTIONPROMPT_VENDOR || path.join(os.homedir(), ".cache", "motionprompt-vendor");
export const VERSIONS = { gsap: "3.14.2", three: "0.181.2" };

const bare = (spec) => spec.replace(/^(@?[^@]+)@.*$/, "$1");   // "gsap@3.14.2" -> "gsap", "@fontsource/anton" -> "@fontsource/anton"
export function ensure(pkgs) {
  fs.mkdirSync(CACHE, { recursive: true });
  const pj = path.join(CACHE, "package.json");
  if (!fs.existsSync(pj)) fs.writeFileSync(pj, JSON.stringify({ name: "motionprompt-vendor", private: true }));
  const missing = pkgs.filter((p) => !fs.existsSync(path.join(CACHE, "node_modules", bare(p), "package.json")));
  if (missing.length) {
    console.log(`  npm install (cache ${CACHE}): ${missing.join(" ")}`);
    execFileSync("npm", ["install", "--silent", "--no-audit", "--no-fund", "--prefix", CACHE, ...missing], { stdio: "inherit", shell: process.platform === "win32" });
  }
}
export const pkgDir = (name) => path.join(CACHE, "node_modules", name);
export function copy(from, to) { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); }

export function vendorGsap(projectDir) {
  ensure([`gsap@${VERSIONS.gsap}`]);
  copy(path.join(pkgDir("gsap"), "dist", "gsap.min.js"), path.join(projectDir, "assets", "vendor", "gsap.min.js"));
}
export function vendorThree(projectDir) {
  ensure([`three@${VERSIONS.three}`]);
  for (const f of ["three.module.js", "three.core.js"]) copy(path.join(pkgDir("three"), "build", f), path.join(projectDir, "assets", "vendor", f));   // three.module.js imports ./three.core.js
}
