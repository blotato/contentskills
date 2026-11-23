// What every 3D scene in the horror theme starts from: a dark Three.js stage with distance fog,
// and — laid over the canvas so 3D matches the 2D pieces — the theme's vignette, 12 fps grain and
// failing-lamp dips. Build the scene, then call finish(t) at the end of seek.
import {threeStage, hex} from '/library/_shared/kit.js';
import {C, hash, lamp, step, clamp, grainURL} from '../../kit.js';
export {hex};
export * from '../../kit.js';

export function scene(el, {background = '#050709', fov = 40, z = 10, fog = null, vignette = .9, flicker = .5} = {}) {
  const s = threeStage(el, {fov, background, z}), {T} = s;
  s.renderer.toneMapping = T.NoToneMapping;
  if (fog) s.scene.fog = new T.FogExp2(hex(fog[0]), fog[1]);
  const layer = css => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;inset:0;pointer-events:none;' + css; el.append(d); return d; };
  layer(`background:radial-gradient(ellipse 75% 62% at 50% 48%,rgba(0,0,0,0) 30%,rgba(0,0,0,${.55 * vignette}) 78%,rgba(0,0,0,${vignette}) 100%)`);
  const grain = layer(`background-image:url(${grainURL()});background-size:256px 256px;opacity:.5`), dark = layer('background:#000;opacity:0');
  /** A soft round glow texture (white centre to nothing), for bulbs, moons and light pools. */
  const glowTexture = (() => { let tex; return () => tex ??= (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.55)'); g.addColorStop(.6, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c); })(); })();
  const glow = (color, size, opacity = 1) => { const m = new T.Mesh(new T.PlaneGeometry(size, size), new T.MeshBasicMaterial({map: glowTexture(), color: hex(color), transparent: true, opacity, depthWrite: false, blending: T.AdditiveBlending, fog: false})); return m; };
  const finish = (t, {light = 1} = {}) => {
    const f = step(t); grain.style.backgroundPosition = `${Math.round(hash(f, 1) * 256)}px ${Math.round(hash(f, 2) * 256)}px`;
    dark.style.opacity = clamp(1 - (1 - (1 - lamp(t, 2, .6)) * flicker) * light); s.render();
  };
  return {...s, glow, finish};
}
