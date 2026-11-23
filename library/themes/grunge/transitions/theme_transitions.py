"""The grunge theme's own shader transitions, and its colours for the shared ones.
Read by load_theme() in library/_shared/shader_transitions.py; that file explains the two shader families
and the helpers used here (ease, bell, luma, hash, hash2, vnoise, getA, getB, inside, sheet, rotX ...).

All original. The look: torn paper, tape, photocopies and ink, moved like stop-motion: progress is held in
steps (hold()), so these jump from pose to pose instead of gliding.
Every transition is a pure function of the two frames and progress; the only randomness is hash() of cell ids and seed.
"""
# Colours for the shared transitions (first two rows) and this theme's own names (from kit.js).
PALETTE = {
    'BG': '#0b0a09', 'EDGE': '#fbf8f0', 'ACCENT': '#f2440f', 'HEAT': '#f2440f', 'HOT': '#fbf8f0',
    'BACK': '#d6cdb9', 'GRID': '#000000', 'EDGE_MIX': 1, 'BACK_SHADE': 1,                     # mesh tiles are paper scraps: white fibre rims, paper backs, on soot
    'SOOT': '#0b0a09', 'CHAR': '#1b1a18', 'PAPER': '#d6cdb9', 'BONE': '#ece6d8', 'FIBRE': '#fbf8f0', 'RED': '#f2440f',
    'TAPE': '#d8c592', 'TEAL': '#3fb7a2', 'PLUM': '#4a3d8c', 'BRICK': '#a8452d',
}

HELPERS = '''
float aa(float d) { return clamp(d * resolution.y + .5, 0., 1.); }        // 1 where d > 0, one pixel soft (d in frame heights)
float fbm(vec2 p) { float s = 0., a = .5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.3; a *= .5; } return s / .9375; }
float hold(float p, float steps) { return floor(p * steps + .5) / steps; }   // stop-motion: progress in steps; still 0 at 0 and 1 at 1
/** A two-tone print of a picture: soot shadows, the tint in the lights. */
vec3 duotone(vec3 c, vec3 tint) { return mix(SOOT, mix(tint, FIBRE, .3), smoothstep(.05, .85, luma(c))); }
'''
PIXEL, VERTEX = {}, {}

# A tear runs across the frame from the left, then the two halves are pulled apart, up and down,
# each with a white fibre edge where the print came away. B is underneath.
PIXEL['paper_rip'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = hold(progress, 10.), x = uv.x;
  float line = .5 + (x - .5) * .14 + (fbm(vec2(x * 5., 3.)) - .5) * .13 + (vnoise(vec2(x * 70., 7.)) - .5) * .016;
  float open = .016 * smoothstep(0., .3, p / .4 * 1.25 - .1 - x);          // the tear has passed this column
  float pull = ease((p - .3) / .7); pull *= pull;
  float offT = open + pull * (.86 + (x - .5) * .2), offB = open + pull * (.86 - (x - .5) * .16);
  if (offT + offB < 1e-5) return getA(uv);
  float dT = line - (uv.y + offT), dB = (uv.y - offB) - line, gate = 1. - smoothstep(.85, 1., p);
  vec3 col = getB(uv) * (1. - .5 * gate * exp(-max(min(-dT, -dB), 0.) * 26.));
  float tooth = vnoise(uv * resolution / resolution.x * 300.);
  vec3 fibre = mix(FIBRE, BONE, tooth * .7);
  float fT = min(.012 + .03 * vnoise(vec2(x * 110., 11.)), offT * 4.), fB = min(.012 + .03 * vnoise(vec2(x * 110., 23.)), offB * 4.);
  col = mix(col, mix(fibre, getA(vec2(x, uv.y + offT)), aa(dT - fT)), aa(dT));
  return mix(col, mix(fibre, getA(vec2(x, uv.y - offB)), aa(dB - fB)), aa(dB));
}
'''

# Four held frames of tearing: strips are ripped out of A at different angles, showing B, while the
# picture flips through teal, plum and brick prints; then a hard cut to B.
PIXEL['cross_tears'] = HELPERS + '''
/** Depth inside a torn strip (> 0 inside), frame heights; the strip passes through c at this angle. */
float strip(vec2 uv, vec2 c, float angle, float halfWidth, float salt) {
  vec2 q = vec2(uv.x * ratio, uv.y) - c, n = vec2(-sin(angle), cos(angle));
  float along = dot(q, vec2(n.y, -n.x)), across = dot(q, n);
  float rag = across > 0. ? fbm(vec2(along * 9., salt)) : fbm(vec2(along * 9., salt + 40.));
  return halfWidth - abs(across) + (rag - .5) * .05 + (vnoise(vec2(along * 120., salt)) - .5) * .008;
}
vec3 transition(vec2 uv) {
  float n = floor(progress * 5. + .6);                                     // 0: A, 1-4: the held frames, 5: B
  if (n < 1.) return getA(uv);
  vec3 b = getB(uv);
  if (n > 4.) return b;
  vec2 jolt = (hash2(vec2(n, 3.)) - .5) * .03;
  vec3 a = getA(uv + jolt);
  float d1 = strip(uv, vec2(.28, .34), .35, .085, 1.), d2 = strip(uv, vec2(.28, .62), -.6, .07, 2.);
  float d3 = strip(uv, vec2(.2, .5), 1.4, .075, 3.), d4 = strip(uv, vec2(.28, .8), .12, .1, 4.);
  float hole = n < 2. ? d1 : n < 3. ? max(d1, d2) : max(max(d1, d2), max(d3, d4));
  vec3 base = n < 2. ? a : n < 3. ? duotone(a, PLUM) : n < 4. ? duotone(a, BRICK) : duotone(a, RED);
  vec3 through = n < 2. ? duotone(b, TEAL) : n < 3. ? b : n < 4. ? duotone(b, TEAL) : b;
  if (n > 3.) { hole = max(hole, strip(uv, vec2(.3, .15), -.2, .13, 5.)); hole = max(hole, strip(uv, vec2(.4, .5), -1.2, .12, 6.)); }
  vec3 fibre = mix(FIBRE, BONE, .6 * vnoise(uv * resolution / resolution.x * 300.));
  vec3 col = mix(base, fibre, aa(hole));
  return mix(col, through * (1. - .35 * exp(-max(hole - .014, 0.) * 40.)), aa(hole - .014));
}
'''

# A is peeled off from the top like a length of masking tape: it rolls back on itself, showing a
# buff crepe-paper back, with B stuck down underneath. Skewed, so one corner lifts first.
PIXEL['tape_peel'] = HELPERS + '''
vec3 back(vec2 u) { return TAPE * (.84 + .16 * vnoise(vec2(u.x * 9., u.y * 240.))) * (.97 + .03 * vnoise(u * 300.)) + getA(u) * .06; }
vec3 transition(vec2 uv) {
  float p = hold(progress, 10.), R = .06, gate = smoothstep(0., .1, p) * (1. - smoothstep(.85, 1., p));
  float s = uv.y + (uv.x - .5) * .34;                                     // distance down from where the peel starts
  float f = mix(-.2, 1.3, p);                                             // the fold line
  vec3 b = getB(uv);
  if (s > f) {                                                            // still stuck down; the peeled length may lie over it
    vec2 u0 = vec2(uv.x, uv.y + (f - PI * R - (s - f)) - s);
    if (inside(u0) > .5) return back(u0) * (.84 + .16 * smoothstep(0., .2, s - f));
    return getA(uv) * (1. - .3 * gate * exp(-(s - f) * 18.) * step(u0.y, 0.) * 0.);
  }
  float x = clamp((f - s) / R, 0., 1.);
  if (s >= f - R) {                                                       // on the roll
    float th = asin(x);
    vec2 uTop = vec2(uv.x, uv.y + (f - R * (PI - th)) - s), uLow = vec2(uv.x, uv.y + (f - R * th) - s);
    if (inside(uTop) > .5) return back(uTop) * (.6 + .4 * (1. - x * x));
    if (inside(uLow) > .5) return getA(uLow) * (1. - .5 * x * x * gate);
    return b * (1. - .3 * gate);
  }
  return b * (1. - .45 * gate * exp(-(f - R - s) / .06));
}
'''

# A is run through a photocopier until it is only soot and bone, the copy breaks up into toner
# specks and streaks that are already B, and B's copy clears back into the picture.
PIXEL['xerox_dissolve'] = HELPERS + '''
vec3 xerox(vec3 c, vec2 cell, float salt) {
  float k = smoothstep(.43, .53, luma(c) + (hash(cell + salt) - .5) * .3);
  return mix(SOOT, BONE, k);
}
vec3 transition(vec2 uv) {
  float p = hold(progress, 10.), tick = floor(p * 10. + .5);
  vec2 cell = floor(uv * resolution / max(1., resolution.x / 270.));
  float n = .45 * hash(floor(cell / 3.) + 7.) + .2 * hash(cell + 11.) + .35 * vnoise(vec2(uv.x * 26., 2.));   // specks, and streaks down the page
  bool isB = n < smoothstep(.28, .72, p) * 1.2 - .1;
  vec3 a = getA(uv), b = getB(uv);
  vec3 col = isB ? mix(xerox(b, cell, tick), b, smoothstep(.68, 1., p)) : mix(a, xerox(a, cell, tick), smoothstep(0., .3, p));
  float lamp = exp(-abs(uv.y - mix(-.2, 1.2, p)) * 22.) * bell(p);        // the copier's light bar
  return col + FIBRE * lamp * .35;
}
'''

# Eight held frames: A jumps, B flashes through as a teal print, A again shoved sideways, B pushed
# in, A as a red print, then B a little off register, then B.
PIXEL['stutter_cut'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float n = floor(progress * 8. + .5);
  vec2 c = uv - .5;
  if (n < 1.) return getA(uv);
  if (n < 2.) return getA(.5 + c / 1.08 + vec2(.025, -.01));
  if (n < 3.) return duotone(getB(.5 + c / 1.04), TEAL);
  if (n < 4.) return getA(uv + vec2(-.05, .02)) * step(abs(c.y + .02), .47);
  if (n < 5.) return getB(.5 + c / 1.12 + vec2(.02, .03));
  if (n < 6.) return duotone(getA(.5 + c / 1.15), RED);
  if (n < 7.) return getB(uv + vec2(.03, -.012)) * step(abs(c.x + .03), .48);
  if (n < 8.) return getB(.5 + c / 1.03);
  return getB(uv);
}
'''

# Ink is thrown at the picture: soot splats land one after another, spiky and blobbed, with flung
# drops round them, and spread until they join. B shows through the middle of each splat.
# The ink is soot, or the theme's red when A is itself nearly black.
PIXEL['ink_splat'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = hold(progress, 12.), f = -1.;
  vec2 q = vec2(uv.x * ratio, uv.y);
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec2 c = vec2((.12 + .76 * hash(vec2(fi, 1.))) * ratio, .1 + .8 * hash(vec2(fi, 2.))), d = q - c;
    float t = clamp((p - fi * .1) / .8, 0., 1.), R = t * (.35 + .65 * t) * (.45 + .4 * hash(vec2(fi, 3.)));
    float angle = atan(d.y, d.x), h = hash(vec2(fi, 4.)) * 6.283;
    float lobes = 1. + .16 * sin(angle * 3. + h) + .1 * sin(angle * 7. + h * 2.) + .32 * pow(max(sin(angle * 11. + h * 3.), 0.), 10.) + .2 * pow(max(sin(angle * 5. + h * 5.), 0.), 6.);
    f = max(f, R * lobes - length(d) - step(t, 0.));
  }
  vec2 cell = q * 16., hh = hash2(floor(cell));
  float drop = (.1 + .28 * hh.y) - length(fract(cell) - .5 - (hh - .5) * .4);
  if (hh.x > .78 && f > -.03 - .1 * hh.y) f = max(f, drop / 16.);
  f += smoothstep(.8, 1., p) * 1.5;
  float tone = (luma(getA(vec2(.25, .2))) + luma(getA(vec2(.75, .35))) + luma(getA(vec2(.5, .5))) + luma(getA(vec2(.25, .65))) + luma(getA(vec2(.75, .8)))) / 5.;
  vec3 col = mix(getA(uv), tone < .2 ? RED : SOOT, aa(f));                 // red ink when the picture is too dark for black to show
  return mix(col, getB(uv), aa(f - .08 * (1. - smoothstep(.8, 1., p)) - .02 * vnoise(q * 30.) * (1. - p)));
}
'''

# A is screwed up like a sheet of paper: creases break it into facets, each lit differently, it
# shrinks into a ragged ball and drops out of the bottom of the frame, leaving B.
PIXEL['crumple'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = hold(progress, 10.), crease = smoothstep(0., .45, p), e = ease(p / .8);
  float drop = smoothstep(.55, 1., p);
  vec2 c = vec2(.5, .5 + .1 * e + 1.9 * drop * drop);
  vec2 src = .5 + (uv - c) / (1. - .8 * e);
  vec2 k = vec2(src.x * ratio * 6. + src.y * 2.1, src.y * 6. - src.x * ratio * 1.6) + (vec2(vnoise(src * 4. + 2.), vnoise(src * 4. + 40.)) - .5) * 1.6, id = floor(k), fr = fract(k);
  float half_ = fr.x > fr.y ? 1. : 0.;                                    // each skewed cell is two triangles
  vec2 facet = id * 2. + half_;
  src += (hash2(facet + 3.) - .5) * .09 * crease;
  float border = min(min(fr.x, fr.y), min(min(1. - fr.x, 1. - fr.y), abs(fr.x - fr.y)));
  float ball = length((src - .5) * vec2(ratio, 1.)), reach = mix(2., .42 + .2 * hash(facet + 9.), crease);
  vec3 b = getB(uv);
  if (inside(src) < .5 || ball > reach) return b;
  vec3 col = getA(src) * (1. + (hash(facet + 7.) - .5) * .9 * crease);
  col = mix(col, PAPER * (.7 + .5 * hash(facet + 7.)), .3 * crease * e);    // the print wears off as it is crushed
  return mix(col, FIBRE, (1. - smoothstep(0., .05, border)) * crease * .7);
}
'''
