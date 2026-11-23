"""Renders this theme's transition previews: the sample clip handing over to a graphics frame.
  .tools/venv-effects/bin/python library/themes/lifestyle/transitions/make_previews.py [name ...]
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
PAPER, LINE, INK, LEAF, SAGE, SUN, CLAY, SKY, CREAM = (bgr(c) for c in ('#E8F1DA', '#BFCFA9', '#2B221C', '#6CAE48', '#8FBBAA', '#E9B44C', '#D8694A', '#A9D3D6', '#F5F8E9'))

def graphic():
    """A stand-in for a graphics shot in the theme's look (BGR): paper, square photo blocks, heavy ink type, a leaf-green mark. Drawn at 4x and reduced."""
    s = 4; w, h = W * s, H * s
    image = np.full((h, w, 3), PAPER, np.uint8)
    def block(x, y, bw, bh, sky, ground, sun):                      # a square-cornered "photo": sky, sun, a hill
        x, y, bw, bh = (int(v * s) for v in (x, y, bw, bh))
        image[y:y + bh, x:x + bw] = sky
        cv2.circle(image, (x + int(bw * .68), y + int(bh * .36)), int(min(bw, bh) * .13), sun, -1, cv2.LINE_AA)
        pts = [(x, y + bh)] + [(x + int(bw * k / 16), y + int(bh * (.66 + .07 * np.sin(k * .55 + bw)))) for k in range(17)] + [(x + bw, y + bh)]
        cv2.fillPoly(image, [np.array(pts, np.int32)], ground, cv2.LINE_AA)
    block(22, 70, 138, 178, SKY, SAGE, CREAM); block(166, 70, 82, 86, (178, 198, 239), CLAY, SUN); block(166, 162, 82, 86, (200, 226, 215), LEAF, CREAM)
    def text(label, x, y, scale, color, thick, font=cv2.FONT_HERSHEY_DUPLEX):
        cv2.putText(image, label, (int(x * s), int(y * s)), font, scale * s, color, thick * s, cv2.LINE_AA)
    text('VOL. 01', 22, 44, .36, INK, 1); cv2.rectangle(image, (190 * s, 30 * s), (248 * s, 50 * s), INK, -1); text('NOTES', 198, 44, .36, PAPER, 1)
    text('SLOW', 20, 318, 1.5, INK, 5); text('DAYS', 20, 364, 1.5, INK, 5)
    pts = np.array([(int((22 + k * 2) * s), int((386 + 4 * np.sin(k * .55)) * s)) for k in range(46)], np.int32)   # brushed underline
    cv2.polylines(image, [pts], False, LEAF, 4 * s, cv2.LINE_AA)
    for k, width in enumerate((.78, .6, .7)):
        cv2.rectangle(image, (22 * s, (412 + k * 16) * s), (int((22 + 226 * width) * s), (417 + k * 16) * s), LINE, -1)
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
