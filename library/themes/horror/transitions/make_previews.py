"""Renders this theme's transition previews: the sample clip (in the theme's cold grade) handing over to a title card.
  .tools/venv-effects/bin/python library/themes/horror/transitions/make_previews.py [name ...]
Each loop is 1.6 seconds at 270x480: a short hold on the clip, the transition, a short hold on the card.
"""
import json, subprocess, sys
from pathlib import Path
import cv2
import numpy as np
here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / '_shared'))
import shader_transitions
from shader_transitions import render
shader_transitions.load_theme(here.parent)                 # this theme's own transitions (theme_transitions.py) and its colours
from effects_engine import effect, load_theme
load_theme(here.parent)

W, H, HOLD, MOVE = 270, 480, 8, 32          # frames: hold, transition, hold = 48 at 30 fps
BONE, ROSE, FOG = (223, 230, 233), (107, 85, 224), (159, 151, 141)

def graphic():
    """A stand-in for a title card in the theme's look (BGR): near-black slate with a faint glow, a vignette,
    grain, and small tracked capitals with one rose letter. Drawn at 4x and reduced."""
    s = 4; w, h = W * s, H * s
    y, x = np.mgrid[0:h, 0:w].astype(np.float32); r = np.sqrt(((x - w / 2) / (w * .8)) ** 2 + ((y - h * .5) / (h * .55)) ** 2)
    lift = np.clip(1 - r, 0, 1)[..., None] ** 1.5
    image = (np.array([16, 13, 10], np.float32) + lift * np.array([27, 24, 19], np.float32))
    image += np.random.default_rng(3).normal(0, 3.5, (h, w, 1)).astype(np.float32)
    image = np.clip(image, 0, 255).astype(np.uint8)
    def text(label, yy, scale, color, thick, gap, mark=-1):
        sizes = [cv2.getTextSize(c, cv2.FONT_HERSHEY_DUPLEX, scale * s, thick * s)[0][0] for c in label]; total = sum(sizes) + gap * s * (len(label) - 1); xx = (w - total) // 2
        for i, c in enumerate(label):
            cv2.putText(image, c, (xx, yy * s - (5 * s if i == mark else 0)), cv2.FONT_HERSHEY_DUPLEX, scale * s, ROSE if i == mark else color, thick * s, cv2.LINE_AA); xx += sizes[i] + gap * s
    text('MEANWHILE', 222, .34, FOG, 1, 5)
    text('NEXT SHOT', 258, .78, BONE, 2, 5, 6)
    cv2.line(image, (w // 2 - 14 * s, 276 * s), (w // 2 + 14 * s, 276 * s), ROSE, s)
    text('ILLUSTRATIVE', 300, .3, FOG, 1, 4)
    return cv2.resize(image, (W, H), interpolation=cv2.INTER_AREA)

if __name__ == '__main__':
    video = cv2.VideoCapture(str(here.parents[2] / '_shared/sample/clip.mp4'))
    video.set(cv2.CAP_PROP_POS_FRAMES, 30)
    frames = [effect('heavy_vignette', effect('cold_grade', cv2.resize(video.read()[1], (W, H), interpolation=cv2.INTER_AREA), 0, .85, i, 1), 0, .6, i, 1) for i in range(HOLD + MOVE)]
    target = graphic()
    wanted = set(sys.argv[1:])
    (here / 'clips').mkdir(exist_ok=True)
    for item in json.loads((here / 'catalog.json').read_text())['items']:
        name = item['id']
        if wanted and name not in wanted: continue
        out = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', '30', '-i', 'pipe:0', '-c:v', 'libx264', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(here / 'clips' / f'{name}.mp4')], stdin=subprocess.PIPE)
        for i in range(HOLD + MOVE + HOLD):
            progress = (i - HOLD + 1) / (MOVE + 1)             # never quite 0 or 1 while moving
            out.stdin.write(render(name, frames[min(i, len(frames) - 1)], target, progress, item.get('params')).tobytes())
        out.stdin.close(); out.wait(); print(name)
