# Example: pixel-art (built, rendered)

`styles/pixel-art.md` built for 9:16, 15 s, sound on, with a **fictional demo brand** ("Pixel Bakery"; the stats, the 1,200+ figure and `@pixelbakery` are placeholders).
Low-res canvas 180x320 scaled 6x with square pixels; original sprites (baker hero, gift blocks, cake/cookie/bread items, coins, star, bakery shop); a scripted hero path where every value is a function of `t`.

Result: 1080x1920 H.264 + AAC, 15.0 s, draft render in about 25 s (one worker). `npm run check` clean; `audio-report` OK.

## Use it

```bash
node ../../scripts/make.mjs pixel-art --out videos/game --text "Name|Role|Feature 1|Feature 2|Feature 3" --key "Order now"
```

For real stats, a proof figure and a handle, fill `game` in the project's `content.mjs` (see this folder's copy), then `make.mjs --project videos/game --final`.

## Limits
- The three item icons are always cake, cookie and bread; draw new 10x10 sprites in `ITEMS` for other businesses.
- Without `game.stats` the card shows placeholder stats (POWER 9, SPEED 7, HEART 10): replace them before delivery.
- Built and checked at 9:16 only.
