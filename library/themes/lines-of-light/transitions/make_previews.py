"""Renders this theme's transition previews: the sample clip (under the theme's night look) handing over to a title card.
  .tools/venv-effects/bin/python library/themes/lines-of-light/transitions/make_previews.py [name ...]
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
CORE, RED, BLUE, DIM = (255, 243, 245), (64, 46, 255), (255, 110, 40), (150, 150, 138)

def graphic():
    """A stand-in for a title card in the theme's look (BGR): near-black with deep teal haze, the red dot top-left,
    a horizon of light with red/blue echoes and a lilac glow, and small tracked capitals. Drawn at 4x and reduced."""
    s = 4; w, h = W * s, H * s
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    haze = np.exp(-(((x - w * .5) / (w * .6)) ** 2 + ((y - h * .45) / (h * .38)) ** 2))[..., None]
    image = np.array([6, 5, 4], np.float32) + haze * np.array([31, 30, 14], np.float32)
    image += np.random.default_rng(3).normal(0, 2.5, (h, w, 1)).astype(np.float32)
    light = np.zeros((h, w), np.float32)
    cv2.line(light, (int(w * .12), int(h * .56)), (int(w * .88), int(h * .56)), 1., 2 * s, cv2.LINE_AA)
    for k in range(-6, 7):
        ang = np.radians(90 + k * 12); r0, r1 = w * .12, w * .34
        cv2.line(light, (int(w / 2 + np.cos(ang) * r0), int(h * .56 - np.sin(ang) * r0)), (int(w / 2 + np.cos(ang) * r1), int(h * .56 - np.sin(ang) * r1)), .8, s, cv2.LINE_AA)
    sh = 3 * s
    glow = cv2.GaussianBlur(light, (0, 0), 6 * s)
    image += np.roll(light, -sh, 1)[..., None] * np.float32(RED) * .9 + np.roll(light, sh, 1)[..., None] * np.float32(BLUE)
    image += light[..., None] * np.float32(CORE) * .8 + glow[..., None] * np.float32((240, 214, 242)) * .9
    image = np.clip(image, 0, 255).astype(np.uint8)
    cv2.circle(image, (int(w * .1), int(h * .07)), 4 * s, RED, -1, cv2.LINE_AA)
    def text(label, yy, scale, color, thick, gap):
        sizes = [cv2.getTextSize(c, cv2.FONT_HERSHEY_SIMPLEX, scale * s, thick * s)[0][0] for c in label]; total = sum(sizes) + gap * s * (len(label) - 1); xx = (w - total) // 2
        for i, c in enumerate(label):
            cv2.putText(image, c, (xx, yy * s), cv2.FONT_HERSHEY_SIMPLEX, scale * s, color, thick * s, cv2.LINE_AA); xx += sizes[i] + gap * s
    text('STEP 02', 150, .32, DIM, 1, 5)
    text('NEXT SHOT', 180, .6, CORE, 1, 7)
    text('ILLUSTRATIVE', 330, .28, DIM, 1, 4)
    return cv2.resize(image, (W, H), interpolation=cv2.INTER_AREA)

if __name__ == '__main__':
    video = cv2.VideoCapture(str(here.parents[2] / '_shared/sample/clip.mp4'))
    video.set(cv2.CAP_PROP_POS_FRAMES, 30)
    frames = [effect('night', cv2.resize(video.read()[1], (W, H), interpolation=cv2.INTER_AREA), 0, .9, i, 1) for i in range(HOLD + MOVE)]
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
