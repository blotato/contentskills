"""Renders this theme's transition previews: the sample clip handing over to a graphics frame.
  .tools/venv-effects/bin/python library/themes/grunge/transitions/make_previews.py [name ...]
Each loop is 1.6 seconds at 270x480: a short hold on the clip, the transition, a short hold on the graphic.
The clip is shown through the theme's base grade, as it would be in a video.
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
import effects_engine
effects_engine.load_theme(here.parent)

W, H, HOLD, MOVE = 270, 480, 8, 32          # frames: hold, transition, hold = 48 at 30 fps
bgr = lambda h: (int(h[5:7], 16), int(h[3:5], 16), int(h[1:3], 16))
SOOT, CHAR, BONE, WHITE, RED, LIME, DUST = map(bgr, ('#0b0a09', '#1b1a18', '#ece6d8', '#fbf8f0', '#f2440f', '#b9f227', '#8e887d'))

def graphic():
    """A stand-in for a graphics shot in the theme's look (BGR): a soot wall with plaster cracks, a torn
    bone strip taped across it, a heavy two-line word in bone and red, a marker stroke and a zigzag.
    Drawn at 4x and reduced."""
    s = 4; w, h = W * s, H * s; r = np.random.default_rng(7)
    image = np.full((h, w, 3), SOOT, np.uint8)
    mottle = cv2.resize(r.random((12, 7)).astype(np.float32), (w, h), interpolation=cv2.INTER_CUBIC)[..., None]
    image = np.clip(image + mottle * 16, 0, 255).astype(np.uint8)
    for _ in range(8):                                                                  # cracks
        side = r.integers(0, 4); px = (0, w, r.uniform(0, w), r.uniform(0, w))[side]; py = (r.uniform(0, h), r.uniform(0, h), 0, h)[side]
        a = math.atan2(h * r.uniform(.2, .8) - py, w * r.uniform(.2, .8) - px); pts = [(px, py)]; drift = 0
        for _ in range(int(r.integers(6, 14))):
            drift = drift * .7 + r.uniform(-.3, .3); b = a + drift + (r.uniform(-.9, .9) if r.random() < .3 else 0); d = r.uniform(30, 150); px += math.cos(b) * d; py += math.sin(b) * d; pts.append((px, py))
        cv2.polylines(image, [np.int32(pts)], False, (70, 68, 64), s, cv2.LINE_AA)
    def ragged(x0, y0, x1, y1, amp, seed):                                              # a torn-edged quad
        q = np.random.default_rng(seed); n = 40
        top = [(x0 + (x1 - x0) * i / n, y0 + q.uniform(-amp, amp)) for i in range(n + 1)]
        bottom = [(x1 - (x1 - x0) * i / n, y1 + q.uniform(-amp, amp)) for i in range(n + 1)]
        return np.int32(top + bottom)
    def text(label, x, y, scale, color, thick):
        cv2.putText(image, label, (int(x), int(y)), cv2.FONT_HERSHEY_DUPLEX, scale * s, color, thick * s, cv2.LINE_AA)
    def centred(label, y, scale, color, thick):
        size = cv2.getTextSize(label, cv2.FONT_HERSHEY_DUPLEX, scale * s, thick * s)[0]; text(label, (w - size[0]) / 2, y * s, scale, color, thick)
    cv2.fillPoly(image, [ragged(w * .2, h * .262, w * .8, h * .312, 6, 1)], LIME, cv2.LINE_AA)       # marker stroke
    centred('NEXT UP', 141, .5, SOOT, 2)
    centred('NEXT', 205, 2.05, BONE, 9); centred('SHOT', 268, 2.05, RED, 9)
    zig = [(w * (.3 + .05 * i), h * (.6 + (.022 if i % 2 else -.014))) for i in range(9)]
    cv2.polylines(image, [np.int32(zig)], False, BONE, 3 * s, cv2.LINE_AA)
    m = cv2.getRotationMatrix2D((w / 2, h * .78), -3, 1); strip = np.zeros_like(image); mask = np.zeros((h, w), np.uint8)
    for layer, grow, color in ((strip, 5 * s, WHITE), (strip, 0, BONE)):
        cv2.fillPoly(layer, [ragged(w * .1 - grow, h * .73 - grow, w * .9 + grow, h * .83 + grow, 7, 3 if grow else 4)], color, cv2.LINE_AA)
    cv2.fillPoly(mask, [ragged(w * .1 - 5 * s, h * .73 - 5 * s, w * .9 + 5 * s, h * .83 + 5 * s, 7, 3)], 255, cv2.LINE_AA)
    size = cv2.getTextSize('ILLUSTRATIVE', cv2.FONT_HERSHEY_DUPLEX, .62 * s, 2 * s)[0]
    cv2.putText(strip, 'ILLUSTRATIVE', (int((w - size[0]) / 2), int(h * .797)), cv2.FONT_HERSHEY_DUPLEX, .62 * s, SOOT, 2 * s, cv2.LINE_AA)
    strip = cv2.warpAffine(strip, m, (w, h)); mask = cv2.warpAffine(mask, m, (w, h))[..., None] / 255.
    shadow = np.roll(mask, (8 * s, 6 * s), (0, 1)) * .6
    image = (image * (1 - shadow) * (1 - mask) + strip * mask).astype(np.uint8)
    tape = np.int32([(w * .06, h * .715), (w * .2, h * .7), (w * .205, h * .728), (w * .065, h * .743)]); over = image.copy(); cv2.fillPoly(over, [tape], (146, 197, 216), cv2.LINE_AA)
    image = cv2.addWeighted(over, .85, image, .15, 0)
    text('NO. 26', w * .07, h * .06, .4, BONE, 1); text('SIDE A', w * .72, h * .06, .4, RED, 1)
    speck = (r.random((h // 2, w // 2)) > .9985).astype(np.uint8) * 150
    image = cv2.add(image, cv2.cvtColor(cv2.resize(speck, (w, h), interpolation=cv2.INTER_LINEAR), cv2.COLOR_GRAY2BGR))
    yy, xx = np.mgrid[0:h, 0:w]; vig = 1 - np.clip(((xx / w - .5) ** 2 + (yy / h - .5) ** 2) * 1.5, 0, .6)
    return cv2.resize((image * vig[..., None]).astype(np.uint8), (W, H), interpolation=cv2.INTER_AREA)

if __name__ == '__main__':
    video = cv2.VideoCapture(str(here.parents[2] / '_shared/sample/clip.mp4'))
    video.set(cv2.CAP_PROP_POS_FRAMES, 30)
    frames = [effects_engine.effect('grunge_grade', cv2.resize(video.read()[1], (W, H), interpolation=cv2.INTER_AREA), 0, .85, i, 1) for i in range(HOLD + MOVE)]
    target = graphic()
    wanted = set(sys.argv[1:])
    (here / 'clips').mkdir(exist_ok=True)
    names = [item['id'] for item in json.loads((here / 'catalog.json').read_text())['items']] if (here / 'catalog.json').exists() and not wanted else sorted(wanted)
    for name in names:
        out = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', '30', '-i', 'pipe:0', '-c:v', 'libx264', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(here / 'clips' / f'{name}.mp4')], stdin=subprocess.PIPE)
        for i in range(HOLD + MOVE + HOLD):
            progress = (i - HOLD + 1) / (MOVE + 1)             # never quite 0 or 1 while moving
            out.stdin.write(render(name, frames[min(i, len(frames) - 1)], target, progress).tobytes())
        out.stdin.close(); out.wait(); print(name)
