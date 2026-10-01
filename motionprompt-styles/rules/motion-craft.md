---
name: motion-craft
description: Motion language for the styles: easing and spring vocabulary by feel, stagger, holds, camera moves, beat sync, hard cuts vs eases, loop endings, and flash and motion safety
metadata:
  tags: motion, easing, spring, stagger, camera, timing, safety
---

# Motion craft

Every style has a **motion personality**. Match the easing to it; the wrong ease is the most common reason a build feels "off".

## Personality to easing

| Feel | Styles | Use |
|------|--------|-----|
| **Punchy / percussive** | kinetic-type, sale-countdown, comic-pop-art, glitch | `expo.out`, `power4.out`, hard cuts on the beat, scale overshoot in 0.25 to 0.4 s, shake with exponential decay |
| **Bouncy / cute** | kawaii-pastel, flat-illustration, infographic, chat-story, floating-3d-icons, claymation | springs (`MP.spring` freq 2.5 to 3.5, damping 0.3 to 0.45), `back.out(1.7 to 2.5)`, squash and stretch |
| **Precise / technical** | swiss-geometric, neon-tech, data-story, pixel-art | `power3.inOut`, integer positions, quarter turns, no overshoot; stepped (`steps(n)`) for pixel art |
| **Calm / elegant** | elegant-wedding, malaysian-heritage, borneo-rainforest, liquid-gradient, particle-field, watercolour-ink, kampung-sunset, product-turntable | `sine.inOut`, `power2.out`, long durations (0.8 to 2.5 s), no bounce |
| **Handmade / stop motion** | paper-cutout, claymation, whiteboard-sketch, comic-pop-art | stepped time at 8 to 12 fps + per-frame nudge; slight overshoot |
| **Cinematic** | kaiju-attack, tech-noir, vintage-archive, editorial-portfolio | slow camera moves, `power2.inOut`, film grain, hits with long tails |

## Timing rules of thumb

- **Entrances**: 0.25 to 0.5 s (punchy), 0.5 to 0.9 s (friendly), 0.8 to 2 s (calm). Exits are 30 to 50% faster than entrances.
- **Holds**: a line of text needs about 0.3 s per word plus 0.5 s; never less than 0.8 s total for anything the viewer must read.
- **Stagger**: 0.04 to 0.08 s per letter, 0.08 to 0.15 s per word/item; cap the whole stagger at about 40% of the slot.
- **Anticipation and settle**: a small opposite move before a big one (crouch before a hop), and a settle after landing (2 to 3 small oscillations) read as alive.
- **Overlap**: start the next thing before the previous finishes (60 to 80% through).
- **One focal motion at a time**: at most about three things move at once; hold the rest still.

## Beat sync

- `timing.mjs` holds beat times; use them for **both** visuals and sound. Do not hard-code seconds in the HTML.
- Beat-driven styles (kinetic-type, retro-synthwave, sale-countdown, swiss-geometric, pixel-art, comic-pop-art, glitch) snap the tempo to whole beats in the length; the music uses `align: "beat"` with the same BPM, so they never drift.
- Land the **visual hit on the kick**: the first frame where the element is settled (or the impact frame) should coincide with the kick sample time.
- Snap sound cues for stop-motion styles to the stepped frame grid.

## Springs and squash-stretch

```js
const v = MP.spring(t - t0, { freq: 2.6, damping: 0.35 });  // 0 -> 1 with overshoot
const { sx, sy } = MP.squash(v, 0.3);                       // volume-preserving scale pair
```

Landing: squash (`sy < 1`) for 2 frames, stretch on take-off, settle. Cute styles use lower damping.

## Camera

- Camera = `x, y, scale, rotation` of one container (or a Three camera). Make it a function of `t`: `E.inOutCubic` between stops plus a tiny continuous drift so it is never fully still.
- "Never fully still" styles (map-journey, property-tour, isometric-diorama, tech-noir): add a slow drift even during holds.
- Shake: `MP.shake(t - t0, {amp, freq, decay})` on the stage, only on impacts.

## Hard cuts, wipes, transitions

- Hard cut = `tl.set` at the beat (kinetic type, glitch, jump cuts). Do not blend colours in a hard-cut style.
- Wipes/sweeps: a solid panel moving with `power3.in` then `power3.out`; hide the swap behind full coverage.
- Transitions last about 0.9 to 1.1 s in showcase styles (batik), 0.35 s in punchy ones.

## Loops and endings

Every style says how its last frame returns to the first (wipe to empty, fade to paper, fold away, periodic motion). Do it deliberately: **the last 8 to 12% of the length is the exit**. Sound too: music tail is folded onto the head so the file loops without a click.

## Safety

- **Flashing**: no more than 3 flashes per second, and no large bright area changes over about 10% luminance at that rate (WCAG 2.3.1). Prompts that say "never flashing or strobing" (Raya, Merdeka, Deepavali, CNY, glitch, neon sign, vintage) mean it. A single 2-frame shutter flash (photo-studio) is acceptable once per shot; keep intensity moderate.
- **Motion**: avoid fast large-area parallax or spinning; long slow moves only in calm styles.
- **Sound**: peak below -1 dBFS; no piercing test tones; glitch bursts under 0.35 s.
