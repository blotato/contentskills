"""Renders this theme's effect previews: each effect pulsing over 2 seconds of the sample clip.
  .tools/venv-effects/bin/python library/themes/futuristic/effects/make_previews.py
"""
import json, math, subprocess, sys
from pathlib import Path
import cv2
here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / '_shared'))
from effects_engine import effect

video = cv2.VideoCapture(str(here.parents[2] / '_shared/sample/clip.mp4'))
video.set(cv2.CAP_PROP_POS_FRAMES, 30)
frames = [cv2.resize(video.read()[1], (270, 480), interpolation=cv2.INTER_AREA) for _ in range(60)]
steady = {'night_vision', 'thermal', 'edge_hud', 'cyber_poster', 'halftone', 'neon_bloom', 'vhs', 'cool_grade', 'hologram', 'scanlines', 'crt', 'neon_edges', 'duotone', 'vignette', 'grain'}   # looks, shown at constant strength
for item in json.loads((here / 'catalog.json').read_text())['items']:
    name = item['id']
    if item['src'].startswith('..'): continue   # shared previews: library/_shared/lighting_previews.py, signature_previews.py
    out = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', '270x480', '-r', '30', '-i', 'pipe:0', '-c:v', 'libx264', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(here / 'clips' / f'{name}.mp4')], stdin=subprocess.PIPE)
    for i, image in enumerate(frames):
        p = i / 59
        amount = 1 if name in steady else math.sin(math.pi * p) ** 2
        out.stdin.write(effect(name, image, p, amount, i, 1).tobytes())
    out.stdin.close(); out.wait(); print(name)
