---
name: motionprompt-malaysia-festive
description: |
  Trigger when the user wants a short video (5-30 s) in one of these looks: Batik fashion, Borneo rainforest, Chinese heritage, Deepavali, Festive Raya, Kampung sunset, Kopitiam, Malaysian heritage, Merdeka, Pasar malam, Food menu. Category: Malaysia & festive, Malaysian culture and festivals: Raya, Deepavali, Chinese New Year, Merdeka, batik, kopitiam, pasar malam, kampung, Borneo, food menus. Each style is a tested HyperFrames (HTML to MP4) build recipe with design tokens, fonts, a beat sheet, a synthesised sound cue sheet and QA checks. Engine, scaffold and shared rules live in the sibling skill `motionprompt-styles`: load it (and /hyperframes) first. NOT for Manim maths scenes (manimce-best-practices), not for editing footage.
---

# Malaysia & festive (MotionPrompt category)

Part of the MotionPrompt family. **Workflow, scaffold, sound synthesiser, QA rules and every script are in `../motionprompt-styles/`**: read its `SKILL.md` first (and `/hyperframes`, `/hyperframes-core`), then use a style file from this folder.

```bash
S=.claude/skills/motionprompt-styles
node $S/scripts/scaffold.mjs <style> --out videos/NN_slug --ratio 9:16 --duration <default> --sound music --text "Line one|Line two"
# build index.html from styles/<style>.md (this folder), then:  npm run check && npm run draft
```

## Which style here?
- **Batik fashion** (`batik-fashion`): baju kurung, kebaya, modest fashion, batik brands, a Raya collection, an online boutique. Avoid: there is no clothing to show or the tone should be minimal.
- **Borneo rainforest** (`borneo-rainforest`): Borneo and Sabah/Sarawak tourism, eco-lodges, nature and conservation brands, a calm cinematic opener. Avoid: you need a busy or high-energy piece. Nothing flashes or jumps.
- **Chinese heritage** (`chinese-new-year`): Chinese New Year greetings, tea, herbal, drink, food or cosmetics products with a heritage look, festive promos. Avoid: the tone must be modern minimal. Keep claims gentle and honest.
- **Deepavali** (`deepavali`): Deepavali greetings, festive brand wishes, community and family messages. Avoid: the message needs deities or people; keep it cultural and festive. See `rules/malaysian-styles.md`. Hidden on the site but fully supported.
- **Festive Raya** (`festive-raya`): Selamat Hari Raya greetings, festive brand wishes, family and community messages. Avoid: the message needs people, religious text or a non-festive tone. See `rules/malaysian-styles.md`. Hidden on the site but fully supported.
- **Kampung sunset** (`kampung-sunset`): nostalgic or homecoming messages (balik kampung), Raya greetings, a warm brand mood, a calm loop. Avoid: the mood must be urban or high energy.
- **Kopitiam** (`kopitiam`): kopitiam and cafe promos, a breakfast set, a menu, a Malaysian morning mood. Hidden on the site but fully supported. Avoid: you need a modern or minimal look.
- **Malaysian heritage** (`malaysian-heritage`): greetings and brand messages for Hari Raya, Merdeka, Malaysia Day, Gawai/Kaamatan-neutral local occasions, a Malaysian brand. Avoid: the occasion needs strictly religious content (this style is cultural, not devotional), or a modern minimal tone. See `rules/malaysian-styles.md` for cultural accuracy.
- **Merdeka** (`merdeka`): 31 August (Hari Merdeka) and 16 September (Hari Malaysia) greetings, national-pride brand posts. Avoid: the message is not about Malaysia's national celebrations. Draw the flag accurately (see recipe) and never alter its colours. See `rules/malaysian-styles.md`.
- **Pasar malam** (`pasar-malam`): street-food and stall promos, bazaar and festival announcements, menu highlights, a Ramadan bazaar mood. Avoid: you need a clean minimal look or an indoor restaurant.
- **Food menu** (`food-menu`): a dish launch, a menu item, a daily special, a recipe teaser. Avoid: you need real food photography as the hero (attach a photo and match its colours instead) or a multi-dish catalogue.

## Styles in this category

<!-- CATALOG:START -->
| Style | Name | Tags | Engine | Diff. | Default | 9:16 4:5 1:1 16:9 | Look |
|-------|------|------|--------|-------|---------|-------------------|------|
| [batik-fashion](styles/batik-fashion.md) | Batik fashion | malaysia, product, promo | GSAP | 5 | 15s | ++ ++ ++ + | A colourful batik fashion showcase: brand scene, each look inside a patterned arch, a fabric close-up, and an... |
| [borneo-rainforest](styles/borneo-rainforest.md) | Borneo rainforest | travel, background, malaysia | GSAP | 5 | 15s | ++ ++ ++ ++ | A calm cinematic walk into a lush Borneo rainforest at dawn: layered dipterocarp trees, drifting mist and... |
| [chinese-new-year](styles/chinese-new-year.md) | Chinese heritage | product, festive, promo | GSAP | 5 | 15s | ++ ++ ++ ++ | A rich red-and-gold traditional Chinese heritage ad or festive card: red paper-cut patterns unfold, lanterns... |
| [deepavali](styles/deepavali.md) * | Deepavali | festive, malaysia, text | GSAP | 4 | 15s | ++ ++ ++ ++ | A warm festival-of-lights greeting on a deep purple night: a colourful kolam draws itself (dots, white lines... |
| [festive-raya](styles/festive-raya.md) * | Festive Raya | festive, malaysia, text | GSAP | 4 | 15s | ++ ++ ++ ++ | A warm Hari Raya greeting at night: gold Islamic geometric patterns draw line by line, ketupat and lanterns... |
| [kampung-sunset](styles/kampung-sunset.md) * | Kampung sunset | malaysia, background, handmade | GSAP | 4 | 15s | ++ ++ ++ ++ | A warm painterly Malaysian village at golden hour sinking into a firefly dusk: a wooden house on stilts,... |
| [kopitiam](styles/kopitiam.md) * | Kopitiam | food, malaysia, retro | GSAP | 4 | 15s | ++ ++ ++ ++ | A sunny Malaysian kopitiam morning as a cosy flat illustration: a marble table with kopi cup, kaya toast and... |
| [malaysian-heritage](styles/malaysian-heritage.md) | Malaysian heritage | malaysia, festive, text | GSAP | 4 | 15s | ++ ++ ++ ++ | A warm festive Malaysian scene in traditional motifs: wau bulan kites over a kampung sky, batik bunga raya... |
| [merdeka](styles/merdeka.md) * | Merdeka | malaysia, festive, text | GSAP | 4 | 12s | ++ ++ ++ ++ | A proud Malaysian National Day and Malaysia Day celebration at night: the Jalur Gemilang waves over Kuala... |
| [pasar-malam](styles/pasar-malam.md) * | Pasar malam | food, malaysia, promo | GSAP | 5 | 15s | ++ ++ ++ ++ | A lively Malaysian night market at dusk: striped canopy stalls down a long aisle, bulbs switching on from... |
| [food-menu](styles/food-menu.md) | Food menu | food, promo | GSAP | 3 | 12s | ++ ++ ++ + | A top-down flat lay: ingredients drop onto a plate with a bounce, steam curls up, hand-lettered labels with... |

`*` = hidden on the website but fully supported here. Diff. = build difficulty 1 to 5. `++` great, `+` good, `~` ok fit for that ratio.
<!-- CATALOG:END -->

Reply in the user's language (Bahasa Melayu users get Malay). Never invent facts, prices or claims; state honestly what was verified (sound is checked by levels and spectrogram, not by ear).
