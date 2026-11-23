"""The Historical theme's own effects: archive-film treatments.
    EFFECTS = {name: fn(img, progress, amount, frame, seed) -> img}     (BGR uint8 in and out, amount 0..1)
Every effect is a pure function of its arguments: randomness is seeded from (seed, frame), and film
wear steps 12 times a second (every 2.5 frames at 30 fps) like the theme's graphics do.
The engine never calls these with amount == 0.
"""
import math
import cv2
import numpy as np

_cache = {}

def _rng(seed, frame, salt=0): return np.random.default_rng((int(seed) * 1000003 + int(frame) * 7919 + salt * 104729) & 0x7FFFFFFF)
def _tick(frame): return int(frame * 12 // 30)                        # the 12 fps step film wear runs on
def _u8(a): return np.clip(a, 0, 255).astype(np.uint8)
def _mix(a, b, t): return cv2.addWeighted(a, 1 - t, b, t, 0)
def _hash(n): x = math.sin(n * 127.1 + 311.7) * 43758.5453; return x - math.floor(x)
def _noise(x): i = math.floor(x); f = x - i; u = f * f * (3 - 2 * f); return _hash(i) * (1 - u) + _hash(i + 1) * u

def _tone_lut(dark, light, contrast=1.25, lift=10):
    """Grey 0..255 -> BGR along dark..light, with an S-curve and lifted blacks."""
    key = ('lut', dark, light, contrast, lift)
    if key not in _cache:
        v = np.linspace(0, 1, 256, dtype=np.float32)
        v = np.clip((v - .5) * contrast + .5, 0, 1); v = v * v * (3 - 2 * v) * .6 + v * .4
        d, l = np.float32(dark), np.float32(light)
        _cache[key] = _u8(d + (l - d) * v[:, None] + lift * (1 - v[:, None]))
    return _cache[key]
def _toned(img, dark, light, **kw):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY); lut = _tone_lut(dark, light, **kw)
    return cv2.merge([cv2.LUT(g, np.ascontiguousarray(lut[:, c])) for c in range(3)])

def _radial(h, w, inner=.45, outer=1.05, cy=.5):
    key = ('rad', h, w, inner, outer, cy)
    if key not in _cache:
        y, x = np.mgrid[0:h, 0:w].astype(np.float32); r = np.hypot(x / w - .5, y / h - cy) / .707
        _cache[key] = np.clip((r - inner) / (outer - inner), 0, 1) ** 1.6
    return _cache[key]
def _blotch(h, w, seed, cells=6):
    """Low-frequency 0..1 mottling, fixed for a given seed (does not flicker)."""
    key = ('blot', h, w, seed, cells)
    if key not in _cache:
        small = np.random.default_rng(seed * 7 + 3).random((cells * 2, cells), dtype=np.float32)
        _cache[key] = cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC).clip(0, 1)
    return _cache[key]
def _grain(img, strength, seed, frame):
    h, w = img.shape[:2]; rng = _rng(seed, _tick(frame), 1)
    n = rng.integers(0, 256, (h // 2 + 1, w // 2 + 1), dtype=np.uint8)
    n = cv2.resize(n, (w, h), interpolation=cv2.INTER_LINEAR).astype(np.int16) - 128
    return _u8(img.astype(np.int16) + (n * (strength / 128)).astype(np.int16)[..., None])
def _wear(img, amount, seed, frame, scratches=True, dust=True):
    """Hairline scratches that wander, dust specks and the odd hair, drawn straight onto the frame."""
    h, w = img.shape[:2]; k = h / 1920; f = _tick(frame); out = img.copy(); rng = _rng(seed, f, 2)
    if scratches:
        for i in range(4):
            if _hash(f // 6 + i * 7.3 + seed) < .5 or _hash(f + i * 13.1) < .25: continue
            x = int(w * (.06 + .88 * _noise(f * .03 + i * 19 + seed))) + int(rng.integers(-2, 3)); light = _hash(i * 3.3 + seed) > .35
            a = (.25 + .35 * _hash(f * 1.7 + i)) * amount; col = out[:, x:x + max(1, round(2 * k))].astype(np.float32)
            out[:, x:x + max(1, round(2 * k))] = _u8(col + (255 - col) * a if light else col * (1 - a))
    if dust:
        layer = np.zeros((h, w), np.float32)
        for i in range(int(rng.integers(2, 7))):
            x, y = int(rng.integers(0, w)), int(rng.integers(0, h)); sign = 1. if rng.random() > .45 else -1.
            if rng.random() > .3: cv2.circle(layer, (x, y), int((2 + rng.random() * 5) * k) + 1, sign, -1, cv2.LINE_AA)
            else: cv2.ellipse(layer, (x, y), (int((14 + rng.random() * 30) * k), int((6 + rng.random() * 14) * k)), float(rng.random() * 180), 0, 200, sign, max(1, round(2 * k)), cv2.LINE_AA)
        o = out.astype(np.float32); m = (np.abs(layer) * .7 * amount)[..., None]
        out = _u8(o + (np.where(layer[..., None] > 0, 235., 12.) - o) * m)
    return out
def _flicker_gain(frame, seed, amount):
    f = _tick(frame); dip = (.12 + .14 * _hash(f + seed)) if _hash(f * .77 + 9 + seed) > .88 else 0
    return 1 - (_hash(f * 1.31 + seed) * .07 + dip) * amount

# ---------------------------------------------------------------- looks
NAVY, COLD = (30, 18, 10), (242, 236, 228)           # BGR: shadow and highlight of the silver print
def silver_print(img, progress, amount, frame, seed):
    """The theme base look: a silver black-and-white print with a cool cast, lifted blacks and firm mid contrast."""
    return _mix(img, _toned(img, NAVY, COLD), amount)
def sepia_tone(img, progress, amount, frame, seed):
    """A warm brown albumen-print tone."""
    return _mix(img, _toned(img, (10, 20, 34), (196, 226, 240), contrast=1.15, lift=14), amount)
def old_film(img, progress, amount, frame, seed):
    """Everything at once: half-drained colour, grain, dust, hairline scratches, flicker and dark corners."""
    h, w = img.shape[:2]; out = _mix(img, _toned(img, NAVY, COLD, contrast=1.15), .75 * amount)
    out = _grain(out, 30 * amount, seed, frame); out = _wear(out, amount, seed, frame)
    v = 1 - _radial(h, w) * .7 * amount
    return _u8(out.astype(np.float32) * (v * _flicker_gain(frame, seed, amount))[..., None])
def newsprint(img, progress, amount, frame, seed):
    """Printed in a newspaper: a coarse ink halftone on yellowed paper."""
    h, w = img.shape[:2]; cell = max(4., h / 150.); g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    g = np.clip((g - .5) * 1.3 + .52, 0, 1); key = ('dots', h, w)
    if key not in _cache:
        y, x = np.mgrid[0:h, 0:w].astype(np.float32); c, s = math.cos(.5), math.sin(.5); u, v = (x * c + y * s) / cell, (-x * s + y * c) / cell
        _cache[key] = np.hypot(u - np.floor(u) - .5, v - np.floor(v) - .5) * 1.5
    ink = np.clip((np.sqrt(np.clip(1 - cv2.GaussianBlur(g, (0, 0), cell * .35), 0, 1)) * 1.05 - _cache[key]) * cell * .9 + .5, 0, 1)
    paper = np.float32([176, 200, 208]) * (.9 + .1 * _blotch(h, w, seed)[..., None]); out = paper + (np.float32([34, 26, 22]) - paper) * ink[..., None]
    return _mix(img, _u8(out), amount)
def paper_print(img, progress, amount, frame, seed):
    """The frame becomes a photographic print lying on the dark table: silver-toned, a pale mottled paper border, a slight tilt."""
    h, w = img.shape[:2]; b = .05 * amount; k = h / 1920
    pic = _mix(img, _toned(img, NAVY, COLD), min(1., amount * 1.2)); paper = (np.float32([174, 195, 203]) * (.86 + .14 * _blotch(h, w, seed + 5)[..., None]))
    m = cv2.getRotationMatrix2D((w / 2, h / 2), -1.6 * amount, 1 - b * 2.4); inner = cv2.warpAffine(pic, m, (w, h), borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0))
    mask = cv2.warpAffine(np.full((h, w), 255, np.uint8), m, (w, h)); m2 = cv2.getRotationMatrix2D((w / 2, h / 2), -1.6 * amount, 1 - b * .9)
    sheet = cv2.warpAffine(np.full((h, w), 255, np.uint8), m2, (w, h)); table = np.float32([23, 16, 11])
    shadow = cv2.GaussianBlur(np.roll(sheet, (int(18 * k), int(12 * k)), (0, 1)), (0, 0), 14 * k).astype(np.float32)[..., None] / 255
    out = table * (1 - shadow * .7) + np.zeros((h, w, 3), np.float32); s = sheet.astype(np.float32)[..., None] / 255; out = out * (1 - s) + paper * s
    mk = mask.astype(np.float32)[..., None] / 255; out = out * (1 - mk) + inner.astype(np.float32) * mk
    return _grain(_u8(out), 16 * amount, seed, frame)

# ---------------------------------------------------------------- wear
def film_scratches(img, progress, amount, frame, seed):
    """Hairline scratches that wander sideways, dust specks and the odd hair in the gate."""
    return _wear(img, min(1., amount * 1.2), seed, frame)
def film_grain(img, progress, amount, frame, seed):
    """Coarse silver grain that changes 12 times a second."""
    return _grain(img, 44 * amount, seed, frame)
def gate_weave(img, progress, amount, frame, seed):
    """The picture wanders in the projector gate; now and then the frame line slips into view."""
    h, w = img.shape[:2]; k = h / 1920; t = frame / 30; f = _tick(frame)
    dx = ((_noise(t * 5.1 + seed) - .5) * 14 + (_hash(f + seed) - .5) * 5) * amount * k; dy = (_noise(t * 4.3 + 40 + seed) - .5) * 18 * amount * k
    slip = (60 + 90 * _hash(f)) * k * amount if _hash(f * .61 + seed * 3) > .9 else 0
    m = cv2.getRotationMatrix2D((w / 2, h / 2), (_noise(t * 2.2 + seed) - .5) * .5 * amount, 1 + .02 * amount); m[0, 2] += dx; m[1, 2] += dy + slip
    out = cv2.warpAffine(img, m, (w, h), borderMode=cv2.BORDER_WRAP)
    if slip: y = int(slip + dy); out[max(0, y - int(16 * k)):max(0, y)] = (8, 6, 5)
    return out
def projector_flicker(img, progress, amount, frame, seed):
    """Lamp flicker: brightness steps unevenly 12 times a second, with a soft darker band drifting down."""
    h, w = img.shape[:2]; gain = _flicker_gain(frame, seed, amount * 1.6); y = np.linspace(0, 1, h, dtype=np.float32)
    band = 1 - .12 * amount * np.exp(-((y - (frame / 30 * .7 + seed * .3) % 1.4 + .2) ** 2) / .02)
    return _u8(img.astype(np.float32) * (gain * band)[:, None, None])
def burnt_vignette(img, progress, amount, frame, seed):
    """Heavy, uneven dark corners with a warm-black edge, as if the print had been kept in a tin."""
    h, w = img.shape[:2]; r = np.clip(_radial(h, w, .3, 1.) * (.75 + .6 * _blotch(h, w, seed + 11, 5)), 0, 1) * amount
    return _u8(img.astype(np.float32) * (1 - r[..., None] * np.float32([.96, .95, .9])) + r[..., None] * np.float32([6, 9, 16]) * .5)

# ---------------------------------------------------------------- light and accents
def blue_leak(img, progress, amount, frame, seed):
    """A cold steel-blue light leak crossing the frame once over the effect's length."""
    h, w = img.shape[:2]; key = ('leak', h, w)
    if key not in _cache: _cache[key] = np.mgrid[0:h, 0:w].astype(np.float32)
    y, x = _cache[key]; cx = w * (-.3 + 1.6 * progress); cy = h * (.35 + .2 * math.sin(progress * 3 + seed))
    glow = np.exp(-(((x - cx) / (w * .5)) ** 2 + ((y - cy) / (h * .42)) ** 2)) * amount * (.85 + .15 * _hash(_tick(frame)))
    return _u8(255 - (255 - img.astype(np.float32)) * (1 - glow[..., None] * np.float32([1., .74, .5])))
def crimson_wash(img, progress, amount, frame, seed):
    """The theme's one colour takes the frame: a black-to-crimson-to-bone duotone, for a beat of emphasis."""
    key = 'crimson'
    if key not in _cache:
        v = np.linspace(0, 1, 256, dtype=np.float32)[:, None]; a, b, c = np.float32([10, 6, 10]), np.float32([45, 30, 168]), np.float32([220, 233, 239])
        _cache[key] = _u8(np.where(v < .55, a + (b - a) * (v / .55), b + (c - b) * ((v - .55) / .45)))
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY); lut = _cache[key]
    return _mix(img, cv2.merge([cv2.LUT(g, np.ascontiguousarray(lut[:, c])) for c in range(3)]), amount)

# ---------------------------------------------------------------- cuts
def splice_flash(img, progress, amount, frame, seed):
    """A film splice: the exposure pops toward white, the picture jumps a little and the edges burn warm."""
    h, w = img.shape[:2]; jump = int(h * .05 * amount * (_hash(_tick(frame) + seed) - .3)); out = np.roll(img, jump, 0).astype(np.float32)
    if jump: out[max(0, jump - 6):max(1, jump)] = 10
    out = out * (1 + 1.6 * amount) + 150 * amount * amount; edge = _radial(h, w, .35, 1.)[..., None] * amount
    return _u8(out * (1 - edge * .5) + edge * np.float32([40, 110, 230]) * .6)
def dip_to_dark(img, progress, amount, frame, seed):
    """The lamp dims: the picture sinks to near-black from the corners inward."""
    h, w = img.shape[:2]; r = np.clip(_radial(h, w, .0, .9) * 1.4 + amount * 1.1 - .35, 0, 1) * min(1., amount * 1.5)
    return _u8(img.astype(np.float32) * (1 - r[..., None]) + r[..., None] * np.float32([14, 9, 6]))

EFFECTS = {
    'silver_print': silver_print, 'sepia_tone': sepia_tone, 'old_film': old_film, 'newsprint': newsprint, 'paper_print': paper_print,
    'film_scratches': film_scratches, 'film_grain': film_grain, 'gate_weave': gate_weave, 'projector_flicker': projector_flicker, 'burnt_vignette': burnt_vignette,
    'blue_leak': blue_leak, 'crimson_wash': crimson_wash, 'splice_flash': splice_flash, 'dip_to_dark': dip_to_dark,
}
