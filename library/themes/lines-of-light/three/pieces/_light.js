// Shared plumbing for the Lines of Light 3D scenes (the underscore keeps it out of piece ids).
// The theme's look in WebGL: every line is drawn three times with additive blending, a white core,
// a red echo shifted up-left on screen and a blue echo shifted down-right (both in screen pixels, so
// they hold their offset at any depth), the red trailing and the blue leading a draw-on. A glow pass
// (half-size blur, tinted lilac) gives the soft halo. The canvas is transparent: the teal haze is the
// element's CSS background, with the kit's grain over it, so `clear: true` floats a scene on footage.
// Three.js r160 core only (no addons). Everything is set from seek(t): no clocks, no Math.random.
import {C, hash, noise, ease, io, span, clamp, grainURL} from '../../kit.js';
export {C, hash, noise, ease, io, span, clamp};

const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const LINE_VS = /* glsl */`
attribute float aT; uniform vec2 uShift, uRes; varying float vT, vDepth;
void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv;
  gl_Position.xy += uShift * 2. / uRes * gl_Position.w; vT = aT; vDepth = -mv.z; }`;
const LINE_FS = /* glsl */`
uniform vec3 uColor; uniform float uOpacity, uHead, uTail, uNear, uFar, uSoft; varying float vT, vDepth;
void main() { if (vT > uHead || vT < uTail) discard;
  float fog = 1. - smoothstep(uNear, uFar, vDepth), tip = uSoft > 0. ? smoothstep(uHead, uHead - uSoft, vT) * .7 + .3 : 1.;
  gl_FragColor = vec4(uColor * uOpacity * fog * tip, 1.); }`;
const PT_VS = /* glsl */`
attribute float aSize, aAlpha; attribute vec3 aColor; uniform float uPx; varying float vA; varying vec3 vC;
void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = aSize * uPx / -mv.z; vA = aAlpha; vC = aColor; }`;
const PT_FS = /* glsl */`
varying float vA; varying vec3 vC;
void main() { float d = clamp(length(gl_PointCoord - .5) * 2., 0., 1.); float s = pow(1. - d, 2.2) * .8 + smoothstep(.18, 0., d) * .9;
  gl_FragColor = vec4(mix(vC, vec3(1.), smoothstep(.2, 0., d)) * s * vA, 1.); }`;
const QUAD_VS = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
const BLUR_FS = `uniform sampler2D tMap; uniform vec2 uStep; varying vec2 vUv;
void main() { vec3 c = texture2D(tMap, vUv).rgb * .227;
  c += (texture2D(tMap, vUv + uStep * 1.385).rgb + texture2D(tMap, vUv - uStep * 1.385).rgb) * .316;
  c += (texture2D(tMap, vUv + uStep * 3.231).rgb + texture2D(tMap, vUv - uStep * 3.231).rgb) * .0703; gl_FragColor = vec4(c, 1.); }`;
const FINAL_FS = `uniform sampler2D tBase, tGlow; uniform float uGlow; uniform vec3 uTint; varying vec2 vUv;
void main() { vec3 base = texture2D(tBase, vUv).rgb, glow = texture2D(tGlow, vUv).rgb;
  vec3 col = base + glow * uGlow * mix(vec3(1.), uTint, .5); col = 1. - exp(-col * 1.25);
  gl_FragColor = vec4(col, clamp(max(col.r, max(col.g, col.b)) * 1.1, 0., 1.)); }`;

/**
 * A 3D stage in the theme's look. Returns {T, scene, camera, renderer, line, points, render}:
 *   line(points | [[...], ...], {color, echo, opacity, near, far, closed, soft})  a light line (a list of
 *        Vector3 / [x, y, z], or a list of such lists = separate strands sharing one material). Returns
 *        {obj, draw(q), range(a, b), opacity(o)}: reveal 0..q of each strand (red trails, blue leads).
 *   points(n, {size, color}) -> {obj, set(i, [x, y, z], alpha, size?, color?)}  glowing sprites (dots, flashes).
 *   render(t)  grain + draw. Call at the end of seek.
 */
export function lightStage(el, props = {}, {fov = 40, near = 4, far = 40, glow = 1.3, echo = 3} = {}) {
  const T = window.THREE, clear = Boolean(props.clear);
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  el.style.background = clear ? 'transparent' : 'radial-gradient(110% 70% at 50% 45%,#10201f 0%,#081011 55%,#040506 100%)';
  const renderer = new T.WebGLRenderer({antialias: true, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true});
  renderer.setClearColor(0x000000, 0); renderer.outputColorSpace = T.LinearSRGBColorSpace;
  const cv = renderer.domElement; cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'; el.append(cv);
  const grain = clear ? null : (() => { const d = document.createElement('div'); d.style.cssText = `position:absolute;inset:0;pointer-events:none;background-image:url(${grainURL()});background-size:256px 256px;opacity:.4;mix-blend-mode:screen`; el.append(d); return d; })();
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(fov, 1, .05, 400);
  const res = new T.Vector2(1, 1), mats = [], ptMats = [];
  const tgt = s => new T.WebGLRenderTarget(4, 4, {samples: s, depthBuffer: s > 0, minFilter: T.LinearFilter, magFilter: T.LinearFilter});
  const full = tgt(4), half = [tgt(0), tgt(0)];
  const quad = new T.Mesh(new T.PlaneGeometry(2, 2)); quad.frustumCulled = false;
  const qScene = new T.Scene().add(quad), qCam = new T.Camera();
  const blur = new T.ShaderMaterial({uniforms: {tMap: {value: null}, uStep: {value: new T.Vector2()}}, vertexShader: QUAD_VS, fragmentShader: BLUR_FS, depthTest: false});
  const final = new T.ShaderMaterial({uniforms: {tBase: {value: full.texture}, tGlow: {value: half[1].texture}, uGlow: {value: glow}, uTint: {value: new T.Vector3(...rgb(C.lilac))}}, vertexShader: QUAD_VS, fragmentShader: FINAL_FS, depthTest: false, transparent: true, blending: T.NoBlending});
  let w = 0, h = 0;
  const fit = () => {
    const cw = el.clientWidth || 600, ch = el.clientHeight || 600; renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch; camera.updateProjectionMatrix();
    const size = renderer.getDrawingBufferSize(new T.Vector2()); w = size.x; h = size.y; res.set(w, h);
    full.setSize(w, h); half.forEach(t => t.setSize(Math.max(2, w >> 1), Math.max(2, h >> 1)));
  };
  fit();
  const k = () => Math.max(1, h / 1080);   // echo offsets scale with output height
  const lineMat = (color, shift, opacity, nearF, farF, soft) => {
    const m = new T.ShaderMaterial({vertexShader: LINE_VS, fragmentShader: LINE_FS, transparent: true, depthWrite: false, depthTest: false, blending: T.AdditiveBlending,
      uniforms: {uColor: {value: new T.Vector3(...rgb(color))}, uOpacity: {value: opacity}, uHead: {value: 1}, uTail: {value: -1}, uNear: {value: nearF}, uFar: {value: farF}, uSoft: {value: soft}, uShift: {value: new T.Vector2(...shift)}, uRes: {value: res}}});
    m.base = shift; mats.push(m); return m;
  };
  const toV = p => Array.isArray(p) ? p : [p.x, p.y, p.z];
  function line(shape, {color = 'core', echo: withEcho = true, opacity = 1, near: n0 = near, far: f0 = far, closed = false, soft = 0, double = true} = {}) {
    const strands = Array.isArray(shape[0]) && (Array.isArray(shape[0][0]) || shape[0][0]?.isVector3) ? shape : [shape];
    const pos = [], at = [];
    for (const s of strands) {
      const pts = s.map(toV); if (closed) pts.push(pts[0]);
      const d = [0]; for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
      const L = d.at(-1) || 1;
      for (let i = 1; i < pts.length; i++) { pos.push(...pts[i - 1], ...pts[i]); at.push(d[i - 1] / L, d[i] / L); }
    }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('aT', new T.Float32BufferAttribute(at, 1));
    const obj = new T.Group(), col = C[color] ?? color, parts = [];
    const add = (c, shift, o, lag) => { const m = lineMat(c, shift, o, n0, f0, soft), l = new T.LineSegments(geo, m); l.frustumCulled = false; obj.add(l); parts.push({m, lag, o}); };
    if (withEcho) { add(C.red, [-echo, echo], .8 * opacity, .06); add(C.blue, [echo, -echo], .8 * opacity, -.035); }
    add(col, [0, 0], opacity, 0); if (double) add(col, [.7, .7], opacity * .55, 0);
    let st = [0, 1], op = 1;
    const lag = (q, l) => l > 0 ? clamp(q * (1 + l) - l) : clamp(q * (1 - l));
    const apply = () => parts.forEach(({m, lag: l, o}) => { const [a, b] = st; m.uniforms.uHead.value = b >= 1 ? 2 : lag(b, l); m.uniforms.uTail.value = a <= 0 ? -1 : lag(a, l); m.uniforms.uOpacity.value = o * op; });
    const self = {obj, geo, draw(q) { st = [0, q]; apply(); return self; }, range(a, b) { st = [a, b]; apply(); return self; }, opacity(o) { op = o; apply(); return self; }};
    scene.add(obj); return self;
  }
  function points(n, {size = .3, color = 'red'} = {}) {
    const geo = new T.BufferGeometry(), P = new Float32Array(n * 3), S = new Float32Array(n).fill(size), A = new Float32Array(n), Cc = new Float32Array(n * 3);
    const c0 = rgb(C[color] ?? color); for (let i = 0; i < n; i++) Cc.set(c0, i * 3);
    geo.setAttribute('position', new T.BufferAttribute(P, 3)); geo.setAttribute('aSize', new T.BufferAttribute(S, 1)); geo.setAttribute('aAlpha', new T.BufferAttribute(A, 1)); geo.setAttribute('aColor', new T.BufferAttribute(Cc, 3));
    const m = new T.ShaderMaterial({vertexShader: PT_VS, fragmentShader: PT_FS, uniforms: {uPx: {value: 500}}, transparent: true, depthWrite: false, depthTest: false, blending: T.AdditiveBlending}); ptMats.push(m);
    const obj = new T.Points(geo, m); obj.frustumCulled = false; scene.add(obj);
    return {obj, set(i, p, a, s, c) { P.set(toV(p), i * 3); A[i] = a; if (s != null) S[i] = s; if (c) Cc.set(rgb(C[c] ?? c), i * 3); geo.attributes.position.needsUpdate = geo.attributes.aAlpha.needsUpdate = geo.attributes.aSize.needsUpdate = geo.attributes.aColor.needsUpdate = true; }};
  }
  const pass = (from, to, dx, dy) => { blur.uniforms.tMap.value = from.texture; blur.uniforms.uStep.value.set(dx / to.width, dy / to.height); quad.material = blur; renderer.setRenderTarget(to); renderer.render(qScene, qCam); };
  let last = 0;
  const draw = () => {
    for (const m of mats) m.uniforms.uShift.value.set(m.base[0] * k(), m.base[1] * k());
    for (const m of ptMats) m.uniforms.uPx.value = h / (2 * Math.tan(camera.fov * Math.PI / 360));
    renderer.setRenderTarget(full); renderer.setClearColor(0, 0); renderer.clear(); renderer.render(scene, camera);
    pass(full, half[0], 1.6, 0); pass(half[0], half[1], 0, 1.6); pass(half[1], half[0], 3.2, 0); pass(half[0], half[1], 0, 3.2);
    quad.material = final; renderer.setRenderTarget(null); renderer.setClearColor(0, 0); renderer.clear(); renderer.render(qScene, qCam);
  };
  const render = t => { last = t; if (grain) { const s = Math.floor(t * 12); grain.style.backgroundPosition = `${Math.round(hash(s, 1) * 256)}px ${Math.round(hash(s, 2) * 256)}px`; } draw(); };
  const observer = new ResizeObserver(() => { fit(); draw(); }); observer.observe(el);
  el.__dispose = () => { observer.disconnect(); full.dispose(); half.forEach(t => t.dispose()); renderer.dispose(); renderer.forceContextLoss(); };
  /** On frames narrower than `minAspect`, widen the vertical field of view so the subject keeps its width. */
  const fov0 = fov, hold = (minAspect = .85) => { const a = camera.aspect, f = a >= minAspect ? fov0 : 2 * Math.atan(Math.tan(fov0 * Math.PI / 360) * minAspect / a) * 180 / Math.PI; if (Math.abs(camera.fov - f) > 1e-3) { camera.fov = f; camera.updateProjectionMatrix(); } };
  return {T, scene, camera, renderer, line, points, render, hold, clear};
}

/** Points round a circle in a plane: axis 'y' (flat ring, x/z), 'z' (facing camera, x/y) or 'x'. */
export function circle(r, n = 96, axis = 'z', [cx, cy, cz] = [0, 0, 0], a0 = 0, a1 = Math.PI * 2) {
  return Array.from({length: n + 1}, (_, i) => { const a = a0 + (a1 - a0) * i / n, c = Math.cos(a) * r, s = Math.sin(a) * r;
    return axis === 'y' ? [cx + c, cy, cz + s] : axis === 'x' ? [cx, cy + c, cz + s] : [cx + c, cy + s, cz]; });
}
