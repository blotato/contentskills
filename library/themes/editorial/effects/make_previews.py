"""Renders this theme's effect previews: each effect over 2 seconds of the sample clip.
  .tools/venv-effects/bin/python library/themes/editorial/effects/make_previews.py [name ...]
Footage in this theme runs under the `editorial_grade` look, so every effect is shown over it (the grade itself
is shown on the raw clip, wiping on from the left so the difference can be seen). Each effect is driven the way
a storyboard would drive it: looks hold, timed ones run once over the 2 s, cut landings ("in") and swells
("pulse") play twice.
"""
import json, math, subprocess, sys
from pathlib import Path
import cv2
import numpy as np
here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / '_shared'))
from effects_engine import effect, smooth, load_theme
load_theme(here.parent)

W, H, N, LOOK = 270, 480, 60, .7
video = cv2.VideoCapture(str(here.parents[2] / '_shared/sample/clip.mp4'))
video.set(cv2.CAP_PROP_POS_FRAMES, 30)
frames = [cv2.resize(video.read()[1], (W, H), interpolation=cv2.INTER_AREA) for _ in range(N)]
steady = {'paper_grain': .8, 'vignette_soft': 1, 'halation': .6, 'focus': .8}                    # hold their strength
timed = {'moody_grade': 1, 'moody_cover': 1, 'soft_push': 1, 'light_sweep': .85, 'siren_glow': .9, 'siren_beams': 1}                # run once over the 2 s ("where": "all")
landing = {'glide_blur': 1, 'focus_pull': 1}                                   # "where": "in", twice: at 0.2 s and 1.2 s
extra = {'moody_grade': {'wipe': True}, 'moody_cover': {'fade': .3, 'fade_out': .2, 'face': [.5, .4]}}
props = {'seconds': N / 30, 'fps': 30}
wanted = set(sys.argv[1:])
(here / 'clips').mkdir(exist_ok=True)
for item in json.loads((here / 'catalog.json').read_text())['items']:
    name = item['id']
    if item['src'].startswith('..'): continue   # shared previews live in library/_shared
    if wanted and name not in wanted: continue
    out = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', '30', '-i', 'pipe:0', '-c:v', 'libx264', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(here / 'clips' / f'{name}.mp4')], stdin=subprocess.PIPE)
    for i, image in enumerate(frames):
        p = i / (N - 1)
        if name == 'editorial_grade':                               # the raw clip, the grade wiping on from the left and staying
            graded = effect(name, image, p, LOOK, i, 1, props=props)
            edge = int(round(W * smooth((i - 12) / 14)))
            image = image.copy(); image[:, :edge] = graded[:, :edge]
            if 0 < edge < W: image[:, edge:edge + 1] = (235, 240, 237)
            out.stdin.write(image.tobytes()); continue
        image = effect('editorial_grade', image, p, LOOK, i, 1, props=props)
        if name in steady: image = effect(name, image, p, steady[name], i, 1, props=props)
        elif name in timed: image = effect(name, image, p, timed[name], i, 1, props={**props, **extra.get(name, {})})
        elif name in landing:
            q = ((i - 6) % 30) / 11                                 # 12 frames (0.4 s) after each of the two "cuts"
            if i >= 6 and q <= 1: image = effect(name, image, q, landing[name] * (1 - smooth(q)), i, 1, props={**props, 'seconds': .4})
        else:                                                       # a swell: "where": "pulse", 0.5 s, twice
            q = ((i - 8) % 30) / 14
            if i >= 8 and q <= 1: image = effect(name, image, q, math.sin(math.pi * q) ** 2, i, 1, props={**props, 'seconds': .5})
        out.stdin.write(image.tobytes())
    out.stdin.close(); out.wait(); print(name)
