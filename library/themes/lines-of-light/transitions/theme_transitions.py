"""The Lines of Light theme's own shader transitions, and its colours for the shared ones.
Read by load_theme() in library/_shared/shader_transitions.py; that file explains the two shader families
and the helpers used here (ease, bell, luma, hash, hash2, vnoise, getA, getB, inside ...).

All original. The look: a dark room and thin lines of light that do the cutting. Every line has a white core,
a red echo on the side it came from, a blue echo on the side it is heading, and a lilac glow; light is added,
never painted. Red is the cause (the red dot that fires), blue the result arriving. Moves are slow eased
draw-ons that lock hard, with no bounce. Every transition is a pure function of the two frames and progress;
the only randomness is hash() of cell ids and seed.
"""
# Colours for the shared transitions (first two rows) and this theme's own names (theme.json / kit.js).
PALETTE = {
    'BG': '#040506', 'EDGE': '#cdb8ff', 'ACCENT': '#ff2e40', 'HEAT': '#ff821e', 'HOT': '#f5f3ff',
    'BACK': '#0b1617', 'GRID': '#1d3436', 'VIGNETTE': .7,                                     # mesh tiles: lilac rims of light on the dark teal room
    'CORE': '#f5f3ff', 'LILAC': '#f0d6f2', 'RED': '#ff2e40', 'BLUE': '#286eff', 'ORANGE': '#ff821e',
    'TEAL': '#081416', 'HAZE': '#1d3436',
}

HELPERS = '''
// The theme's draw-on: quartic ease-out, and its quartic in-out.
float out4(float x) { x = clamp(x, 0., 1.); return 1. - pow(1. - x, 4.); }
float io4(float x) { x = clamp(x, 0., 1.); return x < .5 ? 8. * x * x * x * x : 1. - pow(-2. * x + 2., 4.) / 2.; }
// A line of light seen across its width. d: signed distance from the line in pixels (negative = the side it
// came from, which carries the red echo; positive = the side it is heading, blue). px: core half-width.
vec3 beam(float d, float px) {
  float c = exp(-d * d / (px * px)), r = exp(-pow(d + 2.6 * px, 2.) / (px * px)), b = exp(-pow(d - 2.6 * px, 2.) / (px * px));
  float g = exp(-abs(d) / (px * 9.)), wide = exp(-abs(d) / (px * 40.));
  return CORE * c + RED * r * .95 + BLUE * b + LILAC * (g * .45 + wide * .08);
}
// The room the lines are drawn in: the picture dropped toward near-black teal.
vec3 room(vec3 c, float k) { return mix(c, c * .18 + TEAL + HAZE * .12, k); }
float px() { return max(1., resolution.y * .0016); }
'''
PIXEL = {}

# One line of light sweeps down the frame and B is behind it: red echo trailing above, blue leading below,
# a lilac wake on the new picture. Slow in, slow out, and it locks off the bottom edge.
PIXEL['light_wipe'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, y = mix(-.04, 1.04, io4(p)), gate = smoothstep(0., .06, p) * (1. - smoothstep(.94, 1., p));
  float d = (uv.y - y) * resolution.y;                       // > 0: below the line (not reached yet; uv.y runs down)
  vec3 col = d < 0. ? getB(uv) : room(getA(uv), .25 * gate * exp(-d / (resolution.y * .2)));
  col += LILAC * .16 * exp(d / (resolution.y * .05)) * step(d, 0.) * gate;
  return col + beam(d, px()) * gate;
}
'''

# The red dot top-left fires: a ring of light opens from it across the frame with B inside, red on its
# outer edge (the cause pushing out), blue inside (the result). The dot fades once the ring has left it.
PIXEL['origin_iris'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress; vec2 o = vec2(.11, .08);
  float r = length((uv - o) * vec2(ratio, 1.)), far = length(vec2(ratio * .89, .92)) + .05;
  float R = far * io4((p - .12) / .88), gate = 1. - smoothstep(.93, 1., p);
  float d = (r - R) * resolution.y;                          // < 0 inside the ring
  vec3 col = d < 0. ? getB(uv) : room(getA(uv), .35 * smoothstep(0., .3, p));
  col += beam(-d, px() * 1.2) * step(.005, R) * gate;        // red outside, blue inside
  float dot_ = smoothstep(0., .1, p) * (1. - smoothstep(.3, .55, p));
  float rd = r * resolution.y / (px() * 8.);
  return col + (RED * exp(-rd * rd) * 1.4 + RED * exp(-rd * .35) * .5 + CORE * exp(-rd * rd * 9.)) * dot_;
}
'''

# A sunburst: thin rays of light shoot out of the middle one after another, then each widens into a
# wedge of B with its edges lit, until the wedges meet. A sinks into the dark room behind them.
PIXEL['ray_burst'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, n = 16.;
  vec2 q = (uv - vec2(.5, .52)) * vec2(ratio, 1.);
  float r = length(q), a = atan(q.y, q.x) / (2. * PI) + .5;
  float k = a * n, id = floor(k), f = abs(fract(k) - .5);
  float delay = hash(vec2(id, 3.)) * .22, u = clamp((p - delay) / .7, 0., 1.);
  float L = out4(u * 1.8) * 1.25, w = io4((u - .35) / .65) * .5;
  float arc = 2. * PI * r / n, edge = (f - w) * arc * resolution.y;   // < 0 inside the wedge
  bool reached = r < L;
  vec3 col = (reached && (f < w || w > .499)) ? getB(uv) : room(getA(uv), .55 * smoothstep(0., .45, p));
  float gate = (1. - smoothstep(.85, 1., p)) * step(r, L) * smoothstep(0., .05, r);
  col += beam(edge, px() * .5) * .26 * gate * (1. - smoothstep(.45, .5, w));
  float c = r * resolution.y / (px() * 14.);
  return col + (CORE * exp(-c * c) + LILAC * exp(-c * 1.5) * .2) * bell(p) * .8;
}
'''

# B is drawn in by lines: the frame is cut into rows, and in each a light travels left to right with the new
# picture appearing behind it, top row first, the rows overlapping like a fast pen.
PIXEL['scan_draw'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, N = 36., row = floor(uv.y * N), cy = (row + .5) / N;
  float t0 = row / N * .55 + hash(vec2(row, 7.)) * .06, head = io4((p - t0) / .4) * 1.06 - .03;
  float behind = head - uv.x;                                  // > 0: drawn already
  vec3 col = behind > 0. ? getB(uv) : room(getA(uv), .5 * smoothstep(0., .5, p));
  float live = step(.001, head) * (1. - step(1.02, head));
  float dy = (uv.y - cy) * resolution.y;
  float tail = exp(-max(behind, 0.) * 7.) * step(0., behind);
  col += beam(dy, px() * .8) * tail * live * .9;
  float hd = length(vec2((uv.x - head) * ratio, uv.y - cy)) * resolution.y / (px() * 4.);
  return col + (CORE * exp(-hd * hd) + LILAC * exp(-hd) * .3) * live;
}
'''

# Cause, then result: A burns red from the edges in (the red pulse), cuts hard to B on a blue flash, and B
# cools from cold blue-white to itself. The red and blue sit a few pixels apart, as the style's echoes do.
PIXEL['red_blue_cut'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress;
  vec2 c = (uv - .5) * vec2(ratio, 1.);
  float edge = smoothstep(.2, .8, length(c) * 1.3);
  if (p < .5) {
    float k = ease(p * 2.);
    vec3 a = room(getA(uv), .5 * k);
    return a + RED * (edge * .45) * k * k + RED * exp(-abs(c.y) * 90.) * k * .5;
  }
  float k = 1. - out4((p - .5) * 2.), s = .012 * k;
  vec3 b = vec3(getB(uv + vec2(s, 0.)).r, getB(uv).g, getB(uv - vec2(s, 0.)).b);
  b = mix(b, luma(b) * mix(BLUE, CORE, .5) * 1.3, .55 * k);
  return b + BLUE * (1. - edge * .6) * k * k * .9;
}
'''

# A pulls apart into its red and blue echoes and drops into the dark; B arrives the same way from the
# other side, wide apart, and the echoes slide together and lock hard on the white core.
PIXEL['echo_split'] = HELPERS + '''
vec3 echoes(bool first, vec2 uv, float s) {        // red pulled one way, blue the other, the core (green) stays
  vec2 o = vec2(s, s * .25);
  return first ? vec3(getA(uv + o).r, getA(uv).g, getA(uv - o).b) : vec3(getB(uv + o).r, getB(uv).g, getB(uv - o).b);
}
vec3 transition(vec2 uv) {
  float p = progress;
  if (p < .5) { float k = ease(p * 2.); return room(echoes(true, uv, .06 * k * k), .8 * k); }
  float k = 1. - out4((p - .5) * 2.);
  return room(echoes(false, uv, .07 * k), .8 * k * k);
}
'''

# A horizon: one line of light draws out from the middle across A, A dims, then the line splits in two and
# the halves travel apart, opening B between them like an eye; the lines lock off the edges.
PIXEL['horizon_open'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, y0 = .5;
  float draw = out4(p / .38), open = io4((p - .34) / .66) * .56;
  float dx = abs(uv.x - .5) * ratio, reach = draw * ratio * .55;
  float gap = abs(uv.y - y0) - open;                            // < 0 inside the opening
  vec3 col = gap < 0. && open > .001 ? getB(uv) : room(getA(uv), .55 * smoothstep(0., .35, p));
  float gate = 1. - smoothstep(.9, 1., p), along = 1. - smoothstep(reach - .02, reach, dx);
  float d = gap * resolution.y;
  col += beam(-d, px()) * along * gate;                         // blue toward the new picture, red outward
  return col + LILAC * .1 * exp(-abs(d) / (resolution.y * .03)) * along * gate;
}
'''
