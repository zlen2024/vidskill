/* MotionPrompt kit: deterministic helpers for HyperFrames compositions. Classic script -> window.MP.
   Rules it enforces: no Date.now / Math.random / rAF; every value is a pure function of time t (seconds). */
(function (root) {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
  const remap = (x, a, b, c = 0, d = 1, ease) => { const u = clamp((x - a) / (b - a)); return lerp(c, d, ease ? ease(u) : u); };

  // ---------- easing (input 0..1) ----------
  const E = {
    linear: (t) => t,
    inQuad: (t) => t * t, outQuad: (t) => 1 - (1 - t) * (1 - t), inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    inCubic: (t) => t * t * t, outCubic: (t) => 1 - Math.pow(1 - t, 3), inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    inQuart: (t) => t ** 4, outQuart: (t) => 1 - Math.pow(1 - t, 4), inOutQuart: (t) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2),
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)), inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
    inOutExpo: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
    inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2, outSine: (t) => Math.sin((t * Math.PI) / 2),
    outBack: (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
    inBack: (t, s = 1.70158) => (s + 1) * t * t * t - s * t * t,
    outElastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin(((t * 10 - 0.75) * 2 * Math.PI) / 3) + 1),
    outBounce: (t) => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375; return n * (t -= 2.625 / d) * t + 0.984375; },
    steps: (n) => (t) => Math.floor(clamp(t) * n) / n,
  };
  // progress (0..1, eased) of a segment that starts at `start` and lasts `dur`
  const seg = (t, start, dur, ease = E.outCubic) => ease(clamp((t - start) / dur));
  // pulse: 0 -> 1 over `up` starting at t0, then 1 -> 0 over `down`
  const pulse = (t, t0, up, down, ease = E.inOutSine) => (t < t0 ? 0 : t < t0 + up ? ease((t - t0) / up) : t < t0 + up + down ? 1 - ease((t - t0 - up) / down) : 0);

  // spring step response 0 -> 1 with overshoot (closed form, seek-safe). freq in Hz, damping ratio 0..1 (lower = bouncier)
  function spring(t, { freq = 3, damping = 0.45 } = {}) {
    if (t <= 0) return 0;
    const w = 2 * Math.PI * freq, z = damping;
    if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
  }
  // squash & stretch from a spring value v (1 = rest): returns {sx, sy}, roughly volume preserving. amt ~0.25-0.45
  const squash = (v, amt = 0.3) => { const d = (v - 1) * amt; return { sx: 1 - d, sy: 1 + d }; };

  // ---------- seeded randomness & noise ----------
  function rng(seed = 1) {
    let a = seed >>> 0;
    const f = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    f.range = (lo, hi) => lo + (hi - lo) * f();
    f.pick = (arr) => arr[Math.floor(f() * arr.length) % arr.length];
    f.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * f());
    f.gauss = () => Math.sqrt(-2 * Math.log(f() + 1e-12)) * Math.cos(2 * Math.PI * f());
    return f;
  }
  const hash = (i, seed = 0) => { let h = (Math.imul(i | 0, 374761393) + Math.imul(seed | 0, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const noise1 = (x, seed = 0) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i, seed), hash(i + 1, seed), u) * 2 - 1; };           // -1..1
  const noise2 = (x, y, seed = 0) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), h = (a, b) => hash(a + b * 57, seed);
    return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v) * 2 - 1; };
  const fbm1 = (x, seed = 0, oct = 3) => { let s = 0, a = 0.5, f = 1; for (let o = 0; o < oct; o++) { s += a * noise1(x * f, seed + o * 17); a /= 2; f *= 2; } return s; };
  const fbm2 = (x, y, seed = 0, oct = 4) => { let s = 0, a = 0.5, f = 1; for (let o = 0; o < oct; o++) { s += a * noise2(x * f, y * f, seed + o * 17); a /= 2; f *= 2; } return s; };

  // ---------- stop motion & hand-made feel ----------
  const stepTime = (t, fps = 12) => Math.floor(t * fps + 1e-6) / fps;                        // quantise time to N fps
  const frameIndex = (t, fps = 12) => Math.floor(t * fps + 1e-6);
  // tiny per-stepped-frame wobble: {x px, y px, r deg}
  const nudge = (t, { fps = 12, amp = 1.5, seed = 1 } = {}) => { const k = frameIndex(t, fps); return { x: (hash(k, seed) - 0.5) * 2 * amp, y: (hash(k, seed + 7) - 0.5) * 2 * amp, r: (hash(k, seed + 13) - 0.5) * 2 * amp * 0.25 }; };
  // camera shake as smooth noise; `decay` (1/s) fades it out after impact
  const shake = (t, { amp = 12, freq = 22, seed = 3, decay = 0 } = {}) => { const d = decay ? Math.exp(-t * decay) : 1; return { x: noise1(t * freq, seed) * amp * d, y: noise1(t * freq, seed + 5) * amp * d, r: noise1(t * freq, seed + 9) * amp * 0.06 * d }; };
  const beatTime = (bpm, n = 1, offset = 0) => offset + (n * 60) / bpm;

  // ---------- colour ----------
  const hexToRgb = (h) => { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const rgba = (h, a = 1) => { const [r, g, b] = hexToRgb(h); return `rgba(${r},${g},${b},${a})`; };
  const mix = (a, b, t) => { const A = hexToRgb(a), B = hexToRgb(b); return "#" + A.map((v, i) => Math.round(lerp(v, B[i], t)).toString(16).padStart(2, "0")).join(""); };
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // ---------- DOM helpers ----------
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  function splitText(el, mode = "chars") {                     // wrap letters/words in inline-block spans; returns the span array
    const text = el.textContent; el.setAttribute("aria-label", text); el.textContent = "";
    const parts = mode === "words" ? text.split(/(\s+)/) : [...text], out = [];
    for (const p of parts) {
      if (/^\s+$/.test(p)) { el.appendChild(document.createTextNode(p)); continue; }
      const s = document.createElement("span"); s.textContent = p; s.style.display = "inline-block"; s.style.whiteSpace = "pre"; s.setAttribute("aria-hidden", "true"); el.appendChild(s); out.push(s);
    }
    return out;
  }
  function el(tag, cls, parent, styles) { const e = document.createElement(tag); if (cls) e.className = cls; if (styles) Object.assign(e.style, styles); if (parent) parent.appendChild(e); return e; }
  function canvas(parent, w, h, styles = {}) { const c = document.createElement("canvas"); c.width = w; c.height = h; Object.assign(c.style, { position: "absolute", left: 0, top: 0, width: w + "px", height: h + "px" }, styles); if (parent) parent.appendChild(c); return { c, ctx: c.getContext("2d") }; }
  // resolve once every named font (and weight) is actually loaded, then run cb. Build the timeline INSIDE cb and register it at the end.
  function fontsReady(specs = [], cb) {
    const loads = specs.map((s) => document.fonts.load(s)), p = Promise.all([document.fonts.ready, ...loads]);
    return cb ? p.then(() => cb()) : p;
  }
  // largest font size (px) at which one line of text fits maxW (canvas measure, no reflow)
  function fitLine(text, family, weight, maxW, { min = 12, max = 600 } = {}) {
    const c = fitLine._c || (fitLine._c = document.createElement("canvas").getContext("2d"));
    let lo = min, hi = max;
    for (let i = 0; i < 22; i++) { const mid = (lo + hi) / 2; c.font = `${weight} ${mid}px ${family}`; if (c.measureText(text).width <= maxW) lo = mid; else hi = mid; }
    return Math.floor(lo);
  }

  // ---------- rendering hooks ----------
  // Call fn(t) for every seek. `hf-seek` is dispatched by HyperFrames on each frame (verified, works without three.js);
  // a proxy tween is an optional fallback so Studio scrubbing also redraws.
  function onSeek(fn, { tl = null, duration = null } = {}) {
    let last = NaN; const call = (t) => { if (t === last) return; last = t; fn(t); };
    addEventListener("hf-seek", (e) => call(e.detail.time));
    if (tl && duration && root.gsap) { const p = { t: 0 }; tl.to(p, { t: duration, duration, ease: "none", onUpdate: () => call(p.t) }, 0); }
    call(0);
  }
  // deterministic film grain: a seeded noise tile, offset per stepped frame (default 24 fps look)
  function grainTile(seed = 5, size = 256) {
    const { c, ctx } = canvas(null, size, size), img = ctx.createImageData(size, size), r = rng(seed);
    for (let i = 0; i < img.data.length; i += 4) { const v = (r() * 255) | 0; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    ctx.putImageData(img, 0, 0); return c;
  }
  function drawGrain(ctx, tile, t, w, h, { fps = 24, alpha = 0.08, seed = 11 } = {}) {
    const k = frameIndex(t, fps), ox = Math.floor(hash(k, seed) * tile.width), oy = Math.floor(hash(k, seed + 3) * tile.height);
    ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = "overlay";
    for (let y = -oy; y < h; y += tile.height) for (let x = -ox; x < w; x += tile.width) ctx.drawImage(tile, x, y);
    ctx.restore();
  }
  function vignette(ctx, w, h, strength = 0.5) {
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) / 2);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${strength})`); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }

  root.MP = { clamp, lerp, smooth, remap, E, seg, pulse, spring, squash, rng, hash, noise1, noise2, fbm1, fbm2, stepTime, frameIndex, nudge, shake, beatTime, hexToRgb, rgba, mix, css, $, $$, splitText, el, canvas, fontsReady, fitLine, onSeek, grainTile, drawGrain, vignette };
})(typeof window !== "undefined" ? window : globalThis);
