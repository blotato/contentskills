"""Renders this theme's effect previews: each effect over 2 seconds of the sample clip.
  .tools/venv-effects/bin/python library/themes/historical/effects/make_previews.py [name ...]
Looks and wear are shown at constant full strength; lights and cuts swell and fade.
"""
import json, math, subprocess, sys
from pathlib import Path
import cv2
here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / '_shared'))
from effects_engine import effect, load_theme
load_theme(here.parent)                      # this theme's own effects (theme_effects.py)

video = cv2.VideoCapture(str(here.parents[2] / '_shared/sample/clip.mp4'))
video.set(cv2.CAP_PROP_POS_FRAMES, 30)
frames = [cv2.resize(video.read()[1], (270, 480), interpolation=cv2.INTER_AREA) for _ in range(60)]
catalog = json.loads((here / 'catalog.json').read_text())['items']
steady = {item['id'] for item in catalog if item['group'] in ('Look', 'Wear')} | {'halation'}
wanted = set(sys.argv[1:])
(here / 'clips').mkdir(exist_ok=True)
for item in catalog:
    name = item['id']
    if item['src'].startswith('..'): continue   # shared previews: library/_shared/lighting_previews.py, signature_previews.py
    if wanted and name not in wanted: continue
    out = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', '270x480', '-r', '30', '-i', 'pipe:0', '-c:v', 'libx264', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(here / 'clips' / f'{name}.mp4')], stdin=subprocess.PIPE)
    for i, image in enumerate(frames):
        p = i / 59
        amount = 1 if name in steady else math.sin(math.pi * p) ** 2
        out.stdin.write(effect(name, image, p, amount, i, 1).tobytes())
    out.stdin.close(); out.wait(); print(name)
