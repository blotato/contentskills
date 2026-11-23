import {glowStage, rand} from './_fx.js';

// Hyperspace: thousands of light streaks and hexagonal gates rushing past the camera.
// Each streak is an instanced ribbon stretched in the vertex shader between two points on its path,
// so it has real perspective width (and nothing ever sits behind the camera). Seamless loop.
// Backdrop for "speed", "acceleration", "the jump", scene changes.
export const meta = {duration: 4, loop: true};
const STARS = 2400, GATES = 12;

export function mount(el) {
  const {T, scene, camera, mat, aspect, play} = glowStage(el, {fov: 72, glow: 1.1, fringe: .09});
  camera.position.set(0, 0, 0);
  const uniforms = {uPhase: {value: 0}, uAspect: {value: 1}};
  const stars = new T.InstancedBufferGeometry().copy(new T.PlaneGeometry(1, 1)); stars.instanceCount = STARS;
  const data = []; for (let i = 0; i < STARS; i++) data.push(rand(i) * 6.2832, 1.4 + Math.pow(rand(i + 3000), .7) * 15, rand(i + 6000), rand(i + 9000));
  stars.setAttribute('aStar', new T.InstancedBufferAttribute(new Float32Array(data), 4));
  const streaks = new T.Mesh(stars, mat(/* glsl */`
    attribute vec4 aStar; uniform float uPhase, uAspect; varying vec2 vUv; varying vec3 vCol; varying float vA;
    void main() {
      float laps = 1. + floor(aStar.w * 3.), z = fract(aStar.z + uPhase * laps);           // 0 far away, 1 at the camera
      float depth = mix(-110., -1.2, z * z), len = (1.5 + 16. * z * z) * (.5 + aStar.w) * laps * .6;
      vec3 head = vec3(cos(aStar.x), sin(aStar.x), 0.) * aStar.y + vec3(0., 0., depth);
      vec4 h = viewMatrix * vec4(head, 1.), tl = viewMatrix * vec4(head - vec3(0., 0., len), 1.);
      vec4 hc = projectionMatrix * h, tc = projectionMatrix * tl;
      vec2 dir = normalize((hc.xy / hc.w - tc.xy / tc.w) * vec2(uAspect, 1.) + 1e-5), n = vec2(-dir.y, dir.x) / vec2(uAspect, 1.);
      vec4 c = mix(tc, hc, uv.y);
      c.xy += n * position.x * (.035 + .05 * aStar.w) * projectionMatrix[1][1];
      vUv = uv; vA = smoothstep(0., .2, z) * (1. - smoothstep(.94, 1., z)) * (.45 + .55 * aStar.w);
      float pick = hash(aStar.w * 77.);
      vCol = pick > .82 ? MAGENTA : pick > .74 ? AMBER : mix(CYAN, WHITE, hash(aStar.z * 31.) * .7);
      gl_Position = c;
    }`, /* glsl */`
    varying vec2 vUv; varying vec3 vCol; varying float vA;
    void main() { float across = 1. - abs(vUv.x - .5) * 2.; gl_FragColor = vec4(vCol * across * across * pow(vUv.y, 1.8) * vA * 1.5 + WHITE * smoothstep(.93, 1., vUv.y) * across * vA, 1.); }`, uniforms, {side: T.DoubleSide}));
  streaks.frustumCulled = false; scene.add(streaks);

  const hexes = new T.InstancedBufferGeometry().copy(new T.RingGeometry(1, 1.035, 6, 1)); hexes.instanceCount = GATES;
  hexes.setAttribute('aGate', new T.InstancedBufferAttribute(new Float32Array(Array.from({length: GATES}, (_, i) => i)), 1));
  const gates = new T.Mesh(hexes, mat(/* glsl */`
    attribute float aGate; uniform float uPhase; varying float vA; varying vec3 vCol;
    void main() {
      float z = fract(aGate / ${GATES}. + uPhase), depth = mix(-110., -1.2, z * z);
      vec3 p = vec3(rot(aGate * .26 + z * 1.2) * position.xy * 5.2, depth);
      vA = smoothstep(0., .25, z) * (1. - smoothstep(.9, 1., z)); vCol = mod(aGate, 3.) < .5 ? MAGENTA : CYAN;
      gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.);
    }`, `varying float vA; varying vec3 vCol; void main() { gl_FragColor = vec4(vCol * vA * .9, 1.); }`, uniforms, {side: T.DoubleSide}));
  gates.frustumCulled = false; scene.add(gates);

  const core = new T.Mesh(new T.PlaneGeometry(90, 90), mat(`varying vec2 vUv; void main() { vUv = uv * 2. - 1.; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`, /* glsl */`
    uniform float uPhase; varying vec2 vUv;
    void main() { float r = length(vUv), a = atan(vUv.y, vUv.x); float rays = .6 + .4 * sin(a * 14. + sin(uPhase * TAU) * 2.) * sin(a * 9. - uPhase * TAU);
      gl_FragColor = vec4(mix(CYAN, WHITE, exp(-r * 30.)) * (exp(-r * 22.) * 1.6 + exp(-r * 5.) * .22 * rays), 1.); }`, uniforms));
  core.position.z = -112; scene.add(core);

  return play(t => {
    const phase = (t / meta.duration) % 1;
    uniforms.uPhase.value = phase; uniforms.uAspect.value = aspect();
    camera.rotation.set(.03 * Math.sin(phase * Math.PI * 4), .04 * Math.cos(phase * Math.PI * 2), .18 * Math.sin(phase * Math.PI * 2));
  });
}
