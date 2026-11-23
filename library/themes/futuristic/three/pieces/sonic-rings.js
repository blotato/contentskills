import {glowStage} from './_fx.js';

// Sound made visible: concentric rings whose height is a spectrum, with beats rolling outward from
// a pulsing core like ripples on a pond. All motion is displacement in the vertex shader.
// Seamless loop. "audio", "voice", "signal", "the frequency", music beds.
export const meta = {duration: 6, loop: true};
const RINGS = 46, SEGMENTS = 240;

export function mount(el) {
  const {T, scene, camera, mat, geo, aspect, fitBox, dust, play} = glowStage(el, {fov: 36, glow: 1.1});
  const uniforms = {uPhase: {value: 0}};
  const ra = [];
  for (let r = 0; r < RINGS; r++) for (let s = 0; s < SEGMENTS; s++) ra.push(r / (RINGS - 1), s / SEGMENTS * 6.283185, r / (RINGS - 1), (s + 1) / SEGMENTS * 6.283185);
  const vertex = /* glsl */`
    attribute vec2 aRing; uniform float uPhase; varying vec3 vCol; varying float vA;
    void main() {
      float rn = aRing.x, a = aRing.y, tt = uPhase * TAU, r = .75 + rn * 4.4;
      float beat = pow(.5 + .5 * sin(tt * 4. - rn * 7.5), 3.);                   // four beats per loop, travelling outward
      float spec = sin(a * 3. + tt) * .5 + sin(a * 7. - tt * 2. + rn * 5.) * .32 + sin(a * 13. + tt * 3. - rn * 3.) * .2 + sin(a * 31. - tt * 5. + rn * 11.) * .13;
      float h = spec * (.2 + beat) * (1.35 - rn * .8);
      vec4 mv = modelViewMatrix * vec4(cos(a) * r, h * 1.15, sin(a) * r, 1.);
      float peak = smoothstep(.08, .55, abs(h));
      vCol = mix(mix(TEAL, CYAN, beat), MAGENTA, peak) + WHITE * peak * beat * .5;
      vA = (.2 + .45 * beat + .4 * peak) * (.55 + rn * .45) * (1. - rn * .4);
      gl_PointSize = (.03 + .06 * peak) * uPx / -mv.z; gl_Position = projectionMatrix * mv;
    }`;
  const g = geo({position: [new Array(ra.length / 2 * 3).fill(0), 3], aRing: [ra, 2]});
  const lines = new T.LineSegments(g, mat(vertex, `varying vec3 vCol; varying float vA; void main() { gl_FragColor = vec4(vCol * vA, 1.); }`, uniforms));
  const dots = new T.Points(g, mat(vertex, `varying vec3 vCol; varying float vA; void main() { gl_FragColor = vec4(vCol * vA * .22 * sprite(gl_PointCoord), 1.); }`, uniforms));
  lines.frustumCulled = dots.frustumCulled = false; scene.add(lines, dots);

  const core = new T.Mesh(new T.PlaneGeometry(4, 4), mat(`varying vec2 vUv; void main() { vUv = uv * 2. - 1.; vec4 mv = modelViewMatrix * vec4(0., 0., 0., 1.); mv.xy += position.xy; gl_Position = projectionMatrix * mv; }`, /* glsl */`
    uniform float uPhase; varying vec2 vUv;
    void main() { float r = length(vUv), beat = pow(.5 + .5 * sin(uPhase * TAU * 4.), 3.);
      gl_FragColor = vec4(mix(AMBER, WHITE, exp(-r * 9.)) * (exp(-r * (12. - 5. * beat)) * 2. + exp(-r * 4.) * .25 * smoothstep(1., .5, r)), 1.); }`, uniforms));
  scene.add(core);

  dust({count: 200, box: [20, 10, 16], center: [0, 2, -2], loop: meta.duration});

  return play(t => {
    const phase = (t / meta.duration) % 1;
    uniforms.uPhase.value = phase;
    lines.rotation.y = dots.rotation.y = phase * Math.PI * 2 / 3;
    const tall = aspect() < .8, d = tall ? fitBox(5.7, 5.4) : fitBox(5.9, 3.7), tilt = (tall ? 1.02 : .52) + .06 * Math.sin(phase * Math.PI * 2);
    camera.position.set(0, Math.sin(tilt) * d, Math.cos(tilt) * d); camera.lookAt(0, -.2, 0);
  });
}
