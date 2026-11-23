import {glowStage, rand} from './_fx.js';
import {span, easeOut} from '../../hud.js';

// A double helix built from thousands of points: two glowing strands joined by colour-paired rungs.
// It grows from one end, turns slowly, and pulses of light run along it; points away from the focal
// plane swell into soft discs, which gives it depth. "biology", "the code of life", "what it is made of".
export const meta = {duration: 8};

export function mount(el) {
  const {T, scene, camera, mat, geo, aspect, fitBox, play} = glowStage(el, {fov: 34, glow: 1});
  const pos = [], info = [];   // info: s (0..1 along the helix), kind (0/1 strands, 2..5 rung colours), seed
  const TURNS = 3.2, LEN = 11, R = 1.3, RUNGS = 34;
  const at = (s, flip) => { const a = s * TURNS * 6.2832 + (flip ? Math.PI : 0); return [Math.cos(a) * R, (s - .5) * LEN, Math.sin(a) * R]; };
  for (let strand = 0; strand < 2; strand++) for (let i = 0; i < 5200; i++) {
    const s = rand(i + strand * 9000), p = at(s, strand), halo = rand(i * 3.3 + 1) < .2 ? .34 : .085;
    const j = k => (rand(i * 1.7 + k * 77 + strand * 13) - .5) * 2 * halo;
    pos.push(p[0] + j(1), p[1] + j(2), p[2] + j(3)); info.push(s, strand, rand(i + 31 + strand));
  }
  for (let r = 0; r < RUNGS; r++) { const s = (r + .5) / RUNGS, a = at(s, 0), b = at(s, 1), pair = r * 7 % 4 < 2 ? 2 : 4;
    for (let i = 0; i < 46; i++) { const u = .08 + .84 * i / 45, k = rand(r * 50 + i); pos.push(a[0] + (b[0] - a[0]) * u, a[1] + (k - .5) * .04, a[2] + (b[2] - a[2]) * u); info.push(s, pair + (u > .5 ? 1 : 0), k); } }
  const uniforms = {uGrow: {value: 0}, uFocus: {value: 10}};
  const helix = new T.Points(geo({position: [pos, 3], aInfo: [info, 3]}), mat(/* glsl */`
    attribute vec3 aInfo; uniform float uGrow, uFocus; varying vec3 vCol; varying float vA;
    void main() {
      float s = aInfo.x, kind = aInfo.y;
      vec3 p = position; p.xz *= 1. + .06 * sin(uTime * 1.7 + s * 9.);
      vec4 mv = modelViewMatrix * vec4(p, 1.);
      float pulse = pow(.5 + .5 * sin((s * 3. - uTime * .55 + (kind < 1.5 ? kind * .5 : .25)) * TAU), 14.);
      vCol = kind < .5 ? CYAN : kind < 1.5 ? MAGENTA : kind < 2.5 ? AMBER : kind < 3.5 ? TEAL : kind < 4.5 ? WHITE : MAGENTA;
      vCol = mix(vCol, WHITE, pulse * .4);
      float blur = abs(-mv.z - uFocus) * .16, size = (kind < 1.5 ? .05 + .05 * aInfo.z : .075) * (1. + blur * 5.) * (1. + pulse);
      float front = smoothstep(0., .04, uGrow * 1.06 - s);
      vA = front * (.34 + .5 * pulse) / (1. + blur * blur * 26.) * (kind < 1.5 ? .7 : 1.);
      vA += exp(-abs(uGrow * 1.06 - s) * 60.) * step(uGrow, .99) * .8;      // the growing tip burns bright
      gl_PointSize = size * uPx / -mv.z; gl_Position = projectionMatrix * mv;
    }`, `varying vec3 vCol; varying float vA; void main() { gl_FragColor = vec4(vCol * sprite(gl_PointCoord) * vA, 1.); }`, uniforms));
  scene.add(helix);

  const dust = [], seeds = [];
  for (let i = 0; i < 380; i++) { dust.push((rand(i + .5) - .5) * 16, (rand(i + 200) - .5) * 20, (rand(i + 400) - .5) * 14); seeds.push(rand(i + 600)); }
  scene.add(new T.Points(geo({position: [dust, 3], aSeed: [seeds, 1]}), mat(/* glsl */`
    attribute float aSeed; uniform float uFocus; varying vec3 vCol; varying float vA;
    void main() { vec3 p = position + vec3(sin(uTime * .3 + aSeed * 20.) * .3, uTime * (.08 + .12 * aSeed), 0.);
      vec4 mv = modelViewMatrix * vec4(p, 1.); float blur = abs(-mv.z - uFocus) * .16;
      vCol = aSeed > .8 ? MAGENTA : CYAN; vA = .5 / (1. + blur * blur * 20.);
      gl_PointSize = .06 * (1. + blur * 6.) * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`,
    `varying vec3 vCol; varying float vA; void main() { gl_FragColor = vec4(vCol * sprite(gl_PointCoord) * vA, 1.); }`, uniforms)));

  return play(t => {
    const tall = aspect() < .8, tilt = tall ? .22 : .7;
    uniforms.uGrow.value = easeOut(span(t, .2, 2.6));
    helix.rotation.set(0, t * .6, 0); helix.rotation.order = 'ZXY'; helix.rotation.z = -tilt; helix.rotation.x = .1;
    const d = (tall ? fitBox(2.9, 5.6) : fitBox(5.3, 5.3)) * (1.15 - .15 * easeOut(span(t, 0, 4)));
    camera.position.set(0, 0, d); uniforms.uFocus.value = d - .7;
  });
}
