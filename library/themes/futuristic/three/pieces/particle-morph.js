import {glowStage, rand} from './_fx.js';

// 26,000 points that flow between four forms — sphere, cube, torus, wave sheet — and back.
// "transformation", "the data takes shape", "one thing becoming another". Seamless loop.
export const meta = {duration: 12, loop: true};
const N = 26000;

export function mount(el) {
  const {T, scene, camera, mat, geo, fit, dust, play} = glowStage(el, {fov: 36, glow: .9});
  const a = [], b = [], c = [], d = [], seed = [];
  for (let i = 0; i < N; i++) {
    const u = rand(i + .1), v = rand(i * 1.37 + 5), w = rand(i * 2.11 + 9);
    // sphere: golden-angle spiral, so the points sit evenly
    const y = 1 - 2 * (i + .5) / N, r = Math.sqrt(1 - y * y), phi = i * 2.399963;
    a.push(2.5 * r * Math.cos(phi), 2.5 * y, 2.5 * r * Math.sin(phi));
    // cube: points on the six faces, snapped to a lattice so it reads as a grid of data
    const face = i % 6, s = 2, g = x => Math.round((x * 2 - 1) * 14) / 14 * s, p = [g(u), g(v)], axis = face >> 1, sign = face & 1 ? s : -s;
    const q = [0, 0, 0]; q[axis] = sign; q[(axis + 1) % 3] = p[0]; q[(axis + 2) % 3] = p[1]; b.push(...q);
    // torus
    const tu = u * Math.PI * 2, tv = Math.round(v * 28) / 28 * Math.PI * 2;
    c.push((2.3 + .85 * Math.cos(tv)) * Math.cos(tu), .85 * Math.sin(tv), (2.3 + .85 * Math.cos(tv)) * Math.sin(tu));
    // wave sheet (bent in the shader)
    d.push((Math.round(u * 90) / 90 * 2 - 1) * 2.7, 0, (v * 2 - 1) * 2.7);
    seed.push(w);
  }
  const points = new T.Points(geo({position: [a, 3], aCube: [b, 3], aTorus: [c, 3], aSheet: [d, 3], aSeed: [seed, 1]}), mat(/* glsl */`
    attribute vec3 aCube, aTorus, aSheet; attribute float aSeed; uniform float uM; varying vec3 vCol; varying float vA;
    void main() {
      // each point leaves a little later the further up it sits, so a morph sweeps through the form
      float k = floor(uM), delay = aSeed * .35 + .2 * (position.y / 5. + .5);
      float f = smoothstep(delay, delay + .45, fract(uM)), m = mod(k + f, 4.);
      vec3 sheet = aSheet; sheet.y = .55 * sin(sheet.x * 2.1 + uTime * TAU / 3.) * cos(sheet.z * 1.7 + uTime * TAU / 6.);
      vec3 p = position * max(max(0., 1. - abs(m)), 1. - abs(m - 4.)) + aCube * max(0., 1. - abs(m - 1.)) + aTorus * max(0., 1. - abs(m - 2.)) + sheet * max(0., 1. - abs(m - 3.));
      float mid = sin(f * PI);                                  // 0 at rest, 1 half way through a morph
      p += hash3(vec3(aSeed * 91., k, 3.)) * mid * .6 + vec3(noise(p * .9 + k), noise(p * .9 + 11.), noise(p * .9 + 23.)) * mid * .55;
      vec4 mv = modelViewMatrix * vec4(p, 1.);
      float spark = step(.965, aSeed);
      vCol = mix(mix(CYAN, MAGENTA, smoothstep(-2.2, 2.4, p.y + p.x * .35)), AMBER, spark) + WHITE * mid * .12;
      vA = .32 + .5 * spark - mid * .1;
      gl_PointSize = (.05 + .06 * spark + .03 * mid) * uPx / -mv.z; gl_Position = projectionMatrix * mv;
    }`, /* glsl */`
    varying vec3 vCol; varying float vA;
    void main() { gl_FragColor = vec4(vCol * sprite(gl_PointCoord) * vA, 1.); }`, {uM: {value: 0}}));
  scene.add(points);
  dust({count: 200, box: [20, 20, 10], center: [0, 0, -5], loop: meta.duration});

  return play(t => {
    // 3 seconds per form: hold for 1.7, morph for 1.3
    const step = t / 3, k = Math.floor(step), f = Math.max(0, (step - k) * 3 - 1.7) / 1.3;
    points.material.uniforms.uM.value = (k + Math.min(f, .9999)) % 4;
    points.rotation.set(.42 + .12 * Math.sin(t * Math.PI / 6), t * Math.PI / 6, .1);
    camera.position.z = fit(3.3);
  });
}
