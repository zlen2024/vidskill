"""Vertical long-form pipeline: Manim (transparent) + HyperFrames backgrounds/FX + voice + captions + music.

Run from the PROJECT root (or set VB_ROOT). Episodes live in videos/<ep>/ (scenes.py, narration.json, plan.json, audio/<Scene>.wav).

  python <skill>/scripts/vbuild.py init                       # copy the kit (channel/vert.py) + HyperFrames templates into the project
  python ... new 07_topic                                      # episode skeleton (parts/, narration.py, build_scenes.py)
  python ... placeholders 07_topic                             # silent audio sized from the text (test layout/timing with no TTS)
  python ... bgs | fx                                          # render the looping backgrounds / transparent FX once
  python ... pace  07_topic                                    # per-scene pacing from audio length -> pace.json
  python ... peek  07_topic S04_Noise@0 S04_Noise@1 -q l       # layout stills; @N freezes before the Nth clear_out
  python ... manim 07_topic [Scene ...] -q l|m|h -j 3          # transparent webm per scene
  python ... comp  07_topic [Scene ...] -q l|m|h               # bg + manim + fx + voice + captions -> out/scenes_<q>/*.mp4
  python ... final 07_topic -q l|m|h                           # concat + music + sfx -> out/<ep>_<q>.mp4
  python <skill>/scripts/vsheet.py 07_topic l S01 S02 ...      # contact sheet of composed scenes

Quality: l = 480x854, m = 720x1280, h = 1080x1920, all 30 fps. Voice WAVs come from any TTS: audio/<Scene>.wav (mono/stereo, any rate).
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import wave
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import ast

SKILL = Path(__file__).resolve().parents[1]
ROOT = Path(os.environ.get("VB_ROOT") or Path.cwd()).resolve()


def find_manim():
    exe = ROOT / ".venv" / ("Scripts" if os.name == "nt" else "bin") / "manim"
    return [str(exe)] if exe.with_suffix(".exe").exists() or exe.exists() else [sys.executable, "-m", "manim"]


def python_exe():
    exe = ROOT / ".venv" / ("Scripts" if os.name == "nt" else "bin") / ("python.exe" if os.name == "nt" else "python")
    return str(exe) if exe.exists() else sys.executable


def env_with_latex():
    env = os.environ.copy()
    env.setdefault("PYTHONUTF8", "1")
    tinytex = Path(os.environ.get("APPDATA", "")) / "TinyTeX" / "bin" / "windows"
    if tinytex.exists():
        env["PATH"] = f"{tinytex}{os.pathsep}{env['PATH']}"
    return env


def scene_order(scenes_py: Path):
    """Read SCENES = [...] without importing (importing would boot manim)."""
    tree = ast.parse(scenes_py.read_text(encoding="utf-8"))
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(getattr(t, "id", None) == "SCENES" for t in node.targets):
            return ast.literal_eval(node.value)
    sys.exit(f"{scenes_py} has no SCENES = [...] list")


FPS = 30
SIZES = {"l": (480, 854), "m": (720, 1280), "h": (1080, 1920)}
RES_DIR = {"l": f"854p{FPS}", "m": f"1280p{FPS}", "h": f"1920p{FPS}"}
TAIL = 0.7
ASSETS = ROOT / "vbuild_assets"
BG_DIR = ASSETS / "bg"
HF_BG = ASSETS / "hf_bg"
BG_LOOP = 12.0
SYNTH = Path(os.environ.get("VB_SYNTH") or SKILL.parent / "motionprompt-styles" / "scripts" / "synth.mjs")
def _font(names):
    for base in (r"C:\Windows\Fonts", "/usr/share/fonts/truetype/dejavu", "/Library/Fonts", "/System/Library/Fonts/Supplemental"):
        for n in names:
            if (Path(base) / n).exists():
                return str(Path(base) / n)
    return names[0]


FONT_B = os.environ.get("VB_FONT_BOLD") or _font(["segoeuib.ttf", "DejaVuSans-Bold.ttf", "Arial Bold.ttf"])
FONT_R = os.environ.get("VB_FONT") or _font(["segoeui.ttf", "DejaVuSans.ttf", "Arial.ttf"])


def ffmpeg(*a):
    r = subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *map(str, a)], capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode:
        raise SystemExit(f"ffmpeg failed:\n{r.stderr[-2500:]}")


def wav_seconds(p: Path) -> float:
    with wave.open(str(p)) as w:
        return w.getnframes() / w.getframerate()


def media_seconds(p: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True)
    return float(r.stdout.strip())


def webm_seconds(p: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-c:v", "libvpx-vp9", "-count_packets", "-show_entries", "stream=nb_read_packets,r_frame_rate", "-of", "csv=p=0", str(p)], capture_output=True, text=True)
    fr, n = r.stdout.strip().split(",")[:2]
    a, b = fr.split("/")
    return int(n) * int(b) / int(a)


def load(ep):
    d = ROOT / "videos" / ep
    cfg = json.loads((d / "narration.json").read_text(encoding="utf-8"))
    plan = json.loads((d / "plan.json").read_text(encoding="utf-8")) if (d / "plan.json").exists() else {}
    return d, cfg, plan, scene_order(d / "scenes.py")


def target_len(d, cfg, scene):
    a = d / "audio" / f"{scene}.wav"
    return cfg.get("lead_in", 0.4) + wav_seconds(a) + TAIL if a.exists() else None


# ------------------------------------------------------------------ init / new / placeholders
def cmd_init(args):
    ASSETS.mkdir(exist_ok=True)
    for name in ("hf_bg", "hf_fx"):
        dst = ASSETS / name
        if dst.exists() and not args.force:
            print("= exists", dst)
            continue
        shutil.copytree(SKILL / "templates" / name, dst, dirs_exist_ok=True)
        print("+", dst)
    kit = ROOT / "channel"
    kit.mkdir(exist_ok=True)
    (kit / "__init__.py").touch()
    if not (kit / "vert.py").exists() or args.force:
        shutil.copy(SKILL / "scripts" / "kit" / "vert.py", kit / "vert.py")
        print("+", kit / "vert.py")
    print("next: vbuild.py bgs ; vbuild.py fx   (once), then `new <episode>`")


def cmd_new(args):
    d = ROOT / "videos" / args.episode
    (d / "parts").mkdir(parents=True, exist_ok=True)
    (d / "audio").mkdir(exist_ok=True)
    for src, dst in (("narration.py", "narration.py"), ("build_scenes.py", "build_scenes.py"), ("p0_header.py", "parts/p0_header.py"), ("p1_scenes.py", "parts/p1_scenes.py")):
        if not (d / dst).exists():
            shutil.copy(SKILL / "examples" / "mini" / src, d / dst)
    print("episode skeleton in", d, "-> edit narration.py + parts/p1_scenes.py, then: python narration.py && python build_scenes.py")


def cmd_placeholders(args):
    d, cfg, plan, order = load(args.episode)
    for s in order:
        p = d / "audio" / f"{s}.wav"
        if p.exists():
            continue
        dur = len(cfg["scenes"].get(s, "")) * 0.0794          # ~sec/char measured on a slow storyteller TTS; recalibrate per voice
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", f"{dur:.2f}", "-c:a", "pcm_s16le", str(p)], check=True)
        print("placeholder", p.name, f"{dur:.1f}s")


# ------------------------------------------------------------------ bgs
def cmd_bgs(args):
    pals = json.loads((HF_BG / "palettes.json").read_text(encoding="utf-8"))
    BG_DIR.mkdir(parents=True, exist_ok=True)
    for name, p in pals.items():
        out = BG_DIR / f"{name}.mp4"
        if out.exists() and not args.force:
            print("= bg", name, "(exists)")
            continue
        (HF_BG / "palette.js").write_text("window.PALETTE = " + json.dumps({"name": name, **p}) + ";\n", encoding="utf-8")
        print("▶ bg", name, flush=True)
        r = subprocess.run("npx --yes hyperframes@0.8.96 render -w 1 -o " + str(out), cwd=HF_BG, shell=True, capture_output=True, text=True, encoding="utf-8", errors="replace")
        if r.returncode:
            raise SystemExit(r.stdout[-2000:] + r.stderr[-2000:])
        print("✓", out.name)


# ------------------------------------------------------------------ fx (transparent overlays from HyperFrames)
FX_DIR = ASSETS / "fx"
HF_FX = ASSETS / "hf_fx"
FX_SPECS = {"burst": {"dur": 2.4, "seed": 5}, "rain": {"dur": 2.6, "seed": 9}, "sweep": {"dur": 1.0, "seed": 1}}


def cmd_fx(args):
    FX_DIR.mkdir(parents=True, exist_ok=True)
    for name, sp in FX_SPECS.items():
        out = FX_DIR / f"{name}.mov"
        if out.exists() and not args.force:
            print("= fx", name, "(exists)")
            continue
        (HF_FX / "fx.js").write_text("window.FX = " + json.dumps({"name": name, **sp}) + ";\n", encoding="utf-8")
        print("▶ fx", name, flush=True)
        r = subprocess.run("npx --yes hyperframes@0.8.96 render --format mov -w 1 -o " + str(out), cwd=HF_FX, shell=True, capture_output=True, text=True, encoding="utf-8", errors="replace")
        if r.returncode:
            raise SystemExit(r.stdout[-2000:] + r.stderr[-2000:])
        print("✓", out.name)


# ------------------------------------------------------------------ pace
def cmd_pace(args):
    d, cfg, plan, order = load(args.episode)
    pf = d / "pace.json"
    pace = json.loads(pf.read_text()) if pf.exists() else {}
    env = env_with_latex()
    for s in (args.scenes or order):
        tgt = target_len(d, cfg, s)
        if tgt is None:
            print(f"- {s}: no audio yet")
            continue
        r = subprocess.run([python_exe(), str(SKILL / "scripts" / "_measure.py"), args.episode, s], capture_output=True, text=True, encoding="utf-8", errors="replace", env=env, cwd=ROOT)
        m = re.search(r"DURATION ([\d.]+) ANIM ([\d.]+) WAIT ([\d.]+) ELASTIC ([\d.]+)", r.stdout)
        if not m:
            print(r.stdout[-1500:], r.stderr[-1500:])
            raise SystemExit(f"measure failed for {s}")
        nat, A, Wt, E_ = float(m.group(1)), float(m.group(2)), float(m.group(3)), float(m.group(4))
        a = min(tgt / nat, 1.5)                       # discrete animations: modest slow-down
        w = min(1.6, 1 + (tgt / nat - 1) * 0.3) if Wt > 0.2 else 1.0
        e = a
        if E_ > 0.5:                                  # continuous processes soak up part of the stretch
            e = max(a, min(4.5, (tgt - a * A - w * Wt) * 0.6 / E_))
        g = max(0.0, (tgt - a * A - w * Wt - e * E_) / A) if A > 0.5 else 0.0     # the rest = holds after each beat
        pace[s] = {"a": round(a, 3), "w": round(w, 3), "e": round(e, 3), "g": round(g, 3), "T": round(tgt, 3)}
        print(f"{s:<16} nat {nat:5.1f}s (anim {A:4.1f}, wait {Wt:4.1f}, elastic {E_:4.1f}) target {tgt:5.1f}s -> a x{a:.2f} w x{w:.2f} e x{e:.2f} hold {g:.2f}/s")
    pf.write_text(json.dumps(pace, indent=1))


# ------------------------------------------------------------------ manim
def manim_render(ep, scene, q, still, env):
    d = ROOT / "videos" / ep
    env = dict(env)
    env["PACE_FILE"] = str(d / "pace.json")
    env["VFPS"] = str(FPS)
    cmd = find_manim() + [f"-q{'l' if q == 'l' else 'm' if q == 'm' else 'h'}", "--format", "webm", "--no_latex_cleanup", "--transparent", "--media_dir", str(d / "media"), str(d / "scenes.py"), scene]
    if still:
        cmd.insert(-2, "-s")
    print("▶", scene, flush=True)
    r = subprocess.run(cmd, cwd=ROOT, env=env, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode:
        print(r.stdout[-3000:], r.stderr[-3000:], sep="\n")
        raise SystemExit(f"✗ {scene} failed")
    print("✓", scene, flush=True)


def cmd_manim(args):
    d, cfg, plan, order = load(args.episode)
    env = env_with_latex()
    todo = args.scenes or order
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        list(pool.map(lambda s: manim_render(args.episode, s, args.quality, args.still, env), todo))


# ------------------------------------------------------------------ captions
def _split_long(p, limit=105):
    if len(p) <= limit:
        return [p]
    cands = [m.end() for m in re.finditer(r"[,:;] ", p)]
    cands = [c for c in cands if 28 <= c <= len(p) - 28]
    if not cands:
        return [p]
    c = min(cands, key=lambda c: abs(c - len(p) / 2))
    return _split_long(p[:c].strip(), limit) + _split_long(p[c:].strip(), limit)


def split_sentences(text):
    parts = [q for p in re.split(r"(?<=[.!?…])\s+", text.strip()) for q in _split_long(p)]
    out = []
    for p in parts:
        if out and (len(p) < 22 or len(out[-1]) < 22):
            out[-1] += " " + p
        else:
            out.append(p)
    return out


def wrap(text, font, maxw):
    from PIL import ImageDraw, Image
    dr = ImageDraw.Draw(Image.new("RGB", (4, 4)))
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if dr.textlength(t, font=font) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


def caption_png(text, W, path):
    from PIL import Image, ImageDraw, ImageFont
    sc = W / 1080
    font = ImageFont.truetype(FONT_B, int(40 * sc))
    lines = wrap(text, font, int(W * 0.86))
    lh = int(54 * sc)
    padx, pady = int(40 * sc), int(26 * sc)
    tw = max(ImageDraw.Draw(Image.new("RGB", (4, 4))).textlength(l, font=font) for l in lines)
    w, h = int(tw + 2 * padx), lh * len(lines) + 2 * pady
    im = Image.new("RGBA", (w + 24, h + 30), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    dr.rounded_rectangle((12, 20, 12 + w, 20 + h), radius=int(34 * sc), fill=(60, 30, 120, 70))      # soft shadow
    dr.rounded_rectangle((12, 12, 12 + w, 12 + h), radius=int(34 * sc), fill=(255, 255, 255, 238))
    for i, l in enumerate(lines):
        x = 12 + (w - dr.textlength(l, font=font)) / 2
        dr.text((x, 12 + pady + i * lh), l, font=font, fill=(27, 23, 64, 255))
    im.save(path)
    return im.size


# ------------------------------------------------------------------ comp
def scene_clip(d, scene, q):
    return d / "media" / "videos" / "scenes" / RES_DIR[q] / f"{scene}.webm"


def comp_scene(d, cfg, plan, scene, q, t_off, out, still=False):
    W, H = SIZES[q]
    L = target_len(d, cfg, scene)
    clip = scene_clip(d, scene, q)
    if not clip.exists():
        raise SystemExit(f"missing {clip}: run vbuild.py manim")
    pal = (plan.get(scene) or {}).get("pal", "sunrise")
    bg = BG_DIR / f"{pal}.mp4"
    if not bg.exists():
        raise SystemExit(f"missing background {bg}: run vbuild.py bgs")
    lead = cfg.get("lead_in", 0.4)
    wav = d / "audio" / f"{scene}.wav"
    text = cfg["scenes"].get(scene, "")
    sents = split_sentences(text)
    weights = [len(s) + (8 if s.endswith("...") else 0) for s in sents]
    dur_v = wav_seconds(wav)
    work = d / "out" / f"tmp_{q}"
    work.mkdir(parents=True, exist_ok=True)
    caps, t = [], lead
    for i, s in enumerate(sents):
        dt = dur_v * weights[i] / sum(weights)
        p = work / f"{scene}_c{i}.png"
        caption_png(s, W, p)
        caps.append((p, t, t + dt))
        t += dt
    cy = int(H * 0.828)
    inputs = ["-stream_loop", "-1", "-ss", f"{t_off % BG_LOOP:.3f}", "-i", bg, "-c:v", "libvpx-vp9", "-i", clip, "-i", wav]
    for p, a, b in caps:
        inputs += ["-loop", "1", "-framerate", FPS, "-t", f"{b - a + 0.1:.3f}", "-i", p]
    clip_len = webm_seconds(clip)
    fxs = [dict(e) for e in ((plan.get(scene) or {}).get("fx") or [])]
    if (plan.get(scene) or {}).get("sweep", True):
        fxs.insert(0, {"k": "sweep", "t": 0.05})
    for e in fxs:
        tt = e["t"] if "t" in e else e["f"] * L
        inputs += ["-i", FX_DIR / f"{e['k']}.mov"]
        e["_t"] = max(0.0, tt)
    f = [f"[0:v]scale={W}:{H}:flags=bicubic,fps={FPS},trim=duration={L:.3f},setpts=PTS-STARTPTS[bg]",
         f"[1:v]format=rgba,fps={FPS},tpad=stop_mode=clone:stop_duration={max(0.0, L - clip_len) + 0.2:.3f},trim=duration={L:.3f},setpts=PTS-STARTPTS[fg]",
         "[bg][fg]overlay=format=auto[v0]"]
    last = "v0"
    for i, (p, a, b) in enumerate(caps):
        n = 3 + i
        f.append(f"[{n}:v]format=rgba,fade=t=in:st=0:d=0.18:alpha=1,fade=t=out:st={b - a - 0.12:.3f}:d=0.2:alpha=1,setpts=PTS+{a:.3f}/TB[c{i}]")
        f.append(f"[{last}][c{i}]overlay=x=(W-w)/2:y={cy}-h/2:eof_action=pass:format=auto[v{i + 1}]")
        last = f"v{i + 1}"
    for j, e in enumerate(fxs):
        n = 3 + len(caps) + j
        f.append(f"[{n}:v]format=rgba,scale={W}:{H},setpts=PTS+{e['_t']:.3f}/TB[fx{j}]")
        f.append(f"[{last}][fx{j}]overlay=eof_action=pass:format=auto[vf{j}]")
        last = f"vf{j}"
    f.append(f"[{last}]fade=t=in:st=0:d=0.28:color=white,fade=t=out:st={L - 0.28:.3f}:d=0.28:color=white,format=yuv420p[vout]")
    f.append(f"[2:a]adelay={int(lead * 1000)}:all=1,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,apad=whole_dur={L:.3f},atrim=0:{L:.3f}[aout]")
    if still:
        ffmpeg(*inputs, "-filter_complex", ";".join(f), "-map", "[vout]", "-ss", f"{max(0.1, L - 1.2):.2f}", "-frames:v", 1, out)
        return L
    ffmpeg(*inputs, "-filter_complex", ";".join(f), "-map", "[vout]", "-map", "[aout]", "-t", f"{L:.3f}",
           "-c:v", "libx264", "-crf", "18" if q != "h" else "16", "-preset", "medium", "-pix_fmt", "yuv420p", "-r", FPS, "-c:a", "aac", "-b:a", "192k", "-ac", "2", out)
    return L


def cmd_comp(args, still=False):
    d, cfg, plan, order = load(args.episode)
    out_dir = d / "out" / f"scenes_{args.quality}"
    out_dir.mkdir(parents=True, exist_ok=True)
    t = 0.0
    starts = {}
    for s in order:
        starts[s] = t
        L = target_len(d, cfg, s)
        t += L or 0
    todo = args.scenes or order
    for s in todo:
        out = out_dir / (f"{s}.png" if still else f"{s}.mp4")
        print("▶ comp", s, flush=True)
        comp_scene(d, cfg, plan, s, args.quality, starts[s], out, still)
    print("done ->", out_dir)


# ------------------------------------------------------------------ peek (layout check without audio)
def cmd_peek(args):
    d, cfg, plan, order = load(args.episode)
    env = env_with_latex()
    W, H = SIZES[args.quality]
    sheet = []
    for spec in (args.scenes or order):
        s, _, phase = spec.partition("@")
        env2 = dict(env, PEEK="1")
        if phase:
            env2["PEEK_PHASE"] = phase
        manim_render(args.episode, s, args.quality, True, env2)
        pngs = sorted((d / "media" / "images" / "scenes").glob(f"{s}_*.png"), key=lambda p: p.stat().st_mtime)
        pal = (plan.get(s) or {}).get("pal", "sunrise")
        out = d / "out" / f"peek_{s}{("_" + phase) if phase else ""}.png"
        out.parent.mkdir(exist_ok=True)
        ffmpeg("-ss", "2", "-i", BG_DIR / f"{pal}.mp4", "-i", pngs[-1], "-filter_complex", f"[0:v]scale={W}:{H}[b];[b][1:v]overlay=format=auto,drawbox=y={int(H*0.828)-30}:w=iw:h=60:color=black@0.18:t=fill", "-frames:v", 1, out)
        sheet.append(out)
        print("peek ->", out)
    if len(sheet) > 1:
        ins = []
        for p_ in sheet:
            ins += ["-i", p_]
        ffmpeg(*ins, "-filter_complex", "".join(f"[{i}:v]scale=360:-1[s{i}];" for i in range(len(sheet))) + "".join(f"[s{i}]" for i in range(len(sheet))) + f"hstack=inputs={len(sheet)}", "-frames:v", 1, d / "out" / "peek_sheet.png")
        print("sheet -> out/peek_sheet.png")


# ------------------------------------------------------------------ final
def cmd_final(args):
    d, cfg, plan, order = load(args.episode)
    q = args.quality
    sc = d / "out" / f"scenes_{q}"
    parts = [sc / f"{s}.mp4" for s in order]
    for p in parts:
        if not p.exists():
            raise SystemExit(f"missing {p}: run vbuild.py comp")
    lens = [media_seconds(p) for p in parts]
    total = sum(lens)
    lst = d / "out" / f"concat_{q}.txt"
    lst.write_text("".join(f"file '{p.as_posix()}'\n" for p in parts), encoding="utf-8")
    vis = d / "out" / f"visual_{q}.mp4"
    ffmpeg("-f", "concat", "-safe", 0, "-i", lst, "-c", "copy", vis)
    if not SYNTH.exists():
        final = d / "out" / f"{args.episode}_{q}.mp4"
        shutil.copy(vis, final)
        print(f"no synth.mjs (install motionprompt-styles or set VB_SYNTH): final without music -> {final}")
        return
    # music + sfx at every scene change
    cues, t = [], 0.0
    for i, L in enumerate(lens):
        cues.append({"t": round(t + 0.02, 3), "kind": "whoosh", "dir": "up", "dur": 0.8, "vol": 0.45})
        cues.append({"t": round(t + 0.35, 3), "kind": "sparkle", "dur": 0.9, "vol": 0.28})
        t += L
    sheet = {"duration": round(total, 3), "seed": 7, "sound": "music", "bpm": 100,
             "music": {"preset": cfg.get("music", "corporate-calm"), "gain": 1, "duck": 0.35, "align": "beat"}, "cues": cues, "master": {"peakDb": -3}}
    sj = d / "out" / "sound.json"
    sj.write_text(json.dumps(sheet), encoding="utf-8")
    music = d / "out" / "music.wav"
    r = subprocess.run(["node", str(SYNTH), "--cues", str(sj), "--out", str(music)], capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(r.stdout + r.stderr)
    final = d / "out" / f"{args.episode}_{q}.mp4"
    mg = cfg.get("music_gain", 0.55)
    ffmpeg("-i", vis, "-i", music, "-filter_complex",
           f"[1:a]aresample=44100,volume={mg}[m];[0:a]asplit=2[vo][key];[m][key]sidechaincompress=threshold=0.03:ratio=8:attack=15:release=450[duck];"
           f"[vo][duck]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]",
           "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", final)
    print(f"🎬 {final}  ({media_seconds(final):.1f}s)")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("bgs"); p.add_argument("--force", action="store_true")
    p = sub.add_parser("fx"); p.add_argument("--force", action="store_true")
    p = sub.add_parser("init"); p.add_argument("--force", action="store_true")
    p = sub.add_parser("new"); p.add_argument("episode")
    p = sub.add_parser("placeholders"); p.add_argument("episode")
    for name in ("pace", "manim", "comp", "final", "still", "peek"):
        p = sub.add_parser(name)
        p.add_argument("episode")
        p.add_argument("scenes", nargs="*")
        p.add_argument("-q", "--quality", default="l", choices=SIZES)
        p.add_argument("-j", "--jobs", type=int, default=2)
        p.add_argument("--still", action="store_true")
    a = ap.parse_args()
    {"bgs": cmd_bgs, "fx": cmd_fx, "init": cmd_init, "new": cmd_new, "placeholders": cmd_placeholders, "pace": cmd_pace, "manim": cmd_manim, "comp": cmd_comp, "final": cmd_final, "peek": cmd_peek, "still": lambda x: cmd_comp(x, True)}[a.cmd](a)


if __name__ == "__main__":
    main()
