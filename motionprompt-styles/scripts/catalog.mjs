#!/usr/bin/env node
// Build the style catalog tables from the frontmatter of every styles/*.md (this skill + the motionprompt-* category skills).
//   node catalog.mjs            print the full markdown table
//   node catalog.mjs --write    refresh the <!-- CATALOG:START/END --> blocks in: this SKILL.md, rules/style-picker.md and every category SKILL.md
import fs from "node:fs";
import path from "node:path";
import { SKILL_DIR, SKILLS_ROOT, listStyles, parseStyle, styleFile, styleSkill } from "./lib/style-parse.mjs";

const cats = JSON.parse(fs.readFileSync(path.join(SKILL_DIR, "categories.json"), "utf8"));
const catOf = Object.fromEntries(Object.entries(cats).flatMap(([k, v]) => v.slugs.map((s) => [s, k])));
const first = (d) => { const s = d.split(/(?<=[.])\s/)[0].replace(/[.]$/, ""); return s.length <= 110 ? s : s.slice(0, 110).replace(/\s+\S*$/, "") + "..."; };

function row(slug, fromSkill, withCat) {
  const { meta } = parseStyle(styleFile(slug));
  const owner = styleSkill(slug), r = meta.ratios || {};
  const fit = ["9:16", "4:5", "1:1", "16:9"].map((k) => ({ great: "++", good: "+", ok: "~" }[r[k]] || "-")).join(" ");
  const link = owner === fromSkill ? `styles/${slug}.md` : `../${owner}/styles/${slug}.md`;
  const cells = [`[${slug}](${link})${meta.hidden ? " *" : ""}`, meta.title];
  if (withCat) cells.push(catOf[slug] || "(core)");
  cells.push((meta.tags || []).join(", "), meta.library, meta.difficulty, `${meta.default_duration}s`, fit, first(meta.description));
  return `| ${cells.join(" | ")} |`;
}
const LEGEND = "\n\n`*` = hidden on the website but fully supported here. Diff. = build difficulty 1 to 5. `++` great, `+` good, `~` ok fit for that ratio.";
function table(slugs, fromSkill, withCat) {
  const head = withCat ? ["Style", "Name", "Category skill", "Tags", "Engine", "Diff.", "Default", "9:16 4:5 1:1 16:9", "Look"] : ["Style", "Name", "Tags", "Engine", "Diff.", "Default", "9:16 4:5 1:1 16:9", "Look"];
  return [`| ${head.join(" | ")} |`, `|${head.map((h) => "-".repeat(h.length + 2)).join("|")}|`, ...slugs.map((s) => row(s, fromSkill, withCat))].join("\n") + LEGEND;
}
function replaceBlock(p, tbl) {
  if (!fs.existsSync(p)) return false;
  let s = fs.readFileSync(p, "utf8"); const crlf = s.includes("\r\n"); s = s.replaceAll("\r\n", "\n");
  const a = s.indexOf("<!-- CATALOG:START -->"), b = s.indexOf("<!-- CATALOG:END -->");
  if (a < 0 || b < 0) { console.log(`skip ${p}: no markers`); return false; }
  s = s.slice(0, a) + "<!-- CATALOG:START -->\n" + tbl + "\n" + s.slice(b);
  fs.writeFileSync(p, crlf ? s.replaceAll("\n", "\r\n") : s); return true;
}

const all = listStyles();
const missing = all.filter((s) => !catOf[s]), ghost = Object.keys(catOf).filter((s) => !all.includes(s));
if (missing.length || ghost.length) console.log(`WARNING categories.json mismatch: not categorised ${JSON.stringify(missing)}, unknown ${JSON.stringify(ghost)}`);
if (!process.argv.includes("--write")) { console.log(table(all, path.basename(SKILL_DIR), true)); process.exit(0); }

const core = path.basename(SKILL_DIR);
for (const f of ["SKILL.md", path.join("rules", "style-picker.md")]) if (replaceBlock(path.join(SKILL_DIR, f), table(all, core, true))) console.log(`updated ${f} (${all.length} styles)`);
for (const [skill, v] of Object.entries(cats)) {
  const p = path.join(SKILLS_ROOT, skill, "SKILL.md");
  if (replaceBlock(p, table(v.slugs, skill, false))) console.log(`updated ${skill}/SKILL.md (${v.slugs.length} styles)`);
}
