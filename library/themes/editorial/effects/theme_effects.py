"""Editorial theme effects. Loaded by library/_shared/effects_engine.load_theme().

    EFFECTS = {name: fn(img, progress, amount, frame, seed, props=None) -> img}     BGR uint8 in and out

The style: a clean magazine film. Everything here is smooth: slow pushes, glides that ease out, focus pulls,
one band of warm light, a grade measured on the footage the theme was built for (a bright cool-white house, a
wine-red plaid jacket, warm skin: paper #EDF0EB, ink #26101A, wine #7A2137, crimson #A70A3E, blush #DFA78C).
Nothing strobes, flashes to white, splits channels or shakes; no effect ever shows a black edge (pictures that
move are scaled up a little first) and none clips whites.

Every effect is stateless and deterministic (one frame at a time; randomness only from seed and frame), never
modifies its input and returns the untouched picture as amount goes to 0. Options come through `props` (the
storyboard effect entry's "props"; the pipeline adds `seconds` and `fps`).

How they use the storyboard's "where" (which shapes amount over the effect's time):
  looks    editorial_grade, moody_grade, paper_grain, vignette_soft        "all" (moody_grade may wipe itself in)
           moody_cover (eases itself in, and out with fade_out)              "all"
  moves    soft_push (times itself over the seconds)                         "all"
           glide_blur, focus_pull                                            "in" after a cut, "out" before one
           speed_ramp                                                        "pulse"
  light    light_sweep, siren_glow, siren_beams (time and fade themselves)   "all"
"""
import math
from functools import lru_cache
import cv2
import numpy as np


def _bgr(hex_color): return np.array([int(hex_color[i:i + 2], 16) / 255 for i in (5, 3, 1)], np.float32)
PAPER, STONE, INK, WINE, CRIMSON, BLUSH = (_bgr(c) for c in ('#EDF0EB', '#D5DBD5', '#26101A', '#7A2137', '#A70A3E', '#DFA78C'))
NIGHT = _bgr('#1F3FA8')                                   # the siren's blue: the only blue in the theme
WHITE_POINT = .962                                        # where pure white lands after the grades: never 255


def _f(img): return img.astype(np.float32) * (1 / 255)
def _u8(a): return np.clip(np.rint(a * 255), 0, 255).astype(np.uint8)
def _c(x, lo=0., hi=1.): return min(max(float(x), lo), hi)
def _ease(x): x = _c(x); return x * x * (3 - 2 * x)                       # in-out
def _glide(x): return 1 - (1 - _c(x)) ** 4                                # quart-out: the theme's arrival
def _lum(f): return cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)[..., None]
def _p(props, key, default):
    value = (props or {}).get(key, default)
    return default if value is None else value
def _mix(f, g, a): return _u8(f + (np.clip(g, 0, 1) - f) * a)
def _rng(seed, frame): return np.random.default_rng(np.random.SeedSequence([int(seed), int(frame)]))

@lru_cache(maxsize=8)
def _grid(h, w):
    """x, y in -1..1 across the frame."""
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    return (x / max(1, w - 1) - .5) * 2, (y / max(1, h - 1) - .5) * 2

@lru_cache(maxsize=8)
def _dither(h, w):
    """Half a level of ordered noise, so wide soft gradients of light do not band."""
    bayer = np.float32([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16 - .47
    return np.tile(bayer, (h // 4 + 1, w // 4 + 1))[:h, :w, None] / 255

@lru_cache(maxsize=8)
def _corners(h, w, start=.3, reach=1.3):
    """0 in the middle of the frame rising smoothly to 1 at the corners."""
    nx, ny = _grid(h, w)
    d = np.clip((nx * nx * .9 + ny * ny * .8 - start) / reach, 0, 1)
    return (d * d * (3 - 2 * d))[..., None]

def _grain(h, w, seed, frame, fine=True):
    """Unit-variance film grain for this frame: fine (per pixel, slightly softened) or coarse (half size)."""
    if fine: return cv2.GaussianBlur(_rng(seed, frame).standard_normal((h, w), np.float32), (0, 0), .6)[..., None] * 1.9
    return cv2.resize(_rng(seed, frame).standard_normal((h // 2 + 1, w // 2 + 1), np.float32), (w, h), interpolation=cv2.INTER_LINEAR)[..., None]

def _blur(f, sigma):
    """Gaussian blur; wide ones are done at reduced size (sigma in px of the full picture)."""
    if sigma < .3: return f
    if sigma <= 5: return cv2.GaussianBlur(f, (0, 0), sigma, borderType=cv2.BORDER_REFLECT_101)
    h, w = f.shape[:2]; k = 2 if sigma <= 12 else 4
    small = cv2.resize(f, (max(2, w // k), max(2, h // k)), interpolation=cv2.INTER_AREA)
    small = cv2.GaussianBlur(small, (0, 0), math.sqrt(max(.25, (sigma / k) ** 2 - .35)), borderType=cv2.BORDER_REFLECT_101)
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC)

def _zoom(img, s, cx=.5, cy=.5, dx=0., dy=0., flags=cv2.INTER_LINEAR):
    """Scale by s (>= 1) about (cx, cy) (shares of the frame), then shift by dx, dy px. Edges repeat: never black."""
    h, w = img.shape[:2]
    m = np.float32([[s, 0, cx * (w - 1) * (1 - s) + dx], [0, s, cy * (h - 1) * (1 - s) + dy]])
    return cv2.warpAffine(img, m, (w, h), flags=flags, borderMode=cv2.BORDER_REPLICATE)

def _face(props): u, v = _p(props, 'face', (.5, .42)); return float(u), float(v)


# ---------------------------------------------------------------- looks
def _shoulder(x, knee=.80, top=WHITE_POINT):
    """Leaves everything under the knee alone and rolls the rest off so 1.0 lands on `top`."""
    span, room = 1 - knee, top - knee
    over = np.clip(x, knee, 1) - knee                                                 # a parabola: slope 1 at the knee, still rising at the top
    return np.minimum(x, knee) + over - over * over * ((span - room) / (span * span))

def editorial_grade(img, p, a, frame, seed, props=None):
    """The theme look for bright daylight footage (footage.look, about 0.7): a gentle S-curve, whites rolled off
    just under clipping and left cool like the measured paper, shadows nudged toward aubergine, reds and skin
    kept rich, fine grain, a very light vignette. Options: contrast (1), grain (1), vignette (1)."""
    f = _f(img); h, w = img.shape[:2]
    k = .16 * float(_p(props, 'contrast', 1))
    g = f + (2 * k) * f * (1 - f) * (2 * f - 1)                                       # S-curve: ends stay put, the middle steepens
    lum = _lum(g)
    warm = np.clip((g[..., 2:3] - np.maximum(g[..., 0:1], g[..., 1:2])) * 3.5, 0, 1)    # reds and skin
    g = lum + (g - lum) * (1.03 + .09 * warm)
    dark = 1 - lum; shade = dark * dark * dark; l2 = lum * lum
    g = g + shade * np.float32([.004, -.014, .012])                                   # shadows toward aubergine (B, G, R)
    g = g + l2 * l2 * np.float32([.004, .002, -.006])                                # highlights stay cool, never cream
    g = _shoulder(g)
    g = g * (1 - .07 * float(_p(props, 'vignette', 1)) * _corners(h, w))
    g = g + _grain(h, w, seed, frame) * (.011 * float(_p(props, 'grain', 1))) * (1 - .55 * lum)
    return _mix(f, g, a)

def _moody(f, h, w, frame, seed):
    lum = _lum(f)
    warm = np.clip((f[..., 2:3] - np.maximum(f[..., 0:1], f[..., 1:2])) * 3.5, 0, 1)
    g = lum + (f - lum) * (.72 + .2 * warm)                                           # the room loses colour, the jacket and skin less so
    g = np.clip(g, 0, 1) * (np.clip(lum, 1e-4, 1) ** .42 * .86)                       # lower key (by luminance: no added saturation)
    g = g + .26 * g * (1 - g) * (2 * g - 1)
    l2 = _lum(g)
    g = g + (1 - l2) ** 2 * np.float32([.016, -.02, .026])                            # deep aubergine shadows
    mids = np.sin(math.pi * np.clip(l2, 0, 1)) ** 2
    g = g * (1 - mids * .2 * (1 - (WINE / WINE.max()) ** .5))                         # wine in the mid-tones
    glow = _blur(np.clip((lum - .72) / .28, 0, 1) ** 2, w * .03)
    if glow.ndim == 2: glow = glow[..., None]
    g = 1 - (1 - np.clip(g, 0, 1)) * (1 - glow * np.float32([.05, .07, .13]))         # halation: a warm red breath off the highlights
    g = g * (1 - .5 * _corners(h, w, .16, 1.25))
    g = _shoulder(g, .78, .93)
    return g + _grain(h, w, seed, frame) * .011 * (1 - .5 * l2)

def moody_grade(img, p, a, frame, seed, props=None):
    """A clearly darker, low-key look: deeper aubergine shadows, wine-tinted mid-tones, lower exposure, heavier
    soft corners, a little halation off the highlights. Options: wipe (false). With wipe true the grade is drawn
    on by a soft-edged vertical line sweeping left to right over the first `wipe_in` (.35) of the effect and
    taken off the same way over the last `wipe_out` (.2), a paper hairline on the edge: use "where": "all"."""
    f = _f(img); h, w = img.shape[:2]
    g = np.clip(_moody(f, h, w, frame, seed), 0, 1)
    if not _p(props, 'wipe', False): return _mix(f, g, a)
    t_in, t_out = float(_p(props, 'wipe_in', .35)), float(_p(props, 'wipe_out', .2))
    x = (np.arange(w, dtype=np.float32) + .5) / w
    soft, line = .035, max(.8, w / 540 * 1.1) / w
    if p <= 1 - t_out or t_out <= 0:
        e = _ease(p / max(1e-6, t_in)); edge = -soft * 1.2 + (1 + soft * 2.4) * e      # the grade lies left of the edge
        mask = 1 - np.clip((x - edge) / soft + .5, 0, 1)
    else:
        e = _ease((p - (1 - t_out)) / t_out); edge = -soft * 1.2 + (1 + soft * 2.4) * e   # the clean picture returns from the left
        mask = np.clip((x - edge) / soft + .5, 0, 1)
    mask = (mask * mask * (3 - 2 * mask))[None, :, None]
    out = f + (g - f) * mask * a
    rule = np.exp(-.5 * ((x - edge) / line) ** 2)[None, :, None] * math.sin(math.pi * e) ** .5 * .85 * a
    return _u8(out + (PAPER - out) * rule)

def paper_grain(img, p, a, frame, seed, props=None):
    """Fine monochrome grain, stronger in the mid-tones, with a faint still paper tooth under it. Hold it: "where": "all"."""
    f = _f(img); h, w = img.shape[:2]; lum = _lum(f)
    tooth = _grain(h, w, seed, 0, fine=False)
    g = f + (_grain(h, w, seed, frame) * .019 + tooth * .006) * (.35 + .65 * np.sin(math.pi * np.clip(lum, 0, 1)))
    return _mix(f, g, a)

def vignette_soft(img, p, a, frame, seed, props=None):
    """Corners fall off gently toward aubergine: no hard ring, no blur. Hold it: "where": "all"."""
    f = _f(img); h, w = img.shape[:2]; d = _corners(h, w, .2, 1.3) * .42
    g = f * (1 - d) + INK * d * .22
    return _u8(f + (g - f) * a + _dither(h, w) * a)


# ---------------------------------------------------------------- moves
def soft_push(img, p, a, frame, seed, props=None):
    """The slow push: the picture scales up to about 1 + 0.06 x amount over the effect's time, eased at both
    ends, toward the face; no blur. "where": "all". Options: face ([.5, .42]), reverse (false: true pulls out)."""
    e = _ease(p) if not _p(props, 'reverse', False) else 1 - _ease(p)
    s = 1 + .06 * a * e
    if s - 1 < 1e-5: return img.copy()
    cx, cy = _face(props)
    return _zoom(img, s, cx, cy, flags=cv2.INTER_CUBIC)

def _smear(f, length, vertical):
    """A smooth directional blur about `length` px long (two box passes: a triangle, no stepping)."""
    k = int(round(length / 2)) | 1
    if k < 3: return f
    size = (1, k) if vertical else (k, 1)
    return cv2.blur(cv2.blur(f, size, borderType=cv2.BORDER_REPLICATE), size, borderType=cv2.BORDER_REPLICATE)

def glide_blur(img, p, a, frame, seed, props=None):
    """Lands a cut smoothly: the picture arrives still travelling, with a directional motion blur that is
    strongest on the first frame and eases out to nothing. "where": "in" (or "out" to leave the same way).
    Options: dir (left|right|up|down, the way the picture travels; left), travel (1)."""
    k = _c(a) ** 1.6
    if k < .004: return img.copy()
    h, w = img.shape[:2]; d = str(_p(props, 'dir', 'left')); vertical = d in ('up', 'down'); sign = -1 if d in ('left', 'up') else 1
    size = h if vertical else w
    shift = .028 * size * k * float(_p(props, 'travel', 1))                            # it has this far still to go
    s = 1 + 2.2 * abs(shift) / size + .004 * k                                         # enough extra picture to cover the shift
    moved = _zoom(img, s, .5, .5, dx=0 if vertical else -sign * shift, dy=-sign * shift if vertical else 0)
    return _u8(_smear(_f(moved), .085 * size * k, vertical))

def focus_pull(img, p, a, frame, seed, props=None):
    """A focus pull: the blur follows amount, so "where": "in" starts soft and comes sharp, "out" goes soft;
    the picture breathes very slightly as a lens does. Options: strength (1)."""
    k = _c(a)
    if k < .004: return img.copy()
    w = img.shape[1]
    f = _f(_zoom(img, 1 + .018 * k, *_face(props)))
    return _u8(_blur(f, w * .024 * k ** 1.3 * float(_p(props, 'strength', 1))))

def speed_ramp(img, p, a, frame, seed, props=None):
    """The feel of a speed ramp: a brief radial zoom-blur that swells and settles with a small push, toward
    the face; no bounce. "where": "pulse" (or "in" to land a cut). Options: face ([.5, .42])."""
    k = _c(a)
    if k < .004: return img.copy()
    cx, cy = _face(props); z = .075 * k ** 1.3
    f = _f(_zoom(img, 1 + .03 * k, cx, cy))
    for span in (z, z / 4, z / 16):                                                    # 4 x 4 x 4 samples: a streak without steps
        f = (f + sum(_zoom(f, 1 + span * i / 4, cx, cy) for i in (1, 2, 3))) * .25
    return _u8(f)


# ---------------------------------------------------------------- light
def light_sweep(img, p, a, frame, seed, props=None):
    """One soft diagonal band of warm light crosses the picture over the effect's time (it starts and ends
    off-frame); lifted like light on paper, never to white. "where": "all". Options: angle (degrees, 20), width (1)."""
    f = _f(img); h, w = img.shape[:2]; nx, ny = _grid(h, w)
    ang = math.radians(float(_p(props, 'angle', 20))); width = .34 * float(_p(props, 'width', 1))
    d = nx * math.cos(ang) + ny * math.sin(ang) * (h / w) * .5
    reach = 1 + abs(math.sin(ang)) * (h / w) * .5 + width * 2.4
    c = -reach + 2 * reach * (.15 * p + .85 * _ease(p))
    band = (np.exp(-((d - c) / width) ** 2) + .45 * np.exp(-((d - c) / (width * 2.6)) ** 2))[..., None]
    room = math.sin(math.pi * p) ** 2                                                  # the room dims a touch while the light passes,
    g = f * (1 - .1 * room * (1 - np.minimum(band, 1)))                                # so the band reads on white walls too
    g = g * (1 - np.minimum(band, 1) * np.float32([.12, .045, 0.]))                    # warm light: white turns to cream inside the band
    light = band * np.float32([.12, .19, .26]) * 1.2
    g = 1 - (1 - g) * (1 - light)                                                      # screen: whites cannot clip
    g = g + band * .07 * f * (1 - f) * 4 * np.float32([.6, .85, 1.])                    # and a little lift in the mid-tones
    return _u8(f + (np.minimum(g, np.maximum(f, WHITE_POINT + .02)) - f) * a + _dither(h, w) * a)

def siren_glow(img, p, a, frame, seed, props=None):
    """Sirens outside the window, the quiet way: soft crimson light from the top-left corner and deep blue from
    the top-right swell in turn, sinusoidally, about two cycles a second; it fades itself in and out. No strobe.
    "where": "all". Options: rate (cycles per second, 2), reach (1)."""
    f = _f(img); h, w = img.shape[:2]; nx, ny = _grid(h, w)
    secs, fps = float(_p(props, 'seconds', 2.)), float(_p(props, 'fps', 30))
    t = p * max(0., secs - 1 / fps); rate = float(_p(props, 'rate', 2))
    fade = _ease(t / .3) * _ease((secs - t) / .3)
    s = math.sin(2 * math.pi * rate * t)
    red, blue = .5 + .5 * s, .5 - .5 * s
    reach = 1.15 * float(_p(props, 'reach', 1)); asp = h / w
    fall = lambda side: np.exp(-(((nx - side) ** 2 + ((ny + 1) * asp * .62) ** 2) / reach ** 2))[..., None]
    lr, lb = fall(-1) * (.25 + .75 * red), fall(1) * (.25 + .75 * blue)
    tint_r, tint_b = CRIMSON / CRIMSON.max(), NIGHT / NIGHT.max()
    k = fade * a
    g = f * (1 - .66 * lr * (1 - tint_r)) * (1 - .6 * lb * (1 - tint_b))                # coloured light on a white wall: a tint
    g = 1 - (1 - g) * (1 - (lr * CRIMSON * .34 + lb * NIGHT * .42))                    # plus a little added light (screen)
    g = g * (1 - .06 * (1 - np.maximum(lr, lb)))
    return _u8(f + (np.clip(g, 0, 1) - f) * k + _dither(h, w) * k)


SIREN_RED, SIREN_BLUE = _bgr('#E8142C'), _bgr('#1436E6')  # the crimson pushed to an emergency red, and a deep beacon blue

@lru_cache(maxsize=8)
def _beacon_grid(h, w, k=4):
    """Quarter-size polar coordinates about the two beacons, which sit just above the top corners: for each,
    the angle from 'along the top edge toward the middle' (0) round to 'straight down' (pi / 2), and the
    distance in frame widths. Light is smooth, so it is worked out small and scaled up."""
    hs, ws = max(2, h // k), max(2, w // k)
    v, u = np.mgrid[0:hs, 0:ws].astype(np.float32)
    u = (u + .5) / ws; v = (v + .5) / ws                                              # both in frame widths
    dy = v + .09
    left, right = u + .07, 1.07 - u                                                   # distance in from each beacon
    return (np.arctan2(dy, left), np.hypot(left, dy)), (np.arctan2(dy, right), np.hypot(right, dy))

def siren_beams(img, p, a, frame, seed, props=None):
    """Emergency lights sweeping the room: two rotating beacons just above the top corners, emergency red on the
    left and deep blue on the right, each throwing a soft-edged beam that turns like a lighthouse (about two
    turns a second), the two in counter-phase so red and blue cross the picture in turn. The beams are coloured
    light (a tint on white walls plus a screen: nothing clips), each beacon has a soft bloom, and the room dims a
    little so the beams read on white. Motion-blurred over each frame and faded in and out over 15% of the time:
    smooth, no strobe. "where": "all". Options: rate (turns per second, 2), dim (.15), spread (beam width, 1),
    phase (turns, 0: shifts which colour comes first)."""
    f = _f(img); h, w = img.shape[:2]
    secs, fps = float(_p(props, 'seconds', 1.)), float(_p(props, 'fps', 30))
    rate, dim = float(_p(props, 'rate', 2)), _c(_p(props, 'dim', .15), 0, .5)
    sigma = .46 * max(.2, float(_p(props, 'spread', 1)))
    t = p * max(0., secs - 1 / fps)
    k = a * _ease(p / .15) * _ease((1 - p) / .15)
    if k < .002: return img.copy()
    lights = []
    for i, (theta, r) in enumerate(_beacon_grid(h, w)):
        beam = 0.; facing = 0.
        for sub in (-.3, 0., .3):                                                     # the shutter stays open: three moments of this frame
            turn = rate * (t + sub * .6 / fps) - .3 + float(_p(props, 'phase', 0)) + .5 * i
            d = np.remainder(theta - (math.pi / 4 + 2 * math.pi * turn) + math.pi, 2 * math.pi) - math.pi
            beam = beam + (np.exp(-(d / sigma) ** 2) + .26 * np.exp(-(d / (sigma * 2.2)) ** 2)) / 3
            facing += (.5 + .5 * math.cos(2 * math.pi * turn)) / 3
        reach = np.exp(-(r / 2.6) ** 2) * np.clip(r / .16, 0, 1)                       # fades with distance; no hot point at the lamp
        bloom = np.exp(-(r / .46) ** 2) * (.45 + .55 * facing)
        light = np.clip(beam * reach * .95 + bloom * .8, 0, 1)
        lights.append(cv2.resize(light, (w, h), interpolation=cv2.INTER_CUBIC)[..., None])
    lr, lb = lights
    tint_r, tint_b = SIREN_RED / SIREN_RED.max(), SIREN_BLUE / SIREN_BLUE.max()
    g = f * (1 - dim * (1 - .5 * np.minimum(lr + lb, 1)))                             # the room, a little darker
    g = g * (1 - .72 * lr * (1 - tint_r)) * (1 - .72 * lb * (1 - tint_b))             # coloured light: white takes the colour
    g = 1 - (1 - g) * (1 - np.clip(lr * SIREN_RED * .40 + lb * SIREN_BLUE * .50, 0, 1))  # and some light is added (screen: no clipping)
    return _u8(f + (np.clip(g, 0, 1) - f) * k + _dither(h, w) * k)


def _hue_band(hue, lo, hi, soft):
    """1 for hues inside lo..hi degrees (may wrap through 0), falling to 0 over `soft` degrees outside."""
    mid, half = (lo + ((hi - lo) % 360) / 2) % 360, ((hi - lo) % 360) / 2
    d = np.abs(np.remainder(hue - mid + 180, 360) - 180)
    m = np.clip((half + soft - d) / soft, 0, 1)
    return m * m * (3 - 2 * m)

_COVER_TONES = {                                                                      # (shadow tint, tint of the dimmed room), B G R
    'cool': (np.float32([.034, .002, .013]), np.float32([1.045, 1.0, .95])),          # aubergine / blue-black
    'warm': (np.float32([-.006, .010, .030]), np.float32([.90, .985, 1.04])),         # brown umber
    'neutral': (np.float32([0., 0., 0.]), np.float32([1., 1., 1.])),
}

def moody_cover(img, p, a, frame, seed, props=None):
    """A clean low-key magazine-cover grade. The surroundings drop (white walls to a soft mid grey, darker toward
    the edges: a large soft vignette centred on the face) and lose most of their colour; skin (hue 5-35) keeps
    its hue, saturation and most of its light; the jacket's reds (hue 330-10) stay red and get a little richer;
    blacks are deep but keep their detail (a filmic toe over a slightly lifted black point); the shadows carry a
    faint tint; fine grain, a breath of halation. It eases itself in. "where": "all". Options: tone ('cool'
    aubergine/blue-black shadows | 'warm' brown-umber | 'neutral'; cool), face ([.5, .42]), fade (.3: share of
    the time it takes to arrive), fade_out (0), depth (1: how far the room drops), grain (1)."""
    f = _f(img); h, w = img.shape[:2]
    fade_in, fade_out = float(_p(props, 'fade', .3)), float(_p(props, 'fade_out', 0))
    k = a * (_ease(p / fade_in) if fade_in > 0 else 1.) * (1 - _ease((p - (1 - fade_out)) / fade_out) if fade_out > 0 else 1.)
    if k < .002: return img.copy()
    shadow_tint, room_tint = _COVER_TONES.get(str(_p(props, 'tone', 'cool')), _COVER_TONES['cool'])
    depth = float(_p(props, 'depth', 1))
    half = cv2.resize(f, (max(2, w // 2), max(2, h // 2)), interpolation=cv2.INTER_AREA)   # the colour masks are soft: half size will do
    hsv = cv2.cvtColor(half, cv2.COLOR_BGR2HSV); hue, sat = hsv[..., 0], hsv[..., 1]
    chroma = np.clip((sat - .10) / .16, 0, 1) * np.clip(hsv[..., 2] / .08, 0, 1)
    masks = np.dstack([chroma * _hue_band(hue, 330, 10, 10), chroma * _hue_band(hue, 5, 35, 7)])
    masks = cv2.resize(cv2.GaussianBlur(masks, (0, 0), max(.6, w * .002)), (w, h), interpolation=cv2.INTER_LINEAR)
    red, skin = masks[..., 0:1], masks[..., 1:2]
    skin = skin * (1 - red * .5); keep = np.clip(red + skin, 0, 1)
    nx, ny = _grid(h, w); fx, fy = _face(props)
    d = np.sqrt((nx * .5 + .5 - fx) ** 2 + ((ny * .5 + .5 - fy) * (h / w) * .78) ** 2)   # in frame widths, a tall oval
    fall = np.clip((d - .16) / .78, 0, 1); fall = (fall * fall * (3 - 2 * fall))[..., None]
    lum = _lum(f)
    room = 1 - depth * (.40 + .30 * fall)                                             # the walls: down a stop or so, more at the edges
    subject = 1 - depth * (.13 + .20 * fall)                                          # skin and jacket: most of their light
    gain = room + (subject - room) * keep
    bright = np.clip((lum - .05) / .40, 0, 1); bright = bright * bright * (3 - 2 * bright)
    g = f * (1 - (1 - gain) * (.25 + .75 * bright))                                   # the light comes off the bright end: darks keep their detail
    l1 = _lum(g)
    g = l1 + (g - l1) * (.5 + keep * (.42 + .24 * red))                                # the room loses colour; skin as it was; reds richer
    g = g * (room_tint + (1 - room_tint) * keep)
    g = np.clip(g, 0, 1)
    inv = 1 - g; g = g + red * .25 * g * (inv * inv * inv)                                            # the jacket's dark squares open up: still red, not black
    g = g * g / (g + .022) * 1.022                                                    # a filmic toe: deep, but never a flat black
    g = g + .22 * g * (1 - g) * (2 * g - 1)                                           # a gentle S for clean mid-tone contrast
    g = .016 + g * (1 - .016)                                                         # black point lifted a hair
    l2 = _lum(g)
    dark = 1 - l2; g = g + (dark * dark * dark * (1 - .85 * skin)) * shadow_tint                            # the tint lives in the shadows, off the skin
    glow = _blur(np.clip((lum[..., 0] - .8) / .2, 0, 1) ** 2, w * .022)[..., None]
    g = 1 - (1 - np.clip(g, 0, 1)) * (1 - glow * np.float32([.016, .028, .06]))        # halation: a faint warm breath off the highlights
    g = g + _grain(h, w, seed, frame) * (.009 * float(_p(props, 'grain', 1))) * (1 - .5 * l2)
    return _u8(f + (np.clip(g, 0, 1) - f) * k)


EFFECTS = {fn.__name__: fn for fn in (editorial_grade, moody_grade, paper_grain, vignette_soft, soft_push, glide_blur, focus_pull, speed_ramp, light_sweep, siren_glow, siren_beams, moody_cover)}
for _fn in EFFECTS.values(): _fn.takes_props = True
