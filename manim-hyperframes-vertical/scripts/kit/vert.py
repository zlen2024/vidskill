"""Vertical (9:16), transparent Manim kit for the long-form thermodynamic-computing episodes.

Scenes render on a TRANSPARENT background; tools/vbuild.py composites them over HyperFrames
backgrounds/overlays, so nothing here paints a full-frame background.

  from channel.vert import *       # at the top of scenes.py (it flips the frame to portrait)
"""
import json
import os
from pathlib import Path

import numpy as np
from manim import *
from manim.animation.animation import prepare_animation

# ---------- fast VP9-alpha partial movies (Manim's default libvpx settings run at ~1-2 fps) ----------
import manim.scene.scene_file_writer as _sfw


class _ContainerProxy:
    def __init__(self, c):
        self._c = c

    def add_stream(self, codec, *a, **kw):
        if codec == "libvpx-vp9":
            o = dict(kw.get("options") or {})
            o.update({"deadline": "realtime", "cpu-used": "8", "row-mt": "1", "lag-in-frames": "0", "crf": "30", "b": "0"})
            o.pop("-auto-alt-ref", None)
            kw["options"] = o
        return self._c.add_stream(codec, *a, **kw)

    def __getattr__(self, n):
        return getattr(self._c, n)

    def __enter__(self):
        self._c.__enter__()
        return self

    def __exit__(self, *a):
        return self._c.__exit__(*a)


class _AvProxy:
    def __init__(self, av_):
        self._av = av_

    def open(self, *a, **kw):
        c = self._av.open(*a, **kw)
        mode = kw.get("mode", a[1] if len(a) > 1 else "r")
        return _ContainerProxy(c) if mode == "w" else c

    def __getattr__(self, n):
        return getattr(self._av, n)


if not isinstance(_sfw.av, _AvProxy):
    _sfw.av = _AvProxy(_sfw.av)

# ---------- portrait frame (must run before any Mobject uses the frame size) ----------
# `manim -qh` sets 1920x1080; swap to 1080x1920 and make the frame 8 units wide, 14.22 tall.
if config.pixel_width > config.pixel_height:
    config.pixel_width, config.pixel_height = config.pixel_height, config.pixel_width
config.frame_width = 8.0
config.frame_height = 8.0 * config.pixel_height / config.pixel_width
config.frame_rate = int(os.environ.get("VFPS", "30"))
config.transparent = True
config.background_opacity = 0.0

W_, H_ = config.frame_width, config.frame_height          # 8 x 14.22 units

# ---------- palette: vivid on a coloured backdrop, deep ink for text ----------
INK = "#1b1740"          # text on glass cards
INK2 = "#4a4478"         # secondary text
WHITE_ = "#ffffff"
PINK = "#ff3d81"
ORANGE = "#ff8a1f"
YELLOW = "#ffc933"
MINT = "#10c9a0"
CYAN = "#0aa5e8"
BLUE = "#3d6bff"
VIOLET = "#7c4dff"
CARD = "#ffffff"
FONT = "Segoe UI"
FONT_B = "Segoe UI"

SAFE_TOP = H_ / 2 - 1.5          # TikTok/Reels UI keeps ~1.5 units clear at top...
SAFE_BOT = -H_ / 2 + 2.6         # ...and ~2.6 at the bottom (captions/UI)


def T(text, size=34, color=INK, weight=NORMAL, **kw):
    return Text(text, font=FONT, font_size=size, color=color, weight=weight, **kw)


def TB(text, size=34, color=INK, **kw):
    return T(text, size, color, BOLD, **kw)


def M(tex, size=44, color=INK, **kw):
    return MathTex(tex, font_size=size, color=color, **kw)


def card(w, h, color=CARD, opacity=0.96, radius=0.28, stroke=None, shadow=True):
    """Frosted-glass rounded card with a soft drop shadow (a few offset translucent copies)."""
    body = RoundedRectangle(width=w, height=h, corner_radius=radius, stroke_width=0 if stroke is None else 3,
                            stroke_color=stroke or color, fill_color=color, fill_opacity=opacity)
    if not shadow:
        return body
    sh = VGroup(*[RoundedRectangle(width=w + 0.1 * i, height=h + 0.1 * i, corner_radius=radius + 0.05 * i, stroke_width=0,
                                   fill_color="#2b1f6b", fill_opacity=0.035).shift(DOWN * (0.07 + 0.04 * i)) for i in range(1, 4)])
    return VGroup(sh, body)


def pill(text, color=VIOLET, size=26, pad=0.32, txt=WHITE_):
    t = TB(text, size, txt)
    r = RoundedRectangle(width=t.width + pad * 2, height=t.height + pad * 1.1, corner_radius=(t.height + pad * 1.1) / 2,
                         stroke_width=0, fill_color=color, fill_opacity=1)
    t.move_to(r)
    return VGroup(r, t)


def glow_dot(color, radius=0.14, layers=4):
    core = Dot(radius=radius, color=color)
    halo = VGroup(*[Circle(radius=radius * (1 + 0.9 * i), stroke_width=0, fill_color=color, fill_opacity=0.16 / i) for i in range(1, layers + 1)])
    return VGroup(halo, core)


def soft(mob, color=None, layers=4, spread=5, opacity=0.1):
    """Soft glow halo behind strokes (works on light backdrops when kept low-opacity)."""
    color = color or mob.get_color()
    halo = VGroup()
    base = max(mob.get_stroke_width(), 2)
    for i in range(layers, 0, -1):
        h = mob.copy().set_fill(opacity=0)
        h.set_stroke(color, width=base + spread * i, opacity=opacity)
        for part in h.get_family():
            part.joint_type = LineJointType.ROUND
        halo.add(h)
    return VGroup(halo, mob)


# ---------- timing: stretch a scene to fit the narration ----------
PACE_FILE = Path(os.environ.get("PACE_FILE", ""))


def _pace_for(name):
    p = os.environ.get("PACE_FILE")
    if p and Path(p).exists():
        return json.loads(Path(p).read_text()).get(name, 1.0)
    return 1.0


class Timed(Scene):
    """Every play() is stretched by pace['a'] and every wait() by pace['w'] (from pace.json, set by `vbuild.py pace`) so
    the visuals last as long as the voice; tear_down tops up any remainder with a final hold. `hold(sec)` waits real seconds."""

    @property
    def pace(self):
        if not hasattr(self, "_pace"):
            self._pace = _pace_for(type(self).__name__)
        return self._pace

    def _cfg(self):
        p = self.pace
        if isinstance(p, dict):
            return p.get("a", 1.0), p.get("w", 1.0), p.get("T")
        return float(p), float(p), None

    def _elastic(self):
        p = self.pace
        return p.get("e", p.get("a", 1.0)) if isinstance(p, dict) else float(p)

    def add(self, *mobs):
        if getattr(self, "_frozen", False):
            return self
        return super().add(*mobs)

    def play(self, *anims, **kw):
        if getattr(self, "_frozen", False):
            return
        elastic = kw.pop("elastic", False)
        nogap = kw.pop("nogap", False)
        anims = [prepare_animation(a) for a in anims]
        if any(isinstance(an, Wait) for an in anims):          # Scene.wait() routes through play(): holds are already scaled, don't rescale / re-gap
            return super().play(*anims, **kw)
        a_ = self._elastic() if elastic else self._cfg()[0]
        if "run_time" in kw:
            nat = kw["run_time"]
            kw["run_time"] *= a_
        else:
            nat = max(an.run_time for an in anims) if anims else 0
            for an in anims:
                an.run_time *= a_
        key = "_E" if elastic else "_A"
        setattr(self, key, getattr(self, key, 0.0) + nat)
        super().play(*anims, **kw)
        g = self.pace.get("g", 0.0) if isinstance(self.pace, dict) else 0.0
        if g > 0 and not elastic and not nogap and nat >= 0.3:          # breathing space after each beat, spread over the whole scene
            Scene.wait(self, g * nat)

    def wait(self, duration=1.0, *args, **kw):
        if getattr(self, "_frozen", False):
            return
        _, w_, _ = self._cfg()
        self._W = getattr(self, "_W", 0.0) + duration
        super().wait(duration * w_, *args, **kw)

    def tear_down(self):
        _, _, tgt = self._cfg()
        if tgt and not os.environ.get("MEASURE"):
            rem = tgt - self.renderer.time
            if rem > 0.05:
                Scene.wait(self, rem)
        super().tear_down()

    def hold(self, sec):
        super().wait(sec)

    def tick(self, n=1):
        """one short beat (0.3 s natural)"""
        self.wait(0.3 * n)

    def clear_out(self, t=0.5):
        """Fade everything out. For layout peeks (vbuild.py peek S04@1) PEEK_PHASE freezes the scene before the Nth clear_out."""
        n = getattr(self, "_clears", 0)
        self._clears = n + 1
        ph = os.environ.get("PEEK_PHASE")
        if os.environ.get("PEEK"):
            if ph is not None and int(ph) == n:
                self._frozen = True
            return
        if self.mobjects:
            self.play(FadeOut(*self.mobjects), run_time=t, nogap=True)


# ---------- reusable visuals ----------
def energy_curve(x, kind="double"):
    """Energy landscape U(x): 'double' (two valleys), 'single', 'rugged' (many valleys), 'smooth'."""
    if kind == "single":
        return 0.5 * x * x
    if kind == "double":
        return 0.12 * (x ** 4) - 0.55 * x * x + 0.15 * x
    if kind == "smooth":
        return 0.12 * x * x + 0.3 * np.cos(0.9 * x)
    # rugged: several deep valleys with tall barriers
    return 0.04 * x * x + 0.9 * np.cos(2.2 * x) + 0.45 * np.cos(4.3 * x + 0.7)


def langevin(U, steps, dt=0.05, T_=0.35, x0=0.0, seed=1, dU=None):
    """Seeded overdamped Langevin path for plotting (deterministic: same frames on every render)."""
    rng = np.random.default_rng(seed)
    xs = np.empty(steps)
    x = x0
    for i in range(steps):
        g = dU(x) if dU else (U(x + 1e-3) - U(x - 1e-3)) / 2e-3
        x = x - g * dt + np.sqrt(2 * T_ * dt) * rng.standard_normal()
        xs[i] = x
    return xs


def pixel_icon(kind="sneaker", n=14):
    """A tiny n x n binary icon (numpy 0/1) used as 'the data' for the denoising demos."""
    g = np.zeros((n, n), dtype=int)
    if kind == "sneaker":
        for r in range(n):
            for c in range(n):
                sole = r >= n - 4 and 1 <= c <= n - 2
                upper = (n - 8 <= r < n - 4) and (1 <= c <= n - 4 - (n - 5 - r))
                collar = (n - 10 <= r < n - 8) and (1 <= c <= 4)
                g[r, c] = 1 if (sole or upper or collar) else 0
    elif kind == "heart":
        for r in range(n):
            for c in range(n):
                x, y = (c - (n - 1) / 2) / (n / 2.4), -(r - n * 0.45) / (n / 2.4)
                g[r, c] = 1 if (x * x + y * y - 1) ** 3 - x * x * y ** 3 <= 0 else 0
    elif kind == "tshirt":
        for r in range(n):
            for c in range(n):
                body = 3 <= c <= n - 4 and 3 <= r <= n - 2
                sleeves = 0 <= c <= n - 1 and 2 <= r <= 5 and (c <= 3 or c >= n - 4)
                g[r, c] = 1 if (body or sleeves) and not (r <= 2 and 5 <= c <= n - 6) else 0
    return g


def pixel_grid(bits, size=3.0, on=INK, off="#ffffff", off_op=0.55, gap=0.04):
    """Mobject for a 0/1 array (rows top to bottom)."""
    n, m = bits.shape
    s = size / max(n, m)
    cells = VGroup()
    for r in range(n):
        for c in range(m):
            sq = Square(side_length=s - gap * s, stroke_width=0).set_fill(on if bits[r, c] else off, 1 if bits[r, c] else off_op)
            sq.move_to(np.array([(c - (m - 1) / 2) * s, -(r - (n - 1) / 2) * s, 0]))
            cells.add(sq)
    return cells


def set_bits(cells, bits, on=INK, off="#ffffff", off_op=0.55):
    """Animation-free recolour (use with .animate or direct)."""
    for sq, b in zip(cells, bits.flatten()):
        sq.set_fill(on if b else off, 1 if b else off_op)
    return cells


def noisy(bits, p, seed):
    rng = np.random.default_rng(seed)
    flip = rng.random(bits.shape) < p
    return np.where(flip, 1 - bits, bits)


def chip_icon(w=1.6, color=VIOLET):
    body = RoundedRectangle(width=w, height=w, corner_radius=0.18, stroke_width=0, fill_color=color, fill_opacity=1)
    inner = RoundedRectangle(width=w * 0.58, height=w * 0.58, corner_radius=0.1, stroke_width=0, fill_color=WHITE_, fill_opacity=0.9)
    pins = VGroup()
    for i in range(4):
        o = (i - 1.5) * w * 0.22
        for dx, dy, wid, hei in [(o, w / 2 + 0.1, 0.1, 0.22), (o, -w / 2 - 0.1, 0.1, 0.22), (w / 2 + 0.1, o, 0.22, 0.1), (-w / 2 - 0.1, o, 0.22, 0.1)]:
            pins.add(Rectangle(width=wid, height=hei, stroke_width=0, fill_color=color, fill_opacity=1).move_to(np.array([dx, dy, 0])))
    dot = Dot(radius=0.1, color=PINK).move_to(inner)
    return VGroup(pins, body, inner, dot)


def scene_title(txt, color=VIOLET):
    """Top-of-frame chapter-style label inside the safe zone."""
    p = pill(txt, color, 24)
    p.move_to(UP * SAFE_TOP)
    return p
