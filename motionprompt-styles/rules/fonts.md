---
name: fonts
description: Vendoring Google fonts locally for HyperFrames (lint rules, no named fallbacks, variable fonts, CJK), and the font used by each style
metadata:
  tags: fonts, fontsource, font-face, lint, variable, cjk
---

# Fonts

## How it works

`scaffold.mjs` reads each style's `fonts` block, installs `@fontsource/<id>` (or `@fontsource-variable/<id>`) into the local cache `~/.cache/motionprompt-vendor`, copies the needed `woff2` files into `assets/fonts/`, and inlines `@font-face` rules in `index.html`. Nothing is fetched at render time.

```json
{"family": "Anton", "id": "anton", "weights": [400]}                                   // static
{"family": "Inter", "id": "inter", "variable": true, "weightRange": "100 900"}          // variable (@fontsource-variable)
{"family": "Playfair Display", "id": "playfair-display", "weights": [400, 700], "styles": ["normal", "italic"]}
{"family": "Ma Shan Zheng", "local": "Microsoft YaHei"}                                 // OS font, src: local(...)
```

Files are the `latin` subset by default (`"subsets": ["latin", "latin-ext"]` to add). All 50 styles' fonts were verified to exist: `node scripts/fonts.mjs --check all`.

## Lint rules that bite

- **Every named family in `font-family` needs an `@font-face`**, including fallbacks. `font-family: "Anton", Impact, sans-serif` **fails** (`font_family_without_font_face: impact`). Use `"Anton", sans-serif` (generic families are allowed).
- Wait for fonts before measuring or building the timeline: `MP.fontsReady(specs)`; the scaffold passes the right load specs (`400 40px "Anton"`).
- Synthesised bold/italic looks wrong: declare the real weights/styles you use.
- Variable fonts: use `font-weight` values inside the declared range; `font-variation-settings` only if the axis exists.
- Do not use system fonts by name unless declared with `local()`.

## CJK and other scripts

CJK fonts are huge and split into many unicode-range files, so they are not vendored. Options:

1. `local("Microsoft YaHei")` / `local("PingFang SC")` (works on the render machine only; check a frame for tofu boxes).
2. Subset a font to just the needed characters: `pyftsubset MaShanZheng.ttf --text="福春新年快乐" --flavor=woff2 --output-file=assets/fonts/brush-subset.woff2`, then declare it in `@font-face`.

## Fonts by style

| Font | Package | Used by |
|------|---------|---------|
| Anton | `@fontsource/anton` | kinetic-type, kaiju-attack, sale-countdown, photo-studio |
| Special Elite | `@fontsource/special-elite` | kaiju-attack, vintage-archive |
| Plus Jakarta Sans | `@fontsource-variable/plus-jakarta-sans` | infographic, app-showcase |
| Inter | `@fontsource-variable/inter` | radial-infographic, data-story, swiss-geometric, app-showcase |
| Oswald | `@fontsource/oswald` | radial-infographic, flat-illustration, photo-studio |
| Bebas Neue | `@fontsource/bebas-neue` | flat-illustration, merdeka |
| Poppins | `@fontsource/poppins` | slide-deck, deepavali |
| Nunito | `@fontsource-variable/nunito` | isometric-diorama, malaysian-heritage, food-menu, map-journey, floating-3d-icons |
| Cinzel | `@fontsource/cinzel` | malaysian-heritage, festive-raya |
| Quicksand | `@fontsource-variable/quicksand` | festive-raya |
| Fredoka | `@fontsource-variable/fredoka` | kawaii-pastel, paper-cutout |
| Mochiy Pop One | `@fontsource/mochiy-pop-one` | kawaii-pastel (alternate) |
| Instrument Serif | `@fontsource/instrument-serif` | tech-noir |
| JetBrains Mono | `@fontsource/jetbrains-mono` | tech-noir, glitch, photo-studio |
| Caveat | `@fontsource/caveat` | food-menu, kopitiam, whiteboard-sketch |
| DM Serif Display | `@fontsource/dm-serif-display` | food-menu, chinese-new-year |
| Yellowtail | `@fontsource/yellowtail` | neon-sign |
| Outfit | `@fontsource-variable/outfit` | map-journey |
| Inter Tight | `@fontsource-variable/inter-tight` | liquid-gradient, product-turntable |
| Baloo 2 | `@fontsource/baloo-2` | claymation, kampung-sunset |
| Orbitron | `@fontsource-variable/orbitron` | retro-synthwave, neon-tech |
| Geist | `@fontsource-variable/geist` | neon-tech |
| Great Vibes | `@fontsource/great-vibes` | elegant-wedding |
| Cormorant Garamond | `@fontsource/cormorant-garamond` | elegant-wedding, borneo-rainforest, product-turntable, watercolour-ink |
| Montserrat | `@fontsource-variable/montserrat` | logo-spin-3d, merdeka, borneo-rainforest |
| Cabin Sketch | `@fontsource/cabin-sketch` | kopitiam |
| Bangers | `@fontsource/bangers` | comic-pop-art |
| Playfair Display | `@fontsource/playfair-display` | photo-slideshow, batik-fashion, vintage-archive, editorial-portfolio |
| Jost | `@fontsource-variable/jost` | batik-fashion, chinese-new-year |
| DM Sans | `@fontsource-variable/dm-sans` | chat-story |
| Kaushan Script | `@fontsource/kaushan-script` | watercolour-ink |
| Lilita One / Permanent Marker | `@fontsource/lilita-one`, `@fontsource/permanent-marker` | pasar-malam (nostalgia-90s uses Permanent Marker too) |
| Righteous / VT323 | `@fontsource/righteous`, `@fontsource/vt323` | nostalgia-90s |
| Press Start 2P | `@fontsource/press-start-2p` | pixel-art |
| Bricolage Grotesque | `@fontsource-variable/bricolage-grotesque` | podcast-audiogram |
| Rozha One | `@fontsource/rozha-one` | deepavali |
| Manrope | `@fontsource-variable/manrope` | property-tour, editorial-portfolio, particle-field |
| Archivo | `@fontsource-variable/archivo` | swiss-geometric |
| Unbounded | `@fontsource-variable/unbounded` | y2k-chrome |
| Ma Shan Zheng | local / subset | chinese-new-year |

When a style names two alternatives (Oswald or Bebas Neue), both are vendored; use one.
