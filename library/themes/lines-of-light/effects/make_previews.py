"""Renders this theme's effect previews: each effect over 2 seconds of the sample clip.
  .tools/venv-effects/bin/python library/themes/lines-of-light/effects/make_previews.py [name ...]
Footage in this theme normally runs under the `night` look, so every effect is shown over it (night itself
is shown on the raw clip). Steady treatments hold their strength; hits swell and fade.
"""
import json, math, subprocess, sys
from pathlib import Path
import cv2
here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / '_shared'))
from effects_engine import effect, load_theme
load_theme(here.parent)

video = cv2.VideoCapture(str(here.parents[2] / '_shared/sample/clip.mp4'))
video.set(cv2.CAP_PROP_POS_FRAMES, 30)
frames = [cv2.resize(video.read()[1], (270, 480), interpolation=cv2.INTER_AREA) for _ in range(60)]
steady = {'night': .9, 'scan_haze': 1, 'lilac_bloom': .8, 'grain': 1, 'vignette': 1, 'halation': .8, 'chromatic': .7, 'scanlines': .8}
ramp = {'line_sweep', 'result_flash', 'lock_flash'}        # progress drives the motion; amount stays up
ungraded = {'night'}
wanted = set(sys.argv[1:])
(here / 'clips').mkdir(exist_ok=True)
for item in json.loads((here / 'catalog.json').read_text())['items']:
    name = item['id']
    if item['src'].startswith('..'): continue   # shared previews: library/_shared/lighting_previews.py, signature_previews.py
    if wanted and name not in wanted: continue
    out = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', '270x480', '-r', '30', '-i', 'pipe:0', '-c:v', 'libx264', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(here / 'clips' / f'{name}.mp4')], stdin=subprocess.PIPE)
    for i, image in enumerate(frames):
        p = i / 59
        if name in steady: amount = steady[name]
        elif name in ramp: amount = min(1, math.sin(math.pi * p) * 3)
        else: amount = math.sin(math.pi * p) ** 2
        if name not in ungraded: image = effect('night', image, p, .9, i, 1)      # how the theme's footage normally looks
        out.stdin.write(effect(name, image, p, amount, i, 1).tobytes())
    out.stdin.close(); out.wait(); print(name)
