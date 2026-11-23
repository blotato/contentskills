import {glowStage} from './_fx.js';
import {C, F, clamp, span, easeOut} from '../../hud.js';

// A 3D bar chart: glowing columns rise from a mirrored floor with a little overshoot, each counting
// up to its value, the largest (or the one you choose) picked out in amber; the camera swings round
// and settles. For comparing a handful of numbers that the narration actually states.
//   props: items [{label, value}] (2-8), unit (suffix such as '%'), highlight (index, or -1 for the largest),
//          note (small caption under the chart; say where the numbers come from)
export const meta = {duration: 7};
export const defaults = {
  items: [{label: 'ALPHA', value: 42}, {label: 'BETA', value: 68}, {label: 'GAMMA', value: 55}, {label: 'DELTA', value: 91}, {label: 'OMEGA', value: 73}],
  unit: '', highlight: -1, note: 'ILLUSTRATIVE DATA',
};
const back = q => { const k = clamp(q) - 1; return 1 + 2.7 * k * k * k + 1.7 * k * k; };
const START = .7, STAGGER = .22, RISE = .9, TOP = 4.2;

export function mount(el, props = defaults) {
  const {T, scene, camera, mat, solid, fitBox, dust, label, play} = glowStage(el, {fov: 34, glow: 1.05});
  const items = props.items.slice(0, 8), n = items.length, gap = n > 6 ? 1.05 : 1.25, max = Math.max(...items.map(d => d.value), 1e-9);
  const hot = props.highlight >= 0 ? props.highlight : items.findIndex(d => d.value === max);
  const xs = items.map((_, i) => (i - (n - 1) / 2) * gap), hs = items.map(d => Math.max(.12, d.value / max * TOP));
  const g = new T.InstancedBufferGeometry().copy(new T.BoxGeometry(1, 1, 1)); g.instanceCount = n;
  g.setAttribute('aBar', new T.InstancedBufferAttribute(new Float32Array(items.flatMap((_, i) => [xs[i], hs[i], i, i === hot ? 1 : 0])), 4));
  const shader = [/* glsl */`
    attribute vec4 aBar; uniform float uMirror; varying vec3 vL, vS; varying float vHot, vQ, vWorldY;
    void main() {
      vQ = clamp((uTime - ${START} - aBar.z * ${STAGGER}) / ${RISE}, 0., 1.); float k = vQ - 1., grow = max(.001, 1. + 2.7 * k * k * k + 1.7 * k * k);
      vS = vec3(.78, aBar.y * grow, .78); vL = position; vHot = aBar.w;
      vec3 p = position * vS + vec3(aBar.x, vS.y * .5, 0.); p.y *= uMirror; vWorldY = p.y;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
    }`, /* glsl */`
    uniform float uMirror; varying vec3 vL, vS; varying float vHot, vQ, vWorldY;
    void main() {
      vec3 d = (.5 - abs(vL)) * vS; float lo = min(d.x, min(d.y, d.z)), hi = max(d.x, max(d.y, d.z)), mid = d.x + d.y + d.z - lo - hi;
      float w = fwidth(mid), edge = 1. - smoothstep(w * .7, w * 2. + .03, mid), y = (vL.y + .5) * vS.y;
      vec3 tint = mix(CYAN, AMBER, vHot);
      float marks = smoothstep(.04, .0, abs(fract(y * 2.) - .5) - .45) * .22 * (1. - abs(vL.y) * 0.);
      float fill = .04 + .2 * pow(y / max(vS.y, .01), 2.5), cap = smoothstep(.1, 0., vS.y - y);
      float sweep = exp(-abs(y - fract(uTime * .28) * 7.) * 5.) * .45 * step(1., vQ);
      vec3 c = tint * (edge * 1.1 + marks + fill + cap * .5 + sweep) + WHITE * cap * edge * .4;
      gl_FragColor = vec4(c * (uMirror > 0. ? 1. : .22 * exp(vWorldY * .7)), 1.);
    }`];
  const bars = new T.Group(); scene.add(bars);
  [1, -1].forEach(m => { const mesh = new T.Mesh(g, solid(shader[0], shader[1], {uMirror: {value: m}}, {side: T.DoubleSide})); mesh.frustumCulled = false; bars.add(mesh); });
  const floor = new T.Mesh(new T.PlaneGeometry(60, 60), mat(`varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`, /* glsl */`
    varying vec2 vP;
    void main() { vec2 c = vP / ${gap.toFixed(2)} + .5 * ${(n % 2 ? 1 : 0).toFixed(1)}, g = abs(fract(c) - .5), w = fwidth(c); vec2 l2 = 1. - smoothstep(.5 - w * 1.8 - .005, .5 - w * .5, g) ; l2 = 1. - l2;
      float l = max(l2.x, l2.y) * (1. - smoothstep(.25, .6, max(w.x, w.y))), r = length(vP);
      float ring = exp(-abs(r - fract(uTime * .22) * 16.) * 1.4) * .5;
      gl_FragColor = vec4(TEAL * l * (.3 + ring) * exp(-r * .16) * smoothstep(0., .8, uTime), 1.); }`, {}, {depthTest: true, side: T.DoubleSide}));
  floor.rotation.x = -Math.PI / 2; bars.add(floor);

  const fmt = v => (Number.isInteger(max) && items.every(d => Number.isInteger(d.value)) ? Math.round(v) : v.toFixed(1)) + (props.unit || '');
  const values = items.map((d, i) => { const l = label(fmt(0), {size: n > 6 ? .34 : .4, font: F.display, weight: 700, color: i === hot ? C.amber : C.white}); bars.add(l); return l; });
  const names = items.map((d, i) => { const l = label(d.label, {size: Math.min(.27, gap * 1.5 / Math.max(4, String(d.label).length)), color: i === hot ? C.amber : C.dim}); l.position.set(xs[i], -.42, .7); bars.add(l); return l; });
  const note = label(props.note || '', {size: .17, color: C.dim}); note.position.set(0, -1.02, .7); bars.add(note);
  dust({count: 220, box: [26, 14, 14], center: [0, 4, -6]});

  return play(t => {
    items.forEach((d, i) => { const q = span(t, START + i * STAGGER, RISE);
      values[i].set(fmt(d.value * easeOut(q))).show(span(t, START + i * STAGGER + .1, .25)).position.set(xs[i], hs[i] * back(q) + .42, 0);
      names[i].show(span(t, .4 + i * .08, .3)); });
    note.show(props.note ? span(t, 1.6, .5) * .8 : 0);
    const a = .85 - .6 * easeOut(span(t, 0, 3.6)) - .012 * t * 4, d = fitBox(n * gap / 2 + .9, 3.5) * (1.12 - .12 * easeOut(span(t, 0, 4)));
    camera.position.set(Math.sin(a) * d, 2.2 + 1.3 * Math.cos(a) * .5 + .4, Math.cos(a) * d); camera.lookAt(0, 1.75, 0);
  });
}
