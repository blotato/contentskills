// Shared plumbing for the fashion theme's 3D scenes (not a piece: the underscore keeps it out of
// piece ids). The theme look in 3D is an empty studio: a near-black (or bone, or footage-tone)
// ground that is an out-of-focus wash, matte white forms under one soft key light, hairlines made
// of thin solids (so they keep a real width at any render size), at most one poppy accent.
// Nothing glows, spins fast or bounces. All original code.
import {threeStage, hex} from '/library/_shared/kit.js';
import {C, fields, type, hash} from '../../kit.js';
export {hex, hash};

/**
 * A studio stage. `field`: 'noir' (default), 'bone' or a footage tone (sky, meadow, stone, dusk).
 * `width` is how many world units must stay visible side to side: in a tall frame the camera backs
 * away to keep them in view. Returns {T, scene, camera, render, view, dark, ink, mat, flat, bar,
 * hoop, shadow, disc, label, canvasTex}; ink = {head, dim, accent, bg} are the colours to draw with.
 */
export function studio(el, {field = 'noir', accent = 'poppy', z = 10, fov = 30, width = 0, look = [0, 0, 0], y = 0, fog = true} = {}) {
  const tones = fields[field] ?? fields.noir, dark = field !== 'bone', bg = tones[0];
  const st = threeStage(el, {fov, z, background: bg}), {T, scene, camera, renderer} = st;
  renderer.toneMapping = T.NoToneMapping;                              // keep white white and the ground true
  const ink = {head: dark ? C.white : C.ink, dim: dark ? C.ash : C.smoke, soft: dark ? C.bone : C.coal, accent: C[accent] ?? accent ?? C.poppy, bg};
  if (fog) scene.fog = new T.Fog(hex(bg), z * .95, z * 2.7);           // far things sink into the ground
  scene.add(new T.HemisphereLight(0xffffff, hex(dark ? '#2C3654' : '#CFC9BD'), dark ? 1.25 : 2.0));
  const key = new T.DirectionalLight(0xffffff, dark ? 2.1 : 1.2); key.position.set(-5, 7, 8); scene.add(key);
  const canvasTex = (w, h, paint) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; paint(cv.getContext('2d'), w, h); const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4; return tex; };
  // The out-of-focus wash behind everything (the same three soft lights as the kit's backdrop), fixed to the camera.
  const wash = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({fog: false, depthWrite: false, depthTest: false, map: canvasTex(256, 256, (c, w) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, w);
    [[.22, .2], [.8, .55], [.3, .92]].forEach(([x, yy], i) => { const g = c.createRadialGradient(x * w, yy * w, 0, x * w, yy * w, w * .62); g.addColorStop(0, tones[i + 1]); g.addColorStop(1, tones[i + 1] + '00'); c.globalAlpha = dark ? .85 : .9; c.fillStyle = g; c.fillRect(0, 0, w, w); });
    if (dark) { const g = c.createLinearGradient(0, 0, 0, w); g.addColorStop(0, 'rgba(0,0,0,.22)'); g.addColorStop(.5, 'rgba(0,0,0,.03)'); g.addColorStop(1, 'rgba(0,0,0,.34)'); c.globalAlpha = 1; c.fillStyle = g; c.fillRect(0, 0, w, w); }
  })}));
  wash.renderOrder = -10; wash.position.z = -100; camera.add(wash); scene.add(camera);
  const base = new T.Vector3(0, y, z), target = new T.Vector3(...look), half = Math.tan(fov * Math.PI / 360);
  /** Place the camera: `orbit` radians around the target, `lift` extra height, `push` multiplies distance. */
  const view = (orbit = 0, lift = 0, push = 1) => {
    const fitZ = width ? width / 2 / (half * camera.aspect) : 0, d = Math.max(z, fitZ) * push;
    camera.position.set(target.x + Math.sin(orbit) * d, base.y + lift, target.z + Math.cos(orbit) * d); camera.lookAt(target);
    const side = 2 * 100 * half * 1.02 * Math.max(1, camera.aspect); wash.scale.set(side, side, 1);
    if (scene.fog) { scene.fog.near = d * .95; scene.fog.far = d * 2.7; }
  };
  view();
  const render = () => st.render();
  /** Matte material that takes the studio light. */
  const mat = (color, o = {}) => new T.MeshLambertMaterial({color: hex(color), ...o});
  /** Unlit material: for hairlines and marks that must stay exactly their colour. */
  const flat = (color, o = {}) => new T.MeshBasicMaterial({color: hex(color), ...o});
  /** A hairline as a thin solid from a to b ([x, y, z]); `w` is its thickness in world units. */
  const bar = (a, b, w = .02, color = ink.head, o = {}) => {
    const va = new T.Vector3(...a), vb = new T.Vector3(...b), m = new T.Mesh(new T.BoxGeometry(w, va.distanceTo(vb), w), flat(color, o));
    m.position.copy(va).add(vb).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), vb.clone().sub(va).normalize()); return m;
  };
  /** A hairline ring of radius r (a thin torus lying in the XY plane). */
  const hoop = (r, w = .02, color = ink.head, o = {}, lit = false) => new T.Mesh(new T.TorusGeometry(r, w, 8, 160), (lit ? mat : flat)(color, o));
  let shadowTex, discTex;
  /** A soft rectangular shadow, w x h world units, to lay behind a floating card. */
  const shadow = (w, h, opacity = .5) => {
    shadowTex ??= canvasTex(128, 128, (c, s) => { c.filter = 'blur(14px)'; c.fillStyle = '#000'; c.fillRect(30, 30, s - 60, s - 60); });
    return new T.Mesh(new T.PlaneGeometry(w * 128 / 68, h * 128 / 68), new T.MeshBasicMaterial({map: shadowTex, transparent: true, opacity, depthWrite: false}));
  };
  /** An out-of-focus disc of light (soft edge), r world units. */
  const disc = (r, color = C.white, opacity = .2) => {
    discTex ??= canvasTex(128, 128, (c, s) => { const g = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(.72, 'rgba(255,255,255,.8)'); g.addColorStop(.86, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, s, s); });
    return new T.Mesh(new T.PlaneGeometry(r * 2, r * 2), new T.MeshBasicMaterial({map: discTex, color: hex(color), transparent: true, opacity, depthWrite: false, fog: false}));
  };
  /** Flat text on a see-through plane, `h` world units tall (cap height is about 0.5 h). role: wide | tall | num | label. material.opacity fades it. */
  const label = (text, {h = .5, color = ink.head, role = 'label', align = 'center'} = {}) => {
    const f = type[role] ?? type.label, font = `${f.weight} 96px ${f.font}`, str = role === 'num' ? String(text) : String(text).toUpperCase(), track = `${f.spacing * 96}px`;
    const probe = document.createElement('canvas').getContext('2d'); probe.font = font; probe.letterSpacing = track;
    const w = Math.ceil(probe.measureText(str).width) + 40, tex = canvasTex(w, 150, c => { c.font = font; c.letterSpacing = track; c.fillStyle = color; c.textBaseline = 'middle'; c.fillText(str, 20, 80); });
    const mesh = new T.Mesh(new T.PlaneGeometry(h * w / 150, h), new T.MeshBasicMaterial({map: tex, transparent: true, depthWrite: false}));
    if (align !== 'center') mesh.geometry.translate((align === 'left' ? 1 : -1) * h * w / 300, 0, 0);
    mesh.userData.width = h * w / 150; return mesh;
  };
  return {...st, render, view, dark, ink, mat, flat, bar, hoop, shadow, disc, label, canvasTex};
}
