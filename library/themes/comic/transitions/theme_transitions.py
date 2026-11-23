"""The comic theme's own shader transitions, and its colours for the shared ones.
Read by load_theme() in library/_shared/shader_transitions.py; that file explains the two shader families
and the helpers used here (ease, bell, luma, hash, hash2, vnoise, getA, getB, inside, sheet, rotX ...).

All original. The look: a printed comic page. Flat colour, black ink lines, paper, Ben-Day dots; things pop and whip.
Every transition is a pure function of the two frames and progress; the only randomness is hash() of cell ids and seed.
"""
# Colours for the shared transitions (first two rows) and this theme's own names (from kit.js).
PALETTE = {
    'BG': '#f3ead4', 'EDGE': '#16121c', 'ACCENT': '#e2242c', 'HEAT': '#ffd61e', 'HOT': '#fffbf0',
    'BACK': '#f7edd0', 'GRID': '#000000', 'EDGE_MIX': 1, 'BACK_SHADE': 1, 'VIGNETTE': .12,    # mesh tiles are panels: ink outlines, paper backs, on the paper gutter
    'INK': '#16121c', 'PAPER': '#f7edd0', 'RED': '#e2242c', 'YELLOW': '#ffd61e', 'BLUE': '#2767d9',
}

HELPERS = '''
float aa(float d) { return clamp(d * resolution.y + .5, 0., 1.); }        // 1 where d > 0, one pixel soft (d in frame heights)
'''
PIXEL, VERTEX = {}, {}

# A jagged burst pops open from the middle: ink outline, a yellow star, a red star inside it, then B.
# The outline is redrawn ten times on the way ("boils") and action lines shoot out over A.
PIXEL['burst_iris'] = HELPERS + '''
float star(vec2 d, float turn, float salt) {                               // distance from the centre, measured in star radii
  float k = (atan(d.y, d.x) / (2. * PI) + .5) * 14. + turn, f = fract(k);
  float tip = .6 + .4 * hash(vec2(mod(floor(k), 14.), salt));
  return length(d) / mix(.52, .52 + .48 * tip, 1. - abs(2. * f - 1.));
}
vec3 transition(vec2 uv) {
  float p = progress, gate = smoothstep(0., .1, p) * (1. - smoothstep(.88, 1., p)), boil = floor(p * 10.);
  vec2 d = (uv - vec2(.5, .47)) * vec2(ratio, 1.);
  float R = mix(-.06, 1.6, p * p * (3. - 2. * p));
  float g1 = star(d, .08 * sin(boil * 2.4), 3. + mod(boil, 3.)), g2 = star(d, .5 + .08 * sin(boil * 1.7), 9. + mod(boil, 3.));
  vec3 a = getA(uv), b = getB(uv);
  float ray = (atan(d.y, d.x) / (2. * PI) + .5) * 96.;
  float line = step(.8, hash(vec2(floor(ray), boil))) * (1. - abs(2. * fract(ray) - 1.)) * smoothstep(R * .5 + .12, R * .5 + .5, length(d));
  a = mix(a, INK, step(.35, line) * gate);
  float ink = .028 * gate;
  vec3 col = mix(a, INK, aa((R - g1) * .5));
  col = mix(col, YELLOW, aa((R - ink - g1) * .5));
  col = mix(col, INK, aa((R - .2 * gate - g2) * .5));
  col = mix(col, RED, aa((R - .2 * gate - ink - g2) * .5));
  col = mix(col, INK, aa((R - .4 * gate - g1) * .5));
  return mix(col, b, aa((R - .4 * gate - ink - g1) * .5));
}
'''

# Ben-Day dots on a 45-degree screen sweep across: yellow dots with an ink rim swell until they
# join, red dots swell inside them, and the next shot grows out of the middle of each.
PIXEL['benday_wipe'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, cells = 10.;
  vec2 q = vec2(uv.x * ratio, uv.y) * cells / ratio, r = vec2(q.x + q.y, q.y - q.x) * .70710678;
  vec2 id = floor(r), f = fract(r) - .5;
  vec2 centre = vec2((id.x + .5) - (id.y + .5), (id.x + .5) + (id.y + .5)) * .70710678 / cells * vec2(1., ratio);   // cell centre, back in uv
  float sweep = clamp(centre.x * .7 + centre.y * .3, 0., 1.);
  float t = clamp(p * 1.9 - sweep * .9, 0., 1.), d = length(f), px = cells / resolution.x;
  float r1 = t * 1.6, r2 = (t - .2) * 1.6, r3 = (t - .42) / .58 * .76, rim = .06 * min(1., t * 12.);
  vec3 col = getA(uv);
  col = mix(col, INK, clamp((r1 + rim - d) / px + .5, 0., 1.) * step(1e-4, t));
  col = mix(col, YELLOW, clamp((r1 - d) / px + .5, 0., 1.) * step(1e-4, t));
  col = mix(col, RED, clamp((r2 - d) / px + .5, 0., 1.) * step(.2, t));
  col = mix(col, INK, clamp((r3 + .05 - d) / px + .5, 0., 1.) * step(.42, t));
  return mix(col, getB(uv), clamp((r3 - d) / px + .5, 0., 1.) * step(.42, t));
}
'''

# A slash of black ink whips down the diagonal with speed teeth on its leading edge and drops
# flung ahead of it; a dotted yellow stripe rides in the ink, and B is behind the trailing teeth.
PIXEL['ink_slash'] = HELPERS + '''
float teeth(float c, float salt) {                                        // sharp spikes of uneven length, 0..1
  float i = floor(c), f = fract(c);
  return (1. - abs(2. * f - 1.)) * (.25 + .75 * hash(vec2(i, salt)));
}
vec3 transition(vec2 uv) {
  float p = progress;
  float s = (1. - uv.x) * .5 + uv.y * .5, c = (uv.x * ratio + uv.y) * 13.;   // s: along the slash's travel; c: along its edge
  float lead = mix(-.3, 1.95, ease(p)) + teeth(c, 4.) * .2 - s;           // > 0: the ink has arrived
  float tail = lead - .62 - teeth(c + .37, 8.) * .2;                      // > 0: B
  vec3 a = getA(uv), b = getB(uv);
  vec2 cell = vec2(uv.x * ratio, uv.y) * 24., h = hash2(floor(cell));
  float drop = step(.86, h.x) * step(length(fract(cell) - .5 - (h - .5) * .3), .12 + .3 * h.y) * step(-.16 * h.y - .02, lead);
  vec3 col = mix(a, INK, max(drop, aa(lead * .6)));
  float stripe = lead - .2 - teeth(c * 1.7 + .2, 6.) * .08, stripeEnd = lead - .42 - teeth(c * 1.7, 2.) * .08;
  vec2 dq = vec2(uv.x * ratio + uv.y, uv.y - uv.x * ratio) * 30.;
  vec3 fill = mix(YELLOW, RED, step(length(fract(dq) - .5), .3 * clamp(stripe / .22, 0., 1.)));
  col = mix(col, fill, aa(stripe * .6) * (1. - aa(stripeEnd * .6)));
  return mix(col, b, aa(tail * .6));
}
'''

# The frame comes apart along two angled gutters into three inked panels, which slide off to
# alternate sides over B, each throwing a hard ink shadow.
PIXEL['gutter_split'] = HELPERS + '''
float gutter(int i, float x) { return i == 0 ? .35 + (x - .5) * .11 : .67 - (x - .5) * .08; }
/** Is this pixel on a panel? -> the A coordinate it shows and its distance to the panel's edge (frame heights). */
bool panel(vec2 uv, out vec2 src, out float edge) {
  float p = progress, gap = .016 * ease(p / .3);
  for (int i = 0; i < 3; i++) {
    float dir = i == 1 ? 1. : -1., slide = dir * ease((p - .22 - .09 * float(i)) / .58) * 1.25;
    vec2 q = uv - vec2(slide, -slide * .06 * dir);
    float top = i == 0 ? -1. : gutter(i - 1, q.x) + gap, bottom = i == 2 ? 2. : gutter(i, q.x) - gap;
    edge = min(min(q.y - top, bottom - q.y), min(q.x, 1. - q.x) * ratio + (slide == 0. ? 1. : 0.));
    if (edge >= 0.) { src = q; return true; }
  }
  return false;
}
vec3 transition(vec2 uv) {
  float p = progress, gate = smoothstep(0., .12, p);
  vec2 src; float edge;
  vec3 under = mix(PAPER, getB(uv), smoothstep(.2, .42, p));
  if (panel(uv - vec2(.022 * ratio, .016) * gate, src, edge)) under = mix(under, INK, .85 * gate);   // hard drop shadow
  if (!panel(uv, src, edge)) return under;
  return mix(mix(INK, getA(src), max(aa(edge - .0075 * gate), 1. - min(1., p * 30.))), under, (1. - aa(edge)) * min(1., p * 30.));
}
'''

# A whip pan: A is thrown off to the left, skewed and smeared, B is thrown in behind it, and ink
# and paper speed lines streak across while it moves.
PIXEL['whip_smear'] = HELPERS + '''
vec3 pan(float s, float y) { return s < 1. ? getA(vec2(s, y)) : getB(vec2(s - 1., y)); }
vec3 transition(vec2 uv) {
  float p = progress, env = bell(p), e = p * p * (3. - 2. * p);
  e = e * e * (3. - 2. * e);                                             // a hard snap in the middle
  float s = uv.x + e + (.5 - uv.y) * .34 * env, jitter = hash(uv * resolution);
  vec3 col = vec3(0.);
  for (int i = 0; i < 14; i++) col += pan(s + ((float(i) + jitter) / 14. - .5) * .5 * env * env, uv.y);
  col /= 14.;
  float row = floor(uv.y * 64.), h = hash(vec2(row, 1.)), on = step(.7, h) * env * env;
  float dash = step(fract(uv.x * (.4 + h) + h * 9. - e * (2. + 3. * h)), .55);
  vec3 lineCol = h > .9 ? YELLOW : (h > .8 ? PAPER : INK);
  return mix(col, lineCol, on * dash * .92);
}
'''

# The page flips up: hinged on its top edge, it lifts toward the camera with the bottom edge
# leading in a curl, inked round its rim, paper on the back. B is the page underneath.
VERTEX['page_flip'] = dict(cols=1, rows=1, sub=(1, 56), layers=[(1, False), (0, True)], cull=False, glsl='''
void displace(inout V v) {
  float p = progress;
  if (layer == 1) { v.shade = mix(.62, 1., smoothstep(.05, .7, p)); return; }
  float s = v.uv.y * 2.;                                                  // distance from the hinge
  float a = ease(p) * 1.42, b = bell(p) * 1.5 / 2., th = a + b * s;       // angle at the hinge; curl toward the free edge
  if (b < 1e-4) { v.pos.y = -1. + s * cos(a); v.pos.z = s * sin(a); }
  else { v.pos.y = -1. + (sin(th) - sin(a)) / b; v.pos.z = (cos(a) - cos(th)) / b; }
  v.nrm = vec3(0., -sin(th), cos(th));
  v.shade = 1. + .15 * sin(th);
  v.glow = smoothstep(0., .08, p) * 1.2;
  v.alpha = 1. - smoothstep(.93, 1., p);
}
''')
