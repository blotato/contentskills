import {glowStage} from './_fx.js';
import {C, F, clamp, span, easeOut, easeInOut, typed} from '../../hud.js';

// A stack assembling one named layer at a time: each slab drops in, bounces to rest with a flash and
// gets its numbered label; once the stack is whole, light streams up through it and it breathes.
// For "it is built in steps": a tech stack, stages of a process, tiers, levels.
//   props: layers [label, ...] (2-7), listed bottom first
export const meta = {duration: 8};
export const defaults = {layers: ['DATA', 'MODEL', 'API', 'APP']};
const START = .5, EACH = .6, FALL = .75, GAP = .95, SIDE = 3.3;
const back = q => { const k = clamp(q) - 1; return 1 + 2.7 * k * k * k + 1.7 * k * k; };

export function mount(el, props = defaults) {
  const {T, scene, camera, mat, solid, geo, aspect, fitBox, dust, label, play} = glowStage(el, {fov: 34, glow: 1.1});
  const names = props.layers.slice(0, 7), n = names.length, done = START + (n - 1) * EACH + FALL, yOf = i => (i - (n - 1) / 2) * GAP;
  const stack = new T.Group(); scene.add(stack);
  const g = new T.InstancedBufferGeometry().copy(new T.BoxGeometry(1, 1, 1)); g.instanceCount = n;
  g.setAttribute('aI', new T.InstancedBufferAttribute(new Float32Array(names.map((_, i) => i)), 1));
  const timing = /* glsl */`const float START = ${START}, EACH = ${EACH}, FALL = ${FALL}, DONE = ${done.toFixed(3)};`;
  const slabs = new T.Mesh(g, solid(timing + /* glsl */`
    attribute float aI; varying vec3 vL; varying float vI, vLand, vQ;
    void main() {
      vQ = clamp((uTime - START - aI * EACH) / FALL, 0., 1.); float k = vQ - 1., settle = 1. + 2.7 * k * k * k + 1.7 * k * k;
      float breathe = 1. + .07 * sin(uTime * 1.4) * smoothstep(DONE, DONE + .8, uTime);
      vec3 p = position * vec3(${SIDE}, .2, ${SIDE}) * smoothstep(0., .25, vQ);
      p.xz = rot((1. - settle) * .9) * p.xz;
      p.y += (aI - ${((n - 1) / 2).toFixed(1)}) * ${GAP} * breathe + (1. - settle) * 6.;
      vL = position; vI = aI; vLand = exp(-max(0., uTime - START - aI * EACH - FALL * .62) * 3.2) * step(.62, vQ);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
    }`, timing + /* glsl */`
    varying vec3 vL; varying float vI, vLand, vQ;
    void main() {
      vec3 d = (.5 - abs(vL)) * vec3(${SIDE}, .2, ${SIDE}); float lo = min(d.x, min(d.y, d.z)), hi = max(d.x, max(d.y, d.z)), mid = d.x + d.y + d.z - lo - hi;
      float w = fwidth(mid), edge = 1. - smoothstep(w * .7, w * 2. + .03, mid);
      float m = mod(vI, 4.); vec3 tint = m < .5 ? CYAN : m < 1.5 ? MAGENTA : m < 2.5 ? AMBER : TEAL * 1.4;
      // each layer carries its own surface pattern on the top and bottom faces
      vec2 q = vL.xz * ${SIDE}; float flat_ = step(.49, abs(vL.y)), pat;
      if (m < .5) { vec2 c = abs(fract(q * 2.) - .5); pat = smoothstep(.42, .47, max(c.x, c.y)); }
      else if (m < 1.5) { pat = smoothstep(.38, .46, abs(fract(max(abs(q.x), abs(q.y)) * 2.2 - uTime * .25) - .5)); }
      else if (m < 2.5) { pat = smoothstep(.2, .1, length(fract(q * 2.5) - .5)); }
      else { pat = smoothstep(.36, .46, abs(fract((q.x + q.y) * 1.8 + uTime * .2) - .5)); }
      float flow = exp(-abs(length(q) - fract(uTime * .4 - vI * .2) * 2.6) * 4.) * step(DONE, uTime);
      gl_FragColor = vec4(tint * (edge * 1.1 + flat_ * pat * (.22 + flow * .7) + .03) + WHITE * vLand * (edge + flat_ * .3 + .1), 1.);
    }`));
  slabs.frustumCulled = false; stack.add(slabs);

  // Light streaming up through the finished stack.
  const beams = []; for (let i = 0; i < 260; i++) { const c = i % 5; beams.push(c === 4 ? 0 : (c & 1 ? 1 : -1) * 1.15, i / 260, c === 4 ? 0 : (c & 2 ? 1 : -1) * 1.15); }
  const stream = new T.Points(geo({position: [beams, 3]}), mat(timing + /* glsl */`
    varying float vA;
    void main() { float s = hash(position.y * 91.), y = fract(position.y * 7.13 + uTime * (.25 + .2 * s)), span_ = ${((n - 1) * GAP + 1.6).toFixed(2)};
      vec4 mv = modelViewMatrix * vec4(position.x + (s - .5) * .08, (y - .5) * span_, position.z + (hash(s * 7.) - .5) * .08, 1.);
      vA = sin(y * PI) * smoothstep(DONE, DONE + .6, uTime) * (.4 + .6 * s); gl_PointSize = (.05 + .07 * s) * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`,
    `varying float vA; void main() { gl_FragColor = vec4(mix(CYAN, WHITE, .5) * sprite(gl_PointCoord) * vA, 1.); }`, {}, {depthTest: true}));
  stream.frustumCulled = false; stack.add(stream);

  const tags = names.map((name, i) => {
    const num = label(String(i + 1).padStart(2, '0'), {size: .3, font: F.display, weight: 700, color: C.amber, anchor: -1}), text = label('', {size: .3, color: C.white, anchor: -1});
    scene.add(num, text); return {num, text};
  });
  dust({count: 240, box: [24, 22, 12], center: [0, 0, -5]});

  return play(t => {
    const tall = aspect() < .8, a = .78 + .1 * Math.sin(t * .35), half = (n - 1) * GAP / 2;
    stack.rotation.y = a;
    const breathe = 1 + .07 * Math.sin(t * 1.4) * clamp((t - done) / .8), reach = SIDE * .71 + .35;
    names.forEach((name, i) => { const q = span(t, START + i * EACH + FALL * .7, .3), y = yOf(i) * breathe;
      tags[i].num.show(q).position.set(reach, y, 0); tags[i].text.set(typed(String(name), span(t, START + i * EACH + FALL * .75, .35))).show(q).position.set(reach + .62, y, 0); });
    const follow = easeInOut(span(t, START, (n - 1) * EACH + FALL)), look = -half * (1 - follow) * .7;
    const d = (tall ? fitBox(4.3, half + 2.2) : fitBox(4.6, half + 1.7)) * (1.15 - .15 * follow);
    camera.position.set(1.15, look + Math.sin(.42) * d, Math.cos(.42) * d); camera.lookAt(1.15, look, 0);
  });
}
