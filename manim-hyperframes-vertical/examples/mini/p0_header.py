import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from channel.vert import *

CH_Y = 5.5            # chapter pill
TOP, BOT = 4.55, -3.75    # usable stage (captions sit below BOT)
CX = 0.0


def chapter(txt, color=VIOLET):
    p = pill(txt, color, 22)
    p.move_to(UP * CH_Y)
    return p


def stage_card(h, y, w=7.2, **kw):
    return card(w, h, **kw).move_to(UP * y)


def to_pt(x, u, sx=1.0, sy=1.0, ox=0.0, oy=0.0):
    return np.array([ox + x * sx, oy + u * sy, 0.0])


def curve_mob(fn, x0, x1, color, sx, sy, ox, oy, n=200, width=6):
    xs = np.linspace(x0, x1, n)
    m = VMobject().set_points_smoothly([to_pt(x, fn(x), sx, sy, ox, oy) for x in xs])
    m.set_stroke(color, width).set_fill(opacity=0)
    return m


def dots_swarm(n, seed, rmin, rmax, colors, center=ORIGIN, radius=0.07):
    rng = np.random.default_rng(seed)
    out = VGroup()
    for i in range(n):
        a, r = rng.uniform(0, 2 * np.pi), rng.uniform(rmin, rmax)
        d = Dot(radius=radius * rng.uniform(0.7, 1.4), color=colors[i % len(colors)]).move_to(center + r * np.array([np.cos(a), np.sin(a), 0]))
        out.add(d)
    return out


def jiggle(group, tracker, amp=0.2, speed=1.0, seed=0):
    base = [m.get_center().copy() for m in group]
    ph = np.random.default_rng(seed).uniform(0, 6.28, (len(group), 2))
    fr = np.random.default_rng(seed + 1).uniform(1.5, 3.5, (len(group), 2))

    def up(g):
        t = tracker.get_value() * speed
        for i, m in enumerate(g):
            m.move_to(base[i] + amp * np.array([np.sin(fr[i, 0] * t + ph[i, 0]), np.cos(fr[i, 1] * t + ph[i, 1]), 0]))
    group.add_updater(up)
    return group
