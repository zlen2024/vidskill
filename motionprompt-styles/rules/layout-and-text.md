---
name: layout-and-text
description: Fitting text to any ratio, safe areas, contrast, short lines, language (Malay/English), brand colour mapping, stacked words and handling long or missing text
metadata:
  tags: layout, text, fit, safe-area, contrast, language, brand
---

# Layout and text

## Principles from the originals

- **Every line is short and readable in about a second.** Headlines 1 to 5 words, captions 3 to 6, labels 1 to 3. If the user's text is longer, split it across beats or shorten and tell them.
- **Only the user's content.** Never add facts, numbers, prices, dates, testimonials. If a number is needed and missing, ask.
- **Keep text clear of decoration and platform UI** (`--safe-t --safe-b --safe-x`). Overshoot during a punch-in may leave the frame; the settled state must not.

## Fit text, do not guess sizes

```js
await MP.fontsReady(['400 40px "Anton"']);
const one = MP.fitLine("MAKE IT MOVE", '"Anton"', 400, W * 0.86);              // largest size that fits one line
const size = Math.min(one, H * 0.34);                                          // cap by height
```

- Big display words: fit the **longest word** to 84 to 86% of the width; cap the height so a 10-letter word cannot overflow a wide frame.
- Multi-word phrases on tall frames: compare one-line size with a **stacked** layout (one word per line): use the stack when it is at least 1.3x bigger (this is how the site's kinetic type fills the frame).
- Paragraph text: `max-width` plus `text-wrap: balance`; never `<br>` (forced breaks ignore the real width).
- Sizes in `calc(N * var(--u))` so drafts and finals match.

## Safe areas by ratio

See `rules/settings.md`. In 9:16 keep important text between about 12% and 82% of the height; leave the right edge for platform buttons (about 64 to 90 px).

## Contrast

`npm run check` tests WCAG AA on every text. Fixes: put text on a solid plate (`--accent` block, dark gradient at the bottom for captions, a soft dark scrim), use the palette's `ink` colour for the background it sits on, avoid text over busy patterns (batik, halftone, bokeh): give it an opaque panel.

## Layered text (cards, seals, pills)

Use flex centring; give transformed elements `display: block` and a size; keep pulsing decoratives clear of neighbours at their **largest** size; do not straddle an `overflow: hidden` edge.

## Language

- Write on-screen text in the language the user wrote (Malay or English). For greetings use correct forms (see `rules/malaysian-styles.md`). A short second line may repeat it in the other language when the style says so (Malaysian heritage).
- Malay text is often longer than English: check fit after switching language.
- Keep diacritics and special characters: fonts are vendored with the `latin` subset (enough for Malay and English). CJK needs a local or subsetted font (`rules/fonts.md`).
- Do not translate proper nouns, brand names or handles: keep them **exactly as written**.

## Brand colours

Map the user's colours to roles in the style's tokens: `--bg` (base), `--ink` (text), `--accent`, `--accent2`. Use `--brand "bg=#..,ink=#..,accent=#..,accent2=#.."` in the scaffold. Then:

1. Check contrast between `ink` and `bg` (at least 4.5:1); if the user's colours fail, keep their brand colour for shapes/accents and use the style's default ink for text.
2. Styles with fixed semantics keep them: the Malaysian flag in Merdeka, songket gold as the accent in Malaysian heritage and Chinese heritage, the chrome finish in Y2K.
3. Tell the user which role each colour took.

## Missing or unusual input

| Case | Do |
|------|----|
| No text given | Ask for it (or, for background styles like `particle-field`, produce a clean background) |
| Very long text | Propose a shortened version, or split across beats; keep the user's words |
| Text with numbers | Copy exactly; tabular digits for counters |
| All caps requested / not | Follow the style (kinetic type is caps); user preference wins for readability |
| Handle or URL | Never change case or characters; do not add `www.` |
| Non-Latin script | Ask for the font or use a system font with `@font-face { src: local(...) }` |

## Photos and logos

Copy files into `assets/` with short names. Downscale photos to the composition size (ffmpeg) before use: it speeds renders. Crop with `object-fit: cover` and choose `object-position` to keep faces and subjects; never stretch. For logos prefer SVG; PNG with transparency otherwise. Do not fetch remote images at render time.
