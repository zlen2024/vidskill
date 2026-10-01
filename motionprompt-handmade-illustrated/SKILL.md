---
name: motionprompt-handmade-illustrated
description: |
  Trigger when the user wants a short video (5-30 s) in one of these looks: Paper cut-out, Claymation, Kawaii pastel, Whiteboard sketch, Flat illustration, Watercolour ink, Isometric diorama, Elegant wedding. Category: Handmade & illustrated, crafted and drawn worlds: paper cut-out, clay, kawaii, whiteboard doodles, flat vector, watercolour, isometric dioramas, wedding invitations. Each style is a tested HyperFrames (HTML to MP4) build recipe with design tokens, fonts, a beat sheet, a synthesised sound cue sheet and QA checks. Engine, scaffold and shared rules live in the sibling skill `motionprompt-styles`: load it (and /hyperframes) first. NOT for Manim maths scenes (manimce-best-practices), not for editing footage.
---

# Handmade & illustrated (MotionPrompt category)

Part of the MotionPrompt family. **Workflow, scaffold, sound synthesiser, QA rules and every script are in `../motionprompt-styles/`**: read its `SKILL.md` first (and `/hyperframes`, `/hyperframes-core`), then use a style file from this folder.

```bash
S=.claude/skills/motionprompt-styles
node $S/scripts/scaffold.mjs <style> --out videos/NN_slug --ratio 9:16 --duration <default> --sound music --text "Line one|Line two"
# build index.html from styles/<style>.md (this folder), then:  npm run check && npm run draft
```

## Which style here?
- **Paper cut-out** (`paper-cutout`): friendly and handmade brands, kids and family, eco and nature topics, events, simple story scenes. Avoid: you need a sleek or realistic look.
- **Claymation** (`claymation`): friendly and handmade brands, kids, cafes and bakeries, craft, playful announcements. Avoid: you need a corporate, sleek or realistic look.
- **Kawaii pastel** (`kawaii-pastel`): cute or wholesome brands, greetings, giveaways, kids and lifestyle posts, friendly announcements. Avoid: the brand is serious or corporate. Keep her wholesome and original (never a copy of a known character); if the user supplies their own mascot use it.
- **Whiteboard sketch** (`whiteboard-sketch`): how-to explainers, processes, ideas, tips, a friendly overview of a service. Avoid: you need polished corporate visuals or dense data.
- **Flat illustration** (`flat-illustration`): business explainers, "what we do", service or team intros, milestones, promos with a friendly professional tone. Avoid: you need photos, 3D or a data-heavy chart (use `data-story`).
- **Watercolour ink** (`watercolour-ink`): tea, art, wellness, boutique or cultural brands, quiet statements, an East-Asian inspired look. Avoid: you need fast energy or hard graphic shapes.
- **Isometric diorama** (`isometric-diorama`): a product or app showcase, "how it works", a service concept, an invoicing/finance/food/education topic. Avoid: you need real screenshots as the hero (use `app-showcase`) or lots of text.
- **Elegant wedding** (`elegant-wedding`): wedding and engagement invitations, Walimatul Urus and akad cards, anniversaries, formal event invitations. Avoid: the tone should be fast, funny or modern.

## Styles in this category

<!-- CATALOG:START -->
| Style | Name | Tags | Engine | Diff. | Default | 9:16 4:5 1:1 16:9 | Look |
|-------|------|------|--------|-------|---------|-------------------|------|
| [paper-cutout](styles/paper-cutout.md) | Paper cut-out | handmade, background | SVG | 3 | 10s | ++ ++ ++ ++ | A handmade scene of layered cut paper animated as stop motion at 12 fps: chunky hills, sun, clouds and props... |
| [claymation](styles/claymation.md) | Claymation | 3d, handmade, cute | Three.js | 5 | 12s | + ++ ++ ++ | A squishy handmade 3D clay world shot as choppy stop motion at 12 fps: matte lumpy clay pieces squish up, a... |
| [kawaii-pastel](styles/kawaii-pastel.md) | Kawaii pastel | social, promo, cute | GSAP | 3 | 10s | ++ ++ ++ + | A cute chibi mascot girl waves hello among pastel stickers, hearts and sparkles while her message bounces in... |
| [whiteboard-sketch](styles/whiteboard-sketch.md) | Whiteboard sketch | explainer, handmade | GSAP | 3 | 15s | ++ ++ ++ ++ | Marker doodles and handwriting draw themselves on a warm whiteboard, explainer style: a headline, a few steps... |
| [flat-illustration](styles/flat-illustration.md) | Flat illustration | explainer, brand, promo | GSAP | 3 | 10s | + ++ ++ ++ | A clean flat vector business scene on solid bright blue: a bold white title, flat illustrated people... |
| [watercolour-ink](styles/watercolour-ink.md) | Watercolour ink | handmade, text, brand | WebGL | 5 | 12s | ++ ++ ++ ++ | Calm artistic watercolour on cold-press paper: washes bloom and bleed with wet edges and dry darker rims, an... |
| [isometric-diorama](styles/isometric-diorama.md) | Isometric diorama | 3d, product, explainer | Three.js | 4 | 10s | + ++ ++ ++ | A cute flat-shaded 3D world on a round grey disc: rounded-block objects that represent your topic pop in one... |
| [elegant-wedding](styles/elegant-wedding.md) | Elegant wedding | festive, text, handmade | GSAP | 4 | 15s | ++ ++ ++ + | A digital wedding invitation on ivory paper: watercolour roses, peonies and eucalyptus bloom from the... |

`*` = hidden on the website but fully supported here. Diff. = build difficulty 1 to 5. `++` great, `+` good, `~` ok fit for that ratio.
<!-- CATALOG:END -->

Reply in the user's language (Bahasa Melayu users get Malay). Never invent facts, prices or claims; state honestly what was verified (sound is checked by levels and spectrogram, not by ear).
