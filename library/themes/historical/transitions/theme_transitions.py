"""The historical theme's own shader transitions, and its colours for the shared ones.
Read by load_theme() in library/_shared/shader_transitions.py; that file explains the two shader families
and the helpers used here (ease, bell, luma, hash, hash2, vnoise, getA, getB, inside, sheet, rotX ...).

All original. The look: a projector, film and paper. Slow and weighty; nothing glows, nothing bounces.
Every transition is a pure function of the two frames and progress; the only randomness is hash() of cell ids and seed.
"""
# Colours for the shared transitions (first two rows) and this theme's own names (from kit.js).
PALETTE = {
    'BG': '#0b1017', 'EDGE': '#efe9dc', 'ACCENT': '#a81e2d', 'HEAT': '#6f8fb3', 'HOT': '#efe9dc',
    'BACK': '#cbc3ae', 'GRID': '#000000', 'EDGE_MIX': 1, 'BACK_SHADE': 1, 'VIGNETTE': .6,     # mesh tiles are prints: bone rims, paper backs, a bare dark table
    'INK': '#05070b', 'NIGHT': '#0b1017', 'PAPER': '#cbc3ae', 'BONE': '#efe9dc', 'CRIMSON': '#a81e2d', 'BLOOD': '#6d0f1b', 'STEEL': '#6f8fb3',
}

HELPERS = '''
float aa(float d) { return clamp(d * resolution.y + .5, 0., 1.); }        // 1 where d > 0, one pixel soft (d in frame heights)
float fbm(vec2 p) { float s = 0., a = .5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.3; a *= .5; } return s / .9375; }
'''
PIXEL, VERTEX = {}, {}

# The lamp dims on A with a 12-a-second flicker and a weaving gate, the screen goes dark, a cold flash
# of the projector catches the middle of the frame, and B comes up out of the dark.
PIXEL['projector_dip'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, env = bell(p), tick = floor(p * 18.);
  vec2 q = uv + vec2((hash(vec2(tick, 5.)) - .5) * .004, (hash(vec2(tick, 7.)) - .5) * .008) * env;
  float k = p < .5 ? 1. - smoothstep(0., .4, p) : smoothstep(.6, 1., p);
  vec3 src = p < .5 ? getA(q) : getB(q);
  float flicker = 1. - .35 * env * step(.55, hash(vec2(tick, 3.)));
  vec2 d = (uv - vec2(.5, .45)) * vec2(ratio, 1.);
  float vignette = 1. - env * smoothstep(.1, .65, length(d)) * .85;
  vec3 col = mix(INK, src * flicker * vignette, k * k);
  float flash = exp(-pow((p - .5) / .075, 2.)) * (.7 + .3 * hash(vec2(tick, 9.)));
  return col + mix(STEEL, BONE, .65) * flash * (1. - smoothstep(0., .75, length(d))) * .9;
}
'''

# Film burning through in the gate, but cold: a ragged hole spreads from one spot, A bleaches to a
# steel white ahead of it, the rim is charred, and B is what is behind the film.
PIXEL['cold_burn'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, env = sqrt(bell(p));
  vec2 s = vec2(uv.x * ratio, uv.y);
  float n = clamp((fbm(s * 3.4 + 4.) - .22) / .56, 0., 1.) * .55 + .45 * length((uv - vec2(.64, .38)) * vec2(ratio, 1.)) / .8;
  float e = n - mix(-.14, 1.14, p);                                       // < 0: burnt through
  vec3 a = getA(uv), b = getB(uv);
  if (e > 0.) {
    float heat = exp(-e * 13.) * env;
    vec3 col = mix(a, mix(STEEL, BONE, heat) * (.6 + .8 * luma(a)) + a * .4, heat * heat);
    return mix(col, BONE, (1. - smoothstep(0., .022, e)) * env);          // the white-hot edge
  }
  vec3 col = mix(INK, b, smoothstep(.012, .085, -e));                     // the charred rim
  return col + STEEL * exp(e * 26.) * .35 * env;
}
'''

# A is a sheet torn away from the left: a deckled edge crosses the frame, leaving a strip of pale
# paper fibre on what remains and a shadow on B underneath.
PIXEL['paper_tear'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, gate = smoothstep(0., .1, p) * (1. - smoothstep(.9, 1., p));
  float y = uv.y / ratio;
  float rag = (fbm(vec2(y * 4.5, 2.)) - .5) * .2 + (vnoise(vec2(y * 55., 8.)) - .5) * .03;
  float front = mix(-.24, 1.24, ease(p)) + rag + (uv.y - .5) * .16;
  float d = (front - uv.x) * ratio;                                       // frame heights; > 0: torn away
  float fibre = (.016 + .02 * vnoise(vec2(y * 70., 31.)) + .012 * vnoise(vec2(y * 260., 3.))) * gate;
  vec3 a = getA(uv), b = getB(uv);
  a *= 1. + .12 * gate * exp(min(d + fibre, 0.) * 30.);                    // the lifted edge catches the light
  float tooth = vnoise(uv * resolution / resolution.x * 260.);
  vec3 paper = mix(BONE, PAPER, .25 + .5 * tooth) * (.94 + .06 * smoothstep(0., fibre + 1e-4, d + fibre));
  b *= 1. - .55 * gate * exp(-max(d, 0.) * 34.);                          // its shadow on B
  vec3 col = mix(a, paper, aa(d + fibre) * step(1e-5, gate));
  return mix(col, b, aa(d));
}
'''

# Three loaded strokes of dry crimson are dragged across one after another, from alternating sides.
# Each covers A in paint, bristle streaks first, and as it is dragged on the paint thins out to B.
PIXEL['brush_wipe'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress;
  vec3 col = getA(uv), b = getB(uv);
  for (int i = 0; i < 3; i++) {
    float fi = float(i), dir = mod(fi, 2.) < 1. ? 1. : -1.;
    float v = uv.y + (uv.x - .5) * (hash(vec2(fi, 11.)) - .5) * .12, c = (fi + .5) / 3., off = v - c;
    if (i == 0) off = max(off, 0.); if (i == 2) off = min(off, 0.);       // the outer strokes run off the frame
    float edge = .27 - abs(off) + (fbm(vec2(uv.x * 5., fi * 9. + 3.)) - .5) * .07;
    float along = dir > 0. ? uv.x : 1. - uv.x;
    float bristle = vnoise(vec2(v * 150., fi * 5.)), hair = vnoise(vec2(v * 420., fi * 7. + 2.));
    float t = (p - fi * .13) / .5 * 1.5 - .25 - along;
    float lead = t + (bristle - .5) * .26, tail = t - .52 + (hair - .5) * .3 + (bristle - .5) * .12;
    float band = smoothstep(0., .02 + .05 * hair, edge);                  // dry, broken edges
    float body = .82 + .3 * bristle - .25 * smoothstep(.6, .9, hair);
    vec3 paint = mix(BLOOD, CRIMSON, clamp(body, 0., 1.)) * (.92 + .2 * bristle);
    col = mix(col, paint, band * smoothstep(0., .035, lead));
    col = mix(col, b, step(1e-3, band) * smoothstep(0., .05, tail));
  }
  return mix(col, b, smoothstep(.95, 1., p));
}
'''

# An iris closes on A to the dark, soft-edged like an old lens, and opens again on B.
PIXEL['iris_vignette'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress;
  vec2 d = (uv - vec2(.5, .46)) * vec2(ratio, 1.);
  float open = p < .5 ? 1. - ease(p / .46) : ease((p - .54) / .46), r = length(d);
  float mask = 1. - smoothstep(open * .86 - .2, open * .86, r);
  vec3 src = p < .5 ? getA(uv) : getB(uv);
  src *= 1. - .3 * (1. - open) * smoothstep(0., .4, r);                    // the picture darkens toward the closing edge
  return mix(INK, src, mask);
}
'''

# The film slips in the gate: A runs up and out, the dark frame line passes, and B seats itself
# from below in two pulls, blurred by its own speed, with a few scratches while it moves.
PIXEL['film_slip'] = HELPERS + '''
const float GAP = .075;
vec3 film(float x, float v) {
  if (v < 1.) return getA(vec2(x, v));
  if (v < 1. + GAP) return mix(INK, NIGHT * 1.6, smoothstep(.0, .5, abs((v - 1.) / GAP - .5)));
  return getB(vec2(x, v - 1. - GAP));
}
vec3 transition(vec2 uv) {
  float p = progress, env = bell(p), tick = floor(p * 14.);
  float off = (.55 * ease(p / .55) + .45 * ease((p - .42) / .58)) * (1. + GAP);
  float x = uv.x + (hash(vec2(tick, 4.)) - .5) * .007 * env;
  vec3 col = vec3(0.);
  for (int i = 0; i < 10; i++) {
    float f = (float(i) + hash(uv * resolution + float(i) * 13.)) / 10. - .5;
    col += film(x, uv.y + off + f * .16 * env);
  }
  col /= 10.;
  col *= 1. - .22 * env * step(.5, hash(vec2(tick, 2.)));                  // projector flicker
  float column = floor(uv.x * 270.);
  float scratch = step(.988, hash(vec2(column, tick))) * step(hash(vec2(column, tick + 50.)), uv.y + .4);
  return mix(col, BONE, scratch * env * .4);
}
'''

# A page of an old book turns: the sheet is hinged on the left edge and comes over toward the
# camera, its free edge leading in a curl, pale paper on its back. B is the page underneath.
VERTEX['book_page'] = dict(cols=1, rows=1, sub=(48, 1), layers=[(1, False), (0, True)], cull=False, glsl='''
void displace(inout V v) {
  float p = progress;
  if (layer == 1) { v.shade = mix(.5, 1., smoothstep(.05, .75, p)); return; }
  float s = v.uv.x * 2. * ratio;                                          // distance from the spine
  float a = ease(p) * 1.5, b = bell(p) * 1.7 / (2. * ratio), th = a + b * s;   // angle at the spine; curl toward the free edge
  if (b < 1e-4) { v.pos.x = -ratio + s * cos(a); v.pos.z = s * sin(a); }
  else { v.pos.x = -ratio + (sin(th) - sin(a)) / b; v.pos.z = (cos(a) - cos(th)) / b; }
  v.nrm = vec3(-sin(th), 0., cos(th));
  v.shade = 1. + .22 * sin(th);
  v.alpha = 1. - smoothstep(.92, 1., p);
}
''')
