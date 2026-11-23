import {glowStage, rand} from './_fx.js';

// Columns of code falling through deep space: each column is one instanced strip whose glyphs
// (random 3x5 dot patterns) are drawn in the fragment shader, with a bright head and a fading tail.
// Near columns are large and fast, far ones small and dim, and the camera drifts sideways for parallax.
// Seamless loop. Backdrop for "data", "code", "the system underneath", hacking.
export const meta = {duration: 6, loop: true};
const COLUMNS = 150, ROWS = 34;

export function mount(el) {
  const {T, scene, camera, mat, play} = glowStage(el, {fov: 50, glow: 1});
  const g = new T.InstancedBufferGeometry().copy(new T.PlaneGeometry(1, 1)); g.instanceCount = COLUMNS;
  const cols = []; for (let i = 0; i < COLUMNS; i++) cols.push((rand(i + .2) - .5) * 44, -3 - Math.pow(rand(i + 300), 1.4) * 34, rand(i + 600), rand(i + 900));
  g.setAttribute('aCol', new T.InstancedBufferAttribute(new Float32Array(cols), 4));
  const uniforms = {uPhase: {value: 0}};
  const rain = new T.Mesh(g, mat(/* glsl */`
    attribute vec4 aCol; varying vec2 vUv; varying vec2 vSeed; varying float vFog;
    void main() { vUv = uv; vSeed = aCol.zw; vFog = exp(aCol.y * .055);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(aCol.x + position.x * .5, position.y * ${(ROWS * .5 * 1.25).toFixed(2)}, aCol.y, 1.); }`, /* glsl */`
    uniform float uPhase; varying vec2 vUv; varying vec2 vSeed; varying float vFog;
    void main() {
      float row = floor((1. - vUv.y) * ${ROWS}.); vec2 cell = vec2(vUv.x, fract((1. - vUv.y) * ${ROWS}.));
      float laps = 1. + floor(vSeed.x * 3.), head = fract(uPhase * laps + vSeed.y) * 1.5;         // the head runs off the bottom before it wraps
      float behind = head - (row + .5) / ${ROWS}., trail = step(0., behind) * exp(-behind * (5. + 6. * vSeed.x)), lead = step(0., behind) * step(behind, 1.2 / ${ROWS}.);
      float tick = mod(floor(uPhase * 24. + row * .37 + vSeed.y * 9.), 24.);                          // glyphs re-roll now and then, in step with the loop
      vec2 dot_ = floor(cell * vec2(3., 5.) * vec2(1.25, 1.2) - vec2(.35, .5));
      float inside = step(0., dot_.x) * step(dot_.x, 2.) * step(0., dot_.y) * step(dot_.y, 4.);
      float bit = step(.45, hash2(dot_ + vec2(row * 7.3 + tick * 3.1, vSeed.x * 91.))) * inside;
      vec2 sub = fract(cell * vec2(3., 5.) * vec2(1.25, 1.2) - vec2(.35, .5)) - .5; bit *= smoothstep(.48, .3, max(abs(sub.x), abs(sub.y)));
      vec3 tint = vSeed.y > .86 ? MAGENTA : vSeed.y > .8 ? AMBER : CYAN;
      gl_FragColor = vec4((tint * trail * .9 + WHITE * lead * 1.4) * bit * vFog, 1.);
    }`, uniforms, {side: T.DoubleSide}));
  rain.frustumCulled = false; scene.add(rain);

  return play(t => {
    const phase = (t / meta.duration) % 1, a = phase * Math.PI * 2;
    uniforms.uPhase.value = phase;
    camera.position.set(1.6 * Math.sin(a), .5 * Math.sin(a * 2), 6); camera.rotation.set(0, .05 * Math.sin(a), .03 * Math.cos(a));
  });
}
