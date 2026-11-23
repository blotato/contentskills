// Shared plumbing for this theme's 3D scenes (not a piece itself: the underscore keeps it out of piece ids).
// The look is archive film of physical objects: everything is monochrome in the kit's silver, bone and navy
// with crimson as the only colour, lit softly from above and falling off into the dark table. The bundled
// Three.js is the core build with no post-processing, so the film pass is hand-written:
//   scene -> offscreen target, with one soft half-Lambert material (smooth or faceted) and depth haze;
//   post  -> contrast curve with a cool cast, grain, vignette, hairline scratches, dust, lamp flicker
//            and gate weave, stepping 12 times a second like the kit's film().
// Everything is a pure function of t. All original code.
import {C, hash, noise, tick, flicker, weave} from '../../kit.js';
export {C, hash, noise};

export const v3 = color => { const n = parseInt(color.slice(1), 16); return new window.THREE.Vector3((n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255); };
const VERT = /* glsl */`varying vec3 vView, vN; varying vec2 vUv;
void main() { vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.); vView = mv.xyz; vN = normalMatrix * normal; gl_Position = projectionMatrix * mv; }`;
const SURFACE = /* glsl */`
uniform vec3 uColor, uHaze; uniform sampler2D uMap; uniform float uUseMap, uFacet, uGlow, uNear, uFar, uOpacity, uFlip; varying vec3 vView, vN; varying vec2 vUv;
void main() {
  vec3 n = uFacet > .5 ? normalize(cross(dFdx(vView), dFdy(vView))) : normalize(vN); if (uFlip > .5) n = -n;
  vec4 tx = uUseMap > .5 ? texture2D(uMap, vUv) : vec4(1.);
  vec3 base = uColor * tx.rgb;
  float l = dot(n, normalize(vec3(-.35, .8, .5))) * .5 + .5, shade = mix(.22, 1.08, l * l);
  float rim = pow(1. - max(dot(n, normalize(-vView)), 0.), 3.) * .18;
  vec3 col = mix(base * shade + rim * vec3(.55, .68, .85), base, uGlow);
  col = mix(col, uHaze, smoothstep(uNear, uFar, -vView.z) * (1. - uGlow * .5));
  gl_FragColor = vec4(col, tx.a * uOpacity);
}`;
const POST = /* glsl */`
uniform sampler2D tScene; uniform vec2 uRes, uWeave; uniform float uFrame, uTime, uDark, uWear; varying vec2 vUv;
float h1(float n) { return fract(sin(n * 127.1 + 311.7) * 43758.5453); }
float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n1(float x) { float i = floor(x), f = fract(x); f = f * f * (3. - 2. * f); return mix(h1(i), h1(i + 1.), f); }
void main() {
  vec2 uv = (vUv - .5) * .985 + .5 + uWeave / uRes;
  vec3 col = texture2D(tScene, uv).rgb;
  col = mix(col, col * col * (3. - 2. * col), .45);                                  // firmer mids
  float lum = dot(col, vec3(.3, .59, .11));
  col = mix(col, vec3(lum) * vec3(.93, .98, 1.08), .25 * (1. - smoothstep(.12, .35, col.r - max(col.g, col.b))));   // cool cast, but crimson stays crimson
  float d = length((vUv - vec2(.5, .47)) * vec2(1., 1.)) / .72;
  col *= 1. - smoothstep(.42, 1.05, d) * .82;
  col += (h2(floor(vUv * uRes / 2.) + uFrame * 17.) - .5) * .11 * uWear;
  for (int i = 0; i < 3; i++) {                                                       // hairline scratches
    float fi = float(i), on = step(.55, h1(floor(uFrame / 8.) + fi * 7.)) * step(.3, h1(uFrame + fi * 13.));
    float x = .08 + .84 * n1(uTime * .35 + fi * 19.) + h1(uFrame + fi) * .003;
    col += on * smoothstep(1.6 / uRes.x, 0., abs(vUv.x - x)) * (.1 + .12 * h1(uFrame * 1.7 + fi)) * uWear;
  }
  for (int i = 0; i < 5; i++) {                                                       // dust
    float fi = float(i); vec2 c = vec2(h1(uFrame * 2.3 + fi * 11.), h1(uFrame * 4.1 + fi * 17.));
    float on = step(.7, h1(uFrame * 1.9 + fi * 3.3)), r = (1.5 + 4. * h1(uFrame + fi * 5.)) / uRes.y * (uRes.y / 500.);
    col = mix(col, vec3(mod(fi, 2.) < 1. ? .9 : .02), on * smoothstep(r, r * .5, length((vUv - c) * vec2(uRes.x / uRes.y, 1.))) * .55 * uWear);
  }
  gl_FragColor = vec4(col * (1. - uDark), 1.);
}`;

/**
 * A stage for one scene. Returns {T, scene, camera, mat, mesh, art, table, play}:
 *   mat(color, {map, facet, glow, opacity, side}) -> the theme's one soft material (glow 1 = unlit, for light and screens)
 *   mesh(geometry, material, parent = scene)
 *   art(draw(ctx, w, h), [w, h])               -> a canvas texture
 *   table(size)                                 -> the dark table everything lies on, with a pool of light
 *   play(update(t))                             -> the piece handle {seek}
 */
export function filmStage(el, {fov = 34, wear = 1, near = 14, far = 44} = {}) {
  const T = window.THREE, haze = v3(C.night);
  const renderer = new T.WebGLRenderer({antialias: true, preserveDrawingBuffer: true}); renderer.setClearColor(0x0b1017, 1); renderer.autoClear = true;
  el.append(renderer.domElement); el.style.background = C.night;
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(fov, 1, .1, 400);
  const target = new T.WebGLRenderTarget(4, 4, {samples: 4, depthBuffer: true});
  const post = new T.Scene(), postCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const U = {tScene: {value: target.texture}, uRes: {value: new T.Vector2(1, 1)}, uWeave: {value: new T.Vector2()}, uFrame: {value: 0}, uTime: {value: 0}, uDark: {value: 0}, uWear: {value: wear}};
  post.add(new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({uniforms: U, vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: POST, depthTest: false})));
  const materials = [], textures = [];
  const mat = (color = C.bone, {map = null, facet = false, glow = 0, opacity = 1, side = T.FrontSide, additive = false, flip = false} = {}) => {
    const m = new T.ShaderMaterial({vertexShader: VERT, fragmentShader: SURFACE, side, transparent: opacity < 1 || additive || Boolean(map?.userData.alpha), depthWrite: !(opacity < 1 || additive), blending: additive ? T.AdditiveBlending : T.NormalBlending,
      uniforms: {uColor: {value: v3(color)}, uHaze: {value: haze}, uMap: {value: map}, uUseMap: {value: map ? 1 : 0}, uFacet: {value: facet ? 1 : 0}, uGlow: {value: glow}, uNear: {value: near}, uFar: {value: far}, uOpacity: {value: opacity}, uFlip: {value: flip ? 1 : 0}}});
    materials.push(m); return m;
  };
  const mesh = (geometry, material, parent = scene) => { const m = new T.Mesh(geometry, material); parent.add(m); return m; };
  const art = (draw, [w, h] = [512, 512], {alpha = false} = {}) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const tx = new T.CanvasTexture(cv); tx.anisotropy = 4; tx.userData.alpha = alpha; textures.push(tx); return tx; };
  const table = (size = 60, y = 0) => { const tx = art((ctx, w, h) => { const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, '#2c3a4d'); g.addColorStop(.5, '#182230'); g.addColorStop(1, C.night); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 2600; i++) { ctx.fillStyle = `rgba(${hash(i) > .5 ? '255,255,255' : '0,0,0'},${.03 + .05 * hash(i * 3.1)})`; ctx.fillRect(hash(i * 1.7) * w, hash(i * 2.9) * h, 1 + hash(i * 5.3) * 14, 1 + hash(i * 7.7) * 2); } });
    const m = mesh(new T.PlaneGeometry(size, size), mat('#ffffff', {map: tx})); m.rotation.x = -Math.PI / 2; m.position.y = y; return m; };
  const fit = () => {
    const w = el.clientWidth || 600, h = el.clientHeight || 600, pr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(pr); renderer.setSize(w, h, false); target.setSize(w * pr, h * pr); U.uRes.value.set(w * pr, h * pr);
    camera.aspect = w / h; camera.fov = w < h ? 2 * Math.atan(Math.tan(fov * Math.PI / 360) / (w / h)) * 180 / Math.PI : fov; camera.updateProjectionMatrix();
  };
  fit();
  let last = () => {};
  const observer = new ResizeObserver(() => { fit(); last(); }); observer.observe(el);
  el.__dispose = () => { observer.disconnect(); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); target.dispose(); renderer.dispose(); renderer.forceContextLoss(); };
  const play = update => ({seek(t) {
    last = () => {
      update(t); const [wx, wy] = weave(t, 1.4);
      U.uFrame.value = tick(t); U.uTime.value = t; U.uDark.value = flicker(t, wear); U.uWeave.value.set(wx, wy);
      renderer.setRenderTarget(target); renderer.render(scene, camera); renderer.setRenderTarget(null); renderer.render(post, postCam);
    };
    last();
  }});
  return {T, scene, camera, mat, mesh, art, table, play};
}
/** A stand-in photograph painted on a canvas, in the kit's silver tones: 'city', 'portrait', 'hills' or 'ship'. */
export function paintPhoto(ctx, w, h, kind = 'city', seed = 1) {
  const G = v => { const a = [12, 17, 23], b = [231, 235, 238]; return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * v)).join(',')})`; }, r = n => hash(seed * 13.7 + n);
  const sky = ctx.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, G(.74)); sky.addColorStop(.7, G(.97)); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  if (kind === 'city') { for (let i = 0; i < 12; i++) { ctx.fillStyle = G(.58 + .1 * r(i)); const bh = h * (.2 + .25 * r(i + 20)); ctx.fillRect(i * w * .09 - 10, h * .74 - bh, w * .08, bh); }
    for (let i = 0; i < 6; i++) { ctx.fillStyle = G(.34 + .12 * r(i + 40)); const bh = h * (.3 + .28 * r(i + 50)), x = i * w * .18 - 10; ctx.fillRect(x, h * .82 - bh, w * .15, bh); ctx.fillStyle = G(.72); for (let c = 0; c < 3; c++) for (let k = 0; k < bh / (h * .07) - 1; k++) if (r(i * 31 + c * 7 + k) > .3) ctx.fillRect(x + w * (.025 + c * .045), h * .82 - bh + h * .03 + k * h * .07, w * .018, h * .03); }
    ctx.fillStyle = G(.26); ctx.fillRect(0, h * .82, w, h * .2);
  } else if (kind === 'portrait') { const g = ctx.createRadialGradient(w / 2, h * .4, 0, w / 2, h * .4, w * .7); g.addColorStop(0, G(.62)); g.addColorStop(1, G(.2)); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const cx = w / 2, hy = h * .4, hr = Math.min(w, h) * .19; ctx.fillStyle = G(.12); ctx.beginPath(); ctx.ellipse(cx, h * 1.02, hr * 2.9, hr * 2.1, 0, 0, 7); ctx.fill(); ctx.fillStyle = G(.55); ctx.fillRect(cx - hr * .45, hy + hr * .7, hr * .9, hr);
    ctx.fillStyle = G(.7); ctx.beginPath(); ctx.ellipse(cx, hy, hr * .86, hr * 1.12, 0, 0, 7); ctx.fill(); ctx.fillStyle = G(.1); ctx.beginPath(); ctx.ellipse(cx, hy - hr * .62, hr * .92, hr * .62, 0, Math.PI, 0); ctx.fill();
  } else if (kind === 'hills') { ctx.fillStyle = G(1); ctx.beginPath(); ctx.arc(w * .7, h * .3, h * .09, 0, 7); ctx.fill();
    [[.62, .2, .64, 3], [.78, .16, .42, 11], [.95, .08, .2, 23]].forEach(([base, amp, tone, s]) => { ctx.fillStyle = G(tone); ctx.beginPath(); ctx.moveTo(0, h); for (let i = 0; i <= 24; i++) ctx.lineTo(i * w / 24, h * (base - amp * noise(i * .3 + s + seed))); ctx.lineTo(w, h); ctx.fill(); });
  } else { ctx.fillStyle = G(.5); ctx.fillRect(0, h * .66, w, h * .4); ctx.fillStyle = G(.1); ctx.beginPath(); ctx.moveTo(w * .14, h * .6); ctx.lineTo(w * .86, h * .6); ctx.lineTo(w * .8, h * .72); ctx.lineTo(w * .2, h * .72); ctx.fill();
    ctx.fillStyle = G(.8); ctx.fillRect(w * .26, h * .53, w * .46, h * .075); ctx.fillStyle = G(.2); [.36, .48, .6].forEach(x => ctx.fillRect(w * x, h * .36, w * .055, h * .18)); }
  const v = ctx.createRadialGradient(w / 2, h / 2, w * .25, w / 2, h / 2, w * .8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(8,12,18,.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
}
/** A paper sheet texture: bone paper with mottling, optional rows of unreadable small print and a crimson mark. */
export function paintPaper(ctx, w, h, {lines = 0, seed = 1, fill = C.paper, margin = .12, heading = false} = {}) {
  ctx.fillStyle = fill; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 500; i++) { ctx.fillStyle = `rgba(${hash(i + seed) > .5 ? '255,255,255' : '60,50,30'},${.03 + .06 * hash(i * 3.1 + seed)})`; ctx.beginPath(); ctx.arc(hash(i * 1.7 + seed) * w, hash(i * 2.9 + seed) * h, 2 + hash(i * 5.3) * w * .05, 0, 7); ctx.fill(); }
  const m = w * margin, pitch = (h - m * 2) / Math.max(1, lines + (heading ? 2 : 0)); ctx.fillStyle = '#15181d';
  if (heading) { ctx.fillStyle = C.crimson; ctx.fillRect(m, m, w * .34, pitch * .5); ctx.fillStyle = '#15181d'; }
  for (let i = 0; i < lines; i++) { let x = m; const y = m + (i + (heading ? 2 : 0)) * pitch, end = w - m - (i === lines - 1 ? w * .3 : w * .08 * hash(i + seed)); while (x < end) { const len = w * (.03 + .09 * hash(x + i * 7 + seed)); ctx.globalAlpha = .75; ctx.fillRect(x, y, Math.min(len, end - x), pitch * .22); x += len + w * .02; } }
  ctx.globalAlpha = 1;
}
