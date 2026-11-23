"""The horror theme's own shader transitions, and its colours for the shared ones.
Read by load_theme() in library/_shared/shader_transitions.py; that file explains the two shader families
and the helpers used here (ease, bell, luma, hash, hash2, vnoise, getA, getB, inside ...).

All original. The look: darkness, a failing lamp, cold tones, tape noise. Things creep or they cut.
Atmosphere only. Every transition is a pure function of the two frames and progress; the only randomness
is hash() of cell ids and seed.
"""
# Colours for the shared transitions (first two rows) and this theme's own names (from kit.js).
PALETTE = {
    'BG': '#030405', 'EDGE': '#8d979f', 'ACCENT': '#7c8cc4', 'HEAT': '#7c8cc4', 'HOT': '#e9e6df',
    'BACK': '#0d1115', 'GRID': '#000000',                                                    # mesh tiles: a faint fog-grey rim, slate backs, on the void
    'VOID': '#030405', 'SLATE': '#0d1115', 'FOG': '#8d979f', 'BONE': '#e9e6df', 'COLD': '#7c8cc4',
}

HELPERS = '''
float fbm(vec2 p) { float s = 0., a = .5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.3; a *= .5; } return s / .9375; }
vec3 chill(vec3 c, float k) { return mix(c, luma(c) * mix(COLD, BONE, .35) * 1.2, k); }      // drained and cold
'''
PIXEL = {}

# The light flickers between the two shots: full, half, out. It is out altogether for a beat in
# the middle, and B wins more of the flickers as it goes on.
PIXEL['flicker_cut'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, tick = floor(p * 16.), h = hash(vec2(tick, 1.)), h2 = hash(vec2(tick, 2.));
  float gate = smoothstep(0., .1, p) * (1. - smoothstep(.9, 1., p));
  float level = mix(1., h2 < .3 ? .03 : h2 < .6 ? .55 : 1., gate);
  if (abs(p - .5) < .07) level = .02;
  vec3 src = h < smoothstep(.15, .85, p) ? getB(uv) : getA(uv);
  return VOID * (1. - level) + chill(src, .6 * (1. - level)) * level;
}
'''

# A drops quickly into black, the black holds, and B comes up slowly: the vignette opens from the
# middle and the shadows are the last thing to arrive.
PIXEL['black_dip'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, r = length((uv - vec2(.5, .45)) * vec2(ratio, 1.));
  if (p < .5) { float k = 1. - smoothstep(0., .24, p); return mix(VOID, chill(getA(uv), 1. - k), k * k); }
  float u = clamp((p - .42) / .58, 0., 1.), k = u * u * (3. - 2. * u);
  vec3 b = chill(pow(getB(uv), vec3(1. + 1.6 * (1. - k))), .7 * (1. - k));
  return mix(VOID, b, k * (1. - (1. - k) * smoothstep(.05, .5, r)));
}
'''

# A comes apart into vertical streaks: every column smears up or down by its own length, thins
# and goes out. B assembles the same way in reverse.
PIXEL['streak_smear'] = HELPERS + '''
vec3 streaks(bool first, vec2 uv, float t) {                               // t: 0 = the picture, 1 = gone
  float h = hash(vec2(floor(uv.x * 135.), 1.)), h2 = hash(vec2(floor(uv.x * 30.), 2.)), h3 = hash(vec2(floor(uv.x * 135.), 3.));
  float len = t * t * (.15 + 1.3 * h * h2), lean = (h3 - .5) * .7, jitter = hash(uv * resolution);
  vec3 col = vec3(0.);
  for (int i = 0; i < 14; i++) {
    vec2 q = vec2(uv.x, uv.y + ((float(i) + jitter) / 14. - .5 + lean) * len);
    col += first ? getA(q) : getB(q);
  }
  float alive = smoothstep(t * t * 1.2 - .1, t * t * 1.2, h * .6 + h2 * .35 + .12);
  return mix(VOID, chill(col / 14., t * .8) * (1. - .4 * t), alive);
}
vec3 transition(vec2 uv) { return progress < .5 ? streaks(true, uv, ease(progress * 2.)) : streaks(false, uv, ease((1. - progress) * 2.)); }
'''

# The signal goes: rows tear sideways, the colour drops out, grey static takes the frame while a
# dark bar rolls through it, and B locks in from the noise.
PIXEL['signal_loss'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, env = bell(p), tick = floor(p * 24.);
  float row = floor(uv.y * 160.), band = floor(uv.y * 14. + hash(vec2(tick, 8.)) * 3.);
  float tear = (hash(vec2(band, tick)) - .5) * step(.55, hash(vec2(tick + 9., band))) * .3 * env * env;
  vec2 q = vec2(uv.x + tear + (hash(vec2(row, tick + 3.)) - .5) * .025 * env, uv.y);
  vec3 src = chill(p > .5 ? getB(q) : getA(q), env);
  float n = hash(floor(uv * resolution / max(1., resolution.x / 270.)) + tick * 71.);
  float snow = max(smoothstep(.2, .46, p) * (1. - smoothstep(.54, .8, p)), step(.7, hash(vec2(tick, 5.))) * env * .5);
  vec3 col = mix(src, mix(SLATE, BONE, n * n) * (.55 + .45 * hash(vec2(row, tick))), snow);
  col *= 1. - .8 * env * smoothstep(.1, 0., abs(fract(uv.y - p * 2.3) - .5));
  return col * (1. - .25 * env * mod(row, 2.));
}
'''

# The lamp fails: the light sputters and shrinks to a pool under the lamp, goes out, and after a
# beat of dark strikes again, unsteadily, on B.
PIXEL['lamp_out'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, tick = floor(p * 20.), gate = smoothstep(0., .06, p) * (1. - smoothstep(.94, 1., p));
  float r = length((uv - vec2(.5, .3)) * vec2(ratio, 1.));
  float power = p < .5 ? 1. - smoothstep(.16, .44, p) : smoothstep(.58, .9, p);
  power *= mix(1., hash(vec2(tick, 3.)) < .12 + .5 * (1. - power) ? .15 : 1., gate);
  if (abs(p - .5) < .06) power = 0.;
  float light = pow(power, .7) * mix(exp(-r * r * 14.), 1., power * power);
  return mix(VOID, chill(p < .5 ? getA(uv) : getB(uv), .7 * (1. - power)), light);
}
'''

# A slow melt: the picture sags and swims as if seen through cold water, drains to blue-grey,
# and becomes B through a drifting mist; B then settles.
PIXEL['cold_melt'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress, env = bell(p);
  vec2 s = vec2(uv.x * ratio, uv.y);
  vec2 warp = vec2(fbm(s * 2.4 + vec2(0., p * .7)) - .5, fbm(s * 2.4 + 30. - vec2(0., p * .7)) - .5);
  vec2 q = uv + warp * .24 * env - vec2(0., fbm(vec2(uv.x * 8., 4.)) * .22 * env * env);
  float m = smoothstep(-.14, .14, (p - .5) * 1.5 + (fbm(s * 2.8 + 11.) - .5) * .9 * env);
  vec3 col = chill(mix(getA(q), getB(q), m), env * .8);
  return mix(col, VOID, .4 * env) + COLD * .06 * env * fbm(s * 5. + p);
}
'''

# Shadow creeps over the frame from the top corner in soft, uneven fingers and swallows A;
# B comes out of the dark some way behind its edge.
PIXEL['shadow_creep'] = HELPERS + '''
vec3 transition(vec2 uv) {
  float p = progress;
  vec2 s = vec2(uv.x * ratio, uv.y);
  float n = fbm(s * 2.2 + 3.) * .5 + fbm(vec2(s.x * 11., s.y * 1.1) + 8.) * .25;
  float f = mix(-.35, 2.4, p) - (uv.y * .7 + (1. - uv.x) * .3) - n * .6;   // > 0: the shadow has reached here
  vec3 col = mix(chill(getA(uv), smoothstep(-.3, 0., f) * .6), VOID, smoothstep(0., .3, f));
  float out_ = smoothstep(0., .4, f - .55);
  return mix(col, chill(getB(uv), .6 * (1. - out_)), out_);
}
'''
