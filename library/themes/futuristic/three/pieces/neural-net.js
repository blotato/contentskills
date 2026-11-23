import {glowStage, rand} from './_fx.js';
import {span, easeOut} from '../../hud.js';

// A neural network in space: layers of ring-shaped nodes wired together, with waves of signal
// travelling down the connections and each node flaring as the signal reaches it.
// "AI", "the model thinks", "learning", "how the decision is made". On a tall frame the layers stack vertically.
export const meta = {duration: 8};
const LAYERS = [5, 8, 10, 8, 3], RATE = .42, GAP = .3;

export function mount(el) {
  const {T, scene, camera, mat, geo, aspect, fitBox, dust, play} = glowStage(el, {fov: 34, glow: 1.1});
  const net = new T.Group(); scene.add(net);
  const nodes = [];
  LAYERS.forEach((count, l) => { for (let i = 0; i < count; i++) {
    const a = i / count * 6.2832 + l * .9, r = count < 4 ? .8 : 1.1 + count * .12 + (i % 2) * .5;
    nodes.push({l, p: [(l - (LAYERS.length - 1) / 2) * 2.5 + (rand(l * 20 + i) - .5) * .3, Math.cos(a) * r, Math.sin(a) * r], seed: rand(l * 31 + i + 5)});
  } });
  const fireAt = l => l === 0 ? 0 : (l - 1) * GAP + 1 / 1.6;     // when (in cycles) the wave reaches layer l
  const uniforms = {uBuild: {value: 0}};
  const head = /* glsl */`uniform float uBuild; const float RATE = ${RATE}, GAP = ${GAP};`;

  const ea = [], eb = [], einfo = [], lpos = [], linfo = [];
  nodes.forEach((a, i) => nodes.forEach((b, j) => {
    if (b.l !== a.l + 1 || rand(i * 53 + j * 7.3) > (LAYERS[b.l] < 5 ? .8 : .42)) return;
    const seed = rand(i * 11 + j * 3.7);
    ea.push(...a.p); eb.push(...b.p); einfo.push(a.l, seed);
    lpos.push(...a.p, ...b.p); linfo.push(0, a.l, seed, 1, a.l, seed);
  }));
  // q runs 0..1 along a connection while its pulse is in flight, then waits for the next wave
  const flight = `float flight(float layer, float seed) { return fract(uTime * RATE - layer * GAP - seed * .06) * 1.6; }`;
  net.add(new T.LineSegments(geo({position: [lpos, 3], aInfo: [linfo, 3]}), mat(head + flight + /* glsl */`
    attribute vec3 aInfo; varying float vU, vQ, vOn;
    void main() { vU = aInfo.x; vQ = flight(aInfo.y, aInfo.z); vOn = smoothstep(0., .25, uBuild * 6. - aInfo.y - .8);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`, /* glsl */`
    varying float vU, vQ, vOn;
    void main() { float tail = max(0., vQ - vU), comet = step(vU, vQ) * exp(-tail * 7.) * step(vQ, 1.25);
      gl_FragColor = vec4((TEAL * .16 + mix(CYAN, WHITE, .3) * comet * 1.1) * vOn, 1.); }`, uniforms)));
  net.add(new T.Points(geo({position: [ea, 3], aEnd: [eb, 3], aInfo: [einfo, 2]}), mat(head + flight + /* glsl */`
    attribute vec3 aEnd; attribute vec2 aInfo; varying float vA;
    void main() { float q = flight(aInfo.x, aInfo.y); vec4 mv = modelViewMatrix * vec4(mix(position, aEnd, min(q, 1.)), 1.);
      vA = step(q, 1.) * smoothstep(0., .08, q) * step(aInfo.x + 1.2, uBuild * 6.);
      gl_PointSize = .2 * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`,
    `varying float vA; void main() { gl_FragColor = vec4(mix(MAGENTA, WHITE, .35) * sprite(gl_PointCoord) * vA, 1.); }`, uniforms)));

  net.add(new T.Points(geo({position: [nodes.flatMap(n => n.p), 3], aInfo: [nodes.flatMap(n => [n.l, n.seed, fireAt(n.l)]), 3]}), mat(head + /* glsl */`
    attribute vec3 aInfo; varying float vFire, vOn; varying vec3 vCol;
    void main() { vec4 mv = modelViewMatrix * vec4(position, 1.);
      vFire = exp(-fract(uTime * RATE - aInfo.z - aInfo.y * .06) * 5.5);
      vOn = clamp(uBuild * 6. - aInfo.x, 0., 1.);
      vCol = aInfo.x > ${LAYERS.length - 1.5} ? AMBER : aInfo.x < .5 ? MAGENTA : CYAN;
      gl_PointSize = (.62 + .25 * vFire) * (.4 + .6 * vOn) * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`, /* glsl */`
    varying float vFire, vOn; varying vec3 vCol;
    void main() { float d = length(gl_PointCoord - .5) * 2.;
      float ring = smoothstep(.09, .02, abs(d - .62)), core = smoothstep(.36, .0, d), halo = pow(max(0., 1. - d), 2.);
      gl_FragColor = vec4((vCol * (ring * .9 + core * .25 + halo * .15) + mix(vCol, WHITE, .6) * vFire * (core * 1.6 + halo * .8 + ring * .5)) * vOn, 1.); }`, uniforms)));

  dust({count: 240, box: [22, 22, 12], center: [0, 0, -3]});

  return play(t => {
    uniforms.uBuild.value = easeOut(span(t, .1, 2.2));
    const tall = aspect() < .8;
    // spin about the network's own long axis first, then sway, then stand it upright on tall frames
    net.rotation.order = 'ZYX'; net.rotation.set(t * .22, .4 * Math.sin(t * .33 - .6), tall ? -Math.PI / 2 : 0);
    camera.position.set(0, 0, (tall ? fitBox(3.4, 6.1) : fitBox(5.9, 3.5)) * (1.18 - .18 * easeOut(span(t, 0, 3.5))));
  });
}
