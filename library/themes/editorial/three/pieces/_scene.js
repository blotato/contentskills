// Shared plumbing for the editorial 3D scenes (the underscore keeps it out of piece ids).
// The theme's look in WebGL: the kit's paper as the ground (prop `field`: paper, stone, blush, ink, wine;
// `clear: true` leaves the canvas transparent for footage), matte paper objects under soft shadowless light (a
// hemisphere of paper over stone and one low key), a faint aubergine contact shade painted under things instead of
// cast shadows, pages and covers printed as small canvas textures (rules, greeked columns, tints of the footage, a
// Didone numeral). Slow glides on the kit's curves; nothing spins fast, bounces or glows.
// Three.js r160 core only (no addons). Everything is set from seek(t): no clocks, no Math.random.
import {C, F, TINTS, fieldOf, tone, hash, clamp, span, mix, glide, smooth, ease, easeIn} from '../../kit.js';
export {C, F, TINTS, fieldOf, tone, hash, clamp, span, mix, glide, smooth, ease, easeIn};

const cache = new Map();
const canvasTex = (key, w, h, draw) => {
  if (cache.has(key)) return cache.get(key);
  const T = window.THREE, c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4; cache.set(key, tex); return tex;
};
const tintFill = (x, name, x0, y0, w, h) => { const [a, b] = TINTS[name] ?? TINTS.wall, gr = x.createLinearGradient(x0, y0, x0 + w, y0 + h); gr.addColorStop(0, a); gr.addColorStop(1, b); x.fillStyle = gr; x.fillRect(x0, y0, w, h); };
const TINT_NAMES = ['wine', 'wall', 'skin', 'plaid', 'shade', 'hair'];

/** A printed page as a texture: kicker, rule, headline bars, greeked columns and one picture tint. Deterministic in `seed`. */
export function pageTexture(seed = 1, {field = 'paper', tint = null, w = 300, h = 420} = {}) {
  const f = fieldOf(field), tn = tint ?? TINT_NAMES[Math.floor(hash(seed, 3) * TINT_NAMES.length)];
  return canvasTex(`page:${seed}:${f.name}:${tn}:${w}x${h}`, w, h, x => {
    const m = w * .09, cw = w - 2 * m, top = hash(seed, 1) > .5;
    x.fillStyle = f.bg; x.fillRect(0, 0, w, h);
    x.fillStyle = f.fg; x.globalAlpha = .7; x.fillRect(m, m, cw * .3, 3); x.fillRect(w - m - cw * .08, m, cw * .08, 3); x.globalAlpha = 1; x.fillRect(m, m + 9, cw, 1.5);
    let y = m + 22; const pic = () => { tintFill(x, tn, m, y, cw, h * .3); y += h * .3 + 14; };
    if (top) pic();
    x.fillStyle = f.fg; x.fillRect(m, y, cw * (.7 + hash(seed, 4) * .25), 13); x.fillRect(m, y + 20, cw * (.4 + hash(seed, 5) * .3), 13);
    x.fillStyle = f.accent; x.fillRect(m + cw * (.45 + hash(seed, 5) * .3), y + 20, cw * .2, 13); y += 50;
    if (!top) pic();
    const cols = 2 + Math.floor(hash(seed, 6) * 2), gap = 10, colW = (cw - gap * (cols - 1)) / cols; x.fillStyle = f.fg; x.globalAlpha = .34;
    for (let c = 0; c < cols; c++) for (let ly = y, i = 0; ly < h - m - 14; ly += 7, i++) x.fillRect(m + c * (colW + gap), ly, colW * (hash(seed * 31 + c * 7 + i, 8) > .86 ? .55 : 1), 3);
    x.globalAlpha = .7; x.fillRect(m, h - m, cw * .12, 3); x.globalAlpha = 1;
  });
}
/** A cover as a texture: a Didone numeral as the masthead, a rule, one big tint and two small cover lines. */
export function coverTexture(seed = 1, {field = 'paper', tint = null, mark = null, w = 300, h = 420} = {}) {
  const f = fieldOf(field), tn = tint ?? TINT_NAMES[seed % TINT_NAMES.length], word = mark ?? `No.${String(seed).padStart(2, '0')}`;
  return canvasTex(`cover:${seed}:${f.name}:${tn}:${word}:${w}x${h}`, w, h, x => {
    const m = w * .09, cw = w - 2 * m;
    x.fillStyle = f.bg; x.fillRect(0, 0, w, h);
    x.fillStyle = f.fg; x.font = `500 ${Math.round(w * .24)}px ${F.serif}`; x.textBaseline = 'alphabetic'; x.fillText(word, m - 2, m + w * .2, cw);
    x.fillRect(m, m + w * .26, cw, 2);
    tintFill(x, tn, m, m + w * .31, cw, h * .46);
    const y = m + w * .31 + h * .46 + 22; x.fillRect(m, y, cw * .62, 11); x.fillStyle = f.accent; x.fillRect(m, y + 19, cw * .36, 11);
    x.fillStyle = f.fg; x.globalAlpha = .6; x.fillRect(w - m - cw * .16, h - m, cw * .16, 3); x.globalAlpha = 1;
  });
}
/** A print for a light table: a tint of the footage inside a paper border. */
export function printTexture(seed = 1, {tint = null, w = 240, h = 300} = {}) {
  const tn = tint ?? TINT_NAMES[seed % TINT_NAMES.length];
  return canvasTex(`print:${seed}:${tn}:${w}x${h}`, w, h, x => { x.fillStyle = C.paper; x.fillRect(0, 0, w, h); const b = w * .07; tintFill(x, tn, b, b, w - 2 * b, h - 2 * b - h * .1); x.fillStyle = C.ink; x.globalAlpha = .55; x.fillRect(b, h - b - 5, w * .22, 3); x.globalAlpha = 1; });
}
/** A soft aubergine contact shade (a flat plane to lay under an object; never a cast shadow). */
export function shade(w, h, strength = .22) {
  const T = window.THREE, tex = canvasTex('shade', 128, 128, (x, s) => { const gr = x.createRadialGradient(s / 2, s / 2, s * .12, s / 2, s / 2, s / 2); gr.addColorStop(0, 'rgba(38,16,26,1)'); gr.addColorStop(.55, 'rgba(38,16,26,.45)'); gr.addColorStop(1, 'rgba(38,16,26,0)'); x.fillStyle = gr; x.fillRect(0, 0, s, s); });
  const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({map: tex, transparent: true, opacity: strength, depthWrite: false})); m.rotation.x = -Math.PI / 2; return m;
}
/** Matte material in a kit colour (or with a texture). */
export const matte = (color, map = null) => new window.THREE.MeshLambertMaterial({color: map ? 0xffffff : tone(color), map, side: window.THREE.DoubleSide});
/** A sheet (w x h, `thick` deep) facing +z: `face` and `back` are materials, edges are paper in shade. */
export function sheet(w, h, face, {back = null, thick = .02, edge = 'stone'} = {}) {
  const T = window.THREE, e = matte(edge); return new T.Mesh(new T.BoxGeometry(w, h, thick), [e, e, e, e, face, back ?? matte('paper')]);
}

/**
 * A 3D stage in the theme's look. Returns {T, scene, camera, renderer, field, render(t), hold(minAspect), clear}.
 * Call render(t) at the end of seek.
 */
export function stage3(el, props = {}, {fov = 30, near = .1, far = 120} = {}) {
  const T = window.THREE, clear = Boolean(props.clear), field = fieldOf(props.field);
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  el.style.background = clear ? 'transparent' : field.bg;
  const renderer = new T.WebGLRenderer({antialias: true, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true});
  renderer.setClearColor(0x000000, 0);
  const cv = renderer.domElement; cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'; el.append(cv);
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(fov, 1, near, far);
  scene.add(new T.HemisphereLight(0xffffff, new T.Color(C.fog), 2.5));
  const key = new T.DirectionalLight(0xffffff, .85); key.position.set(-3, 6, 5); scene.add(key);
  const fit = () => { const cw = el.clientWidth || 600, ch = el.clientHeight || 600; renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(cw, ch, false); camera.aspect = cw / ch; camera.updateProjectionMatrix(); };
  fit();
  const draw = () => renderer.render(scene, camera), render = () => draw();
  let minA = .85; const fov0 = fov;
  /** On frames narrower than `minAspect`, widen the vertical field of view so the subject keeps its width. */
  const hold = (minAspect = minA) => { minA = minAspect; const a = camera.aspect, f = a >= minAspect ? fov0 : 2 * Math.atan(Math.tan(fov0 * Math.PI / 360) * minAspect / a) * 180 / Math.PI; if (Math.abs(camera.fov - f) > 1e-3) { camera.fov = f; camera.updateProjectionMatrix(); } };
  const observer = new ResizeObserver(() => { fit(); hold(minA); draw(); }); observer.observe(el);
  el.__dispose = () => { observer.disconnect(); renderer.dispose(); renderer.forceContextLoss(); };
  return {T, scene, camera, renderer, field, render, hold, clear};
}
