"""Psychedelic theme effects: blacklight footage treatments, written for the shared engine.
library/_shared/effects_engine.py load_theme() picks up EFFECTS = {name: fn(img, progress, amount, frame, seed) -> img}.
All are pure functions of their inputs (BGR uint8 in and out); amount fades each one in from nothing.

In this style the footage carries everything, so the frame devices are effects on the picture itself:
  inset_frame   the shot as a clean, sharp card floating over a blurred, enlarged, dimmed copy of itself
  triptych      the shot cut into tall vertical panels of unequal width, the side panels offset
  panel_drop    the same panels sliding in from above and below at a cut and closing up
and the cuts are soft and fast: push_blur (zoom-blur), whip_smear (sideways), white_dip, and one loud
one, chroma_burst (the picture's own colours stretched into saturated radial streaks, channels split).
"""
import math
import cv2
import numpy as np

def _bgr(hex_color): return np.array([int(hex_color[i:i + 2], 16) / 255 for i in (5, 3, 1)], np.float32)
INK, WHITE, POPPY, COBALT, SUN = (_bgr(c) for c in ('#050826', '#FFFFFF', '#FF2BD6', '#19E3FF', '#E6FF3D'))
SPLITS = (.17, .83)            # where the vertical panels are cut, 0..1 across the frame (overlays/panel-lines uses the same)

def _f(img): return img.astype(np.float32) / 255
def _u8(a): return np.clip(np.rint(a * 255), 0, 255).astype(np.uint8)
def _lum(f): return cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)[..., None]
def _mix(f, g, a): return _u8(f * (1 - a) + np.clip(g, 0, 1) * a)
def _ease(x): x = min(1., max(0., x)); return x * x * (3 - 2 * x)
def _glide(x): return 1 - (1 - min(1., max(0., x))) ** 4
def _grid(h, w):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    return x, y, (x / max(1, w - 1) - .5) * 2, (y / max(1, h - 1) - .5) * 2
def _rng(seed, frame): return np.random.default_rng(np.random.SeedSequence([int(seed), int(frame)]))
def _screen(f, light): return 1 - (1 - f) * (1 - np.clip(light, 0, 1))
def _dither(h, w): return ((np.indices((h, w)).sum(0) % 2) - .5)[..., None].astype(np.float32) / 255
def _hash(i, seed=0): x = math.sin(i * 127.1 + seed * 311.7 + 74.7) * 43758.5453; return x - math.floor(x)
def _blur(img, sigma):
    """A wide gaussian blur, done small for speed (sigma in px of the full image)."""
    h, w = img.shape[:2]; k = max(1, int(sigma / 2.5))
    if k == 1: return cv2.GaussianBlur(img, (0, 0), max(.5, sigma))
    small = cv2.resize(img, (max(2, w // k), max(2, h // k)), interpolation=cv2.INTER_AREA)
    return cv2.resize(cv2.GaussianBlur(small, (0, 0), max(.5, sigma / k)), (w, h), interpolation=cv2.INTER_LINEAR)
def _zoom(img, s, cx=.5, cy=.5, border=cv2.BORDER_REFLECT_101):
    h, w = img.shape[:2]
    return cv2.warpAffine(img, np.float32([[s, 0, cx * w * (1 - s)], [0, s, cy * h * (1 - s)]]), (w, h), flags=cv2.INTER_LINEAR, borderMode=border)
def _hold(p, edge=.14):
    """0 -> 1 -> 0 across an effect's time: opens over the first `edge` of it, closes over the last."""
    return _glide(p / edge) * (1 - _ease((p - (1 - edge)) / edge))

# ---------------------------------------------------------------- looks
def film_grade(img, p, a, frame, seed):
    """The theme base look: gentle film. Soft contrast, slightly lifted blacks with a hint of cool, warm highlights, natural colour, fine grain."""
    f = _f(img); h, w = img.shape[:2]; lum = _lum(f)
    g = lum + (f - lum) * .94
    g = (g - .5) * .93 + .5
    g = g * .965 + .028
    g = g + (1 - lum) ** 2 * np.array([.022, .008, -.012], np.float32) + lum ** 2 * np.array([-.03, .004, .022], np.float32)
    grain = cv2.resize(_rng(seed, frame).standard_normal((h // 2, w // 2)).astype(np.float32), (w, h), interpolation=cv2.INTER_LINEAR)[..., None]
    g = g + grain * .022 * (1 - lum * .6)
    return _mix(f, g, a)

def noir(img, p, a, frame, seed):
    """Black and white, the editorial way: soft silver greys, deep but not crushed blacks, darker corners, fine grain."""
    f = _f(img); h, w = img.shape[:2]; _, _, nx, ny = _grid(h, w)
    lum = np.sum(f * np.array([.10, .56, .34], np.float32), axis=2, keepdims=True)
    g = np.clip((lum - .5) * 1.12 + .5, 0, 1) ** 1.08
    g = g * .97 + .018
    g = g * (1 - .34 * np.clip((nx * nx + ny * ny * .8 - .25) / 1.4, 0, 1)[..., None])
    grain = cv2.resize(_rng(seed, frame).standard_normal((h // 2, w // 2)).astype(np.float32), (w, h), interpolation=cv2.INTER_LINEAR)[..., None]
    g = np.repeat(g + grain * .02, 3, axis=2) * np.array([1.0, .995, .985], np.float32)
    return _mix(f, g, a)

def soft_vignette(img, p, a, frame, seed):
    """Darker, slightly softer corners that pull the eye to the middle of the picture."""
    f = _f(img); h, w = img.shape[:2]; _, _, nx, ny = _grid(h, w)
    d = np.clip((nx * nx * .9 + ny * ny * .8 - .3) / 1.25, 0, 1)[..., None] ** 1.3
    soft = _blur(f, w * .012)
    g = (f * (1 - d * .6) + soft * d * .6) * (1 - d * .55)
    return _u8(f + (g - f) * a + _dither(h, w) * a)

def soft_focus(img, p, a, frame, seed):
    """The whole picture slips out of focus and dims a little, so a word can sit on it."""
    f = _f(img); w = img.shape[1]
    return _u8(_blur(f, w * .022 * a + .5) * (1 - .28 * a))

# ---------------------------------------------------------------- frames
def _inset(img, k):
    """The frame device. k 0..1: how far the card has pulled back from full frame."""
    if k <= .002: return img
    h, w = img.shape[:2]; f = _f(img); s = 1 - .25 * k
    back = _zoom(_blur(f, w * .035 * min(1., k * 3)), 1 + .3 * k)
    lum = _lum(back); back = (lum + (back - lum) * (1 - .15 * k)) * (1 - .38 * k)
    cw, ch = int(round(w * s)), int(round(h * s)); x0, y0 = (w - cw) // 2, (h - ch) // 2 - int(h * .012 * k)
    shadow = np.zeros((h // 8, w // 8), np.float32)
    cv2.rectangle(shadow, (x0 // 8, (y0 + int(h * .018 * k)) // 8), ((x0 + cw) // 8, (y0 + ch + int(h * .018 * k)) // 8), 1., -1)
    shadow = cv2.resize(cv2.GaussianBlur(shadow, (0, 0), max(.6, w * .022 / 8)), (w, h), interpolation=cv2.INTER_LINEAR)[..., None]
    out = back * (1 - shadow * .6 * min(1., k * 2))
    out[y0:y0 + ch, x0:x0 + cw] = cv2.resize(f, (cw, ch), interpolation=cv2.INTER_AREA)
    return _u8(out)

def inset_frame(img, p, a, frame, seed):
    """The shot as a clean card over a blurred, enlarged, dimmed copy of itself. The card pulls back at the start of the effect's time and returns to full frame at its end."""
    return _inset(img, a * _hold(p))

def inset_hold(img, p, a, frame, seed):
    """The same card with no movement of its own: `amount` is how far it has pulled back, so "where": "in" starts on the card and opens to full frame, "out" closes down to it."""
    return _inset(img, a)

def _panels(img, k, lift, gutter=True):
    """Cut the picture into three tall panels at SPLITS; the side panels are pushed in and offset vertically by lift[i] (fraction of the height)."""
    h, w = img.shape[:2]; out = img.copy(); xs = [0, int(w * SPLITS[0]), int(w * SPLITS[1]), w]
    for i in (0, 2):
        side = _zoom(img, 1 + .16 * k, .5, .5)
        m = np.float32([[1, 0, 0], [0, 1, lift[i] * h]])
        side = cv2.warpAffine(side, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)
        out[:, xs[i]:xs[i + 1]] = (side[:, xs[i]:xs[i + 1]].astype(np.float32) * (1 - .22 * k)).astype(np.uint8)
    if gutter:
        g = max(1, int(round(w * .0045 * min(1., k * 4))))
        for x in xs[1:3]: out[:, x - g:x + g] = (out[:, x - g:x + g].astype(np.float32) * (1 - min(1., k * 4)) + INK * 255 * min(1., k * 4)).astype(np.uint8)
    return out

def triptych(img, p, a, frame, seed):
    """The shot as three tall panels: the middle one is the picture as it is, the narrow outer two show it pushed in and slipped up and down. Opens at the start of the effect's time and closes at its end."""
    k = a * _hold(p)
    if k <= .002: return img
    return _panels(img, k, {0: -.07 * k, 2: .07 * k})

def panel_drop(img, p, a, frame, seed):
    """For cuts: the picture arrives as tall panels of unequal width sliding in from above and below at their own pace, then closes up. Use "where": "in"."""
    if a <= .002: return img
    h, w = img.shape[:2]; out = img.copy(); cuts = [0, .14, .36, .64, .86, 1]
    for i in range(5):
        x0, x1 = int(w * cuts[i]), int(w * cuts[i + 1]); d = (1 if i % 2 else -1) * (a ** (1.4 + .9 * _hash(i, seed))) * (.5 + .35 * _hash(i, seed + 4))
        strip = cv2.warpAffine(img[:, x0:x1], np.float32([[1, 0, 0], [0, 1, d * h]]), (x1 - x0, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)
        k = max(1, int(abs(d) * h * .25)) | 1
        out[:, x0:x1] = cv2.blur(strip, (1, k)) if k > 2 else strip
    return out

# ---------------------------------------------------------------- cuts
def push_blur(img, p, a, frame, seed):
    """A soft zoom-blur push for cuts and punch-ins: the picture streaks outward from the middle and settles."""
    f = _f(img); n = 10; acc = np.zeros_like(f)
    for i in range(n): acc += _f(_zoom(img, 1 + a * .16 * (i / (n - 1)) + a * .04, .5, .46))
    return _u8(acc / n)

def whip_smear(img, p, a, frame, seed):
    """A sideways whip: the picture smears horizontally and slides, as if the camera snapped across."""
    h, w = img.shape[:2]; k = max(1, int(w * .32 * a)) | 1
    moved = cv2.warpAffine(img, np.float32([[1, 0, w * .12 * a * a], [0, 1, 0]]), (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)
    return cv2.blur(moved, (k, 1), borderType=cv2.BORDER_REFLECT_101)

def chroma_burst(img, p, a, frame, seed):
    """The loud one: the picture's own colours are pushed to saturated primaries and stretched into radial streaks from the middle, the three channels thrown different distances."""
    f = _f(img); h, w = img.shape[:2]; lum = _lum(f)
    hot = np.clip(lum + (f - lum) * (1 + 1.8 * a), 0, 1)
    hot = np.clip((hot - .5) * (1 + .5 * a) + .5, 0, 1); hot8 = _u8(hot)
    n = 12; acc = np.zeros_like(f)
    for i in range(n):
        t = i / (n - 1); layer = np.empty_like(f)
        for c, reach in enumerate((.62, .36, .16)):          # B, G, R travel different distances
            layer[..., c] = _f(_zoom(hot8[..., c], 1 + a * reach * (.15 + t), .5, .48))
        acc += layer
    g = acc / n
    _, _, nx, ny = _grid(h, w); ang = np.arctan2(ny * h / w, nx)
    r = np.clip(np.hypot(nx, ny * h / w), 0, 1)[..., None]
    w1 = (.5 + .5 * np.sin(ang * 3 + .6))[..., None]; w2 = (.5 + .5 * np.sin(ang * 5 + 2.4))[..., None]
    tint = (POPPY * w1 + COBALT * (1 - w1)) * (1 - w2 * .55) + SUN * w2 * .55          # red, blue and yellow sectors
    rays = (.55 + .45 * np.sin(ang * 23 + 1.7) * np.sin(ang * 7 + .4))[..., None] * r
    g = g * (1 - .5 * a * rays) + tint * rays * .75 * a
    return _u8(f + (g - f) * min(1., a * 1.6))

def white_dip(img, p, a, frame, seed):
    """A soft dip to white for cuts: the highlights bloom first and the picture washes out, rather than flashing."""
    f = _f(img); w = img.shape[1]
    glow = _blur(np.maximum(f - .45, 0) * 1.8, w * .03)
    g = _screen(f, glow * a)
    return _u8(g + (WHITE - g) * (a ** 1.5) * .9)

# ---------------------------------------------------------------- light
def light_sweep(img, p, a, frame, seed):
    """A band of warm light travelling across the frame over the effect's time, with a cool trailing edge."""
    f = _f(img); h, w = img.shape[:2]; _, _, nx, ny = _grid(h, w)
    c = -1.6 + 3.2 * p; d = nx + ny * .25 - c
    warm = np.exp(-(d / .42) ** 2)[..., None] * (SUN * .5 + POPPY * .22 + .12)
    cool = np.exp(-((d + .55) / .3) ** 2)[..., None] * COBALT * .22
    return _u8(f + (_screen(f, (warm + cool) * .8) - f) * a + _dither(h, w) * a)

# ---------------------------------------------------------------- hits: harder, shorter cuts and two more looks
def punch_hit(img, p, a, frame, seed):
    """A zoom hit for jump cuts: the picture pops up to about 1.08x with a short radial blur. With "where": "in" it decays into the plain picture."""
    n = 6; acc = np.zeros(img.shape, np.float32)
    for i in range(n): acc += _f(_zoom(img, 1 + a * .08 + a * .1 * (i / (n - 1)), .5, .46))
    return _u8(acc / n)

def speed_smear(img, p, a, frame, seed):
    """Speed-ramp feel: every row is dragged out into long horizontal streaks, the highlights longest. No slide."""
    f = _f(img); h, w = img.shape[:2]; k = max(1, int(w * .7 * a)) | 1; k2 = max(1, int(w * 1.3 * a)) | 1
    body = cv2.blur(f, (k, 1), borderType=cv2.BORDER_REFLECT_101)
    hot = cv2.blur(np.maximum(f - .5, 0) * 1.6, (k2, 1), borderType=cv2.BORDER_REFLECT_101)
    return _u8(_screen(body, hot * a))

def flash_frame(img, p, a, frame, seed):
    """An impact frame: the picture in three tones — ink blacks, poppy mids, white highlights. One or two frames at a hit."""
    f = _f(img); l = _lum(f); l = np.clip((l - .22) / .5, 0, 1); l = l * l * (3 - 2 * l)
    lo = np.clip((l - .12) / .38, 0, 1); hi = np.clip((l - .5) / .32, 0, 1)
    tone = np.where(l < .5, INK + (POPPY - INK) * lo, POPPY + (WHITE - POPPY) * hi)
    return _mix(f, tone, min(1., a * 1.15))

def shutter_blink(img, p, a, frame, seed):
    """A camera shutter: soft-edged ink blades close from the top and bottom by `amount`."""
    f = _f(img); h, w = img.shape[:2]; _, _, _, ny = _grid(h, w)
    open_ = 1.12 - 1.16 * a                                  # half-opening in ny units (1 = the frame edge)
    m = np.clip((np.abs(ny) - open_ + .1) / .1, 0, 1)[..., None]; m = m * m * (3 - 2 * m)
    return _u8(f * (1 - m) + INK * m)

def siren_wash(img, p, a, frame, seed):
    """Emergency lights in the theme's colours: poppy light from the left and cobalt from the right, alternating about three times a second, screened softly over the picture."""
    f = _f(img); h, w = img.shape[:2]; _, _, nx, ny = _grid(h, w)
    s = math.sin(2 * math.pi * 3 * frame / 30); left, right = max(0., s) ** .6, max(0., -s) ** .6
    fall = lambda side: np.exp(-((nx * side + 1) / 1.25) ** 2)[..., None] * (1 - .25 * np.abs(ny)[..., None])
    light = POPPY * fall(1) * left + COBALT * fall(-1) * right * 1.15
    glow = _blur(np.maximum(f - .55, 0) * 1.5, w * .03) * (POPPY * left + COBALT * right)
    g = _screen(f * (1 - .18 * a), light * .72 + glow * .6)
    return _u8(f + (g - f) * a + _dither(h, w) * a)

def moody_grade(img, p, a, frame, seed):
    """A low-key look: darker, less colour, cool teal-blue shadows under slightly warm highlights, soft crushed blacks, heavy soft corners, fine grain."""
    f = _f(img); h, w = img.shape[:2]; _, _, nx, ny = _grid(h, w); lum = _lum(f)
    g = lum + (f - lum) * .62
    g = np.clip((g - .46) * 1.16 + .46, 0, 1) ** 1.22
    g = g * .9 + .018
    g = g + (1 - lum) ** 2 * np.array([.05, .026, -.02], np.float32) + lum ** 2 * np.array([-.035, .0, .03], np.float32)
    d = np.clip((nx * nx * .9 + ny * ny * .8 - .22) / 1.2, 0, 1)[..., None] ** 1.2
    g = g * (1 - d * .62)
    grain = cv2.resize(_rng(seed, frame).standard_normal((h // 2, w // 2)).astype(np.float32), (w, h), interpolation=cv2.INTER_LINEAR)[..., None]
    g = g + grain * .024 * (1 - lum * .6)
    return _mix(f, g, a)

def strobe_step(img, p, a, frame, seed):
    """A jump-in stutter: the picture steps in three hard stages (1.0, 1.04, 1.08 x amount) across the effect's time. Use "where": "all"."""
    step = min(2, int(p * 3))
    return img if step == 0 else _zoom(img, 1 + .04 * a * step, .5, .44)

def tilt_snap(img, p, a, frame, seed):
    """A quick roll of up to 2.5 degrees with a slight push-in; with "where": "in" it snaps back level."""
    h, w = img.shape[:2]; m = cv2.getRotationMatrix2D((w / 2, h * .46), 2.5 * a, 1 + .07 * a)
    return cv2.warpAffine(img, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)


EFFECTS = {fn.__name__: fn for fn in (film_grade, noir, soft_vignette, soft_focus, inset_frame, inset_hold, triptych, panel_drop, push_blur, whip_smear, chroma_burst, white_dip, light_sweep,
                                         punch_hit, speed_smear, flash_frame, shutter_blink, siren_wash, moody_grade, strobe_step, tilt_snap)}
