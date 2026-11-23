// Shared plumbing for the lifestyle theme's 3D scenes (not a piece: the underscore keeps it out of
// piece ids). The theme look in 3D is a sunlit paper tabletop: the mint-cream paper as background,
// matte pastel forms under soft sky light, round blurred contact shadows, labels set in the
// theme's type. Nothing glows. All original code.
import {threeStage, hex} from '/library/_shared/kit.js';
import {C, scenes} from '../../kit.js';
export {hex};

/** Seeded 0..1 hash for building geometry (never Math.random). */
export const rand = (n, seed = 0) => { const x = Math.sin(n * 127.1 + seed * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); };

/**
 * A paper-coloured stage with soft daylight. `width` is how many world units must stay visible
 * side to side: in a tall frame the camera backs away to keep them in view.
 * Returns {T, scene, camera, renderer, render, mat, shadow, label, print, dispose list}.
 */
export function softStage(el, {z = 10, fov = 32, width = 0, background = C.paper, y = 0, look = [0, 0, 0]} = {}) {
  const st = threeStage(el, {fov, z, background}), {T, scene, camera, renderer} = st;
  renderer.toneMapping = T.NoToneMapping;                          // keep the paper colour true
  scene.add(new T.HemisphereLight(0xfffbee, hex(C.deep), 2.1));
  const sun = new T.DirectionalLight(0xfff3d6, 1.5); sun.position.set(-4, 7, 6); scene.add(sun);
  const base = new T.Vector3(0, y, z), target = new T.Vector3(...look);
  /** Place the camera: `orbit` radians around the target, `lift` extra height, `push` multiplies distance. */
  const view = (orbit = 0, lift = 0, push = 1) => {
    const half = Math.tan(fov * Math.PI / 360), fitZ = width ? width / 2 / (half * camera.aspect) : 0, d = Math.max(z, fitZ) * push;
    camera.position.set(target.x + Math.sin(orbit) * d, base.y + lift, target.z + Math.cos(orbit) * d); camera.lookAt(target);
  };
  view();
  const render = () => st.render();
  /** Matte pastel material. */
  const mat = (color, o = {}) => new T.MeshLambertMaterial({color: hex(color), ...o});
  const canvasTex = (w, h, paint) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; paint(cv.getContext('2d'), w, h); const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4; return tex; };
  let shadowTex;
  /** A round blurred contact shadow lying on the ground (y = 0 of its parent). */
  const shadow = (r, opacity = .5) => {
    shadowTex ??= canvasTex(128, 128, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(120,140,96,1)'); g.addColorStop(.55, 'rgba(120,140,96,.45)'); g.addColorStop(1, 'rgba(120,140,96,0)'); c.fillStyle = g; c.fillRect(0, 0, w, w); });
    const m = new T.Mesh(new T.PlaneGeometry(r * 2, r * 2), new T.MeshBasicMaterial({map: shadowTex, transparent: true, opacity, depthWrite: false})); m.rotation.x = -Math.PI / 2; m.renderOrder = -1; return m;
  };
  /** Flat text on a see-through plane, `h` world units tall. role: 'head' | 'wide' | 'label'. Returns the mesh (material.opacity fades it). */
  const label = (text, {h = .5, color = C.ink, role = 'head', align = 'center'} = {}) => {
    const font = role === 'wide' ? '800 96px Montserrat' : role === 'label' ? '700 96px "Inter Tight"' : '900 96px "Inter Tight"', str = role === 'head' ? String(text) : String(text).toUpperCase();
    const probe = document.createElement('canvas').getContext('2d'); probe.font = font; if (role !== 'head') probe.letterSpacing = '12px';
    const w = Math.ceil(probe.measureText(str).width) + 40, tex = canvasTex(w, 150, c => { c.font = font; if (role !== 'head') c.letterSpacing = '12px'; c.fillStyle = color; c.textBaseline = 'middle'; c.fillText(str, 20, 80); });
    const mesh = new T.Mesh(new T.PlaneGeometry(h * w / 150, h), new T.MeshBasicMaterial({map: tex, transparent: true, depthWrite: false}));
    if (align !== 'center') mesh.geometry.translate((align === 'left' ? 1 : -1) * h * w / 300, 0, 0);
    mesh.userData.width = h * w / 150; return mesh;
  };
  /** A texture of one of the kit's stand-in scenes (sky, sun, two hills), for prints and cards. */
  const print = (name = 'meadow', seed = 0, w = 256, h = 320) => canvasTex(w, h, c => {
    const [sky, low, sunC, far, near] = scenes[name] ?? scenes.meadow, g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, sky); g.addColorStop(1, low); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = sunC; c.beginPath(); c.arc(w * (.3 + .4 * rand(1, seed)), h * (.28 + .1 * rand(2, seed)), w * .12, 0, 7); c.fill();
    [[.58, .05, far, 3], [.72, .06, near, 4]].forEach(([b, a, col, k]) => { const s = rand(k, seed); c.fillStyle = col; c.beginPath(); c.moveTo(0, h); for (let i = 0; i <= 24; i++) c.lineTo(w * i / 24, h * (b + a * (Math.sin(i * .35 + s * 5) * .6 + Math.sin(i * .95 + s * 9) * .25))); c.lineTo(w, h); c.fill(); });
  });
  return {...st, render, view, mat, shadow, label, print, canvasTex};
}
