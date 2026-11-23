// Shared plumbing for this theme's 3D scenes (not a piece itself: the underscore keeps it out of piece ids).
// The bundled Three.js is the core build with no post-processing, so the photocopy look is hand-written:
//   scene -> offscreen target (plain flat-shaded greys plus the theme's red)
//   post  -> xerox pass: hard contrast, a halftone dot screen in the mid-tones, toner grain, dust,
//            a hairline scratch and a little gate weave, all re-seeded from the boil step (8 fps).
// Scenes are drawn from time held on twos (12 fps) so they move like stop-motion. All textures are
// painted on canvases from seeded numbers. All original code.
import {C, F, hash, rng, hold, boil, jit} from '../../kit.js';
export {C, F, hash, rng, hold, boil, jit};

export const v3 = color => { const n = parseInt(color.slice(1), 16); return new window.THREE.Vector3((n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255); };
const glv = color => { const v = v3(color); return `vec3(${v.x.toFixed(4)},${v.y.toFixed(4)},${v.z.toFixed(4)})`; };

const GLSL = /* glsl */`
uniform float uTime, uStep;
const vec3 SOOT = ${glv(C.soot)}, BONE = ${glv(C.bone)}, RED = ${glv(C.red)}, LIME = ${glv(C.lime)};
float hash1(float n) { return fract(sin(n * 127.1 + 1.7) * 43758.5453); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(hash2(i), hash2(i + vec2(1., 0.)), f.x), mix(hash2(i + vec2(0., 1.)), hash2(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p) { return .55 * vnoise(p) + .28 * vnoise(p * 2.07 + 5.1) + .17 * vnoise(p * 4.3 + 11.7); }
`;
export const VERT = /* glsl */`varying vec3 vView, vObj; varying vec2 vUv;
void main() { vObj = position; vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.); vView = mv.xyz; gl_Position = projectionMatrix * mv; }`;
// Flat shading from screen-space derivatives: any geometry reads as creased, faceted paper.
const PAPER = /* glsl */`
uniform vec3 uColor, uLight; uniform float uAmb, uSmooth, uUseMap, uCut; uniform sampler2D tMap; varying vec3 vView, vObj; varying vec2 vUv;
void main() {
  vec3 n = normalize(cross(dFdx(vView), dFdy(vView)));
  float l = max(dot(n, normalize(uLight)), 0.);
  vec4 tex = uUseMap > .5 ? texture2D(tMap, vUv) : vec4(1.);
  if (tex.a < uCut) discard;
  gl_FragColor = vec4(uColor * tex.rgb * (uAmb + (1. - uAmb) * l), 1.);
}`;
const FLAT = /* glsl */`
uniform vec3 uColor; uniform float uUseMap, uCut; uniform sampler2D tMap; varying vec2 vUv;
void main() { vec4 tex = uUseMap > .5 ? texture2D(tMap, vUv) : vec4(1.); if (tex.a < uCut) discard; gl_FragColor = vec4(uColor * tex.rgb, 1.); }`;
const POST = /* glsl */`
uniform sampler2D tMap; uniform vec2 uRes; uniform float uDots, uGrain, uCells, uContrast; varying vec2 vUv;
void main() {
  vec2 weave = (vec2(hash1(uStep * 1.3), hash1(uStep * 2.1 + 7.)) - .5) * 3. / uRes;
  vec3 c = texture2D(tMap, vUv + weave).rgb;
  float l = dot(c, vec3(.299, .587, .114)), sat = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
  float tone = clamp((l - .5) * uContrast + .5, 0., 1.);
  // halftone screen at 32 degrees, sized from the frame height
  vec2 p = mat2(.848, -.53, .53, .848) * (gl_FragCoord.xy / uRes.y) * uCells;
  float d = length(fract(p) - .5), dot_ = smoothstep(.06, -.06, d - sqrt(tone) * .74);
  float mid = 1. - smoothstep(.3, .5, abs(tone - .5));          // dots show in the mid-tones, solids stay solid
  float v = mix(tone, dot_, uDots * mid);
  float g = hash2(floor(gl_FragCoord.xy / max(1., uRes.y / 520.)) + mod(uStep, 12.) * 17.3);
  v += (g - .5) * uGrain; v -= step(.985, g) * .5 * uGrain * 2.;    // toner dropout
  // slow uneven toner clouds
  v *= .86 + .22 * fbm(vUv * vec2(3., 5.) + 3.);
  vec3 col = mix(SOOT, BONE, clamp(v, 0., 1.));
  vec3 hue = c / max(max(c.r, max(c.g, c.b)), 1e-3);
  col = mix(col, hue * BONE * clamp(.35 + v * .8, 0., 1.), smoothstep(.22, .42, sat));          // the accent keeps its colour, worn the same way
  // dust and one scratch per step
  vec2 cell = floor(gl_FragCoord.xy / (uRes.y / 190.)); float sp = hash2(cell + mod(uStep, 6.) * 31.7);
  col = mix(col, BONE, step(.9985, sp) * .8);
  float sx = hash1(floor(uStep) * 3.7 + 2.), on = step(.45, hash1(uStep * 5.1));
  col = mix(col, BONE, on * .35 * step(abs(vUv.x - sx + .004 * sin(vUv.y * 40.)), .7 / uRes.x) * step(hash1(uStep + 9.) * .5, vUv.y));
  vec2 q = vUv - .5; col *= 1. - dot(q, q) * 1.15;
  gl_FragColor = vec4(col, 1.);
}`;

/**
 * A photocopy-shaded Three.js stage. Returns:
 *   T, scene, camera, U (shared uniforms uTime, uStep)
 *   paper(color, {map, amb, cut})   flat-shaded material; `map` a texture (alpha below `cut` is torn away)
 *   flat(color, {map})              unshaded colour
 *   shader(vs, fs, uniforms, opts)  ShaderMaterial with the shared GLSL (hash1, hash2, vnoise, fbm, colours)
 *   mesh(geometry, material, parent?)
 *   tex(draw, w, h)                 CanvasTexture you paint: draw(ctx, w, h)
 *   grainTex(color, seed, {dots})   a sheet of paper: tone, fibres, specks, optional halftone corner
 *   tornGeo(w, h, seed, amp)        a flat sheet with ragged torn edges (ShapeGeometry with 0..1 uvs)
 *   light                           Vector3 shared by every paper material (view space)
 *   play(draw)                      -> {seek}: draw(th, t, step) with th = time held on twos; renders; redraws on resize
 */
export function xeroxStage(el, {fov = 38, dots = .8, grain = .22, cells = 105, contrast = 1.35} = {}) {
  const T = window.THREE, renderer = new T.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
  renderer.outputColorSpace = T.LinearSRGBColorSpace; renderer.toneMapping = T.NoToneMapping; renderer.setClearColor(parseInt(C.soot.slice(1), 16), 1);
  el.append(renderer.domElement);
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(fov, 1, .1, 400), U = {uTime: {value: 0}, uStep: {value: 0}}, light = new T.Vector3(.45, .7, .6);
  const target = new T.WebGLRenderTarget(4, 4, {minFilter: T.LinearFilter, magFilter: T.LinearFilter, samples: 2});
  const QUAD_VS = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 1., 1.); }`;
  const post = new T.ShaderMaterial({uniforms: {tMap: {value: target.texture}, uRes: {value: new T.Vector2()}, uDots: {value: dots}, uGrain: {value: grain}, uCells: {value: cells}, uContrast: {value: contrast}, ...U}, vertexShader: QUAD_VS, fragmentShader: GLSL + POST, depthTest: false});
  const quad = new T.Mesh(new T.PlaneGeometry(2, 2), post); quad.frustumCulled = false;
  const quadScene = new T.Scene().add(quad), quadCamera = new T.Camera(), size = new T.Vector2(), disposables = [target];
  let redraw = null;
  const fit = () => { const w = el.clientWidth || 600, h = el.clientHeight || 600; renderer.setPixelRatio(Math.max(1, Math.min(2, 1100 / Math.max(w, h)))); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  fit();
  const render = () => {
    renderer.getDrawingBufferSize(size); if (target.width !== size.x || target.height !== size.y) target.setSize(size.x, size.y);
    post.uniforms.uRes.value.copy(size);
    renderer.setRenderTarget(target); renderer.clear(); renderer.render(scene, camera); renderer.setRenderTarget(null); renderer.render(quadScene, quadCamera);
  };
  const observer = new ResizeObserver(() => { fit(); redraw?.(); }); observer.observe(el);
  el.__dispose = () => { observer.disconnect(); disposables.forEach(d => d.dispose()); renderer.dispose(); renderer.forceContextLoss(); };

  const shader = (vs, fs, uniforms = {}, options = {}) => new T.ShaderMaterial({uniforms: {...uniforms, ...U}, vertexShader: vs, fragmentShader: GLSL + fs, side: T.DoubleSide, ...options});
  const paper = (color = C.bone, {map = null, amb = .32, cut = .5} = {}) => shader(VERT, PAPER, {uColor: {value: v3(C[color] ?? color)}, uLight: {value: light}, uAmb: {value: amb}, uUseMap: {value: map ? 1 : 0}, tMap: {value: map}, uCut: {value: map ? cut : 0}}, {extensions: {derivatives: true}});
  const flat = (color = C.bone, {map = null, cut = .5} = {}) => shader(VERT, FLAT, {uColor: {value: v3(C[color] ?? color)}, uUseMap: {value: map ? 1 : 0}, tMap: {value: map}, uCut: {value: map ? cut : 0}});
  const mesh = (geometry, material, parent = scene) => { const m = new T.Mesh(geometry, material); parent.add(m); return m; };
  const tex = (draw, w = 512, h = 512) => {
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h; draw(canvas.getContext('2d'), w, h);
    const t = new T.CanvasTexture(canvas); t.colorSpace = T.NoColorSpace; t.anisotropy = 4; disposables.push(t); return t;
  };
  /** Paint paper tone, fibres and specks over whatever is on the canvas. */
  const grime = (ctx, w, h, seed = 1, dark = false) => {
    const r = rng(seed * 3 + 1);
    for (let i = 0; i < 26; i++) { ctx.fillStyle = `rgba(${dark ? '255,250,235' : '0,0,0'},${r(.02, .07)})`; ctx.beginPath(); ctx.ellipse(r(0, w), r(0, h), r(w * .05, w * .3), r(h * .03, h * .16), r(0, 3), 0, 7); ctx.fill(); }
    for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(${r() < .5 ? '0,0,0' : '255,250,235'},${r(.08, .5)})`; const s = r() < .93 ? r(.6, 2) : r(2, 5); ctx.fillRect(r(0, w), r(0, h), s, s * r(.5, 1.6)); }
    ctx.strokeStyle = dark ? 'rgba(255,250,235,.22)' : 'rgba(0,0,0,.22)'; ctx.lineWidth = 1;
    for (let i = 0; i < 16; i++) { const x = r(0, w), y = r(0, h), a = r(0, 6.3), l = r(10, 70); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * l * .5 + r(-12, 12), y + Math.sin(a) * l * .5 + r(-12, 12), x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke(); }
  };
  const grainTex = (color = C.bone, seed = 1, {dots: halftone = false, size = 512} = {}) => tex((ctx, w, h) => {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
    if (halftone) { const r = rng(seed + 9), cell = w / 26; ctx.fillStyle = 'rgba(0,0,0,.6)'; for (let y = 0; y < h / cell; y++) for (let x = 0; x < w / cell; x++) { const q = Math.max(0, 1 - (x * cell + y * cell * .6) / (w * (1 + r(0, .1)))); if (q > .05) { ctx.beginPath(); ctx.arc((x + (y % 2) * .5) * cell, y * cell, cell * .5 * q, 0, 7); ctx.fill(); } } }
    grime(ctx, w, h, seed, false);
  }, size, size);
  const tornGeo = (w, h, seed = 1, amp = .06, step = .11) => {
    const s = new T.Shape(), c = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], pts = [];
    c.forEach((a, i) => { const b = c[(i + 1) % 4], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(len / step)), nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len;
      for (let k = 0; k < n; k++) { const q = k / n, o = ((hash(Math.floor(q * len / .45), seed + i * 7) - .5) * 1.3 + (hash(k, seed + i * 13 + 3) - .5)) * amp * (k ? 1 : .3); pts.push([a[0] + (b[0] - a[0]) * q + nx * o, a[1] + (b[1] - a[1]) * q + ny * o]); } });
    pts.forEach((p, i) => s[i ? 'lineTo' : 'moveTo'](p[0], p[1]));
    const geo = new T.ShapeGeometry(s), pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + .5, pos.getY(i) / h + .5);
    disposables.push(geo); return geo;
  };
  const play = draw => { let last = 0; const go = t => { const th = hold(t, 12), s = boil(t); U.uTime.value = th; U.uStep.value = s; draw(th, t, s); render(); }; redraw = () => go(last); return {seek(t) { last = t; go(t); }}; };
  return {T, renderer, scene, camera, U, light, post, paper, flat, shader, mesh, tex, grime, grainTex, tornGeo, play, disposables};
}
/** Lettering for canvas textures: font string for a role. */
export const font = (size, role = 'head') => ({head: `900 ${size}px Montserrat`, wide: `900 ${size}px Unbounded`, cond: `${size}px Anton`, type: `${size}px "Special Elite"`, hand: `${size}px "Permanent Marker"`}[role]);
