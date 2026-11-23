import {glowStage, rand} from './_fx.js';

// A flight down the main avenue of a wireframe city: instanced towers with glowing edges, lit windows
// and a scrolling street grid, fading into a hazy horizon. The towers are solid black inside, so
// near ones hide far ones. Seamless loop. Backdrop for "the city", "the market", "infrastructure", "scale".
export const meta = {duration: 8, loop: true};
const COLS = 18, ROWS = 22, CELL = 4, LENGTH = ROWS * CELL;

export function mount(el) {
  const {T, scene, camera, mat, solid, play} = glowStage(el, {fov: 66, glow: 1.05});
  const uniforms = {uPhase: {value: 0}};
  const boxes = [], seeds = [];
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    const x = (c - (COLS - 1) / 2) * CELL, k = c * 100 + r;
    if (Math.abs(x) < 3 || rand(k + .7) < .12) continue;                       // the avenue, and a few empty lots
    const near = 1 - Math.min(1, (Math.abs(x) - 2) / 30);
    boxes.push(x, r * CELL, 2.2 + rand(k + 1) * 1.1, 2.5 + Math.pow(rand(k + 2), 2.2) * (10 + 16 * near)); seeds.push(rand(k + 3));
  }
  const towers = new T.InstancedBufferGeometry().copy(new T.BoxGeometry(1, 1, 1)); towers.instanceCount = seeds.length;
  towers.setAttribute('aBox', new T.InstancedBufferAttribute(new Float32Array(boxes), 4));
  towers.setAttribute('aSeed', new T.InstancedBufferAttribute(new Float32Array(seeds), 1));
  const city = new T.Mesh(towers, solid(/* glsl */`
    attribute vec4 aBox; attribute float aSeed; uniform float uPhase; varying vec3 vL, vS, vW, vN; varying float vSeed;
    void main() {
      vS = vec3(aBox.z, aBox.w, aBox.z * (.8 + .35 * aSeed));
      float z = mod(aBox.y + uPhase * ${LENGTH}., ${LENGTH}.) - ${LENGTH - 2.5};       // wraps from just behind the camera back into the haze
      vW = position * vS + vec3(aBox.x, aBox.w * .5, z); vL = position; vN = normal; vSeed = aSeed;
      gl_Position = projectionMatrix * viewMatrix * vec4(vW, 1.);
    }`, /* glsl */`
    varying vec3 vL, vS, vW, vN; varying float vSeed;
    void main() {
      vec3 d = (.5 - abs(vL)) * vS; float lo = min(d.x, min(d.y, d.z)), hi = max(d.x, max(d.y, d.z)), mid = d.x + d.y + d.z - lo - hi;
      float w = fwidth(mid), edge = 1. - smoothstep(w * .7, w * 2. + .035, mid);
      float fog = exp(-length(vW - cameraPosition) * .034);
      vec3 tint = vSeed > .84 ? MAGENTA : vSeed > .76 ? AMBER : CYAN;
      float wall = 1. - abs(vN.y), u = abs(vN.x) > .5 ? vL.z * vS.z : vL.x * vS.x, y = (vL.y + .5) * vS.y;
      vec2 q = vec2(u * 2.4 + 40., y * 1.5), f = fract(q); float far = 1. - smoothstep(.2, .5, fwidth(q.y));
      float lit = step(.8, hash2(floor(q) + vSeed * 91.)) * step(.22, f.x) * step(f.x, .78) * step(.3, f.y) * step(f.y, .72);
      vec3 c = tint * edge * 1.15 + wall * far * (mix(AMBER, tint, step(.5, hash(vSeed * 7.))) * lit * .55 + tint * step(.94, f.y) * .1) + tint * .02;
      gl_FragColor = vec4(c * fog, 1.);
    }`, uniforms));
  city.frustumCulled = false; scene.add(city);

  const street = new T.PlaneGeometry(160, 100); street.rotateX(-Math.PI / 2); street.translate(0, 0, -49);
  scene.add(new T.Mesh(street, solid(`uniform float uPhase; varying vec3 vW; void main() { vW = position; gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.); }`, /* glsl */`
    uniform float uPhase; varying vec3 vW;
    void main() {
      vec2 c = vec2(vW.x, vW.z - uPhase * ${LENGTH}.) / ${CELL}. + vec2(.5, 0.), g = abs(fract(c - .5) - .5), w = fwidth(c);
      vec2 l2 = 1. - smoothstep(w * .7, w * 1.8 + .004, g); float l = max(l2.x, l2.y) * (1. - smoothstep(.25, .6, max(w.x, w.y)));
      float lane = smoothstep(.09, .05, abs(abs(vW.x) - .0)) * step(.5, fract(c.y * 2.));
      float fog = exp(-length(vW - cameraPosition) * .034);
      gl_FragColor = vec4((TEAL * l * .55 + AMBER * lane * .9 + CYAN * .012) * fog, 1.);
    }`, uniforms)));

  const haze = new T.Mesh(new T.PlaneGeometry(400, 90), mat(`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`, /* glsl */`
    varying vec2 vUv; void main() { float y = vUv.y; gl_FragColor = vec4(mix(MAGENTA, CYAN, smoothstep(0., .5, y)) * exp(-y * 4.5) * .3 * smoothstep(0., .1, vUv.x) * smoothstep(1., .9, vUv.x), 1.); }`, {}, {depthTest: true}));
  haze.position.set(0, 45, -95); scene.add(haze);

  return play(t => {
    const phase = (t / meta.duration) % 1, a = phase * Math.PI * 2;
    uniforms.uPhase.value = phase;
    camera.position.set(.7 * Math.sin(a), 3.4 + .5 * Math.sin(a * 2), 0);
    camera.rotation.set(.1, -.03 * Math.cos(a), -.06 * Math.cos(a));
  });
}
