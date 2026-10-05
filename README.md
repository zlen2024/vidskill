# Skills bundle

One folder with every skill built for the Manim / HyperFrames video channel. Copy the skill folders you need into `<project>/.claude/skills/` (or `~/.claude/skills/`); each folder is self-contained except for the dependencies below.

### Manim (maths / diagram animation)

| Skill | What it is for |
|-------|----------------|
| [`manimce-best-practices`](manimce-best-practices/SKILL.md) | Trigger when: (1) User mentions "manim" or "Manim Community" or "ManimCE", (2) Code contains `from manim import *`, (3) User runs `manim` CLI commands, (4) Working with Scene, MathTex, Create(), or ManimCE-specific classes. Best ... |

### Manim + HyperFrames vertical long-form

| Skill | What it is for |
|-------|----------------|
| [`manim-hyperframes-vertical`](manim-hyperframes-vertical/SKILL.md) | Trigger when the user wants a LONG-FORM or VERTICAL (9:16) explainer that mixes Manim maths/diagram scenes with richer visuals: colourful animated backgrounds, sparkle/confetti FX, burned-in captions, voice-over and music, in one ... |

### MotionPrompt engine (scaffold, synth, audit, templates, rules)

| Skill | What it is for |
|-------|----------------|
| [`motionprompt-styles`](motionprompt-styles/SKILL.md) | Trigger when: (1) the user wants a short video (5 to 30 s: promo, social clip, greeting, explainer, title, intro/outro) "in the style of" a named look or asks for one of the 50 MotionPrompt styles: Kinetic typography, Kaiju ... |

### MotionPrompt style categories (50 looks)

| Skill | What it is for |
|-------|----------------|
| [`motionprompt-typography-social`](motionprompt-typography-social/SKILL.md) | Trigger when the user wants a short video (5-30 s) in one of these looks: Kinetic typography, Glitch, Neon sign, Chat story, Podcast audiogram, Sale countdown, Comic pop art, Swiss geometric. Category: Typography & social, ... |
| [`motionprompt-retro-cinematic`](motionprompt-retro-cinematic/SKILL.md) | Trigger when the user wants a short video (5-30 s) in one of these looks: Retro synthwave, Kaiju attack, Nostalgia 90s, Vintage archive, Pixel art, Y2K chrome, Tech noir, Neon tech. Category: Retro & cinematic, nostalgic, film, ... |
| [`motionprompt-handmade-illustrated`](motionprompt-handmade-illustrated/SKILL.md) | Trigger when the user wants a short video (5-30 s) in one of these looks: Paper cut-out, Claymation, Kawaii pastel, Whiteboard sketch, Flat illustration, Watercolour ink, Isometric diorama, Elegant wedding. Category: Handmade & ... |
| [`motionprompt-explainer-data`](motionprompt-explainer-data/SKILL.md) | Trigger when the user wants a short video (5-30 s) in one of these looks: Infographic, Radial infographic, Data story, Slide deck, Map journey, Property tour. Category: Explainer & data, numbers, infographics, slide decks, maps ... |
| [`motionprompt-product-brand`](motionprompt-product-brand/SKILL.md) | Trigger when the user wants a short video (5-30 s) in one of these looks: 3D logo spin, Product turntable, App showcase, Floating 3D icons, Editorial portfolio, Photo studio, Photo slideshow, Liquid gradient, Particle field. ... |
| [`motionprompt-malaysia-festive`](motionprompt-malaysia-festive/SKILL.md) | Trigger when the user wants a short video (5-30 s) in one of these looks: Batik fashion, Borneo rainforest, Chinese heritage, Deepavali, Festive Raya, Kampung sunset, Kopitiam, Malaysian heritage, Merdeka, Pasar malam, Food menu. ... |

## Make a video in one command

```bash
node motionprompt-styles/scripts/make.mjs kinetic-type --out videos/promo --ratio 9:16 --duration 8 \
     --text "Make it move|Say it loud|Own the beat" --key "Make it move" --repeat phrase=auto [--final]
```

Scaffolds the project, builds it (for styles with a finished example: `kinetic-type`, `retro-synthwave`, `logo-spin-3d`, `pixel-art`, `tech-noir`), checks, renders and verifies the MP4, and writes a frame sheet. For other styles it scaffolds and stops; build `index.html`, then run `make.mjs --project videos/promo`.

## Dependencies between skills
- `motionprompt-<category>` skills hold only style recipes: they need `motionprompt-styles` (scripts, templates, rules, `categories.json`) installed next to them.
- `motionprompt-*` and `manim-hyperframes-vertical` render through HyperFrames: install the HyperFrames skills (`hyperframes`, `hyperframes-core`, `hyperframes-cli`, ...) from their own source.
- `manim-hyperframes-vertical` uses `manimce-best-practices` for the Manim API and, when present, `motionprompt-styles/scripts/synth.mjs` for music.
- Tools needed on the machine: Python + Manim CE (+ LaTeX/TinyTeX), Node 20+, ffmpeg, Chrome (HyperFrames).

## Maintenance
- Add a style: put `<slug>.md` in the right `motionprompt-<category>/styles/`, add the slug to `motionprompt-styles/categories.json`, run `node motionprompt-styles/scripts/audit.mjs` and `node motionprompt-styles/scripts/catalog.mjs --write`.
- Regenerate this bundle from the project: `python tools/bundle_skills.py`.
- The original MotionPrompt site prompts are NOT bundled (no upstream licence); only the independent recipes are.
