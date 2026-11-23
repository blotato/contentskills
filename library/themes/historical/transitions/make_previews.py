"""Renders this theme's transition previews: the sample clip handing over to a graphics frame.
  .tools/venv-effects/bin/python library/themes/historical/transitions/make_previews.py [name ...]
Each loop is 1.9 seconds at 270x480: a short hold on the clip, the transition, a short hold on the graphic.
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

W, H, HOLD, MOVE = 270, 480, 8, 40          # frames: hold, transition, hold = 56 at 30 fps (documentary pace)
bgr = lambda h: (int(h[5:7], 16), int(h[3:5], 16), int(h[1:3], 16))
NIGHT, DEEP, SLATE, PAPER, BONE, CRIMSON, CHAR = map(bgr, ('#0b1017', '#1a2636', '#2a3542', '#cbc3ae', '#efe9dc', '#a81e2d', '#161b23'))

def graphic():
    """A stand-in for a graphics shot in the theme's look (BGR): a dark navy table, a tilted paper print with a
    grey street photograph, a year on a charcoal box and a name on a crimson bar. Drawn at 4x and reduced."""
    s = 4; w, h = W * s, H * s
    y, x = np.mgrid[0:h, 0:w].astype(np.float32); r = np.clip(np.hypot(x / w - .5, y / h - .4) / .75, 0, 1)[..., None]
    image = (np.float32(DEEP) * (1 - r) + np.float32(NIGHT) * r).astype(np.uint8)
    def quad(points, fill):
        pts = np.int32([[px * w, py * h] for px, py in points]); cv2.fillPoly(image, [pts], fill, cv2.LINE_AA); return pts
    quad([(-.05, .12), (.8, .08), (.84, .62), (-.02, .66)], SLATE)                                   # a backing sheet
    quad([(.1, .2), (.96, .17), (.98, .58), (.12, .61)], (4, 4, 4)); quad([(.08, .19), (.94, .16), (.96, .57), (.1, .6)], PAPER)   # shadow, print
    quad([(.105, .205), (.915, .178), (.935, .553), (.123, .58)], (190, 186, 180))                   # sky
    for k in range(7):                                                                              # a row of buildings
        x0 = .12 + k * .115; top = .46 - (k * 37 % 11) * .017
        quad([(x0, top - k * .004), (x0 + .1, top - k * .004 - .003), (x0 + .1, .575 - k * .0035), (x0, .578 - k * .0035)], (88 + k % 3 * 22,) * 3)
    quad([(.123, .52), (.933, .495), (.935, .553), (.123, .58)], (58, 54, 50))
    def label(text, x0, y0, scale, fill, pad, thick=2):
        size = cv2.getTextSize(text, cv2.FONT_HERSHEY_DUPLEX, scale * s, thick * s)[0]
        cv2.rectangle(image, (int(x0 * w), int(y0 * h) - size[1] - pad * s), (int(x0 * w) + size[0] + pad * 2 * s, int(y0 * h) + pad * s), fill, -1)
        cv2.putText(image, text, (int(x0 * w) + pad * s, int(y0 * h)), cv2.FONT_HERSHEY_DUPLEX, scale * s, BONE, thick * s, cv2.LINE_AA)
    label('1900', .16, .70, 1.25, CHAR, 7, 3); label('NEXT SHOT', .12, .765, .62, CRIMSON, 6); label('illustrative', .2, .815, .42, (10, 8, 6), 5, 1)
    cv2.rectangle(image, (0, int(h * .93)), (int(w * .55), int(h * .945)), CRIMSON, -1)
    image = cv2.resize(image, (W, H), interpolation=cv2.INTER_AREA)
    grain = np.random.default_rng(3).integers(-9, 10, (H, W, 1)); return np.clip(image.astype(np.int16) + grain, 0, 255).astype(np.uint8)

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
