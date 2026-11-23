"""Renders this theme's effect previews: each effect over 2 seconds of the sample clip.
  .tools/venv-effects/bin/python library/themes/horror/effects/make_previews.py [name ...]
Looks are shown at constant strength over the theme's cold grade; everything else swells and fades.
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
steady = {'cold_grade': 1, 'night_tint': 1, 'heavy_vignette': 1, 'dark_fog': 1, 'film_damage': 1, 'vhs_tracking': 1, 'lamp_flicker': 1, 'blackout': .5, 'slow_warp': 1, 'creep_zoom': 1, 'mirror_seam': 1, 'grain': 1, 'vignette': 1}
ungraded = {'cold_grade', 'night_tint'}
wanted = set(sys.argv[1:])
(here / 'clips').mkdir(exist_ok=True)
for item in json.loads((here / 'catalog.json').read_text())['items']:
    name = item['id']
    if item['src'].startswith('..'): continue   # shared previews: library/_shared/lighting_previews.py, signature_previews.py
    if wanted and name not in wanted: continue
    out = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', '270x480', '-r', '30', '-i', 'pipe:0', '-c:v', 'libx264', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(here / 'clips' / f'{name}.mp4')], stdin=subprocess.PIPE)
    for i, image in enumerate(frames):
        p = i / 59
        amount = steady[name] if name in steady else math.sin(math.pi * p) ** 2
        if name not in ungraded: image = effect('cold_grade', image, p, .8, i, 1)      # how the theme's footage normally looks
        out.stdin.write(effect(name, image, p, amount, i, 1).tobytes())
    out.stdin.close(); out.wait(); print(name)
