"""The lifestyle theme's own shader transitions, and its colours for the shared ones.
Read by load_theme() in library/_shared/shader_transitions.py; that file explains the two shader families
and the helpers used here (ease, bell, luma, hash, hash2, vnoise, getA, getB, inside, sheet, rotX ...).

The look: pale paper, cream light, soft edges. Nothing slams: everything glides to rest on a long ease-out.
All original except cream_zoom, which is built on the shared zoom_through (see shader_transitions-NOTICES.md).
Every transition is a pure function of the two frames and progress; the only randomness is hash() of cell ids and seed.
"""
# Colours for the shared transitions (first two rows) and this theme's own names (from kit.js).
PALETTE = {
    'BG': '#E8F1DA', 'EDGE': '#F5F8E9', 'ACCENT': '#6CAE48', 'HEAT': '#E9B44C', 'HOT': '#F5F8E9',
    'BACK': '#D7E5C4', 'GRID': '#000000', 'EDGE_MIX': 1, 'BACK_SHADE': 1, 'VIGNETTE': .08,    # mesh tiles are photos with a cream rim, on the pale paper
    'PAPER': '#E8F1DA', 'CREAM': '#F5F8E9', 'DEEP': '#D7E5C4', 'INK': '#2B221C', 'LEAF': '#6CAE48', 'SUN': '#E9B44C', 'BLUSH': '#EFC6B2',
}

HELPERS = '''
float aa(float d) { return clamp(d * resolution.y + .5, 0., 1.); }        // 1 where d > 0, one pixel soft (d in frame heights)
float fbm(vec2 p) { float s = 0., a = .5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.3; a *= .5; } return s / .9375; }
float glide(float x) { x = clamp(x, 0., 1.); return mix(1. - pow(1. - x, 3.), x * x * (3. - 2. * x), .4); }   // a long ease-out with a soft start
'''
PIXEL, VERTEX = {}, {}

# A paper panel carrying B slides up over A and settles; its top edge is a cream mat that throws
# a soft shadow, and A drifts up a little more slowly underneath.
PIXEL['paper_slide'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, e = glide(p), mat = .03, gate = 1. - smoothstep(.85, 1., p);
  float top = mix(1., -mat, e), d = uv.y - top;                            // > 0: on the panel
  vec3 a = getA(vec2(uv.x, uv.y + .1 * e)) * (1. - .22 * e);
  a *= 1. - .4 * gate * step(1e-4, p) * exp(min(d, 0.) * 16.);
  vec3 edge = mix(CREAM, PAPER, .5 * vnoise(uv * resolution / resolution.x * 220.)) * (1. - .08 * smoothstep(mat * .7, mat, d));
  vec3 col = mix(a, edge, aa(d));
  return mix(col, getB(vec2(uv.x, uv.y - top - mat)), aa(d - mat));
}
'''

# B is brushed on: five broad, soft strokes are drawn across one after another from alternating
# sides, bristly at their ends, each leaving a pale cream edge that B fills behind.
PIXEL['brush_reveal'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, m = 0.;
  for (int i = 0; i < 5; i++) {
    float fi = float(i), dir = mod(fi, 2.) < 1. ? 1. : -1.;
    float v = uv.y + (uv.x - .5) * .2, off = v - (fi + .5) / 5.;
    if (i == 0) off = max(off, 0.); if (i == 4) off = min(off, 0.);       // the outer strokes run off the frame
    float edge = .2 - abs(off) + (fbm(vec2(uv.x * 4., fi * 7.)) - .5) * .07;
    float along = dir > 0. ? uv.x : 1. - uv.x, bristle = fbm(vec2(v * 22., fi * 5.));
    float lead = glide((p - fi * .1) / .58) * 1.75 - .3 - along + (bristle - .5) * .14;
    m = max(m, smoothstep(0., .05 + .05 * bristle, edge) * smoothstep(0., .3, lead));
  }
  m = max(m, smoothstep(.92, 1., p));
  vec3 col = mix(getA(uv), CREAM, smoothstep(0., .4, m));
  return mix(col, getB(uv), smoothstep(.35, .95, m));
}
'''

# A gentle push through A into B while a cream and sun-yellow light leak drifts across the frame.
# Built on this engine's zoom_through, which is adapted from gl-transitions "CrossZoom" by rectalogic (MIT):
# a much smaller zoom and blur, no flash, and the light leak.
PIXEL['cream_zoom'] = HELPERS + '''
vec2 mirror(vec2 uv) { return 1. - abs(mod(uv, 2.) - 1.); }
vec3 transition(vec2 uv) {
  float p = progress, e = ease(p), env = bell(p);
  float dissolve = ease((p - .25) / .5), zoomA = mix(1., 1.3, e), zoomB = mix(.8, 1., e * (2. - e));
  vec2 toCentre = vec2(.5) - uv;
  float offset = hash(uv * resolution), total = 0.;
  vec3 col = vec3(0.);
  for (int i = 0; i < 20; i++) {
    float percent = (float(i) + offset) / 20., weight = 4. * (percent - percent * percent);
    vec2 q = uv + toCentre * percent * env * .25 - .5;
    col += mix(getA(q / zoomA + .5), getB(mirror(q / zoomB + .5)), dissolve) * weight; total += weight;
  }
  col /= total;
  vec2 d = (uv - vec2(mix(-.35, 1.35, p), mix(.25, .6, p))) * vec2(1.3, .6);
  float leak = (exp(-dot(d, d) * 5.) + .25 * exp(-dot(d, d) * 1.2)) * env;
  col = 1. - (1. - col) * (1. - (CREAM * .5 + mix(SUN, BLUSH, uv.y) * .4) * leak);
  return mix(col, CREAM, .16 * env * env);
}
'''

# A washes out to cream paper, its highlights first, and B comes up out of the cream, its
# darker shapes first, like ink taking on paper.
PIXEL['cream_dissolve'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress;
  float cloud = fbm(vec2(uv.x * ratio, uv.y) * 2.6 + 5.), tooth = vnoise(uv * resolution / resolution.x * 240.);
  vec3 cream = mix(CREAM, PAPER, cloud * .6) * (1. - .035 * tooth);
  if (p < .5) { vec3 a = getA(uv); return mix(a, cream, smoothstep(0., 1., p * 3.6 - (1. - luma(a)) * .5 - cloud * .3)); }
  vec3 b = getB(uv);
  return mix(cream, b, smoothstep(0., 1., (p - .5) * 3.6 - luma(b) * .5 - cloud * .3));
}
'''

# A goes softly out of focus, becomes B while both are a blur, and B comes back into focus;
# the picture lifts toward cream at the softest point.
PIXEL['blur_through'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, env = bell(p), m = ease((p - .3) / .4), radius = .05 * env * env;
  float turn = hash(uv * resolution) * 2. * PI;
  vec2 centre = .5 + (uv - .5) / (1. + .05 * env);
  vec3 col = vec3(0.);
  for (int i = 0; i < 24; i++) {
    float angle = float(i) * 2.39996 + turn, r = sqrt((float(i) + .5) / 24.) * radius;
    vec2 q = centre + vec2(cos(angle), sin(angle) * ratio) * r;
    col += mix(getA(q), getB(q), m);
  }
  return mix(col / 24., CREAM, .2 * env * env);
}
'''

# An arch-topped window rises from the bottom of the frame and widens until it is the whole
# picture: B inside, slowly pushing in, with a cream mat round the opening.
PIXEL['arch_reveal'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, e = mix(glide(p), ease(p), .65), gate = smoothstep(0., .1, p) * (1. - smoothstep(.8, 1., p));
  float w = mix(.17, .85, e * e), mat = .02 * gate;
  vec2 q = (uv - vec2(.5, mix(1.22, .3, e))) * vec2(ratio, 1.);
  float d = q.y < 0. ? w - length(q) : w - abs(q.x);                       // > 0: inside the arch
  vec3 a = getA(uv) * (1. - .3 * gate * exp(min(d, 0.) * 22.));
  vec3 b = getB(.5 + (uv - .5) / (1. + .07 * (1. - e)));
  vec3 col = mix(a, mix(CREAM, PAPER, .3), aa(d));
  return mix(col, b, aa(d - mat));
}
'''

# The frame comes apart into a grid of square-cornered photos with paper gutters between them;
# they drift up and away at their own pace, turning a little and fading, and B is underneath.
VERTEX['collage_split'] = dict(cols=3, sub=(1, 1), layers=[(1, False), (0, True)], cull=False, glsl='''
void displace(inout V v) {
  float p = progress;
  if (layer == 1) { v.alpha = smoothstep(.18, .55, p); v.pos.xy *= mix(1.05, 1., ease(p)); return; }
  float open = ease(p / .3), delay = hash(in_id) * .26 + in_id.y / grid.y * .14;
  float t = clamp((p - .2 - delay) / .4, 0., 1.), t2 = t * t * (3. - 2. * t);
  vec3 c = sheet(in_cell);
  vec2 r = (v.pos.xy - c.xy) * (1. - .09 * open);
  float turn = (hash(in_id + 5.) - .5) * .5 * t2;
  v.pos.xy = c.xy + vec2(r.x * cos(turn) - r.y * sin(turn), r.x * sin(turn) + r.y * cos(turn));
  v.pos.xy += vec2((hash(in_id + 9.) - .5) * .4, -(.35 + .6 * hash(in_id + 13.))) * t2;
  v.pos.z += t2 * .25 + open * .02 * (1. + hash(in_id + 3.));
  v.alpha = 1. - smoothstep(.35, 1., t);
  v.glow = open * 1.2;
}
''')
