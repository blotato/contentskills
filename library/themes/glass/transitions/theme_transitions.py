"""The fashion theme's own shader transitions, and its colours for the shared ones.
Read by load_theme() in library/_shared/shader_transitions.py; that file explains the two shader families
and the helpers used here (ease, bell, luma, hash, vnoise, getA, getB, inside ...).

The look: cuts in a fashion film are soft and fast. The picture is pushed through a zoom blur, whipped
sideways, dipped to white, slipped out of focus, dropped in as tall panels, or opened as a clean card over
a blurred copy of the shot before; once in a while the colours burst into saturated radial streaks.
All original except soft_zoom, which is built on the shared zoom_through (see shader_transitions-NOTICES.md).
Every transition is a pure function of the two frames and progress; the only randomness is hash() of pixel
and panel ids and seed.
"""
# Colours for the shared transitions (first row) and this theme's own names (from kit.js).
PALETTE = {
    'BG': '#070B16', 'EDGE': '#FFFFFF', 'ACCENT': '#3D7BFF', 'HEAT': '#6FE3C4', 'HOT': '#FFFFFF', 'BACK': '#141B2B', 'GRID': '#000000', 'EDGE_MIX': 1, 'VIGNETTE': .2,
    'INK': '#0A0F1C', 'POPPY': '#3D7BFF', 'COBALT': '#8B7BFF', 'SUN': '#6FE3C4',
}

HELPERS = '''
float glide(float x) { x = clamp(x, 0., 1.); return 1. - pow(1. - x, 3.); }
vec2 mirror(vec2 uv) { return 1. - abs(mod(uv, 2.) - 1.); }
vec3 vivid(vec3 c, float s) { float l = luma(c); return clamp(vec3(l) + (c - vec3(l)) * s, 0., 1.); }
'''
PIXEL, VERTEX = {}, {}

# A soft push through A into B: a short zoom blur, no flash.
# Built on this engine's zoom_through, which is adapted from gl-transitions "CrossZoom" by rectalogic (MIT):
# a much smaller zoom, the centre a little above the middle (where a face is), no colour flash.
PIXEL['soft_zoom'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, e = ease(p), env = bell(p);
  float dissolve = ease((p - .3) / .4), zoomA = mix(1., 1.55, e * e), zoomB = mix(.7, 1., e * (2. - e));
  vec2 c = vec2(.5, .46), toCentre = c - uv;
  float offset = hash(uv * resolution), total = 0.;
  vec3 col = vec3(0.);
  for (int i = 0; i < 24; i++) {
    float percent = (float(i) + offset) / 24., weight = 4. * (percent - percent * percent);
    vec2 q = uv + toCentre * percent * env * .45 - c;
    col += mix(getA(mirror(q / zoomA + c)), getB(mirror(q / zoomB + c)), dissolve) * weight; total += weight;
  }
  return col / total;
}
'''

# The loud one. The picture streaks outward from the middle with its three channels thrown different
# distances, its colours pushed to saturated primaries, and red / blue / yellow rays between; B is inside it.
PIXEL['colour_burst'] = HELPERS + '''
vec3 pick(vec2 q, float d) { return mix(getA(mirror(q)), getB(mirror(q)), d); }
vec3 transition(vec2 uv) {
  float p = progress, env = bell(p), d = ease((p - .35) / .3);
  vec2 c = vec2(.5, .48), dir = uv - c;
  float offset = hash(uv * resolution);
  vec3 col = vec3(0.);
  for (int i = 0; i < 24; i++) {
    float t = (float(i) + offset) / 24.;
    col += vec3(pick(c + dir * (1. - env * .78 * t), d).r, pick(c + dir * (1. - env * .5 * t), d).g, pick(c + dir * (1. - env * .26 * t), d).b);
  }
  col /= 24.;
  col = vivid(col, 1. + 2.6 * env); col = (col - .5) * (1. + .35 * env) + .5;
  float ang = atan(dir.y, dir.x * ratio), r = length(dir * vec2(ratio, 1.));
  float w1 = .5 + .5 * sin(ang * 3. + .6), w2 = .5 + .5 * sin(ang * 5. + 2.4);
  vec3 tint = mix(mix(COBALT, POPPY, w1), SUN, w2 * .55);
  float rays = (.55 + .45 * sin(ang * 23. + 1.7) * sin(ang * 7. + .4)) * clamp(r * 1.8, 0., 1.);
  return mix(col, tint, rays * .62 * env * env);
}
'''

# A slips out of focus, becomes B while both are a blur, and B comes back into focus. The picture dims a touch at the softest point.
PIXEL['blur_dissolve'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, env = bell(p), m = ease((p - .3) / .4), radius = .055 * env * env;
  float turn = hash(uv * resolution) * 2. * PI;
  vec2 centre = .5 + (uv - .5) / (1. + .04 * env);
  vec3 col = vec3(0.);
  for (int i = 0; i < 24; i++) {
    float angle = float(i) * 2.39996 + turn, r = sqrt((float(i) + .5) / 24.) * radius;
    vec2 q = centre + vec2(cos(angle), sin(angle) * ratio) * r;
    col += mix(getA(q), getB(q), m);
  }
  return col / 24. * (1. - .12 * env);
}
'''

# A soft-edged wipe that travels across the frame behind a warm light leak: sun yellow at the top of
# the edge melting to poppy at the bottom, with a cool trailing glow.
PIXEL['leak_wipe'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, e = ease(p);
  float d = uv.x * .82 + uv.y * .18 + (vnoise(uv * vec2(ratio, 1.) * 3.) - .5) * .07, edge = mix(-.4, 1.4, e);
  float m = smoothstep(edge - .24, edge + .02, d);                          // 1: still A
  vec3 col = mix(getB(uv), getA(uv), m);
  float glow = exp(-pow((d - edge + .1) / .17, 2.)) * bell(p), trail = exp(-pow((d - edge + .42) / .2, 2.)) * bell(p);
  vec3 leak = mix(SUN, POPPY, smoothstep(.1, .9, uv.y)) * .8 + .18;
  col = 1. - (1. - col) * (1. - leak * glow * .95);
  return 1. - (1. - col) * (1. - COBALT * trail * .22);
}
'''

# B arrives as five tall panels of unequal width sliding in from above and below at their own pace,
# smeared by their own speed, while A dims behind them.
PIXEL['panel_drop'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress;
  float cuts[6] = float[6](0., .14, .36, .64, .86, 1.0001);
  float fi = 0.;
  for (int i = 0; i < 5; i++) if (uv.x >= cuts[i]) fi = float(i);
  float dirn = mod(fi, 2.) < 1. ? 1. : -1., delay = hash(vec2(fi, 3.)) * .3;
  float x = (p - delay) / .7, e = glide(x), speed = 3. * pow(1. - clamp(x, 0., 1.), 2.) * step(0., x);
  float off = (1. - e) * dirn, jitter = hash(uv * resolution) - .5;
  vec3 a = getA(uv) * (1. - .4 * ease(p * 2.));
  vec3 b = vec3(0.); float cover = 0.;
  for (int i = 0; i < 8; i++) {
    float y = uv.y + off + (float(i) + jitter - 3.5) / 8. * speed * .05;
    float ok = step(0.0001, y) * step(y, .9999);
    b += getB(vec2(uv.x, clamp(y, 0., 1.))) * ok; cover += ok;
  }
  cover /= 8.;
  return mix(a, b / max(cover * 8., 1.), cover);
}
'''

# A soft dip to white: the picture goes slightly out of focus, its highlights bloom, it washes out,
# and B comes down out of the white the same way.
PIXEL['white_dip'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, env = bell(p), m = ease((p - .38) / .24), radius = .022 * env;
  float turn = hash(uv * resolution) * 2. * PI;
  vec3 col = vec3(0.);
  for (int i = 0; i < 12; i++) {
    float angle = float(i) * 2.39996 + turn, r = sqrt((float(i) + .5) / 12.) * radius;
    vec2 q = uv + vec2(cos(angle), sin(angle) * ratio) * r;
    col += mix(getA(q), getB(q), m);
  }
  col /= 12.;
  col = 1. - (1. - col) * (1. - smoothstep(.45, 1., luma(col)) * env * .7);
  return mix(col, vec3(1.), pow(env, 1.6) * .86);
}
'''

# A whip pan: the camera snaps sideways off A and lands on B, both smeared along the move.
PIXEL['whip_pan'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, e = ease(p), env = bell(p), offset = hash(uv * resolution);
  vec3 col = vec3(0.);
  for (int i = 0; i < 20; i++) {
    float x = uv.x + e + ((float(i) + offset) / 20. - .5) * env * .55;
    col += x < 1. ? getA(vec2(abs(x), uv.y)) : getB(vec2(min(x - 1., 2. - (x - 1.)), uv.y));
  }
  return col / 20.;
}
'''

# The frame device as a transition: A slips out of focus, grows and dims, and B opens over it as a
# clean card with a soft shadow that widens until it is the whole picture.
PIXEL['card_open'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, e = glide(p), radius = .045 * min(1., p * 4.);
  float turn = hash(uv * resolution) * 2. * PI;
  vec2 centre = .5 + (uv - .5) / (1. + .25 * e);
  vec3 a = vec3(0.);
  for (int i = 0; i < 16; i++) {
    float angle = float(i) * 2.39996 + turn, r = sqrt((float(i) + .5) / 16.) * radius;
    a += getA(centre + vec2(cos(angle), sin(angle) * ratio) * r);
  }
  a = a / 16. * (1. - .4 * min(1., p * 3.));
  float s = mix(.6, 1., ease(p)), alpha = smoothstep(0., .22, p);
  vec2 q = (uv - .5) / s + .5;
  vec2 dd = max(abs(uv - vec2(.5, .512)) - .5 * s, 0.);
  float shade = exp(-length(dd * vec2(ratio, 1.)) * 38.) * .55 * (1. - ease((p - .8) / .2));
  vec3 col = a * (1. - shade * alpha);
  return mix(col, getB(q), inside(q) * alpha);
}
'''

# ---------------------------------------------------------------- hits: the fast cuts
# Harder and shorter than the soft set above, for edits that change something every second. Still the
# theme's manners: no bounce, no ornament, the picture itself does the work. Use at 0.15-0.3 s.

# A hard punch-in: A is driven through a short, strong zoom blur and B lands a little over-scaled and settles.
PIXEL['punch_zoom'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, env = bell(p), m = ease((p - .32) / .18);
  float zoomA = 1. + 1.1 * p * p, zoomB = mix(1.24, 1., glide(p));
  vec2 c = vec2(.5, .46), toCentre = c - uv;
  float offset = hash(uv * resolution), total = 0.;
  vec3 col = vec3(0.);
  for (int i = 0; i < 20; i++) {
    float percent = (float(i) + offset) / 20., weight = 1. - .6 * percent;
    vec2 q = uv + toCentre * percent * env * .6 - c;
    col += mix(getA(mirror(q / zoomA + c)), getB(mirror(q / zoomB + c)), m) * weight; total += weight;
  }
  return col / total;
}
'''

# whip_pan the other way, so two whips in a row can answer each other.
PIXEL['whip_back'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, e = ease(p), env = bell(p), offset = hash(uv * resolution);
  vec3 col = vec3(0.);
  for (int i = 0; i < 20; i++) {
    float x = uv.x - e + ((float(i) + offset) / 20. - .5) * env * .55;
    col += x >= 0. ? getA(vec2(min(x, 2. - x), uv.y)) : getB(vec2(abs(x + 1.), uv.y));
  }
  return col / 20.;
}
'''

# A vertical whip: the camera snaps down off A and lands on B.
PIXEL['whip_down'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, e = ease(p), env = bell(p), offset = hash(uv * resolution);
  vec3 col = vec3(0.);
  for (int i = 0; i < 20; i++) {
    float y = uv.y - e + ((float(i) + offset) / 20. - .5) * env * .5;
    col += y >= 0. ? getA(vec2(uv.x, min(y, 2. - y))) : getB(vec2(uv.x, abs(y + 1.)));
  }
  return col / 20.;
}
'''

# Speed-ramp feel: a seam runs across A dragging each row out into one long streak; B then resolves out of its own streaks.
PIXEL['speed_smear'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, env = bell(p), m = smoothstep(.4, .6, p), jitter = (hash(uv * resolution) - .5) * .012 * env;
  float wob = (vnoise(vec2(uv.y * 90., 3.)) - .5) * .12 * env;                      // rows tear at slightly different places
  float xa = 1. - ease(p / .52) * 1.15 + wob, xb = 1. - ease((p - .48) / .52) * 1.15 + wob;
  vec3 a = vec3(0.), b = vec3(0.);
  for (int i = 0; i < 6; i++) {
    float dx = (float(i) - 2.5) / 6. * .05 * env + jitter;
    a += uv.x > xa ? getA(vec2(clamp(xa + dx, 0., 1.), uv.y)) : getA(vec2(uv.x + dx, uv.y));
    b += uv.x > xb ? getB(vec2(uv.x + dx, uv.y)) : getB(vec2(clamp(max(xb, 0.) + dx, 0., 1.), uv.y));
  }
  return mix(a, b, m) / 6.;
}
'''

# An impact frame: for a moment the picture is three tones (ink blacks, poppy mids, white highlights), then it is B.
PIXEL['flash_frame'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, w = smoothstep(.22, .36, p) * (1. - smoothstep(.64, .78, p));
  vec2 q = .5 + (uv - .5) / (1. + .05 * w);
  vec3 base = p < .5 ? getA(q) : getB(q);
  float l = smoothstep(.22, .72, luma(base));
  vec3 tone = l < .5 ? mix(INK, POPPY, smoothstep(.12, .5, l)) : mix(POPPY, vec3(1.), smoothstep(.5, .82, l));
  return mix(base, tone, w);
}
'''

# A camera shutter: two soft-edged ink blades close from top and bottom; B is there when they open.
PIXEL['shutter_blink'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, k = ease(min(1., (1. - abs(2. * p - 1.)) * 1.04)), open = mix(.56, -.02, k * k);
  vec3 base = p < .5 ? getA(uv) : getB(uv);
  return mix(base, INK, smoothstep(open - .05, open, abs(uv.y - .5)));
}
'''

# The inverse of card_open: B comes up from below as a clean card LARGER than the frame, a little soft, and lands exactly on it; A dims and blurs behind.
PIXEL['card_slam'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, e = glide(p), radius = .04 * min(1., p * 5.);
  float turn = hash(uv * resolution) * 2. * PI;
  vec3 a = vec3(0.), b = vec3(0.);
  float s = mix(1.25, 1., e), off = (1. - e) * 1.25, soft = .012 * (1. - e) * min(1., p * 40.);
  vec2 q = (uv - .5 - vec2(0., off)) / s + .5;
  for (int i = 0; i < 12; i++) {
    float angle = float(i) * 2.39996 + turn, r = sqrt((float(i) + .5) / 12.);
    vec2 d = vec2(cos(angle), sin(angle) * ratio) * r;
    a += getA(uv + d * radius); b += getB(clamp(q + d * soft, 0., 1.));
  }
  a = a / 12. * (1. - .45 * min(1., p * 4.)); b /= 12.;
  vec2 dd = max(abs(uv - .5 - vec2(0., off - .012)) - .5 * s, 0.);
  float shade = exp(-length(dd * vec2(ratio, 1.)) * 34.) * .6 * min(1., p * 8.);
  return mix(a * (1. - shade), b, inside(q));
}
'''

# The theme's three tall panels (cut at .17 and .83) slip off A vertically in alternate directions, smeared by their speed; B is underneath, settling from a slight push-in.
PIXEL['split_shift'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, fi = uv.x < .17 ? 0. : uv.x < .83 ? 1. : 2.;
  float dirn = fi == 1. ? -1. : 1., x = (p - fi * .09) / .82, e = ease(x) * ease(x), speed = bell(x);
  float jitter = hash(uv * resolution) - .5;
  vec2 qb = .5 + (uv - .5) / mix(1.07, 1., glide(p));
  vec3 b = getB(qb) * (1. - .3 * (1. - ease(p * 1.6)));
  vec3 a = vec3(0.); float cover = 0.;
  for (int i = 0; i < 8; i++) {
    float y = uv.y + e * dirn * 1.02 + (float(i) + jitter - 3.5) / 8. * speed * .16;
    float ok = step(0., y) * step(y, 1.);
    a += getA(vec2(uv.x, clamp(y, 0., 1.))) * ok; cover += ok;
  }
  cover /= 8.;
  return mix(b, a / max(cover * 8., 1.), cover);
}
'''
