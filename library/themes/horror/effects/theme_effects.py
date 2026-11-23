"""Horror theme effects: cold, dark and damaged. Loaded by library/_shared/effects_engine.load_theme().

    EFFECTS = {name: fn(img, progress, amount, frame, seed) -> img}     BGR uint8 in and out

Every effect is stateless and deterministic (random numbers come only from seed and frame), never
modifies its input, and fades to the untouched picture as amount goes to 0. Mood only: these darken,
desaturate, damage and distort the picture; none of them draws anything onto it.
"""
import math
from functools import lru_cache
import cv2
import numpy as np


def _u8(a): return np.clip(np.rint(a * 255), 0, 255).astype(np.uint8)
def _f(img): return img.astype(np.float32) / 255
def _rng(seed, frame, salt=0): return np.random.default_rng(np.random.SeedSequence([int(seed), int(frame), int(salt)]))
def _hash(n, seed=0):
    x = math.sin(n * 127.1 + seed * 311.7 + 74.7) * 43758.5453
    return x - math.floor(x)

@lru_cache(maxsize=8)
def _grid(h, w):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    return x, y, (x / (w - 1) - .5) * 2, (y / (h - 1) - .5) * 2

def _luma(f): return cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)[..., None]

def _lamp(frame, seed, depth=.8):
    """The theme's failing light: 1 most of the time, sudden short dips. 12 steps a second at 30 fps."""
    k = frame // 9; r = _hash(k, seed + 31); at = (frame % 9) / 9
    if r < .5:
        a = _hash(k, seed + 7) * .6; length = .12 + _hash(k, seed + 9) * .3
        if a < at < a + length: return 1 - depth * (1 if _hash(frame // 2, seed) < .7 else .4)
    return 1.


def cold_grade(img, p, a, frame, seed):
    """The theme base look: most of the colour drained, shadows pushed teal-grey and crushed, highlights held back."""
    f = _f(img); lum = _luma(f)
    g = lum + (f - lum) * .32                                           # desaturate
    g = np.clip((g - .07) * 1.06, 0, 1) ** 1.5 * .9                          # crush blacks, darken mids
    g = g * np.array([1.05, 1.0, .9], np.float32) + (1 - lum) ** 2 * np.array([.035, .028, .012], np.float32)   # cold cast, teal in the shadows
    g = np.minimum(g, .86)                                               # no clean whites
    return _u8(f * (1 - a) + np.clip(g, 0, 1) * a)

def night_tint(img, p, a, frame, seed):
    """Day for night: underexposed, blue-violet, with only the brightest things left glowing."""
    f = _f(img); lum = _luma(f)
    g = (lum * .85 + f * .15) ** 1.5 * .62
    g = g * np.array([1.5, 1.02, .88], np.float32) + np.array([.05, .02, .03], np.float32) * (1 - lum)
    hot = np.clip((lum - .78) / .22, 0, 1); g = g + hot * np.array([.22, .2, .17], np.float32)
    return _u8(f * (1 - a) + np.clip(g, 0, 1) * a)

def heavy_vignette(img, p, a, frame, seed):
    """Darkness closing round the picture: a deep, slightly wandering vignette that leaves only the middle lit."""
    h, w = img.shape[:2]; x, y, nx, ny = _grid(h, w); f = _f(img)
    cx = math.sin(frame * .021 + seed) * .06; cy = math.cos(frame * .017 + seed) * .05 - .08
    r = np.sqrt(((nx - cx) / 1.05) ** 2 + ((ny - cy) / 1.0) ** 2)
    breath = 1 + .04 * math.sin(frame * .09)
    mask = np.clip(1 - np.clip((r * breath - .42) / .75, 0, 1) ** 1.4 * a * 1.02, 0, 1)[..., None]
    return _u8(f * mask)

def dark_fog(img, p, a, frame, seed):
    """Cold mist drifting through the frame: low, soft, slow, thickest at the bottom, and the picture dims under it."""
    h, w = img.shape[:2]; x, y, nx, ny = _grid(h, w); f = _f(img); t = frame / 30
    n = np.zeros((h, w), np.float32)
    for i, (fx, fy, sp) in enumerate(((1.3, 2.1, .11), (2.7, 3.4, -.07), (4.1, 5.3, .05))):
        n += np.sin(nx * fx * 3.1 + t * sp * 6 + i * 2 + seed) * np.cos(ny * fy * 2.3 - t * sp * 4 + i) / (i + 1)
    n = np.clip(n * .35 + .5, 0, 1) ** 1.5
    weight = np.clip(.25 + ny * .6 + .35 * np.abs(nx), 0, 1)
    fog = np.clip(n * weight * a * 1.25, 0, .85)[..., None]
    tint = np.array([.6, .56, .52], np.float32)
    return _u8(f * (1 - .25 * a) * (1 - fog) + tint * fog)

def film_damage(img, p, a, frame, seed):
    """Worn film stock: gate weave, exposure flutter, running scratches, dust, hairs and heavy grain."""
    h, w = img.shape[:2]; f = _f(img); rng = _rng(seed, frame // 2); slow = _rng(seed, frame // 24, 1)
    dy = (rng.random() - .5) * h * .008 * a; dx = (rng.random() - .5) * w * .004 * a
    f = cv2.warpAffine(f, np.float32([[1, 0, dx], [0, 1, dy]]), (w, h), borderMode=cv2.BORDER_REFLECT_101)
    lum = _luma(f); f = lum + (f - lum) * (1 - .45 * a)
    f = f * (1 + (rng.random() - .5) * .22 * a)
    layer = np.zeros((h, w), np.float32)
    for i in range(3):                                                   # scratches that persist for a while and wander
        if slow.random() < .65:
            x0 = int((.08 + .84 * slow.random()) * w + math.sin(frame * .4 + i) * w * .004)
            if rng.random() < .85: cv2.line(layer, (x0, 0), (x0 + int((slow.random() - .5) * w * .03), h), float(1 if slow.random() < .7 else -1) * (.35 + .4 * rng.random()), max(1, w // 400))
    for _ in range(int(10 * a)):                                         # dust
        if rng.random() < .5: cv2.circle(layer, (int(rng.random() * w), int(rng.random() * h)), max(1, int(rng.random() ** 2 * w * .008)), float(-1 if rng.random() < .6 else 1) * .8, -1)
    if rng.random() < .25 * a:                                           # a hair
        pts = np.cumsum(np.vstack([[rng.random() * w, rng.random() * h], rng.normal(0, w * .02, (6, 2))]), 0).astype(np.int32)
        cv2.polylines(layer, [pts], False, -.8, max(1, w // 500))
    layer = cv2.GaussianBlur(layer, (0, 0), max(.6, w / 900))[..., None] * a
    f = f + layer * .55
    grain = rng.normal(0, .04 * a, (h // 2 + 1, w // 2 + 1)).astype(np.float32)
    f = f + cv2.resize(grain, (w, h), interpolation=cv2.INTER_LINEAR)[..., None]
    if rng.random() < .03 * a: f = f * .55 + .3                          # a flash frame
    return _u8(np.clip(f, 0, 1))

def lamp_flicker(img, p, a, frame, seed):
    """A failing bulb: the picture holds, then dips hard or cuts to near black for a frame or two, with no rhythm."""
    f = _f(img); v = _lamp(frame, seed, .93)
    v = 1 - (1 - v) * a - .05 * a * _hash(frame, seed + 3)
    g = f * v
    if v < .6: g = g * np.array([1.08, 1.0, .9], np.float32)             # the dark frames go cold
    return _u8(np.clip(g, 0, 1))

def blackout(img, p, a, frame, seed):
    """Hard cuts to black: the picture is simply gone for a few frames at a time, more often as amount rises."""
    k = frame // 3
    if _hash(k, seed + 11) < .5 * a: return np.zeros_like(img) if _hash(k, seed + 13) < .75 else _u8(_f(img) * .12)
    return img.copy()

def vhs_tracking(img, p, a, frame, seed):
    """A tape that has been watched too many times: washed-out colour bleeding sideways, tracking bands that tear the picture, head-switch noise along the bottom."""
    h, w = img.shape[:2]; x, y, nx, ny = _grid(h, w); f = _f(img); rng = _rng(seed, frame)
    lum = _luma(f); g = lum + (f - lum) * (1 - .5 * a); g = g * (1 - .12 * a) + .04 * a
    k = max(1, int(w * .025 * a)) | 1; d = int(round(w * .006 * a))
    g[:, :, 2] = np.roll(cv2.blur(g[:, :, 2], (k, 1)), d, axis=1); g[:, :, 0] = np.roll(cv2.blur(g[:, :, 0], (k, 1)), -d, axis=1)
    yy = y / h; shift = np.zeros((h, w), np.float32); noise = np.zeros((h, w), np.float32)
    for i in range(2):                                                   # rolling tracking bands
        pos = ((frame * (.013 + i * .009) + _hash(i, seed)) % 1.3) - .15
        band = np.exp(-((yy - pos) / (.025 + i * .02)) ** 2)
        shift += band * w * (.05 + .04 * i) * a * (1 if i else -1); noise += band
    shift += (rng.normal(0, 1, (h, 1)).astype(np.float32)) * w * .0015 * a          # line jitter
    foot = np.clip((yy - (1 - .045 * a)) / .02, 0, 1); shift += foot * w * .06 * math.sin(frame * 1.3); noise += foot
    g = cv2.remap(g, x + shift, y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)
    snow = (rng.random((h, max(2, w // 3))) < .22).astype(np.float32); snow = cv2.resize(snow, (w, h), interpolation=cv2.INTER_NEAREST)
    g = g + (noise * snow * .6 * a)[..., None] + rng.normal(0, .03 * a, (h, w, 1)).astype(np.float32)
    g *= (1 - .08 * a * (.5 + .5 * np.sin(y * math.pi)))[..., None]       # scanlines
    return _u8(np.clip(g, 0, 1))

def static_burst(img, p, a, frame, seed):
    """Signal loss: the picture breaks into dead-channel noise, rows tear sideways and the image underneath goes grey."""
    h, w = img.shape[:2]; x, y, nx, ny = _grid(h, w); f = _f(img); rng = _rng(seed, frame)
    rows = max(4, h // 14); tear = np.repeat((rng.random(rows) < .35 * a) * (rng.random(rows) - .5) * w * .5 * a, h // rows + 1)[:h].astype(np.float32)[:, None]
    g = cv2.remap(f, x + tear, y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)
    lum = _luma(g); g = lum + (g - lum) * (1 - a)
    cell = max(1, w // 270); snow = rng.random((h // cell + 1, w // (cell * 2) + 1)).astype(np.float32)
    snow = cv2.resize(snow, (w, h), interpolation=cv2.INTER_NEAREST)[..., None]
    mix = np.clip(a * 1.15 - .15 + (rng.random((rows, 1)).repeat(h // rows + 1, 0)[:h] - .5)[:, None] * .5 * a, 0, 1).astype(np.float32).reshape(h, 1, 1)
    g = g * (1 - mix) + snow * mix * .9
    bars = (rng.random(rows) < .12 * a).repeat(h // rows + 1)[:h].astype(np.float32).reshape(h, 1, 1); g = g * (1 - bars * .85)
    return _u8(np.clip(g, 0, 1))

def slow_warp(img, p, a, frame, seed):
    """Something wrong with the room: the picture breathes and bends very slowly, as if seen through old glass or deep water."""
    h, w = img.shape[:2]; x, y, nx, ny = _grid(h, w); t = frame / 30
    dx = (np.sin(ny * 2.3 + t * .9 + seed) * .012 + np.sin(ny * 5.1 - t * .6 + nx * 1.7) * .006) * w * a
    dy = (np.cos(nx * 2.9 - t * .7 + seed) * .010 + np.sin(nx * 4.3 + t * .5 + ny * 2.1) * .005) * h * a
    r = nx * nx + ny * ny; pull = 1 + .05 * a * math.sin(t * .8) * (1 - r * .5)
    return cv2.remap(img, (x - w / 2) / pull + w / 2 + dx, (y - h / 2) / pull + h / 2 + dy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)

def streak_smear(img, p, a, frame, seed):
    """The picture is dragged apart vertically: columns smear up and down into long streaks and thin out, the way the theme's lettering leaves."""
    h, w = img.shape[:2]; f = _f(img); rng = _rng(seed, 0)
    cols = max(8, w // 6); weight = cv2.resize(rng.random((1, cols)).astype(np.float32) ** 2, (w, 1), interpolation=cv2.INTER_NEAREST)
    weight = np.clip(weight * 2.2 * a + (a - .35) * 1.2, 0, 1)             # which columns go first
    k = max(3, int(h * .55 * a)) | 1
    long = cv2.blur(f, (1, k)); longer = cv2.blur(f, (1, min(h | 1, k * 3 | 1)))
    bright = np.maximum(long, longer * 1.1)
    g = f * (1 - weight[..., None]) + bright * weight[..., None]
    g = g * (1 - .5 * a * weight[..., None] * a)                          # thin out as it goes
    return _u8(np.clip(g, 0, 1))

def mirror_seam(img, p, a, frame, seed):
    """The picture folds onto itself down the middle, so everything in it becomes symmetrical and wrong."""
    h, w = img.shape[:2]; f = _f(img); half = w // 2
    left = f[:, :half]; m = f.copy(); m[:, w - half:] = left[:, ::-1]
    seam = np.exp(-((np.arange(w, dtype=np.float32) - w / 2) / (w * .004)) ** 2)[None, :, None] * .25
    m = m * (1 - seam)
    return _u8(f * (1 - a) + m * a)

def creep_zoom(img, p, a, frame, seed):
    """The slow push-in: the picture creeps toward the viewer over the length of the effect, with a faint hand-held tremble."""
    h, w = img.shape[:2]; s = 1 + .14 * a * p
    dx = (_hash(frame // 3, seed) - .5) * w * .0025 * a; dy = (_hash(frame // 3, seed + 1) - .5) * h * .0025 * a
    m = cv2.getRotationMatrix2D((w / 2, h * .45), 0, s); m[:, 2] += [dx, dy]
    return cv2.warpAffine(img, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)

def cold_flash(img, p, a, frame, seed):
    """A cut flash for this theme: not white but a cold over-exposed frame that burns out to blue-grey."""
    f = _f(img); lum = _luma(f)
    g = np.clip(lum * (1 + 1.1 * a) + .1 * a, 0, 1) * np.array([1., .95, .88], np.float32)
    return _u8(f * (1 - a) + g * a)


EFFECTS = {
    'cold_grade': cold_grade, 'night_tint': night_tint, 'heavy_vignette': heavy_vignette, 'dark_fog': dark_fog,
    'film_damage': film_damage, 'vhs_tracking': vhs_tracking, 'static_burst': static_burst,
    'lamp_flicker': lamp_flicker, 'blackout': blackout, 'cold_flash': cold_flash,
    'slow_warp': slow_warp, 'streak_smear': streak_smear, 'mirror_seam': mirror_seam, 'creep_zoom': creep_zoom,
}
