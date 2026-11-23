"""Lines of Light theme effects. Loaded by library/_shared/effects_engine.load_theme().

    EFFECTS = {name: fn(img, progress, amount, frame, seed) -> img}     BGR uint8 in and out

The style: the room drops to near-black and deep teal haze, and light is ADDED to it: thin lines with a
white core, a red echo one way, a blue echo the other and a lilac glow. Red is a cause, blue the result.
Every effect is stateless and deterministic (randomness only from seed and frame), never modifies its
input, and fades to the untouched picture as amount goes to 0.

`night` is the theme's look (footage.look in a storyboard): an earlier version dimmed around a person mask;
here a soft centre-weighted falloff keeps the speaker brighter than the room.
"""
import math
from functools import lru_cache
import cv2
import numpy as np

# Theme colours as BGR 0..1 (theme.json)
TEAL = np.array([22, 20, 8], np.float32) / 255          # v1 LL_TEAL, the haze the room drops to
DEEP = np.array([54, 52, 29], np.float32) / 255          # #1d3436
CORE = np.array([255, 243, 245], np.float32) / 255
LILAC = np.array([242, 214, 240], np.float32) / 255
RED = np.array([64, 46, 255], np.float32) / 255
BLUE = np.array([255, 110, 40], np.float32) / 255
ORANGE = np.array([30, 130, 255], np.float32) / 255


def _u8(a): return np.clip(np.rint(a * 255), 0, 255).astype(np.uint8)
def _f(img): return img.astype(np.float32) * (1 / 255)
def _luma(f): return cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
def _ease(x): x = min(max(x, 0.), 1.); return 1 - (1 - x) ** 4            # the theme's draw-on: quartic ease-out
def _io(x): x = min(max(x, 0.), 1.); return 8 * x ** 4 if x < .5 else 1 - (-2 * x + 2) ** 4 / 2
def _hash(n, seed=0):
    x = math.sin(n * 127.1 + seed * 311.7 + 74.7) * 43758.5453
    return x - math.floor(x)
def _screen(base, light): return 1 - (1 - base) * (1 - np.clip(light, 0, 1))
def _shift(a, dx, dy=0):
    return cv2.warpAffine(a, np.float32([[1, 0, dx], [0, 1, dy]]), (a.shape[1], a.shape[0]), borderMode=cv2.BORDER_REPLICATE)


@lru_cache(maxsize=8)
def _grid(h, w):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    return x / (w - 1), y / (h - 1)

@lru_cache(maxsize=8)
def _night_masks(h, w):
    """The speaker falloff (1 on the face/upper body, 0 in the room) and the room vignette, both (h, w, 1)."""
    u, v = _grid(h, w)
    d = np.sqrt(((u - .5) / .34) ** 2 + ((v - .5) / .27) ** 2)
    you = np.clip(1.15 - d, 0, 1); you = you * you * (3 - 2 * you)                        # soft centre-weighted falloff
    vig = np.clip(1 - .75 * (((u - .5) ** 2 + (v - .44) ** 2) * 2.2), .35, 1)            # v1 ll_dim's vignette
    haze = np.exp(-(((u - .5) / .55) ** 2 + ((v - .42) / .42) ** 2))                    # teal pooled behind the speaker
    return you[..., None], vig[..., None], haze[..., None]

def _light(mask, split):
    """ll_render: a 0..1 line mask -> additive light (white core, red echo left, blue echo right, lilac glow)."""
    h, w = mask.shape; s = max(1, int(round(split)))
    out = np.zeros(mask.shape + (3,), np.float32)
    out += _shift(mask, -s)[..., None] * RED * .95
    out += _shift(mask, s)[..., None] * BLUE
    out += mask[..., None] * CORE * .75
    out += cv2.GaussianBlur(mask, (0, 0), max(1., w * .008))[..., None] * LILAC * .8
    return out

def _hline(h, w, y, width):
    """A horizontal 0..1 line mask at row y (antialiased)."""
    rows = np.arange(h, dtype=np.float32)
    col = np.clip(1 - np.abs(rows - y) / max(.5, width / 2), 0, 1)
    return np.repeat(col[:, None], w, 1)


def night(img, p, a, frame, seed):
    """THE LOOK. The room drops to near-black teal with a soft vignette; the speaker (a centre-weighted falloff)
    stays lit but cool and a little dimmed, so the theme's light reads like v1. Use about 0.9 as footage.look."""
    f = _f(img); h, w = f.shape[:2]
    you, vig, haze = _night_masks(h, w)
    lum = _luma(f)[..., None]
    room = (f * .07 + lum * .03 + TEAL * (.8 + .7 * haze)) * vig                       # near-black teal
    cool = lum + (f - lum) * .78                                                        # a little colour drained
    knee = np.where(cool > .55, .55 + (cool - .55) * .35, cool)                         # bright walls pulled down, skin kept
    lit = np.clip(knee, 0, 1) ** 1.15 * .92 + TEAL * .3                                 # kept readable, a touch darker
    lit = lit * np.array([1.04, 1.0, .95], np.float32)                                  # cool cast (B up, R down)
    lit = np.minimum(lit, .9)                                                           # no clipped whites
    out = room * (1 - you) + lit * you
    return _u8(f * (1 - a) + out * a)

def rgb_echo(img, p, a, frame, seed):
    """The style's split: the bright edges of the picture get a red echo one way and a blue echo the other,
    with a white-lilac core, as if the picture were drawn in light. Peaks mid-effect."""
    f = _f(img); h, w = f.shape[:2]; lum = _luma(f)
    edge = cv2.Laplacian(cv2.GaussianBlur(lum, (0, 0), 1.2), cv2.CV_32F, ksize=3)
    m = np.clip(np.abs(edge) * 6, 0, 1) * np.clip(lum * 1.4, 0, 1)
    split = w * .005 * (1 + 2 * a)
    out = f * (1 - .2 * a) + _light(m, split) * a * .6
    r, b = _shift(f[..., 2], -split * .8), _shift(f[..., 0], split * .8)                 # the whole picture splits a little too
    out[..., 2] = out[..., 2] * (1 - .5 * a) + r * .5 * a; out[..., 0] = out[..., 0] * (1 - .5 * a) + b * .5 * a
    return _u8(out)

def origin_flare(img, p, a, frame, seed):
    """The red dot fires: a red flare blooms from the top-left origin with thin rays fanning into the frame and a
    lilac-white pin at its heart. The cause, as a hit. Additive."""
    f = _f(img); h, w = f.shape[:2]; u, v = _grid(h, w)
    ox, oy = .1, .085
    dx, dy = (u - ox) * w / h, v - oy; r = np.sqrt(dx * dx + dy * dy) + 1e-4
    ang = np.arctan2(dy, dx)
    rays = np.zeros_like(r)
    for i in range(9):
        th = math.radians(8 + i * 9.5 + (_hash(i, seed) - .5) * 4); width = .0035 + .003 * _hash(i, seed + 3)
        reach = (.45 + .7 * _hash(i, seed + 5)) * (.3 + .7 * a)
        rays += np.exp(-((ang - th) * r / width) ** 2) * np.clip(1 - r / reach, 0, 1) ** 1.5
    glow = np.exp(-(r / (.05 + .12 * a)) ** 2)
    pin = np.exp(-(r / .012) ** 2)
    light = rays[..., None] * (RED * .9 + LILAC * .25) + glow[..., None] * RED * 1.2 + pin[..., None] * CORE
    return _u8(_screen(f, light * a))

def result_flash(img, p, a, frame, seed):
    """Blue = the result arriving: a soft blue flash swells from where the line lands (lower middle by default)
    and lifts the picture toward cold blue-white; a thin ring of light opens out of it."""
    f = _f(img); h, w = f.shape[:2]; u, v = _grid(h, w)
    cx, cy = .5, .86
    d = np.sqrt(((u - cx) * w / h) ** 2 + (v - cy) ** 2)
    flash = np.exp(-(d / (.08 + .2 * a)) ** 2)
    ring_r = .05 + .5 * _ease(p)
    ring = np.exp(-((d - ring_r) / .004) ** 2) * (1 - p)
    light = flash[..., None] * BLUE * .75 * a + ring[..., None] * (CORE * .7 + BLUE * .6) * min(1., a * 1.5)
    out = _screen(f, light)
    out = out + (_luma(out)[..., None] * BLUE - out) * .1 * a                           # the frame cools for a moment
    return _u8(out)

def scan_haze(img, p, a, frame, seed):
    """Teal haze drifts across the picture with fine dark scanlines and a slow bright scan band: the screen the
    lines are drawn on. Quiet enough to hold for a whole shot."""
    f = _f(img); h, w = f.shape[:2]; u, v = _grid(h, w)
    n = max(2, h // 240)
    lines = (1 - .22 * a * ((np.arange(h) // n) % 2 == 0).astype(np.float32))[:, None, None]
    drift = .5 + .5 * np.sin(u * 5 + v * 3 + frame * .03 + seed)
    hz = (np.exp(-((v - .45) / .5) ** 2) * (.6 + .4 * drift))[..., None]
    band_y = ((frame * .006 + seed * .37) % 1.3) - .15
    band = np.exp(-((v - band_y) / .025) ** 2)[..., None]
    out = f * lines * (1 - .25 * a) + DEEP * hz * .55 * a + band * (LILAC * .12 + DEEP * .4) * a
    return _u8(out)

def light_trails(img, p, a, frame, seed):
    """Afterimages: the brightest parts of the picture leave fading echoes of light sliding off to one side, red
    behind and blue ahead, like a line still moving after the lock."""
    f = _f(img); h, w = f.shape[:2]; lum = _luma(f)
    hi = np.clip((lum - .42) / .3, 0, 1) ** 2
    out = f.copy(); step = w * .018 * (.4 + a)
    for i in range(1, 6):
        fade = (1 - i / 6) ** 1.5 * a * .4
        out += _shift(hi, -step * i)[..., None] * RED * fade
        out += _shift(hi, step * i * .6)[..., None] * BLUE * fade * .8
    out += cv2.GaussianBlur(hi, (0, 0), w * .01)[..., None] * LILAC * .35 * a
    return _u8(out)

def line_sweep(img, p, a, frame, seed):
    """A single line of light sweeps down the frame (white core, red echo above, blue below, lilac glow) and
    lights what it passes for a beat. Eased like a draw-on and locks off the bottom edge."""
    f = _f(img); h, w = f.shape[:2]
    y = (-.05 + 1.1 * _io(p)) * h
    m = _hline(h, w, y, max(2., h * .0018))
    light = np.zeros_like(f)
    off = max(2, int(h * .004))
    light += _shift(m, 0, -off)[..., None] * RED * .95 + _shift(m, 0, off)[..., None] * BLUE + m[..., None] * CORE * .9
    light += cv2.GaussianBlur(m, (0, 0), h * .006)[..., None] * LILAC * .9
    rows = np.arange(h, dtype=np.float32)[:, None, None]
    wake = np.clip(1 - (y - rows) / (h * .18), 0, 1) * (rows < y)                        # just-scanned picture glows
    out = f * (1 + .25 * wake * a) + light * a
    return _u8(_screen(np.clip(out, 0, 1), np.zeros_like(f)))

def lilac_bloom(img, p, a, frame, seed):
    """Highlights bloom into the theme's cold lilac halo, the way every line of light glows; shadows sink to teal."""
    f = _f(img); h, w = f.shape[:2]; lum = _luma(f)
    hi = np.clip((lum - .6) / .4, 0, 1)
    glow = cv2.GaussianBlur(hi, (0, 0), w * .02)[..., None] * LILAC + cv2.GaussianBlur(hi, (0, 0), w * .06)[..., None] * (LILAC * .5 + BLUE * .2)
    base = f * (1 - .2 * a) + TEAL * (1 - lum[..., None]) * .6 * a
    return _u8(_screen(base, glow * .8 * a))

def lock_flash(img, p, a, frame, seed):
    """The hard lock: a white-core frame of light snaps on round the picture with a split red/blue edge,
    then dims. Use 'in' on a cut or at the moment a graphic locks."""
    f = _f(img); h, w = f.shape[:2]; u, v = _grid(h, w)
    inset = .035
    dd = np.minimum(np.minimum(np.abs(u - inset) * w, np.abs(u - 1 + inset) * w), np.minimum(np.abs(v - inset * w / h) * h, np.abs(v - 1 + inset * w / h) * h))
    inside = ((u > inset - .002) & (u < 1 - inset + .002) & (v > inset * w / h - .002) & (v < 1 - inset * w / h + .002)).astype(np.float32)
    m = np.clip(1 - dd / 2.2, 0, 1) * inside
    out = f * (1 + .2 * a) + _light(m, w * .004) * a * 1.2
    return _u8(out)


def dim(img, p, a, frame, seed):
    """Plain dimming: the footage's brightness (its opacity over the theme's near-black teal) turned down by `amount`
    (0 = untouched, 1 = 85% darker). No vignette or colour change, so it stacks with any other effect, a look or a
    lighting effect: e.g. dim 0.4 under bright overlays, or over a whole clip to quiet a busy room."""
    f = _f(img); k = .85 * min(max(a, 0.), 1.)
    return _u8(f * (1 - k) + TEAL * .4 * k)


EFFECTS = {
    'night': night,
    'dim': dim,
    'rgb_echo': rgb_echo,
    'origin_flare': origin_flare,
    'result_flash': result_flash,
    'scan_haze': scan_haze,
    'light_trails': light_trails,
    'line_sweep': line_sweep,
    'lilac_bloom': lilac_bloom,
    'lock_flash': lock_flash,
}
