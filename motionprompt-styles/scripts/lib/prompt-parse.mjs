// Parse an original MotionPrompt prompt.txt into sections, bullets and the facts the audit checks.
import fs from "node:fs";

const SECTIONS = ["Look and motion", "Type and colour", "Sound", "Output"];
export function parsePrompt(file) {
  const text = fs.readFileSync(file, "utf8").replaceAll("\r\n", "\n");
  const lines = text.split("\n"), sec = {};
  let cur = null;
  for (const l of lines) {
    if (SECTIONS.includes(l.trim())) { cur = l.trim(); sec[cur] = []; continue; }
    if (cur && l.startsWith("- ")) sec[cur].push(l.slice(2).trim());
  }
  const look = sec["Look and motion"] || [], type = sec["Type and colour"] || [], sound = sec["Sound"] || [], out = sec["Output"] || [];
  // expected directive ids: L1..Ln, T1..Tn, S1 Effects, S2 Music, S3 make-with-code, O1..On
  const ids = [...look.map((_, i) => `L${i + 1}`), ...type.map((_, i) => `T${i + 1}`)];
  const eff = sound.find((b) => b.startsWith("Effects:")), mus = sound.find((b) => b.startsWith("Music:"));
  if (eff) ids.push("S1"); if (mus) ids.push("S2"); if (sound.some((b) => /^Make every sound with code/.test(b))) ids.push("S3");
  ids.push(...out.map((_, i) => `O${i + 1}`));
  const all = look.concat(type, sound, out).join("\n");
  const hex = [...new Set([...all.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0].toLowerCase()))];
  // fonts are named only in the Type and colour section: "(like Anton)", "(like Oswald or Bebas Neue)"
  const fonts = new Set(), NOT_FONT = /^(italic|bold|light|regular|medium)$/i;
  for (const bl of type) for (const m of bl.matchAll(/\((?:like|e\.g\.,?) ([^)]+)\)/g)) for (const part of m[1].split(/\s+or\s+|,\s*/)) { const f = cleanFont(part); if (/^[A-Z][A-Za-z0-9]*(?: [A-Za-z0-9]+)*$/.test(f) && !NOT_FONT.test(f) && !/^\d/.test(f)) fonts.add(f); }
  const bpms = [...new Set([...all.matchAll(/(\d{2,3})\s*bpm/gi)].map((m) => +m[1]))];
  const meters = [...new Set([...all.matchAll(/\b(3\/4|12\/8|6\/8)\b/g)].map((m) => m[1]))];
  // negative constraints (never / no / not / don't / without / avoid ...) from look, type, sound sections
  const negRe = /\b(never|no|not|don't|do not|without|avoid|nothing|none|neither)\b/i;
  const sentences = [];
  for (const b of look.concat(type, sound)) for (const s of b.split(/(?<=[.!?])\s+(?=[A-Z])/)) sentences.push(s.trim());
  // conditional fallbacks ("If not, draw ...", "If I attach none, ...") are instructions, not prohibitions
  const conditional = (s) => /^(If|Otherwise)\b/i.test(s) && !/\b(never|avoid|without|don't|do not)\b/i.test(s);
  const negFull = sentences.filter((s) => negRe.test(s) && !conditional(s) && !/copyrighted/.test(s) && !/^Use my brand/.test(s));
  // in a long comma-separated list (the Effects line) only the clause that carries the prohibition matters
  const negatives = negFull.flatMap((s) => { if (s.length < 180) return [s]; const c = s.split(/,\s+/).filter((x) => negRe.test(x)); return c.length ? c : [s]; });
  return { text, look, type, sound, out, ids, hex, fonts: [...fonts].filter(Boolean), bpms, meters, negatives, effects: eff ? eff.slice(8).trim() : "", music: mus ? mus.slice(6).trim() : "" };
}
const FONTISH = /font/i;
const WEIGHT_WORDS = /\s+(Black|ExtraBold|Extra Bold|Bold|SemiBold|Semibold|Light|Medium|Italic|Regular)$/;
function cleanFont(s) { return s.trim().replace(WEIGHT_WORDS, "").replace(/^the same font.*/, "").trim(); }

// crude stems for keyword coverage checks
const STOP = new Set("about after again along around because before between could every first gentle little quite short small smooth their there these those through under until where which while whole would above below other something together sounds sound soft softly light lightly brief briefly quick quickly little short bright small tiny each with from into over then that this they them very more most like just onto".split(" "));
const STOP4 = new Set("with from each then that this over into just like some soft when they them also have been were your much more most once make made keep sits sit adds add gets get goes goes lets let does done take taken such than only both same into onto near".split(" "));
export const stems = (s) => [...new Set((s.toLowerCase().match(/[a-z]{4,}/g) || []).filter((w) => !STOP.has(w) && !STOP4.has(w)).map((w) => w.slice(0, 5)))];
export function coverage(sentence, haystack) {
  const st = stems(sentence), h = haystack.toLowerCase();
  if (!st.length) return { ratio: 1, missing: [] };
  const missing = st.filter((x) => !h.includes(x));
  return { ratio: 1 - missing.length / st.length, missing };
}
// split an Effects/Music line into clauses (comma / "and" separated)
export const clauses = (s) => s.split(/,\s+(?:and\s+)?|\.\s+|;\s+|\s+and\s+(?=a |an |the |soft |small |tiny |short )/).map((x) => x.trim()).filter((x) => x.length > 8);
