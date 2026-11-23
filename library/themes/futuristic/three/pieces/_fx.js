// Shared plumbing for the shader scenes in this folder (not a piece itself: the underscore keeps it
// out of piece ids). It wraps kit.js threeStage with a hand-written glow pass, since the bundled
// Three.js is the core build with no EffectComposer:
//   scene -> full-size target -> two blurred copies (1/2 and 1/8 size) -> composite to the canvas
// and offers the GLSL every scene shares: theme colours, hashes, gradient noise, a soft point sprite.
// All original code.
import {threeStage, hex} from '/library/_shared/kit.js';
import {C, F} from '../../hud.js';

const v3 = color => { const n = hex(color); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
const glv = color => `vec3(${v3(color).map(x => x.toFixed(4)).join(',')})`;

/** Seeded 0..1 hash for building geometry (never Math.random: pieces must be repeatable). */
export const rand = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Prepended to every shader made with stage.mat(). */
export const GLSL = /* glsl */`
uniform float uTime;   // seconds, set by seek
uniform float uPx;     // gl_PointSize = worldSize * uPx / -viewPosition.z
const vec3 CYAN = ${glv(C.cyan)}, TEAL = ${glv(C.teal)}, MAGENTA = ${glv(C.magenta)}, AMBER = ${glv(C.amber)}, WHITE = ${glv(C.white)}, RED = ${glv(C.red)};
const float PI = 3.14159265, TAU = 6.2831853;
float hash(float n) { return fract(sin(n * 127.1 + 1.7) * 43758.5453); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 hash3(vec3 p) { p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6))); return fract(sin(p) * 43758.5453) * 2. - 1.; }
// Gradient noise, roughly -1..1.
float noise(vec3 p) {
  vec3 i = floor(p), f = fract(p), u = f * f * f * (f * (f * 6. - 15.) + 10.);
  return 1.7 * mix(mix(mix(dot(hash3(i), f), dot(hash3(i + vec3(1, 0, 0)), f - vec3(1, 0, 0)), u.x),
                 mix(dot(hash3(i + vec3(0, 1, 0)), f - vec3(0, 1, 0)), dot(hash3(i + vec3(1, 1, 0)), f - vec3(1, 1, 0)), u.x), u.y),
             mix(mix(dot(hash3(i + vec3(0, 0, 1)), f - vec3(0, 0, 1)), dot(hash3(i + vec3(1, 0, 1)), f - vec3(1, 0, 1)), u.x),
                 mix(dot(hash3(i + vec3(0, 1, 1)), f - vec3(0, 1, 1)), dot(hash3(i + vec3(1, 1, 1)), f - vec3(1, 1, 1)), u.x), u.y), u.z);
}
float fbm(vec3 p) { return .6 * noise(p) + .3 * noise(p * 2.03 + 7.1) + .15 * noise(p * 4.01 + 13.7); }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
// Round point with a hot centre and a soft skirt. Pass gl_PointCoord.
float sprite(vec2 pc) { float d = clamp(length(pc - .5) * 2., 0., 1.); float s = 1. - d; return s * s * .7 + smoothstep(.45, 0., d); }
`;

const QUAD_VS = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
const BLUR_FS = `
uniform sampler2D tMap; uniform vec2 uStep; varying vec2 vUv;
void main() {
  vec3 c = texture2D(tMap, vUv).rgb * .227;
  c += (texture2D(tMap, vUv + uStep * 1.385).rgb + texture2D(tMap, vUv - uStep * 1.385).rgb) * .316;
  c += (texture2D(tMap, vUv + uStep * 3.231).rgb + texture2D(tMap, vUv - uStep * 3.231).rgb) * .0703;
  gl_FragColor = vec4(c, 1.);
}`;
const FINAL_FS = `
uniform sampler2D tBase, tNear, tWide; uniform vec3 uBg; uniform float uGlow, uFringe; varying vec2 vUv;
void main() {
  vec2 c = vUv - .5; float r2 = dot(c, c);
  vec2 o = c * r2 * uFringe;                                   // colour fringing that grows toward the corners
  vec3 base = vec3(texture2D(tBase, vUv + o).r, texture2D(tBase, vUv).g, texture2D(tBase, vUv - o).b);
  vec3 glow = texture2D(tNear, vUv).rgb * .85 + texture2D(tWide, vUv).rgb * 1.15;
  vec3 col = 1. - exp(-(base + glow * uGlow) * 1.35);          // soft shoulder: bright cores burn toward white
  col += uBg * (1.5 - 2.2 * r2) * (1. - max(col.r, max(col.g, col.b)));
  col *= 1. - .5 * r2;
  gl_FragColor = vec4(col, 1.);
}`;

/**
 * A threeStage with glow. Returns everything threeStage does, plus:
 *   mat(vertex, fragment, uniforms?, options?)  additive ShaderMaterial with the shared GLSL and uniforms
 *   solid(vertex, fragment, uniforms?)          the same, but opaque and depth-tested (for black-filled shapes)
 *   aspect(), fit(radius)                       camera distance at which a sphere of that radius fits the frame
 *   fitBox(halfWidth, halfHeight)               camera distance at which a box of that size fits the frame
 *   dust({count, box, size, loop})              a drifting field of soft out-of-focus motes, for depth behind or in front of the subject
 *   label(text, {size, color, font, anchor})    billboard text (canvas texture); .set(text) rewrites it, .show(0..1) fades it
 *   play(draw)                                  -> {seek}: sets uTime, calls draw(t), renders; redraws on resize
 */
export function glowStage(el, {fov = 40, z = 10, glow = 1, fringe = .035} = {}) {
  const stage = threeStage(el, {fov, z, background: C.bg}), {T, renderer, scene, camera} = stage;
  renderer.setClearColor(0x000000, 1);   // the background colour is added in the composite, so glow stays clean
  const U = {uTime: {value: 0}, uPx: {value: 500}};
  const target = (samples = 0) => new T.WebGLRenderTarget(4, 4, {samples, depthBuffer: samples > 0, minFilter: T.LinearFilter, magFilter: T.LinearFilter});
  const full = target(4), half = [target(), target()], eighth = [target(), target()];
  const quad = new T.Mesh(new T.PlaneGeometry(2, 2)); quad.frustumCulled = false;
  const quadScene = new T.Scene().add(quad), quadCamera = new T.Camera();
  const blur = new T.ShaderMaterial({uniforms: {tMap: {value: null}, uStep: {value: new T.Vector2()}}, vertexShader: QUAD_VS, fragmentShader: BLUR_FS, depthTest: false});
  const final = new T.ShaderMaterial({uniforms: {tBase: {value: full.texture}, tNear: {value: half[1].texture}, tWide: {value: eighth[1].texture}, uBg: {value: new T.Vector3(...v3(C.bg))}, uGlow: {value: glow}, uFringe: {value: fringe}}, vertexShader: QUAD_VS, fragmentShader: FINAL_FS, depthTest: false});
  const size = new T.Vector2(); let w = 0, h = 0;
  const pass = (from, to, dx, dy) => { blur.uniforms.tMap.value = from.texture; blur.uniforms.uStep.value.set(dx / to.width, dy / to.height); quad.material = blur; renderer.setRenderTarget(to); renderer.render(quadScene, quadCamera); };
  const render = () => {
    renderer.getDrawingBufferSize(size);
    if (size.x !== w || size.y !== h) {
      w = size.x; h = size.y; full.setSize(w, h);
      half.forEach(t => t.setSize(Math.max(2, w >> 1), Math.max(2, h >> 1))); eighth.forEach(t => t.setSize(Math.max(2, w >> 3), Math.max(2, h >> 3)));
    }
    U.uPx.value = h / (2 * Math.tan(camera.fov * Math.PI / 360));
    renderer.setRenderTarget(full); renderer.clear(); renderer.render(scene, camera);
    pass(full, half[0], 1, 0); pass(half[0], half[1], 0, 1); pass(half[1], eighth[0], 1, 0); pass(eighth[0], eighth[1], 0, 1);
    quad.material = final; renderer.setRenderTarget(null); renderer.render(quadScene, quadCamera);
  };
  const make = (vertexShader, fragmentShader, uniforms, options) => new T.ShaderMaterial({uniforms: {...uniforms, ...U}, vertexShader: GLSL + vertexShader, fragmentShader: GLSL + fragmentShader, ...options});
  const mat = (vs, fs, uniforms = {}, options = {}) => make(vs, fs, uniforms, {transparent: true, blending: T.AdditiveBlending, depthWrite: false, depthTest: false, ...options});
  const solid = (vs, fs, uniforms = {}, options = {}) => make(vs, fs, uniforms, options);
  const aspect = () => camera.aspect;
  const fit = (radius, margin = 1.08) => radius * margin / Math.sin(Math.atan(Math.tan(camera.fov * Math.PI / 360) * Math.min(1, camera.aspect)));
  const fitBox = (halfW, halfH) => Math.max(halfH, halfW / camera.aspect) / Math.tan(camera.fov * Math.PI / 360);
  let redraw = null;
  const observer = new ResizeObserver(() => redraw?.()); observer.observe(el);
  const dispose = el.__dispose;
  el.__dispose = () => { observer.disconnect(); [full, ...half, ...eighth].forEach(t => t.dispose()); dispose(); };
  const play = draw => { let last = 0; redraw = () => { draw(last); render(); }; return {seek(t) { last = t; U.uTime.value = t; draw(t); render(); }}; };
  /** BufferGeometry from {name: [array, itemSize]}. */
  const geo = attributes => { const g = new T.BufferGeometry(); for (const [name, [array, n]] of Object.entries(attributes)) g.setAttribute(name, new T.Float32BufferAttribute(array, n)); return g; };
  /** Motes scattered through a box around `center`. With `loop` (seconds) their drift repeats exactly. */
  const dust = ({count = 260, box = [18, 18, 10], center = [0, 0, 0], size = .07, loop = 0, bright = 1} = {}) => {
    const p = [], s = [];
    for (let i = 0; i < count; i++) { p.push(center[0] + (rand(i + .13) - .5) * box[0], center[1] + (rand(i + 811.7) - .5) * box[1], center[2] + (rand(i + 1723.3) - .5) * box[2]); s.push(rand(i + 2999.1)); }
    const points = new T.Points(geo({position: [p, 3], aSeed: [s, 1]}), mat(`
      attribute float aSeed; varying vec3 vCol; varying float vA, vSoft;
      void main() { float w = ${loop ? (6.2831853 / loop).toFixed(5) : '.35'}, k = 1. + floor(aSeed * 2.99);
        vec3 p = position + vec3(sin(uTime * w * k + aSeed * 40.), cos(uTime * w + aSeed * 23.), sin(uTime * w * k + aSeed * 71.)) * (.35 + aSeed * .5);
        vec4 mv = modelViewMatrix * vec4(p, 1.); vSoft = step(.72, aSeed);                 // some motes are big soft discs, like points out of focus
        vCol = hash(aSeed * 13.) > .86 ? MAGENTA : hash(aSeed * 29.) > .9 ? AMBER : CYAN;
        vA = mix(.5, .1, vSoft) * (.5 + .5 * sin(uTime * w * k + aSeed * 90.)) * ${bright.toFixed(3)};
        gl_PointSize = ${size.toFixed(4)} * mix(.6 + aSeed, 4. + aSeed * 5., vSoft) * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`, `
      varying vec3 vCol; varying float vA, vSoft;
      void main() { float d = length(gl_PointCoord - .5) * 2.; gl_FragColor = vec4(vCol * mix(sprite(gl_PointCoord), smoothstep(1., .8, d) * (.6 + .4 * d), vSoft) * vA, 1.); }`));
    points.frustumCulled = false; scene.add(points); return points;
  };
  /** Text that always faces the camera. size is its height in world units; anchor -1 left, 0 centre, 1 right of its position. */
  const label = (text, {size = .4, color = C.white, font = F.mono, weight = 400, anchor = 0} = {}) => {
    const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d'), texture = new T.CanvasTexture(canvas);
    texture.minFilter = T.LinearFilter; texture.generateMipmaps = false;
    const uniforms = {tMap: {value: texture}, uSize: {value: new T.Vector2(1, size)}, uAnchor: {value: anchor}, uCol: {value: new T.Vector3(...v3(color))}, uA: {value: 1}};
    const mesh = new T.Mesh(new T.PlaneGeometry(1, 1), mat(`uniform vec2 uSize; uniform float uAnchor; varying vec2 vUv;
      void main() { vUv = uv; vec4 mv = modelViewMatrix * vec4(0., 0., 0., 1.); mv.xy += (position.xy - vec2(uAnchor * .5, 0.)) * uSize; gl_Position = projectionMatrix * mv; }`,
      `uniform sampler2D tMap; uniform vec3 uCol; uniform float uA; varying vec2 vUv; void main() { gl_FragColor = vec4(uCol * texture2D(tMap, vUv).r * uA, 1.); }`, uniforms));
    mesh.frustumCulled = false; mesh.renderOrder = 10;
    let shown = null;
    mesh.set = value => { value = String(value); if (value === shown) return mesh; shown = value;
      const px = 72, face = `${weight} ${px}px ${font}`; ctx.font = face;
      canvas.width = Math.max(8, Math.ceil(ctx.measureText(value).width) + 24); canvas.height = Math.round(px * 1.5);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.font = face; ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(value, 12, canvas.height / 2 + 2);
      uniforms.uSize.value.set(size * 1.5 * canvas.width / canvas.height, size * 1.5); texture.needsUpdate = true; return mesh; };
    mesh.show = a => { uniforms.uA.value = a; mesh.visible = a > .003; return mesh; };
    return mesh.set(text);
  };
  return {...stage, render, mat, solid, aspect, fit, fitBox, play, geo, dust, label, U};
}
