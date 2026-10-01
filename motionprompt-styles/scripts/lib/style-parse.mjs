// Parse a styles/<slug>.md file: frontmatter + tagged fenced blocks (```css tokens, ```json fonts, ```json beats, ```json cues, ```json music).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const STYLES_DIR = path.join(SKILL_DIR, "styles");
// Styles live in this skill AND in the sibling category skills (motionprompt-*/styles), so every script sees all 50.
export const SKILLS_ROOT = path.resolve(SKILL_DIR, "..");
export function styleDirs() {
  const here = path.basename(SKILL_DIR), out = [STYLES_DIR];
  if (fs.existsSync(SKILLS_ROOT)) for (const d of fs.readdirSync(SKILLS_ROOT).sort()) if (d.startsWith("motionprompt-") && d !== here) out.push(path.join(SKILLS_ROOT, d, "styles"));
  return out.filter((d) => fs.existsSync(d));
}

export function parseStyle(file) {
  const text = fs.readFileSync(file, "utf8");
  const fm = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
  if (!fm) throw new Error(`${file}: missing frontmatter`);
  const meta = {};
  for (const line of fm[1].split(/\r?\n/)) {
    const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!m) continue;
    let v = m[2].trim();
    if (/^[\[{]/.test(v)) { try { v = JSON.parse(v); } catch { throw new Error(`${file}: frontmatter "${m[1]}" must be strict JSON (double quotes)`); } }
    else if (v === "true" || v === "false") v = v === "true";
    else if (/^-?\d+(\.\d+)?$/.test(v)) v = Number(v);
    else v = v.replace(/^["']|["']$/g, "");
    meta[m[1]] = v;
  }
  const blocks = {};
  const re = /^```(\w+)[ \t]+(\w+)[ \t]*\r?\n([\s\S]*?)^```/gm;
  let b;
  while ((b = re.exec(text))) {
    const [, lang, tag, body] = b;
    if (blocks[tag]) throw new Error(`${file}: duplicate block "${tag}"`);
    blocks[tag] = lang === "json" ? parseJson(file, tag, body) : body.trimEnd();
  }
  return { file, slug: meta.name, meta, blocks, text, body: text.slice(fm[0].length) };
}
function parseJson(file, tag, body) {
  try { return JSON.parse(body); } catch (e) { throw new Error(`${file}: block "${tag}" is not valid JSON: ${e.message}`); }
}
export function listStyles() { return [...new Set(styleDirs().flatMap((d) => fs.readdirSync(d).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3))))].sort(); }
export const styleFile = (slug) => { for (const d of styleDirs()) { const f = path.join(d, `${slug}.md`); if (fs.existsSync(f)) return f; } return path.join(STYLES_DIR, `${slug}.md`); };
/** which skill folder owns a style file (category skill or this one) */
export const styleSkill = (slug) => path.basename(path.dirname(path.dirname(styleFile(slug))));

// tokens css block -> { "--bg": "#0e1117", ... }
export function tokenMap(css) {
  const out = {};
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}
// beats block -> seconds. Event fields: at (fraction of D) | sec | end (seconds before the end) | beat (needs bpm)
// Beat-driven styles: the animation tempo is snapped to a whole number of beats in D, so the loop and the music line up exactly.
export const fitBpm = (bpm, D) => (bpm ? +(((Math.max(1, Math.round((D * bpm) / 60)) * 60) / D).toFixed(3)) : 0);
// A repeat event makes ids `${id}1..${id}N`:  {"id":"phrase","repeat":{"n":5,"everyBeat":2,"fromBeat":0}}  (or everySec/fromSec)
export function resolveBeats(beatsBlock, D, bpmOverride) {
  const bpm = bpmOverride ?? beatsBlock.bpm ?? 0, T = { start: 0, end: D };
  const clampT = (t) => +Math.min(D, Math.max(0, t)).toFixed(3);
  for (const e of beatsBlock.events || []) {
    if (e.repeat) {
      const r = e.repeat, from = r.fromSec ?? (r.fromFrac !== undefined ? r.fromFrac * D : ((r.fromBeat ?? 0) * 60) / (bpm || 1)), step = r.everySec ?? (r.everyFrac !== undefined ? r.everyFrac * D : ((r.everyBeat ?? 1) * 60) / (bpm || 1));
      if ((r.everyBeat !== undefined || (r.fromBeat !== undefined && r.fromFrac === undefined && r.fromSec === undefined)) && !bpm) throw new Error(`repeat "${e.id}" uses beats but bpm is not set`);
      for (let i = 0; i < r.n; i++) T[`${e.id}${i + 1}`] = clampT(from + i * step);
      continue;
    }
    let t;
    if (e.at !== undefined) t = e.at * D;
    else if (e.sec !== undefined) t = e.sec;
    else if (e.end !== undefined) t = D - e.end;
    else if (e.beat !== undefined) { if (!bpm) throw new Error(`event "${e.id}" uses beat but bpm is not set`); t = (e.beat * 60) / bpm; }
    else throw new Error(`event "${e.id}" needs at | sec | end | beat | repeat`);
    T[e.id] = clampT(t);
  }
  return T;
}
// cue "at" with a trailing * ("phrase*") expands to every matching beat id, in time order
export function resolveAll(at, T, D) {
  const wm = typeof at === "string" ? /^([\w-]+)\*\s*([+-]\s*\d*\.?\d+)?$/.exec(at.trim()) : null;   // "phrase*" or "phrase*+0.1"
  if (wm) {
    const pre = wm[1], off = wm[2] ? parseFloat(wm[2].replace(/\s/g, "")) : 0;
    const ids = Object.keys(T).filter((k) => k.startsWith(pre) && /^\d+$/.test(k.slice(pre.length)));
    if (!ids.length) throw new Error(`cue at="${at}" matches no beat ids`);
    return ids.map((k) => +(T[k] + off).toFixed(3)).sort((a, b) => a - b);
  }
  return [resolveAt(at, T, D)];
}
// cue "at": number = fraction of D, "id" or "id+0.1" / "id-0.05" = beat id with a seconds offset
export function resolveAt(at, T, D) {
  if (typeof at === "number") return +(at * D).toFixed(3);
  const m = /^([\w-]+)\s*([+-]\s*\d*\.?\d+)?$/.exec(String(at));
  if (!m || !(m[1] in T)) throw new Error(`cue at="${at}" does not match a beat id (known: ${Object.keys(T).join(", ")})`);
  return +(T[m[1]] + (m[2] ? parseFloat(m[2].replace(/\s/g, "")) : 0)).toFixed(3);
}
