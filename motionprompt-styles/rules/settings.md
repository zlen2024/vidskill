---
name: settings
description: Video settings for MotionPrompt styles: ratios and pixel sizes, lengths, quality, sound modes, platform safe areas, the --u unit and drafts
metadata:
  tags: settings, ratio, size, duration, sound, safe-area
---

# Settings

The original site lets the user choose four things; the scaffold implements them all.

## Format (ratio) and size

The short side is the "quality": 480, 720 or **1080** (default). `node scripts/prompt.mjs --size --ratio 4:5 --quality 1080` prints `WxH`.

| Ratio | Use | 1080p size | Safe area (design units, top / bottom / side) |
|-------|-----|------------|-----------------------------------------------|
| **9:16** | Reels, TikTok, Shorts, Status | 1080 x 1920 | 220 / 300 / 64 |
| **4:5** | Instagram / Facebook feed | 1080 x 1350 | 90 / 120 / 64 |
| **1:1** | Square feed | 1080 x 1080 | 72 / 72 / 72 |
| **16:9** | YouTube, web, presentations | 1920 x 1080 | 64 / 72 / 96 |

Safe areas keep text clear of platform UI (username, caption, buttons). They are CSS variables in the scaffold: `--safe-t --safe-b --safe-x`.

## Length

Choices on the site: **6, 8, 10, 15 or 30 s**. Each style has a `default_duration` (simple text styles 8 s, layered scenes 15 s, editorial 20 s). Rules of thumb:

- Below the style's default, drop optional beats (fewer steps, fewer photos) rather than rushing the timing; a hold under 0.8 s reads as a flash.
- Above it, add content (more steps or phrases) or slow the holds, never loop the same beat.
- The user's own audio (podcast) sets the length.

All beats in `styles/<slug>.md` are fractions of the length, so `timing.mjs` rescales automatically; repeat counts (steps, photos, rooms, stops) must be set to the real content.

## Sound

| Mode | What is produced |
|------|------------------|
| `off` | No audio track at all (the scaffold omits `<audio>`) |
| `effects` | Synthesised effects only |
| `music` (default) | Effects plus the loopable music bed, ducked under the effects |

This mirrors the site: `Sound off` removes the whole Sound section, `Effects` removes the Music line. Sound is **always synthesised in code**: no samples, no copyrighted audio. A user-supplied audio file (podcast clip) is mixed in addition.

## Design unit `--u` and drafts

The scaffold sets `--u` (1px at a 1080 short side). Author sizes as `calc(N * var(--u))` and in JS use `const U = ...` so a 720 or 540 short-side draft (`--short 720`) matches the 1080 layout. Drafts at a smaller short side render 2 to 4 times faster; always inspect a final-size frame before delivery.

## Quality flags

`hyperframes render -q draft|looks|delivery` (looks is default), `-f 30` default, `-w 1` on this machine. `draft` is fast and lower quality: use it to check timing and layout only.

## Brand colours

If the user gives colours, map them by role: `bg`, `ink` (text), `accent`, `accent2` (see each style's tokens) with `--brand "bg=#...,ink=#...,accent=#...,accent2=#..."`. Keep contrast (`npm run check` tests WCAG AA). Some styles keep fixed colours by design (Merdeka's flag colours, songket gold accent).

## Text and language

Pass the user's exact words with `--text "A|B|C"` (`|` separates lines) and `--lang ms|en`. Write in the language the user used. See `rules/layout-and-text.md`.
