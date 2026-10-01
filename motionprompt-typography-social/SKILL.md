---
name: motionprompt-typography-social
description: |
  Trigger when the user wants a short video (5-30 s) in one of these looks: Kinetic typography, Glitch, Neon sign, Chat story, Podcast audiogram, Sale countdown, Comic pop art, Swiss geometric. Category: Typography & social, text-led clips for hooks, quotes, announcements, chats, podcasts, sale promos and bold poster-style titles. Each style is a tested HyperFrames (HTML to MP4) build recipe with design tokens, fonts, a beat sheet, a synthesised sound cue sheet and QA checks. Engine, scaffold and shared rules live in the sibling skill `motionprompt-styles`: load it (and /hyperframes) first. NOT for Manim maths scenes (manimce-best-practices), not for editing footage.
---

# Typography & social (MotionPrompt category)

Part of the MotionPrompt family. **Workflow, scaffold, sound synthesiser, QA rules and every script are in `../motionprompt-styles/`**: read its `SKILL.md` first (and `/hyperframes`, `/hyperframes-core`), then use a style file from this folder.

```bash
S=.claude/skills/motionprompt-styles
node $S/scripts/scaffold.mjs <style> --out videos/NN_slug --ratio 9:16 --duration <default> --sound music --text "Line one|Line two"
# build index.html from styles/<style>.md (this folder), then:  npm run check && npm run draft
```

## Which style here?
- **Kinetic typography** (`kinetic-type`): a slogan, a hook, an announcement, a quote, a list of 3 to 8 short claims. Text is the whole show. Avoid: the user needs images, products, diagrams or long sentences. Use `slide-deck`, `infographic` or `product-turntable` instead.
- **Glitch** (`glitch`): tech and gaming hooks, teasers, launches with an edge, cyber or hacker themes. Avoid: a warm, friendly or elegant tone is needed.
- **Neon sign** (`neon-sign`): a shop, bar or cafe name, an opening, a short slogan, a retro or nightlife greeting. One to three lines of text. Avoid: the text is long or the tone is corporate.
- **Chat story** (`chat-story`): testimonials, customer conversations, product Q&A, offers told as a DM thread, storytelling hooks. Avoid: long text or dense information; the chat must stay short and easy to read.
- **Podcast audiogram** (`podcast-audiogram`): podcast promos, interview quotes, a talk snippet, a voice-note quote card. Avoid: there is no transcript or quote (ask for it). Never make up a voice or speech.
- **Sale countdown** (`sale-countdown`): sales, flash deals, product launches, limited-time offers, event ticket promos. Avoid: the offer, price or date is unknown (ask for them); do not invent a discount.
- **Comic pop art** (`comic-pop-art`): product reveals, promos, hooks with a problem and answer, playful launches. Avoid: the tone is calm or serious.
- **Swiss geometric** (`swiss-geometric`): design and motion studios, agencies, consultants, service menus, a brand introduction. Avoid: you want playful bounce or gradients; this style is exact and restrained.

## Styles in this category

<!-- CATALOG:START -->
| Style | Name | Tags | Engine | Diff. | Default | 9:16 4:5 1:1 16:9 | Look |
|-------|------|------|--------|-------|---------|-------------------|------|
| [kinetic-type](styles/kinetic-type.md) | Kinetic typography | text, social | GSAP | 2 | 8s | ++ ++ ++ + | Big bold words that punch in on the beat, spin or drop letter by letter, hard-cut between palette colours,... |
| [glitch](styles/glitch.md) | Glitch | text, social | Canvas | 3 | 8s | ++ ++ ++ ++ | Digital glitch type on a near-black screen like a corrupted video signal: one word at a time with hard jump... |
| [neon-sign](styles/neon-sign.md) | Neon sign | text, retro | CSS | 3 | 8s | ++ ++ ++ ++ | Neon tube lettering that stutters on letter by letter over a dark brick wall at night, with a buzzing neon... |
| [chat-story](styles/chat-story.md) | Chat story | social, promo, text | GSAP | 3 | 12s | ++ ++ ++ ++ | A phone chat that pops to life: springy message bubbles, typing dots, read ticks, an emoji reaction and a... |
| [podcast-audiogram](styles/podcast-audiogram.md) | Podcast audiogram | social, text | GSAP | 4 | 15s | ++ ++ ++ ++ | A podcast or interview clip card: a round speaker portrait with a pulsing ring, live sound bars, big karaoke... |
| [sale-countdown](styles/sale-countdown.md) | Sale countdown | promo, social | GSAP | 3 | 8s | ++ ++ ++ ++ | Loud promo energy: diagonal stripes, a punchy 3-2-1 countdown with colour cuts, the offer slamming in as huge... |
| [comic-pop-art](styles/comic-pop-art.md) | Comic pop art | promo, retro, text | GSAP | 4 | 10s | ++ ++ ++ ++ | A comic book page in pop-art style: bold black outlines, flat colours and Ben-Day halftone dots; three or... |
| [swiss-geometric](styles/swiss-geometric.md) | Swiss geometric | brand, promo, text | GSAP | 3 | 12s | ++ ++ ++ ++ | A bold Swiss-style poster in motion: flat geometric shapes on a strict visible grid slide, turn in quarter... |

`*` = hidden on the website but fully supported here. Diff. = build difficulty 1 to 5. `++` great, `+` good, `~` ok fit for that ratio.
<!-- CATALOG:END -->

Reply in the user's language (Bahasa Melayu users get Malay). Never invent facts, prices or claims; state honestly what was verified (sound is checked by levels and spectrogram, not by ear).
