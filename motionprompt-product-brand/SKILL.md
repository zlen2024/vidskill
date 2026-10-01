---
name: motionprompt-product-brand
description: |
  Trigger when the user wants a short video (5-30 s) in one of these looks: 3D logo spin, Product turntable, App showcase, Floating 3D icons, Editorial portfolio, Photo studio, Photo slideshow, Liquid gradient, Particle field. Category: Product, brand & backgrounds, logo stings, product and app showcases, 3D icons, portfolios, photo reels and abstract looping backgrounds. Each style is a tested HyperFrames (HTML to MP4) build recipe with design tokens, fonts, a beat sheet, a synthesised sound cue sheet and QA checks. Engine, scaffold and shared rules live in the sibling skill `motionprompt-styles`: load it (and /hyperframes) first. NOT for Manim maths scenes (manimce-best-practices), not for editing footage.
---

# Product, brand & backgrounds (MotionPrompt category)

Part of the MotionPrompt family. **Workflow, scaffold, sound synthesiser, QA rules and every script are in `../motionprompt-styles/`**: read its `SKILL.md` first (and `/hyperframes`, `/hyperframes-core`), then use a style file from this folder.

```bash
S=.claude/skills/motionprompt-styles
node $S/scripts/scaffold.mjs <style> --out videos/NN_slug --ratio 9:16 --duration <default> --sound music --text "Line one|Line two"
# build index.html from styles/<style>.md (this folder), then:  npm run check && npm run draft
```

## Which style here?
- **3D logo spin** (`logo-spin-3d`): video intros and outros (about 5 to 8 s), a brand sting, an app or channel opener. Avoid: the logo has fine text or photographic detail that cannot extrude well, or you need a longer explanation.
- **Product turntable** (`product-turntable`): bottles, perfumes, skincare, coffee, gadgets, packaged goods, a luxury-style ad. Avoid: the product cannot be approximated as a simple 3D shape and no photo is available to match its shape, colour and label.
- **App showcase** (`app-showcase`): an app or SaaS launch, a feature teaser, a product tour. Avoid: there is no product UI to show or you need a fast, loud tone.
- **Floating 3D icons** (`floating-3d-icons`): creator and social-media services, cafes and shops (coffee cup, cake, map pin, star rating), app features, playful launches. Avoid: the tone is serious; you need real photos.
- **Editorial portfolio** (`editorial-portfolio`): designers, photographers, architects, illustrators, freelancers, creative studios. Avoid: you have no portrait or project images and do not want stand-ins.
- **Photo studio** (`photo-studio`): photographers, studios, wedding and event services, portrait and product photography promos. Avoid: there are no photo services to promote.
- **Photo slideshow** (`photo-slideshow`): a travel recap, property or venue tour, event highlights, a portfolio, a product lookbook. Avoid: the user has no photos and does not want placeholders.
- **Liquid gradient** (`liquid-gradient`): a product-launch statement, a calm brand message, a quote, an ambient loop under text. Two or three short lines total. Avoid: you need lots of information or strong contrast between objects.
- **Particle field** (`particle-field`): backgrounds for text, wellness and meditation, tech and music ambience, loops that should feel endless. Avoid: you need objects, storytelling or structured information.

## Styles in this category

<!-- CATALOG:START -->
| Style | Name | Tags | Engine | Diff. | Default | 9:16 4:5 1:1 16:9 | Look |
|-------|------|------|--------|-------|---------|-------------------|------|
| [logo-spin-3d](styles/logo-spin-3d.md) | 3D logo spin | 3d, brand | Three.js | 3 | 6s | ++ ++ ++ ++ | A shiny 3D logo badge that spins one full eased turn, pauses to float and tilt, then spins again, with your... |
| [product-turntable](styles/product-turntable.md) | Product turntable | product, 3d, promo | Three.js | 5 | 12s | ++ ++ ++ ++ | A premium 3D product shot: your product turns slowly on a studio pedestal with soft warm light, a glint... |
| [app-showcase](styles/app-showcase.md) | App showcase | product, 3d | GSAP | 4 | 15s | ++ ++ ++ ++ | A floating 3D phone (or laptop) with app screens sliding like real navigation, UI cards popping out toward... |
| [floating-3d-icons](styles/floating-3d-icons.md) | Floating 3D icons | 3d, social, promo | Three.js | 5 | 12s | ++ ++ ++ ++ | Glossy, soft "Blender style" 3D icons and cards burst out of a floating monitor (or phone, laptop, product)... |
| [editorial-portfolio](styles/editorial-portfolio.md) | Editorial portfolio | brand, photos, text | GSAP | 5 | 20s | ++ ++ + ++ | A luxury magazine about you on a dark desk: your name as a giant serif cover masthead with your portrait... |
| [photo-studio](styles/photo-studio.md) | Photo studio | photos, promo, brand | Canvas | 5 | 15s | ++ ++ ++ ++ | Through a camera viewfinder: focus hunts and locks, the shutter fires, each shot prints as a white-bordered... |
| [photo-slideshow](styles/photo-slideshow.md) | Photo slideshow | photos, travel, social | GSAP | 3 | 15s | ++ ++ ++ ++ | The user's photos with slow Ken Burns zooms, bold serif captions rising out of masks with a counter, and... |
| [liquid-gradient](styles/liquid-gradient.md) | Liquid gradient | background, text | WebGL | 3 | 10s | ++ ++ ++ ++ | Soft colour blobs that drift, stretch and melt into each other under fine film grain, while a clean headline... |
| [particle-field](styles/particle-field.md) | Particle field | background | Canvas | 3 | 10s | ++ ++ ++ ++ | Thousands of tiny glowing dots drifting along smooth invisible currents like smoke or wind, leaving soft... |

`*` = hidden on the website but fully supported here. Diff. = build difficulty 1 to 5. `++` great, `+` good, `~` ok fit for that ratio.
<!-- CATALOG:END -->

Reply in the user's language (Bahasa Melayu users get Malay). Never invent facts, prices or claims; state honestly what was verified (sound is checked by levels and spectrogram, not by ear).
