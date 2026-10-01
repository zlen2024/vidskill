---
name: motionprompt-explainer-data
description: |
  Trigger when the user wants a short video (5-30 s) in one of these looks: Infographic, Radial infographic, Data story, Slide deck, Map journey, Property tour. Category: Explainer & data, numbers, infographics, slide decks, maps and property tours that explain something. Each style is a tested HyperFrames (HTML to MP4) build recipe with design tokens, fonts, a beat sheet, a synthesised sound cue sheet and QA checks. Engine, scaffold and shared rules live in the sibling skill `motionprompt-styles`: load it (and /hyperframes) first. NOT for Manim maths scenes (manimce-best-practices), not for editing footage.
---

# Explainer & data (MotionPrompt category)

Part of the MotionPrompt family. **Workflow, scaffold, sound synthesiser, QA rules and every script are in `../motionprompt-styles/`**: read its `SKILL.md` first (and `/hyperframes`, `/hyperframes-core`), then use a style file from this folder.

```bash
S=.claude/skills/motionprompt-styles
node $S/scripts/scaffold.mjs <style> --out videos/NN_slug --ratio 9:16 --duration <default> --sound music --text "Line one|Line two"
# build index.html from styles/<style>.md (this folder), then:  npm run check && npm run draft
```

## Which style here?
- **Infographic** (`infographic`): how-to steps, tips, a stat with context, an old-way versus new-way comparison, anything people save and share. Avoid: you have no facts to show (never invent numbers) or you need photos or 3D.
- **Radial infographic** (`radial-infographic`): a framework, a process, a cycle, "our 6 pillars", a business slide that comes to life. Avoid: you have fewer than 4 or more than 8 points, or points that are long paragraphs. Ask the user for the points if they are missing.
- **Data story** (`data-story`): results, KPIs, survey findings, sales or growth numbers, an annual summary. Avoid: there are no numbers (ask the user for them: never invent data) or you need decoration and 3D.
- **Slide deck** (`slide-deck`): a company introduction, a pitch summary, quarterly numbers, a portfolio, a deck teaser. Avoid: the content is one message (use `kinetic-type`) or must be readable as a real deck (this is a teaser, not the deck).
- **Map journey** (`map-journey`): a trip itinerary (for example Kuala Lumpur to Penang to Kota Kinabalu), a tour, a delivery or shipping route, branch locations, a "where we work" story. Avoid: you have fewer than 2 places, or need satellite imagery or 3D terrain.
- **Property tour** (`property-tour`): property listings, show units, developers' launches, interior and renovation stories. Avoid: you have no layout or room sizes: ask for them or a floor plan image.

## Styles in this category

<!-- CATALOG:START -->
| Style | Name | Tags | Engine | Diff. | Default | 9:16 4:5 1:1 16:9 | Look |
|-------|------|------|--------|-------|---------|-------------------|------|
| [infographic](styles/infographic.md) | Infographic | explainer, data, social | GSAP | 3 | 15s | ++ ++ ++ + | A flat explainer poster bigger than the screen: the camera glides from a title card to numbered steps, a... |
| [radial-infographic](styles/radial-infographic.md) | Radial infographic | explainer, brand, data | GSAP | 4 | 15s | ++ + + ++ | A rainbow cycle wheel that snaps together blade by blade around your logo or main idea, with numbered points,... |
| [data-story](styles/data-story.md) | Data story | data, explainer | GSAP | 3 | 12s | ++ ++ ++ ++ | Numbers become an animated infographic: two or three cards, each with one big counting number, a short label... |
| [slide-deck](styles/slide-deck.md) | Slide deck | brand, explainer, product | GSAP | 4 | 15s | ~ + + ++ | A presentation template shown as a mockup: about ten slides spread on a tilted light-grey table, the camera... |
| [map-journey](styles/map-journey.md) | Map journey | travel, explainer, malaysia | d3-geo | 5 | 15s | ++ ++ ++ ++ | An animated flat travel map on real geography: the route draws itself stop to stop with a plane, car or boat,... |
| [property-tour](styles/property-tour.md) | Property tour | 3d, product, explainer | Three.js | 5 | 15s | ++ ++ ++ ++ | A 3D floor plan builds itself from above at a three-quarter angle: floor slab, walls rising room by room,... |

`*` = hidden on the website but fully supported here. Diff. = build difficulty 1 to 5. `++` great, `+` good, `~` ok fit for that ratio.
<!-- CATALOG:END -->

Reply in the user's language (Bahasa Melayu users get Malay). Never invent facts, prices or claims; state honestly what was verified (sound is checked by levels and spectrogram, not by ear).
