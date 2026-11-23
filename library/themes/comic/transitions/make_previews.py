"""Renders this theme's transition previews: the sample clip handing over to a comic panel.
  .tools/venv-effects/bin/python library/themes/comic/transitions/make_previews.py [name ...]
Each loop is 1.6 seconds at 270x480: a short hold on the clip, the transition, a short hold on the graphic.
"""
import json, math, subprocess, sys
from pathlib import Path
import cv2
import numpy as np
here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / '_shared'))
import shader_transitions
from shader_transitions import render
shader_transitions.load_theme(here.parent)                 # this theme's own transitions (theme_transitions.py) and its colours

W, H, HOLD, MOVE = 270, 480, 8, 32          # frames: hold, transition, hold = 48 at 30 fps
INK, PAPER, WHITE, RED, YELLOW, BLUE, ORANGE = (28, 18, 22), (212, 234, 243), (240, 251, 255), (44, 36, 226), (30, 214, 255), (217, 103, 39), (31, 129, 245)   # BGR

def graphic():
    """A stand-in for a graphics shot in the theme's look: a yellow panel on a paper gutter with Ben-Day
    dots, a two-colour burst, a headline and a caption box. Drawn at 4x and reduced, for clean lines."""
    s = 4; w, h = W * s, H * s
    image = np.full((h, w, 3), PAPER, np.uint8)
    box = np.int32([[.045 * w, .028 * h], [.96 * w, .022 * h], [.955 * w, .975 * h], [.04 * w, .97 * h]])
    panel = np.zeros((h, w), np.uint8); cv2.fillPoly(panel, [box], 255, cv2.LINE_AA)
    inside = np.full((h, w, 3), YELLOW, np.uint8)
    pitch = s * 9                                                                       # dots on a 45 degree screen, growing toward the bottom right
    for i in range(int(h / (pitch / 2)) + 2):
        for j in range(int(w / pitch) + 2):
            x, y = int((j + (i % 2) * .5) * pitch), int(i * pitch / 2)
            r = int(pitch * .46 * (1 - math.hypot(x - w, y - h) / (math.hypot(w, h) * .62)))
            if r > 1: cv2.circle(inside, (x, y), r, ORANGE, -1, cv2.LINE_AA)
    centre = (int(w * .5), int(h * .43))
    def star(radius, points, depth, turn, fill, shadow=0):
        pts = np.int32([[centre[0] + math.cos(k * math.pi / points + turn) * radius * (1 if k % 2 == 0 else depth) * (1 + .12 * math.sin(k * 5.3)),
                         centre[1] + math.sin(k * math.pi / points + turn) * radius * (1 if k % 2 == 0 else depth) * (1 + .12 * math.sin(k * 5.3))] for k in range(points * 2)])
        if shadow: cv2.fillPoly(inside, [pts + s * shadow], INK, cv2.LINE_AA)
        cv2.fillPoly(inside, [pts], fill, cv2.LINE_AA); cv2.polylines(inside, [pts], True, INK, s * 2, cv2.LINE_AA)
    star(w * .47, 13, .66, .1, RED, 3); star(w * .34, 13, .7, .25, BLUE)
    def text(label, y, scale, color, thick, target=inside):
        size = cv2.getTextSize(label, cv2.FONT_HERSHEY_DUPLEX, scale * s, thick * s)[0]; x = (w - size[0]) // 2
        cv2.putText(target, label, (x + s * 2, y * s + s * 2), cv2.FONT_HERSHEY_DUPLEX, scale * s, INK, (thick + 4) * s, cv2.LINE_AA)
        cv2.putText(target, label, (x, y * s), cv2.FONT_HERSHEY_DUPLEX, scale * s, INK, (thick + 4) * s, cv2.LINE_AA)
        cv2.putText(target, label, (x, y * s), cv2.FONT_HERSHEY_DUPLEX, scale * s, color, thick * s, cv2.LINE_AA)
    text('NEXT', int(H * .42), 1.35, WHITE, 3); text('SHOT', int(H * .42) + 40, 1.35, WHITE, 3)
    def plate(points, fill, label, scale, color):
        pts = np.int32([[x * w, y * h] for x, y in points])
        cv2.fillPoly(inside, [pts + s * 2], INK, cv2.LINE_AA); cv2.fillPoly(inside, [pts], fill, cv2.LINE_AA); cv2.polylines(inside, [pts], True, INK, s * 2, cv2.LINE_AA)
        cv2.putText(inside, label, (pts[0][0] + s * 5, pts[3][1] - s * 6), cv2.FONT_HERSHEY_DUPLEX, scale * s, color, s, cv2.LINE_AA)
    plate([(.1, .075), (.56, .07), (.56, .125), (.1, .13)], WHITE, 'MEANWHILE...', .42, INK)
    plate([(.2, .76), (.84, .765), (.79, .845), (.21, .855)], RED, 'TO BE CONTINUED', .46, WHITE)
    image[panel > 127] = inside[panel > 127]
    cv2.polylines(image, [box], True, INK, s * 3, cv2.LINE_AA)
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
