"""Renders this theme's transition previews: the sample clip (under the editorial grade) handing over to a title card.
  .tools/venv-effects/bin/python library/themes/editorial/transitions/make_previews.py [name ...]
Each loop is 1.4 seconds at 270x480: a hold on the clip, the transition at 0.4 s (12 frames; in a video they
usually run 6-8), a hold on the card.
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

W, H, HOLD, MOVE = 270, 480, 15, 12          # frames: hold, transition, hold = 42 at 30 fps
PAPER, STONE, INK, WINE, MUTE = (235, 240, 237), (213, 219, 213), (26, 16, 38), (55, 33, 122), (94, 98, 110)   # BGR

def graphic():
    """A stand-in for a title card in the theme's look (BGR): a paper page with hairline rules, a folio line, a
    serif headline in ink, one wine block and a stone picture box. Drawn at 4x and reduced. Text is generic."""
    s = 4; w, h = W * s, H * s; m = 22 * s
    image = np.zeros((h, w, 3), np.uint8); image[:] = PAPER
    cv2.rectangle(image, (m, 150 * s), (w - m, 300 * s), STONE, -1)
    cv2.rectangle(image, (m, 318 * s), (m + 46 * s, 322 * s), WINE, -1)
    for y in (58, 134, 430): cv2.line(image, (m, y * s), (w - m, y * s), INK, max(1, s // 2), cv2.LINE_AA)
    def text(label, x, y, scale, color, thick, font, gap=0):
        for c in label:
            cv2.putText(image, c, (int(x), int(y * s)), font, scale * s, color, thick * s if thick else 2, cv2.LINE_AA)
            x += cv2.getTextSize(c, font, scale * s, max(1, thick * s))[0][0] + gap * s
    text('ISSUE 02', m, 48, .3, INK, 1, cv2.FONT_HERSHEY_SIMPLEX, 3)
    text('P. 14', w - m - 44 * s, 48, .3, MUTE, 1, cv2.FONT_HERSHEY_SIMPLEX, 2)
    text('The next', m, 96, 1.05, INK, 1, cv2.FONT_HERSHEY_TRIPLEX)
    text('chapter', m, 124, 1.05, WINE, 1, cv2.FONT_HERSHEY_COMPLEX | cv2.FONT_ITALIC)
    text('ILLUSTRATIVE', m, 448, .26, MUTE, 1, cv2.FONT_HERSHEY_SIMPLEX, 3)
    return cv2.resize(image, (W, H), interpolation=cv2.INTER_AREA)

if __name__ == '__main__':
    video = cv2.VideoCapture(str(here.parents[2] / '_shared/sample/clip.mp4'))
    video.set(cv2.CAP_PROP_POS_FRAMES, 30)
    frames = [effect('editorial_grade', cv2.resize(video.read()[1], (W, H), interpolation=cv2.INTER_AREA), 0, .7, i, 1) for i in range(HOLD + MOVE)]
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
