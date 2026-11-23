import {glowStage, rand} from './_fx.js';
import {span, easeOut} from '../../hud.js';

// A circuit board waking up: traces route themselves outward from a central chip in 45-degree runs,
// end in pads, and then carry comets of current from the chip to every pad, which flash on arrival.
// "hardware", "the chip", "processing", "power on", "how the signal gets there".
export const meta = {duration: 8};
const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]], LIMIT = 19, CHIP = 3;

export function mount(el) {
  const {T, scene, camera, mat, geo, aspect, dust, play} = glowStage(el, {fov: 38, glow: 1.1});
  // Route the traces on a lattice. Every node and every diagonal crossing can be used once, so traces never overlap.
  const used = new Set(), traces = [];
  for (let x = -CHIP; x <= CHIP; x++) for (let y = -CHIP; y <= CHIP; y++) used.add(x + ',' + y);
  const walk = (x, y, heading, steps, seed) => {
    const points = [[x, y]]; let dir = heading;
    for (let i = 0; i < steps; i++) {
      const roll = rand(seed * 17 + i * 3.1), want = i < 2 ? heading : roll < .22 ? dir + 1 : roll < .44 ? dir - 1 : dir;
      const turn = Math.max(-1, Math.min(1, ((want - heading + 12) % 8) - 4));       // stay within 45 degrees of the way out
      dir = (heading + turn + 8) % 8;
      const nx = x + DIRS[dir][0], ny = y + DIRS[dir][1], cross = (x + nx) / 2 + ',' + (y + ny) / 2;
      if (used.has(nx + ',' + ny) || used.has(cross) || Math.abs(nx) > LIMIT || Math.abs(ny) > LIMIT) break;
      used.add(nx + ',' + ny); used.add(cross); points.push([x = nx, y = ny]);
    }
    if (points.length > 3) traces.push({points, seed: rand(seed + .5)});
  };
  let id = 0;
  for (let side = 0; side < 4; side++) for (let i = -CHIP; i <= CHIP; i++) {
    const [dx, dy] = DIRS[side * 2], x = dx ? dx * CHIP : i, y = dy ? dy * CHIP : i;
    walk(x, y, side * 2, 8 + Math.floor(rand(++id) * 16), id);
  }
  // Each run of a trace becomes a thin quad lying on the board; aD is the distance travelled along the trace.
  const pos = [], info = [], index = [], pads = [], padInfo = [], W = .11;
  traces.forEach(({points, seed}) => {
    let d = 0; const total = points.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - points[i][0], p[1] - points[i][1]), 0);
    for (let i = 1; i < points.length; i++) {
      const [ax, ay] = points[i - 1], [bx, by] = points[i], len = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / len, uy = (by - ay) / len, base = pos.length / 3;
      [[-W, -1, d - W], [-W, 1, d - W], [len + W, -1, d + len + W], [len + W, 1, d + len + W]].forEach(([along, across, dist]) => {
        pos.push(ax + ux * along - uy * across * W, 0, ay + uy * along + ux * across * W); info.push(dist, total, seed, across); });
      index.push(base, base + 1, base + 2, base + 1, base + 3, base + 2); d += len;
    }
    const end = points[points.length - 1]; pads.push(end[0], 0, end[1]); padInfo.push(total, seed);
  });
  const uniforms = {uOn: {value: 0}};
  const flow = /* glsl */`
    uniform float uOn;
    float grown(float seed) { return max(0., uTime - .5 - seed * .9) * 11.; }               // how far each trace has routed itself
    float charge(float seed, float total) { return fract(uTime * .3 + seed * 3.) * (total + 14.); }   // where its comet is
    vec3 tint(float seed) { float k = hash(seed * 53.); return k > .82 ? AMBER : k > .62 ? MAGENTA : CYAN; }`;
  const board = new T.Group(); board.scale.setScalar(.5); scene.add(board);
  const lines = geo({position: [pos, 3], aInfo: [info, 4]}); lines.setIndex(index);
  board.add(new T.Mesh(lines, mat(flow + `attribute vec4 aInfo; varying vec4 vI; void main() { vI = aInfo; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`, flow + /* glsl */`
    varying vec4 vI;
    void main() { float d = vI.x, g = grown(vI.z), q = charge(vI.z, vI.y), across = 1. - vI.w * vI.w;
      float tip = exp(-max(0., g - d) * .9) * step(g, vI.y + 2.), comet = step(d, q) * exp(-(q - d) * .32) * step(vI.y, g);
      gl_FragColor = vec4((TEAL * .34 + tint(vI.z) * comet * 1.5 + WHITE * (tip * 1.2 + comet * comet * .5)) * step(d, g) * across, 1.); }`, uniforms, {side: T.DoubleSide})));
  board.add(new T.Points(geo({position: [pads, 3], aInfo: [padInfo, 2]}), mat(flow + /* glsl */`
    attribute vec2 aInfo; varying float vOn, vFlash; varying vec3 vCol;
    void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); float q = charge(aInfo.y, aInfo.x);
      vOn = step(aInfo.x, grown(aInfo.y)); vFlash = step(aInfo.x, q) * exp(-(q - aInfo.x) * .3); vCol = tint(aInfo.y);
      gl_PointSize = (.42 + .2 * vFlash) * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`, /* glsl */`
    varying float vOn, vFlash; varying vec3 vCol;
    void main() { float d = length(gl_PointCoord - .5) * 2.;
      gl_FragColor = vec4((TEAL * smoothstep(.12, .03, abs(d - .5)) + mix(vCol, WHITE, .4) * vFlash * (smoothstep(.45, .0, d) * 1.8 + pow(max(0., 1. - d), 2.) * .7)) * vOn, 1.); }`, uniforms)));

  // The board itself: a faint dot lattice, and the chip in the middle.
  const plane = new T.Mesh(new T.PlaneGeometry(120, 120), mat(`varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`, /* glsl */`
    uniform float uOn; varying vec2 vP;
    void main() { vec2 g = abs(fract(vP - .5) - .5); float dotv = smoothstep(.09, .04, length(g)), r = length(vP);
      vec2 a = abs(vP); float box = max(a.x, a.y), chip = step(box, ${CHIP}. + .45);
      float edge = smoothstep(.09, .02, abs(box - ${CHIP}. - .45)) + smoothstep(.06, .02, abs(box - ${CHIP}. + .5)) * .5;
      vec2 cg = abs(fract(vP * 2.) - .5); float cells = smoothstep(.42, .48, max(cg.x, cg.y)) * step(box, ${CHIP}. - .5);
      float beat = .5 + .5 * sin(uTime * 3.), core = exp(-r * (1.3 - .3 * beat));
      float wave = exp(-abs(r - fract(uTime * .3) * 30.) * .8) * .5;
      vec3 c = TEAL * dotv * (.2 + wave) * exp(-r * .045) * (1. - chip) + chip * (CYAN * (edge + cells * (.12 + .25 * core)) + AMBER * core * (.5 + .3 * beat));
      gl_FragColor = vec4(c * uOn, 1.); }`, uniforms, {side: T.DoubleSide}));
  plane.rotation.x = Math.PI / 2; plane.position.y = -.02; board.add(plane);

  dust({count: 160, box: [20, 5, 20], center: [0, 2.5, 0], size: .05});

  return play(t => {
    uniforms.uOn.value = easeOut(span(t, 0, .8));
    board.rotation.y = .5 + t * .07;
    const tall = aspect() < .8, pull = 1.14 - .14 * easeOut(span(t, 0, 5)), d = (tall ? 32 : 24) * pull, tilt = tall ? 1.0 : .86;
    camera.position.set(0, Math.sin(tilt) * d, Math.cos(tilt) * d); camera.lookAt(0, 0, tall ? -.6 : .4);
  });
}
