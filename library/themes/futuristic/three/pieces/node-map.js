import {glowStage, rand} from './_fx.js';
import {C, F, clamp, span, easeOut, easeBack, typed} from '../../hud.js';

// A labelled hub-and-spoke network: the hub lights, links draw out to each named node, the nodes pop
// in and their labels type on; then signals keep running both ways while the whole map sways in depth.
// For "how the parts connect": a system and its components, a company and its channels, a model and its tools.
//   props: center (hub label), nodes [label, ...] (3-10)
export const meta = {duration: 8};
export const defaults = {center: 'CORE', nodes: ['INPUT', 'MEMORY', 'MODEL', 'TOOLS', 'OUTPUT', 'USERS']};
const LINK = .9, EACH = .14, POP = 1.25;

export function mount(el, props = defaults) {
  const {T, scene, camera, mat, geo, aspect, fitBox, dust, label, play} = glowStage(el, {fov: 34, glow: 1.1});
  const names = props.nodes.slice(0, 10), n = names.length, map = new T.Group(); scene.add(map);
  const spots = names.map((_, i) => { const a = -Math.PI / 2 - Math.PI / n + i / n * Math.PI * 2; return [Math.cos(a), -Math.sin(a) * (i % 2 ? 1 : .82), (rand(i + 3) - .5) * .7]; });
  const head = /* glsl */`const float LINK = ${LINK}, EACH = ${EACH}, POP = ${POP};
    float drawn(float i) { return clamp((uTime - LINK - i * EACH) / .5, 0., 1.); }
    float flight(float i) { return fract(uTime * .45 - i * .17) * 1.7; }`;

  const lp = [], li = [], rp = [], ri = [];
  spots.forEach((p, i) => { lp.push(0, 0, 0, ...p); li.push(0, i, 1, i); const q = spots[(i + 1) % n]; rp.push(...p, ...q); ri.push(0, i, 1, i); });
  map.add(new T.LineSegments(geo({position: [lp, 3], aInfo: [li, 2]}), mat(head + `attribute vec2 aInfo; varying vec2 vI; void main() { vI = aInfo; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`, head + /* glsl */`
    varying vec2 vI;
    void main() { float u = vI.x, i = vI.y, q = flight(i), out_ = step(u, q) * exp(-(q - u) * 6.) * step(q, 1.3);
      float back = 1. - fract(uTime * .45 - i * .17 + .5) * 1.7, in_ = step(back, u) * exp(-(u - back) * 6.) * step(-.3, back);
      float d = drawn(i), tip = exp(-abs(d - u) * 14.) * step(d, .999);
      gl_FragColor = vec4((TEAL * .38 + CYAN * out_ * 1.2 + MAGENTA * in_ * 1.1 + WHITE * tip) * step(u, d) * step(.2, u * 0. + 1.), 1.); }`)));
  map.add(new T.LineSegments(geo({position: [rp, 3], aInfo: [ri, 2]}), mat(head + `attribute vec2 aInfo; varying vec2 vI; void main() { vI = aInfo; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    `varying vec2 vI; void main() { gl_FragColor = vec4(TEAL * .22 * step(.5, fract(vI.x * 14. - uTime * .6)) * smoothstep(POP + vI.y * EACH + .4, POP + vI.y * EACH + 1., uTime), 1.); }`.replace('void main', head + 'void main'))));

  const np = [0, 0, 0, ...spots.flat()], ni = [-1, 1, ...spots.flatMap((_, i) => [i, 0])];
  map.add(new T.Points(geo({position: [np, 3], aInfo: [ni, 2]}), mat(head + /* glsl */`
    attribute vec2 aInfo; varying float vHub, vHit, vOn; 
    void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); vHub = aInfo.y; float i = aInfo.x;
      float q = clamp((uTime - (vHub > .5 ? .2 : POP + i * EACH)) / .5, 0., 1.), k = q - 1., pop = 1. + 2.7 * k * k * k + 1.7 * k * k;
      vOn = step(.001, q); vHit = vHub > .5 ? pow(.5 + .5 * sin(uTime * 2.8), 3.) : exp(-max(0., flight(i) - 1.) * 5.) * step(1., flight(i)) * step(POP + 1., uTime);
      gl_PointSize = (vHub > .5 ? 2.1 : .8) * max(0., pop) * (1. + .15 * vHit) * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`, /* glsl */`
    varying float vHub, vHit, vOn;
    void main() { vec2 c = gl_PointCoord - .5; float d = length(c) * 2., a = atan(c.y, c.x);
      vec3 tint = vHub > .5 ? AMBER : CYAN;
      float ring = smoothstep(.07, .02, abs(d - (vHub > .5 ? .5 : .6))), core = smoothstep(.34, 0., d), halo = pow(max(0., 1. - d), 2.);
      float dash = vHub * smoothstep(.04, .01, abs(d - .78)) * step(.4, fract(a / TAU * 12. + uTime * .15)) + vHub * smoothstep(.03, .01, abs(d - .92)) * step(.7, fract(a / TAU * 4. - uTime * .1));
      gl_FragColor = vec4((tint * (ring + core * .3 + halo * .16 + dash * .8) + mix(tint, WHITE, .6) * vHit * (core * 1.3 + halo * .6 + ring * .4)) * vOn, 1.); }`)));
  map.add(new T.Points(geo({position: [spots.flat(), 3], aI: [spots.map((_, i) => i), 1]}), mat(head + /* glsl */`
    attribute float aI; varying float vA;
    void main() { float q = flight(aI); vec4 mv = modelViewMatrix * vec4(position * min(q, 1.), 1.);
      vA = step(q, 1.) * smoothstep(0., .1, q) * step(POP + .6, uTime); gl_PointSize = .22 * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`,
    `varying float vA; void main() { gl_FragColor = vec4(mix(CYAN, WHITE, .5) * sprite(gl_PointCoord) * vA, 1.); }`)));

  const hub = label('', {size: .34, font: F.display, weight: 700, color: C.amber}); map.add(hub);
  const tags = names.map(() => { const l = label('', {size: .27, color: C.white}); map.add(l); return l; });
  dust({count: 240, box: [24, 24, 12], center: [0, 0, -4]});

  return play(t => {
    const tall = aspect() < .8, rx = tall ? 2.25 : 3.5, ry = tall ? 3.7 : 2.25;
    map.scale.set(rx, ry, 1.6); map.rotation.set(.12 * Math.sin(t * .4), .32 * Math.sin(t * .45 - .8), 0);
    hub.set(typed(String(props.center), span(t, .4, .5))).position.set(0, -1.3 / ry, 0);
    names.forEach((name, i) => { const below = spots[i][1] < .1 ? -1 : 1;
      tags[i].set(typed(String(name), span(t, POP + i * EACH + .2, .45))).position.set(spots[i][0], spots[i][1] + below * .47 / ry, spots[i][2]); });
    camera.position.set(0, 0, (tall ? fitBox(3.2, 4.7) : fitBox(4.5, 3.1)) * (1.2 - .2 * easeOut(span(t, 0, 3.5))));
  });
}
