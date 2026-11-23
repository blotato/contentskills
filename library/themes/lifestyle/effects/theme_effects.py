"""Lifestyle theme effects: the faded, sunlit film look of the theme, written for the shared engine.
library/_shared/effects_engine.py load_theme() picks up EFFECTS = {name: fn(img, progress, amount, frame, seed) -> img}.
All are pure functions of their inputs (BGR uint8 in and out); amount fades each one in from nothing.
"""
import math
import cv2
import numpy as np

def _bgr(hex_color): return np.array([int(hex_color[i:i + 2], 16) / 255 for i in (5, 3, 1)], np.float32)
PAPER, CREAM, LEAF, SAGE, SUN, CLAY, BLUSH, TEAL = (_bgr(c) for c in ('#E8F1DA', '#F5F8E9', '#6CAE48', '#8FBBAA', '#E9B44C', '#D8694A', '#EFC6B2', '#3E8B89'))

def _f(img): return img.astype(np.float32) / 255
def _u8(a): return np.clip(np.rint(a * 255), 0, 255).astype(np.uint8)
def _lum(f): return cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)[..., None]
def _mix(f, g, a): return _u8(f * (1 - a) + np.clip(g, 0, 1) * a)
def _grid(h, w):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    return x, y, (x / max(1, w - 1) - .5) * 2, (y / max(1, h - 1) - .5) * 2
def _rng(seed, frame): return np.random.default_rng(np.random.SeedSequence([int(seed), int(frame)]))
def _screen(f, light): return 1 - (1 - f) * (1 - np.clip(light, 0, 1))
def _dither(h, w): return ((np.indices((h, w)).sum(0) % 2) - .5)[..., None].astype(np.float32) / 255   # hides banding in smooth washes

def _grade(f, sat, lift, shadow, high, contrast=.92):
    """Matte film grade: lower contrast, lifted blacks tinted `shadow`, highlights tinted `high`."""
    lum = _lum(f)
    g = lum + (f - lum) * sat
    g = (g - .5) * contrast + .5
    g = g * (1 - lift) + lift                         # lifted blacks
    g = g + (1 - lum) ** 2 * shadow + lum ** 2 * high
    return g

def soft_film(img, p, a, frame, seed):
    """The theme base look: faded and warm, teal-green in the lifted shadows, cream in the highlights."""
    f = _f(img)
    return _mix(f, _grade(f, .8, .075, np.array([.06, .05, -.02], np.float32), np.array([-.075, .012, .04], np.float32), .88), a)

def golden_hour(img, p, a, frame, seed):
    """Late-afternoon sun: amber highlights, soft warm shadows, a glow falling from the top."""
    f = _f(img); h, w = img.shape[:2]; _, _, nx, ny = _grid(h, w)
    g = _grade(f, .95, .04, np.array([-.01, .012, .035], np.float32), np.array([-.11, .0, .06], np.float32), .96)
    top = (np.clip(.6 - ny * .5, 0, 1) ** 2)[..., None] * .16
    return _mix(f, _screen(g, SUN * top) + _dither(h, w), a)

def mint_fade(img, p, a, frame, seed):
    """A matte, pale mint print: colour held back, blacks lifted high, the paper tint washed through."""
    f = _f(img); lum = _lum(f)
    g = lum + (f - lum) * .68
    g = (g - .5) * .8 + .5
    g = g * .86 + PAPER * .14 + (1 - lum) ** 2 * np.array([.02, .045, .0], np.float32)
    return _mix(f, g, a)

def dream_bloom(img, p, a, frame, seed):
    """Soft diffusion: highlights spill into a wide creamy glow and fine detail softens slightly."""
    f = _f(img); w = img.shape[1]
    bright = np.maximum(f - .5, 0) / .5
    near = cv2.GaussianBlur(bright, (0, 0), max(1, w * .015)); wide = cv2.GaussianBlur(bright, (0, 0), max(1, w * .06))
    soft = cv2.GaussianBlur(f, (0, 0), max(1, w * .008))
    g = _screen(f * .75 + soft * .25, (near * .35 + wide * .5) * np.array([.85, .95, 1.], np.float32))
    return _mix(f, g, a)

def sun_leak(img, p, a, frame, seed):
    """A warm light leak drifting across the frame from one side to the other over the effect's time."""
    f = _f(img); h, w = img.shape[:2]; _, _, nx, ny = _grid(h, w)
    cx = -1.9 + 3.8 * p
    core = np.exp(-((nx - cx - ny * .35) ** 2 / .16))[..., None]
    wide = np.exp(-((nx - cx - ny * .35) ** 2 / 1.1))[..., None]
    wobble = (.75 + .25 * np.sin(ny * 2.2 + p * 5))[..., None]
    light = (core * np.array([.12, .34, .52], np.float32) + wide * np.array([.10, .28, .40], np.float32)) * wobble * a
    return _u8(_screen(f, light) + _dither(h, w))

def soft_grain(img, p, a, frame, seed):
    """Fine film grain, a little softer and larger than digital noise, with the odd speck of dust."""
    f = _f(img); h, w = img.shape[:2]; rng = _rng(seed, frame)
    noise = cv2.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), max(.6, w * .0016))[..., None]
    lum = _lum(f)
    out = f + noise * .045 * a * (1 - lum * .5)
    for _ in range(int(rng.integers(0, 3))):                                     # dust: tiny pale specks, new every frame
        x, y, r = int(rng.integers(0, w)), int(rng.integers(0, h)), max(1, int(w * .003 * rng.random() + 1))
        speck = np.zeros((h, w), np.float32); cv2.circle(speck, (x, y), r, 1., -1, cv2.LINE_AA)
        out = out + speck[..., None] * .5 * a * (CREAM - out)
    return _u8(out)

def paper_glow(img, p, a, frame, seed):
    """A light vignette: the edges fade toward the theme's paper colour instead of going dark."""
    f = _f(img); h, w = img.shape[:2]; _, _, nx, ny = _grid(h, w)
    d = np.clip((nx * nx * .9 + ny * ny * .9 - .35) / 1.3, 0, 1)[..., None] ** 1.4
    return _u8(f + (PAPER - f) * d * .85 * a + _dither(h, w) * a)

def paper_mat(img, p, a, frame, seed):
    """A paper border that grows in from the edges (the picture is not scaled): a mounted print."""
    f = _f(img); h, w = img.shape[:2]; x, y, _, _ = _grid(h, w)
    b = w * .085 * a
    edge = np.minimum(np.minimum(x, w - 1 - x), np.minimum(y, h - 1 - y) - b * .35)
    m = np.clip(b - edge + .5, 0, 1)[..., None] * min(1., a * 25)
    shade = np.clip(1 - (edge - b) / max(1., w * .012), 0, 1)[..., None] * (1 - m) * .18 * min(1., a * 4)   # soft inner shadow
    return _u8((f * (1 - shade)) * (1 - m) + PAPER * m)

def slow_push(img, p, a, frame, seed):
    """A gentle push-in that keeps creeping over the effect's time."""
    h, w = img.shape[:2]; s = 1 + a * (.05 + .07 * p)
    m = cv2.getRotationMatrix2D((w / 2, h * .46), 0, s)
    return cv2.warpAffine(img, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)

def tilt_blur(img, p, a, frame, seed):
    """Soft focus falling off toward the top and bottom, leaving a sharp band across the middle."""
    f = _f(img); h, w = img.shape[:2]; _, _, nx, ny = _grid(h, w)
    blur = cv2.GaussianBlur(f, (0, 0), max(1, w * .014)); far = cv2.GaussianBlur(f, (0, 0), max(1, w * .03))
    m = np.clip((np.abs(ny + .08) - .3) / .6, 0, 1)[..., None]; m = m * m * (3 - 2 * m)
    g = f * (1 - np.minimum(1, m * 2)) + blur * np.minimum(1, m * 2); g = g * (1 - np.clip(m * 2 - 1, 0, 1)) + far * np.clip(m * 2 - 1, 0, 1)
    return _mix(f, g, a)

def pastel_wash(img, p, a, frame, seed):
    """A soft colour wash laid over the picture: sage from the top melting into blush at the bottom."""
    f = _f(img); h, w = img.shape[:2]; _, _, nx, ny = _grid(h, w)
    t = np.clip(ny * .5 + .5 + nx * .12, 0, 1)[..., None]; t = t * t * (3 - 2 * t)
    tint = SAGE * (1 - t) + BLUSH * t
    soft = np.where(tint < .5, 2 * f * tint + f * f * (1 - 2 * tint), 2 * f * (1 - tint) + np.sqrt(np.clip(f, 0, 1)) * (2 * tint - 1))   # soft light
    g = soft * .6 + _screen(f, tint * .22) * .4
    return _u8(f * (1 - a * .9) + np.clip(g, 0, 1) * a * .9 + _dither(h, w) * a)

def lens_haze(img, p, a, frame, seed):
    """Shooting into the light: a milky warm haze from one top corner that lowers contrast as it swells."""
    f = _f(img); h, w = img.shape[:2]; _, _, nx, ny = _grid(h, w)
    d = np.hypot(nx - .75 + .25 * p, (ny + .95) * .8)
    veil = np.clip(1 - d / 2.1, 0, 1)[..., None] ** 1.6
    g = f * (1 - veil * .28) + veil * .28
    g = _screen(g, veil * np.array([.30, .42, .50], np.float32))
    return _u8(f * (1 - a) + np.clip(g, 0, 1) * a + _dither(h, w) * a)

def cream_flash(img, p, a, frame, seed):
    """A soft dip to cream for cuts: the picture washes out to paper-white rather than flashing hard."""
    f = _f(img); w = img.shape[1]
    soft = f + (cv2.GaussianBlur(f, (0, 0), max(1, w * .01)) - f) * a
    return _u8(soft + (CREAM - soft) * a * .88)

EFFECTS = {fn.__name__: fn for fn in (soft_film, golden_hour, mint_fade, dream_bloom, sun_leak, soft_grain, paper_glow, paper_mat, slow_push, tilt_blur, pastel_wash, lens_haze, cream_flash)}
