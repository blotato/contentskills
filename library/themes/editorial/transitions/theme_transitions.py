"""The editorial theme's own shader transitions, and its colours for the shared ones.
Read by load_theme() in library/_shared/shader_transitions.py; that file explains the two shader families
and the helpers used here (ease, bell, luma, hash, getA, getB ...).

The look: a magazine being laid out and leafed through. Pictures glide and settle, a wipe is a mask whose edge
is a thin drawn rule, a sheet of paper passes, focus is pulled, a page turns. Everything eases in and out;
nothing flashes, strobes, splits channels or shakes, and no picture ever shows an empty edge (anything that
moves is scaled up a little first). They are written to read in 5-8 frames (0.17-0.27 s at 30 fps) and to
stay calm at 0.35-0.5 s. Colours are the theme's, measured on its footage (kit.js): paper, stone, ink
(aubergine), wine, crimson, blush.

All original. Every transition is a pure function of the two frames and progress (exactly A at 0, exactly B
at 1); none uses randomness at all.
"""
# Colours for the shared transitions (first two rows) and this theme's own names (theme.json / kit.js).
PALETTE = {
    'BG': '#EDF0EB', 'EDGE': '#EDF0EB', 'ACCENT': '#7A2137', 'HEAT': '#DFA78C', 'HOT': '#EDF0EB',
    'BACK': '#D5DBD5', 'GRID': '#000000', 'EDGE_MIX': 1., 'BACK_SHADE': 1., 'VIGNETTE': .0,      # mesh tiles: paper edges and stone backs lit like paper, no grid, no glow
    'PAPER': '#EDF0EB', 'STONE': '#D5DBD5', 'INK': '#26101A', 'WINE': '#7A2137', 'CRIMSON': '#A70A3E', 'BLUSH': '#DFA78C',
}

HELPERS = '''
// The theme's curves: glide (quart-out, an arrival) and sway (cubic in-out, a move that starts and ends at rest).
float glide(float x) { x = clamp(x, 0., 1.); return 1. - pow(1. - x, 4.); }
float sway(float x) { x = clamp(x, 0., 1.); return x < .5 ? 4. * x * x * x : 1. - pow(2. - 2. * x, 3.) * .5; }
float fadeEnds(float x, float w) { return smoothstep(0., w, x) * (1. - smoothstep(1. - w, 1., x)); }   // 1 in the middle, 0 at both ends
vec2 zoomAt(vec2 uv, float z, vec2 c) { return c + (uv - c) / z; }                                   // z >= 1: never leaves the picture
vec3 screen(vec3 c, vec3 light) { return 1. - (1. - c) * (1. - clamp(light, 0., 1.)); }
const vec2 FACE = vec2(.5, .44);                      // where a face usually is: zooms and the iris centre here
// A drawn hairline: `d` is the distance from the line in px of a 1080-wide frame (signed; positive = the side
// the line is moving toward). A paper rule 2.6 px wide with a faint ink line on its leading side, so it reads on
// white walls and on dark cloth alike.
vec3 rule(vec3 col, float d, float alpha) {
  float aa = 540. / resolution.x;                     // half a pixel, in 1080 units
  float paper = 1. - smoothstep(1.3 - aa, 1.3 + aa, abs(d));
  float ink = (1. - smoothstep(1.1 - aa, 1.1 + aa, abs(d - 2.4))) * .42;
  col = mix(col, INK, ink * alpha);
  return mix(col, PAPER, paper * alpha);
}
'''

PIXEL, VERTEX, PARAMS = {}, {}, {}

# A soft cross-zoom: A pushes in and softens into a short radial blur while B, a little larger and soft, settles
# to its size; the two cross-fade in the middle. No flash, nothing brightens.
PIXEL['soft_zoom'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, e = ease(p);
  float zA = 1. + .2 * p * p, zB = 1. + .13 * (1. - p) * (1. - p);
  float bA = .11 * e, bB = .11 * (1. - e);
  vec3 a = vec3(0.), b = vec3(0.);
  for (int i = 0; i < 32; i++) {
    float t = (float(i) + .5) / 32.;
    a += getA(zoomAt(uv, zA * (1. + bA * t), FACE));
    b += getB(zoomAt(uv, zB * (1. + bB * t), FACE));
  }
  return mix(a, b, ease((p - .2) / .6)) / 32.;
}
'''

# A push: the two pictures travel together as one strip, starting and ending at rest, with a motion blur along
# the travel that follows the speed. `dir` is the way they travel.
PUSH = HELPERS + '''
vec3 push(vec2 uv, vec2 dir) {
  float p = progress, d = sway(p), len = .1 * 4. * p * (1. - p);
  vec3 col = vec3(0.); float total = 0.;
  for (int i = 0; i < 32; i++) {
    float t = (float(i) + .5) / 32. - .5, w = 1. - abs(t) * 2.;      // a tent: the smear has soft ends
    vec2 q = uv - dir * (d + len * t);
    float k = dot(q - .5, -dir) + .5;                 // how far along the strip: 0..1 is A, 1..2 is B
    col += (k < 1. ? getA(q) : getB(q + dir)) * w; total += w;
  }
  return col / total;
}
'''
PIXEL['glide_left'] = PUSH + 'vec3 transition(vec2 uv) { return push(uv, vec2(-1., 0.)); }\n'
PIXEL['glide_up'] = PUSH + 'vec3 transition(vec2 uv) { return push(uv, vec2(0., -1.)); }\n'

# A masked wipe whose edge is a drawn rule: B is uncovered behind a hairline that starts and stops gently, each
# picture drifting a little the way the rule goes (A as it leaves, B as it settles), A shaded just ahead of the rule.
WIPE = HELPERS + '''
vec3 ruleWipe(vec2 uv, vec2 dir) {
  float p = progress, e = sway(p);
  float along = dot(uv, dir), unit = dir.x > .5 ? 1. : ratio;          // one frame width, in units of `along`
  float edge = mix(-.02, 1.02, e), d = (along - edge) / unit * 1080.;  // px (1080-wide frame) ahead of the rule
  vec3 a = getA(zoomAt(uv, 1. + .05 * e, vec2(.5)) - dir * .02 * e);
  vec3 b = getB(zoomAt(uv, 1. + .07 * (1. - e), vec2(.5)) + dir * .03 * (1. - e));
  float on = fadeEnds(p, .1);
  a *= 1. - .2 * on * exp(-max(d, 0.) / 46.);                          // B lies over A: a soft shadow ahead of the edge
  float aa = 540. / resolution.x;
  vec3 col = mix(b, a, smoothstep(-aa, aa, d));
  return rule(col, d, on);
}
'''
PIXEL['rule_wipe'] = WIPE + 'vec3 transition(vec2 uv) { return ruleWipe(uv, vec2(1., 0.)); }\n'
PIXEL['rule_wipe_down'] = WIPE + 'vec3 transition(vec2 uv) { return ruleWipe(uv, vec2(0., 1.)); }\n'

# A sheet of paper passes from right to left: its leading edge covers A, its trailing edge uncovers B. The sheet
# is narrower than the frame, so the picture is never all paper (no flash); soft shadows fall from both its edges
# and it carries one printed hairline.
PIXEL['paper_slide'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, e = ease(p), width = .46, on = fadeEnds(p, .08);
  float lead = 1.03 - e * (1.06 + width), trail = lead + width;
  float dl = (lead - uv.x) * 1080., dt = (uv.x - trail) * 1080.;       // px left of the sheet, px right of it
  float aa = 540. / resolution.x;
  vec3 a = getA(zoomAt(uv, 1. + .05 * e, vec2(.5)) + vec2(.02 * e, 0.));
  vec3 b = getB(zoomAt(uv, 1. + .06 * (1. - e), vec2(.5)) - vec2(.025 * (1. - e), 0.));
  a *= 1. - .26 * on * exp(-max(dl, 0.) / 54.);                        // the sheet's shadow on A, ahead of it
  b *= 1. - .2 * on * exp(-max(dt, 0.) / 40.);                         // and on B, behind it
  float s = clamp((uv.x - lead) / width, 0., 1.);
  vec3 sheet = mix(PAPER, STONE, .55 * s) * (1. - .03 * abs(uv.y - .4));
  sheet = mix(sheet, INK, (1. - smoothstep(1. - aa, 1. + aa, abs(-dl - 64.))) * .5);        // a printed hairline, 64 px in
  vec3 col = mix(a, sheet, smoothstep(aa, -aa, dl));
  return mix(col, b, smoothstep(-aa, aa, dt));
}
'''

# A focus pull through the cut: A goes out of focus, B comes into focus, and they dissolve while both are soft.
PIXEL['focus_dissolve'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, r = .03 * pow(bell(p), .85), m = ease((p - .28) / .44);
  vec2 qa = zoomAt(uv, 1. + .035 * ease(p), FACE), qb = zoomAt(uv, 1. + .035 * (1. - ease(p)), FACE);
  vec3 col = vec3(0.); float total = 0.;
  for (int i = 0; i < 80; i++) {
    float t = (float(i) + .5) / 80., ang = float(i) * 2.39996323, w = 1. - .6 * t;
    vec2 o = vec2(cos(ang), sin(ang) * ratio) * sqrt(t) * r;         // a round disc of samples (golden-angle spiral)
    col += mix(getA(qa + o), getB(qb + o), m) * w; total += w;
  }
  return col / total;
}
'''

# A soft band of warm light crosses the frame on a slight diagonal; behind it the picture is already B.
PIXEL['light_sweep'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, d = uv.x + (uv.y - .5) * .32;
  float c = mix(-.34, 1.34, sway(p) * .7 + p * .3);
  vec3 a = getA(zoomAt(uv, 1. + .03 * ease(p), FACE)), b = getB(zoomAt(uv, 1. + .03 * (1. - ease(p)), FACE));
  vec3 col = mix(a, b, smoothstep(c + .09, c - .09, d));
  float x = (d - c) / .15, band = exp(-x * x) + .35 * exp(-x * x * .12);
  vec3 lit = screen(col * (1. - .1 * min(band, 1.) * vec3(0., .35, 1.)), band * vec3(.34, .25, .16));   // warm: cream on white, gold on dark
  return mix(col, lit, pow(bell(p), .6));
}
'''

# The frame as a layout grid: four columns hand over to B one after another, left to right, each behind its own
# hairline travelling down; thin rules stand between the columns while it happens. `cols` columns (4).
PARAMS['column_wipe'] = {'cols': 4.}
PIXEL['column_wipe'] = 'uniform float cols;\n' + HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, n = max(1., floor(cols + .5)), i = min(floor(uv.x * n), n - 1.);
  float step_ = n > 1. ? .42 / (n - 1.) : 0.;
  float t = sway((p - i * step_) / .58);
  float edge = mix(-.01, 1.01, t), d = (uv.y - edge) / ratio * 1080.;
  float aa = 540. / resolution.x;
  vec3 a = getA(zoomAt(uv, 1. + .03 * ease(p), vec2(.5)));
  vec3 b = getB(zoomAt(uv, 1. + .04 * (1. - t), vec2(.5)) + vec2(0., .015 * (1. - t)));
  a *= 1. - .16 * fadeEnds(t, .1) * exp(-max(d, 0.) / 40.);
  vec3 col = rule(mix(b, a, smoothstep(-aa, aa, d)), d, fadeEnds(t, .1));
  float gx = abs(fract(uv.x * n + .5) - .5) / n * 1080.;                 // px to the nearest column line
  float gutter = step(.5 / n, uv.x) * step(uv.x, 1. - .5 / n) * (1. - smoothstep(1. - aa, 1. + aa, gx));
  return mix(col, mix(col, INK, .5), gutter * fadeEnds(p, .12) * .7);
}
'''

# A soft-edged circle opens from the face, a hairline on its rim, B settling inside it.
PIXEL['iris_soft'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, e = sway(p);
  float dist = length(vec2(uv.x - FACE.x, (uv.y - FACE.y) / ratio)), far = length(vec2(.5, (1. - FACE.y) / ratio));
  float r = mix(-.05, far + .05, e), d = (dist - r) * 1080.;
  vec3 a = getA(zoomAt(uv, 1. + .04 * e, FACE)), b = getB(zoomAt(uv, 1. + .07 * (1. - e), FACE));
  float on = fadeEnds(p, .1);
  a *= 1. - .18 * on * exp(-max(d, 0.) / 60.);
  vec3 col = mix(b, a, smoothstep(-22., 22., d));                       // a feathered rim
  return rule(col, d, on * .8);
}
'''

# The frame turns like a page: A curls round from the right edge toward the left, showing its stone-coloured back
# lit like paper, and B lies flat underneath with the page's shadow moving across it.
PAGE_FRAG = '''
uniform sampler2D texA; uniform sampler2D texB;
in vec2 v_uv; in vec2 v_local;
in float v_shade; in float v_glow; in float v_alpha; in float v_facing; in float v_mix; in float v_tint;
out vec4 fragColor;
void main() {
  vec3 c = mix(texture(texA, v_uv).bgr, texture(texB, v_uv).bgr, v_mix);
  if (v_facing < 0.) c = mix(STONE, vec3(luma(c)) * .5 + c * .5, .42);   // the back of the page: stone, the picture showing through
  fragColor = vec4(clamp(c * v_shade, 0., 1.).bgr, v_alpha);
}
'''
VERTEX['page_turn'] = dict(cols=1, rows=1, sub=(96, 1), layers=[(1, False), (0, True)], cull=False, frag=PAGE_FRAG, glsl='''
float sway(float x) { x = clamp(x, 0., 1.); return x < .5 ? 4. * x * x * x : 1. - pow(2. - 2. * x, 3.) * .5; }
void displace(inout V v) {
  float p = progress, e = ease(p) * .5 + p * .5, R = .3 * ratio;
  float xc = mix(ratio, -ratio - R * 1.25, e), d = v.pos.x - xc;         // the line where the page leaves the table
  float on = smoothstep(0., .1, p) * (1. - smoothstep(.85, 1., p));
  if (layer == 1) {                                                      // B: flat, in the page's shadow near the curl
    v.shade = 1. - .3 * on * step(0., d) * (1. - smoothstep(R * .7, R * 3.2, d));
    return;
  }
  if (d <= 0.) { v.shade = 1. - .12 * on * exp(d / (R * .8)); return; }  // still flat: a little shade toward the curl
  float th = d / R, lit;
  if (th < PI) {                                                         // on the curl
    v.pos.x = xc + R * sin(th); v.pos.z = R * (1. - cos(th)); v.nrm = vec3(-sin(th), 0., cos(th));
    lit = th < PI * .5 ? 1. - .26 * sin(th) : mix(.74, 1., smoothstep(PI * .5, PI, th));
  } else {                                                               // turned over, lying flat above
    v.pos.x = xc - (d - PI * R); v.pos.z = 2. * R; v.nrm = vec3(0., 0., -1.);
    lit = 1. - .1 * smoothstep(0., R * 4., d - PI * R);
  }
  v.shade = lit / mix(.4, 1., abs(v.nrm.z));                             // the engine shades by facing; this sets the paper's own light
}
''')
