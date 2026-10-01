---
name: motionprompt-retro-cinematic
description: |
  Trigger when the user wants a short video (5-30 s) in one of these looks: Retro synthwave, Kaiju attack, Nostalgia 90s, Vintage archive, Pixel art, Y2K chrome, Tech noir, Neon tech. Category: Retro & cinematic, nostalgic, film, arcade and sci-fi looks: synthwave, monster movie, old tapes and archives, pixel games, chrome, noir tech, neon HUD. Each style is a tested HyperFrames (HTML to MP4) build recipe with design tokens, fonts, a beat sheet, a synthesised sound cue sheet and QA checks. Engine, scaffold and shared rules live in the sibling skill `motionprompt-styles`: load it (and /hyperframes) first. NOT for Manim maths scenes (manimce-best-practices), not for editing footage.
---

# Retro & cinematic (MotionPrompt category)

Part of the MotionPrompt family. **Workflow, scaffold, sound synthesiser, QA rules and every script are in `../motionprompt-styles/`**: read its `SKILL.md` first (and `/hyperframes`, `/hyperframes-core`), then use a style file from this folder.

```bash
S=.claude/skills/motionprompt-styles
node $S/scripts/scaffold.mjs <style> --out videos/NN_slug --ratio 9:16 --duration <default> --sound music --text "Line one|Line two"
# build index.html from styles/<style>.md (this folder), then:  npm run check && npm run draft
```

## Which style here?
- **Retro synthwave** (`retro-synthwave`): music releases, gaming, retro or nightlife brands, event titles, loops behind a logo. Avoid: the tone must be modern minimal or corporate.
- **Kaiju attack** (`kaiju-attack`): a playful launch, a "coming soon", an event, a big claim delivered as a movie trailer gag. Headline of 1 to 4 words plus one short extra line. Avoid: the tone must be serious or corporate, or the brand is a real film/monster IP. The monster is original: never copy a famous one. Below 10 s it gets crowded; use 12 to 15 s.
- **Nostalgia 90s** (`nostalgia-90s`): nostalgia campaigns, throwback greetings, old-photo memories, retro brands, anniversary stories. Avoid: you need modern clean visuals.
- **Vintage archive** (`vintage-archive`): a company's history, an anniversary, a family or founder story, heritage brands, "since 19xx" messages. Avoid: you have no dates or story order; the tone must be modern.
- **Pixel art** (`pixel-art`): a small business, a bakery or cafe, an app or service, a freelancer's self-introduction, a launch with a playful tone. Avoid: the tone must be serious, or the offer has no clear features/proof/CTA to fit the game beats.
- **Y2K chrome** (`y2k-chrome`): music and fashion drops, Y2K nostalgia, beauty and tech brands with a glossy retro look. Avoid: long headlines or a matte, minimal tone.
- **Tech noir** (`tech-noir`): infrastructure, cloud, security, AI, offline-first, network products; a premium announcement. Avoid: you need a bright or playful tone, or lots of copy (labels are tiny by design).
- **Neon tech** (`neon-tech`): tech, AI, cloud, security and developer products, launch or feature slides, brand intros with a futuristic feel. Avoid: you need a calm or warm tone.

## Styles in this category

<!-- CATALOG:START -->
| Style | Name | Tags | Engine | Diff. | Default | 9:16 4:5 1:1 16:9 | Look |
|-------|------|------|--------|-------|---------|-------------------|------|
| [retro-synthwave](styles/retro-synthwave.md) | Retro synthwave | retro, background | Canvas | 3 | 8s | ++ ++ ++ ++ | An 80s outrun night scene: a neon grid scrolling toward you, a striped setting sun, wireframe mountains,... |
| [kaiju-attack](styles/kaiju-attack.md) | Kaiju attack | promo, retro, text | Canvas | 5 | 15s | ++ ++ + ++ | A 1950s low-budget monster movie shot on old film: a giant rubber-suit monster rises over a model city at... |
| [nostalgia-90s](styles/nostalgia-90s.md) | Nostalgia 90s | retro, malaysia, photos | Canvas | 5 | 15s | ++ ++ ++ ++ | A Malaysian 80s and 90s throwback like a home video on an old tape: a chunky wooden CRT TV switches on to... |
| [vintage-archive](styles/vintage-archive.md) | Vintage archive | photos, retro, brand | GSAP | 5 | 15s | ++ ++ ++ ++ | An old documentary reel found in a family archive: aged paper, heavy film grain, sepia photos with deckled... |
| [pixel-art](styles/pixel-art.md) | Pixel art | retro, promo, product | Canvas | 5 | 15s | + ++ ++ ++ | Your offer as a retro pixel game level: a PLAYER 1 character-select card with stat bars, a side-scrolling... |
| [y2k-chrome](styles/y2k-chrome.md) | Y2K chrome | 3d, retro, brand | Three.js | 5 | 10s | ++ ++ ++ ++ | A late-90s/early-2000s liquid chrome look on a pastel-to-silver gradient: a shiny 3D chrome blob that slowly... |
| [tech-noir](styles/tech-noir.md) | Tech noir | 3d, explainer, product | Canvas | 5 | 15s | + + + ++ | A dark cinematic tech film: a dotted globe with glowing arcs, thin isometric line-art devices joined by a... |
| [neon-tech](styles/neon-tech.md) | Neon tech | explainer, brand, promo | GSAP | 5 | 12s | ++ ++ ++ ++ | A bold neon tech title slide that comes alive: HUD rings spin up, circuit traces pulse, an isometric laptop... |

`*` = hidden on the website but fully supported here. Diff. = build difficulty 1 to 5. `++` great, `+` good, `~` ok fit for that ratio.
<!-- CATALOG:END -->

Reply in the user's language (Bahasa Melayu users get Malay). Never invent facts, prices or claims; state honestly what was verified (sound is checked by levels and spectrogram, not by ear).
