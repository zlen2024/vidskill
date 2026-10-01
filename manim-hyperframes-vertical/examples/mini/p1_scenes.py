
# Two minimal scenes showing the idioms. Rules of thumb (see rules/pacing.md, rules/layout.md):
#  - natural duration of a scene ~ 1/3 of the narration; the pacing engine stretches it (animations x<=1.5, continuous processes `elastic`, holds after each beat)
#  - mark continuous sims / counters / jitter with elastic=True; keep discrete reveals plain
#  - clear_out() only BETWEEN phases; never at the very end (the compositor fades out; a final clear leaves a blank tail)
#  - stay inside the stage: y from TOP (+4.55) to BOT (-3.75); captions are drawn by the compositor below that


class S01_Hook(Timed):
    def construct(self):
        cols = [PINK, ORANGE, YELLOW, MINT, CYAN, VIOLET]
        chip = chip_icon(2.3).move_to(UP * 2.3)
        swarm = dots_swarm(70, 3, 1.6, 3.2, cols, center=chip.get_center())
        tr = ValueTracker(0)
        jiggle(swarm, tr, amp=0.3, speed=2.0, seed=2)           # updater-driven ambient motion, deterministic (seeded)
        swarm.set_opacity(0)
        self.add(swarm)
        self.play(GrowFromCenter(chip), swarm.animate.set_opacity(1), run_time=1.2)
        self.play(tr.animate.set_value(3), chip.animate.scale(1.08), run_time=1.6, rate_func=linear, elastic=True)
        title = VGroup(card(6.8, 2.5), TB("THERMODYNAMIC", 56).set_color_by_gradient(PINK, VIOLET)).move_to(DOWN * 1.0)
        title[1].scale_to_fit_width(5.8).move_to(title[0])
        self.play(FadeIn(title[0], shift=UP * 0.3), Write(title[1]), run_time=1.4)
        self.play(tr.animate.set_value(9), run_time=1.5, rate_func=linear, elastic=True)


class S02_Idea(Timed):
    def construct(self):
        self.play(FadeIn(chapter("IDEA · ENERGY LANDSCAPE", VIOLET), shift=DOWN * 0.2), run_time=0.4)
        U = lambda x: energy_curve(x, "double")
        sx, sy, ox, oy = 1.18, 0.62, 0.0, 1.0
        c = stage_card(5.2, 1.9, w=7.4)
        land = curve_mob(U, -2.9, 2.9, VIOLET, sx, sy, ox, oy)
        self.play(FadeIn(c), Create(land), run_time=1.2)
        xs = langevin(U, 1200, dt=0.05, T_=0.42, x0=-1.9, seed=5)      # seeded Langevin path: same frames on every render
        idx = ValueTracker(0)
        ball = glow_dot(PINK, 0.17)
        ball.add_updater(lambda m: m.move_to(to_pt(xs[int(idx.get_value())], U(xs[int(idx.get_value())]), sx, sy, ox, oy) + UP * 0.2))
        self.add(ball)
        self.play(idx.animate.set_value(1199), run_time=6.0, rate_func=linear, elastic=True)
        ball.clear_updaters()
        fm = VGroup(card(6.2, 1.4), M(r"P(x)\;\propto\; e^{-E(x)}", 56, INK)).next_to(c, DOWN, buff=0.6)
        fm[1].move_to(fm[0])
        self.play(FadeIn(fm[0], shift=UP * 0.3), Write(fm[1]), run_time=1.0)
        self.wait(1.0)                                           # explicit holds are stretched by pace['w']
