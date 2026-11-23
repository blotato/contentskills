// Shared plumbing for the 3D scenes in this folder (not a piece itself: the underscore keeps it
// out of piece ids). It turns the bundled Three.js core into a printed comic rather than lit 3D:
//   - toonStage: threeStage with tone mapping off (flat colours stay true), a printed backdrop
//     (flat colour, Ben-Day dots growing toward a corner, optional zoom lines) and an inked panel
//     border with a paper gutter, all drawn in screen space;
//   - toon(): a material with two hard tones, the shadow tone printed as halftone dots on a
//     45 degree screen in screen space;
//   - flat(): a flat colour; ink(): a thick black outline (inverted hull); shapes for bursts,
//     sparks and stars; label(): lettering drawn on a canvas texture in the theme fonts.
// All original code. Everything is a pure function of the time passed to seek.
import {threeStage, hex} from '/library/_shared/kit.js';
import {C, F} from '../../kit.js';
export {C, F, hex};

/** Seeded 0..1 hash for building geometry (never Math.random: pieces must be repeatable). */
export const rand = (s, seed = 0) => { const x = Math.sin(s * 127.1 + seed * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); };
export const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
export const span = (t, start, length) => clamp((t - start) / length);
/** The theme's pop: overshoots 1 and rings briefly before settling. */
export const spring = x => { x = clamp(x); return x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(10 * x); };
export const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
/** A value held between redraws, a few times a second: the "boil" of a hand-inked line. */
export const boil = (t, fps = 7) => Math.floor(t * fps);
/** A theme colour as raw sRGB floats for a shader (no colour management: what you give is what prints). */
export const v3 = color => { const n = hex(color); return new window.THREE.Vector3((n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255); };

const DOTS = /* glsl */`
uniform vec2 uRes;
// Coverage of a Ben-Day dot screen at this pixel: amount 0 (no ink) .. 1 (solid). pitch in dots across the frame height.
float dots(vec2 frag, float pitch, float amount) {
  float size = uRes.y / pitch;
  vec2 p = mat2(.7071, -.7071, .7071, .7071) * frag / size;
  float r = sqrt(clamp(amount, 0., 1.)) * .74, aa = 1.2 / size;
  return amount <= .001 ? 0. : smoothstep(r + aa, r - aa, length(fract(p) - .5));
}`;

const BACK_FS = /* glsl */`
${DOTS}
uniform vec3 uBg, uDot, uRay; uniform vec2 uFrom, uCentre; uniform float uReach, uRays, uTurn, uPitch, uHole;
float hash(float n) { return fract(sin(n * 127.1 + 1.7) * 43758.5453); }
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 col = uBg;
  if (uRays > 0.) {                                            // zoom lines: ragged wedges pointing at the centre
    vec2 d = (uv - uCentre) * vec2(uRes.x / uRes.y, 1.); float a = atan(d.y, d.x) + uTurn, r = length(d);
    float n = uRays, k = a / 6.2831853 * n, i = floor(k), f = fract(k) - .5;
    float w = .12 + hash(i) * .3, tip = uHole * (1. + hash(i + 40.) * .6);
    float wedge = smoothstep(w * clamp((r - tip) / .5, 0., 1.), w * clamp((r - tip) / .5, 0., 1.) - .04, abs(f)) * step(tip, r);
    col = mix(col, uRay, wedge);
  }
  float g = 1. - distance(uv, uFrom) / uReach;                 // dots largest in one corner
  col = mix(col, uDot, dots(gl_FragCoord.xy, uPitch, g * .62));
  vec2 c = uv - .5; col *= 1. - .42 * smoothstep(.3, .78, length(c));   // darkened panel edges
  gl_FragColor = vec4(col, 1.);
}`;
const FRAME_FS = /* glsl */`
uniform vec2 uRes; uniform vec3 uGutter, uInk; uniform float uMargin, uLine;
void main() {
  vec2 p = gl_FragCoord.xy; float m = uMargin * uRes.x, l = uLine * uRes.x;
  // The box is not quite square: each edge is tilted a touch.
  float left = p.x - m - (p.y / uRes.y - .5) * m * .28, right = uRes.x - p.x - m + (p.y / uRes.y - .5) * m * .22;
  float bottom = p.y - m + (p.x / uRes.x - .5) * m * .26, top = uRes.y - p.y - m - (p.x / uRes.x - .5) * m * .2;
  float e = min(min(left, right), min(bottom, top));
  if (e > l) discard;
  gl_FragColor = vec4(e > 0. ? uInk : uGutter, 1.);
}`;
const QUAD_VS = `void main() { gl_Position = vec4(position.xy, 1., 1.); }`;

/**
 * A stage that prints. Options:
 *   background, dots  - panel colour and the colour of its Ben-Day dots (dots: null for none)
 *   from [x, y]       - the corner the dots grow toward (0..1, y up); reach - how far they carry
 *   rays, ray         - number of zoom lines (0 for none) and their colour; centre [x, y]; hole - clear radius
 *   frame             - 'under' (objects may break the border), 'over' (everything stays inside), or false
 * Returns threeStage's handles plus {uniforms, back, toon, flat, ink, setTime}.
 */
export function toonStage(el, {background = C.yellow, dots = C.orange, from = [1, 0], reach = .95, rays = 0, ray = C.white, centre = [.5, .5], hole = .22, pitch = 46, frame = 'under', fov = 35, z = 10} = {}) {
  const stage = threeStage(el, {fov, z, background}), {T, scene, renderer} = stage;
  renderer.toneMapping = T.NoToneMapping;
  const uniforms = {uRes: {value: new T.Vector2(600, 600)}};
  // In a tall frame objects pull back so they still fit the width (backdrops keep filling it).
  scene.onBeforeRender = (r, sc, camera) => { r.getDrawingBufferSize(uniforms.uRes.value); const zoom = frame === 'over' ? 1 : Math.min(1, camera.aspect * 1.2); if (camera.zoom !== zoom) { camera.zoom = zoom; camera.updateProjectionMatrix(); } };
  const quad = (fs, extra, order) => {
    const mesh = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({vertexShader: QUAD_VS, fragmentShader: fs, uniforms: {...uniforms, ...extra}, depthTest: false, depthWrite: false}));
    mesh.frustumCulled = false; mesh.renderOrder = order; scene.add(mesh); return mesh;
  };
  const back = quad(BACK_FS, {uBg: {value: v3(background)}, uDot: {value: v3(dots ?? background)}, uRay: {value: v3(ray)}, uFrom: {value: new T.Vector2(...from)}, uCentre: {value: new T.Vector2(...centre)},
    uReach: {value: dots ? reach : .0001}, uRays: {value: rays}, uTurn: {value: 0}, uPitch: {value: pitch}, uHole: {value: hole}}, -1000);
  if (frame) quad(FRAME_FS, {uGutter: {value: v3(C.gutter)}, uInk: {value: v3(C.ink)}, uMargin: {value: .026}, uLine: {value: .009}}, frame === 'over' ? 1000 : -999);

  /** Two hard tones: `color` in the light, dots of `shade` growing into solid shade away from it. */
  const toon = (color, shade = C.ink, {light = [-.45, .7, .55], pitch: p = 56, hi = null, side = T.FrontSide} = {}) => new T.ShaderMaterial({
    side, uniforms: {...uniforms, uColor: {value: v3(color)}, uShade: {value: v3(shade)}, uHi: {value: v3(hi ?? color)}, uLight: {value: new T.Vector3(...light).normalize()}, uPitch: {value: p}},
    vertexShader: `varying vec3 vN; void main() { vN = normalMatrix * normal; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `${DOTS}
      uniform vec3 uColor, uShade, uHi, uLight; uniform float uPitch; varying vec3 vN;
      void main() {
        float l = dot(normalize(vN) * (gl_FrontFacing ? 1. : -1.), uLight);
        vec3 col = l > .86 ? uHi : uColor;
        col = mix(col, uShade, dots(gl_FragCoord.xy, uPitch, smoothstep(.3, -.55, l) * .95));
        gl_FragColor = vec4(col, 1.);
      }`,
  });
  /** A flat printed colour. */
  const flat = (color, opts = {}) => new T.MeshBasicMaterial({color: hex(color), ...opts});
  const inkMat = new T.ShaderMaterial({side: T.BackSide, uniforms: {uW: {value: .06}}, vertexShader: `uniform float uW; void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normalize(normal) * uW, 1.); }`, fragmentShader: `void main() { gl_FragColor = vec4(${(hex(C.ink) >> 16 & 255) / 255}, ${(hex(C.ink) >> 8 & 255) / 255}, ${(hex(C.ink) & 255) / 255}, 1.); }`});
  /**
   * Ink a mesh: a black hull just outside it, seen from behind. `w` is the line weight in the
   * mesh's own units. Works on smooth shapes; give boxes and flat shapes `grow` (a scale) instead.
   */
  const ink = (mesh, w = .06, {grow = 0} = {}) => {
    const m = inkMat.clone(); m.uniforms.uW.value = grow ? 0 : w;
    const hull = new T.Mesh(mesh.geometry, m); if (grow) hull.scale.setScalar(grow);
    mesh.add(hull); return mesh;
  };
  return {...stage, uniforms, back, toon, flat, ink, setTurn: a => { back.material.uniforms.uTurn.value = a; }};
}

// ---- Flat shapes (THREE.Shape) around the origin ----
/** A jagged burst: `points` spikes of radius r, valleys at `depth` of r, every spike a little different. */
export function burstShape(r, {points = 12, depth = .62, seed = 1, jitter = .2} = {}) {
  const s = new window.THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const a = (i + (rand(i, seed) - .5) * .5) * Math.PI / points + Math.PI / 2, rr = (i % 2 ? r * depth : r) * (1 + (rand(i, seed + 9) - .5) * jitter * (i % 2 ? 1 : 2));
    s[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr);
  }
  s.closePath(); return s;
}
/** A five-point star (or any number of points). */
export function starShape(r, inner = .46, points = 5) {
  const s = new window.THREE.Shape();
  for (let i = 0; i < points * 2; i++) { const a = i * Math.PI / points + Math.PI / 2, rr = i % 2 ? r * inner : r; s[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); }
  s.closePath(); return s;
}
/** A four-point spark with pinched sides. */
export function sparkShape(r) {
  const s = new window.THREE.Shape(), k = r * .16; s.moveTo(0, r);
  s.quadraticCurveTo(k, k, r, 0); s.quadraticCurveTo(k, -k, 0, -r); s.quadraticCurveTo(-k, -k, -r, 0); s.quadraticCurveTo(-k, k, 0, r); return s;
}
/**
 * A flat inked cut-out: the shape in `color` with a black copy just behind it, `grow` times the
 * size, and an optional hard shadow copy pushed down-right. Returns a Group.
 */
export function cutout(shape, color, {grow = 1.1, lineW = 0, shadow = 0, depth = 0, side = null} = {}) {
  const T = window.THREE, g = new T.Group(), geo = depth ? new T.ExtrudeGeometry(shape, {depth, bevelEnabled: false}) : new T.ShapeGeometry(shape), mat = c => new T.MeshBasicMaterial({color: hex(c), side: T.DoubleSide});
  const face = new T.Mesh(geo, mat(color)); face.position.z = depth ? -depth / 2 : 0;
  const line = new T.Mesh(new T.ShapeGeometry(shape), mat(C.ink)); line.scale.setScalar(grow); line.position.z = -(depth / 2) - .012;
  g.add(line, face);
  if (depth) face.material = [mat(color), mat(side ?? C.ink)];
  if (shadow) { const sh = new T.Mesh(new T.ShapeGeometry(shape), mat(C.ink)); sh.scale.setScalar(grow); sh.position.set(shadow, -shadow, -(depth / 2) - .03); g.add(sh); }
  g.userData.face = face; return g;
}
/**
 * Lettering on a canvas texture, in the theme fonts (loaded before any piece mounts). Draws
 * `text` centred, inked and extruded like the theme's shouted words, on an optional flat panel.
 * Returns {texture, aspect}.
 */
export function label(text, {font = F.head, weight = 400, size = 150, color = C.yellow, panel = null, w = 1024, h = 512, outline = .09, drop = .06, dots = null, border = 18} = {}) {
  const T = window.THREE, canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const g = canvas.getContext('2d'), lines = String(text).toUpperCase().split('\n');
  if (panel) {
    g.fillStyle = C.ink; g.fillRect(0, 0, w, h); g.fillStyle = panel; g.fillRect(border, border, w - border * 2, h - border * 2);
    if (dots) { g.save(); g.beginPath(); g.rect(border, border, w - border * 2, h - border * 2); g.clip(); g.fillStyle = dots; const p = 30; for (let i = 0; i * p / 2 < h; i++) for (let j = 0; j * p < w + p; j++) { const x = (j + (i % 2) * .5) * p, y = i * p / 2, r = p * .46 * (1 - Math.hypot(w - x, h - y) / (Math.hypot(w, h) * .7)); if (r > 1) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } } g.restore(); }
  }
  let px = size; g.font = `${weight} ${px}px ${font}`;
  const widest = Math.max(...lines.map(l => g.measureText(l).width)); px = Math.min(px, px * (w - border * 2 - 70) / widest, (h - border * 2 - 40) / (lines.length * 1.02));
  g.font = `${weight} ${px}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  const pitch = px * .98, y0 = h / 2 - (lines.length - 1) * pitch / 2 + px * .36;
  const pass = (dx, fill, stroke) => lines.forEach((l, i) => { if (stroke) { g.strokeStyle = C.ink; g.lineWidth = stroke; g.strokeText(l, w / 2 + dx, y0 + i * pitch + dx); } g.fillStyle = fill; g.fillText(l, w / 2 + dx, y0 + i * pitch + dx); });
  if (drop) pass(px * drop, C.ink, px * outline * 2); pass(0, color, outline ? px * outline * 2 : 0);
  const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace; texture.anisotropy = 4;
  return {texture, aspect: w / h};
}
