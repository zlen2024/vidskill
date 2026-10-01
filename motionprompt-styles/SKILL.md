---
name: motionprompt-styles
description: |
  Trigger when: (1) the user wants a short video (5 to 30 s: promo, social clip, greeting, explainer, title, intro/outro) "in the style of" a named look or asks for one of the 50 MotionPrompt styles: Kinetic typography, Kaiju attack, Infographic, Radial infographic, Slide deck, Flat illustration, Isometric diorama, Malaysian heritage, App showcase, Kawaii pastel, Tech noir, Food menu, Neon sign, Map journey, Liquid gradient, Festive Raya, Data story, Claymation, Retro synthwave, Elegant wedding, 3D logo spin, Kopitiam, Comic pop art, Photo slideshow, Batik fashion, Merdeka, Product turntable, Glitch, Kampung sunset, Chat story, Sale countdown, Watercolour ink, Pasar malam, Whiteboard sketch, Y2K chrome, Chinese heritage / Chinese New Year, Property tour, Particle field, Nostalgia 90s, Podcast audiogram, Borneo rainforest, Paper cut-out, Pixel art, Deepavali, Vintage archive, Swiss geometric, Floating 3D icons, Neon tech, Photo studio, Editorial portfolio; (2) a prompt of the form "Make my video in this style: <Name>" (from the MotionPrompt site epool86.github.io/motionprompt) is pasted; (3) the user describes a look that matches one of them (neon sign, glitch text, synthwave, claymation, batik, Hari Raya / Merdeka / Deepavali / Chinese New Year greeting, sale countdown, chat-bubble story, audiogram, whiteboard explainer...).

  Each style is a complete, tested build recipe for HyperFrames (HTML to MP4): design tokens, fonts, a beat sheet that scales to any length, a sound cue sheet, a loop-safe ending and QA checks; sound and music are synthesised in code (no copyrighted audio). Includes a scaffold that creates a ready project for any style.

  NOT for Manim maths animations (use manimce-best-practices), NOT for editing existing footage, NOT for slide decks or interactive pages.
---

# MotionPrompt styles (50 tested video looks for HyperFrames)

One request = one style. This skill gives you the **creative direction and the engineering recipe**; **HyperFrames renders it**. Load `/hyperframes` and `/hyperframes-core` first (project contract, `check`, `render`), then follow this skill.

Reply in the user's language (Bahasa Melayu users get Malay). Write on-screen text in the language the user used (Malay or English).

## Quick start

```bash
S=.claude/skills/motionprompt-styles            # this skill
node $S/scripts/scaffold.mjs kinetic-type --out videos/04_promo --ratio 9:16 --duration 8 \
     --text "Make it move|Say it loud|Own the beat" --key "Make it move" --sound music \
     [--brand "bg=#10131f,accent=#ff5a4e"] [--lang ms]
cd videos/04_promo && cat BRIEF.md              # directive checklist for this style
# build index.html following styles/kinetic-type.md (timing.mjs and cues.mjs are already wired)
npm run check && npm run draft                  # lint + draft render (one worker)
node $S/scripts/frames.mjs renders/kinetic-type.draft.mp4 --beats timing.mjs   # look at real frames
node $S/scripts/audio-report.mjs assets/audio/mix.wav --expect 8              # objective audio QA
npm run render                                  # final
```

## Workflow (do all of it)

1. **Pick the style** (table below, `rules/style-picker.md`). If the user named one, use it. If two fit, ask one short question; otherwise decide and say why. Read the style file completely: it lives in the category skill listed in the table (`../motionprompt-<category>/styles/<slug>.md`; `scaffold.mjs` prints the exact path).
2. **Gather inputs** listed in the style's *Inputs to gather* (text lines, key line, photos, numbers, brand colours, language). Ask only for what is missing and cannot be defaulted. **Never invent facts, prices, numbers, dates or claims.**
3. **Settings** (`rules/settings.md`): ratio (9:16 default for social), length (6, 8, 10, 15, 30 s; each style has a default), sound (off / effects / music).
4. **Scaffold** with `scripts/scaffold.mjs`. It vendors GSAP/Three/fonts locally, writes `timing.mjs` (beat sheet in seconds, shared by visuals and sound), `content.mjs`, `cues.mjs`, synthesises `assets/audio/mix.wav`, and writes `BRIEF.md`.
5. **Build** `index.html` from the style's *Directive map* and *Build recipe*. Every animated value is a pure function of time (`rules/seekable-canvas.md`). Times come from `timing.mjs`; text from `content.mjs`; sizes in `var(--u)` units.
6. **Gates** (`rules/qa-checklist.md`): `npm run check` clean, draft render, look at frames at every beat (`scripts/frames.mjs`), tick every directive in `BRIEF.md`, `audio-report` OK, loop frame check, then final render and `ffprobe`.
7. **Compare with the original** when possible: `node $S/scripts/prompt.mjs <slug> --ratio 9:16 --duration 8 --sound music` prints the site's original prompt with the settings filled in, and `scripts/compare.mjs` puts your frames next to the site's sample clip. Fix differences in the video **and** in the style file if the recipe was wrong.
8. Report in the user's language: what was made, where the MP4 is, the settings, honest limits (sound was verified by levels and spectrogram, not by ear).

## Skill family (this folder is the engine)

`motionprompt-styles` holds the engine: scripts (scaffold, synth, audit, frames, compare), `templates/`, `rules/`, `examples/` and `categories.json`.
The 50 style recipes are split by category into sibling skills, so the right one loads for the right request:

| Category skill | Use for |
|----------------|---------|
| `motionprompt-typography-social` | hooks, quotes, chats, podcasts, sale promos, bold titles (8) |
| `motionprompt-retro-cinematic` | synthwave, monster movie, old tape, pixel game, chrome, noir tech, neon HUD (8) |
| `motionprompt-handmade-illustrated` | paper cut-out, clay, kawaii, whiteboard, flat vector, watercolour, isometric, wedding (8) |
| `motionprompt-explainer-data` | infographics, data stories, slide decks, maps, property tours (6) |
| `motionprompt-product-brand` | logo stings, product/app showcases, 3D icons, portfolios, photo reels, backgrounds (9) |
| `motionprompt-malaysia-festive` | Raya, Deepavali, CNY, Merdeka, batik, kopitiam, pasar malam, kampung, Borneo, food (11) |

Adding a style: drop `<slug>.md` into the right category skill's `styles/`, add the slug to `categories.json`, run `node scripts/audit.mjs` then `node scripts/catalog.mjs --write`.

## Style catalog

<!-- CATALOG:START -->
| Style | Name | Category skill | Tags | Engine | Diff. | Default | 9:16 4:5 1:1 16:9 | Look |
|-------|------|----------------|------|--------|-------|---------|-------------------|------|
| [app-showcase](../motionprompt-product-brand/styles/app-showcase.md) | App showcase | motionprompt-product-brand | product, 3d | GSAP | 4 | 15s | ++ ++ ++ ++ | A floating 3D phone (or laptop) with app screens sliding like real navigation, UI cards popping out toward... |
| [batik-fashion](../motionprompt-malaysia-festive/styles/batik-fashion.md) | Batik fashion | motionprompt-malaysia-festive | malaysia, product, promo | GSAP | 5 | 15s | ++ ++ ++ + | A colourful batik fashion showcase: brand scene, each look inside a patterned arch, a fabric close-up, and an... |
| [borneo-rainforest](../motionprompt-malaysia-festive/styles/borneo-rainforest.md) | Borneo rainforest | motionprompt-malaysia-festive | travel, background, malaysia | GSAP | 5 | 15s | ++ ++ ++ ++ | A calm cinematic walk into a lush Borneo rainforest at dawn: layered dipterocarp trees, drifting mist and... |
| [chat-story](../motionprompt-typography-social/styles/chat-story.md) | Chat story | motionprompt-typography-social | social, promo, text | GSAP | 3 | 12s | ++ ++ ++ ++ | A phone chat that pops to life: springy message bubbles, typing dots, read ticks, an emoji reaction and a... |
| [chinese-new-year](../motionprompt-malaysia-festive/styles/chinese-new-year.md) | Chinese heritage | motionprompt-malaysia-festive | product, festive, promo | GSAP | 5 | 15s | ++ ++ ++ ++ | A rich red-and-gold traditional Chinese heritage ad or festive card: red paper-cut patterns unfold, lanterns... |
| [claymation](../motionprompt-handmade-illustrated/styles/claymation.md) | Claymation | motionprompt-handmade-illustrated | 3d, handmade, cute | Three.js | 5 | 12s | + ++ ++ ++ | A squishy handmade 3D clay world shot as choppy stop motion at 12 fps: matte lumpy clay pieces squish up, a... |
| [comic-pop-art](../motionprompt-typography-social/styles/comic-pop-art.md) | Comic pop art | motionprompt-typography-social | promo, retro, text | GSAP | 4 | 10s | ++ ++ ++ ++ | A comic book page in pop-art style: bold black outlines, flat colours and Ben-Day halftone dots; three or... |
| [data-story](../motionprompt-explainer-data/styles/data-story.md) | Data story | motionprompt-explainer-data | data, explainer | GSAP | 3 | 12s | ++ ++ ++ ++ | Numbers become an animated infographic: two or three cards, each with one big counting number, a short label... |
| [deepavali](../motionprompt-malaysia-festive/styles/deepavali.md) * | Deepavali | motionprompt-malaysia-festive | festive, malaysia, text | GSAP | 4 | 15s | ++ ++ ++ ++ | A warm festival-of-lights greeting on a deep purple night: a colourful kolam draws itself (dots, white lines... |
| [editorial-portfolio](../motionprompt-product-brand/styles/editorial-portfolio.md) | Editorial portfolio | motionprompt-product-brand | brand, photos, text | GSAP | 5 | 20s | ++ ++ + ++ | A luxury magazine about you on a dark desk: your name as a giant serif cover masthead with your portrait... |
| [elegant-wedding](../motionprompt-handmade-illustrated/styles/elegant-wedding.md) | Elegant wedding | motionprompt-handmade-illustrated | festive, text, handmade | GSAP | 4 | 15s | ++ ++ ++ + | A digital wedding invitation on ivory paper: watercolour roses, peonies and eucalyptus bloom from the... |
| [festive-raya](../motionprompt-malaysia-festive/styles/festive-raya.md) * | Festive Raya | motionprompt-malaysia-festive | festive, malaysia, text | GSAP | 4 | 15s | ++ ++ ++ ++ | A warm Hari Raya greeting at night: gold Islamic geometric patterns draw line by line, ketupat and lanterns... |
| [flat-illustration](../motionprompt-handmade-illustrated/styles/flat-illustration.md) | Flat illustration | motionprompt-handmade-illustrated | explainer, brand, promo | GSAP | 3 | 10s | + ++ ++ ++ | A clean flat vector business scene on solid bright blue: a bold white title, flat illustrated people... |
| [floating-3d-icons](../motionprompt-product-brand/styles/floating-3d-icons.md) | Floating 3D icons | motionprompt-product-brand | 3d, social, promo | Three.js | 5 | 12s | ++ ++ ++ ++ | Glossy, soft "Blender style" 3D icons and cards burst out of a floating monitor (or phone, laptop, product)... |
| [food-menu](../motionprompt-malaysia-festive/styles/food-menu.md) | Food menu | motionprompt-malaysia-festive | food, promo | GSAP | 3 | 12s | ++ ++ ++ + | A top-down flat lay: ingredients drop onto a plate with a bounce, steam curls up, hand-lettered labels with... |
| [glitch](../motionprompt-typography-social/styles/glitch.md) | Glitch | motionprompt-typography-social | text, social | Canvas | 3 | 8s | ++ ++ ++ ++ | Digital glitch type on a near-black screen like a corrupted video signal: one word at a time with hard jump... |
| [infographic](../motionprompt-explainer-data/styles/infographic.md) | Infographic | motionprompt-explainer-data | explainer, data, social | GSAP | 3 | 15s | ++ ++ ++ + | A flat explainer poster bigger than the screen: the camera glides from a title card to numbered steps, a... |
| [isometric-diorama](../motionprompt-handmade-illustrated/styles/isometric-diorama.md) | Isometric diorama | motionprompt-handmade-illustrated | 3d, product, explainer | Three.js | 4 | 10s | + ++ ++ ++ | A cute flat-shaded 3D world on a round grey disc: rounded-block objects that represent your topic pop in one... |
| [kaiju-attack](../motionprompt-retro-cinematic/styles/kaiju-attack.md) | Kaiju attack | motionprompt-retro-cinematic | promo, retro, text | Canvas | 5 | 15s | ++ ++ + ++ | A 1950s low-budget monster movie shot on old film: a giant rubber-suit monster rises over a model city at... |
| [kampung-sunset](../motionprompt-malaysia-festive/styles/kampung-sunset.md) * | Kampung sunset | motionprompt-malaysia-festive | malaysia, background, handmade | GSAP | 4 | 15s | ++ ++ ++ ++ | A warm painterly Malaysian village at golden hour sinking into a firefly dusk: a wooden house on stilts,... |
| [kawaii-pastel](../motionprompt-handmade-illustrated/styles/kawaii-pastel.md) | Kawaii pastel | motionprompt-handmade-illustrated | social, promo, cute | GSAP | 3 | 10s | ++ ++ ++ + | A cute chibi mascot girl waves hello among pastel stickers, hearts and sparkles while her message bounces in... |
| [kinetic-type](../motionprompt-typography-social/styles/kinetic-type.md) | Kinetic typography | motionprompt-typography-social | text, social | GSAP | 2 | 8s | ++ ++ ++ + | Big bold words that punch in on the beat, spin or drop letter by letter, hard-cut between palette colours,... |
| [kopitiam](../motionprompt-malaysia-festive/styles/kopitiam.md) * | Kopitiam | motionprompt-malaysia-festive | food, malaysia, retro | GSAP | 4 | 15s | ++ ++ ++ ++ | A sunny Malaysian kopitiam morning as a cosy flat illustration: a marble table with kopi cup, kaya toast and... |
| [liquid-gradient](../motionprompt-product-brand/styles/liquid-gradient.md) | Liquid gradient | motionprompt-product-brand | background, text | WebGL | 3 | 10s | ++ ++ ++ ++ | Soft colour blobs that drift, stretch and melt into each other under fine film grain, while a clean headline... |
| [logo-spin-3d](../motionprompt-product-brand/styles/logo-spin-3d.md) | 3D logo spin | motionprompt-product-brand | 3d, brand | Three.js | 3 | 6s | ++ ++ ++ ++ | A shiny 3D logo badge that spins one full eased turn, pauses to float and tilt, then spins again, with your... |
| [malaysian-heritage](../motionprompt-malaysia-festive/styles/malaysian-heritage.md) | Malaysian heritage | motionprompt-malaysia-festive | malaysia, festive, text | GSAP | 4 | 15s | ++ ++ ++ ++ | A warm festive Malaysian scene in traditional motifs: wau bulan kites over a kampung sky, batik bunga raya... |
| [map-journey](../motionprompt-explainer-data/styles/map-journey.md) | Map journey | motionprompt-explainer-data | travel, explainer, malaysia | d3-geo | 5 | 15s | ++ ++ ++ ++ | An animated flat travel map on real geography: the route draws itself stop to stop with a plane, car or boat,... |
| [merdeka](../motionprompt-malaysia-festive/styles/merdeka.md) * | Merdeka | motionprompt-malaysia-festive | malaysia, festive, text | GSAP | 4 | 12s | ++ ++ ++ ++ | A proud Malaysian National Day and Malaysia Day celebration at night: the Jalur Gemilang waves over Kuala... |
| [neon-sign](../motionprompt-typography-social/styles/neon-sign.md) | Neon sign | motionprompt-typography-social | text, retro | CSS | 3 | 8s | ++ ++ ++ ++ | Neon tube lettering that stutters on letter by letter over a dark brick wall at night, with a buzzing neon... |
| [neon-tech](../motionprompt-retro-cinematic/styles/neon-tech.md) | Neon tech | motionprompt-retro-cinematic | explainer, brand, promo | GSAP | 5 | 12s | ++ ++ ++ ++ | A bold neon tech title slide that comes alive: HUD rings spin up, circuit traces pulse, an isometric laptop... |
| [nostalgia-90s](../motionprompt-retro-cinematic/styles/nostalgia-90s.md) | Nostalgia 90s | motionprompt-retro-cinematic | retro, malaysia, photos | Canvas | 5 | 15s | ++ ++ ++ ++ | A Malaysian 80s and 90s throwback like a home video on an old tape: a chunky wooden CRT TV switches on to... |
| [paper-cutout](../motionprompt-handmade-illustrated/styles/paper-cutout.md) | Paper cut-out | motionprompt-handmade-illustrated | handmade, background | SVG | 3 | 10s | ++ ++ ++ ++ | A handmade scene of layered cut paper animated as stop motion at 12 fps: chunky hills, sun, clouds and props... |
| [particle-field](../motionprompt-product-brand/styles/particle-field.md) | Particle field | motionprompt-product-brand | background | Canvas | 3 | 10s | ++ ++ ++ ++ | Thousands of tiny glowing dots drifting along smooth invisible currents like smoke or wind, leaving soft... |
| [pasar-malam](../motionprompt-malaysia-festive/styles/pasar-malam.md) * | Pasar malam | motionprompt-malaysia-festive | food, malaysia, promo | GSAP | 5 | 15s | ++ ++ ++ ++ | A lively Malaysian night market at dusk: striped canopy stalls down a long aisle, bulbs switching on from... |
| [photo-slideshow](../motionprompt-product-brand/styles/photo-slideshow.md) | Photo slideshow | motionprompt-product-brand | photos, travel, social | GSAP | 3 | 15s | ++ ++ ++ ++ | The user's photos with slow Ken Burns zooms, bold serif captions rising out of masks with a counter, and... |
| [photo-studio](../motionprompt-product-brand/styles/photo-studio.md) | Photo studio | motionprompt-product-brand | photos, promo, brand | Canvas | 5 | 15s | ++ ++ ++ ++ | Through a camera viewfinder: focus hunts and locks, the shutter fires, each shot prints as a white-bordered... |
| [pixel-art](../motionprompt-retro-cinematic/styles/pixel-art.md) | Pixel art | motionprompt-retro-cinematic | retro, promo, product | Canvas | 5 | 15s | + ++ ++ ++ | Your offer as a retro pixel game level: a PLAYER 1 character-select card with stat bars, a side-scrolling... |
| [podcast-audiogram](../motionprompt-typography-social/styles/podcast-audiogram.md) | Podcast audiogram | motionprompt-typography-social | social, text | GSAP | 4 | 15s | ++ ++ ++ ++ | A podcast or interview clip card: a round speaker portrait with a pulsing ring, live sound bars, big karaoke... |
| [product-turntable](../motionprompt-product-brand/styles/product-turntable.md) | Product turntable | motionprompt-product-brand | product, 3d, promo | Three.js | 5 | 12s | ++ ++ ++ ++ | A premium 3D product shot: your product turns slowly on a studio pedestal with soft warm light, a glint... |
| [property-tour](../motionprompt-explainer-data/styles/property-tour.md) | Property tour | motionprompt-explainer-data | 3d, product, explainer | Three.js | 5 | 15s | ++ ++ ++ ++ | A 3D floor plan builds itself from above at a three-quarter angle: floor slab, walls rising room by room,... |
| [radial-infographic](../motionprompt-explainer-data/styles/radial-infographic.md) | Radial infographic | motionprompt-explainer-data | explainer, brand, data | GSAP | 4 | 15s | ++ + + ++ | A rainbow cycle wheel that snaps together blade by blade around your logo or main idea, with numbered points,... |
| [retro-synthwave](../motionprompt-retro-cinematic/styles/retro-synthwave.md) | Retro synthwave | motionprompt-retro-cinematic | retro, background | Canvas | 3 | 8s | ++ ++ ++ ++ | An 80s outrun night scene: a neon grid scrolling toward you, a striped setting sun, wireframe mountains,... |
| [sale-countdown](../motionprompt-typography-social/styles/sale-countdown.md) | Sale countdown | motionprompt-typography-social | promo, social | GSAP | 3 | 8s | ++ ++ ++ ++ | Loud promo energy: diagonal stripes, a punchy 3-2-1 countdown with colour cuts, the offer slamming in as huge... |
| [slide-deck](../motionprompt-explainer-data/styles/slide-deck.md) | Slide deck | motionprompt-explainer-data | brand, explainer, product | GSAP | 4 | 15s | ~ + + ++ | A presentation template shown as a mockup: about ten slides spread on a tilted light-grey table, the camera... |
| [swiss-geometric](../motionprompt-typography-social/styles/swiss-geometric.md) | Swiss geometric | motionprompt-typography-social | brand, promo, text | GSAP | 3 | 12s | ++ ++ ++ ++ | A bold Swiss-style poster in motion: flat geometric shapes on a strict visible grid slide, turn in quarter... |
| [tech-noir](../motionprompt-retro-cinematic/styles/tech-noir.md) | Tech noir | motionprompt-retro-cinematic | 3d, explainer, product | Canvas | 5 | 15s | + + + ++ | A dark cinematic tech film: a dotted globe with glowing arcs, thin isometric line-art devices joined by a... |
| [vintage-archive](../motionprompt-retro-cinematic/styles/vintage-archive.md) | Vintage archive | motionprompt-retro-cinematic | photos, retro, brand | GSAP | 5 | 15s | ++ ++ ++ ++ | An old documentary reel found in a family archive: aged paper, heavy film grain, sepia photos with deckled... |
| [watercolour-ink](../motionprompt-handmade-illustrated/styles/watercolour-ink.md) | Watercolour ink | motionprompt-handmade-illustrated | handmade, text, brand | WebGL | 5 | 12s | ++ ++ ++ ++ | Calm artistic watercolour on cold-press paper: washes bloom and bleed with wet edges and dry darker rims, an... |
| [whiteboard-sketch](../motionprompt-handmade-illustrated/styles/whiteboard-sketch.md) | Whiteboard sketch | motionprompt-handmade-illustrated | explainer, handmade | GSAP | 3 | 15s | ++ ++ ++ ++ | Marker doodles and handwriting draw themselves on a warm whiteboard, explainer style: a headline, a few steps... |
| [y2k-chrome](../motionprompt-retro-cinematic/styles/y2k-chrome.md) | Y2K chrome | motionprompt-retro-cinematic | 3d, retro, brand | Three.js | 5 | 10s | ++ ++ ++ ++ | A late-90s/early-2000s liquid chrome look on a pastel-to-silver gradient: a shiny 3D chrome blob that slowly... |

`*` = hidden on the website but fully supported here. Diff. = build difficulty 1 to 5. `++` great, `+` good, `~` ok fit for that ratio.
<!-- CATALOG:END -->

## Files

| Path | Use |
|------|-----|
| `styles/<slug>.md` | One per style: inputs, directive map (mirrors every bullet of the original prompt), tokens, fonts, beats, cues, music, recipe, layout by ratio, loop, guardrails, QA. **Read fully before building.** |
| `rules/pipeline.md` | End-to-end procedure and commands, project layout |
| `rules/settings.md` | Ratios, sizes, lengths, sound modes, safe areas, draft vs final |
| `rules/style-picker.md` | Choosing and combining styles, asking for missing inputs |
| `rules/seekable-canvas.md` | Determinism: hf-seek, stateless particles, seeded RNG, stepped time, Three/WebGL, loops |
| `rules/layout-and-text.md` | Fitting text, safe zones, contrast, language, brand colour mapping |
| `rules/fonts.md` | Vendoring fonts, lint rules, font table |
| `rules/motion-craft.md` | Easing, springs, stagger, camera, holds, beat sync, flash safety |
| `rules/sound-design.md` | Synth CLI, cue schema, all sound kinds, music presets, effect vocabulary |
| `rules/malaysian-styles.md` | Cultural accuracy for the Malaysian styles (flag, wau, batik, Raya, Deepavali, CNY, ...) |
| `rules/qa-checklist.md` | Every gate before delivering |
| `rules/troubleshooting.md` | Known failures and fixes |
| `scripts/scaffold.mjs` `prompt.mjs` `synth.mjs` `fonts.mjs` `frames.mjs` `compare.mjs` `audio-report.mjs` `audit.mjs` `smoke-all.mjs` | Tools (all Node, no dependencies) |
| `templates/base/` | Composition skeleton and the `MP` helper kit (`lib/mp.js`) |
| `examples/kinetic-type/` | A finished, rendered, compared build to copy structure from |
| `ATTRIBUTION.md` | Source and licence caveat |

## Non-negotiables (learned the hard way)

- **Determinism**: no `Date.now`, `performance.now`, unseeded `Math.random`, `requestAnimationFrame`, network at render time, or `repeat: -1`. Canvas/WebGL/Three redraw in `hf-seek` (`MP.onSeek`). Build the GSAP timeline after `MP.fontsReady(...)` and register `window.__timelines["main"]` last.
- **Fonts**: every named family needs an `@font-face` to a local file (scaffold does it). **Never list a named fallback font** (`Impact`, `Arial`): lint rejects it; use only `sans-serif`/`serif`/`monospace` as fallbacks.
- **Audio**: `<audio id="mix" ...>` needs an `id` or the render is silent. Music tempo comes from `timing.mjs`; do not retime visuals without regenerating sound (`npm run sound`).
- **One style, one recipe**: keep the style's guardrails (never flash, no vocals, no real landmarks, never invent data). If the user asks for something the style forbids, say so and adapt.
- **RAM**: render with `-w 1` on this machine; one render at a time.
- **Cultural accuracy** for Malaysian styles: `rules/malaysian-styles.md` (flag geometry, wau bulan anatomy, no Quranic text or people in Raya, no deities in Deepavali).
- Never copy or publish the original prompt text or the site's demo code (the upstream repo has no licence): this skill contains its own restructured work, see `ATTRIBUTION.md`.
