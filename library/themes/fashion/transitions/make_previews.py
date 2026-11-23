"""Renders this theme's transition previews: the sample clip handing over to a graphics frame.
  .tools/venv-effects/bin/python library/themes/fashion/transitions/make_previews.py [name ...]
Each loop is 1.6 seconds at 270x480: a short hold on the clip, the transition, a short hold on the graphic.
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

W, H, HOLD, MOVE = 270, 480, 8, 32          # frames: hold, transition, hold = 48 at 30 fps
bgr = lambda c: tuple(int(c[i:i + 2], 16) for i in (5, 3, 1))
INK, WHITE, POPPY = (bgr(c) for c in ('#0D0D0F', '#FFFFFF', '#E8402A'))

def graphic():
    """A stand-in for a graphics shot in the theme's look (BGR): an out-of-focus stone field, one white word, a hairline, small print. Drawn at 4x and reduced."""
    s = 4; w, h = W * s, H * s
    y, x = np.mgrid[0:h, 0:w].astype(np.float32); x /= w; y /= h
    image = np.zeros((h, w, 3), np.float32) + np.array(bgr('#7A7268'), np.float32)
    for (cx, cy, r, col) in ((.22, .2, .6, '#A69D90'), (.8, .55, .65, '#4D4842'), (.3, .92, .6, '#C4BCAE')):
        m = np.clip(1 - np.hypot(x - cx, (y - cy) * H / W) / r, 0, 1)[..., None] ** 1.5
        image = image * (1 - m) + np.array(bgr(col), np.float32) * m
    image = (image * (1 - .3 * np.abs(y - .45)[..., None])).astype(np.uint8)
    def text(label, cx, cy, scale, thick, font=cv2.FONT_HERSHEY_DUPLEX):
        (tw, th), _ = cv2.getTextSize(label, font, scale * s, thick * s)
        cv2.putText(image, label, (int(cx * s - tw / 2), int(cy * s + th / 2)), font, scale * s, WHITE, thick * s, cv2.LINE_AA)
    text('SEASON', W / 2, H / 2, 1.25, 4); text('INTRODUCING', W / 2, H / 2 - 42, .3, 1); text('PART ONE  |  ON FILM', W / 2, H - 30, .27, 1)
    cv2.rectangle(image, (int((W / 2 - 14) * s), int((H / 2 + 34) * s)), (int((W / 2 + 14) * s), int((H / 2 + 35.5) * s)), POPPY, -1)
    return cv2.resize(image, (W, H), interpolation=cv2.INTER_AREA)

if __name__ == '__main__':
    video = cv2.VideoCapture(str(here.parents[2] / '_shared/sample/clip.mp4'))
    video.set(cv2.CAP_PROP_POS_FRAMES, 30)
    frames = [cv2.resize(video.read()[1], (W, H), interpolation=cv2.INTER_AREA) for _ in range(HOLD + MOVE)]
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
