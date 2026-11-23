"""Grunge theme effects: photocopy, paper, wear and the rip-and-tint cut. BGR uint8 in, BGR uint8 out.

    EFFECTS = {name: fn(img, progress, amount, frame, seed) -> img}

Loaded by library/_shared/effects_engine.load_theme(). Every effect is a pure function of its
arguments: all texture comes from generators seeded with (seed, step), where step = frame // 4
(8 times a second at 30 fps). That is the theme's "boil": wear is redrawn in held steps, cycling a
few versions, and never flickers per frame. Steady looks (grade, copy, paper) hold still apart from
grain and dust. Texture maps are built once per size and cached.
"""
import math
from functools import lru_cache
import cv2
import numpy as np

# The theme palette (library/themes/grunge/theme.json), as BGR 0..1.
def _bgr(h): return np.array([int(h[5:7], 16), int(h[3:5], 16), int(h[1:3], 16)], np.float32) / 255
SOOT, CHAR, BONE, WHITE, RED = map(_bgr, ('#0b0a09', '#1b1a18', '#ece6d8', '#fbf8f0', '#f2440f'))
TINTS = tuple(map(_bgr, ('#3fb7a2', '#4a3d8c', '#a8452d')))          # teal, plum, brick: the cut flash

def _u8(a): return np.clip(np.rint(a * 255), 0, 255).astype(np.uint8)
def _f(img): return img.astype(np.float32) / 255
def _grey(f): return cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
def _rng(seed, *tags): return np.random.default_rng([int(seed) & 0xffffffff, *[int(t) & 0xffffffff for t in tags]])
def _step(frame): return int(frame) // 4                               # the boil step: 8 fps at 30 fps

@lru_cache(maxsize=4)
def _grid(h, w):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    return x, y

@lru_cache(maxsize=4)
def _vignette(h, w):
    x, y = _grid(h, w); nx = x / (w - 1) * 2 - 1; ny = y / (h - 1) * 2 - 1
    return np.clip(1 - (nx * nx * .55 + ny * ny * .5) ** 1.3 * .95, 0, 1)

def _noise(h, w, cell, rng):
    """Smooth 0..1 noise with features about `cell` pixels across."""
    small = rng.random((max(2, int(h / cell) + 2), max(2, int(w / cell) + 2)), dtype=np.float32)
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC)

def _line1d(n, rng, cell, fine=.35):
    """Ragged 1-D profile about -1..1: slow wander plus a sharp per-step tooth, like a torn edge."""
    k = max(2, int(n / cell) + 2); coarse = np.interp(np.linspace(0, k - 1, n), np.arange(k), rng.random(k) * 2 - 1)
    t = max(2, int(n / max(2., cell / 9)) + 2); teeth = np.interp(np.linspace(0, t - 1, n), np.arange(t), rng.random(t) * 2 - 1)
    return (coarse + teeth * fine).astype(np.float32)

@lru_cache(maxsize=12)
def _grain(h, w, seed, step):
    return _rng(seed, 11, step % 6).standard_normal((h, w), dtype=np.float32)

@lru_cache(maxsize=8)
def _cracks(h, w, seed, var):
    """0..1 mask of plaster cracks: branching hairlines wandering in from the edges. `var` nudges every
    joint a little, so three versions of one drawing can be cycled (the boil)."""
    base, wob, s = _rng(seed, 21), _rng(seed, 22, var), w / 540
    mask = np.zeros((h, w), np.uint8)
    def walk(px, py, heading, n, depth):
        pts = [(px, py)]; drift = 0.
        for i in range(n):
            drift = drift * .7 + base.uniform(-.3, .3)                                     # holds its heading, straight runs between kinks
            a = heading + drift + (base.uniform(-.9, .9) if base.random() < .3 else 0)
            d = base.uniform(8, 40) * s; px += math.cos(a) * d; py += math.sin(a) * d; pts.append((px, py))
            if depth < 2 and base.random() < .16: walk(px, py, a + base.choice((-1, 1)) * base.uniform(.6, 1.2), max(2, n // 3), depth + 1)
            if not (-20 < px < w + 20 and -20 < py < h + 20): break
        arr = np.array(pts, np.float32) + (wob.random((len(pts), 2), dtype=np.float32) - .5) * 2.2 * s * (var > 0)
        cv2.polylines(mask, [np.int32(arr * 8)], False, 255 if depth == 0 else 190, max(1, round(s * (1.2 if depth == 0 else .8))), cv2.LINE_AA, 3)
    for _ in range(int(5 * h / w)):
        side = base.integers(0, 4); px = (0, w, base.uniform(0, w), base.uniform(0, w))[side]; py = (base.uniform(0, h), base.uniform(0, h), 0, h)[side]
        walk(px, py, math.atan2(h * base.uniform(.2, .8) - py, w * base.uniform(.2, .8) - px), int(base.integers(7, 18)), 0)
    return mask.astype(np.float32) / 255

@lru_cache(maxsize=12)
def _dust(h, w, seed, step):
    """Two 0..1 masks for one boil step: light marks (specks, hairs, a scratch or two) and dark specks."""
    r, s = _rng(seed, 31, step % 9), w / 540
    light, dark = np.zeros((h, w), np.uint8), np.zeros((h, w), np.uint8)
    for i in range(int(90 * h / w)):
        c = (int(r.uniform(0, w) * 8), int(r.uniform(0, h) * 8)); big = r.random() < .1
        cv2.ellipse(dark if i % 4 == 0 else light, c, (int(r.uniform(.5, 4.5 if big else 1.6) * s * 8), int(r.uniform(.4, 2.5 if big else 1.4) * s * 8)), r.uniform(0, 180), 0, 360, int(r.uniform(120, 255)), -1, cv2.LINE_AA, 3)
    for _ in range(int(7 * h / w)):                                   # hairs: short curls
        px, py, a = r.uniform(0, w), r.uniform(0, h), r.uniform(0, 6.3); pts = []
        for _ in range(8): pts.append((px, py)); a += r.uniform(-.7, .7); px += math.cos(a) * 5 * s; py += math.sin(a) * 5 * s
        cv2.polylines(light, [np.int32(np.array(pts) * 8)], False, int(r.uniform(110, 220)), max(1, round(s)), cv2.LINE_AA, 3)
    for _ in range(int(r.integers(0, 3))):                            # long near-vertical scratches
        px, y0, ln = r.uniform(0, w), r.uniform(-.2, .6) * h, r.uniform(.3, 1.) * h
        cv2.line(light, (int(px * 8), int(y0 * 8)), (int((px + r.uniform(-8, 8) * s) * 8), int((y0 + ln) * 8)), int(r.uniform(90, 200)), max(1, round(s * .8)), cv2.LINE_AA, 3)
    return light.astype(np.float32) / 255, dark.astype(np.float32) / 255

@lru_cache(maxsize=4)
def _paper(h, w, seed):
    """Crumpled, folded paper as a brightness map around 1.0 (multiply it in) plus a 0..1 map of the
    worn white ridges along its creases (screen it in)."""
    r = _rng(seed, 41); height = sum(_noise(h, w, w / c, r) * wt for c, wt in ((2.2, 1.), (5, .5), (11, .18)))
    gx = cv2.Sobel(height, cv2.CV_32F, 1, 0, ksize=5); gy = cv2.Sobel(height, cv2.CV_32F, 0, 1, ksize=5)
    shade = gx * .7 + gy * .7; shade /= (np.abs(shade).mean() * 7 + 1e-6)                  # light from the top-left across the crumple
    n1, n2 = _noise(h, w, w / 4.5, r), _noise(h, w, w / 9, r)
    ridge = np.exp(-((n1 - .5) / .012) ** 2) + np.exp(-((n2 - .5) / .016) ** 2) * .6        # crease lines where the noise crosses its middle
    x, y = _grid(h, w); fold = np.zeros((h, w), np.float32)
    for i in range(3):                                                                    # straight folds: a bright lip and a dark one
        vertical = r.random() < .5; p = r.uniform(.2, .8); tilt = r.uniform(-.05, .05)
        d = (x - w * p - (y - h / 2) * tilt) if vertical else (y - h * p - (x - w / 2) * tilt)
        fold += np.exp(-(d / (w * .003)) ** 2) * .9 - np.exp(-((d - w * .006) / (w * .006)) ** 2) * .5
    fibre = cv2.GaussianBlur(r.standard_normal((h, w), dtype=np.float32), (0, 0), max(.6, w / 700)) * .025
    mult = np.clip(.93 + shade * .2 - ridge * .1 - np.clip(-fold, 0, 1) * .25 + fibre, .45, 1.15)
    return mult, np.clip(ridge * .5 + np.clip(fold, 0, 1), 0, 1)

@lru_cache(maxsize=8)
def _edge(h, w, seed, var):
    """Per-pixel distance to the nearest frame edge, made ragged: a torn border is `_edge < width`."""
    x, y = _grid(h, w); r = _rng(seed, 51, var)
    d = np.minimum(np.minimum(x, w - 1 - x), np.minimum(y, h - 1 - y))
    return d * (1 / (.35 + 1.2 * _noise(h, w, w / 7, r))) + (_noise(h, w, max(2., w / 60), r) - .5) * w * .012

def _screen(f, light):
    return 1 - (1 - f) * (1 - light)

def _mono(f, keep=0.):
    lum = _grey(f)[..., None]
    return lum + (f - lum) * keep

# ---------------------------------------------------------------- looks
def grunge_grade(img, p, a, frame, seed):
    """The theme's base look: colour drained almost to grey, blacks crushed, a faint warm paper cast, heavy
    vignette, grain, and thin white plaster cracks with dust lying over the picture."""
    h, w = img.shape[:2]; f = _f(img); s = _step(frame)
    g = _mono(f, .1); g = np.clip((g - .5) * 1.12 + .44, 0, 1); g = (g * g * (3 - 2 * g) * .6 + g * .4) * .8
    g *= np.array([.93, .975, 1.], np.float32)                                              # warm, like old stock
    g *= (.28 + .72 * _vignette(h, w))[..., None]
    g += (_grain(h, w, seed, s) * .035)[..., None]
    light, dark = _dust(h, w, seed, s)
    veins = _cracks(h, w, seed, s % 3) * .42 + light * .4
    g = _screen(np.clip(g, 0, 1), (veins * (.55 + .45 * _vignette(h, w)))[..., None] * BONE) * (1 - dark * .5)[..., None]
    return _u8(f * (1 - a) + g * a)

def photocopy(img, p, a, frame, seed):
    """A grey office copy: hard contrast, toner banding across the page, burnt dark edges, coarse grain."""
    h, w = img.shape[:2]; f = _f(img); s = _step(frame); x, y = _grid(h, w)
    lum = cv2.GaussianBlur(_grey(f), (0, 0), max(.5, w / 900)); g = np.clip((lum - .42) * 2.4 + .5, 0, 1)
    r = _rng(seed, 61); band = np.interp(np.arange(h), np.linspace(0, h, 14), r.random(14)).astype(np.float32)[:, None]
    g = g * (.86 + .2 * band) + (band - .5) * .07 + np.sin(y / h * 380) * .012
    burn = np.clip(1 - _edge(h, w, seed, 0) / (w * .09), 0, 1) ** 1.6                       # toner piles up at the glass edge
    coarse = cv2.resize(_grain(max(2, h // 2), max(2, w // 2), seed, s), (w, h), interpolation=cv2.INTER_LINEAR)
    g = np.clip(g * (1 - burn * .85) + coarse * .06, 0, 1)
    out = CHAR + (BONE - CHAR) * g[..., None]
    return _u8(f * (1 - a) + out * a)

def xerox(img, p, a, frame, seed):
    """A copy of a copy: everything is either toner or paper. Edges break up into specks and vertical
    streaks drag through where the drum is worn."""
    h, w = img.shape[:2]; f = _f(img); s = _step(frame)
    lum = _grey(f); k = max(1, w // 135); local = cv2.resize(cv2.GaussianBlur(cv2.resize(lum, (w // k, h // k), interpolation=cv2.INTER_AREA), (0, 0), w * .09 / k), (w, h), interpolation=cv2.INTER_LINEAR)
    r = _rng(seed, 71); streak = np.interp(np.arange(w), np.linspace(0, w, 40), r.random(40)).astype(np.float32)[None, :]
    wear = _noise(h, w, w / 5, r)
    speck = cv2.resize(_grain(max(2, h * 2 // 3), max(2, w * 2 // 3), seed, s % 3), (w, h), interpolation=cv2.INTER_LINEAR)
    t = lum - (local * .55 + .2) + speck * (.05 + .1 * wear) + (streak - .5) * .16 * (streak > .72)
    ink = np.clip(.5 - t * 26, 0, 1); ink = ink * (1 - np.clip((wear - .7) * 5, 0, 1) * (speck > .2))        # dropout patches
    out = BONE + (SOOT - BONE) * ink[..., None]
    return _u8(f * (1 - a) + out * a)

def halftone_news(img, p, a, frame, seed):
    """Cheap newsprint: one coarse black dot screen at 45 degrees on bone paper, the dots a little uneven."""
    h, w = img.shape[:2]; f = _f(img); x, y = _grid(h, w)
    cell = max(4., w * .017); lum = cv2.GaussianBlur(_grey(f), (0, 0), cell * .45); lum = np.clip((lum - .5) * 1.3 + .5, 0, 1)
    c = math.sqrt(.5); u = (x * c + y * c) / cell; v = (-x * c + y * c) / cell
    d = np.hypot(u - np.floor(u) - .5, v - np.floor(v) - .5)
    press = .9 + .2 * _noise(h, w, w / 4, _rng(seed, 81))                                    # uneven pressure across the sheet
    dots = np.clip((np.sqrt(1 - lum) * .74 * press - d) * cell * .6 + .5, 0, 1)
    mult, _ = _paper(h, w, seed)
    out = (BONE * (.82 + .18 * mult[..., None])) * (1 - dots[..., None] * .93) + SOOT * dots[..., None] * .93
    return _u8(f * (1 - a) + out * a)

def red_wash(img, p, a, frame, seed):
    """Printed in the theme's one colour: shadows soot, midtones the hot red-orange, highlights bone."""
    h, w = img.shape[:2]; f = _f(img)
    lum = np.clip((_grey(f) - .5) * 1.35 + .5, 0, 1)[..., None]
    out = np.where(lum < .5, SOOT + (RED - SOOT) * np.clip(lum * 2, 0, 1) ** 1.2, RED + (BONE - RED) * np.clip(lum * 2 - 1, 0, 1) ** .8)
    out = out * (.8 + .2 * _paper(h, w, seed)[0][..., None]) + (_grain(h, w, seed, _step(frame)) * .03)[..., None]
    return _u8(f * (1 - a) + out * a)

# ---------------------------------------------------------------- wear
def dust_scratches(img, p, a, frame, seed):
    """Dirt on the glass: pale specks, hairs and the odd long scratch, plus a few dark flecks, redrawn 8 times a second."""
    h, w = img.shape[:2]; f = _f(img); light, dark = _dust(h, w, seed + 5, _step(frame))
    out = _screen(f, (light * a)[..., None] * BONE) * (1 - dark * a * .8)[..., None]
    return _u8(out)

def cracks(img, p, a, frame, seed):
    """White plaster-crack veins over the picture, as if it were pasted on an old wall; they boil slightly."""
    h, w = img.shape[:2]; f = _f(img)
    veins = _cracks(h, w, seed, _step(frame) % 3)
    return _u8(_screen(f, (veins * min(1., a * 1.1))[..., None] * WHITE))

def paper_overlay(img, p, a, frame, seed):
    """The picture printed on crumpled, folded paper: the crumple shades it, creases wear through to white."""
    h, w = img.shape[:2]; f = _f(img); mult, ridge = _paper(h, w, seed)
    out = _screen(np.clip(f * (1 + (mult[..., None] - 1) * 1.7 * a), 0, 1), (ridge * .5 * a)[..., None] * BONE)
    return _u8(out)

# ---------------------------------------------------------------- cuts
def tint_flash(img, p, a, frame, seed):
    """The cut flash: the frame turns into a two-colour print on creased paper, in teal, then plum, then
    brick, changing every third frame."""
    h, w = img.shape[:2]; f = _f(img); tint = TINTS[(int(frame) // 3 + int(seed)) % 3]
    lum = np.clip((_grey(f) - .5) * 1.2 + .52, 0, 1)[..., None]
    duo = np.where(lum < .55, tint * .12 + (tint - tint * .12) * (lum / .55), tint + (BONE - tint) * ((lum - .55) / .45))
    mult, ridge = _paper(h, w, seed + (int(frame) // 3) % 3)
    duo = _screen(np.clip(duo * (1 + (mult[..., None] - 1) * 1.6), 0, 1), (ridge * .4)[..., None] * WHITE)
    k = min(1., a * 1.6)                                                                    # reads as a flash: full tint from a low amount
    return _u8(f * (1 - k) + duo * k)

@lru_cache(maxsize=6)
def _rip_lines(h, w, seed, var):
    """For one version of the rip: per line, the signed distance v from the torn edge and how thick the
    band of exposed paper is there. Layouts: a cross, a diagonal pair, or two slashes."""
    r = _rng(seed, 91, var); x, y = _grid(h, w); layout = int(r.integers(0, 3)); lines = []
    angles = ((r.uniform(-.09, .09), .3 + r.uniform(0, .4)), (math.pi / 2 + r.uniform(-.09, .09), .3 + r.uniform(0, .4))) if layout == 0 else \
             ((r.uniform(.25, .5) * r.choice((-1, 1)), r.uniform(.3, .7)), (math.pi / 2 + r.uniform(-.35, .35), r.uniform(.25, .75))) if layout == 1 else \
             ((r.uniform(-.3, .3), r.uniform(.15, .4)), (r.uniform(-.3, .3), r.uniform(.6, .85)))
    for angle, at in angles:
        c, s = math.cos(angle), math.sin(angle); u = x * c + y * s; v = -x * s + y * c
        n = int(math.hypot(w, h)) + 4; ui = np.clip((u - u.min()).astype(np.int32), 0, n - 1)
        cx, cy = (w * .5, h * at) if abs(c) > abs(s) else (w * at, h * .5)
        centre = -cx * s + cy * c + _line1d(n, r, w / 5)[ui] * w * .028
        thick = (.25 + np.clip(_line1d(n, r, w / 3, .6)[ui] * .5 + .5, 0, 1.3)) * w * .03
        lines.append((v - centre, thick))
    return lines

def paper_rip(img, p, a, frame, seed):
    """The theme's cut: the picture is ripped across. Ragged bands of white paper core open through the
    frame (a cross, a diagonal, two slashes), a different rip every third frame, wider with amount."""
    h, w = img.shape[:2]; out = _f(img)
    fibre = .93 + _grain(h, w, seed, 0) * .035
    for d, thick in _rip_lines(h, w, int(seed), int(frame) // 3 % 5):
        t = thick * a * 1.5; half = t * .5
        shadow = np.clip(1 - np.abs(d - w * .006) / (half + w * .012), 0, 1) ** 2 * .55 * min(1., a * 3)
        band = np.clip((half - np.abs(d)) * 1.2 + .5, 0, 1)
        out = out * (1 - shadow[..., None]); out = out * (1 - band[..., None]) + (WHITE * fibre[..., None]) * band[..., None]
    return _u8(out)

def torn_jitter(img, p, a, frame, seed):
    """Stop-motion handling: the frame is a torn print that jumps a few pixels and twists every third
    frame, its ragged white paper border showing."""
    h, w = img.shape[:2]; k = int(frame) // 3; r = _rng(seed, 101, k)
    dx, dy, rot = (r.uniform(-1, 1) * w * .014 * a, r.uniform(-1, 1) * w * .014 * a, r.uniform(-1, 1) * 1.4 * a)
    m = cv2.getRotationMatrix2D((w / 2, h / 2), rot, 1 + .035 * a); m[:, 2] += (dx, dy)
    out = _f(cv2.warpAffine(img, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101))
    d = _edge(h, w, seed, k % 3); width = w * .05 * a
    border = np.clip((width - d) * .8 + .5, 0, 1)[..., None]; shade = np.clip(1 - (d - width) / (w * .02), 0, 1)[..., None] * .5 * (1 - border)
    out = out * (1 - shade); out = out * (1 - border) + WHITE * (.94 + _grain(h, w, seed, 0) * .03)[..., None] * border
    return _u8(out)

EFFECTS = {
    'grunge_grade': grunge_grade, 'photocopy': photocopy, 'xerox': xerox, 'halftone_news': halftone_news, 'red_wash': red_wash,
    'dust_scratches': dust_scratches, 'cracks': cracks, 'paper_overlay': paper_overlay,
    'tint_flash': tint_flash, 'paper_rip': paper_rip, 'torn_jitter': torn_jitter,
}
