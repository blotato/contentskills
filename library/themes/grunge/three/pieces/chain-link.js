import {xeroxStage, VERT, C, hash, jit} from './_fx.js';

// Walking through chain-link fences at night: wire diamonds slide past in layers, a big halftone
// moon hangs behind, and torn red rags are knotted to the wire. Held on twos. Loops.
export const meta = {duration: 4, loop: true};
export const defaults = {rags: 3};

const WIRE = /* glsl */`
uniform float uShade; varying vec2 vUv; varying vec3 vObj;
void main() {
  vec2 p = vObj.xy * 1.15, q = vec2(p.x + p.y, p.x - p.y);
  vec2 f = abs(fract(q) - .5);
  float wire = max(step(.455, f.x), step(.455, f.y));
  float post = step(abs(fract(vObj.x / 9. + .5) - .5) * 9., .11), rail = step(abs(vObj.y - 4.6), .09);
  if (max(wire, max(post, rail)) < .5) discard;
  float twist = .75 + .25 * sin((q.x + q.y) * 18.);
  gl_FragColor = vec4(vec3(uShade * (wire > .5 && post + rail < .5 ? twist : 1.1)), 1.);
}`;

export function mount(el, props = defaults) {
  const {T, scene, camera, shader, flat, mesh, tornGeo, play} = xeroxStage(el, {dots: .9, grain: .22, cells: 80, contrast: 1.2});
  const gap = 7, layers = 5, fences = Array.from({length: layers + 1}, (_, i) => { const mat = shader(VERT, WIRE, {uShade: {value: 1}}), m = mesh(new T.PlaneGeometry(60, 9.6), mat); m.position.y = .2; return m; });
  const moon = mesh(new T.CircleGeometry(7, 48), flat('#b9b3a5')); moon.position.set(8, 9, -44);
  const ground = mesh(new T.PlaneGeometry(200, 80), flat('#1c1b19')); ground.rotation.x = -Math.PI / 2; ground.position.set(0, -4.6, -30);
  const red = flat(C.red), n = Math.min(8, props.rags);
  // every fence carries the same rags, so the loop closes when one fence takes the place of the next
  const rags = fences.flatMap(f => Array.from({length: n}, (_, i) => { const m = mesh(tornGeo(.45 + hash(i, 1) * .4, .9 + hash(i, 2) * .8, i + 2, .12, .12), red, f); m.position.set((hash(i, 3) - .5) * 16, (hash(i, 4) - .3) * 5, .05); m.userData = {r: (hash(i, 5) - .5) * .8, i}; return m; }));
  return play((th, t, s) => {
    const u = th / meta.duration, step = Math.floor(th * 12);
    fences.forEach((f, i) => { const z = -((i + 1) * gap) + u * gap + 8; f.position.z = z; f.material.uniforms.uShade.value = Math.max(.12, Math.min(1, 1.05 + z / 30)); });
    // the nearest fence leaves as the farthest one arrives: fences are identical, so the loop closes
    rags.forEach(m => { const j = jit(Math.floor(step / 2) + m.userData.i, m.userData.i, .03, .12); m.rotation.z = m.userData.r + j.r; });
    const j = jit(Math.floor(step / 2), 6, .05, 0); camera.position.set(j.x, .4 + j.y + .12 * Math.sin(u * Math.PI * 4), 6); camera.lookAt(0, .6, -20);
  });
}
