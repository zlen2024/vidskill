---
name: map-journey
title: Map journey
description: An animated flat travel map on real geography: the route draws itself stop to stop with a plane, car or boat, numbered pins drop with a ripple, day cards pop up, and the camera glides and zooms. For itineraries, trips, tours, delivery routes and "our locations" stories.
tags: ["travel","explainer","malaysia"]
library: d3-geo
sound: true
difficulty: 5
default_duration: 15
ratios: {"9:16":"great","4:5":"great","1:1":"great","16:9":"great"}
vendor: [{"pkg":"d3-geo","version":"3.1.1","files":["dist/d3-geo.min.js"]},{"pkg":"d3-array","version":"3.2.4","files":["dist/d3-array.min.js"]},{"pkg":"topojson-client","version":"3.1.0","files":["dist/topojson-client.min.js"]},{"pkg":"world-atlas","version":"2.0.2","files":["countries-50m.json"]}]
---
# Map journey

**One-liner:** a clean, flat, modern map with real coastlines: soft cream land, light sea, thin borders and a faint grid; the trip country is filled stronger, the route draws itself with a small vehicle, numbered pins drop with a bounce and ripple, day cards pop up, and the camera glides from stop to stop, never still.
**Best for:** a trip itinerary (for example Kuala Lumpur to Penang to Kota Kinabalu), a tour, a delivery or shipping route, branch locations, a "where we work" story.
**Avoid when:** you have fewer than 2 places, or need satellite imagery or 3D terrain.

## Inputs to gather
- Ordered list of places (name, latitude/longitude or a known city, optional day/date, optional short tag). The trip country. Title and a small subtitle ("5 days, 3 stops"). Brand colours.

## Directive map
| ID | Requirement (own words) | How to build |
|----|-------------------------|--------------|
| L1 | An animated travel map of the places in the request, visited in order | Stops array; per-leg timeline segments computed from `T.leg<k>` |
| L2 | Real geography so places are recognisable; flat modern map: soft land, light sea, thin coastlines, a faint grid; no satellite photos, no 3D | `d3.geoMercator`/`geoNaturalEarth1` with `topojson.feature(world, world.objects.countries)` from the vendored 50m data; drawn on Canvas with `d3.geoPath(projection, ctx)` |
| L3 | The trip country in a stronger colour and neighbours lighter; a few faint names for nearby countries and seas in wide shots | Fill by country id; label list with opacity by zoom level |
| L4 | The camera glides and zooms from stop to stop, framing each new stretch; never fully still | Camera = projection `scale` + `translate` (or `fitExtent` on the leg's bounding box) interpolated by `t`; add a slow drift |
| L5 | The route draws itself along a gentle curve with a small vehicle travelling the line; plane with a dotted line for long hops, car or boat for short ones | Curve = great-circle or quadratic Bezier in screen space; draw a growing portion (`u` from 0 to 1); vehicle icon rotates to the tangent; dashed for flights |
| L6 | At each stop a numbered pin drops in with a bounce and a ripple, then a small card pops up with the place name and a tiny icon; show "Day 2" when days are given | Pin spring (`MP.spring`), ripple ring, card pop with `back.out`; cards placed to avoid overlap and stay in frame |
| L7 | Keep every pin, card and the moving vehicle inside the frame | Clamp card positions to the frame margins; place cards left/right by available space |
| L8 | End by zooming out to show the whole route with all pins and names, fade the route away and zoom back to the start so it loops | Final camera = `fitExtent` of all stops; route alpha to 0; camera returns to the first framing |
| T1 | A short bold title (Outfit) with a small line under it; friendly rounded sans (Nunito) for cards and labels | Outfit 700, Nunito 700/600 in DOM |
| T2 | Brand colours if given, else light sea blue, warm cream land, mint green trip country, coral pins, deep navy route and text | Tokens below |
| S1 | Pin lands with a soft thud (smaller on the bounce) and a gentle ping as the ripple spreads, bubbly pop per day card, soft pen scratch as the route draws following its speed, light car engine hum on road stretches, a short boat horn toot and lapping water on sea crossings, plane whoosh with a gentle engine drone on flights, soft whoosh when the camera pulls out | Cue table below |
| S2 | Upbeat travel-vlog bed about 135 bpm, bright major key: strummed acoustic guitar, soft bass, light kick, finger snaps, shaker; quiet; loops | `ukulele-folk` preset at 135 bpm with guitar voice |
| S3 | All sound made in code | `scripts/synth.mjs` |
| O1 | Size from the settings | scaffold `--ratio` |
| O2 | About the chosen length (12 to 15 s for 3 stops) | scaffold `--duration 15` |
| O3 | HTML animation with a real map (d3-geo + world data) rendered to MP4 | `hyperframes render` |

## Tokens
```css tokens
--bg: #cfe7ee;
--land: #f5f1e8;
--trip: #2fae86;
--accent: #ff5a4e;
--ink: #1d2b44;
```
```json fonts
[
  {"family": "Outfit", "id": "outfit", "variable": true, "weightRange": "100 900", "role": "title"},
  {"family": "Nunito", "id": "nunito", "variable": true, "weightRange": "200 1000", "role": "cards and labels"}
]
```

## Beat sheet
For three stops (edit the repeat counts for N stops: legs are N-1).
```json beats
{"bpm": 135, "events": [
  {"id": "open", "at": 0.0, "label": "wide map, title in"},
  {"id": "pin", "repeat": {"n": 3, "fromFrac": 0.08, "everyFrac": 0.3}, "label": "pin drops at each stop"},
  {"id": "card", "repeat": {"n": 3, "fromFrac": 0.11, "everyFrac": 0.3}, "label": "day card pops"},
  {"id": "leg", "repeat": {"n": 2, "fromFrac": 0.18, "everyFrac": 0.3}, "label": "route draws to the next stop"},
  {"id": "pullout", "at": 0.86, "label": "camera pulls out to the whole trip"},
  {"id": "fade", "at": 0.94, "label": "route fades, zoom back to the start"}
]}
```

## Build recipe
- **Data:** the world JSON is loaded from a local file at build time: scaffold writes it as `assets/vendor/countries-50m.js` (`window.__vendorData["countries-50m"] = {...}`) so no fetch happens at render time. Decode once with `topojson.feature`, keep only countries near the trip to keep drawing fast.
- **Projection and camera:** keep one `d3.geoMercator()`; per frame set `projection.scale(s).center([lon, lat])` from the camera state `{lon, lat, k}` interpolated between stops (`E.inOutCubic`). Redraw everything with `MP.onSeek`.
- **Route:** for each leg build the projected polyline (30 to 60 points along a great circle via `d3.geoInterpolate`), draw the first `u * n` points; vehicle position = the point at `u`; plane legs are drawn dotted (`setLineDash`).
- **Cards:** keep in DOM for crisp text, positioned from projected pin coordinates each frame (via `MP.onSeek` updating `transform`); clamp inside the frame.
- **Pitfalls:** 50m data is heavy: pre-filter countries; do not use `requestAnimationFrame`; Malaysia spans two land masses (peninsula and Borneo): a small country map still needs both in the camera for the KL to Kota Kinabalu leg (use a flight).

## Sound plan
How each effect of the brief is covered:
- **Each pin lands with a soft thud (and a smaller one on its bounce) plus a gentle ping as the ripple spreads:** `thud` + `ping` at `pin*`, a smaller `thud` 0.2 s later.
- **A bubbly pop as each day card appears:** `pop` at `card*`.
- **A soft pen scratch as the route draws, following its speed:** `scratch` at `leg*` (duration = leg time).
- **Road stretches get a light car engine hum, sea crossings a short boat horn toot and lapping water, and flights a plane whoosh with a gentle engine drone:** `hum` (road), `brass` toot + `pour`/`wind` (sea), `whoosh` + `whir` drone (flight): choose per leg mode.
- **A soft whoosh when the camera pulls out to show the whole trip:** `whoosh` at `pullout`.
```json cues
[
  {"at": "open", "kind": "swish", "vol": 0.4},
  {"at": "pin*", "kind": "thud", "freq": 80, "dur": 0.25, "vol": 0.8},
  {"at": "pin*+0.2", "kind": "thud", "freq": 100, "dur": 0.15, "vol": 0.4},
  {"at": "pin*+0.15", "kind": "ping", "freq": 1100, "dur": 0.9, "vol": 0.45},
  {"at": "card*", "kind": "pop", "freq": 560, "vol": 0.75},
  {"at": "leg*", "kind": "scratch", "dur": 1.6, "freq": 2600, "vol": 0.35},
  {"at": "leg1", "kind": "whoosh", "dir": "up", "dur": 1.6, "vol": 0.4},
  {"at": "leg1", "kind": "whir", "f0": 80, "f1": 95, "dur": 1.8, "vol": 0.18},
  {"at": "leg2", "kind": "hum", "freq": 90, "harm": 5, "dur": 1.8, "vol": 0.2},
  {"at": "pullout", "kind": "whoosh", "dir": "peak", "dur": 1.0, "vol": 0.5}
]
```
The first leg is written as a flight and the second as a road trip; for a boat crossing add `{"kind": "brass", "note": "F2", "dur": 0.5}` (horn toot) and a soft `pour` bed for the water. Swap by the mode of each leg.
```json music
{"preset": "ukulele-folk", "bpm": 135, "gain": 1, "duck": 0.5, "layers": {
  "strum": {"voice": "strum", "rhythm": "stab:x-x-x-x-x-x-x-x-", "stabLen": 2},
  "drums": {"kick": "x---x---x---x---", "clap": "", "snap": "----x-------x---", "shaker": "xoxoxoxoxoxoxoxo", "lanes": {"shaker": 0.3, "snap": 0.7}}
}}
```

## Layout by aspect ratio
- **9:16 / 4:5:** title at the top inside the safe area, map fills the rest; cards to the left/right of pins, never over the title.
- **16:9:** title top-left, cards beside pins.
- **1:1:** title top, map below; camera framing uses 85% of the width.

## Loop & ending
Route fades, the camera returns to the wide/first framing, pins and cards clear; frame 0 is that same wide map.

## Guardrails
- Real geography, drawn as a clean flat modern map: no satellite photos and no 3D.
- The camera is never fully still; keep every pin, card and the moving vehicle inside the frame.
- Use the user's places, days and dates only; do not invent stops.

## QA
- Frame at each stop: pin and card visible, inside the frame, route reaches the pin.
- Wide frame at `pullout + 1 s`: all pins numbered, names readable, no card overlap.
- The trip country reads stronger than its neighbours; borders thin.
- Audio: pin thuds precede pings; leg sounds match the leg mode.
