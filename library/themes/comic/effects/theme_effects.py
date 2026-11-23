"""Comic Book theme effects: footage treated as printed comic art, and impact accents for cuts.
Loaded by library/_shared/effects_engine.py (load_theme) as
    EFFECTS = {name: fn(img, progress, amount, frame, seed) -> img}      BGR uint8, amount 0..1
Every effect is a pure function of its arguments: any noise is seeded from (seed, frame), and
anything "drawn" (zoom lines, shake) is redrawn every second frame, the way animation is shot on twos.
All original code. Colours are the theme's (library/themes/comic/theme.json).
"""
import math
from functools import lru_cache
import cv2
import numpy as np


def _bgr(hex_color):
    n = int(hex_color[1:], 16)
    return np.array([n & 255, n >> 8 & 255, n >> 16 & 255], np.float32) / 255

INK, PAPER, WHITE = _bgr('#16121c'), _bgr('#f7edd0'), _bgr('#fffbf0')
RED, YELLOW, BLUE, SKY, GREEN, ORANGE = _bgr('#e2242c'), _bgr('#ffd61e'), _bgr('#2767d9'), _bgr('#49b8ea'), _bgr('#33a35b'), _bgr('#f5811f')


def _u8(a): return np.clip(np.rint(a * 255), 0, 255).astype(np.uint8)
def _mix(img, out, a): return _u8(img.astype(np.float32) / 255 * (1 - a) + out * a) if a < 1 else _u8(out)
def _hash(n, seed=0):
    x = math.sin(n * 127.1 + seed * 311.7 + 74.7) * 43758.5453
    return x - math.floor(x)

@lru_cache(maxsize=4)
def _grid(h, w):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    nx, ny = (x - w / 2) / (w / 2), (y - h / 2) / (h / 2)
    return x, y, nx, ny, np.hypot(nx, ny) / math.sqrt(2), np.arctan2(y - h / 2, x - w / 2)

@lru_cache(maxsize=16)
def _screen(h, w, cell, degrees):
    """Distance (in cells, 0 at a dot centre .. .707 between dots) on a dot screen turned by `degrees`."""
    x, y = _grid(h, w)[:2]
    a = math.radians(degrees); u = (x * math.cos(a) + y * math.sin(a)) / cell; v = (-x * math.sin(a) + y * math.cos(a)) / cell
    return np.hypot(u - np.floor(u) - .5, v - np.floor(v) - .5)

def _dots(h, w, cell, degrees, coverage):
    """0..1 mask of printed dots whose area follows `coverage` (0 = none, 1 = solid)."""
    radius = np.sqrt(np.clip(coverage, 0, 1)) * .78
    return np.clip((radius - _screen(h, w, cell, degrees)) * cell * .6 + .5, 0, 1)

def _flatten(img, passes=2):
    """Edge-keeping smoothing at reduced size, so flat areas of colour form and cost is the same on any frame."""
    h, w = img.shape[:2]; k = max(1., w / 400.)
    small = cv2.resize(img, (max(2, int(w / k)), max(2, int(h / k))), interpolation=cv2.INTER_AREA)
    for _ in range(passes): small = cv2.bilateralFilter(small, 7, 46, 5)
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_LINEAR).astype(np.float32) / 255

def _lines(f, weight=1., detail=.6):
    """0..1 mask of drawn ink outlines: where the picture is locally darker than its surroundings."""
    w = f.shape[1]; grey = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
    s = max(.8, w * .0024 * weight); fine = cv2.GaussianBlur(grey, (0, 0), s); wide = cv2.GaussianBlur(grey, (0, 0), s * 2.6)
    return np.clip((wide - fine - .011 / detail) * (46 * detail), 0, 1)

def _bands(v, levels, soft=.12):
    q = v * levels; base = np.floor(q); fr = q - base
    return (base + np.clip((fr - .5) / soft + .5, 0, 1)) / levels

def _poster(f, levels=4, sat=1.35):
    """Flat steps of brightness with the hue kept and the colour pushed, like flat inks."""
    lum = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)[..., None]
    stepped = _bands(np.clip(lum * 1.08, 0, 1), levels)
    colour = lum + (f - lum) * sat
    return np.clip(colour * (stepped + .02) / (lum + .02), 0, 1), lum[..., 0]

def _cell(w, share=.0115): return max(4., w * share)


def inked_print(img, progress, amount, frame, seed):
    """The theme's base look: flat inks in a few steps, black outlines, dot shading in the shadows, on cream paper."""
    h, w = img.shape[:2]; f = _flatten(img); flat, lum = _poster(f, 5, 1.55)
    shade = _dots(h, w, _cell(w), 45, np.clip((.5 - lum) * 1.5, 0, .55))[..., None]            # Ben-Day dots where it gets dark
    out = flat * (1 - shade * .32) * (PAPER * .2 + .82)
    ink = np.maximum(_lines(f, 1.2, .75), np.clip((.13 - lum) * 9, 0, 1))[..., None]           # outlines, and the darkest areas filled solid
    return _mix(img, out * (1 - ink) + INK * ink, amount)


def benday_dots(img, progress, amount, frame, seed):
    """Colour printed the cheap way: cyan, magenta and yellow dot screens at different angles on paper, with an ink key line."""
    h, w = img.shape[:2]; f = _flatten(img, 1); flat, lum = _poster(f, 5, 1.5); cell = _cell(w, .013)
    cover = np.clip((1 - np.clip(flat * 1.12 + .04, 0, 1)) * .9 - .05, 0, 1)                                             # how much of each ink (BGR picture -> Y, M, C plates)
    plates = np.stack([_dots(h, w, cell, 0, cover[..., 0]), _dots(h, w, cell, 75, cover[..., 1]), _dots(h, w, cell, 15, cover[..., 2])], 2)
    out = PAPER * (1 - plates * np.array([.88, .86, .9], np.float32))
    out = out * .72 + np.clip(flat * 1.1, 0, 1) * PAPER * .28                                                         # a little of the flat colour so faces hold together
    ink = np.maximum(_lines(f, 1.1), np.clip((.12 - lum) * 9, 0, 1))[..., None]
    return _mix(img, out * (1 - ink) + INK * ink, amount)


_PALETTE = np.stack([PAPER, WHITE * .93, YELLOW, ORANGE, RED, _bgr('#f3b98f'), _bgr('#c9764e'), _bgr('#7a3b2e'), SKY, BLUE, GREEN, _bgr('#cdc6b6'), _bgr('#8d8794'), _bgr('#3a3350'), INK])
_PALETTE_LAB = cv2.cvtColor(_u8(_PALETTE)[None], cv2.COLOR_BGR2LAB)[0].astype(np.float32)

def fourcolor_print(img, progress, amount, frame, seed):
    """A limited set of flat inks with the colour plates printed slightly out of register, and a black key line."""
    h, w = img.shape[:2]; f = _flatten(img, 3); k = max(1., w / 360.)
    small = cv2.resize(_u8(np.clip(f * 1.06, 0, 1)), (int(w / k), int(h / k)), interpolation=cv2.INTER_AREA)
    lab = cv2.cvtColor(small, cv2.COLOR_BGR2LAB).astype(np.float32)
    d = ((lab[:, :, None, :] - _PALETTE_LAB[None, None]) ** 2 * np.array([.7, 1.3, 1.3], np.float32)).sum(3)
    flat = cv2.resize(_PALETTE[d.argmin(2)], (w, h), interpolation=cv2.INTER_LINEAR)
    s = max(1, round(w * .004))                                                                 # misregistration: red plate one way, blue the other
    shift = lambda plate, dx, dy: cv2.warpAffine(plate, np.float32([[1, 0, dx], [0, 1, dy]]), (w, h), borderMode=cv2.BORDER_REPLICATE)
    out = np.stack([shift(flat[..., 0], -s, s), flat[..., 1], shift(flat[..., 2], s, -s)], 2)
    lum = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
    out = out * (1 - _dots(h, w, _cell(w), 45, np.clip((.55 - lum) * 1.2, 0, .5))[..., None] * .25)
    ink = np.maximum(_lines(f, 1.2), np.clip((.12 - lum) * 9, 0, 1))[..., None]
    return _mix(img, out * (1 - ink) + INK * ink, amount)


@lru_cache(maxsize=4)
def _paper(h, w, seed):
    """Aged paper for a frame size: blotchy tone, fibres, specks. Returns (multiply BGR, specks)."""
    rng = np.random.default_rng(seed)
    blot = cv2.resize(rng.random((max(2, h // 90), max(2, w // 90)), np.float32), (w, h), interpolation=cv2.INTER_CUBIC)
    fibre = cv2.GaussianBlur(rng.random((h, w), np.float32), (0, 0), max(.6, w * .0012)) - .5
    specks = (cv2.GaussianBlur((rng.random((h, w), np.float32) > .99975).astype(np.float32), (0, 0), max(.7, w * .0016)) * 14).clip(0, 1)
    r = _grid(h, w)[4]
    tone = (1 - .1 * blot + fibre * .16 - .34 * np.clip(r - .45, 0, 1) ** 1.6)[..., None] * (PAPER * np.array([.9, .97, 1.], np.float32))
    return tone.astype(np.float32), specks[..., None]

def newsprint(img, progress, amount, frame, seed):
    """Old newsprint: faded colour on yellowed, blotchy paper with specks, soft blacks and browned edges."""
    h, w = img.shape[:2]; f = img.astype(np.float32) / 255; lum = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)[..., None]
    tone, specks = _paper(h, w, int(seed))
    out = (lum + (f - lum) * .72) * .9 + .07                                                    # faded, and ink never prints pure black
    out = out * tone * (1 - specks * .4)
    return _mix(img, out, amount)


def manga_ink(img, progress, amount, frame, seed):
    """Black and white: solid ink shadows, bare paper highlights, a dot screen for the greys between."""
    h, w = img.shape[:2]; f = _flatten(img); lum = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
    lum = np.clip((lum - .08) * 1.25, 0, 1)
    tone = _dots(h, w, _cell(w, .0105), 45, np.clip((.78 - lum) * 1.25, 0, .92))
    ink = np.maximum(np.maximum(tone, _lines(f, 1.25, .7)), np.clip((.22 - lum) * 10, 0, 1))[..., None]
    return _mix(img, PAPER * (1 - ink) + INK * ink, amount)


def pop_duotone(img, progress, amount, frame, seed):
    """Pop-art poster: the picture in two flat primaries (red shadows, yellow lights) joined by dots, with ink lines."""
    h, w = img.shape[:2]; f = _flatten(img); lum = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
    lum = np.clip((lum - .1) * 1.3, 0, 1)
    mid = _dots(h, w, _cell(w, .014), 45, np.clip((.68 - lum) * 2.2, 0, 1))[..., None]          # red dots growing into solid red
    out = YELLOW * (1 - mid) + RED * mid
    hi = np.clip((lum - .8) * 9, 0, 1)[..., None]; out = out * (1 - hi) + WHITE * hi            # bare paper highlights
    lo = _dots(h, w, _cell(w, .014), 45, np.clip((.36 - lum) * 3, 0, 1))[..., None]; out = out * (1 - lo) + BLUE * lo
    ink = np.maximum(_lines(f, 1.25, .7), np.clip((.1 - lum) * 10, 0, 1))[..., None]
    return _mix(img, out * (1 - ink) + INK * ink, amount)


def _wedges(ang, n, key, seed):
    """Per-pixel wedge index round the centre and a 0..1 random value per wedge (re-rolled per `key`)."""
    idx = np.floor((ang + math.pi) / (2 * math.pi) * n).astype(np.int32) % n
    rnd = np.array([_hash(i + key * 57.3, seed) for i in range(n)], np.float32)
    return idx, rnd

def impact_burst(img, progress, amount, frame, seed):
    """A hit: a jagged yellow-and-white burst closes in from the frame edges behind black zoom lines, then the frame flashes."""
    h, w = img.shape[:2]; x, y, nx, ny, r, ang = _grid(h, w); f = img.astype(np.float32) / 255; a = amount; key = int(frame) // 2
    idx, rnd = _wedges(ang, 26, key, seed)
    spike = np.abs((ang + math.pi) / (2 * math.pi) * 26 % 1 - .5) * 2                           # 0 mid-wedge .. 1 at its sides
    edge = (1.0 - a * .62) * (.72 + (.3 + .45 * rnd[idx]) * spike)                             # jagged inner edge: one spike per wedge
    px = 1.6 / w
    ring = np.clip((r - edge) / px, 0, 1)[..., None]
    colour = np.where((np.floor((ang + math.pi) / (2 * math.pi) * 52 + .5).astype(np.int32) % 2)[..., None] > 0, YELLOW, WHITE)
    outline = (np.clip((r - edge) / px + 5, 0, 1) - np.clip((r - edge) / px - 0, 0, 1))[..., None]
    out = f * (1 - ring) + colour * ring
    out = out * (1 - outline * (ring < 1)) + INK * outline * (ring < 1)
    idx2, rnd2 = _wedges(ang + .07, 90, key, seed + 5)                                          # thin ink zoom lines over the lot
    frac = (ang + .07 + math.pi) / (2 * math.pi) * 90 % 1
    thin = (np.abs(frac - .5) < (.05 + .16 * rnd2[idx2]) * np.clip((r - .25) * 1.6, 0, 1)) & (rnd2[idx2] > .45) & (r > (.95 - a * .6) * (.55 + .6 * rnd2[idx2]))
    out = np.where(thin[..., None], INK, out)
    flash = max(0., a - .82) / .18 * .55
    return _u8(out * (1 - flash) + WHITE * flash)


def speed_lines(img, progress, amount, frame, seed):
    """Ink zoom lines converge on the middle of the frame from every edge, redrawn every second frame."""
    h, w = img.shape[:2]; x, y, nx, ny, r, ang = _grid(h, w); f = img.astype(np.float32) / 255; a = amount; key = int(frame) // 2
    out = f
    for n, s, colour, gate in ((70, 0, INK, .3), (54, 9, WHITE, .62)):
        shifted = ang + s * .013 + _hash(key, seed + s) * .09
        idx, rnd = _wedges(shifted, n, key, seed + s)
        frac = (shifted + math.pi) / (2 * math.pi) * n % 1
        tip = (1.05 - a * .72) * (.5 + .75 * rnd[idx])                                          # how far in each line reaches
        width = (.07 + .3 * rnd[idx]) * np.clip((r - tip) / .5, 0, 1)                           # a wedge: thicker toward the edge
        line = (np.abs(frac - .5) < width) & (rnd[idx] > gate) & (r > tip)
        out = np.where(line[..., None], colour, out)
    return _u8(out)


def panel_shake(img, progress, amount, frame, seed):
    """The frame is a panel that takes a hit: it shrinks a touch, jolts and tilts on twos, showing gutter and its ink border."""
    h, w = img.shape[:2]; a = amount; key = int(frame) // 2
    dx = (_hash(key, seed) - .5) * w * .07 * a; dy = (_hash(key, seed + 3) - .5) * h * .045 * a; rot = (_hash(key, seed + 6) - .5) * 5 * a
    m = cv2.getRotationMatrix2D((w / 2, h / 2), rot, 1 - .07 * a); m[:, 2] += [dx, dy]
    paper = tuple(float(c) for c in PAPER * 255)
    out = cv2.warpAffine(img, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=paper)
    inside = cv2.warpAffine(np.full((h, w), 255, np.uint8), m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    t = max(3, int(w * .009)) | 1; k = cv2.getStructuringElement(cv2.MORPH_RECT, (t, t))
    border = ((cv2.dilate(inside, k) > 127) & (cv2.erode(inside, k) < 128))[..., None]          # the panel's ink box
    shadow = ((np.roll(inside, (t * 2, t * 2), (0, 1)) > 127) & (inside < 128))[..., None]      # and its hard drop shadow on the gutter
    out = np.where(border | shadow, _u8(INK), out)
    return out


EFFECTS = {
    'inked_print': inked_print, 'benday_dots': benday_dots, 'fourcolor_print': fourcolor_print, 'newsprint': newsprint,
    'manga_ink': manga_ink, 'pop_duotone': pop_duotone, 'impact_burst': impact_burst, 'speed_lines': speed_lines, 'panel_shake': panel_shake,
}
