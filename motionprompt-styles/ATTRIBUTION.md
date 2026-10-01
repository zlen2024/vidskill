# Attribution and licence notes

## Where the ideas come from

The 50 style directions in this skill are based on **MotionPrompt** by Ahmad Saiful Bahri
(https://epool86.github.io/motionprompt/, repository github.com/epool86/motionprompt), a free gallery of
prompts that ask Claude to build short animated videos in a given style.

- The website's README says the demos, sound effects and music were made with code.
- **The upstream repository contains no LICENSE file** (GitHub reports no licence), so all rights remain with the author.

## What this skill is (and is not)

- It is an **independent, restructured work**: each `styles/<slug>.md` re-expresses the *requirements* of the
  original prompt in its own words (the "Directive map", one row per original bullet) and adds its own
  engineering: tokens, fonts, beat sheets, cue sheets, build recipes, guardrails and QA.
- The synthesiser, scaffold, audit and tools in `scripts/` and the `MP` kit in `templates/` are original code.
- **It does not contain the original prompt text or the site's demo code.** Colours, font names and tempos are
  factual parameters and are reproduced so the result matches the originals.
- `scripts/prompt.mjs` and `scripts/audit.mjs` read the original prompts from a *local, private* copy
  (`references/motionprompt/prompts/` or `MOTIONPROMPT_PROMPTS`) if you have one. Do not publish that copy.

## Before sharing this skill publicly

Ask the author for permission or a licence, or remove the fidelity tooling that depends on the local prompt copy.
The skill files themselves are safe to keep for personal and team use.
