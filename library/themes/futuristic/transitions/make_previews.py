"""Renders this theme's transition previews: the sample clip handing over to a graphics frame.
  .tools/venv-effects/bin/python library/themes/futuristic/transitions/make_previews.py [name ...]
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
shader_transitions.load_theme(here.parent)                 # a theme's own transitions and colours, if it has transitions/theme_transitions.py

W, H, HOLD, MOVE = 270, 480, 8, 32          # frames: hold, transition, hold = 48 at 30 fps

def graphic():
    """A stand-in for a graphics shot, in the theme's colors (BGR). Drawn at 4x and reduced, for clean lines."""
    s, bg, cyan, magenta, amber, dim = 4, (12, 7, 4), (255, 240, 62), (164, 63, 255), (0, 179, 255), (168, 147, 108)
    w, h = W * s, H * s
    image = np.full((h, w, 3), bg, np.uint8)
    for x in range(0, w, w // 6): cv2.line(image, (x, 0), (x, h), (40, 30, 14), s)
    for y in range(0, h, w // 6): cv2.line(image, (0, y), (w, y), (40, 30, 14), s)
    centre, radius = (w // 2, int(h * .42)), int(w * .3)
    cv2.circle(image, centre, radius, (70, 60, 24), s * 5, cv2.LINE_AA)
    cv2.ellipse(image, centre, (radius, radius), -90, 0, 248, cyan, s * 5, cv2.LINE_AA)
    cv2.ellipse(image, centre, (radius - s * 12, radius - s * 12), -90, 0, 130, magenta, s * 2, cv2.LINE_AA)
    for k in range(48):
        a = k / 48 * 2 * math.pi
        cv2.line(image, (int(centre[0] + math.cos(a) * (radius + s * 9)), int(centre[1] + math.sin(a) * (radius + s * 9))),
                 (int(centre[0] + math.cos(a) * (radius + s * (15 if k % 4 == 0 else 12))), int(centre[1] + math.sin(a) * (radius + s * (15 if k % 4 == 0 else 12)))), dim, s, cv2.LINE_AA)
    def text(label, y, scale, color, thick):
        size = cv2.getTextSize(label, cv2.FONT_HERSHEY_DUPLEX, scale * s, thick * s)[0]
        cv2.putText(image, label, ((w - size[0]) // 2, y * s), cv2.FONT_HERSHEY_DUPLEX, scale * s, color, thick * s, cv2.LINE_AA)
    text('69%', int(H * .42) + 14, 1.3, (255, 252, 233), 2)
    text('NEXT SHOT', 62, .62, cyan, 1)
    for k, (width, color) in enumerate([(.62, cyan), (.44, amber), (.53, cyan), (.3, magenta)]):
        y = int(h * .72) + k * s * 22
        cv2.rectangle(image, (int(w * .14), y), (int(w * .86), y + s * 9), (50, 40, 18), -1)
        cv2.rectangle(image, (int(w * .14), y), (int(w * (.14 + .72 * width)), y + s * 9), color, -1)
    for cx, cy, dx, dy in ((.06, .035, 1, 1), (.94, .035, -1, 1), (.06, .965, 1, -1), (.94, .965, -1, -1)):   # corner brackets
        p = (int(w * cx), int(h * cy))
        cv2.line(image, p, (p[0] + dx * s * 16, p[1]), cyan, s * 2); cv2.line(image, p, (p[0], p[1] + dy * s * 16), cyan, s * 2)
    return cv2.resize(image, (W, H), interpolation=cv2.INTER_AREA)

video = cv2.VideoCapture(str(here.parents[2] / '_shared/sample/clip.mp4'))
video.set(cv2.CAP_PROP_POS_FRAMES, 30)
frames = [cv2.resize(video.read()[1], (W, H), interpolation=cv2.INTER_AREA) for _ in range(HOLD + MOVE)]
target = graphic()
wanted = set(sys.argv[1:])
for item in json.loads((here / 'catalog.json').read_text())['items']:
    name = item['id']
    if wanted and name not in wanted: continue
    out = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', '30', '-i', 'pipe:0', '-c:v', 'libx264', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(here / 'clips' / f'{name}.mp4')], stdin=subprocess.PIPE)
    for i in range(HOLD + MOVE + HOLD):
        progress = (i - HOLD + 1) / (MOVE + 1)             # never quite 0 or 1 while moving
        out.stdin.write(render(name, frames[min(i, len(frames) - 1)], target, progress).tobytes())
    out.stdin.close(); out.wait(); print(name)
