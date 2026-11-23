import {glowStage, rand} from './_fx.js';
import {span, easeInOut} from '../../hud.js';

// A cube of data assembling itself: hundreds of instanced voxels tumble in from all sides and lock
// into a lattice layer by layer, a scan plane sweeps through it, then alternate layers twist a
// quarter turn like a puzzle re-sorting. "storage", "the dataset", "blocks", "building the system".
export const meta = {duration: 9};
const G = 8;

export function mount(el) {
  const {T, scene, camera, mat, solid, fit, dust, play} = glowStage(el, {fov: 34, glow: 1.05});
  const cells = [], seeds = [];
  for (let x = 0; x < G; x++) for (let y = 0; y < G; y++) for (let z = 0; z < G; z++) {
    const k = x * 64 + y * 8 + z; if (rand(k + .4) < .22) continue;
    cells.push(x - (G - 1) / 2, y - (G - 1) / 2, z - (G - 1) / 2); seeds.push(rand(k + 5));
  }
  const g = new T.InstancedBufferGeometry().copy(new T.BoxGeometry(1, 1, 1)); g.instanceCount = seeds.length;
  g.setAttribute('aCell', new T.InstancedBufferAttribute(new Float32Array(cells), 3));
  g.setAttribute('aSeed', new T.InstancedBufferAttribute(new Float32Array(seeds), 1));
  const uniforms = {uTwist: {value: 0}};
  const cube = new T.Mesh(g, solid(/* glsl */`
    attribute vec3 aCell; attribute float aSeed; uniform float uTwist; varying vec3 vL, vW; varying float vSeed, vLand, vY;
    void main() {
      float layer = aCell.y + ${((G - 1) / 2).toFixed(1)}, delay = .3 + aSeed * .8 + layer * .28, q = clamp((uTime - delay) / 1.1, 0., 1.), e = 1. - pow(1. - q, 4.);
      float turn = uTwist * PI * .5 * (mod(layer, 2.) < .5 ? 1. : -1.);
      vec3 home = aCell * (.58 + .035 * sin(uTime * 1.3) * step(1., q)); home.xz = rot(turn) * home.xz;
      vec3 from = normalize(aCell + hash3(vec3(aSeed * 31., 2., 5.)) * 2.) * (9. + 5. * aSeed);
      vec3 p = position * .44 * smoothstep(0., .35, q); p.xz = rot(turn + (1. - e) * 6. * (aSeed - .5)) * p.xz; p.xy = rot((1. - e) * 4.) * p.xy;
      vec3 local = mix(from, home, e) + p;
      vec4 w = modelMatrix * vec4(local, 1.);
      vL = position; vW = w.xyz; vSeed = aSeed; vY = local.y; vLand = exp(-max(0., uTime - delay - 1.1) * 3.5) * step(1., q);
      gl_Position = projectionMatrix * viewMatrix * w;
    }`, /* glsl */`
    varying vec3 vL, vW; varying float vSeed, vLand, vY;
    void main() {
      vec3 d = .5 - abs(vL); float lo = min(d.x, min(d.y, d.z)), hi = max(d.x, max(d.y, d.z)), mid = d.x + d.y + d.z - lo - hi;
      float w = fwidth(mid), edge = 1. - smoothstep(w * .6, w * 1.8 + .05, mid);
      vec3 tint = vSeed > .88 ? AMBER : vSeed > .7 ? MAGENTA : CYAN;
      float scan = exp(-abs(vY - (fract(uTime * .28 + .2) * 9. - 4.5)) * 3.5) * step(3.4, uTime);
      float live = step(.88, vSeed) * (.5 + .5 * sin(uTime * 5. + vSeed * 90.));
      gl_FragColor = vec4(tint * (edge * (.85 + scan * 1.2) + .035 + .3 * live + scan * .22) + WHITE * vLand * (edge + .25), 1.);
    }`, uniforms));
  cube.frustumCulled = false; scene.add(cube);

  const core = new T.Mesh(new T.PlaneGeometry(13, 13), mat(`varying vec2 vUv; void main() { vUv = uv * 2. - 1.; vec4 mv = modelViewMatrix * vec4(0., 0., 0., 1.); mv.xy += position.xy; gl_Position = projectionMatrix * mv; }`,
    `varying vec2 vUv; void main() { float r = length(vUv); gl_FragColor = vec4(mix(CYAN, MAGENTA, r * 1.4) * exp(-r * 4.) * .16 * smoothstep(1., .6, r) * smoothstep(.5, 3., uTime), 1.); }`));
  scene.add(core);

  dust({count: 220, box: [22, 22, 12], center: [0, 0, -4]});

  return play(t => {
    uniforms.uTwist.value = easeInOut(span(t, 5.4, 1.1)) + easeInOut(span(t, 7.2, 1.1));
    cube.rotation.set(.5, t * .32 + .5, 0);
    const d = fit(3.9) * (1.25 - .25 * easeInOut(span(t, 0, 3.6))); camera.position.set(Math.sin(.15 * Math.sin(t * .4)) * d, .4, d); camera.lookAt(0, 0, 0);
  });
}
